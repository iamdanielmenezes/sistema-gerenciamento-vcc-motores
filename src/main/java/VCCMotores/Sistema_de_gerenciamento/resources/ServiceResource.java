package VCCMotores.Sistema_de_gerenciamento.resources;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import VCCMotores.Sistema_de_gerenciamento.services.ServiceService;

@RestController
@RequestMapping(value = "/service")
public class ServiceResource {
	
	@Autowired
	private ServiceService serviceService; 

}
