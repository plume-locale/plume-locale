# Configuration de GitHub Pages pour le répertoire /live

## ✅ Workflow GitHub Actions créé

J'ai créé un workflow GitHub Actions qui déploiera automatiquement le contenu du répertoire [`live/`](live) sur GitHub Pages.

Le fichier [`.github/workflows/deploy-live.yml`](.github/workflows/deploy-live.yml) a été créé et poussé sur la branche `avant-refactor-todo`.

## 📋 Étapes pour activer GitHub Pages

Pour que votre site soit publié, vous devez activer GitHub Pages dans les paramètres de votre dépôt :

### 1. Accéder aux paramètres du dépôt

Allez sur : https://github.com/plume-locale/plume-locale/settings/pages

### 2. Configurer la source de déploiement

Dans la section **"Build and deployment"** :
- **Source** : Sélectionnez **"GitHub Actions"**

### 3. Déclencher le déploiement

Le workflow se déclenchera automatiquement :
- À chaque push sur la branche `avant-refactor-todo` qui modifie des fichiers dans [`live/`](live)
- Manuellement via l'onglet "Actions" de votre dépôt

Pour déclencher manuellement :
1. Allez sur : https://github.com/plume-locale/plume-locale/actions
2. Cliquez sur "Deploy Live to GitHub Pages" dans la liste des workflows
3. Cliquez sur "Run workflow" et sélectionnez la branche `avant-refactor-todo`

## 🌐 URL de votre site

Une fois le déploiement réussi, votre site sera accessible à :

**https://plume-locale.github.io/plume-locale/**

## 🔍 Vérifier le statut du déploiement

Vous pouvez suivre l'état du déploiement dans l'onglet Actions :
https://github.com/plume-locale/plume-locale/actions

## ⚙️ Fonctionnement du workflow

Le workflow [`deploy-live.yml`](.github/workflows/deploy-live.yml) :
1. Se déclenche sur les pushs vers `avant-refactor-todo` qui modifient [`live/`](live)
2. Récupère le code de la branche `avant-refactor-todo`
3. Configure GitHub Pages
4. Upload le contenu du répertoire [`live/`](live) comme artifact
5. Déploie l'artifact sur GitHub Pages

## 🛠️ Permissions requises

Le workflow nécessite les permissions suivantes (déjà configurées) :
- `contents: read` - Pour lire le contenu du dépôt
- `pages: write` - Pour écrire sur GitHub Pages
- `id-token: write` - Pour l'authentification

## 📝 Notes importantes

- Le déploiement ne se fera que depuis la branche `avant-refactor-todo`
- Seul le contenu du répertoire [`live/`](live) sera publié
- Le fichier [`live/index.html`](live/index.html) sera la page d'accueil de votre site
- Les modifications en dehors de [`live/`](live) ne déclencheront pas de redéploiement
