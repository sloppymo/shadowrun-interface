[![Dokumentation](https://img.shields.io/badge/docs-online-blue)](#readme)
[![API-Referenz](https://img.shields.io/badge/docs-API--Referenz-green)](#api-referenz)
[![Coverage](https://img.shields.io/badge/coverage-unbekannt-lightgrey)](https://github.com/comrade-morgy/CONCLAVE/actions)

# Shadowrun Interface (Deutsch)

Ein modernes, erweiterbares Multiplayer-Terminal für Shadowrun, gebaut mit React/Next.js und Tailwind CSS. Bietet eine Matrix-inspirierte UI, Echtzeit-Overlays, robuste Kommandoverarbeitung und nahtlose KI-Integration für immersive, kollaborative Erzählungen.

---

## Inhaltsverzeichnis
- [Überblick](#überblick)
- [Hauptfunktionen](#hauptfunktionen)
- [Architektur](#architektur)
- [Einrichtung & Nutzung](#einrichtung--nutzung)
- [Theming](#theming)
- [Overlays](#overlays)
- [Kommandoverarbeitung](#kommandoverarbeitung)
- [Multiplayer & Sitzungen](#multiplayer--sitzungen)
- [Entwicklerhinweise](#entwicklerhinweise)
- [Fehlerbehebung](#fehlerbehebung)
- [Roadmap](#roadmap)
- [Kontakt](#kontakt)

---

## Überblick

Das Shadowrun Interface ist das Benutzer-Terminal der Shadowrun Multiplayer Engine. Es bietet:
- Eine cyberpunk-inspirierte Terminal-UI mit fortschrittlicher Kommandoverarbeitung
- Echtzeit-Overlays für Szene, Entitäten und gemeinsames Log
- Multiplayer-Sitzungsunterstützung mit Rollenauswahl (Spieler, GM, Beobachter)
- Streaming-KI-Antworten für natürliche Sprache und Kommandos
- Vollständige Unterstützung für das "Shadowrun Barren"-Theme (dunkel, neon-grün, rote Akzente)

---

## Hauptfunktionen
- **Matrix-Terminal-UI:** Neon-grüne Eingabeaufforderung, rote Fehler, dunkles Cyberpunk-Design
- **Kommandoverarbeitung:** Unterstützt `/scene`, `/roll`, `/summon`, `/echo`, `/mark`, `/meta`, `/recall`, `/pulse` und mehr
- **Natürliche Sprach-KI:** Nicht erkannte Eingaben werden an das Backend für KI-Antworten gesendet
- **Overlays:**
  - Szenenzusammenfassung
  - Entitäten-Tracker
  - Gemeinsames Szenen-Log (geplant)
- **Multiplayer-Sitzungen:** Sitzungstoken, persistente Benutzerrollen, Echtzeit-Updates
- **Rollensystem:** Auswahl Spieler, GM, Beobachter mit Berechtigungen
- **Streaming-Ausgabe:** Echtzeit-KI-Antworten via SSE/EventSource
- **Theming:** Einfaches Umschalten mit `theme`-Kommando

---

## Architektur

```
shadowrun-interface/
├── src/
│   ├── pages/
│   │   └── index.tsx         # Hauptterminal & Overlays
│   ├── components/           # (Optional) UI-Komponenten
│   ├── styles/               # Tailwind & Theme-Konfiguration
│   └── ...
├── tailwind.config.js        # Theme-Anpassung
├── README.de.md              # Diese Datei
└── ...
```

---

## Einrichtung & Nutzung

### Voraussetzungen
- Node.js 18+
- Backend-API laufend (siehe Haupt-README)

### Installation & Start
```sh
npm install
npm run dev
# Öffne http://localhost:3000
```

### Umgebung
- Standardmäßig Backend unter `http://localhost:5000/api`
- API-Basis in `src/pages/index.tsx` anpassbar

---

## Theming
- **Standard:** Shadowrun Barren (dunkel, neon-grün, rot)
- **Umschalten:** Mit `theme` oder `skin`-Kommando
- **Anpassen:** `tailwind.config.js` bearbeiten

---

## Overlays
- **Szenenzusammenfassung:** Anzeige und (für GM) Bearbeitung der Szene
- **Entitäten-Tracker:** Zeigt alle aktiven Spieler, NSCs, Geister usw.
- **Gemeinsames Szenen-Log:** (Geplant) Echtzeit-Log aller Aktionen
- **Erweiterbar:** Neue Overlays als React-Komponenten hinzufügen

---

## Kommandoverarbeitung
- Erkennt `/command` und natürliche Sprache
- Unterstützte Kommandos:
  - `/scene` — Szenenübersicht (nur GM)
  - `/roll` — Würfeln (bald verfügbar)
  - `/summon` — Geister/Entitäten beschwören
  - `/echo`, `/mark`, `/meta`, `/recall`, `/pulse` — Shadowrun-Aktionen
  - `help` — Kommandoliste
  - `clear` — Terminal leeren
  - `theme` — Theme wechseln
- Sonstige Eingaben werden an das Backend für KI-Antworten gesendet

---

## Multiplayer & Sitzungen
- **Sitzungstoken:** Jede Sitzung hat eine eindeutige ID
- **Rollenauswahl:** Spieler, GM, Beobachter (mit Berechtigungen)
- **Persistenter Zustand:** Szene, Entitäten und Chat sind sitzungsbasiert
- **Authentifizierung:** Clerk-Integration geplant

---

## Entwicklerhinweise
- **Kommandos erweitern:** Parser in `index.tsx` bearbeiten
- **Overlays hinzufügen:** Neue Komponenten erstellen und importieren
- **Styling:** Tailwind CSS für schnelle UI-Anpassung
- **Streaming:** EventSource für Echtzeit-KI-Ausgabe
- **API-Integration:** Alle Backend-Calls via Flask-API

---

## Fehlerbehebung
- **CORS-Probleme:** Backend muss Frontend-Origin erlauben
- **API-Fehler:** Backend-Logs prüfen
- **Streaming-Probleme:** `/api/chat/stream-proxy` erreichbar?
- **UI-Fehler:** Browser-Konsole prüfen

---

## Roadmap
- Private Nachrichten (`/whisper`)
- Erweiterte Würfellogik mit Shadowrun-Glitches
- GM-Override-Panel
- Clerk-Authentifizierung
- Weitere Overlays und Logs

---

## Kontakt
- Projektleitung: [@comrade-morgy](https://github.com/comrade-morgy)
- Issues und PRs willkommen!

---

## Projektübersicht

Die Shadowrun Multiplayer Engine verwandelt das klassische Wren-Terminal in ein funktionsreiches, mehrspielerfähiges Shadowrun-Rollenspielerlebnis. Sie unterstützt persistente Sitzungen, Echtzeit-Szenen- und Entitätenverwaltung sowie fortschrittliche, KI-gestützte Erzählungen über OpenAI und andere LLMs.

- **Backend:** Python 3.13, Flask, Flask-SQLAlchemy, SQLite, httpx für asynchrones LLM-Streaming.
- **Frontend:** React/Next.js, Tailwind CSS, benutzerdefiniertes Shadowrun Barren Theme.
- **Persistenter Zustand:** Sitzungen, Benutzerrollen, Szenen und Entitäten werden in SQLite gespeichert.
- **KI-Integration:** Direkte OpenAI-API-Aufrufe mit robuster Fehlerbehandlung und Streaming via SSE.

---

## Funktionen

### Multiplayer & Sitzungsverwaltung

- Mehrere gleichzeitige Sitzungen mit eindeutigen IDs.
- Rollenzuweisung: Spieler, GM (Spielleiter), Beobachter.
- Persistente Benutzerrollen, Szenen und Entitäten pro Sitzung.

### Szenen- & Entitätenverwaltung

- Vom GM bearbeitbare Szenenzusammenfassungen.
- Entitäten-CRUD: Hinzufügen, Aktualisieren, Löschen und Auflisten von Entitäten mit Typ, Status und Zusatzdaten.
- Echtzeit-Overlays für Szenen- und Entitätenstatus.

### KI-Integration

- Streaming-LLM-Endpunkt (OpenAI, DeepSeek, Anthropic, Mistral unterstützt).
- Echtzeit-KI-Chat via SSE.
- Sprecher-Tagging für KI- und Benutzernachrichten.

### Theme & UI

- Shadowrun Barren Theme: dunkler Hintergrund, neongrüner Prompt, rote Akzente.
- Terminal-inspirierte Overlays für immersive Spielumgebung.
- Responsives Design für Desktop und Mobilgeräte.

### Sicherheit & Erweiterbarkeit

- Rollenbasierte Berechtigungen (nur GM-Aktionen).
- Geplante Clerk-Authentifizierung.
- Modulare Architektur für eigene Befehle (z.B. /roll, /whisper).

---

## Architektur

### Backend

- **Flask** REST-API mit asynchronen Endpunkten für LLM-Streaming.
- **SQLite** für persistente Speicherung von Sitzungen, Szenen, Entitäten und Benutzerrollen.
- **httpx** für robuste, asynchrone HTTP-Anfragen an LLM-Anbieter.
- **PowerShell-Testskripte** für automatisierte Backend-Validierung.

### Frontend

- **React/Next.js**-App mit modularen Komponenten und Hooks.
- **Tailwind CSS** für schnelles, themenfähiges UI-Design.
- **SSE** für Echtzeit-KI-Streaming im Chat/Terminal.

---

## Schnellstart

---

## Erweiterte Anwendungsbeispiele

### 7. Eigene LLM-Provider integrieren

Sie können weitere LLMs unterstützen, indem Sie das Backend erweitern:
- Neue API-Keys in die `.env`-Datei eintragen (z.B. `MYLLM_API_KEY`)
- Einen neuen async-Generator in `llm_utils.py` für den Provider implementieren
- Das `/api/llm`-Endpoint in `app.py` so erweitern, dass nach `model`-Parameter geroutet wird
- Beispiel-Aufruf:
  ```json
  {
    "model": "myllm-model",
    "messages": [
      {"role": "user", "content": "Erstelle einen Shadowrun-NPC."}
    ]
  }
  ```

### 8. Frontend-Testing mit Jest und React Testing Library

Automatisierte Tests für React-Komponenten schreiben:
- Abhängigkeiten installieren:
  ```bash
  npm install --save-dev jest @testing-library/react @testing-library/jest-dom
  ```
- Beispieltest für den RoleSelector:
  ```tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import RoleSelector from '../components/RoleSelector';

  test('RoleSelector ändert Rolle', () => {
    const setRole = jest.fn();
    render(<RoleSelector role="player" setRole={setRole} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'gm' } });
    expect(setRole).toHaveBeenCalledWith('gm');
  });
  ```
- Tests ausführen:
  ```bash
  npm test
  ```

### 9. Backend-Deployment mit Gunicorn (Linux/Produktiv)

Für den Produktivbetrieb Gunicorn und einen Prozessmanager verwenden:
```bash
pip install gunicorn
export FLASK_APP=app:app
export FLASK_ENV=production
# Mit 4 Workern starten
exec gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 10. Nutzung von Umgebungsvariablen für Konfiguration

Sensible Daten und Konfiguration in `.env`-Dateien speichern und per `os.environ` in Python bzw. `process.env` in Node.js auslesen. Beispiel:
- `.env`:
  ```env
  OPENAI_API_KEY=sk-...
  FRONTEND_URL=http://localhost:3000
  ```
- `app.py`:
  ```python
  import os
  OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
  ```
- `next.config.js`:
  ```js
  module.exports = {
    env: {
      FRONTEND_URL: process.env.FRONTEND_URL,
    },
  };
  ```

### 11. Fehlerbehandlung im API-Design

- Backend-Endpunkte liefern strukturierte Fehlermeldungen mit den Feldern `error`, `type` und `details`
- Beispiel-Fehlerantwort von `/api/llm`:
  ```json
  {
    "error": "Upstream API error",
    "type": "http",
    "details": "401 Unauthorized: Invalid API key"
  }
  ```
- Im Frontend immer auf das Feld `error` in API-Antworten prüfen und benutzerfreundliche Meldungen anzeigen

---

### 1. End-to-End-Tests ausführen

Das bereitgestellte PowerShell-Skript testet die vollständige Backend-API:

```powershell
# Alle automatisierten Tests ausführen
powershell -ExecutionPolicy Bypass -File test_all.ps1
```

Dieses Skript führt durch:
- Erstellen und Beitreten einer Sitzung als GM und Spieler
- Setzen und Abrufen der Szenenzusammenfassung
- Hinzufügen, Aktualisieren, Auflisten und Löschen von Entitäten
- Testen des LLM-Streaming-Endpunkts

### 2. Direkte API-Nutzung

#### Sitzung erstellen

```bash
curl -X POST http://127.0.0.1:5000/api/session -H "Content-Type: application/json" -d '{}'
```

#### Sitzung beitreten

```bash
curl -X POST http://127.0.0.1:5000/api/session/demo-session/join \
    -H "Content-Type: application/json" \
    -d '{"user_id":"gm-user", "role":"gm"}'
```

#### Szenenzusammenfassung setzen (nur GM)

```bash
curl -X POST http://127.0.0.1:5000/api/session/demo-session/scene \
    -H "Content-Type: application/json" \
    -d '{"summary":"Die regengetränkten Straßen glänzen im Neonlicht.", "user_id":"gm-user"}'
```

#### Entität hinzufügen (nur GM)

```bash
curl -X POST http://127.0.0.1:5000/api/session/demo-session/entities \
    -H "Content-Type: application/json" \
    -d '{"name":"Deckard", "type":"Runner", "status":"active", "user_id":"gm-user"}'
```

#### LLM-Chat streamen (SSE)

```bash
curl -N -X POST http://127.0.0.1:5000/api/llm \
    -H "Content-Type: application/json" \
    -d '{"model":"gpt-4", "messages":[{"role":"user","content":"Beschreibe die Szene."}]}'
```

### 3. Theme anpassen

Das Shadowrun Barren Theme kann einfach über `tailwind.config.js` und `src/styles/globals.css` angepasst werden. Beispiel für neue Akzentfarben:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        neon: '#39ff14',
        blood: '#ff1744',
      },
    },
  },
}
```

### 4. Eigene Befehle hinzufügen

Um einen neuen Befehl (z.B. `/roll` für Würfelwürfe) hinzuzufügen:

- **Backend:** Neue Route und Handler in `app.py` hinzufügen.
- **Frontend:** Befehlsparser im Terminal-Komponenten-Logik anpassen (bald verfügbar).

### 5. Authentifizierung integrieren

Das Projekt ist für Clerk-Integration vorbereitet. Um Authentifizierung zu aktivieren:

- Clerk einrichten und Publishable/Secret Keys in `.env.local` eintragen.
- Platzhalterlogik im Frontend durch Clerk-Hooks/Komponenten ersetzen.
- Clerk-Benutzer-IDs für Sitzungs- und Rollenverwaltung verwenden.

### 6. Deployment in Produktion

- **Backend:** Mit WSGI-Server (z.B. Gunicorn) betreiben und Umgebungsvariablen sicher konfigurieren.
- **Frontend:** Deployment auf Vercel, Netlify oder anderen Static Hosts.
- **Sicherheit:** HTTPS aktivieren, CORS konfigurieren und API-Keys schützen.

---


### Backend-Setup

1. **Abhängigkeiten installieren:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Umgebungsvariablen konfigurieren:**
   - Erstellen Sie eine `.env`-Datei mit Ihren API-Keys:
     ```
     OPENAI_API_KEY=dein-key
     DEEPSEEK_API_KEY=dein-key
     ANTHROPIC_API_KEY=dein-key
     MISTRAL_API_KEY=dein-key
     ```
3. **Backend starten:**
   ```bash
   python app.py
   ```
   Das Backend läuft unter `http://127.0.0.1:5000`.

4. **Endpunkte testen:**
   - Verwenden Sie `test_all.ps1` für automatisierte Tests (Windows/PowerShell).

### Frontend-Setup

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   # oder
   yarn
   ```
2. **Frontend starten:**
   ```bash
   npm run dev
   # oder
   yarn dev
   ```
   Die App ist unter `http://localhost:3000` (oder nächstfreiem Port) erreichbar.

3. **Konfiguration:**
   - Das Frontend erwartet das Backend unter `http://127.0.0.1:5000`.
   - Passen Sie API-Basis-URLs in `src/pages/index.tsx` an oder verwenden Sie Umgebungsvariablen.

---

## API-Referenz

### Health Check

**GET** `/api/ping`
- Antwort: `{ "status": "ok", "message": "Shadowrun backend is alive." }`

---

### Sitzungsverwaltung

**POST** `/api/session`
- Neue Sitzung erstellen.
- **Request JSON:**
  ```json
  { "name": "Sitzungsname", "gm_user_id": "gm-benutzer-id" }
  ```
- **Antwort:**
  ```json
  { "session_id": "...", "name": "Sitzungsname", "gm_user_id": "gm-benutzer-id" }
  ```
- **Fehler:** `{ "error": "Missing required fields" }` (400)

**POST** `/api/session/<session_id>/join`
- Sitzung beitreten als Benutzer/Rolle.
- **Request JSON:**
  ```json
  { "user_id": "benutzer-id", "role": "player|gm|observer" }
  ```
- **Antwort:**
  ```json
  { "session_id": "...", "user_id": "benutzer-id", "role": "player" }
  ```
- **Fehler:** `{ "error": "Missing user_id" }` (400)

**GET** `/api/session/<session_id>/users`
- Listet Benutzer/Rollen einer Sitzung auf.
- **Antwort:**
  ```json
  [ { "user_id": "benutzer-id", "role": "player" }, ... ]
  ```

---

### Szenenverwaltung

**POST** `/api/session/<session_id>/scene`
- Szenenzusammenfassung setzen/aktualisieren (nur GM).
- **Request JSON:**
  ```json
  { "summary": "Die regengetränkten Straßen...", "user_id": "gm-benutzer-id" }
  ```
- **Antwort:**
  ```json
  { "session_id": "...", "summary": "Die regengetränkten Straßen..." }
  ```
- **Fehler:** `{ "error": "Only GM can update scene." }` (403)

**GET** `/api/session/<session_id>/scene`
- Aktuelle Szenenzusammenfassung abrufen.
- **Antwort:**
  ```json
  { "session_id": "...", "summary": "Die regengetränkten Straßen..." }
  ```

---

### Entitätenverwaltung

**POST** `/api/session/<session_id>/entities`
- Entität hinzufügen/aktualisieren (nur GM).
- **Request JSON (hinzufügen):**
  ```json
  { "name": "Deckard", "type": "Runner", "status": "active", "extra_data": {"edge":3}, "user_id": "gm-benutzer-id" }
  ```
- **Request JSON (aktualisieren):**
  ```json
  { "id": 1, "name": "Deckard", "type": "Runner", "status": "marked", "extra_data": {"edge":2}, "user_id": "gm-benutzer-id" }
  ```
- **Antwort:**
  ```json
  { "id": 1, "name": "Deckard", "type": "Runner", "status": "active", "extra_data": {"edge":3} }
  ```
- **Fehler:** `{ "error": "Only GM can modify entities." }` (403)

**GET** `/api/session/<session_id>/entities`
- Listet alle Entitäten der Sitzung auf.
- **Antwort:**
  ```json
  [ { "id": 1, "name": "Deckard", "type": "Runner", "status": "active", "extra_data": {"edge":3} }, ... ]
  ```

**DELETE** `/api/session/<session_id>/entities/<entity_id>`
- Entität löschen (nur GM).
- **Request JSON:**
  ```json
  { "user_id": "gm-benutzer-id" }
  ```
- **Antwort:**
  ```json
  { "status": "deleted" }
  ```
- **Fehler:** `{ "error": "Only GM can delete entities." }` (403), `{ "error": "Entity not found." }` (404)

---

### Command Routing (LLM-Integration)

**POST** `/api/command`
- Befehl an das LLM routen und Antwort erhalten.
- **Request JSON:**
  ```json
  { "command": "/roll 2d6", "session_id": "...", "user_id": "...", "model": "openai|anthropic|mistral|deepseek|openrouter", "model_name": "gpt-4o|..." }
  ```
- **Antwort:**
  ```json
  { "status": "success", "command": "/roll 2d6", "llm_response": "Du hast eine 7 gewürfelt." }
  ```
- **Fehler:** `{ "status": "error", "error": "..." }` (500)

---

### LLM-Streaming (AI-Chat)

**POST** `/api/llm`
- LLM (AI) Chat-Antworten via Server-Sent Events (SSE) streamen.
- **Request JSON:**
  ```json
  { "session_id": "...", "user_id": "...", "input": "Szene beschreiben.", "model": "openai|anthropic|mistral|deepseek|openrouter", "model_name": "gpt-4o|..." }
  ```
- **Antwort:**
  - SSE-Stream von JSON-Zeilen, z.B.:
    ```
    data: {"speaker": "AI", "content": "Die Gasse leuchtet im Neon..."}
    ```
  - Bei Fehlern:
    ```
    data: {"error": "Upstream API error", "type": "http", "details": "401 Unauthorized: Invalid API key"}
    ```
- **Hinweis:** Immer auf das Feld `error` in gestreamten Daten prüfen.

---


### Sitzungsverwaltung

- `POST /api/session`  
  Neue Sitzung erstellen.

- `POST /api/session/<session_id>/join`  
  Sitzung mit Benutzer-ID und Rolle beitreten.

### Szenenverwaltung

- `GET /api/session/<session_id>/scene`  
  Aktuelle Szenenzusammenfassung abrufen.

- `POST /api/session/<session_id>/scene`  
  Szenenzusammenfassung aktualisieren (nur GM).

### Entitätenverwaltung

- `GET /api/session/<session_id>/entities`  
  Alle Entitäten der Sitzung auflisten.

- `POST /api/session/<session_id>/entities`  
  Entität hinzufügen oder aktualisieren (nur GM).

- `DELETE /api/session/<session_id>/entities/<entity_id>`  
  Entität löschen (nur GM).

### LLM-Streaming

- `POST /api/llm`  
  KI-Chat-Antworten streamen (SSE).

**Siehe Backend-Code und `test_all.ps1` für Details zu Nutzungsbeispielen und Payloads.**

---

## Projektstruktur

```
shadowrun-backend/
  app.py                # Flask-App und API-Endpunkte
  llm_utils.py          # LLM-Streaming-Logik
  models.py             # SQLAlchemy-Modelle
  test_all.ps1          # Automatisiertes PowerShell-Testskript
  requirements.txt      # Python-Abhängigkeiten

shadowrun-interface/
  src/
    hooks/              # React-Hooks (useScene, useEntities, useLLMStream)
    components/         # UI-Komponenten (Terminal, SceneSummary, EntityTracker)
    pages/              # Next.js-Seiten (index.tsx, etc.)
    styles/             # Tailwind/Globale Styles
    version.ts          # Versionsinformation
  tailwind.config.js    # Tailwind-Konfiguration
  postcss.config.js     # PostCSS-Konfiguration
  CHANGELOG.md          # Englisches Änderungsprotokoll
  CHANGELOG.de.md       # Deutsches Änderungsprotokoll
  README.md             # Englische Dokumentation
  README.de.md          # Deutsche Dokumentation
```

---

## Theme

- Verwendet Tailwind CSS für schnelles Styling und Anpassungen.
- Shadowrun Barren Theme:  
  - `bg-black` Hintergrund  
  - `text-green-200/400/500/700` für Neon-/Cyberpunk-Akzente  
  - Terminal-Schriftarten und rote Highlights für Warnungen und GM-Aktionen.
- Einfach erweiterbar für eigene Overlays und Themes.

---

## Versionierung & Änderungsprotokoll

- Aktuelle Version: **v.65a**
- Alle Änderungen werden in [CHANGELOG.md](./CHANGELOG.md) (Englisch) und [CHANGELOG.de.md](./CHANGELOG.de.md) (Deutsch) dokumentiert.
- Version wird in der UI angezeigt und in `src/version.ts` gepflegt.

---

## Roadmap

- [ ] Chat/Terminal-Komponente mit LLM-Streaming und Befehlseingabe
- [ ] Erweiterte Befehlsverarbeitung: `/scene`, `/roll`, `/summon`, `/echo`, `/mark`, `/meta`, `/recall`, `/pulse`
- [ ] Shadowrun-Würfelroller mit Glitch-Logik
- [ ] Private Nachrichten (`/whisper`)
- [ ] Sitzungsprotokolle und Replay
- [ ] Clerk-Authentifizierung und persistente Benutzerverwaltung
- [ ] Produktiv-Deployment (WSGI, Sicherheitshärtung)
- [ ] Internationalisierung (i18n) für UI und Dokumentation

---

## Mitwirken

Beiträge sind willkommen! Bitte eröffnen Sie Issues oder senden Sie Pull Requests für neue Features, Bugfixes oder Dokumentationsverbesserungen.

- Halten Sie sich an die Code-Style-Guidelines (PEP8 für Python, ESLint/Prettier für JS/TS).
- Schreiben Sie klare Commit-Messages und aktualisieren Sie das Änderungsprotokoll bei wesentlichen Änderungen.
- Für größere Features bitte zuerst im Issue diskutieren.

---

## Lizenz

Copyright © 2025 Forest Within Therapeutic Services Professional Corporation

Lizenziert unter der MIT-Lizenz. Siehe [LICENSE](./LICENSE) für Details.

---

## Kontakt

Für Fragen, Support oder Zusammenarbeit kontaktieren Sie bitte:

- Projektleitung: Forest Within Therapeutic Services Professional Corporation
- E-Mail: [morgan@forestwithintherapy.com](mailto:morgan@forestwithintherapy.com)

---
