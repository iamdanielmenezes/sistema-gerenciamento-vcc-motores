package VCCMotores.Sistema_de_gerenciamento.services.exceptions;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

public class StandardError {

	private Instant timestamp;
	private Integer status;
	private String error;
	private String message;
	
	@JsonInclude(JsonInclude.Include.NON_EMPTY) 
	private List<ValidationError> errors = new ArrayList<>();
	
	
	public Instant getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(Instant timestamp) {
		this.timestamp = timestamp;
	}
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
	public String getError() {
		return error;
	}
	public void setError(String error) {
		this.error = error;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	
	public List<ValidationError> getErrors() {
	    return errors;
	}
}
