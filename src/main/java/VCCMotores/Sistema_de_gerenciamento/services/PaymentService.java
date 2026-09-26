package VCCMotores.Sistema_de_gerenciamento.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import VCCMotores.Sistema_de_gerenciamento.entities.Payment;
import VCCMotores.Sistema_de_gerenciamento.repositories.BudgetRepository;
import VCCMotores.Sistema_de_gerenciamento.repositories.PaymentRepository;
import VCCMotores.Sistema_de_gerenciamento.services.exceptions.ResourceNotFoundException;

@Service
public class PaymentService {

	@Autowired
	private PaymentRepository repository;

	@Autowired
	private BudgetRepository budgetRepository;

	public List<Payment> findAll() {
		return repository.findAll();
	}

	public Payment findById(Long id) {
		Optional<Payment> obj = repository.findById(id);
		return obj.orElseThrow(() -> new ResourceNotFoundException(id));
	}

	public Payment insert(Payment obj) {
		if (!budgetRepository.existsById(obj.getBudget().getId())) {
			throw new ResourceNotFoundException(obj.getBudget().getId());
		}
		return repository.save(obj);
	}

	public void delete(Long id) {
		if (!repository.existsById(id)) {
			throw new ResourceNotFoundException(id);
		}
		repository.deleteById(id);
	}

	public Payment update(Long id, Payment obj) {
		Payment entity = findById(id);

		entity.setStatus(obj.getStatus());
		entity.setMethod(obj.getMethod());

		return repository.save(entity);
	}
}
