package VCCMotores.Sistema_de_gerenciamento.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import VCCMotores.Sistema_de_gerenciamento.entities.Budget;
import VCCMotores.Sistema_de_gerenciamento.entities.enums.BudgetStatus;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

	  boolean existsByMaintenanceIdAndStatusNot(Long maintenanceId, BudgetStatus status);
	
}
