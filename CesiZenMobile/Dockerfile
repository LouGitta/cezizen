# ==========================================
# ÉTAPE 1 : Le Build (La compilation)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install
RUN npm install -g @ionic/cli

# Copie du code et lancement de la compilation
COPY . .
RUN ionic build --prod 

# ==========================================
# ÉTAPE 2 : Le Serveur Web (La production)
# ==========================================
# On utilise Nginx, un serveur web très léger et ultra-rapide
FROM nginx:alpine

# On copie uniquement le dossier "www" généré à l'étape 1
# vers le dossier public de Nginx. On abandonne le code source lourd !
COPY --from=builder /app/www /usr/share/nginx/html

# Nginx écoute par défaut sur le port 80
EXPOSE 80