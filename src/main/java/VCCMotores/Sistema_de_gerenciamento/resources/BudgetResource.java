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

import VCCMotores.Sistema_de_gerenciamento.entities.Budget;
import VCCMotores.Sistema_de_gerenciamento.services.BudgetService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "budget")
public class BudgetResource {

	@Autowired
	private BudgetService budgetService;
	
	@GetMapping
	public ResponseEntity <List<Budget>> findAll() {
		List<Budget> list = budgetService.findAll();
		return ResponseEntity.ok(list); 
	}
	
	@GetMapping(value = "/{id}")
	public ResponseEntity<Budget> findById(@PathVariable Long id) {
		Budget obj = budgetService.findById(id);
		return ResponseEntity.ok(obj); 
	}
	
	@PostMapping
	public ResponseEntity<Budget> insert(@RequestBody @Valid Budget obj) {
		obj = budgetService.insert(obj);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(obj.getId())
				.toUri(); 
		  return ResponseEntity.created(uri).body(obj);
	}
	
	@DeleteMapping(value = "/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		budgetService.delete(id);
		return ResponseEntity.noContent().build(); 
	}
	
	@PutMapping(value = "/{id}")
	public ResponseEntity<Budget> update(@PathVariable Long id, @RequestBody @Valid Budget obj) {
		obj = budgetService.update(id, obj);
		return ResponseEntity.ok().body(obj); 
	}
}
