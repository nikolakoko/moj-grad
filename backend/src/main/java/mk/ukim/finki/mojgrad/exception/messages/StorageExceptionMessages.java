package mk.ukim.finki.mojgrad.exception.messages;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class StorageExceptionMessages {

    public static final String IMAGE_EMPTY = "File is empty.";
    public static final String IMAGE_TOO_LARGE = "File size exceeds maximum allowed size.";
    public static final String IMAGE_UNSUPPORTED_TYPE = "Invalid file type. Allowed types are JPEG, JPG, PNG, WEBP.";
    public static final String IMAGE_INVALID = "File is not a valid image.";

    public static final String UPLOAD_FAILED = "Failed to upload file to storage service. Please try again later.";
    public static final String DELETE_FAILED = "Failed to delete file from storage service. Please try again later.";
}
