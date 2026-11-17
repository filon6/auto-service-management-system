package io.github.filon6.autoservice_backend.services.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ServiceRequest(
    @NotBlank String name,
    @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal costOur,
    @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal costForeign) {}
