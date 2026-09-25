package VCCMotores.Sistema_de_gerenciamento.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import VCCMotores.Sistema_de_gerenciamento.entities.Budget;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

}
