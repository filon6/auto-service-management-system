package io.github.filon6.autoservice_backend.services;

import io.github.filon6.autoservice_backend.services.dto.ServiceResponse;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ServiceRepository {

  private static final RowMapper<ServiceResponse> ROW_MAPPER =
      (rs, rowNum) ->
          new ServiceResponse(
              rs.getInt("id"),
              rs.getString("name"),
              rs.getBigDecimal("cost_our"),
              rs.getBigDecimal("cost_foreign"));

  private final JdbcTemplate jdbcTemplate;

  public ServiceRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<ServiceResponse> findAll() {
    return jdbcTemplate.query(
        """
        SELECT id, name, cost_our, cost_foreign
        FROM services
        ORDER BY id
        """,
        ROW_MAPPER);
  }

  public Optional<ServiceResponse> findById(int id) {
    return jdbcTemplate
        .query(
            """
            SELECT id, name, cost_our, cost_foreign
            FROM services
            WHERE id = ?
            """,
            ROW_MAPPER,
            id)
        .stream()
        .findFirst();
  }

  public int insert(String name, BigDecimal costOur, BigDecimal costForeign) {

    return jdbcTemplate.queryForObject(
        """
        INSERT INTO services (name, cost_our, cost_foreign)
        VALUES (?, ?, ?)
        RETURNING id
        """,
        Integer.class,
        name,
        costOur,
        costForeign);
  }

  public int update(int id, String name, BigDecimal costOur, BigDecimal costForeign) {

    return jdbcTemplate.update(
        """
        UPDATE services
        SET name = ?, cost_our = ?, cost_foreign = ?
        WHERE id = ?
        """,
        name,
        costOur,
        costForeign,
        id);
  }

  public int delete(int id) {
    return jdbcTemplate.update("DELETE FROM services WHERE id = ?", id);
  }

  public boolean hasWorks(int id) {
    return Boolean.TRUE.equals(
        jdbcTemplate.queryForObject(
            "SELECT EXISTS(SELECT 1 FROM works WHERE service_id = ?)", Boolean.class, id));
  }
}
