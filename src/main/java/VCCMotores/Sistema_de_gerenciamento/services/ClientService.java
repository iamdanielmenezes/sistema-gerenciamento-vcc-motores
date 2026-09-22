package VCCMotores.Sistema_de_gerenciamento.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import VCCMotores.Sistema_de_gerenciamento.repositories.ClientRepository;

@Service
public class ClientService {

	@Autowired
	private ClientRepository repository;
	
}
