package io.github.filon6.autoservice_backend.services.dto;

import java.math.BigDecimal;

public record ServiceResponse(
    Integer id, String name, BigDecimal costOur, BigDecimal costForeign) {}
