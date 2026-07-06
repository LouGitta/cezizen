# Plan de Reprise d'Activité (PRA) Simplifié - CesiZen 🧘‍♂️

Ce document décrit la procédure étape par étape pour réinitialiser et relancer l'intégralité de la stack applicative CesiZen sur une nouvelle machine virtuelle (VM) à l'aide de **Docker** et **Make**.

---

## 📋 Prérequis de la VM cible
* Système d'exploitation : Ubuntu 22.04 LTS / 24.04 LTS / 26.04 LTS
* **RAM recommandée** : 4 Go à 8 Go. Si la VM dispose de peu de RAM (1 à 2 Go), **l'activation du SWAP est fortement conseillée** pour éviter les plantages dus à l'OOM Killer (Out Of Memory).

---

## 🛠️ Étape 1 : Initialisation de la VM (Docker, Make & Droits)

Dès la création de la VM, connectez-vous en SSH et exécutez ce bloc pour tout installer :

```bash
# 1. Mise à jour et installation de Docker, Docker Compose, Make et outils essentiels
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y docker.io docker-compose-v2 make build-essential

# 2. Ajout de l'utilisateur dev au groupe docker pour éviter d'utiliser sudo
sudo usermod -aG docker dev
newgrp docker
```
*Note : Si votre utilisateur SSH s'appelle autrement que `dev`, remplacez `dev` par votre nom d'utilisateur dans la commande `usermod`.*

### 🧠 Optionnel : Configuration du SWAP (Recommandé si RAM < 8 Go)
Si votre VM manque de RAM, cela évite que les processus Docker ou SSH ne se fassent tuer aléatoirement par le système.
```bash
# Créer un fichier de swap de 4 Go
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

### 🐳 Résolution : Erreur `docker: unknown command: docker compose`
Si la sous-commande `compose` n'est pas reconnue par docker, installez le plugin manquant :
```bash
# Option A : Via le gestionnaire de paquets
sudo apt-get update && sudo apt-get install -y docker-compose-plugin

# Option B (Manuel/Infaillible) : Utile si Docker est géré par Snap ou si le paquet ci-dessus n'est pas dispo
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
docker compose version
```

---

## 📂 Étape 2 : Structure des dossiers et configuration

Créez le dossier du projet et déposez-y vos fichiers de configuration :

```bash
# Créer le répertoire de l'application
sudo mkdir -p /var/www/cesizen
sudo chown -R $USER:$USER /var/www/cesizen
cd /var/www/cesizen
```

Déposez dans ce dossier `/var/www/cesizen/` les 3 fichiers suivants :
1. **`docker-compose.yml`** (copié depuis le dossier `.tools` de votre dépôt)
2. **`Makefile`** (copié depuis le dossier `.tools` de votre dépôt)
3. **`.env`** (à créer avec vos secrets)

### 📤 Transfert des fichiers depuis la machine locale (IDE) vers la VM
Pour envoyer ces fichiers vers le dossier `/var/www/cesizen/` de votre VM, choisissez l'une de ces méthodes :

**Méthode A : Via la commande `scp` (Dans votre terminal local Windows/Git Bash)**
```bash
scp .tools/docker-compose.yml dev@IP_DE_LA_VM:/var/www/cesizen/
scp .tools/Makefile dev@IP_DE_LA_VM:/var/www/cesizen/
scp .tools/.env dev@IP_DE_LA_VM:/var/www/cesizen/
```

**Méthode B : Via VS Code (Extension Remote - SSH)**
1. Installez l'extension **Remote - SSH**.
2. Connectez-vous à la VM (`Ctrl+Shift+P` -> `Remote-SSH: Connect to Host...` -> `dev@IP_DE_LA_VM`).
3. Ouvrez le dossier `/var/www/cesizen` et glissez-déposez les fichiers depuis votre explorateur de fichiers local.

**Méthode C : Via un client SFTP graphique**
Utilisez un logiciel comme **WinSCP** ou **FileZilla** avec l'adresse de votre VM et vos identifiants SSH pour faire des transferts par glisser-déposer.

*Note : Vous pouvez générer une clé secrète robuste pour votre fichier `.env` en exécutant : `make secret` depuis le dossier de la VM.*

Exemple de contenu pour le fichier **`.env`** :
```env
ENVIRONMENT=prod
DEBUG=False
SECRET_KEY=votre_cle_secrete_generee_via_make_secret

