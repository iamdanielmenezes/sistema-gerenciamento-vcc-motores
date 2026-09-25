package VCCMotores.Sistema_de_gerenciamento.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import VCCMotores.Sistema_de_gerenciamento.entities.Maintenance;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long>{
	
	

}
