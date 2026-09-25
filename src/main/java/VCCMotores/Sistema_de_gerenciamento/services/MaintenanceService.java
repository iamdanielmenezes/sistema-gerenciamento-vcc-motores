package VCCMotores.Sistema_de_gerenciamento.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import VCCMotores.Sistema_de_gerenciamento.entities.Maintenance;
import VCCMotores.Sistema_de_gerenciamento.repositories.MaintenanceRepository;
import VCCMotores.Sistema_de_gerenciamento.services.exceptions.ResourceNotFoundException;

@Service
public class MaintenanceService {

	@Autowired
	private MaintenanceRepository repository; 
	
	public List<Maintenance> findAll(){
		return repository.findAll();
	}
	
	public Maintenance findById(Long id) {
		Optional<Maintenance> obj = repository.findById(id);
		return obj.orElseThrow(() -> new ResourceNotFoundException(id));
	}
	
	public Maintenance insert(Maintenance obj) {
		return repository.save(obj);
	}
	
	public void delete(Long id) {
		if (!repository.existsById(id)) {
	        throw new ResourceNotFoundException(id);
		}
	    repository.deleteById(id);
	}
	
	public Maintenance update(Long id, Maintenance obj) {
		Maintenance entity = findById(id);
		
		entity.setDate(obj.getDate());
		entity.setDescription(obj.getDescription());

		return repository.save(entity);
	}
}
