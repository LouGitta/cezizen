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

Pour installer et lancer l'environnement de développement de CesiZen sur votre PC local :

* **[Guide d'Installation et de Démarrage Local](docs/local_initialisation.md)** : Étapes de configuration de Docker Compose, accès aux applications locales, gestion de la base de données PostgreSQL, et génération/sécurisation des clés secrètes Django.

---

## ☁️ Déploiement sur une Machine Virtuelle (VM)

Le déploiement de CesiZen sur la machine virtuelle de production ou de test est documenté de manière modulaire dans les guides suivants :

* **[Guide d'Initialisation de la VM](docs/vm_initialisation.md)** : Toutes les étapes de préparation (création sous Hyper-V, installation d'Ubuntu, activation du SWAP, installation de Docker/Make et sécurisation de l'accès SSH).
* **[Plan de Reprise d'Activité (PRA)](docs/pra_procedure.md)** : La procédure pas à pas de déploiement et de restauration de l'application (téléchargement des images GHCR, configuration du `.env`, migration/import de base de données et commandes d'administration utiles).

Le déploiement s'appuie sur un **modèle tiré (pull-based)**. C'est la machine virtuelle qui initie la récupération des mises à jour du code et des images conteneurisées depuis GitHub (GHCR), ce qui permet de maintenir la VM sécurisée sans ouvrir le port SSH vers l'extérieur.

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
