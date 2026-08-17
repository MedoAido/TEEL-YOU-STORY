# T.Y.S — Backend (fondations)

API pour la plateforme T.Y.S : mise en relation prestataires/clients + fil de publications
positif (sans commentaire négatif). Pensée pour brancher directement le prototype front-end
`index.html` livré séparément.

## Pourquoi zéro dépendance externe ?

Ce starter a été généré dans un environnement où le registre npm n'était pas accessible au
moment de la construction. Plutôt que de livrer un projet qui ne démarre pas, il repose
uniquement sur les modules natifs de Node.js :

- **`node:sqlite`** (`DatabaseSync`) pour la base de données — disponible nativement depuis
  Node.js 22.5, encore marqué expérimental (avertissement inoffensif au démarrage).
- **`http`** natif pour le serveur, avec un petit routeur maison (voir `src/server.js`), à la
  place d'Express.
- **`crypto`** natif pour le hachage des mots de passe (`scrypt`) et la génération des jetons
  de session.

Le code est volontairement structuré comme avec Express (une fonction par route, middlewares
d'authentification isolés) : remplacer le routeur maison par Express, ou `node:sqlite` par
Prisma/Postgres, est un refactor localisé, pas une réécriture.

## Démarrage

```bash
node src/seed.js     # crée data/tys.db et insère les données de démonstration
node src/server.js   # démarre l'API sur http://localhost:4000
```

Comptes de démonstration (mot de passe `demo1234`) :

| Email | Rôle |
|---|---|
| contact@busenergie.example | prestataire (Bus'Énergie) |
| marie@busenergie.example | prestataire (Marie D.) |
| julien@busenergie.example | prestataire (Julien P.) |
| bernard@example.com | client (Famille Bernard) |

## Authentification

Toutes les routes protégées attendent l'en-tête :
`Authorization: Bearer <token>` (jeton renvoyé par `/api/auth/register` ou `/api/auth/login`).

## Référence des routes

### Comptes

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | non | `{ name, email, password, role }` — `role` = `prestataire` ou `client` |
| POST | `/api/auth/login` | non | `{ email, password }` |
| GET | `/api/me` | oui | Profil du compte connecté |
| PUT | `/api/me/profile` | oui (prestataire) | Met à jour son profil prestataire |

### Prestataires

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/providers` | non | Liste des prestataires (annuaire) |
| GET | `/api/providers/:id` | non | Profil détaillé + ses publications |

### Publications (fil d'actualité)

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | non | Fil d'actualité, 100 dernières publications |
| POST | `/api/posts` | oui | `{ caption, photoUrl?, tags? }` |
| POST | `/api/posts/:id/react` | oui | `{ type }` — `soutien`, `merci` ou `coup_de_coeur` (bascule : réagir à nouveau retire la réaction — pas de bouton "dislike" ni de commentaire négatif, par design) |

### Messagerie

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/conversations` | oui | Conversations du compte connecté |
| POST | `/api/conversations` | oui | `{ withUserId }` — récupère ou crée la conversation |
| GET | `/api/conversations/:id/messages` | oui | Historique des messages |
| POST | `/api/conversations/:id/messages` | oui | `{ text }` |

### Divers

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/health` | Vérification que le serveur répond |

## Modèle de données (`src/db.js`)

`users` · `provider_profiles` (1-1 avec un `user` de rôle `prestataire`) · `posts` ·
`reactions` (une ligne par type de réaction et par utilisateur, contrainte `UNIQUE`) ·
`conversations` (une par paire d'utilisateurs) · `messages` · `sessions` (jetons d'authentification).

## Prochaines étapes suggérées pour un développeur qui reprend ce socle

1. **Validation d'entrée** plus stricte (email, longueur mot de passe) — actuellement minimale.
2. **Pagination** sur `/api/posts` et `/api/providers` avant une mise en production.
3. **Upload de photo réel** (`photoUrl` accepte aujourd'hui n'importe quelle chaîne, y compris
   une `data:` URL comme dans le prototype front-end — prévoir un stockage objet, ex. S3).
4. **Expiration des sessions** (les jetons n'expirent pas actuellement).
5. Basculer vers **Express + un ORM** (Prisma, Drizzle) si l'équipe préfère cet écosystème —
   la structure des routes ci-dessus se transpose presque telle quelle.
