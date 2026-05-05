package mk.ukim.finki.mojgrad.exception.exceptions.auth;

public class AccountAlreadyEnabledException extends RuntimeException {
    public AccountAlreadyEnabledException(String message) {
        super(message);
    }
}
