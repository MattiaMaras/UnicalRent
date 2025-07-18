package it.unicalrent.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Rappresenta una prenotazione effettuata da un utente per un veicolo.
 * Include informazioni su orari, stato e importo totale.
 */
@Entity
@Table(name = "prenotazioni")
public class Prenotazione {

    /** ID univoco della prenotazione */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Veicolo prenotato */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veicolo_id", nullable = false)
    @NotNull
    private Veicolo veicolo;

    /** Utente che ha effettuato la prenotazione */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false)
    @NotNull
    private Utente utente;

    /** Data e ora di inizio della prenotazione */
    @Column(nullable = false)
    @NotNull
    private LocalDateTime dataInizio;

    /** Data e ora di fine della prenotazione */
    @Column(nullable = false)
    @NotNull
    private LocalDateTime dataFine;

    /** Stato della prenotazione: RICHIESTA, APPROVATA, ANNULLATA */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatoPrenotazione stato;

    /** Importo totale calcolato in fase di creazione */
    @Column(name = "costo_totale", nullable = false)
    private Double costoTotale;

    /** Eventuale nota dell'utente */
    @Column(length = 2048)
    private String note;

    /** Versione per optimistic locking */
    @Version
    private Long version;

    // --- Costruttori ---

    public Prenotazione() {}

    public Prenotazione(Utente utente, Veicolo veicolo, LocalDateTime dataInizio, LocalDateTime dataFine) {
        this.utente = utente;
        this.veicolo = veicolo;
        this.dataInizio = dataInizio;
        this.dataFine = dataFine;
        this.stato = StatoPrenotazione.RICHIESTA; // default
    }

    // --- Getters e Setters ---

    public Long getId() {
        return id;
    }

    public Veicolo getVeicolo() {
        return veicolo;
    }

    public void setVeicolo(Veicolo veicolo) {
        this.veicolo = veicolo;
    }

    public Utente getUtente() {
        return utente;
    }

    public void setUtente(Utente utente) {
        this.utente = utente;
    }

    public LocalDateTime getDataInizio() {
        return dataInizio;
    }

    public void setDataInizio(LocalDateTime dataInizio) {
        this.dataInizio = dataInizio;
    }

    public LocalDateTime getDataFine() {
        return dataFine;
    }

    public void setDataFine(LocalDateTime dataFine) {
        this.dataFine = dataFine;
    }

    public StatoPrenotazione getStato() {
        return stato;
    }

    public void setStato(StatoPrenotazione stato) {
        this.stato = stato;
    }

    public Double getCostoTotale() {
        return costoTotale;
    }

    public void setCostoTotale(Double costoTotale) {
        this.costoTotale = costoTotale;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Long getVersion() {
        return version;
    }
}