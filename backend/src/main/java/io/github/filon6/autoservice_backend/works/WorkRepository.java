package io.github.filon6.autoservice_backend.works;

import io.github.filon6.autoservice_backend.works.dto.WorkRequest;
import io.github.filon6.autoservice_backend.works.dto.WorkResponse;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class WorkRepository {

  private static final String SELECT_WORKS =
      """
      SELECT
          w.id,
          w.date_work,
          w.master_id,
          m.name AS master_name,
          w.car_id,
          c.num AS car_num,
          w.service_id,
          s.name AS service_name
      FROM works w
      JOIN masters m ON m.id = w.master_id
      JOIN cars c ON c.id = w.car_id
      JOIN services s ON s.id = w.service_id
      """;

  private static final RowMapper<WorkResponse> ROW_MAPPER =
      (rs, rowNum) ->
          new WorkResponse(
              rs.getInt("id"),
              rs.getDate("date_work").toLocalDate(),
              rs.getInt("master_id"),
              rs.getString("master_name"),
              rs.getInt("car_id"),
              rs.getString("car_num"),
              rs.getInt("service_id"),
              rs.getString("service_name"));

  private final JdbcTemplate jdbcTemplate;

  public WorkRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<WorkResponse> findAll() {
    return jdbcTemplate.query(SELECT_WORKS + " ORDER BY w.date_work DESC, w.id DESC", ROW_MAPPER);
  }

  public Optional<WorkResponse> findById(int id) {
    return jdbcTemplate.query(SELECT_WORKS + " WHERE w.id = ?", ROW_MAPPER, id).stream()
        .findFirst();
  }

  public int insert(WorkRequest request) {
    return jdbcTemplate.queryForObject(
        """
        INSERT INTO works (
            date_work, master_id, car_id, service_id
        )
        VALUES (?, ?, ?, ?)
        RETURNING id
        """,
        Integer.class,
        request.dateWork(),
        request.masterId(),
        request.carId(),
        request.serviceId());
  }

  public int update(int id, WorkRequest request) {
    return jdbcTemplate.update(
        """
        UPDATE works
        SET date_work = ?,
            master_id = ?,
            car_id = ?,
            service_id = ?
        WHERE id = ?
        """,
        request.dateWork(),
        request.masterId(),
        request.carId(),
        request.serviceId(),
        id);
  }

  public int delete(int id) {
    return jdbcTemplate.update("DELETE FROM works WHERE id = ?", id);
  }
}
