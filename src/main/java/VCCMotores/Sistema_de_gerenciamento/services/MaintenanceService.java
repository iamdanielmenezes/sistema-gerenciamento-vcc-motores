package VCCMotores.Sistema_de_gerenciamento.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import VCCMotores.Sistema_de_gerenciamento.entities.Maintenance;
import VCCMotores.Sistema_de_gerenciamento.entities.enums.MaintenanceStatus;
import VCCMotores.Sistema_de_gerenciamento.repositories.ClientRepository;
import VCCMotores.Sistema_de_gerenciamento.repositories.MaintenanceRepository;
import VCCMotores.Sistema_de_gerenciamento.services.exceptions.BusinessException;
import VCCMotores.Sistema_de_gerenciamento.services.exceptions.ResourceNotFoundException;

@Service
public class MaintenanceService {

	@Autowired
	private MaintenanceRepository repository; 
	
	@Autowired
	private ClientRepository clientRepository;
	
	public List<Maintenance> findAll(){
		return repository.findAll();
	}
	
	public Maintenance findById(Long id) {
		Optional<Maintenance> obj = repository.findById(id);
		return obj.orElseThrow(() -> new ResourceNotFoundException(id));
	}
	
	public Maintenance insert(Maintenance obj) {
	    if (!clientRepository.existsById(obj.getClient().getId())) {
	        throw new ResourceNotFoundException(obj.getClient().getId());
	    }
	    obj.setStatus(MaintenanceStatus.ORCADO);
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

	    if (entity.getStatus() == MaintenanceStatus.FINALIZADO) {
	        throw new BusinessException("Esta manutenção já foi finalizada");
	    }
	    
	    if (entity.getStatus() == MaintenanceStatus.ORCADO && obj.getStatus() == MaintenanceStatus.FINALIZADO) {
	        throw new BusinessException("A manutenção precisa estar em andamento antes de ser finalizada");
	    }
	    
	    if (entity.getStatus() == MaintenanceStatus.EM_MANUTENCAO 
	            && obj.getStatus() == MaintenanceStatus.ORCADO) {
	        throw new BusinessException("A manutenção que já começou não pode voltar para orçado");
	    }

	    entity.setDate(obj.getDate());
	    entity.setDescription(obj.getDescription());
	    entity.setStatus(obj.getStatus());

	    return repository.save(entity);
	}
	
	public List<Maintenance> findByClientId(Long clientId) {
	    return repository.findByClientId(clientId);
	}
	
	public List<Maintenance> findByStatus(MaintenanceStatus status) {
	    return repository.findByStatus(status);
	}
}
