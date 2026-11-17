package io.github.filon6.autoservice_backend.masters.dto;

import jakarta.validation.constraints.NotBlank;

public record MasterRequest(@NotBlank String name) {}
