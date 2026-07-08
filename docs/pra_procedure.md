# Plan de Reprise d'Activité (PRA) Simplifié - CesiZen 🧘‍♂️

Ce document décrit la procédure étape par étape pour sauvegarder, restaurer les données et reconstruire l'intégralité de la stack applicative CesiZen sur une nouvelle machine virtuelle (VM) en cas de sinistre.

Pour la configuration initiale de la VM, l'installation de Docker/Make et le premier lancement, veuillez d'abord suivre la [Procédure de Déploiement](file:///c:/Users/lougi/Dev/cezizen/docs/deployment_procedure.md).

---

## 💾 Étape 1 : Stratégie de Sauvegarde (Backup)

Pour éviter toute perte de données, il est essentiel d'effectuer des sauvegardes régulières de la base de données PostgreSQL de production.

Grâce au `Makefile` fourni, vous pouvez créer un export SQL instantané en exécutant simplement la commande suivante depuis le dossier `/var/www/cesizen/` sur la VM :

```bash
make backup
```

### 📂 Emplacement des Sauvegardes
* Les sauvegardes sont générées sous forme de fichiers SQL compressés dans le sous-dossier `/var/www/cesizen/backups/`.
* Le nommage des fichiers suit le format : `backup_YYYYMMDD_HHMMSS.sql`.
* **Important** : Il est fortement conseillé de mettre en place un script de transfert (cron) pour externaliser ces fichiers de sauvegarde vers un stockage distant sécurisé (ex: Azure Blob Storage, AWS S3, ou un autre serveur) pour prévenir la perte totale en cas de destruction de la VM.

---

## 🔄 Étape 2 : Procédures de Restauration des Données

Choisissez l'une des deux méthodes suivantes selon le scénario de reprise :

### Option A : Restaurer depuis une sauvegarde SQL PostgreSQL existante
Si vous réinitialisez la VM ou si la base de données a été corrompue :
1. Déposez votre fichier de sauvegarde SQL sur la VM (ex: dans `/var/www/cesizen/backups/backup.sql`).
2. Exécutez la commande de restauration automatisée :
   ```bash
   make restore file=backups/backup.sql
   ```

### Option B : Migrer les données depuis le fichier `db.sqlite3` du dépôt de développement
Si vous repartez à zéro et souhaitez importer les données initiales du fichier SQLite de développement `db.sqlite3` dans la base PostgreSQL de production :

1. **Sur votre machine locale** (Windows), envoyez le fichier `db.sqlite3` vers la VM :
   ```bash
   scp backend/cesi_zen_api/db.sqlite3 dev@172.24.174.186:/var/www/cesizen/
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

## 🔍 Scénarios de Reprise après Sinistre

### Scénario 1 : Perte totale de la machine virtuelle (VM détruite)
En cas de crash ou destruction physique de la VM cible :
1. Créez une nouvelle machine virtuelle Ubuntu propre.
2. Suivez l'intégralité de la [Procédure de Déploiement](file:///c:/Users/lougi/Dev/cezizen/docs/deployment_procedure.md) pour initialiser la VM, cloner/transférer les fichiers `.tools` et démarrer la stack applicative.
3. Récupérez le dernier fichier de sauvegarde SQL externalisé et transférez-le sur la VM dans `/var/www/cesizen/backups/`.
4. Appliquez la restauration :
   ```bash
   make restore file=backups/nom_du_dernier_backup.sql
   ```
5. Appliquez les migrations si nécessaire :
   ```bash
   make migrate
   ```

### Scénario 2 : Corruption de la base de données (Stack saine)
Si l'application tourne toujours mais que les données ont été altérées ou corrompues :
1. Arrêtez les services écrivant sur la BDD si nécessaire.
2. Restaurez la dernière sauvegarde saine :
   ```bash
   make restore file=backups/nom_du_dernier_backup.sql
   ```
3. Redémarrez la stack :
   ```bash
   make restart
   ```
