package io.github.filon6.autoservice_backend.reports;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

  private final ReportService service;

  public ReportController(ReportService service) {
    this.service = service;
  }

  @GetMapping("/expensive-services")
  public List<Map<String, Object>> getExpensiveServices() {
    return service.getExpensiveServices();
  }

  @GetMapping("/masters-income")
  public List<Map<String, Object>> getMastersIncome() {
    return service.getMastersIncome();
  }

  @GetMapping("/cars-average-cost")
  public List<Map<String, Object>> getCarsAverageCost() {
    return service.getCarsAverageCost();
  }
}
