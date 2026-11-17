package io.github.filon6.autoservice_backend.config;

import io.github.filon6.autoservice_backend.auth.AccountDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      AccountDetailsService accountDetailsService,
      PasswordEncoder passwordEncoder)
      throws Exception {

    DaoAuthenticationProvider provider = new DaoAuthenticationProvider(accountDetailsService);

    provider.setPasswordEncoder(passwordEncoder);

    http.authenticationProvider(provider)
        .authorizeHttpRequests(auth ->
            auth.requestMatchers("/api/auth/login", "/api/auth/csrf", "/actuator/health")
                .permitAll()
                .requestMatchers("/api/auth/me", "/api/auth/logout")
                .authenticated()
                .requestMatchers(HttpMethod.GET, "/api/**")
                .hasAnyRole("ADMIN", "USER")
                .requestMatchers("/api/**")
                .hasRole("ADMIN")
                .anyRequest()
                .denyAll())
        .exceptionHandling(ex ->
            ex.authenticationEntryPoint((request, response, exception) -> response.sendError(401)))
        .formLogin(form ->
            form.loginProcessingUrl("/api/auth/login")
                .successHandler((request, response, authentication) -> response.setStatus(204))
                .failureHandler((request, response, exception) -> response.sendError(401))
                .permitAll())
        .logout(logout ->
            logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler(
                    (request, response, authentication) -> response.setStatus(204)));

    return http.build();
  }
}
