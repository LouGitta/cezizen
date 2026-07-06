# Guide d'Initialisation de la Machine Virtuelle (VM) - CesiZen 🧘‍♂️

Ce document regroupe toutes les étapes pour créer, installer et configurer de zéro une machine virtuelle Ubuntu Server sous **Hyper-V** sur votre PC local afin d'y héberger l'application CesiZen.

---

## 💻 Étape 1 : Création de la VM dans Hyper-V

Lors de la création de la VM dans le **Gestionnaire Hyper-V** :

1. **Génération** : Sélectionnez **Génération 2** (recommandé pour les systèmes Linux modernes).
2. **Mémoire (RAM)** : Allouez **8192 Mo** (8 Go).
   * ⚠️ *Désactivez la case "Mémoire dynamique" pour garantir des performances stables.*
3. **Réseau** : Connectez la VM sur le **Commutateur par défaut (Default Switch)**. Cela lui attribue automatiquement internet (NAT) et une adresse IP locale.
4. **Sélection de l'OS** : Choisissez l'ISO d'Ubuntu Server (22.04, 24.04 ou 26.04 LTS).

### 🛠️ Résolution du bug de démarrage "Microsoft Hyper-V UEFI"
Par défaut, Hyper-V bloque le démarrage d'Ubuntu à cause des règles de sécurité Windows. Avant de lancer la VM pour la première fois :
1. Faites un clic droit sur la VM > **Paramètres...** (Settings).
2. Allez dans la section **Sécurité** (Security).
3. Décochez **Activer le démarrage sécurisé** (Enable Secure Boot) *OU* remplacez le modèle par **"Autorité de certification UEFI Microsoft"** (*Microsoft UEFI Certificate Authority*).
4. Cliquez sur **OK** et démarrez la VM.

---

## 💿 Étape 2 : Installation d'Ubuntu Server

Sélectionnez l'option **"Try or Install Ubuntu Server"** au démarrage et suivez l'assistant :

1. **Type d'installation** : Choisissez **Ubuntu Server** standard *(évitez la version minimized qui ne contient pas les outils réseau requis)*.
2. **Configuration Réseau (Network)** : Notez l'adresse IP affichée à l'écran (ex: `172.31.201.165/20`). C'est l'IP que vous utiliserez pour vous connecter à la VM.
3. **Proxy** : Laissez le champ vide.
4. **Mise en page du stockage** : Conservez les valeurs par défaut (LVM activé) et valisez.
5. **Configuration du profil (Profile Setup)** :
   * **Pick a username** (Nom d'utilisateur) : Saisissez impérativement **`dev`** (toute la configuration du projet dépend de cet utilisateur).
   * Configurez le mot de passe de votre choix.
6. **Configuration SSH (SSH Setup)** :
   * Cochez la case **`[X] Install OpenSSH server`** avec la barre d'espace.
   * Laissez *Import SSH identity* sur *No*.
7. **Featured Server Snaps** : Ne cochez rien.
8. **Finalisation** : Une fois l'installation terminée, sélectionnez **Reboot Now** pour redémarrer.

---

## 🔑 Étape 3 : Configuration de l'accès SSH sur votre PC local (Hôte)

Pour vous connecter facilement à votre VM depuis votre terminal Windows sans devoir retaper son adresse IP :

1. Ouvrez votre fichier de configuration SSH local (situé dans `C:\Users\<VotreNom>\.ssh\config`).
2. Ajoutez ou mettez à jour le bloc suivant avec l'IP obtenue lors de l'installation :
   ```text
   Host cesizen
       HostName 172.31.201.165  # Remplacer par l'IP de la VM
       User dev
   ```
3. Ouvrez un terminal sur votre PC et connectez-vous d'une simple commande :
   ```bash
   ssh cesizen
   ```
   *(Entrez le mot de passe de l'utilisateur `dev` défini à l'étape précédente).*

---

## 🚀 Étape 4 : Initialisation logicielle de la VM (Docker & Outils)

Une fois connecté en SSH sur le terminal de la VM, exécutez les commandes suivantes :

### 1. Mise à jour et installation des paquets
```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y docker.io docker-compose-v2 make build-essential
```

### 2. Droits d'accès Docker (sans sudo)
```bash
sudo usermod -aG docker dev
newgrp docker
```

### 3. Activation du fichier de SWAP (Recommandé)
Configurez 4 Go de SWAP pour éviter les blocages dus à l'allocation mémoire (*Out of Memory*) :
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

---

## 🐳 Dépannage : Erreur `docker: unknown command: docker compose`

Si la commande `docker compose` n'est pas reconnue après l'installation, exécutez ces étapes pour installer manuellement le plugin Compose V2 pour l'utilisateur `dev` :

```bash
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
docker compose version
```

---
*Vous pouvez maintenant procéder à l'étape 2 du [Plan de Reprise d'Activité (PRA)](file:///c:/Users/lougi/Dev/cezizen/pra_procedure.md) pour transférer et lancer les fichiers de configuration du projet.*
