package mk.ukim.finki.mojgrad.events;

public record InviteUserEvent(
        String email,
        String token
) {
}
