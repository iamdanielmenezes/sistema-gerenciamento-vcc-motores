package VCCMotores.Sistema_de_gerenciamento.entities;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.hibernate.validator.constraints.br.CPF;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_client") 
public class Client {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id; 
	
	@NotBlank(message = "nome é obrigatório")
	@Size(min = 3, max = 100, message = "nome deve ter entre 3 e 100 caracteres")
	private String name;
	
	@NotBlank
	@CPF(message = "CPF inválido")
	private String cpf;
	
	@NotBlank
	@Email(message = "e-mail inválido")
	private String email;
	
	@Pattern(
		    regexp = "(\\d{2}\\d{9}|\\(\\d{2}\\)\\d{9}|\\(\\d{2}\\)\\d{5}-\\d{4})",
		    message = "telefone inválido"
		)
		private String phone;
	
	@JsonIgnore
	@OneToMany(mappedBy = "client")
	private List<Maintenance> maintenance = new ArrayList<>();
	
	private Client() {
	}

	public Client(Long id, String name, String cpf, String email, String phone) {
		this.id = id;
		this.name = name;
		this.cpf = cpf;
		this.email = email;
		this.phone = phone;
	} 

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
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
		Client other = (Client) obj;
		return Objects.equals(id, other.id);
	}

	
}
