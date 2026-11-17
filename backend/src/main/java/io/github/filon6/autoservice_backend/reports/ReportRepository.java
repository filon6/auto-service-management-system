package io.github.filon6.autoservice_backend.reports;

import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ReportRepository {

  private final JdbcTemplate jdbcTemplate;

  public ReportRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<Map<String, Object>> findExpensiveServices() {
    return jdbcTemplate.queryForList("SELECT * FROM expensive_services");
  }

  public List<Map<String, Object>> findMastersIncome() {
    return jdbcTemplate.queryForList("SELECT * FROM masters_income");
  }

  public List<Map<String, Object>> findCarsAverageCost() {
    jdbcTemplate.execute("CALL get_cars_avg_cost('cars_average_report'::refcursor)");

    return jdbcTemplate.queryForList("FETCH ALL FROM cars_average_report");
  }
}
