package it.unicalrent.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.Check;

/**
 * Rappresenta la prenotazione di un veicolo da parte di un utente.
 *
 * Contiene:
 * - ID per semplicità di gestione.
 * - Version per optimistic locking.
 * - Riferimenti a Utente e Veicolo.
 * - Inizio e fine dell’intervallo di prenotazione.
 * - Stato della prenotazione.
 *
 * Vincoli e indici:
 * - @Check per garantire inizio < fine.
 * - @UniqueConstraint per evitare duplicati esatti (stessa utente, stesso veicolo, stesso intervallo).
 * - @Index per velocizzare la ricerca di sovrapposizioni su veicolo+intervallo.
 */
@Entity
@Table(
        name = "prenotazioni",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uc_preno_utente_veicolo_fascia",
                        columnNames = { "utente_id", "veicolo_id", "inizio", "fine" }
                )
        },
        indexes = {
                @Index(
                        name = "idx_preno_veicolo_intervallo",
                        columnList = "veicolo_id, inizio, fine"
                )
        }
)
@Check(constraints = "inizio < fine")
public class Prenotazione {

    /** Chiave primaria generata automaticamente dal database */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Version per optimistic locking:
     * permette di rilevare e gestire conflitti di concorrenza
     * senza blocchi pessimisti.
     */
    @Version
    private Long version;

    /**
     * Utente che effettua la prenotazione.
     * FetchType.LAZY per caricare i dati utente solo se necessario.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utente_id", nullable = false)
    private Utente utente;

    /**
     * Veicolo prenotato.
     * FetchType.LAZY per caricare i dati veicolo solo se necessario.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veicolo_id", nullable = false)
    private Veicolo veicolo;

    /** Data e ora di inizio della prenotazione (non null) */
    @Column(nullable = false)
    private LocalDateTime inizio;

    /** Data e ora di fine della prenotazione (non null) */
    @Column(nullable = false)
    private LocalDateTime fine;

    /**
     * Stato della prenotazione:
     * - RICHIESTA: appena creata
     * - APPROVATA: confermata dal sistema
     * - ANNULLATA: cancellata dall’utente
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StatoPrenotazione stato = StatoPrenotazione.RICHIESTA;

    /** Costruttore di default richiesto da JPA */
    public Prenotazione() {
    }

    /**
     * Costruttore di convenienza.
     * Lo stato rimane RICHIESTA fino all'approvazione automatica.
     */
    public Prenotazione(Utente utente, Veicolo veicolo, LocalDateTime inizio, LocalDateTime fine) {
        this.utente = utente;
        this.veicolo = veicolo;
        this.inizio = inizio;
        this.fine = fine;
    }

    // --- Getters e Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Utente getUtente() {
        return utente;
    }

    public void setUtente(Utente utente) {
        this.utente = utente;
    }

    public Veicolo getVeicolo() {
        return veicolo;
    }

    public void setVeicolo(Veicolo veicolo) {
        this.veicolo = veicolo;
    }

    public LocalDateTime getInizio() {
        return inizio;
    }

    public void setInizio(LocalDateTime inizio) {
        this.inizio = inizio;
    }

    public LocalDateTime getFine() {
        return fine;
    }

    public void setFine(LocalDateTime fine) {
        this.fine = fine;
    }

    public StatoPrenotazione getStato() {
        return stato;
    }

    public void setStato(StatoPrenotazione stato) {
        this.stato = stato;
    }
}