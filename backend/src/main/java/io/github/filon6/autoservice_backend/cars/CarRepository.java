package io.github.filon6.autoservice_backend.cars;

import io.github.filon6.autoservice_backend.cars.dto.CarRequest;
import io.github.filon6.autoservice_backend.cars.dto.CarResponse;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class CarRepository {

  private static final RowMapper<CarResponse> ROW_MAPPER =
      (rs, rowNum) ->
          new CarResponse(
              rs.getInt("id"),
              rs.getString("num"),
              rs.getString("color"),
              rs.getString("mark"),
              rs.getBoolean("is_foreign"));

  private final JdbcTemplate jdbcTemplate;

  public CarRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<CarResponse> findAll() {
    return jdbcTemplate.query(
        "SELECT id, num, color, mark, is_foreign FROM cars ORDER BY id", ROW_MAPPER);
  }

  public Optional<CarResponse> findById(Integer id) {
    return jdbcTemplate
        .query("SELECT id, num, color, mark, is_foreign FROM cars WHERE id = ?", ROW_MAPPER, id)
        .stream()
        .findFirst();
  }

  public boolean existsByNumber(String num) {
    return Boolean.TRUE.equals(
        jdbcTemplate.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM cars WHERE UPPER(num) = UPPER(?))", Boolean.class, num));
  }

  public boolean existsByNumberExceptId(String num, Integer id) {
    return Boolean.TRUE.equals(
        jdbcTemplate.queryForObject(
            """
            SELECT EXISTS (
                SELECT 1 FROM cars
                WHERE UPPER(num) = UPPER(?)
                  AND id <> ?
            )
            """,
            Boolean.class,
            num,
            id));
  }

  public boolean hasWorks(Integer id) {
    return Boolean.TRUE.equals(
        jdbcTemplate.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM works WHERE car_id = ?)", Boolean.class, id));
  }

  public Integer insert(CarRequest request) {
    return Objects.requireNonNull(
        jdbcTemplate.queryForObject(
            """
            INSERT INTO cars (num, color, mark, is_foreign)
            VALUES (?, ?, ?, ?)
            RETURNING id
            """,
            Integer.class,
            request.num(),
            request.color(),
            request.mark(),
            request.isForeign()));
  }

  public void update(Integer id, CarRequest request) {
    jdbcTemplate.update(
        """
        UPDATE cars
        SET num = ?, color = ?, mark = ?, is_foreign = ?
        WHERE id = ?
        """,
        request.num(),
        request.color(),
        request.mark(),
        request.isForeign(),
        id);
  }

  public void delete(Integer id) {
    jdbcTemplate.update("DELETE FROM cars WHERE id = ?", id);
  }
}
