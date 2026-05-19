FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @ionic/cli

COPY . .
RUN ionic build --prod 

####
FROM nginx:alpine

COPY --from=builder /app/www /usr/share/nginx/html

EXPOSE 80