# Architecture & choix techniques (L'Atelier – Tennis API)

Ce document décrit l’architecture de l’application et justifie les choix liés à la **traçabilité des requêtes** (Request ID), la **gestion centralisée des erreurs** (ErrorHandlerService + AllExceptionsFilter), la **validation des entrées** (DTO + ValidationPipe), l’**enveloppe de réponse** (ResponseEnvelopeInterceptor), la **pagination réutilisable**, et l’usage d’un **repository** (PlayersRepository).

---

## 1) Vue d’ensemble : pipeline d’une requête

L’application suit le pipeline NestJS :

1. **Middleware** (exécuté en premier)
2. **Pipes** (transformation + validation des entrées)
3. **Controllers** (routing HTTP)
4. **Services** (logique métier)
5. **Interceptors** (enveloppe de réponse)
6. En cas d’exception : **Exception Filters** (formatage de la réponse d’erreur)

NestJS précise l’ordre d’exécution des middlewares et la place des pipes et filters dans le cycle de vie de requête. 

Dans le projet :
- `RequestIdMiddleware` est appliqué globalement (`forRoutes('*')`) dans `AppModule`.
- Un `ValidationPipe` global est installé au bootstrap (`main.ts`) avec `transform: true`.
- Un `ResponseEnvelopeInterceptor` global enveloppe les réponses succès.
- Un `AllExceptionsFilter` global uniformise toutes les réponses d’erreur.

---

## 2) Traçabilité : `RequestIdMiddleware` + `RequestContextService`

### 2.1 Pourquoi un Request ID ?

Objectif : **corréler** une requête HTTP avec les logs correspondants, notamment en production (debug, incident, support). Le principe est de mettre un identifiant stable dès l’entrée de l’API et de le propager.

Deux options courantes :
- un header “de facto” comme `X-Request-ID` (très répandu)
- un standard interopérable de traçage distribué : **W3C Trace Context** (header `traceparent`)

Le projet utilise `X-Request-ID`, ce qui est cohérent pour une API simple, et compatible avec l’idée de corrélation (et évolutif vers `traceparent` si besoin). 

### 2.2 Ce que fait exactement le middleware

`RequestIdMiddleware` :
- lit `x-request-id` si le client l’envoie
- **normalise** (trim) et applique une limite de longueur (protection basique)
- sinon génère un identifiant (`randomUUID()`)
- l’attache à la requête (`request.requestId`) et le renvoie dans la réponse (`response.setHeader('x-request-id', ...)`)

Le rôle d’un middleware côté NestJS est précisément d’**exécuter du code**, et de **modifier l’objet request/response** avant d’atteindre les handlers, ce qui correspond bien à un mécanisme de corrélation.

### 2.3 Stockage de contexte : `RequestContextService` (AsyncLocalStorage)

Le projet ajoute un service `RequestContextService` basé sur `AsyncLocalStorage` afin de rendre le `requestId` accessible dans la profondeur du code (services, gestion d’erreurs), sans devoir le passer en paramètre partout.

Bénéfices :
- améliore la **lisibilité** du code métier
- facilite l’**enrichissement systématique** des logs et erreurs avec `requestId`

---

## 3) Gestion d’erreurs : `ErrorHandlerService` + `AllExceptionsFilter`

### 3.1 Objectif global

Avoir une stratégie uniforme :
- **ne pas exposer** de détails internes au client
- garder un format de réponse d’erreur stable
- journaliser avec suffisamment de contexte (requestId, action, metadata)
- distinguer erreurs attendues (4xx) vs inattendues (5xx)

NestJS fournit des **Exception Filters** pour capturer et personnaliser la gestion des exceptions.

### 3.2 `ErrorHandlerService` (log + re-throw sécurisé)

Le `ErrorHandlerService` encapsule la politique interne :
- génère un `errorId` unique (`randomUUID()`), utile côté support
- enrichit le contexte avec `requestId` (depuis la requête si fourni, sinon via `RequestContextService`)
- si `HttpException` :
  - si statut >= 500 : log en **error**, puis rethrow d’une `InternalServerErrorException` avec un message générique + `errorId`
  - si statut < 500 : log en **warn**, puis rethrow de l’exception (erreur attendue)
- sinon (erreur non HttpException) : log en **error**, puis `InternalServerErrorException` générique + `errorId`

Pourquoi séparer ça dans un service ?
- la politique est **centralisée** (pas de duplication de `try/catch` dispersés)
- la logique métier reste focalisée sur son domaine (players, stats)
- c’est plus testable : on peut tester le mapping “exception → comportement” indépendamment


