package io.github.filon6.autoservice_backend.reports;

import io.github.filon6.autoservice_backend.reports.dto.CommonServicesReport;
import io.github.filon6.autoservice_backend.reports.dto.ServiceCostReport;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

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

  @GetMapping("/service-cost")
  public ServiceCostReport getServiceCost(@RequestParam int serviceId, @RequestParam int carId) {

    return service.getServiceCost(serviceId, carId);
  }

  @GetMapping("/common-services")
  public CommonServicesReport getCommonServices(
      @RequestParam int master1, @RequestParam int master2) {

    return service.getCommonServices(master1, master2);
  }

  @GetMapping("/masters/{id}/info")
  public JsonNode getMasterInfo(@PathVariable int id) {
    return service.getMasterInfo(id);
  }
}
