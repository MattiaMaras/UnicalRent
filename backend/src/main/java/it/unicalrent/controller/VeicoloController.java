package it.unicalrent.controller;

import it.unicalrent.entity.Veicolo;
import it.unicalrent.service.VeicoloService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/veicoli")
public class VeicoloController {

    private final VeicoloService veService;

    public VeicoloController(VeicoloService veService) {
        this.veService = veService;
    }

    /** Aggiunge un nuovo veicolo (solo ADMIN) */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Veicolo create(@RequestBody Veicolo v) {
        return veService.creaVeicolo(v);
    }

    /** Modifica un veicolo esistente (solo ADMIN) */
    @PutMapping("/{id}")
    public Veicolo update(@PathVariable Long id, @RequestBody Veicolo v) {
        v.setId(id);
        return veService.aggiornaVeicolo(v);
    }

    /** Rimuove un veicolo (solo ADMIN) */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        veService.eliminaVeicolo(id);
    }

    /** Dettaglio di un veicolo */
    @GetMapping("/{id}")
    public Veicolo getById(@PathVariable Long id) {
        return veService.trovaPerId(id);
    }

    /** Elenco di tutti i veicoli */
    @GetMapping
    public List<Veicolo> listAll() {
        return veService.listaTutti();
    }

    /** Veicoli disponibili in una fascia oraria */
    @GetMapping("/disponibili")
    public List<Veicolo> listDisponibili(@RequestParam String inizio, @RequestParam String fine) {
        LocalDateTime dtInizio = LocalDateTime.parse(inizio);
        LocalDateTime dtFine   = LocalDateTime.parse(fine);
        return veService.listaDisponibili(dtInizio, dtFine);
    }
}