package io.github.filon6.autoservice_backend.reports.export;

import io.github.filon6.autoservice_backend.reports.ReportRepository;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReportCsvService {

  private final ReportRepository repository;

  public ReportCsvService(ReportRepository repository) {
    this.repository = repository;
  }

  public byte[] exportExpensiveServices() {
    return toCsv(repository.findExpensiveServicesForExport());
  }

  public byte[] exportMastersIncome() {
    return toCsv(repository.findMastersIncomeForExport());
  }

  private byte[] toCsv(CsvTable table) {
    StringBuilder csv = new StringBuilder("\uFEFF");

    appendRow(csv, table.columns());

    for (List<Object> row : table.rows()) {
      appendRow(csv, row);
    }

    return csv.toString().getBytes(StandardCharsets.UTF_8);
  }

  private void appendRow(StringBuilder csv, List<?> values) {
    for (int i = 0; i < values.size(); i++) {
      if (i > 0) {
        csv.append(',');
      }

      Object value = values.get(i);
      String cell = formatCell(value);

      csv.append('"');
      csv.append(cell.replace("\"", "\"\""));
      csv.append('"');
    }

    csv.append("\r\n");
  }

  private String formatCell(Object value) {
    if (value == null) {
      return "";
    }

    if (value instanceof BigDecimal decimal) {
      return decimal.toPlainString();
    }

    String text = value.toString();

    if (value instanceof String && startsWithFormula(text)) {
      return "'" + text;
    }

    return text;
  }

  private boolean startsWithFormula(String value) {
    String trimmed = value.stripLeading();

    if (trimmed.isEmpty()) {
      return false;
    }

    char first = trimmed.charAt(0);

    return first == '=' || first == '+' || first == '-' || first == '@';
  }
}
