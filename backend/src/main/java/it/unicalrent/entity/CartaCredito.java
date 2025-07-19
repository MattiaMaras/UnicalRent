package it.unicalrent.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

@Entity
@Table(name = "carte_credito")
public class CartaCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false)
    private Utente utente;

    @Pattern(regexp = "^[0-9]{16}$", message = "Il numero della carta deve contenere esattamente 16 cifre")
    @Column(nullable = false)
    private String numeroCarta;

    @Pattern(regexp = "^(0[1-9]|1[0-2])/[0-9]{2}$", message = "La scadenza deve essere nel formato MM/YY")
    @Column(nullable = false)
    private String scadenzaCarta;

    @Pattern(regexp = "^[0-9]{3}$", message = "Il CVV deve contenere esattamente 3 cifre")
    @Column(nullable = false)
    private String cvvCarta;

    @NotBlank
    @Column(nullable = false)
    private String intestatarioCarta;

    @Column(nullable = false)
    private String tipoCarta; // VISA, MASTERCARD, AMEX, etc.

    @Column(nullable = false)
    private boolean principale = false; // Carta principale per i pagamenti

    @Column(nullable = false)
    private LocalDateTime dataCreazione;

    @Column(nullable = false)
    private LocalDateTime dataModifica;

    // Costruttori
    public CartaCredito() {
        this.dataCreazione = LocalDateTime.now();
        this.dataModifica = LocalDateTime.now();
    }

    public CartaCredito(Utente utente, String numeroCarta, String scadenzaCarta, 
                       String cvvCarta, String intestatarioCarta, String tipoCarta) {
        this();
        this.utente = utente;
        this.numeroCarta = numeroCarta;
        this.scadenzaCarta = scadenzaCarta;
        this.cvvCarta = cvvCarta;
        this.intestatarioCarta = intestatarioCarta;
        this.tipoCarta = tipoCarta;
    }

    // Getter e Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Utente getUtente() { return utente; }
    public void setUtente(Utente utente) { this.utente = utente; }

    public String getNumeroCarta() { return numeroCarta; }
    public void setNumeroCarta(String numeroCarta) { 
        this.numeroCarta = numeroCarta;
        this.dataModifica = LocalDateTime.now();
    }

    public String getScadenzaCarta() { return scadenzaCarta; }
    public void setScadenzaCarta(String scadenzaCarta) { 
        this.scadenzaCarta = scadenzaCarta;
        this.dataModifica = LocalDateTime.now();
    }

    public String getCvvCarta() { return cvvCarta; }
    public void setCvvCarta(String cvvCarta) { 
        this.cvvCarta = cvvCarta;
        this.dataModifica = LocalDateTime.now();
    }

    public String getIntestatarioCarta() { return intestatarioCarta; }
    public void setIntestatarioCarta(String intestatarioCarta) { 
        this.intestatarioCarta = intestatarioCarta;
        this.dataModifica = LocalDateTime.now();
    }

    public String getTipoCarta() { return tipoCarta; }
    public void setTipoCarta(String tipoCarta) { this.tipoCarta = tipoCarta; }

    public boolean isPrincipale() { return principale; }
    public void setPrincipale(boolean principale) { this.principale = principale; }

    public LocalDateTime getDataCreazione() { return dataCreazione; }
    public void setDataCreazione(LocalDateTime dataCreazione) { this.dataCreazione = dataCreazione; }

    public LocalDateTime getDataModifica() { return dataModifica; }
    public void setDataModifica(LocalDateTime dataModifica) { this.dataModifica = dataModifica; }

    // Metodi di utilità
    public String getNumeroCartaMascherato() {
        if (numeroCarta == null || numeroCarta.length() < 4) {
            return "**** **** **** ****";
        }
        return "**** **** **** " + numeroCarta.substring(12);
    }

    public boolean isScaduta() {
        if (scadenzaCarta == null) return true;
        
        String[] parti = scadenzaCarta.split("/");
        if (parti.length != 2) return true;
        
        try {
            int mese = Integer.parseInt(parti[0]);
            int anno = 2000 + Integer.parseInt(parti[1]);
            
            LocalDateTime ora = LocalDateTime.now();
            int annoCorrente = ora.getYear();
            int meseCorrente = ora.getMonthValue();
            
            return anno < annoCorrente || (anno == annoCorrente && mese < meseCorrente);
        } catch (NumberFormatException e) {
            return true;
        }
    }
}