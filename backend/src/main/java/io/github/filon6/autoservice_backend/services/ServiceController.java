package io.github.filon6.autoservice_backend.services;

import io.github.filon6.autoservice_backend.services.dto.ServiceRequest;
import io.github.filon6.autoservice_backend.services.dto.ServiceResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

  private final ServiceService service;

  public ServiceController(ServiceService service) {
    this.service = service;
  }

  @GetMapping
  public List<ServiceResponse> findAll() {
    return service.findAll();
  }

  @GetMapping("/{id}")
  public ServiceResponse findById(@PathVariable int id) {
    return service.findById(id);
  }

  @PostMapping
  public ResponseEntity<ServiceResponse> create(@Valid @RequestBody ServiceRequest request) {

    ServiceResponse created = service.create(request);

    return ResponseEntity.created(URI.create("/api/services/" + created.id())).body(created);
  }

  @PutMapping("/{id}")
  public ServiceResponse update(@PathVariable int id, @Valid @RequestBody ServiceRequest request) {

    return service.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable int id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
