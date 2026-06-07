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

## 🔒 Sécurité et Clé Secrète Django

Pour des raisons de sécurité, la clé secrète de Django (`SECRET_KEY`) et le mode `DEBUG` sont externalisés via des variables d'environnement.

### 🔑 Génération d'une nouvelle clé secrète (Initialisation)
Lors de l'installation du projet en production ou pour un nouvel environnement de développement, vous devez générer une clé secrète unique et sécurisée. Exécutez la commande suivante dans votre terminal :
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### ⚙️ Configuration
- **Développement** : Les variables sont déjà préconfigurées avec des valeurs par défaut dans le fichier [docker-compose.yml](file:///c:/Users/lougi/Dev/cezizen/docker-compose.yml).
- **Production (VM)** : Vous devez créer un fichier `.env` à la racine du projet sur votre VM et y ajouter les variables suivantes :
  ```env
  SECRET_KEY=votre_cle_secrete_generee_precedemment
  DEBUG=False
  ```
  Le fichier [docker-compose.yml](file:///c:/Users/lougi/Dev/cezizen/.tools/docker-compose.yml) du dossier `.tools` chargera automatiquement ces variables.

---

## ☁️ Déploiement sur une Machine Virtuelle (VM)

Le déploiement sur la VM de production est basé sur un **modèle tiré (pull-based)**. C'est la machine virtuelle qui initie la récupération des mises à jour depuis GitHub, évitant ainsi d'avoir à ouvrir le port SSH de la VM vers l'extérieur (meilleure sécurité).

### Processus de Déploiement (VM de Production)

Lors du déploiement, la machine virtuelle effectue les étapes suivantes :
1. Se positionner dans le dossier du projet.
2. Récupérer les dernières modifications de la branche principale (`main`).
3. Reconstruire et redémarrer les conteneurs Docker en arrière-plan.
4. Appliquer les nouvelles migrations sur la base PostgreSQL.
5. Collecter les fichiers statiques de Django.

#### Script de Déploiement Automatique (`deploy.sh`)

Vous pouvez créer un script `deploy.sh` sur votre VM pour automatiser ce processus. 
*Note : Assurez-vous d'avoir configuré le fichier `.env` comme indiqué dans la section précédente.*

```bash
#!/bin/bash
set -e

echo "=== Début du déploiement ==="

# 1. Aller dans le dossier du projet
cd /chemin/vers/votre/projet/cezizen

# 2. Mettre à jour le code
git checkout main
git pull origin main

# 3. Recréer et redémarrer la stack Docker (utilise la configuration de déploiement)
docker compose -f .tools/docker-compose.yml down
docker compose -f .tools/docker-compose.yml up -d --build

# 4. Appliquer les migrations de base de données
docker compose -f .tools/docker-compose.yml exec -T backend python manage.py migrate

# 5. Collecter les fichiers statiques
docker compose -f .tools/docker-compose.yml exec -T backend python manage.py collectstatic --noinput

# 6. Nettoyer les anciennes images Docker non utilisées
docker image prune -f

echo "=== Déploiement terminé avec succès ! ==="
```

Rendez le script exécutable :
```bash
chmod +x deploy.sh
```

Puis lancez le déploiement manuellement avec `./deploy.sh` ou configurez une tâche planifiée (Cron job) sur la VM pour l'exécuter périodiquement.

---

## 🤖 CI/CD - Workflows GitHub Actions

Le projet intègre des pipelines automatiques d'intégration continue (CI) et de notification de livraison (CD) sous GitHub Actions.

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

### 2. Veille de Sécurité Automatisée
Le projet intègre **Dependabot** (`.github/dependabot.yml`) qui vérifie chaque semaine si de nouvelles mises à jour de sécurité sont disponibles pour vos dépendances Python (`pip`) et Angular (`npm`), puis ouvre des Pull Requests automatiques en cas de vulnérabilité détectée.

### 3. Notification de Déploiement (CD)
Le fichier `.github/workflows/cd-prod.yml` envoie une notification de disponibilité des mises à jour à chaque push sur la branche `main` pour signaler à la VM de lancer son processus de récupération (`pull`).

---

## 📋 Gestion des Anomalies et Évolutions (Ticketing)

Conformément aux exigences du Ministère, un système de gestion des tickets est configuré directement dans l'outil de versioning GitHub :

### 1. Modèles de Tickets (Issue Templates)
Dans le dossier `.github/ISSUE_TEMPLATE`, deux modèles de tickets prédéfinis sont disponibles pour structurer les échanges :
- **Signalement d'anomalie** : Permet de qualifier précisément les anomalies en renseignant le comportement attendu, les étapes de reproduction et le **niveau de gravité** (Incident Bloquant Critique/Fort, Incident Majeur, Incident Mineur) conformément à la grille d'évaluation du Ministère.
- **Demande d'évolution** : Permet de formuler les propositions d'améliorations et de nouvelles fonctionnalités de manière standardisée.

### 2. Organisation Kanban
Les tickets sont pilotés visuellement à l'aide d'un tableau Kanban **GitHub Projects** configuré avec les colonnes :
`À faire` ➡️ `En cours` ➡️ `En revue` ➡️ `Terminé`.
Ce tableau Kanban sert de démonstration de gestion agile des anomalies et évolutions lors de la soutenance.
