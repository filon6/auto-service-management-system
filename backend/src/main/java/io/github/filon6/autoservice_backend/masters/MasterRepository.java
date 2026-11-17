package io.github.filon6.autoservice_backend.masters;

import io.github.filon6.autoservice_backend.masters.dto.MasterResponse;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class MasterRepository {

  private static final RowMapper<MasterResponse> ROW_MAPPER =
      (rs, rowNum) -> new MasterResponse(rs.getInt("id"), rs.getString("name"));

  private final JdbcTemplate jdbcTemplate;

  public MasterRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<MasterResponse> findAll() {
    return jdbcTemplate.query("SELECT id, name FROM masters ORDER BY id", ROW_MAPPER);
  }

  public Optional<MasterResponse> findById(int id) {
    return jdbcTemplate.query("SELECT id, name FROM masters WHERE id = ?", ROW_MAPPER, id).stream()
        .findFirst();
  }

  public int insert(String name) {
    return jdbcTemplate.queryForObject(
        "INSERT INTO masters (name) VALUES (?) RETURNING id", Integer.class, name);
  }

  public int update(int id, String name) {
    return jdbcTemplate.update("UPDATE masters SET name = ? WHERE id = ?", name, id);
  }

  public int delete(int id) {
    return jdbcTemplate.update("DELETE FROM masters WHERE id = ?", id);
  }

  public boolean hasWorks(int id) {
    return Boolean.TRUE.equals(
        jdbcTemplate.queryForObject(
            "SELECT EXISTS(SELECT 1 FROM works WHERE master_id = ?)", Boolean.class, id));
  }
}
