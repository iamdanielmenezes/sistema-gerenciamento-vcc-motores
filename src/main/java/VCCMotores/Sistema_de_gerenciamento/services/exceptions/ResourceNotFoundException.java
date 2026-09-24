package VCCMotores.Sistema_de_gerenciamento.services.exceptions;

public class ResourceNotFoundException extends RuntimeException{

	private static final long serialVersionUID = 1L;

	public ResourceNotFoundException(Object id) {
		super("Este id não existe: " + id);
	}
}
