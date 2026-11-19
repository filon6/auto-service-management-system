package io.github.filon6.autoservice_backend.reports.export;

import java.util.List;

public record CsvTable(List<String> columns, List<List<Object>> rows) {}
