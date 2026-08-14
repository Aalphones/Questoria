# Questoria

Datengetriebene Story-Engine: bekannte Fandom-Welten (One Piece, Miraculous,
...) werden zu spielbaren Lernabenteuern. Kinder erkunden eine Themenwelt über
eine Timeline aus Episoden. Jede Episode ist eine **Eventliste** — Dialog,
Erkundung, Rätsel, Belohnung, in der Reihenfolge, die die Geschichte verlangt.
Die Aufgaben skalieren datengetrieben über mehrere Lernstufen, Story und
Charaktere bleiben gleich.

Ein Kind startet Questoria nicht, um Aufgaben zu lösen, sondern weil es wissen
will, wie die Geschichte weitergeht.

**Die Architektur in einem Satz:** eine generische Spiel-Engine im Browser plus
austauschbare Content-Pakete. Das Angular-Frontend implementiert sämtliche
Spielmechaniken; die PHP-API liefert nur Daten und speichert den Spielstand.
Neue Abenteuer entstehen durch Content — JSON, Bilder, Ton — nicht durch
Backend-Code.

Technologische Basis: Angular (SPA) · PHP REST API · MySQL + JSON-Content-Repository.

## Quickstart

**Prerequisites:** Node.js LTS, PHP 8.2+, Composer, MySQL/MariaDB 10.x

```bash
# Frontend
cd frontend
npm install
npm start              # dev server

# Backend
cd backend
composer install
cp .env.example .env    # DB-Zugangsdaten eintragen
php -S localhost:8000 -t public
```

## Mehr Kontext

Für Architektur, Scope, Conventions und den Content-Format-Vertrag:
[AGENTS.md](AGENTS.md).
