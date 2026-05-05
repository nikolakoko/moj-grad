package mk.ukim.finki.mojgrad.dto.response.user;

import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.domain.enums.Role;

public record UserDTO(
        Long id,
        String name,
        String email,
        Role role
) {
    public static UserDTO fromUser(User user) {
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
