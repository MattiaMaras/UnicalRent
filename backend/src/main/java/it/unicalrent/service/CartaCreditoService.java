package it.unicalrent.service;

import it.unicalrent.dto.CartaCreditoDTO;
import it.unicalrent.entity.CartaCredito;
import it.unicalrent.entity.Utente;
import it.unicalrent.repository.CartaCreditoRepository;
import it.unicalrent.repository.UtenteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartaCreditoService {

    private final CartaCreditoRepository cartaRepository;
    private final UtenteRepository utenteRepository;

    public CartaCreditoService(CartaCreditoRepository cartaRepository, UtenteRepository utenteRepository) {
        this.cartaRepository = cartaRepository;
        this.utenteRepository = utenteRepository;
    }

    @Transactional(readOnly = true)
    public List<CartaCreditoDTO> getCarteUtente(String userId) {
        List<CartaCredito> carte = cartaRepository.findByUtenteIdOrderByPrincipaleDescDataCreazioneDesc(userId);
        return carte.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartaCreditoDTO aggiungiCarta(String userId, CartaCreditoDTO cartaDTO) {
        Utente utente = utenteRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utente non trovato: " + userId));
    
        // Verifica se è la prima carta (diventa automaticamente principale)
        boolean isPrimaCarta = cartaRepository.countByUtenteId(userId) == 0;
        
        // Se viene impostata come principale, rimuovi il flag dalle altre
        if (cartaDTO.isPrincipale() || isPrimaCarta) {
            rimuoviCartaPrincipale(userId);
        }
    
        CartaCredito carta = new CartaCredito(
                utente,
                cartaDTO.getNumeroCarta(),
                cartaDTO.getScadenzaCarta(),
                cartaDTO.getCvvCarta(),
                cartaDTO.getIntestatarioCarta(),
                determinaTipoCarta(cartaDTO.getNumeroCarta())
        );
        
        carta.setPrincipale(cartaDTO.isPrincipale() || isPrimaCarta);
        
        CartaCredito cartaSalvata = cartaRepository.save(carta);

        if (cartaSalvata.isPrincipale()) {
            sincronizzaCampiLegacy(utente, cartaSalvata);
        }
        
        return toDTO(cartaSalvata);
    }

    @Transactional
    public CartaCreditoDTO impostaCartaPrincipale(String userId, Long cartaId) {
        CartaCredito carta = cartaRepository.findById(cartaId)
                .orElseThrow(() -> new IllegalArgumentException("Carta non trovata: " + cartaId));
        
        if (!carta.getUtente().getId().equals(userId)) {
            throw new IllegalArgumentException("Non autorizzato a modificare questa carta");
        }
        
        // Rimuovi il flag principale dalle altre carte
        rimuoviCartaPrincipale(userId);
        
        // Imposta questa come principale
        carta.setPrincipale(true);
        CartaCredito cartaAggiornata = cartaRepository.save(carta);

        Utente utente = carta.getUtente();
        sincronizzaCampiLegacy(utente, cartaAggiornata);
        
        return toDTO(cartaAggiornata);
    }


    private void sincronizzaCampiLegacy(Utente utente, CartaCredito cartaPrincipale) {
        utente.setNumeroCarta(cartaPrincipale.getNumeroCarta());
        utente.setScadenzaCarta(cartaPrincipale.getScadenzaCarta());
        utente.setCvvCarta(cartaPrincipale.getCvvCarta());
        utente.setIntestatarioCarta(cartaPrincipale.getIntestatarioCarta());
        utenteRepository.save(utente);
    }

    @Transactional
    public void rimuoviCarta(String userId, Long cartaId) {
        CartaCredito carta = cartaRepository.findById(cartaId)
                .orElseThrow(() -> new IllegalArgumentException("Carta non trovata: " + cartaId));
        
        if (!carta.getUtente().getId().equals(userId)) {
            throw new IllegalArgumentException("Non autorizzato a rimuovere questa carta");
        }
        
        boolean eraPrincipale = carta.isPrincipale();
        Utente utente = carta.getUtente();
        cartaRepository.delete(carta);

        if (eraPrincipale) {
            List<CartaCredito> altreCarteUtente = cartaRepository.findByUtenteIdOrderByPrincipaleDescDataCreazioneDesc(userId);
            if (!altreCarteUtente.isEmpty()) {
                CartaCredito nuovaPrincipale = altreCarteUtente.get(0);
                nuovaPrincipale.setPrincipale(true);
                cartaRepository.save(nuovaPrincipale);
                sincronizzaCampiLegacy(utente, nuovaPrincipale);
            } else {
                pulisciCampiLegacy(utente);
            }
        }
    }

    private void pulisciCampiLegacy(Utente utente) {
        utente.setNumeroCarta(null);
        utente.setScadenzaCarta(null);
        utente.setCvvCarta(null);
        utente.setIntestatarioCarta(null);
        utenteRepository.save(utente);
    }

    private void rimuoviCartaPrincipale(String userId) {
        cartaRepository.findByUtenteIdAndPrincipaleTrue(userId)
                .ifPresent(carta -> {
                    carta.setPrincipale(false);
                    cartaRepository.save(carta);
                });
    }

    private CartaCreditoDTO toDTO(CartaCredito carta) {
        CartaCreditoDTO dto = new CartaCreditoDTO();
        dto.setId(carta.getId());
        dto.setNumeroCarta(carta.getNumeroCartaMascherato()); // Sempre mascherato
        dto.setScadenzaCarta(carta.getScadenzaCarta());
        dto.setCvvCarta("***");
        dto.setIntestatarioCarta(carta.getIntestatarioCarta());
        dto.setTipoCarta(carta.getTipoCarta());
        dto.setPrincipale(carta.isPrincipale());
        dto.setMascherata(true);
        dto.setDataCreazione(carta.getDataCreazione());
        dto.setScaduta(carta.isScaduta());
        return dto;
    }

    private String determinaTipoCarta(String numeroCarta) {
        if (numeroCarta.startsWith("4")) return "VISA";
        if (numeroCarta.startsWith("5") || numeroCarta.startsWith("2")) return "MASTERCARD";
        if (numeroCarta.startsWith("3")) return "AMEX";
        return "ALTRO";
    }

    @Transactional(readOnly = true)
    public boolean hasCartaValida(String userId) {
        List<CartaCredito> carte = cartaRepository.findByUtenteIdOrderByPrincipaleDescDataCreazioneDesc(userId);
        return carte.stream().anyMatch(c -> !c.isScaduta());
    }
}