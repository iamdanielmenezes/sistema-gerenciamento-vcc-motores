package VCCMotores.Sistema_de_gerenciamento.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import VCCMotores.Sistema_de_gerenciamento.entities.Maintenance;
import VCCMotores.Sistema_de_gerenciamento.entities.enums.MaintenanceStatus;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long>{

	List<Maintenance> findByClientId(Long clientId);
	
	List<Maintenance> findByStatus(MaintenanceStatus status);
	
}
