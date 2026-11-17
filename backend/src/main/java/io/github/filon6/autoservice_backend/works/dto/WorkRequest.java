package io.github.filon6.autoservice_backend.works.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record WorkRequest(
    @NotNull LocalDate dateWork,
    @NotNull @Positive Integer masterId,
    @NotNull @Positive Integer carId,
    @NotNull @Positive Integer serviceId) {}
