package io.github.filon6.autoservice_backend.masters;

import io.github.filon6.autoservice_backend.common.PgSqlState;
import io.github.filon6.autoservice_backend.masters.dto.MasterRequest;
import io.github.filon6.autoservice_backend.masters.dto.MasterResponse;
import java.util.List;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class MasterService {

  private final MasterRepository repository;

  public MasterService(MasterRepository repository) {
    this.repository = repository;
  }

  public List<MasterResponse> findAll() {
    return repository.findAll();
  }

  public MasterResponse findById(int id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Мастер не найден"));
  }

  @Transactional
  public MasterResponse create(MasterRequest request) {
    try {
      int id = repository.insert(request.name().trim());
      return findById(id);
    } catch (DataAccessException ex) {
      if (PgSqlState.matches(ex, "23505")) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT, "Мастер с таким именем уже существует", ex);
      }

      if (PgSqlState.matches(ex, "P0001")) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Невозможно добавить мастера: достигнут лимит или нарушено ограничение БД",
            ex);
      }

      throw ex;
    }
  }

  @Transactional
  public MasterResponse update(int id, MasterRequest request) {
    findById(id);

    try {
      if (repository.update(id, request.name().trim()) == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Мастер не найден");
      }
    } catch (DataAccessException ex) {
      if (PgSqlState.matches(ex, "23505")) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT, "Мастер с таким именем уже существует", ex);
      }
      throw ex;
    }

    return findById(id);
  }

  @Transactional
  public void delete(int id) {
    findById(id);

    if (repository.hasWorks(id)) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Нельзя удалить мастера, у которого есть выполненные работы");
    }

    if (repository.delete(id) == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Мастер не найден");
    }
  }
}
