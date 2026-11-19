package io.github.filon6.autoservice_backend.common;

import java.sql.SQLException;

public final class PgSqlState {

  private PgSqlState() {}

  public static boolean matches(Throwable error, String state) {
    for (Throwable cause = error; cause != null; cause = cause.getCause()) {
      if (cause instanceof SQLException sqlException && state.equals(sqlException.getSQLState())) {
        return true;
      }
    }
    return false;
  }
}
