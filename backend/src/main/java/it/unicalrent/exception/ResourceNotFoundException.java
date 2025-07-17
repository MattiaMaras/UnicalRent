package it.unicalrent.exception;

/**
 * Eccezione lanciata quando una risorsa richiesta non esiste.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String entityName, Object id) {
        super(entityName + " con ID " + id + " non trovata.");
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}