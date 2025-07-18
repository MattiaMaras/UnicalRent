package it.unicalrent.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Rappresenta il contatore giornaliero delle prenotazioni per ciascun veicolo.
 * Utilizzato per garantire la mutua esclusione su base giornaliera: grazie al 
 * campo `version` (optimistic locking), due transazioni concorrenti che 
 * modificano lo stesso record entreranno in conflitto.
 */
@Entity
@Table(
        name = "servizio_giorno",
        uniqueConstraints = @UniqueConstraint(
                name = "uc_servizio_giorno_veicolo_data",
                columnNames = { "veicolo_id", "data" }
        )
)
public class ServizioGiorno {

    /**
     * Chiave primaria auto-generata dal database.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Veicolo a cui si riferisce questo contatore.
     * Molteplici record di questo tipo possono esistere per lo stesso veicolo in date diverse.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veicolo_id", nullable = false)
    private Veicolo veicolo;

    /**
     * Data di riferimento del contatore (solo giorno, senza orario).
     */
    @Column(name = "data", nullable = false)
    private LocalDate data;

    /**
     * Version per optimistic locking:
     * incrementa ad ogni update, costringendo transazioni concorrenti a rilevare conflitti su questo stesso record.
     */
    @Version
    private Long version;

    /**
     * Numero di prenotazioni registrate in questo giorno per il veicolo.
     * Viene incrementato ogni volta che si crea una nuova prenotazione in questo giorno.
     */
    @Column(name = "numero_prenotazioni", nullable = false)
    private Integer numeroPrenotazioni = 0;

    public ServizioGiorno() {
    }

    public ServizioGiorno(Veicolo veicolo, LocalDate data) {
        this.veicolo = veicolo;
        this.data = data;
        this.numeroPrenotazioni = 0;
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

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Long getVersion() {
        return version;
    }

    public Integer getNumeroPrenotazioni() {
        return numeroPrenotazioni;
    }

    public void setNumeroPrenotazioni(Integer numeroPrenotazioni) {
        this.numeroPrenotazioni = numeroPrenotazioni;
    }

    public Integer incrementaPrenotazioni() {
        this.numeroPrenotazioni = this.numeroPrenotazioni + 1;
        return this.numeroPrenotazioni;
    }
    
    // Aggiungi questo metodo
    public Integer decrementaPrenotazioni() {
        if (this.numeroPrenotazioni > 0) {
            this.numeroPrenotazioni = this.numeroPrenotazioni - 1;
        }
        return this.numeroPrenotazioni;
    }
}