package VCCMotores.Sistema_de_gerenciamento.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import VCCMotores.Sistema_de_gerenciamento.entities.Client;
import VCCMotores.Sistema_de_gerenciamento.repositories.ClientRepository;
import VCCMotores.Sistema_de_gerenciamento.services.exceptions.ResourceNotFoundException;

@Service
public class ClientService {

	@Autowired
	private ClientRepository repository;
	
	public List<Client> findAll(){
		return repository.findAll();
	}
	
	public Client findById(Long id) {
		Optional<Client> obj = repository.findById(id);
		return obj.orElseThrow(() -> new ResourceNotFoundException(id));
	}
	
	public Client insert(Client obj) {
		return repository.save(obj);
	}
	
	public void delete(Long id) {
		if (!repository.existsById(id)) {
	        throw new ResourceNotFoundException(id);
		}
	    repository.deleteById(id);
	}
	
	public Client update(Long id, Client obj) {
		Client entity = findById(id);
		
		entity.setName(obj.getName());
		entity.setCpf(obj.getCpf());
		entity.setEmail(obj.getEmail());
		entity.setPhone(obj.getPhone());

		return repository.save(entity);
	}
}
