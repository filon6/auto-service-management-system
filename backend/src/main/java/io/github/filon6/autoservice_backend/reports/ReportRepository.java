package io.github.filon6.autoservice_backend.reports;

import io.github.filon6.autoservice_backend.reports.dto.CommonServicesReport;
import io.github.filon6.autoservice_backend.reports.dto.RevenueByOriginReport;
import io.github.filon6.autoservice_backend.reports.dto.ServiceCostReport;
import io.github.filon6.autoservice_backend.reports.dto.TopMasterReport;
import io.github.filon6.autoservice_backend.reports.export.CsvTable;
import java.sql.Date;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCallback;
import org.springframework.jdbc.core.ResultSetExtractor;
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

  public boolean existsService(int id) {
    return Boolean.TRUE.equals(
        jdbcTemplate.queryForObject(
            "SELECT EXISTS(SELECT 1 FROM services WHERE id = ?)", Boolean.class, id));
  }

  public boolean existsCar(int id) {
    return Boolean.TRUE.equals(
        jdbcTemplate.queryForObject(
            "SELECT EXISTS(SELECT 1 FROM cars WHERE id = ?)", Boolean.class, id));
  }

  public boolean existsMaster(int id) {
    return Boolean.TRUE.equals(
        jdbcTemplate.queryForObject(
            "SELECT EXISTS(SELECT 1 FROM masters WHERE id = ?)", Boolean.class, id));
  }

  public ServiceCostReport findServiceCost(int serviceId, int carId) {

    return jdbcTemplate.queryForObject(
        "CALL get_service_cost(?, ?, NULL, NULL)",
        (rs, rowNum) -> new ServiceCostReport(serviceId, carId, rs.getBigDecimal(1), rs.getLong(2)),
        serviceId,
        carId);
  }

  public CommonServicesReport findCommonServices(int master1Id, int master2Id) {

    return jdbcTemplate.queryForObject(
        "CALL common_services(?, ?, NULL)",
        (rs, rowNum) -> new CommonServicesReport(master1Id, master2Id, rs.getLong(1)),
        master1Id,
        master2Id);
  }

  public String findMasterInfoJson(int masterId) {
    return jdbcTemplate.queryForObject("SELECT get_master_info(?)::text", String.class, masterId);
  }

  public CsvTable findExpensiveServicesForExport() {
    return loadCsvTable("SELECT * FROM expensive_services");
  }

  public CsvTable findMastersIncomeForExport() {
    return loadCsvTable("SELECT * FROM masters_income");
  }

  private CsvTable loadCsvTable(String sql) {
    return jdbcTemplate.query(
        sql,
        (ResultSetExtractor<CsvTable>)
            rs -> {
              var metadata = rs.getMetaData();
              int columnCount = metadata.getColumnCount();

              List<String> columns = new ArrayList<>();

              for (int i = 1; i <= columnCount; i++) {
                columns.add(metadata.getColumnLabel(i));
              }

              List<List<Object>> rows = new ArrayList<>();

              while (rs.next()) {
                List<Object> row = new ArrayList<>();

                for (int i = 1; i <= columnCount; i++) {
                  row.add(rs.getObject(i));
                }

                rows.add(row);
              }

              return new CsvTable(columns, rows);
            });
  }

  public RevenueByOriginReport findRevenueByOrigin(LocalDate startDate, LocalDate endDate) {

    return jdbcTemplate.queryForObject(
        "CALL get_revenue_by_origin(?::date, ?::date, NULL, NULL)",
        (rs, rowNum) -> new RevenueByOriginReport(rs.getBigDecimal(1), rs.getBigDecimal(2)),
        startDate == null ? null : Date.valueOf(startDate),
        endDate == null ? null : Date.valueOf(endDate));
  }

  public List<TopMasterReport> findTopMasters(YearMonth month) {
    jdbcTemplate.execute(
        "CALL get_top_masters_by_month(?::date, 'top_masters_report'::refcursor)",
        (PreparedStatementCallback<Void>)
            statement -> {
              statement.setDate(1, Date.valueOf(month.atDay(1)));
              statement.execute();
              return null;
            });

    return jdbcTemplate.query(
        "FETCH ALL FROM top_masters_report",
        (rs, rowNum) ->
            new TopMasterReport(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getLong("works_count"),
                rs.getLong("distinct_cars_count")));
  }
}
