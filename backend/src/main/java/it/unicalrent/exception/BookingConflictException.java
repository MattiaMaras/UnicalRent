package it.unicalrent.exception;

/**
 * Eccezione lanciata quando il veicolo non è disponibile
 * nella fascia oraria richiesta.
 */
public class BookingConflictException extends RuntimeException {
    public BookingConflictException(String message) {
        super(message);
    }
}