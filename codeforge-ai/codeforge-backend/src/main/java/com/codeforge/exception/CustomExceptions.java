package com.codeforge.exception;

public class CustomExceptions {

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) { super(message); }
    }

    public static class DuplicateResourceException extends RuntimeException {
        public DuplicateResourceException(String message) { super(message); }
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String message) { super(message); }
    }

    public static class LlmApiException extends RuntimeException {
        public LlmApiException(String message) { super(message); }
        public LlmApiException(String message, Throwable cause) { super(message, cause); }
    }

    public static class LlmOutputParseException extends RuntimeException {
        public LlmOutputParseException(String message) { super(message); }
    }
}
