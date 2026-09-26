package VCCMotores.Sistema_de_gerenciamento.entities;

import java.time.Instant;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import VCCMotores.Sistema_de_gerenciamento.entities.enums.MaintenanceStatus;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_maintenance")
public class Maintenance {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@JsonFormat(
	    shape = JsonFormat.Shape.STRING,
	    pattern = "dd/MM/yyyy HH:mm:ss",
	    timezone = "America/Sao_Paulo"
	)
	@NotNull
	private Instant date;

	@NotBlank
	@Size(min = 5, max = 500)
	private String description;
	
	@Enumerated(EnumType.STRING)
	private MaintenanceStatus status;
	
	@JsonIgnore 
	@OneToOne(mappedBy = "maintenance")
	private Budget budget;
	
	@NotNull
	@ManyToOne
	@JoinColumn(name = "client_id")
	private Client client;
	
	
	public Maintenance() {
	}

	public Maintenance(Long id, Instant date, String description, MaintenanceStatus status, Budget budget, Client client) {
	    this.id = id;
	    this.date = date;
	    this.description = description;
	    this.status = status;
	    this.budget = budget;
	    this.client = client;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Instant getDate() {
		return date;
	}

	public void setDate(Instant date) {
		this.date = date;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	public MaintenanceStatus getStatus() {
	    return status;
	}

	public void setStatus(MaintenanceStatus status) {
	    this.status = status;
	}

	public Budget getBudget() {
	    return budget;
	}

	public void setBudget(Budget budget) {
	    this.budget = budget;
	}
	
	public Client getClient() {
	    return client;
	}

	public void setClient(Client client) {
	    this.client = client;
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
		Maintenance other = (Maintenance) obj;
		return Objects.equals(id, other.id);
	}
}
