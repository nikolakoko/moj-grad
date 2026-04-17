package mk.ukim.finki.mojgrad.constants;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ApiConstants {

    public static final String API_BASE = "/api";
    public static final String COMPLAINTS = API_BASE + "/complaints";
    public static final String DEPARTMENTS = API_BASE + "/departments";
    public static final String ADMIN = API_BASE + "/admin";
    public static final String ADMINISTRATION_WORKER = API_BASE + "/administration-worker";
    public static final String AUTH = API_BASE + "/auth";
}
