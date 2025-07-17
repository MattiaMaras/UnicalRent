package it.unicalrent.exception;

/**
 * Eccezione usata per segnalare che una prenotazione
 * è in conflitto con un'altra esistente.
 */
public class BookingConflictException extends RuntimeException {

    public BookingConflictException(String message) {
        super(message);
    }
}