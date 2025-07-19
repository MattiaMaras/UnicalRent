package it.unicalrent.controller;

import it.unicalrent.dto.CartaCreditoDTO;
import it.unicalrent.service.CartaCreditoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/carte-credito")
public class CartaCreditoController {

    private final CartaCreditoService cartaCreditoService;

    public CartaCreditoController(CartaCreditoService cartaCreditoService) {
        this.cartaCreditoService = cartaCreditoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<List<CartaCreditoDTO>> getCarteUtente(Principal principal) {
        String userId = principal.getName();
        List<CartaCreditoDTO> carte = cartaCreditoService.getCarteUtente(userId);
        return ResponseEntity.ok(carte);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<CartaCreditoDTO> aggiungiCarta(
            Principal principal,
            @Valid @RequestBody CartaCreditoDTO cartaDTO
    ) {
        String userId = principal.getName();
        CartaCreditoDTO cartaAggiunta = cartaCreditoService.aggiungiCarta(userId, cartaDTO);
        return ResponseEntity.ok(cartaAggiunta);
    }

    @DeleteMapping("/{cartaId}")
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<Void> rimuoviCarta(
            Principal principal,
            @PathVariable Long cartaId
    ) {
        String userId = principal.getName();
        cartaCreditoService.rimuoviCarta(userId, cartaId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{cartaId}/principale")
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<CartaCreditoDTO> impostaCartaPrincipale(
            Principal principal,
            @PathVariable Long cartaId
    ) {
        String userId = principal.getName();
        CartaCreditoDTO carta = cartaCreditoService.impostaCartaPrincipale(userId, cartaId);
        return ResponseEntity.ok(carta);
    }

    @GetMapping("/valida")
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<Boolean> hasCartaValida(Principal principal) {
        String userId = principal.getName();
        boolean hasCartaValida = cartaCreditoService.hasCartaValida(userId);
        return ResponseEntity.ok(hasCartaValida);
    }
}