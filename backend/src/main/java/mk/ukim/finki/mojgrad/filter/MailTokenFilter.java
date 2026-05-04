package mk.ukim.finki.mojgrad.filter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.constants.JWTConstants;
import mk.ukim.finki.mojgrad.exception.messages.AuthExceptionMessages;
import mk.ukim.finki.mojgrad.service.intf.JWTService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class MailTokenFilter extends OncePerRequestFilter {

    private final JWTService jwtService;
    private final HandlerExceptionResolver handlerExceptionResolver;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = request.getHeader(JWTConstants.MAIL_TOKEN_HEADER);
        String path = request.getRequestURI();

        if (path.contains("/register") || path.contains("/edit")) {
            try {
                if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                    filterChain.doFilter(request, response);
                    return;
                }

                if (token == null || token.isEmpty()) {
                    throw new IllegalArgumentException(AuthExceptionMessages.MISSING_MAIL_TOKEN);
                }

                if (jwtService.isTokenExpired(token)) {
                    throw new ExpiredJwtException(null, null, AuthExceptionMessages.TOKEN_EXPIRED);
                }

                String email = jwtService.extractClaim(token, claims -> claims.get("email", String.class));
                if (email == null || email.isBlank()) {
                    throw new MalformedJwtException(AuthExceptionMessages.UNSUPPORTED_TOKEN);
                }

            } catch (Exception ex) {
                handlerExceptionResolver.resolveException(request, response, null, ex);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
