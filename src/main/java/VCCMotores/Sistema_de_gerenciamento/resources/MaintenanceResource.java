package VCCMotores.Sistema_de_gerenciamento.resources;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import VCCMotores.Sistema_de_gerenciamento.entities.Maintenance;
import VCCMotores.Sistema_de_gerenciamento.services.MaintenanceService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/maintenance")
public class MaintenanceResource {
	
	@Autowired
	private MaintenanceService maintenance; 
	
	@GetMapping
	public ResponseEntity <List<Maintenance>> findAll() {
		List<Maintenance> list = maintenance.findAll();
		return ResponseEntity.ok(list);
	} 
 
	@GetMapping(value = "/{id}")
	public ResponseEntity<Maintenance> findById(@PathVariable Long id) {
		Maintenance obj = maintenance.findById(id);
		return ResponseEntity.ok(obj);
	}
	
	@PostMapping
	public ResponseEntity<Maintenance> insert(@RequestBody @Valid Maintenance obj) {
		obj = maintenance.insert(obj);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(obj.getId())
				.toUri(); 
		  return ResponseEntity.created(uri).body(obj);
	}
	
	@DeleteMapping(value = "/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		maintenance.delete(id);
		return ResponseEntity.noContent().build(); 
	}
	
	@PutMapping(value = "/{id}")
	public ResponseEntity<Maintenance> update(@PathVariable Long id, @RequestBody @Valid Maintenance obj) {
		obj = maintenance.update(id, obj);
		return ResponseEntity.ok().body(obj); 
	}
}
