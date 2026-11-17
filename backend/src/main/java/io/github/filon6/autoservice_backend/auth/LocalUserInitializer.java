package io.github.filon6.autoservice_backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class LocalUserInitializer implements ApplicationRunner {

  private final JdbcTemplate jdbcTemplate;
  private final LoginHashService loginHashService;
  private final PasswordEncoder passwordEncoder;
  private final String adminPassword;
  private final String userPassword;

  public LocalUserInitializer(
      JdbcTemplate jdbcTemplate,
      LoginHashService loginHashService,
      PasswordEncoder passwordEncoder,
      @Value("${app.auth.admin-password}") String adminPassword,
      @Value("${app.auth.user-password}") String userPassword) {
    this.jdbcTemplate = jdbcTemplate;
    this.loginHashService = loginHashService;
    this.passwordEncoder = passwordEncoder;
    this.adminPassword = adminPassword;
    this.userPassword = userPassword;
  }

  @Override
  public void run(ApplicationArguments args) {
    createUser("admin", adminPassword, "ADMIN");
    createUser("user", userPassword, "USER");
  }

  private void createUser(String login, String password, String role) {
    if (password.length() < 6) {
      throw new IllegalArgumentException("Password must contain at least 6 characters");
    }

    jdbcTemplate.update(
        """
        INSERT INTO app_users (login_hash, password_hash, role)
        VALUES (?, ?, ?)
        ON CONFLICT (login_hash) DO NOTHING
        """,
        loginHashService.hash(login),
        passwordEncoder.encode(password),
        role);
  }
}
