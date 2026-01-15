# L'Atelier - Tennis API (NestJS)

API simple pour retourner des joueurs de tennis et des statistiques.

## Prerequis
- Node.js 18+
- npm

## Installation
```bash
npm install
```

## Lancer en dev
```bash
npm run start:dev
```
L'API tourne sur `http://localhost:3000`.

## Endpoints
- `GET /players` : liste des joueurs du meilleur au moins bon (tri par `data.rank`).
- `GET /players/:id` : details d'un joueur.
- `GET /players/statistics` : statistiques globales.
- `POST /players` : ajout d'un joueur.

Exemple POST:
```bash
curl -X POST http://localhost:3000/players \
  -H 'Content-Type: application/json' \
  -d '{
    "id": 200,
    "firstname": "Test",
    "lastname": "Player",
    "shortname": "T.PLA",
    "sex": "M",
    "country": {
      "picture": "https://example.com/country.png",
      "code": "TST"
    },
    "picture": "https://example.com/player.png",
    "data": {
      "rank": 60,
      "points": 900,
      "weight": 77000,
      "height": 180,
      "age": 25,
      "last": [1, 0, 1, 1, 0]
    }
  }'
```

## Tests
```bash
npm test
```

## Notes
- Les donnees sont en memoire. Un redemarrage reinitialise la liste.
- L'IMC est calcule a partir de `weight` (grammes) et `height` (cm).
