# Guide d'Installation et de Démarrage Local - CesiZen 🧘‍♂️

Ce document décrit la procédure étape par étape pour installer, configurer et exécuter l'environnement de développement de CesiZen en local à l'aide de **Docker Compose**.

---

## 🛠️ Prérequis

Assurez-vous d'avoir installé sur votre machine :
1. **Docker** et **Docker Compose**
2. **Git**
3. **Node.js** & **npm** (optionnel, uniquement pour les développements hors conteneur)
4. **Python 3.13+** et **uv** (optionnel, pour exécuter des scripts Python ou des linters localement)

---

## 🚀 Démarrage Local (Docker Compose)

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

---

## 💾 Configuration de la Base de Données PostgreSQL

Le backend Django est configuré pour détecter automatiquement l'environnement. Dans le fichier `settings.py`, Django utilise par défaut PostgreSQL s'il trouve les variables d'environnement appropriées (configurées dans `docker-compose.yml`) :

- `USE_POSTGRES` : Activé par défaut (`True`). Si défini sur `False`, le projet basculera automatiquement sur une base **SQLite** locale (`db.sqlite3`).
- `POSTGRES_DB` : Nom de la base de données (ex: `cesi_zen`)
- `POSTGRES_USER` : Utilisateur de la base de données (ex: `postgres`)
- `POSTGRES_PASSWORD` : Mot de passe de la base de données (ex: `cesi_zen_password`)
- `POSTGRES_HOST` : Hôte de la base de données (`db` dans docker-compose)
- `POSTGRES_PORT` : Port (`5432`)

### 🗄️ Gestion de la Base de Données (Commandes Utiles)

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

## 🔒 Sécurité et Clé Secrète Django

Pour des raisons de sécurité, la clé secrète de Django (`SECRET_KEY`) et le mode `DEBUG` sont externalisés via des variables d'environnement.

### 🔑 Génération d'une nouvelle clé secrète (Initialisation)
Lors de l'installation du projet en production ou pour un nouvel environnement de développement, vous devez générer une clé secrète unique et sécurisée. Exécutez la commande suivante dans votre terminal :
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### ⚙️ Configuration
- **Développement** : Les variables sont déjà préconfigurées avec des valeurs par défaut dans le fichier [docker-compose.yml](../docker-compose.yml).
- **Production (VM)** : Vous devez créer un fichier `.env` à la racine du projet sur votre VM et y ajouter les variables suivantes :
  ```env
  SECRET_KEY=votre_cle_secrete_generee_precedemment
  DEBUG=False
  ```
  Le fichier `.env` de production est chargé automatiquement par la stack Docker.
