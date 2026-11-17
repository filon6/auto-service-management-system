package io.github.filon6.autoservice_backend.works;

import io.github.filon6.autoservice_backend.works.dto.WorkRequest;
import io.github.filon6.autoservice_backend.works.dto.WorkResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/works")
public class WorkController {

  private final WorkService service;

  public WorkController(WorkService service) {
    this.service = service;
  }

  @GetMapping
  public List<WorkResponse> findAll() {
    return service.findAll();
  }

  @GetMapping("/{id}")
  public WorkResponse findById(@PathVariable int id) {
    return service.findById(id);
  }

  @PostMapping
  public ResponseEntity<WorkResponse> create(@Valid @RequestBody WorkRequest request) {

    WorkResponse created = service.create(request);

    return ResponseEntity.created(URI.create("/api/works/" + created.id())).body(created);
  }

  @PutMapping("/{id}")
  public WorkResponse update(@PathVariable int id, @Valid @RequestBody WorkRequest request) {

    return service.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable int id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
