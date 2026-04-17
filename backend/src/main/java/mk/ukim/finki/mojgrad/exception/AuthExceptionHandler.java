package mk.ukim.finki.mojgrad.exception;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import mk.ukim.finki.mojgrad.exception.exceptions.auth.*;
import mk.ukim.finki.mojgrad.exception.messages.AuthExceptionMessages;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<String> handleExpiredJwt() {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthExceptionMessages.TOKEN_EXPIRED);
    }

    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<String> handleSignature() {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthExceptionMessages.INVALID_SIGNATURE);
    }

    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<String> handleMalformedJwt() {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthExceptionMessages.INVALID_TOKEN);
    }

    @ExceptionHandler(UnsupportedJwtException.class)
    public ResponseEntity<String> handleUnsupportedJwt() {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthExceptionMessages.UNSUPPORTED_TOKEN);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<String> handleJwt() {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthExceptionMessages.AUTHENTICATION_ERROR);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentials() {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthExceptionMessages.INVALID_CREDENTIALS);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<String> handleUsernameNotFound() {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthExceptionMessages.INVALID_CREDENTIALS);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<String> handleDisabled() {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(AuthExceptionMessages.ACCOUNT_DISABLED);
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<String> handleAuthorizationDenied() {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(AuthExceptionMessages.ACCESS_DENIED);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<String> handleAuthentication() {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthExceptionMessages.AUTHENTICATION_ERROR);
    }

    @ExceptionHandler(AccountAlreadyEnabledException.class)
    public ResponseEntity<String> handleAccountAlreadyEnabled(AccountAlreadyEnabledException ex) {

        String message = ex.getMessage() != null
                ? ex.getMessage()
                : AuthExceptionMessages.ACCOUNT_ALREADY_ENABLED;

        return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
    }

    @ExceptionHandler(EmailTakenException.class)
    public ResponseEntity<String> handleEmailTaken(EmailTakenException ex) {

        String message = ex.getMessage() != null
                ? ex.getMessage()
                : AuthExceptionMessages.EMAIL_TAKEN;

        return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
    }
}