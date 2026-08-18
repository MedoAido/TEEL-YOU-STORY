# TEEL-YOU-STORY (T.Y.S)

Plateforme qui met en relation prestataires itinérants et utilisateurs, avec un fil
d'actualité positif (pas de commentaire négatif). Le dépôt contient le prototype frontend et
les fondations du backend.

## `frontend/index.html`

Le prototype de l'application — une seule page HTML/CSS/JS autonome (aucune dépendance,
aucune installation nécessaire). Double-cliquer sur le fichier l'ouvre dans un navigateur.

Contient : écran de connexion (professionnelle / utilisateur), fil d'actualité façon Insta
avec partage de photo, recherche/annuaire de prestataires, profils individuels dynamiques,
messagerie fonctionnelle, activité/notifications, et formulaire d'inscription prestataire.

**Important : ce prototype fonctionne actuellement en circuit fermé.** Toutes les données
(comptes, publications, messages) sont stockées en mémoire dans le navigateur via des
variables JavaScript — rien n'est envoyé au backend pour le moment. C'est voulu pour un
prototype qu'on peut ouvrir n'importe où sans rien installer, mais ça veut dire que rafraîchir
la page réinitialise tout, et que le frontend et le backend ne se parlent pas encore.

## `backend/`

L'API T.Y.S — Node.js pur (aucune dépendance externe, voir `backend/README.md` pour le détail
et la référence complète des routes). Démarrage :

```bash
cd backend
node src/seed.js     # crée la base et les comptes de démo
node src/server.js   # démarre l'API sur http://localhost:4000
```

Gère déjà : inscription/connexion avec distinction professionnel/utilisateur, profils
prestataires, publications, réactions positives, messagerie — soit toute la même logique que
le prototype frontend, mais côté serveur avec une vraie base de données.

## Prochaine étape naturelle : relier les deux

Le frontend et le backend ont été conçus en miroir (mêmes concepts : `providers`, `posts`,
`conversations`, rôles `prestataire`/`client`) mais ne sont pas encore branchés ensemble. Pour
les connecter, il faudrait dans `frontend/index.html` :

1. Remplacer les tableaux JS en mémoire (`posts`, `providers`, `conversations`, etc.) par des
   appels `fetch()` vers `http://localhost:4000/api/...`.
2. Stocker le `token` renvoyé par `/api/auth/login` (par exemple en variable JS ou
   `sessionStorage`).
3. Envoyer ce token dans l'en-tête `Authorization: Bearer <token>` de chaque requête protégée.
