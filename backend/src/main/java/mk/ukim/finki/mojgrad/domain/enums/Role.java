package mk.ukim.finki.mojgrad.domain.enums;

public enum Role {
    ADMINISTRATION_WORKER,
    ADMIN;

    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}