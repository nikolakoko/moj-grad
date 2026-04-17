package mk.ukim.finki.mojgrad.constants;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class JWTConstants {

    public static final String SECRET_KEY = "";
    public static final Long EXPIRATION_TIME = 86400000L; // 1 day
    public static final String BEARER_TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
}
