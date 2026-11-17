package io.github.filon6.autoservice_backend.cars.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CarRequest(
    @NotBlank @Size(max = 10) String num,
    @NotBlank @Size(max = 20) String color,
    @NotBlank @Size(max = 20) String mark,
    @NotNull Boolean isForeign) {}
