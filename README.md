# 🚗 UnicalRent - Piattaforma di Noleggio Veicoli Universitaria

UnicalRent è una piattaforma di noleggio veicoli dedicata agli studenti universitari, sviluppata con tecnologie moderne per garantire un'esperienza utente ottimale e una gestione sicura delle prenotazioni.

---

## 📋 Indice

- [🏗️ Architettura](#️-architettura)
- [🛠️ Tecnologie Utilizzate](#️-tecnologie-utilizzate)
- [📦 Prerequisiti](#-prerequisiti)
- [🚀 Installazione e Avvio](#-installazione-e-avvio)
- [🔧 Configurazione](#-configurazione)
- [📚 API Documentation](#-api-documentation)
- [🎯 Funzionalità Principali](#-funzionalità-principali)
- [🔐 Autenticazione e Autorizzazione](#-autenticazione-e-autorizzazione)
- [🗄️ Database](#️-database)
- [🐳 Docker](#-docker)
- [👥 Ruoli Utente](#-ruoli-utente)
- [🧪 Testing](#-testing)
- [📈 Monitoraggio e Logging](#-monitoraggio-e-logging)
- [🚀 Deploy in Produzione](#-deploy-in-produzione)
- [🤝 Contribuire](#-contribuire)
- [📝 Licenza](#-licenza)
- [👨‍💻 Autore](#-autore)
- [📞 Supporto](#-supporto)

---

## 🏗️ Architettura

L'architettura è suddivisa in microservizi con chiara separazione tra frontend, backend, autenticazione e documentazione.
---

## 🛠️ Tecnologie Utilizzate

### Backend
- **Framework:** Spring Boot 3.4.5
- **Linguaggio:** Java 21
- **Database:** PostgreSQL 15
- **ORM:** Spring Data JPA + Hibernate
- **Sicurezza:** Spring Security + OAuth2 Resource Server
- **Autenticazione:** Keycloak (JWT)
- **Documentazione API:** SpringDoc OpenAPI 3
- **Testing:** JUnit 5 + H2 Database

### Frontend
- **Framework:** React 18.3.1
- **Linguaggio:** TypeScript 5.5.3
- **Build Tool:** Vite 7.0.0
- **Styling:** Tailwind CSS 3.4.1
- **Routing:** React Router DOM 6.8.1
- **Autenticazione:** keycloak-js 26.2.0
- **Icone:** Lucide React
- **Date Handling:** date-fns + react-datepicker
- **JWT:** jwt-decode

### Infrastruttura
- **Containerizzazione:** Docker + Docker Compose
- **Identity Provider:** Keycloak 26.2.3
- **Reverse Proxy:** Configurazione CORS integrata

---

## 📦 Prerequisiti

- Docker >= 20.10
- Docker Compose >= 2.0
- Node.js >= 18
- Java >= 21
- Maven >= 3.8

---

## 🚀 Installazione e Avvio

### 🐳 Avvio Completo con Docker (Raccomandato)

```bash
# Clona il repository
git clone <repository-url>
cd UnicalRent

# Avvia tutti i servizi
docker-compose up -d

# Verifica lo stato
docker-compose ps

## 📚 API Documentation

🔗 **Swagger UI**  
Accedi alla documentazione interattiva delle API: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### 📋 Endpoint Principali

| Endpoint                       | Metodo   | Descrizione                        | Autorizzazione |
|-------------------------------|----------|------------------------------------|----------------|
| `/api/utenti/me`              | GET      | Profilo utente corrente            | JWT            |
| `/api/veicoli`                | GET      | Lista veicoli disponibili          | Pubblico       |
| `/api/veicoli/{id}`           | GET      | Dettagli veicolo                   | Pubblico       |
| `/api/prenotazioni`           | GET/POST | Gestione prenotazioni              | JWT            |
| `/api/carte-credito`          | GET/POST | Gestione carte di credito          | JWT            |
| `/api/admin/**`               | *        | Endpoint amministrativi            | ADMIN          |

---

## 🎯 Funzionalità Principali

### 👤 Gestione Utenti
- ✅ Registrazione e login tramite Keycloak
- ✅ Profilo utente con dati personali
- ✅ Gestione carte di credito multiple
- ✅ Storico prenotazioni

### 🚗 Gestione Veicoli
- ✅ Catalogo veicoli con filtri avanzati
- ✅ Dettagli veicolo (specifiche, immagini, disponibilità)
- ✅ Gestione flotta (solo admin)
- ✅ Controllo disponibilità in tempo reale

### 📅 Sistema Prenotazioni
- ✅ Prenotazione veicoli con selezione date
- ✅ Controllo conflitti e sovrapposizioni
- ✅ Gestione stati prenotazione
- ✅ Sistema di pagamento integrato
- ✅ Notifiche automatiche

### 💳 Gestione Pagamenti
- ✅ Carte di credito multiple per utente
- ✅ Validazione e mascheramento dati sensibili
- ✅ Carta principale per pagamenti automatici
- ✅ Cronologia transazioni

---

## 🔐 Autenticazione e Autorizzazione

### 🎫 JWT Token Flow

1. Login → Keycloak genera JWT
2. Frontend → Memorizza token e refresh token
3. API Calls → Token incluso in header `Authorization`
4. Backend → Valida token e estrae ruoli/scope

### 🛡️ Sicurezza

- CORS configurato per frontend
- CSRF disabilitato (API stateless)
- JWT con validazione firma e scadenza
- Ruoli estratti da token per autorizzazione
- Endpoint protetti con `@PreAuthorize`

---

## 👥 Ruoli Utente

| Ruolo   | Descrizione          | Permessi                                      |
|---------|----------------------|-----------------------------------------------|
| UTENTE  | Utente standard      | Prenotazioni, profilo, carte di credito       |
| ADMIN   | Amministratore       | Gestione flotta, utenti, prenotazioni globali |

---

## 🗄️ Database

### 📊 Schema Principale

```sql
-- Entità principali
UTENTI (id, nome, cognome, email, ruolo)
VEICOLI (id, marca, modello, targa, tipo, prezzo_giornaliero)
PRENOTAZIONI (id, utente_id, veicolo_id, data_inizio, data_fine, stato)
CARTE_CREDITO (id, utente_id, numero_mascherato, scadenza, principale)
SERVIZI_GIORNO (id, veicolo_id, data, disponibile)

#👨‍💻 Autore

Mattia Marasco - Università della Calabria
