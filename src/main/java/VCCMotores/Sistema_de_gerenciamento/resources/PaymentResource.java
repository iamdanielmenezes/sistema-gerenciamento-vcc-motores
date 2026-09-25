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

import VCCMotores.Sistema_de_gerenciamento.entities.Payment;
import VCCMotores.Sistema_de_gerenciamento.services.PaymentService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/payment")
public class PaymentResource {

	@Autowired
	private PaymentService paymentService;
	
	@GetMapping
	public ResponseEntity <List<Payment>> findAll() {
		List<Payment> list = paymentService.findAll();
		return ResponseEntity.ok(list); 
	}
	
	@GetMapping(value = "/{id}")
	public ResponseEntity<Payment> findById(@PathVariable Long id) {
		Payment obj = paymentService.findById(id);
		return ResponseEntity.ok(obj); 
	}
	
	@PostMapping
	public ResponseEntity<Payment> insert(@RequestBody @Valid Payment obj) {
		obj = paymentService.insert(obj);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(obj.getId())
				.toUri(); 
		  return ResponseEntity.created(uri).body(obj);
	}
	
	@DeleteMapping(value = "/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		paymentService.delete(id);
		return ResponseEntity.noContent().build(); 
	}
	
	@PutMapping(value = "/{id}")
	public ResponseEntity<Payment> update(@PathVariable Long id, @RequestBody @Valid Payment obj) {
		obj = paymentService.update(id, obj);
		return ResponseEntity.ok().body(obj); 
	}
}
