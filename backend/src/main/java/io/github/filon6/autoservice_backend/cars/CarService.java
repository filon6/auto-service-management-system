package io.github.filon6.autoservice_backend.cars;

import io.github.filon6.autoservice_backend.cars.dto.CarRequest;
import io.github.filon6.autoservice_backend.cars.dto.CarResponse;
import java.sql.SQLException;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CarService {

  private final CarRepository repository;

  public CarService(CarRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public List<CarResponse> findAll() {
    return repository.findAll();
  }

  @Transactional(readOnly = true)
  public CarResponse findById(Integer id) {
    return repository
        .findById(id)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Автомобиль не найден"));
  }

  @Transactional
  public CarResponse create(CarRequest request) {
    CarRequest normalized = normalize(request);

    if (repository.existsByNumber(normalized.num())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Автомобиль с таким номером уже существует");
    }

    try {
      Integer id = repository.insert(normalized);
      return findById(id);
    } catch (DataAccessException exception) {
      if (isDatabaseConflict(exception)) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT, "Автомобиль с таким номером уже существует", exception);
      }
      throw exception;
    }
  }

  @Transactional
  public CarResponse update(Integer id, CarRequest request) {
    findById(id);

    CarRequest normalized = normalize(request);

    if (repository.existsByNumberExceptId(normalized.num(), id)) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Автомобиль с таким номером уже существует");
    }

    repository.update(id, normalized);
    return findById(id);
  }

  @Transactional
  public void delete(Integer id) {
    findById(id);

    if (repository.hasWorks(id)) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Нельзя удалить автомобиль с историей работ");
    }

    try {
      repository.delete(id);
    } catch (DataAccessException exception) {
      if (isDatabaseConflict(exception)) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT, "Нельзя удалить автомобиль с историей работ", exception);
      }
      throw exception;
    }
  }

  private CarRequest normalize(CarRequest request) {
    return new CarRequest(
        request.num().trim().toUpperCase(Locale.ROOT),
        request.color().trim(),
        request.mark().trim(),
        request.isForeign());
  }

  private boolean isDatabaseConflict(Throwable exception) {
    Throwable cause = exception;

    while (cause != null) {
      if (cause instanceof SQLException sqlException) {
        String state = sqlException.getSQLState();

        if ("P0001".equals(state) || "23505".equals(state)) {
          return true;
        }
      }

      cause = cause.getCause();
    }

    return false;
  }
}
