package mk.ukim.finki.mojgrad.dto.response.auth;

import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.dto.response.user.UserDTO;

public record AuthResponseDTO(
        String token,
        UserDTO user
) {
    public static AuthResponseDTO fromUser(User user, String token) {
        return new AuthResponseDTO(
                token,
                UserDTO.fromUser(user)
        );
    }
}
