package io.github.filon6.autoservice_backend.reports.dto;

import java.math.BigDecimal;

public record ServiceCostReport(
    Integer serviceId, Integer carId, BigDecimal totalCost, Long worksCount) {}
