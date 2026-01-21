# L'Atelier - Tennis API (NestJS)

API simple pour retourner des joueurs de tennis et des statistiques.

## Prerequis
- Node.js 18+
- npm ou yarn

## Installation (npm)
```bash
npm install
```

## Installation (yarn)
```bash
yarn install
```

## Lancer en dev (npm)
```bash
npm run start:dev
```
L'API tourne sur `http://localhost:3000`.

## Lancer en dev (yarn)
```bash
yarn start:dev
```

## Lancer avec Docker
```bash
docker build -t latelier-tennis-api .
docker run --rm -p 3000:3000 latelier-tennis-api
```

## Endpoints
- `GET /players` : liste des joueurs du meilleur au moins bon (tri par `data.rank`), avec pagination et filtre `sex`.
- `GET /players/:id` : details d'un joueur.
- `GET /players/statistics` : statistiques globales.
- `POST /players` : ajout d'un joueur.

## Tester l'API (exemples curl)
Liste paginée + filtre:
```bash
curl "http://localhost:3000/players?page=1&limit=10&sex=F"
```

Détails d'un joueur:
```bash
curl "http://localhost:3000/players/52"
```

Statistiques:
```bash
curl "http://localhost:3000/players/statistics"
```

Ajout d'un joueur:
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

```bash
yarn test
```

## Notes
- Les donnees sont en memoire. Un redemarrage reinitialise la liste.
