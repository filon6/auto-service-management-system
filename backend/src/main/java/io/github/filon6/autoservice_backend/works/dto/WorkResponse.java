package io.github.filon6.autoservice_backend.works.dto;

import java.time.LocalDate;

public record WorkResponse(
    Integer id,
    LocalDate dateWork,
    Integer masterId,
    String masterName,
    Integer carId,
    String carNum,
    Integer serviceId,
    String serviceName) {}
