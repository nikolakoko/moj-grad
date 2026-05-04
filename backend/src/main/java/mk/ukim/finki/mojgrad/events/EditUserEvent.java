package mk.ukim.finki.mojgrad.events;

public record EditUserEvent(
        String email,
        String token
) {
}
