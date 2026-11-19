package io.github.filon6.autoservice_backend.works;

import io.github.filon6.autoservice_backend.common.PgSqlState;
import io.github.filon6.autoservice_backend.works.dto.WorkRequest;
import io.github.filon6.autoservice_backend.works.dto.WorkResponse;
import java.util.List;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class WorkService {

  private final WorkRepository repository;

  public WorkService(WorkRepository repository) {
    this.repository = repository;
  }

  public List<WorkResponse> findAll() {
    return repository.findAll();
  }

  public WorkResponse findById(int id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Работа не найдена"));
  }

  @Transactional
  public WorkResponse create(WorkRequest request) {
    try {
      int id = repository.insert(request);
      return findById(id);
    } catch (DataAccessException ex) {
      throw translateDatabaseException(ex);
    }
  }

  @Transactional
  public WorkResponse update(int id, WorkRequest request) {
    findById(id);

    try {
      if (repository.update(id, request) == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Работа не найдена");
      }

      return findById(id);
    } catch (DataAccessException ex) {
      throw translateDatabaseException(ex);
    }
  }

  @Transactional
  public void delete(int id) {
    findById(id);

    if (repository.delete(id) == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Работа не найдена");
    }
  }

  private RuntimeException translateDatabaseException(DataAccessException ex) {

    if (PgSqlState.matches(ex, "23503")) {
      return new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Указанный мастер, автомобиль или услуга не существует", ex);
    }

    if (PgSqlState.matches(ex, "P0001")) {
      return new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Нарушено ограничение базы данных: " + "проверьте дату и количество работ мастера",
          ex);
    }

    return ex;
  }
}
