package it.unicalrent.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Rappresenta un veicolo prenotabile.
 * Contiene le informazioni essenziali e uno stato di disponibilità.
 */
@Entity
@Table(
        name = "veicoli",
        uniqueConstraints = @UniqueConstraint(columnNames = "targa")
)
public class Veicolo {

    /**
     * Chiave primaria generata automaticamente dal DB.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Marca del veicolo (es. "Fiat") */
    @Column(nullable = false, length = 50)
    private String marca;

    /** Modello del veicolo (es. "Panda") */
    @Column(nullable = false, length = 50)
    private String modello;

    /** Targa univoca del veicolo */
    @Column(nullable = false, unique = true, length = 10)
    private String targa;

    /** Numero di posti a sedere disponibili */
    @Column(nullable = false)
    private Integer posti;

    /** Tipo di alimentazione (benzina, diesel, elettrico) */
    @Column(nullable = false, length = 20)
    private String alimentazione;

    /** Tipo veicolo (es. AUTO, SCOOTER) */
    @Column(nullable = false, length = 20)
    private String tipo;

    /** Anno di immatricolazione */
    @Column(nullable = false)
    private Integer anno;

    /** Flag che indica se il veicolo è disponibile per prenotazioni */
    @Column(nullable = false)
    private Boolean disponibile = true;

    /** Flag che indica se il veicolo è attivo nel sistema */
    @Column(nullable = false)
    private Boolean attivo = true;

    /** Costo orario di utilizzo del veicolo */
    @Column(nullable = false)
    private Double costoOrario;

    /** Descrizione dettagliata del veicolo */
    @Column(length = 2048)
    private String descrizione;

    /** URL immagine del veicolo */
    @Column(length = 2048)
    private String immagine;

    /** Data di aggiunta del veicolo nel sistema */
    @Column(nullable = false)
    private String dataAggiunta;

    /**
     * Relazione 1-N con Prenotazione:
     * un veicolo può essere prenotato più volte.
     */
    @OneToMany(
            mappedBy = "veicolo",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<Prenotazione> prenotazioni = new ArrayList<>();

    public Veicolo() { }

    public Veicolo(String marca, String modello, String targa, Integer posti, String alimentazione) {
        this.marca = marca;
        this.modello = modello;
        this.targa = targa;
        this.posti = posti;
        this.alimentazione = alimentazione;
    }

    // --- Getters e Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModello() {
        return modello;
    }

    public void setModello(String modello) {
        this.modello = modello;
    }

    public String getTarga() {
        return targa;
    }

    public void setTarga(String targa) {
        this.targa = targa;
    }

    public Integer getPosti() {
        return posti;
    }

    public void setPosti(Integer posti) {
        this.posti = posti;
    }

    public String getAlimentazione() {
        return alimentazione;
    }

    public void setAlimentazione(String alimentazione) {
        this.alimentazione = alimentazione;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Integer getAnno() {
        return anno;
    }

    public void setAnno(Integer anno) {
        this.anno = anno;
    }

    public Boolean getDisponibile() {
        return disponibile;
    }

    public void setDisponibile(Boolean disponibile) {
        this.disponibile = disponibile;
    }

    public Boolean getAttivo() {
        return attivo;
    }

    public void setAttivo(Boolean attivo) {
        this.attivo = attivo;
    }

    public Double getCostoOrario() {
        return costoOrario;
    }

    public void setCostoOrario(Double costoOrario) {
        this.costoOrario = costoOrario;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }

    public String getImmagine() {
        return immagine;
    }

    public void setImmagine(String immagine) {
        this.immagine = immagine;
    }

    public String getDataAggiunta() {
        return dataAggiunta;
    }

    public void setDataAggiunta(String dataAggiunta) {
        this.dataAggiunta = dataAggiunta;
    }

    public List<Prenotazione> getPrenotazioni() {
        return prenotazioni;
    }

    /**
     * Associa una prenotazione al veicolo e imposta il riferimento inverso.
     */
    public void addPrenotazione(Prenotazione p) {
        prenotazioni.add(p);
        p.setVeicolo(this);
    }

    /**
     * Rimuove una prenotazione dal veicolo e resetta il riferimento inverso.
     */
    public void removePrenotazione(Prenotazione p) {
        prenotazioni.remove(p);
        p.setVeicolo(null);
    }
}