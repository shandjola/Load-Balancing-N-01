const express = require('express');
const path = require('path');

const app = express();
const port = 5000;
const serverIP = '172.16.0.0'; //Mettre ici l'adresse IP public de l'instance privée 1

// Servir le fichier index.html
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
console.log(`Serveur 2 privé, port: ${port}, IP: ${serverIP}`);
});