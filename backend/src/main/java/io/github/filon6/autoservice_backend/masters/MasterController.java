package io.github.filon6.autoservice_backend.masters;

import io.github.filon6.autoservice_backend.masters.dto.MasterRequest;
import io.github.filon6.autoservice_backend.masters.dto.MasterResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters")
public class MasterController {

  private final MasterService service;

  public MasterController(MasterService service) {
    this.service = service;
  }

  @GetMapping
  public List<MasterResponse> findAll() {
    return service.findAll();
  }

  @GetMapping("/{id}")
  public MasterResponse findById(@PathVariable int id) {
    return service.findById(id);
  }

  @PostMapping
  public ResponseEntity<MasterResponse> create(@Valid @RequestBody MasterRequest request) {

    MasterResponse created = service.create(request);

    return ResponseEntity.created(URI.create("/api/masters/" + created.id())).body(created);
  }

  @PutMapping("/{id}")
  public MasterResponse update(@PathVariable int id, @Valid @RequestBody MasterRequest request) {

    return service.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable int id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
