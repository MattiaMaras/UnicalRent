package it.unicalrent.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "utenti")
public class Utente {

    @Id
    private String id; // ID di Keycloak

    @NotBlank
    private String nome;

    @NotBlank
    private String cognome;

    @Email
    @NotBlank
    private String email;

    @Enumerated(EnumType.STRING)
    @NotNull
    private Ruolo ruolo;

    // Campi per la carta di credito
    @Pattern(regexp = "^[0-9]{16}$", message = "Il numero della carta deve contenere esattamente 16 cifre")
    @JsonIgnore // Già aggiunto
    private String numeroCarta;

    @Pattern(regexp = "^(0[1-9]|1[0-2])/[0-9]{2}$", message = "La scadenza deve essere nel formato MM/YY")
    @JsonIgnore // Aggiungi questa annotazione
    private String scadenzaCarta;

    @Pattern(regexp = "^[0-9]{3}$", message = "Il CVV deve contenere esattamente 3 cifre")
    @JsonIgnore // Aggiungi questa annotazione
    private String cvvCarta;

    // Rimuovi @NotBlank da questa riga
    private String intestatarioCarta;

    @OneToMany(mappedBy = "utente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CartaCredito> carteCredito = new ArrayList<>();

    @OneToMany(mappedBy = "utente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Prenotazione> prenotazioni = new ArrayList<>();

    public Utente() {}

    public Utente(String id, String nome, String cognome, String email, Ruolo ruolo) {
        this.id = id;
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.ruolo = ruolo;
    }

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

    public void setPrenotazioni(List<Prenotazione> prenotazioni) {
        this.prenotazioni = prenotazioni;
    }

    public void aggiungiPrenotazione(Prenotazione p) {
        prenotazioni.add(p);
        p.setUtente(this);
    }

    public void rimuoviPrenotazione(Prenotazione p) {
        prenotazioni.remove(p);
        p.setUtente(null);
    }

    // Getter e Setter per i campi della carta di credito
    @JsonIgnore
    public String getNumeroCarta() {
        return numeroCarta;
    }

    public void setNumeroCarta(String numeroCarta) {
        this.numeroCarta = numeroCarta;
    }

    @JsonIgnore
    public String getScadenzaCarta() {
        return scadenzaCarta;
    }

    public void setScadenzaCarta(String scadenzaCarta) {
        this.scadenzaCarta = scadenzaCarta;
    }

    @JsonIgnore
    public String getCvvCarta() {
        return cvvCarta;
    }

    public void setCvvCarta(String cvvCarta) {
        this.cvvCarta = cvvCarta;
    }

    @JsonIgnore
    public String getIntestatarioCarta() {
        return intestatarioCarta;
    }

    public void setIntestatarioCarta(String intestatarioCarta) {
        this.intestatarioCarta = intestatarioCarta;
    }

    // Metodo per verificare se la carta di credito è completa (LEGACY)
    @JsonIgnore
    @Deprecated
    public boolean hasCartaCredito() {
        return numeroCarta != null && !numeroCarta.trim().isEmpty() &&
               scadenzaCarta != null && !scadenzaCarta.trim().isEmpty() &&
               cvvCarta != null && !cvvCarta.trim().isEmpty() &&
               intestatarioCarta != null && !intestatarioCarta.trim().isEmpty();
    }

    // Metodo aggiornato che controlla prima le nuove carte
    @JsonIgnore
    public boolean hasCartaCreditoValida() {
        // Prima controlla le carte multiple
        if (hasCarteCredito()) {
            return true;
        }
        // Fallback sui campi legacy
        return hasCartaCredito();
    }

    // Metodi per gestire le carte di credito
    public List<CartaCredito> getCarteCredito() {
        return carteCredito;
    }

    public void setCarteCredito(List<CartaCredito> carteCredito) {
        this.carteCredito = carteCredito;
    }

    public void aggiungiCartaCredito(CartaCredito carta) {
        carteCredito.add(carta);
        carta.setUtente(this);
    }

    public void rimuoviCartaCredito(CartaCredito carta) {
        carteCredito.remove(carta);
        carta.setUtente(null);
    }

    @JsonIgnore
    public CartaCredito getCartaPrincipale() {
        return carteCredito.stream()
                .filter(CartaCredito::isPrincipale)
                .findFirst()
                .orElse(carteCredito.isEmpty() ? null : carteCredito.get(0));
    }

    @JsonIgnore
    public boolean hasCarteCredito() {
        return !carteCredito.isEmpty() && carteCredito.stream().anyMatch(c -> !c.isScaduta());
    }

    // RIMUOVI COMPLETAMENTE I METODI DUPLICATI DALLE RIGHE 184-193
}