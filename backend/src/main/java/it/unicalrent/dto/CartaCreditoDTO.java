package it.unicalrent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CartaCreditoDTO {

    @NotBlank(message = "Il numero della carta è obbligatorio")
    @Pattern(regexp = "^[0-9]{16}$", message = "Il numero della carta deve contenere esattamente 16 cifre")
    private String numeroCarta;

    @NotBlank(message = "La scadenza è obbligatoria")
    @Pattern(regexp = "^(0[1-9]|1[0-2])/[0-9]{2}$", message = "La scadenza deve essere nel formato MM/YY")
    private String scadenzaCarta;

    @NotBlank(message = "Il CVV è obbligatorio")
    @Pattern(regexp = "^[0-9]{3}$", message = "Il CVV deve contenere esattamente 3 cifre")
    private String cvvCarta;

    @NotBlank(message = "L'intestatario è obbligatorio")
    private String intestatarioCarta;

    // Costruttori
    public CartaCreditoDTO() {}

    public CartaCreditoDTO(String numeroCarta, String scadenzaCarta, String cvvCarta, String intestatarioCarta) {
        this.numeroCarta = numeroCarta;
        this.scadenzaCarta = scadenzaCarta;
        this.cvvCarta = cvvCarta;
        this.intestatarioCarta = intestatarioCarta;
    }

    // Getter e Setter
    public String getNumeroCarta() {
        return numeroCarta;
    }

    public void setNumeroCarta(String numeroCarta) {
        this.numeroCarta = numeroCarta;
    }

    public String getScadenzaCarta() {
        return scadenzaCarta;
    }

    public void setScadenzaCarta(String scadenzaCarta) {
        this.scadenzaCarta = scadenzaCarta;
    }

    public String getCvvCarta() {
        return cvvCarta;
    }

    public void setCvvCarta(String cvvCarta) {
        this.cvvCarta = cvvCarta;
    }

    public String getIntestatarioCarta() {
        return intestatarioCarta;
    }

    public void setIntestatarioCarta(String intestatarioCarta) {
        this.intestatarioCarta = intestatarioCarta;
    }
}