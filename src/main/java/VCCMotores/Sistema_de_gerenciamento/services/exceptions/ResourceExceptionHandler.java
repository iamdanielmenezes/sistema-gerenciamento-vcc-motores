package VCCMotores.Sistema_de_gerenciamento.services.exceptions;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ResourceExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<StandardError> resourceNotFound(ResourceNotFoundException e) {

	    StandardError err = new StandardError();

	    err.setTimestamp(Instant.now());
	    err.setStatus(HttpStatus.NOT_FOUND.value());
	    err.setError("Recurso não encontrado");
	    err.setMessage(e.getMessage());

	    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<StandardError> validation(MethodArgumentNotValidException e) {

		StandardError err = new StandardError();

	    err.setTimestamp(Instant.now());
	    err.setStatus(HttpStatus.BAD_REQUEST.value());
	    err.setError("Erro de validação");
	    err.setMessage("Dados inválidos");

	    for (FieldError f : e.getBindingResult().getFieldErrors()) {

	        ValidationError error = new ValidationError();

	        error.setFieldName(f.getField());
	        error.setMessage(f.getDefaultMessage());

	        err.getErrors().add(error);
	    }
	    
	    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
	}
	
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<StandardError> httpMessageNotReadable(HttpMessageNotReadableException e) {
	    StandardError err = new StandardError();
	    err.setTimestamp(Instant.now());
	    err.setStatus(HttpStatus.BAD_REQUEST.value());
	    err.setError("Erro de leitura dos dados");
	    err.setMessage("Valor inválido ou formato incorreto");

	    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
	}
}
