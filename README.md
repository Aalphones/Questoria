# EduQuest

Story-basierte Lernplattform: bekannte Fandom-Welten (One Piece, Miraculous,
...) werden zu Lernspielen. Kinder erkunden eine Themenwelt über eine
Timeline aus Episoden, erleben Dialoge zwischen den Charakteren und lösen
dazwischen Minispiele, die Schulstoff abfragen — pro Welt datengetrieben
skaliert über mehrere Lernstufen.

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
