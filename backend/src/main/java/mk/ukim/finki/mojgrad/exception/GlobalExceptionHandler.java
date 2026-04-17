package mk.ukim.finki.mojgrad.exception;

import mk.ukim.finki.mojgrad.exception.exceptions.global.*;
import mk.ukim.finki.mojgrad.exception.messages.GlobalExceptionMessages;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {

        String message = ex.getMessage() != null
                ? ex.getMessage()
                : GlobalExceptionMessages.INVALID_ARGUMENT;

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(IllegalStateException ex) {

        String message = ex.getMessage() != null
                ? ex.getMessage()
                : GlobalExceptionMessages.ILLEGAL_STATE;

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    @ExceptionHandler(ResourceGoneException.class)
    public ResponseEntity<String> handleResourceGone(ResourceGoneException ex) {

        String message = ex.getMessage() != null
                ? ex.getMessage()
                : GlobalExceptionMessages.RESOURCE_GONE;

        return ResponseEntity.status(HttpStatus.GONE).body(message);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleResourceNotFound(ResourceNotFoundException ex) {

        String message = ex.getMessage() != null
                ? ex.getMessage()
                : GlobalExceptionMessages.RESOURCE_NOT_FOUND;

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<String> handleConflict(ConflictException ex) {

        String message = ex.getMessage() != null
                ? ex.getMessage()
                : GlobalExceptionMessages.CONFLICT;

        return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<String> handleBadRequest(BadRequestException ex) {

        String message = ex.getMessage() != null
                ? ex.getMessage()
                : GlobalExceptionMessages.BAD_REQUEST;

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<String> handleStorage(StorageException ex) {

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGlobal() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(GlobalExceptionMessages.INTERNAL_SERVER_ERROR);
    }
}