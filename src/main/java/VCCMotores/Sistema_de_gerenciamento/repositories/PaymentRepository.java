package VCCMotores.Sistema_de_gerenciamento.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import VCCMotores.Sistema_de_gerenciamento.entities.Payment;
import VCCMotores.Sistema_de_gerenciamento.entities.enums.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
	
	boolean existsByBudgetId(Long budgetId);
	
	List<Payment> findByStatus(PaymentStatus status);
	
}
