package it.unicalrent.dto;

public class VeicoloDTO {
    private Long id;
    private String marca;
    private String modello;
    private String targa;
    private Integer posti;
    private String alimentazione;
    private String tipo;
    private Integer anno;
    private Double costoOrario;
    private String immagine;
    
    // Costruttori
    public VeicoloDTO() {}
    
    // Getters e Setters
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
    
    public Double getCostoOrario() { return costoOrario; }
    public void setCostoOrario(Double costoOrario) { this.costoOrario = costoOrario; }
    
    public String getImmagine() { return immagine; }
    public void setImmagine(String immagine) { this.immagine = immagine; }
}