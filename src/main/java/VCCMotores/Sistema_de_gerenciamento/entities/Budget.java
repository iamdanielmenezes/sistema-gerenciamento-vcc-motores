package VCCMotores.Sistema_de_gerenciamento.entities;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import VCCMotores.Sistema_de_gerenciamento.entities.enums.BudgetStatus;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
@Table(name = "tb_budget") 
public class Budget {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotNull
	@PositiveOrZero
	private BigDecimal price;
	
	@Enumerated(EnumType.STRING)
	private BudgetStatus status;
	
	@OneToMany
	@JoinColumn(name = "budget_id")
	private List<Maintenance> maintenance = new ArrayList<>();
	
	public Budget() {
	}

	public Budget(Long id, BigDecimal price, BudgetStatus status, List<Maintenance> maintenance) {
		this.id = id;
		this.price = price;
		this.status = status;
		this.maintenance = maintenance;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public BudgetStatus getStatus() {
		return status;
	}

	public void setStatus(BudgetStatus status) {
		this.status = status;
	}
	
	public List<Maintenance> getMaintenance() {
	    return maintenance;
	}

	public void setMaintenance(List<Maintenance> maintenance) {
	    this.maintenance = maintenance;
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Budget other = (Budget) obj;
		return Objects.equals(id, other.id);
	}
}
