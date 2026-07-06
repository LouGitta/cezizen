# Makefile pour l'administration de CesiZen
# Ce fichier doit être placé dans le même dossier que docker-compose.yml sur la VM.

COMPOSE = docker compose

.PHONY: up down restart pull logs ps migrate static createsuperuser backup restore secret

# Générer une clé secrète Django
secret:
	@python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# Lancer la stack en arrière-plan
up:
	$(COMPOSE) up -d

# Arrêter la stack
down:
	$(COMPOSE) down

# Redémarrer les conteneurs
restart:
	$(COMPOSE) restart

# Récupérer les dernières images
pull:
	$(COMPOSE) pull

# Afficher les logs en temps réel
logs:
	$(COMPOSE) logs -f

# Statut des conteneurs
ps:
	$(COMPOSE) ps -a

# Appliquer les migrations Django
migrate:
	$(COMPOSE) exec backend uv run python manage.py migrate

# Collecter les fichiers statiques Django
static:
	$(COMPOSE) exec backend uv run python manage.py collectstatic --noinput

# Créer un compte administrateur
createsuperuser:
	$(COMPOSE) exec backend uv run python manage.py createsuperuser

# Sauvegarder la base de données PostgreSQL
backup:
	@mkdir -p backups
	docker exec $$(docker ps -q -f name=db) pg_dump -U postgres cesi_zen > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Sauvegarde enregistrée dans le dossier backups/"

# Restaurer la base de données
# Usage : make restore file=backups/votre_fichier.sql
restore:
	@if [ -z "$(file)" ]; then \
		echo "Erreur : Spécifiez le fichier de sauvegarde. Exemple : make restore file=backups/backup_20260612_100000.sql"; \
	else \
		docker exec -i $$(docker ps -q -f name=db) psql -U postgres -d cesi_zen < $(file); \
		echo "Restauration effectuée avec succès !"; \
	fi
