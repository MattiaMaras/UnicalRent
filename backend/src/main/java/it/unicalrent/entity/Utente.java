package it.unicalrent.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Rappresenta un utente autenticato tramite Keycloak.
 * Contiene ID, nome, cognome, email e ruolo.
 */
@Entity
@Table(
        name = "utenti",
        uniqueConstraints = @UniqueConstraint(columnNames = "email")
)
public class Utente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /** Nome dell’utente */
    @Column(nullable = false, length = 50)
    private String nome;

    /** Cognome dell’utente */
    @Column(nullable = false, length = 50)
    private String cognome;

    /** Email univoca per il login */
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    /** Ruolo applicativo: "UTENTE" o "ADMIN" */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Ruolo ruolo;

    /**
     * Relazione 1-N con Prenotazione:
     * un utente può avere molte prenotazioni.
     */
    @OneToMany(
            mappedBy = "utente",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<Prenotazione> prenotazioni = new ArrayList<>();

    public Utente() { }

    public Utente(String id, String nome, String cognome, String email, Ruolo ruolo) {
        this.id = id;
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.ruolo = ruolo;
    }

    // --- Getters e Setters ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCognome() {
        return cognome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Ruolo getRuolo() {
        return ruolo;
    }

    public void setRuolo(Ruolo ruolo) {
        this.ruolo = ruolo;
    }

    public List<Prenotazione> getPrenotazioni() {
        return prenotazioni;
    }

    /**
     * Aggiunge una prenotazione all'utente e imposta il collegamento inverso.
     */
    public void addPrenotazione(Prenotazione p) {
        prenotazioni.add(p);
        p.setUtente(this);
    }

    /**
     * Rimuove una prenotazione dall'utente e resetta il collegamento inverso.
     */
    public void removePrenotazione(Prenotazione p) {
        prenotazioni.remove(p);
        p.setUtente(null);
    }
}