package io.github.filon6.autoservice_backend.reports;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReportService {

  private final ReportRepository repository;

  public ReportService(ReportRepository repository) {
    this.repository = repository;
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
}
