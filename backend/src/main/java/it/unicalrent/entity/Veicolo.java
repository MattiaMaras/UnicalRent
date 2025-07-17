package it.unicalrent.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Rappresenta un veicolo prenotabile nella piattaforma Unical Rent.
 */
@Entity
@Table(
        name = "veicoli",
        uniqueConstraints = @UniqueConstraint(columnNames = "targa")
)
public class Veicolo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false)
    private String marca;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false)
    private String modello;

    @NotBlank
    @Size(max = 10)
    @Pattern(regexp = "[A-Z]{2}[0-9]{3}[A-Z]{2}", message = "Formato targa non valido")
    @Column(nullable = false, unique = true)
    private String targa;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer posti;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false)
    private String alimentazione;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false)
    private String tipo;

    @NotNull
    @Min(1900)
    @Column(nullable = false)
    private Integer anno;

    @NotNull
    @Column(nullable = false)
    private Boolean disponibile = true;

    @NotNull
    @Column(nullable = false)
    private Boolean attivo = true;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Double costoOrario;

    @Size(max = 2048)
    private String descrizione;

    @Size(max = 2048)
    private String immagine;

    @NotNull
    @Column(nullable = false)
    private LocalDate dataAggiunta;

    @Version
    private Long version;

    /**
     * Relazione 1-N con Prenotazione (relazione bidirezionale).
     */
    @OneToMany(mappedBy = "veicolo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Prenotazione> prenotazioni = new ArrayList<>();

    /**
     * Relazione 1-N con ServizioGiorno (per mutua esclusione giornaliera).
     */
    @OneToMany(mappedBy = "veicolo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ServizioGiorno> giorniServizio = new ArrayList<>();

    public Veicolo() {}

    public Veicolo(String marca, String modello, String targa, Integer posti, String alimentazione) {
        this.marca = marca;
        this.modello = modello;
        this.targa = targa;
        this.posti = posti;
        this.alimentazione = alimentazione;
    }

    // --- Getters e Setters ---

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getMarca() { return marca; }

    public void setMarca(String marca) { this.marca = marca; }

    public String getModello() { return modello; }

    public void setModello(String modello) { this.modello = modello; }

    public String getTarga() { return targa; }

    public void setTarga(String targa) { this.targa = targa; }

    public Integer getPosti() { return posti; }

    public void setPosti(Integer posti) { this.posti = posti; }

    public String getAlimentazione() { return alimentazione; }

    public void setAlimentazione(String alimentazione) { this.alimentazione = alimentazione; }

    public String getTipo() { return tipo; }

    public void setTipo(String tipo) { this.tipo = tipo; }

    public Integer getAnno() { return anno; }

    public void setAnno(Integer anno) { this.anno = anno; }

    public Boolean getDisponibile() { return disponibile; }

    public void setDisponibile(Boolean disponibile) { this.disponibile = disponibile; }

    public Boolean getAttivo() { return attivo; }

    public void setAttivo(Boolean attivo) { this.attivo = attivo; }

    public Double getCostoOrario() { return costoOrario; }

    public void setCostoOrario(Double costoOrario) { this.costoOrario = costoOrario; }

    public String getDescrizione() { return descrizione; }

    public void setDescrizione(String descrizione) { this.descrizione = descrizione; }

    public String getImmagine() { return immagine; }

    public void setImmagine(String immagine) { this.immagine = immagine; }

    public LocalDate getDataAggiunta() { return dataAggiunta; }

    public void setDataAggiunta(LocalDate dataAggiunta) { this.dataAggiunta = dataAggiunta; }

    public Long getVersion() { return version; }

    public List<Prenotazione> getPrenotazioni() { return prenotazioni; }

    public void addPrenotazione(Prenotazione p) {
        prenotazioni.add(p);
        p.setVeicolo(this);
    }

    public void removePrenotazione(Prenotazione p) {
        prenotazioni.remove(p);
        p.setVeicolo(null);
    }
}