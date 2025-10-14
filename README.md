🐾 AdoptMe

Donnez un foyer à un animal dans le besoin.
AdoptMe est une application décentralisée (dApp) construite avec React, Truffle, Solidity et Ethereum (Ganache/MetaMask) qui permet aux utilisateurs d’adopter des animaux virtuels.

🚀 Fonctionnalités

Se connecter avec MetaMask pour interagir avec la blockchain

L’admin peut :

Ajouter un animal (nom, âge, race, description, image, frais d’adoption)

Les utilisateurs peuvent :

Voir tous les animaux disponibles

Adopter un animal en payant les frais d’adoption en ETH

Mise à jour automatique de la liste après ajout/adoption

Interface simple et responsive en React

🛠️ Technologies

Frontend : React (Create React App, CSS)

Smart Contract : Solidity (Truffle Framework)

Blockchain locale : Ganache

Wallet : MetaMask

Librairie Web3 : Ethers.js

📂 Structure du projet
AdoptMe/
│
├── contracts/           # Smart contracts Solidity
│   └── AdoptMe.sol
├── migrations/          # Scripts de déploiement Truffle
├── client/              # Frontend React
│   ├── src/
│   │   ├── App.js       # Composant principal React
│   │   ├── App.css      # Styles CSS
│   │   └── contracts/   # ABI générés par Truffle
│   └── public/          # Fichiers statiques
├── build/               # Fichiers compilés par Truffle
└── truffle-config.js    # Configuration Truffle

⚡ Installation & Utilisation
1️⃣ Cloner le projet
git clone https://github.com/ton-compte/AdoptMe.git
cd AdoptMe

2️⃣ Installer les dépendances

Installer les dépendances du smart contract :

npm install -g truffle
npm install


Installer les dépendances du frontend :

cd client
npm install

3️⃣ Lancer Ganache

Ouvrir Ganache (UI ou CLI ganache-cli)

Vérifier que le port est 7545

4️⃣ Déployer le contrat

Depuis la racine du projet :

truffle migrate --reset

5️⃣ Lancer le frontend
cd client
npm start


L’application sera accessible sur http://localhost:3000
 🌍

🖼️ Aperçu


<img width="1369" height="876" alt="image" src="https://github.com/user-attachments/assets/d6134672-2375-4757-892c-9ec6cddc909e" />


👨‍💻 Auteur

Projet développé par Bedoui Ghazoua .
