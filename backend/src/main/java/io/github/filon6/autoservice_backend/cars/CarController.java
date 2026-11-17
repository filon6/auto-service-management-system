package io.github.filon6.autoservice_backend.cars;

import io.github.filon6.autoservice_backend.cars.dto.CarRequest;
import io.github.filon6.autoservice_backend.cars.dto.CarResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cars")
public class CarController {

  private final CarService service;

  public CarController(CarService service) {
    this.service = service;
  }

  @GetMapping
  public List<CarResponse> findAll() {
    return service.findAll();
  }

  @GetMapping("/{id}")
  public CarResponse findById(@PathVariable Integer id) {
    return service.findById(id);
  }

  @PostMapping
  public ResponseEntity<CarResponse> create(@Valid @RequestBody CarRequest request) {
    CarResponse response = service.create(request);

    return ResponseEntity.created(URI.create("/api/cars/" + response.id())).body(response);
  }

  @PutMapping("/{id}")
  public CarResponse update(@PathVariable Integer id, @Valid @RequestBody CarRequest request) {
    return service.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
