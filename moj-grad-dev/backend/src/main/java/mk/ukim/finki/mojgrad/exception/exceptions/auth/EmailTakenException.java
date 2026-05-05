package mk.ukim.finki.mojgrad.exception.exceptions.auth;

public class EmailTakenException extends RuntimeException {
    public EmailTakenException(String message) {
        super(message);
    }
}