# Configuration de la BDD locale (ou adresse Azure / externe)
POSTGRES_DB=cesi_zen
POSTGRES_USER=postgres
POSTGRES_PASSWORD=votre_mot_de_passe_robuste
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

---

## 💾 Étape 3 : Démarrage et Restauration

Grâce au `Makefile`, les commandes d'administration sont maintenant simplifiées au maximum.

### 1. Se connecter à la base d'images GitHub (GHCR)
```bash
docker login ghcr.io -u VOTRE_USERNAME_GITHUB
```

### 2. Récupérer les images et lancer les conteneurs
```bash
# Télécharger les dernières images
make pull

# Lancer la stack en arrière-plan
make up
```

### 3. Restaurer les données (Base de données)

Choisissez l'une des deux méthodes suivantes pour restaurer vos données :

#### Option A : Restaurer depuis une sauvegarde SQL PostgreSQL existante
Transférez votre fichier de sauvegarde SQL sur la VM (ex: dans `/var/www/cesizen/backups/backup.sql`), puis lancez la commande de restauration automatisée :
```bash
make restore file=backups/backup.sql
```

#### Option B : Migrer les données depuis le fichier `db.sqlite3` du dépôt de développement
Si vous repartez à zéro et souhaitez importer les données initiales du fichier SQLite de développement `db.sqlite3` dans la base PostgreSQL de la VM :

1. **Sur votre machine locale** (Windows), envoyez le fichier `db.sqlite3` vers la VM :
   ```bash
   scp backend/cesi_zen_api/db.sqlite3 cesizen:/var/www/cesizen/
   ```
2. **Sur votre VM** (SSH), connectez-vous, allez dans `/var/www/cesizen` et exécutez ces commandes :
   ```bash
   # Copier le fichier db.sqlite3 dans le conteneur backend
   docker cp db.sqlite3 $(docker compose ps -q backend):/app/db.sqlite3

   # Exporter les données de SQLite en JSON (avec uv run)
   docker compose exec -e USE_POSTGRES=False backend uv run python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 4 > dump.json

   # Copier le dump JSON généré dans le conteneur
   docker cp dump.json $(docker compose ps -q backend):/app/dump.json

   # Importer le dump JSON dans PostgreSQL
   docker compose exec backend uv run python manage.py loaddata dump.json

   # Nettoyage des fichiers temporaires
   docker compose exec backend rm /app/db.sqlite3 /app/dump.json
   rm db.sqlite3 dump.json
   ```

---

## 🚀 Étape 4 : Post-déploiement et Initialisation

Finalisez le déploiement en appliquant les schémas de base de données et en générant les fichiers statiques de l'administration :

```bash
# 1. Appliquer les migrations de base de données
make migrate

# 2. Collecter les fichiers statiques de l'admin Django
make static

# 3. Créer un superutilisateur pour l'administration (facultatif)
make createsuperuser
```

---

## 🔍 Commandes utiles au quotidien (`Makefile`)

Voici les commandes simplifiées à votre disposition depuis `/var/www/cesizen/` :

* **`make up`** : Démarre les conteneurs.
* **`make down`** : Arrête les conteneurs.
* **`make restart`** : Redémarre les conteneurs.
* **`make logs`** : Affiche les logs en temps réel.
* **`make ps`** : Affiche l'état des conteneurs (Up / Exited).
* **`make secret`** : Génère une clé secrète sécurisée pour Django.
* **`make backup`** : Crée un export SQL instantané dans le dossier `backups/`.
