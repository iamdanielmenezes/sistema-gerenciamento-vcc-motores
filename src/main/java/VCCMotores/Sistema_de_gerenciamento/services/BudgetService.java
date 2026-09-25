package VCCMotores.Sistema_de_gerenciamento.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import VCCMotores.Sistema_de_gerenciamento.entities.Budget;
import VCCMotores.Sistema_de_gerenciamento.repositories.BudgetRepository;
import VCCMotores.Sistema_de_gerenciamento.services.exceptions.ResourceNotFoundException;

@Service
public class BudgetService {

	@Autowired
	private BudgetRepository repository;
	
	public List<Budget> findAll(){
		return repository.findAll();
	}
	
	public Budget findById(Long id) {
		Optional<Budget> obj = repository.findById(id);
		return obj.orElseThrow(() -> new ResourceNotFoundException(id));
	}
	
	public Budget insert(Budget obj) {
		return repository.save(obj);
	}
	
	public void delete(Long id) {
		if (!repository.existsById(id)) {
	        throw new ResourceNotFoundException(id);
		}
	    repository.deleteById(id);
	}
	
	public Budget update(Long id, Budget obj) {
		Budget entity = findById(id);
		
		entity.setPrice(obj.getPrice());
		entity.setStatus(obj.getStatus());

		return repository.save(entity);
	}
}