### 3.3 `AllExceptionsFilter` (format de réponse homogène)

`AllExceptionsFilter` est un filter “catch-all” (`@Catch()` sans paramètre) qui :
- détecte si l’exception est une `HttpException`
- choisit le statut : celui de l’exception, sinon 500
- produit un payload JSON stable :
  - `statusCode`, `timestamp`, `path`, `method`
  - `message` (extrait depuis `getResponse()` pour `HttpException`)
  - `errorId` si présent
  - `requestId` si présent

Bénéfices :
- contrat d’erreur stable côté front / consommateurs
- debug facilité : un client peut remonter `requestId` et `errorId`
- pas de fuite de stacktrace vers le client

Ce pattern est aligné avec l’usage des exception filters NestJS pour intercepter et personnaliser les réponses d’erreur.

---

## 4) Validation des paramètres de requêtes

La validation est appliquée à deux niveaux :

### 4.1 Validation des paramètres de route (ex: `:id`)

Dans `PlayersController`, le paramètre `id` est validé/transformé avec `ParseIntPipe`:
- si `id` n’est pas un entier → Nest renvoie une erreur 400
- sinon il est injecté typé en `number`

Les **pipes** servent précisément à **transformer et valider** les entrées avant d’atteindre la logique applicative.

### 4.2 Validation du body (DTO + ValidationPipe global)

Un `ValidationPipe` global est configuré avec `transform: true`. Cela permet :
- conversion automatique via `class-transformer` (ex: `Type(() => Number)`)
- validation via `class-validator` (ex: `IsInt`, `IsPositive`, `ValidateNested`, etc.)

NestJS indique explicitement que `ValidationPipe` s’appuie sur **class-validator** et ses décorateurs, et fournit un moyen standard d’appliquer des règles de validation sur les payloads entrants.

Dans `CreatePlayerDto`, les règles couvrent :
- champs texte non vides (`firstname`, `lastname`, `shortname`)
- contraintes de domaine (`sex` ∈ {M, F})
- objets imbriqués validés (`country`, `data`) via `ValidateNested`
- règles numériques (`rank`, `weight`, `height`, `age`)
- format des données récentes (`last` = tableau non vide, valeurs ∈ {0,1})

Remarque : j'ai laissé `whitelist` et `forbidNonWhitelisted` commentés. Activer ces options est une amélioration facile si l’objectif est de rejeter strictement les champs inattendus (sécurité/contrat plus strict). Le mécanisme est documenté dans NestJS Validation. 

---

## 5) Envelope de réponse : `ResponseEnvelopeInterceptor`

Objectif : fournir un **contrat de réponse uniforme** pour les endpoints, en enveloppant les retours sous la forme :

```json
{
  "data": ...,
  "meta": ...
}
```

Le `ResponseEnvelopeInterceptor` :
- n’enveloppe pas une réponse déjà au format `{ data, meta }` (ex: listes paginées)
- enveloppe tout le reste en `{ data: <payload>, meta: null }`

Cela standardise l’interface côté client, tout en laissant les réponses paginées gérer leur `meta`.

---

## 6) Pagination réutilisable

La pagination est conçue comme un **outil transversal** :
- `PaginationQueryDto` (DTO global) pour valider `page`/`limit`
- `paginate<T>()` pour découper une collection et générer un `meta` uniforme
- types partagés (`Paginated<T>`, `PaginationMeta`)

Cette approche facilite la réutilisation pour d’autres endpoints et garantit une réponse cohérente entre les ressources.

---

## 7) Repository : `PlayersRepository`

Le repository isole l’accès aux données de la logique métier :
- `PlayersRepository` est une interface (contrat)
- `InMemoryPlayersRepository` est l’implémentation actuelle (JSON en mémoire)

Bénéfices :
- l’API métier (`PlayersService`) reste indépendante de la source de données
- un futur repository DB peut remplacer l’in-memory sans changer la logique

---

## 8) Choix orientés “production readiness”

### 5.1 Observabilité minimale
- `X-Request-ID` renvoyé au client
- `requestId` propagé en contexte (AsyncLocalStorage)
- erreurs 500 renvoyées avec `errorId` (support)

Le standard W3C Trace Context existe si l’application évolue vers un environnement microservices / tracing distribué.

### 5.2 Réponses d’erreur cohérentes
- format unique grâce au filter global
- séparation “client safe” / “log détaillé”

---

```
