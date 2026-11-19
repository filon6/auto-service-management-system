package io.github.filon6.autoservice_backend.services;

import io.github.filon6.autoservice_backend.services.dto.ServiceRequest;
import io.github.filon6.autoservice_backend.services.dto.ServiceResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ServiceService {

  private final ServiceRepository repository;

  public ServiceService(ServiceRepository repository) {
    this.repository = repository;
  }

  public List<ServiceResponse> findAll() {
    return repository.findAll();
  }

  public ServiceResponse findById(int id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Услуга не найдена"));
  }

  @Transactional
  public ServiceResponse create(ServiceRequest request) {
    int id = repository.insert(request.name().trim(), request.costOur(), request.costForeign());

    return findById(id);
  }

  @Transactional
  public ServiceResponse update(int id, ServiceRequest request) {
    findById(id);

    if (repository.update(id, request.name().trim(), request.costOur(), request.costForeign())
        == 0) {

      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Услуга не найдена");
    }

    return findById(id);
  }

  @Transactional
  public void delete(int id) {
    findById(id);

    if (repository.hasWorks(id)) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Нельзя удалить услугу, которая используется в работах");
    }

    if (repository.delete(id) == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Услуга не найдена");
    }
  }
}
