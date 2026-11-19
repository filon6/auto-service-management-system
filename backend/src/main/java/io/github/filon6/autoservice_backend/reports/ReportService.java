package io.github.filon6.autoservice_backend.reports;

import io.github.filon6.autoservice_backend.reports.dto.CommonServicesReport;
import io.github.filon6.autoservice_backend.reports.dto.RevenueByOriginReport;
import io.github.filon6.autoservice_backend.reports.dto.ServiceCostReport;
import io.github.filon6.autoservice_backend.reports.dto.TopMasterReport;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
@Transactional(readOnly = true)
public class ReportService {

  private final ReportRepository repository;
  private final JsonMapper jsonMapper;

  public ReportService(ReportRepository repository, JsonMapper jsonMapper) {
    this.repository = repository;
    this.jsonMapper = jsonMapper;
  }

  public List<Map<String, Object>> getExpensiveServices() {
    return repository.findExpensiveServices();
  }

  public List<Map<String, Object>> getMastersIncome() {
    return repository.findMastersIncome();
  }

  public List<Map<String, Object>> getCarsAverageCost() {
    return repository.findCarsAverageCost();
  }

  public ServiceCostReport getServiceCost(int serviceId, int carId) {

    requirePositive(serviceId);
    requirePositive(carId);

    if (!repository.existsService(serviceId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Услуга не найдена");
    }

    if (!repository.existsCar(carId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Автомобиль не найден");
    }

    return repository.findServiceCost(serviceId, carId);
  }

  public CommonServicesReport getCommonServices(int master1Id, int master2Id) {

    requirePositive(master1Id);
    requirePositive(master2Id);

    if (!repository.existsMaster(master1Id) || !repository.existsMaster(master2Id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Один из мастеров не найден");
    }

    return repository.findCommonServices(master1Id, master2Id);
  }

  public JsonNode getMasterInfo(int masterId) {
    requirePositive(masterId);

    if (!repository.existsMaster(masterId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Мастер не найден");
    }

    String json = repository.findMasterInfoJson(masterId);

    if (json == null) {
      throw new IllegalStateException("Функция get_master_info вернула SQL NULL");
    }

    return jsonMapper.readTree(json);
  }

  private void requirePositive(int id) {
    if (id <= 0) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Идентификатор должен быть положительным");
    }
  }

  public RevenueByOriginReport getRevenueByOrigin(LocalDate startDate, LocalDate endDate) {

    if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Дата начала позже даты окончания");
    }

    return repository.findRevenueByOrigin(startDate, endDate);
  }

  public List<TopMasterReport> getTopMasters(YearMonth month) {
    return repository.findTopMasters(month);
  }
}
