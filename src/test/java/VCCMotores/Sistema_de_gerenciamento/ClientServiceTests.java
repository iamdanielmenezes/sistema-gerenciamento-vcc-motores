package VCCMotores.Sistema_de_gerenciamento;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import VCCMotores.Sistema_de_gerenciamento.entities.Client;
import VCCMotores.Sistema_de_gerenciamento.services.ClientService;
import VCCMotores.Sistema_de_gerenciamento.services.exceptions.ResourceNotFoundException;

@SpringBootTest
public class ClientServiceTests {

	@Autowired
	private ClientService clientService;

	@Test 
	void findByIdShouldReturnClientWhenIdExists() { //Testa se o método findById retorna o cliente corretamente quando o ID existe.
		Client client = clientService.findById(2L);

		assertNotNull(client);
		assertEquals("João da Silva", client.getName());
	}
	
	@Test
	void findByIdShouldThrowExceptionWhenIdDoesNotExist() { //Testa se o método findById lança ResourceNotFoundException quando o ID não existe.

	    assertThrows(ResourceNotFoundException.class, () -> {
	        clientService.findById(999L);
	    });
	}
}
