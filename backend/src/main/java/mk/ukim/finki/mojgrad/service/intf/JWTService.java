package mk.ukim.finki.mojgrad.service.intf;

import io.jsonwebtoken.Claims;
import mk.ukim.finki.mojgrad.domain.entities.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;


public interface JWTService {
    String generateToken(User user);

    String extractUsername(String token);

    Claims extractAllClaims(String token);

    Key getSignInKey();

    <T> T extractClaim(String token, Function<Claims, T> claimsResolver);

    boolean isTokenValid(String token, UserDetails userDetails);

    boolean isTokenExpired(String token);

    Date extractExpiration(String token);
}
