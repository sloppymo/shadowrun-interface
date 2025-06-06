# Änderungsprotokoll

## v.65a (2025-06-04)
### Backend
- Umstellung auf Python Flask Backend für Kompatibilität mit Python 3.13
- Persistente Modelle für Session, Szene und Entität mit SQLite implementiert
- Robuste API-Endpunkte für Sitzungsverwaltung, Szenenzusammenfassung und Entitäten-CRUD (Erstellen, Lesen, Aktualisieren, Löschen)
- OpenAI LLM Streaming-Endpunkt mit httpx (async, SSE-Muster) integriert
- Rollenbasierte Berechtigungen: Nur GMs können Szene/Entitäten bearbeiten
- Verbesserte Fehlerbehandlung für LLM-Streaming und alle Endpunkte
- Umfassende PowerShell-Testskripte für End-to-End-Backend-Überprüfung hinzugefügt

### Frontend
- Minimale React/Next.js-Oberfläche für Shadowrun Multiplayer Engine erstellt
- Rollenauswahl (Spieler, GM, Beobachter) mit lokalem Zustand
- Szenenzusammenfassung-Overlay: für alle sichtbar, von GM bearbeitbar
- Aktiver Entitäten-Tracker: listet alle Entitäten der Sitzung auf
- Shadowrun Barren-Theme: dunkler Hintergrund, neongrüner Prompt, rote Akzente, Terminal-Schriftart
- Copyright-Fußzeile und Versionsanzeige
- Willkommensnachricht auf "welcome back, anon" aktualisiert

### Projektstruktur & Tools
- Modularisiertes Frontend mit Hooks- und Komponentenverzeichnissen
- Platzhalterdateien für zukünftige Features (Chat/Terminal, Overlays)
- CHANGELOG.de.md und src/version.ts für Versionstracking

### Bekannte Probleme / Nächste Schritte
- Chat/Terminal (LLM-Streaming-UI) noch nicht implementiert
- Keine Authentifizierung oder echte Sitzungs-/Benutzerlogik im Frontend
- Würfelroller, private Nachrichten und Logs werden in zukünftigen Versionen hinzugefügt
