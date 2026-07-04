package com.codeforge.controller;

import com.codeforge.dto.request.ChatRequest;
import com.codeforge.dto.response.ChatMessageDto;
import com.codeforge.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{id}/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatMessageDto> chat(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.ask(id, user.getUsername(), request.getMessage()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDto>> history(@PathVariable String id) {
        return ResponseEntity.ok(chatService.getHistory(id));
    }
}
