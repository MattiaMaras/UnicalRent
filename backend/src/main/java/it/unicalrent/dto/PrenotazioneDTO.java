package it.unicalrent.dto;

import it.unicalrent.entity.StatoPrenotazione;
import java.time.LocalDateTime;

public class PrenotazioneDTO {
    private Long id;
    private LocalDateTime dataInizio;
    private LocalDateTime dataFine;
    private StatoPrenotazione stato;
    private Double costoTotale;
    private String note;
    private LocalDateTime dataCreazione;

    private VeicoloDTO veicolo;

    private UtenteDTO utente;

    public PrenotazioneDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public LocalDateTime getDataInizio() { return dataInizio; }
    public void setDataInizio(LocalDateTime dataInizio) { this.dataInizio = dataInizio; }
    
    public LocalDateTime getDataFine() { return dataFine; }
    public void setDataFine(LocalDateTime dataFine) { this.dataFine = dataFine; }
    
    public StatoPrenotazione getStato() { return stato; }
    public void setStato(StatoPrenotazione stato) { this.stato = stato; }
    
    public Double getCostoTotale() { return costoTotale; }
    public void setCostoTotale(Double costoTotale) { this.costoTotale = costoTotale; }
    
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    
    public LocalDateTime getDataCreazione() { return dataCreazione; }
    public void setDataCreazione(LocalDateTime dataCreazione) { this.dataCreazione = dataCreazione; }
    
    public VeicoloDTO getVeicolo() { return veicolo; }
    public void setVeicolo(VeicoloDTO veicolo) { this.veicolo = veicolo; }
    
    public UtenteDTO getUtente() { return utente; }
    public void setUtente(UtenteDTO utente) { this.utente = utente; }
}