package io.github.filon6.autoservice_backend.auth;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.HexFormat;
import java.util.Locale;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LoginHashService {
  private final SecretKeySpec key;

  public LoginHashService(@Value("${app.auth.login-hash-key}") String secret) {
    if (secret.length() < 32) {
      throw new IllegalArgumentException("Login hash key must contain at least 32 characters");
    }

    this.key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
  }

  public String hash(String login) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(key);

      String normalized = login.trim().toLowerCase(Locale.ROOT);

      byte[] hash = mac.doFinal(normalized.getBytes(StandardCharsets.UTF_8));

      return HexFormat.of().formatHex(hash);
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException("Unable to hash login", e);
    }
  }
}
