package io.github.filon6.autoservice_backend.reports.export;

import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportExportController {

  private final ReportCsvService service;

  public ReportExportController(ReportCsvService service) {
    this.service = service;
  }

  @GetMapping("/expensive-services/export")
  public ResponseEntity<byte[]> exportExpensiveServices() {
    return download(service.exportExpensiveServices(), "expensive-services.csv");
  }

  @GetMapping("/masters-income/export")
  public ResponseEntity<byte[]> exportMastersIncome() {
    return download(service.exportMastersIncome(), "masters-income.csv");
  }

  private ResponseEntity<byte[]> download(byte[] content, String fileName) {

    String disposition = ContentDisposition.attachment().filename(fileName).build().toString();

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
        .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
        .cacheControl(CacheControl.noStore())
        .body(content);
  }
}
