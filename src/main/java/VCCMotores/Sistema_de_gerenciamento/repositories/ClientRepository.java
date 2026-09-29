package VCCMotores.Sistema_de_gerenciamento.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import VCCMotores.Sistema_de_gerenciamento.entities.Client;

public interface ClientRepository extends JpaRepository<Client, Long>{

	List<Client> findByNameContainingIgnoreCase(String name);
	
}
