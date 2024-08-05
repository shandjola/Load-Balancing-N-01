const express = require('express');
const path = require('path');
const app = express();
const port = 5000;
const serverIP = '34.217.45.57'; //Mettre ici l'adresse IP public de l'instance publique

// Servir le fichier index.html
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
console.log(`Serveur 1 public, port: ${port}, IP: ${serverIP}`);
}); 