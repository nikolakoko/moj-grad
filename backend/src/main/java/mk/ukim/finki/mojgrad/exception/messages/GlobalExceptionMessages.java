package mk.ukim.finki.mojgrad.exception.messages;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class GlobalExceptionMessages {

    public static final String INVALID_ARGUMENT = "One or more provided arguments are invalid.";
    public static final String ILLEGAL_STATE = "The request cannot be processed in the current state.";

    public static final String BAD_REQUEST = "The request could not be understood or was missing required parameters.";
    public static final String CONFLICT = "The request could not be completed due to a conflict with the current state of the resource.";

    public static final String RESOURCE_GONE = "The requested resource has been removed or is no longer available.";

    public static final String RESOURCE_NOT_FOUND = "The requested resource could not be found.";
    public static final String USER_NOT_FOUND = "The requested user does not exist.";

    public static final String INTERNAL_SERVER_ERROR = "An unexpected error occurred. Please try again later.";
    public static final String RESOURCE_ACCESS_DENIED = "You don't have access to this resource.";

    public static final String WORKER_ALREADY_DISABLED = "Worker account is already disabled.";
    public static final String WORKER_ALREADY_ENABLED = "Worker account is already enabled.";
    public static final String ADMIN_CANNOT_BE_ARCHIVED = "An admin account cannot be archived or unarchived.";
}