package it.unicalrent.security;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title       = "UnicalRent API",
                version     = "1.0.0",
                description = "API per la gestione di utenti, veicoli e prenotazioni",
                contact     = @Contact(name="Mattia Marasco")
        ),
        servers = @Server(url = "/")
)
public class OpenAPIConfig { }