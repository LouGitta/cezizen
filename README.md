# CesiZen 🧘‍♂️

CesiZen est une application mobile et web de relaxation et de méditation (exercices de respiration, articles de blog, favoris) conçue avec un backend Django (REST Framework) et un frontend mobile Angular/Ionic.

---

## 🛠️ Architecture du Projet

Le projet est divisé en deux parties principales orchestrées par Docker Compose :
- **Backend** : Django REST Framework, configuré avec PostgreSQL comme base de données principale et un fallback automatique sur SQLite.
- **Frontend** : Application mobile Web Angular / Ionic.
- **Database** : PostgreSQL 16 (Alpine).

---

## 🚀 Installation et Démarrage Local

### Prérequis

Assurez-vous d'avoir installé sur votre machine :
1. **Docker** et **Docker Compose**
2. **Git**
3. **Node.js** & **npm** (optionnel, uniquement pour les développements hors conteneur)
4. **Python 3.13+** et **uv** (optionnel, pour exécuter des scripts Python localement)

### Lancement avec Docker Compose (Recommandé)

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/votre-compte/cezizen.git
   cd cezizen
   ```

2. **Démarrer les conteneurs** :
   Cette commande construit les images de développement pour le backend et le frontend, puis démarre la base de données PostgreSQL, l'API Django et l'application mobile.
   ```bash
   docker compose up --build
   ```

3. **Accéder aux services** :
   - **Backend API (Django)** : [http://localhost:8000](http://localhost:8000)
   - **Interface d'administration Django** : [http://localhost:8000/admin](http://localhost:8000/admin)
   - **Frontend App (Ionic/Angular)** : [http://localhost:8100](http://localhost:8100)

### Gestion de la Base de Données (Commandes Utiles)

Une fois les conteneurs démarrés, vous devez exécuter les migrations Django pour initialiser les tables de la base de données PostgreSQL :

* **Appliquer les migrations** :
  ```bash
  docker compose exec backend python manage.py migrate
  ```

* **Créer un Superutilisateur (Accès Admin)** :
  ```bash
  docker compose exec backend python manage.py createsuperuser
  ```

* **Créer de nouvelles migrations (si modification des modèles)** :
  ```bash
  docker compose exec backend python manage.py makemigrations
  ```

* **Vérifier l'état de santé du projet** :
  ```bash
  docker compose exec backend python manage.py check
  ```

---

## 💾 Configuration de la Base de Données PostgreSQL

Le backend Django est configuré pour détecter automatiquement l'environnement.
Dans le fichier `settings.py`, Django utilise par défaut PostgreSQL s'il trouve les variables d'environnement appropriées (configurées dans `docker-compose.yml`) :

- `USE_POSTGRES` : Activé par défaut (`True`). Si défini sur `False`, le projet basculera automatiquement sur une base **SQLite** locale (`db.sqlite3`).
- `POSTGRES_DB` : Nom de la base de données (ex: `cesi_zen`)
- `POSTGRES_USER` : Utilisateur de la base de données (ex: `postgres`)
- `POSTGRES_PASSWORD` : Mot de passe de la base de données (ex: `cesi_zen_password`)
- `POSTGRES_HOST` : Hôte de la base de données (`db` dans docker-compose)
- `POSTGRES_PORT` : Port (`5432`)

---

## ☁️ Déploiement sur une Machine Virtuelle (VM)

Le déploiement sur la VM de production repose sur un flux continu Git et Docker Compose.

### Processus de Déploiement (VM de Production)

Lors du déploiement, la machine virtuelle doit effectuer les étapes suivantes :
1. Se positionner dans le dossier du projet.
2. Récupérer les dernières modifications de la branche principale (`main`).
3. Reconstruire et redémarrer les conteneurs Docker en arrière-plan.
4. Appliquer les nouvelles migrations sur la base PostgreSQL.
5. Collecter les fichiers statiques de Django.

#### Script de Déploiement Automatique (`deploy.sh`)

Vous pouvez créer un script `deploy.sh` sur votre VM pour automatiser ce processus :

```bash
#!/bin/bash
set -e

echo "=== Début du déploiement ==="

# 1. Aller dans le dossier du projet
cd /chemin/vers/votre/projet/cezizen

# 2. Mettre à jour le code
git checkout main
git pull origin main

# 3. Recréer et redémarrer la stack Docker
docker compose down
docker compose up -d --build

# 4. Appliquer les migrations de base de données
docker compose exec -T backend python manage.py migrate

# 5. Collecter les fichiers statiques
docker compose exec -T backend python manage.py collectstatic --noinput

# 6. Nettoyer les anciennes images Docker non utilisées (facultatif mais recommandé)
docker image prune -f

echo "=== Déploiement terminé avec succès ! ==="
```

Rendez le script exécutable :
```bash
chmod +x deploy.sh
```

Puis exécutez-le simplement avec `./deploy.sh`.

---

## 🤖 CI/CD - Workflows GitHub Actions

Le projet intègre des pipelines automatiques d'intégration continue (CI) et de déploiement continu (CD).

### 1. Intégration Continue (CI)
- **CI Backend** : S'exécute à chaque push sur `main`, `develop` et `feature/*`. Il effectue :
  - Un scan de syntaxe et de formatage avec **Ruff**.
  - Un scan de sécurité des dépendances avec **Trivy**.
  - Le lancement automatique des tests unitaires (en forçant le fallback SQLite pour accélérer le runner CI sans base de données externe).
  - La validation de la construction de l'image de production.
- **CI Frontend** : S'exécute à chaque push sur les fichiers Angular/Ionic. Il effectue :
  - L'analyse de style de code avec **ESLint**.
  - Un scan de sécurité avec **Trivy**.
  - La validation de la compilation et du build de production Docker.

### 2. Déploiement Continu (CD)
Le fichier `.github/workflows/cd-prod.yml` automatise le déploiement sur votre VM à chaque push/merge sur la branche `main`.

#### Configuration des Secrets GitHub
Pour activer le déploiement automatique par SSH, vous devez configurer les **Secrets** suivants dans les paramètres de votre dépôt GitHub (`Settings > Secrets and variables > Actions`) :

| Nom du Secret | Description | Exemple |
| :--- | :--- | :--- |
| `VM_HOST` | Adresse IP publique ou nom d'hôte de la VM | `192.168.1.100` ou `my-vm.host.com` |
| `VM_USER` | Nom de l'utilisateur de connexion SSH sur la VM | `ubuntu` ou `debian` |
| `VM_SSH_KEY` | Contenu de la clé privée SSH autorisée sur la VM | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VM_PORT` | Port SSH de la VM (facultatif, par défaut 22) | `22` |
| `VM_PROJECT_PATH` | Chemin absolu du projet sur le disque de la VM | `/home/ubuntu/cezizen` |
