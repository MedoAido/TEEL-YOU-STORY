# TEEL-YOU-STORY (T.Y.S)

Plateforme qui met en relation prestataires itinérants et utilisateurs, avec un fil
d'actualité positif (pas de commentaire négatif). Le dépôt contient le prototype frontend et
les fondations du backend.

## Démarrage rapide

Le frontend est maintenant branché sur le backend (fini le circuit fermé) — il faut donc
lancer les deux :

```bash
cd backend
node src/seed.js     # crée la base et les comptes de démo
node src/server.js   # démarre l'API sur http://localhost:4000
```

Puis ouvrir `frontend/index.html` dans un navigateur (double-clic, ou servi par Vercel).
Le frontend appelle `http://localhost:4000/api/...` — sans backend qui tourne en local,
la connexion et le fil d'actualité échoueront avec un message d'erreur explicite.

Comptes de démo (mot de passe `demo1234`) : `contact@busenergie.example` (Bus'Énergie),
`marie@busenergie.example` (Marie D.), `julien@busenergie.example` (Julien P.),
`bernard@example.com` (Famille Bernard, client).

## `frontend/index.html`

Le prototype de l'application — une seule page HTML/CSS/JS (aucune dépendance de build).
Contient : écran de connexion (professionnelle / utilisateur), fil d'actualité façon Insta
avec partage de photo, recherche/annuaire de prestataires, profils individuels dynamiques,
messagerie fonctionnelle, activité/notifications, et inscription prestataire (crée un vrai
compte via l'API).

Branché sur le backend : connexion/inscription, fil de publications, réactions, annuaire des
prestataires, profils et messagerie passent tous par de vrais appels `fetch()` vers l'API,
avec le token de session stocké en `sessionStorage`. Deux choses restent volontairement
côté frontend uniquement, faute d'équivalent côté API : les notifications d'activité (mock)
et la case "Réservations/Favoris" du profil utilisateur.

## `backend/`

L'API T.Y.S — Node.js pur (aucune dépendance externe, voir `backend/README.md` pour le détail
et la référence complète des routes). Gère l'inscription/connexion avec distinction
professionnel/utilisateur, les profils prestataires, les publications, les réactions
positives et la messagerie.

## Déploiement

`vercel.json` pointe Vercel vers `frontend/` (`outputDirectory`) pour servir le prototype à
la racine. Le backend n'est pas déployé (c'est un serveur Node.js à process long, pas une
fonction serverless) — en production, seul le frontend statique est en ligne, et il a besoin
d'un backend accessible pour fonctionner pleinement.
