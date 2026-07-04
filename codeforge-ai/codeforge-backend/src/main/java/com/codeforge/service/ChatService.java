package com.codeforge.service;

import com.codeforge.dto.response.ChatMessageDto;
import com.codeforge.entity.ChatSession;
import com.codeforge.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/** RAG-grounded chat scoped to a single project's generated code. */
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final RagService ragService;
    private final PromptEngineeringService promptEngineeringService;
    private final LlmProviderRouter llmProviderRouter;

    public ChatMessageDto ask(String projectId, String userId, String message) {
        ChatSession session = chatSessionRepository.findByProjectId(projectId)
                .orElseGet(() -> ChatSession.builder()
                        .projectId(projectId)
                        .userId(userId)
                        .build());

        List<String> ragContext = ragService.retrieveContext(message, userId, 4);
        String historyText = session.getMessages().stream()
                .map(m -> m.getRole() + ": " + m.getText())
                .collect(Collectors.joining("\n"));

        String prompt = promptEngineeringService.buildChatPrompt(ragContext, historyText, message);
        String answer = llmProviderRouter.getActiveClient().generate(prompt);

        session.getMessages().add(ChatSession.ChatMessage.builder()
                .role("user").text(message).timestamp(Instant.now()).build());
        session.getMessages().add(ChatSession.ChatMessage.builder()
                .role("assistant").text(answer).timestamp(Instant.now()).build());

        chatSessionRepository.save(session);

        return ChatMessageDto.builder().role("assistant").text(answer).timestamp(Instant.now()).build();
    }

    public List<ChatMessageDto> getHistory(String projectId) {
        return chatSessionRepository.findByProjectId(projectId)
                .map(s -> s.getMessages().stream()
                        .map(m -> ChatMessageDto.builder()
                                .role(m.getRole()).text(m.getText()).timestamp(m.getTimestamp()).build())
                        .toList())
                .orElse(List.of());
    }
}
