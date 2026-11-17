package io.github.filon6.autoservice_backend.auth;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AccountDetailsService implements UserDetailsService {

  private final JdbcTemplate jdbcTemplate;
  private final LoginHashService loginHashService;

  public AccountDetailsService(JdbcTemplate jdbcTemplate, LoginHashService loginHashService) {
    this.jdbcTemplate = jdbcTemplate;
    this.loginHashService = loginHashService;
  }

  @Override
  public UserDetails loadUserByUsername(String login) {
    String loginHash = loginHashService.hash(login);

    return jdbcTemplate
        .query(
            """
            SELECT password_hash, role
            FROM app_users
            WHERE login_hash = ?
              AND enabled = TRUE
            """,
            (rs, rowNum) ->
                User.withUsername(login)
                    .password(rs.getString("password_hash"))
                    .roles(rs.getString("role"))
                    .build(),
            loginHash)
        .stream()
        .findFirst()
        .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
  }
}
