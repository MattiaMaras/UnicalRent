package it.unicalrent.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "prenotazioni")
public class Prenotazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veicolo_id", nullable = false)
    @NotNull
    private Veicolo veicolo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false)
    @NotNull
    private Utente utente;

    @Column(nullable = false)
    @NotNull
    private LocalDateTime dataInizio;

    @Column(nullable = false)
    @NotNull
    private LocalDateTime dataFine;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatoPrenotazione stato;

    @Column(name = "costo_totale", nullable = false)
    private Double costoTotale;

    @Column(length = 2048)
    private String note;

    // Aggiungi questo campo per la data di creazione
    @CreationTimestamp
    @Column(name = "data_creazione", nullable = false, updatable = false)
    private LocalDateTime dataCreazione;

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
    
    // Aggiungi getter e setter per dataCreazione
    public LocalDateTime getDataCreazione() {
        return dataCreazione;
    }

    public void setDataCreazione(LocalDateTime dataCreazione) {
        this.dataCreazione = dataCreazione;
    }
}