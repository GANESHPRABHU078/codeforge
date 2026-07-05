package com.codeforge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ── Allowed Origins ─────────────────────────────────────────────
        // Covers: all Vercel preview/prod deployments, local dev, any custom domain.
        // NOTE: allowedOriginPatterns is required when allowCredentials = true.
        configuration.setAllowedOriginPatterns(List.of(
            "https://*.vercel.app",      // all Vercel deployments
            "https://*.onrender.com",    // cross-service Render calls
            "http://localhost:*",         // local dev (any port)
            "http://127.0.0.1:*",        // local dev (IP)
            "*"                           // allow all — remove if you need strict security
        ));

        // ── Allowed Methods (include PATCH for favorite toggle) ──────────
        configuration.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"
        ));

        // ── Allowed Headers ──────────────────────────────────────────────
        configuration.setAllowedHeaders(List.of("*"));

        // ── Exposed Headers ──────────────────────────────────────────────
        configuration.setExposedHeaders(List.of(
            "Authorization", "Content-Disposition", "X-Total-Count"
        ));

        // Credentials (cookies / Authorization header)
        configuration.setAllowCredentials(true);

        // Cache preflight for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
