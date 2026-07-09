# Procédure de Déploiement - CesiZen 🚀

Ce document décrit la procédure étape par étape pour provisionner et déployer l'intégralité de la stack applicative CesiZen sur une nouvelle machine virtuelle (VM) à l'aide de **Docker** et **Make**.

Pour la gestion des sauvegardes et de la restauration des données, veuillez vous référer à la [Procédure de Reprise d'Activité (PRA)](file:///c:/Users/lougi/Dev/cezizen/docs/pra_procedure.md).

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

# 2. Ajout de l'utilisateur SSH au groupe docker pour éviter d'utiliser sudo
sudo usermod -aG docker <VOTRE_UTILISATEUR_SSH>
newgrp docker
```

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

### 📊 Résolution : Tableaux de bord Grafana cAdvisor vides ("No data")
Sur les versions récentes de Docker (v26+ / v29+), l'utilisation par défaut de `containerd-snapshotter` (pilote de stockage `overlayfs`) empêche cAdvisor de lier les conteneurs à leurs noms. Pour forcer le retour au pilote `overlay2` compatible :

1. Créez ou modifiez le fichier `/etc/docker/daemon.json` sur la VM :
   ```json
   {
     "features": {
       "containerd-snapshotter": false
     }
   }
   ```
2. Redémarrez le service Docker :
   ```bash
   sudo systemctl restart docker
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

Déposez dans ce dossier `/var/www/cesizen/` les fichiers et dossiers suivants :
1. **`docker-compose.yml`** (copié depuis le dossier `.tools` de votre dépôt)
2. **`Makefile`** (copié depuis le dossier `.tools` de votre dépôt)
3. **`.env`** (à créer avec vos secrets)
4. **`monitoring/`** (dossier contenant Grafana + Prometheus, copié depuis `.tools/monitoring` de votre dépôt)

### 📥 Récupération des fichiers de configuration sur la VM

Pour faire fonctionner la stack en production, vous devez récupérer les fichiers de configuration (`docker-compose.yml`, `Makefile`, `.env`, et le dossier `monitoring`) sur la VM dans le dossier `/var/www/cesizen/`. 

Deux méthodes s'offrent à vous :

#### Option A : Téléchargement direct depuis GitHub (Recommandé - Évite de copier les fichiers localement)

**Sur votre VM (via SSH) :**
```bash
# 1. Créer l'arborescence des dossiers sur la VM
mkdir -p /var/www/cesizen/monitoring/prometheus
mkdir -p /var/www/cesizen/monitoring/grafana/provisioning/dashboards
mkdir -p /var/www/cesizen/monitoring/grafana/provisioning/datasources
cd /var/www/cesizen/

# 2. Récupérer les fichiers principaux depuis la branche main (ou develop)
curl -L https://raw.githubusercontent.com/LouGitta/cezizen/main/.tools/docker-compose.yml -o docker-compose.yml
curl -L https://raw.githubusercontent.com/LouGitta/cezizen/main/.tools/Makefile -o Makefile
curl -L https://raw.githubusercontent.com/LouGitta/cezizen/main/.tools/.env -o .env

# 3. Récupérer la configuration Prometheus
curl -L https://raw.githubusercontent.com/LouGitta/cezizen/main/.tools/monitoring/prometheus/prometheus.yml -o monitoring/prometheus/prometheus.yml

# 4. Récupérer la configuration et les Dashboards Grafana
curl -L https://raw.githubusercontent.com/LouGitta/cezizen/main/.tools/monitoring/grafana/provisioning/datasources/datasource.yml -o monitoring/grafana/provisioning/datasources/datasource.yml
curl -L https://raw.githubusercontent.com/LouGitta/cezizen/main/.tools/monitoring/grafana/provisioning/dashboards/dashboard.yml -o monitoring/grafana/provisioning/dashboards/dashboard.yml
curl -L https://raw.githubusercontent.com/LouGitta/cezizen/main/.tools/monitoring/grafana/provisioning/dashboards/django.json -o monitoring/grafana/provisioning/dashboards/django.json
curl -L https://raw.githubusercontent.com/LouGitta/cezizen/main/.tools/monitoring/grafana/provisioning/dashboards/cadvisor.json -o monitoring/grafana/provisioning/dashboards/cadvisor.json
```

#### Option B : Transfert depuis votre machine locale (via SCP)

> [!IMPORTANT]
> **Prérequis de transfert** : Le dossier de destination sur la VM (`/var/www/cesizen/`) doit obligatoirement avoir été créé au préalable (voir ci-dessus) et être accessible en écriture par votre utilisateur SSH.

**Depuis votre machine locale (Powershell / Windows Terminal) :**
```powershell
# Placez-vous dans le dossier racine du dépôt local
cd c:\Users\lougi\Dev\cezizen

# Exécutez le transfert vers la VM
scp -r .tools\docker-compose.yml .tools\Makefile .tools\.env .tools\monitoring cesizen:/var/www/cesizen/
```

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

### 🔑 Ajustement des permissions pour Grafana (Requis)
Par défaut, les fichiers copiés depuis Windows via `scp` peuvent avoir des permissions trop restrictives empêchant Grafana (qui s'exécute avec l'utilisateur interne `472`) de lire sa configuration. 

**Sur votre VM**, dans `/var/www/cesizen/`, exécutez la commande suivante pour attribuer les droits nécessaires :
```bash
chmod -R 755 monitoring/
```

---

## 🚀 Étape 3 : Démarrage et Initialisation

> [!NOTE]
> Les packages Docker du projet étant désormais configurés en **public** sur GitHub Packages (GHCR), l'authentification (`docker login ghcr.io`) n'est plus requise pour télécharger les images.

### 1. Récupérer les images et lancer les conteneurs
```bash
# Télécharger les dernières images
make pull

# Lancer la stack en arrière-plan
make up
```

### 2. Initialisation de l'application
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

---

## 📊 Accès aux outils de Monitoring

Une fois la stack démarrée avec `make up`, les outils de monitoring sont accessibles à ces adresses :
* **Grafana** (Visualisation & Tableaux de bord) : `http://<IP_DE_LA_VM>:3000` (identifiants par défaut: `admin` / `admin`)
* **Prometheus** (Base de données temporelle de métriques) : `http://<IP_DE_LA_VM>:9090`
* **cAdvisor** (Métriques de conteneurs en temps réel) : `http://<IP_DE_LA_VM>:8080`
