package mk.ukim.finki.mojgrad.exception.messages;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class AuthExceptionMessages {

    public static final String TOKEN_EXPIRED = "Your session has expired. Please log in again.";
    public static final String INVALID_SIGNATURE = "Invalid authentication token.";
    public static final String INVALID_TOKEN ="Invalid authentication token.";
    public static final String UNSUPPORTED_TOKEN ="Unsupported authentication token.";

    public static final String INVALID_CREDENTIALS = "Invalid email or password.";
    public static final String ACCOUNT_DISABLED = "Your account has been disabled.";
    public static final String ACCOUNT_ALREADY_ENABLED = "User is already enabled.";
    public static final String AUTHENTICATION_ERROR = "Authentication error. Please log in again.";

    public static final String ACCESS_DENIED = "You do not have permission to perform this action.";

    public static final String EMAIL_TAKEN = "This email is already associated with an account.";
}
