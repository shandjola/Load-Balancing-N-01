# Tutoriel : Mise en place d'un équilibrage de charge avec Nginx

## Introduction

Ce tutoriel décrit les étapes nécessaires pour configurer un VPC avec 3 sous-réseaux, déployer des instances EC2 exécutant des applications Node.js et configurer Nginx pour équilibrer la charge entre ces instances. Nous allons utiliser AWS pour créer les infrastructures et exécuter les applications.

### Prérequis

- Compte AWS avec accès IAM approprié
- Connaissance de base des services AWS (VPC, EC2, etc.)
- Familiarité avec Node.js et Nginx

## Étapes du Tutoriel

### 1. Création du VPC

Créez un VPC pouvant supporter 354 hôtes avec l'adresse IP `172.16.10.0`.

```bash
aws ec2 create-vpc --cidr-block 172.16.10.0/23
```

### 2. Création des Sous-Réseaux

Créez trois sous-réseaux dans trois zones de disponibilité différentes.

#### Sous-réseau public

```bash
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 172.16.10.0/25 --availability-zone <AZ1>
```

#### Deux sous-réseaux privés

```bash
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 172.16.10.128/25 --availability-zone <AZ2>
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 172.16.11.0/25 --availability-zone <AZ3>
```

### 3. Création des Instances EC2

Créez des instances EC2 dans chaque sous-réseau.

```bash
aws ec2 run-instances --image-id <AMI_ID> --count 1 --instance-type t2.micro --key-name <Key_Pair_Name> --subnet-id <Public_Subnet_ID> --associate-public-ip-address
aws ec2 run-instances --image-id <AMI_ID> --count 1 --instance-type t2.micro --key-name <Key_Pair_Name> --subnet-id <Private_Subnet1_ID>
aws ec2 run-instances --image-id <AMI_ID> --count 1 --instance-type t2.micro --key-name <Key_Pair_Name> --subnet-id <Private_Subnet2_ID>
```

### 4. Installation et Configuration de Node.js

Sur chaque instance EC2, exécutez le script suivant pour installer Node.js, npm et express.

#### `installation_nodejs.sh`

```bash
#!/bin/bash
# installs fnm (Fast Node Manager)
curl -fsSL https://fnm.vercel.app/install | bash

# activate fnm
source ~/.bashrc

# download and install Node.js
fnm use --install-if-missing 20

# verifies the right Node.js version is in the environment
node -v # should print v20.16.0

# verifies the right npm version is in the environment
npm -v # should print 10.8.1
```

#### `installation_express.sh`

```bash
#!/bin/bash
mkdir /home/ec2-user/myapp
cd /home/ec2-user/myapp
npm init -y
npm install express
```

### 5. Création de l'Application Node.js

Créez l'application Node.js sur les instances EC2.

#### Script de création de l'application `cretation_app.sh`

```bash
#!/bin/bash
cd /home/ec2-user/myapp
sudo touch app.js index.html
```

#### `app.js`

```javascript
const express = require('express');
const path = require('path');

const app = express();
const port = 5000;
const serverIP = '34.217.45.57'; // Mettre ici l'adresse IP public de l'instance publique

// Servir le fichier index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur 1 public, port: ${port}, IP: ${serverIP}`);
});
```

#### `index.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serveur 1</title>
    <style>
        body {
            background-color: blue;
            color: white;
        }
    </style>
</head>
<body>
    <h1>Serveur 1</h1>
    <p>Adresse IP du serveur : <span>34.217.45.57</span></p> <!-- Ici mettre l'adresse IP public de l'instance publique -->
    <p>Numéro de port : <span>5000</span></p> <!-- Le numéro de port-->
</body>
</html>
```

#### Script de lancement de l'application `lancement_app_node.sh`

```bash
#!/bin/bash
cd /home/ec2-user/myapp
node app.js &
```

### 6. Configuration des Instances Privées

Sur les instances EC2 des sous-réseaux privés, installez Node.js et créez des applications Node.js lancées sur deux ports (5000 et 5001).

#### `app1.js`

```javascript
const express = require('express');
const path = require('path');

const app = express();
const port = 5000;
const serverIP = '172.16.10.208'; // Mettre ici l'adresse IP privée de l'instance privée concernée

// Servir le fichier index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index1.html'));
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur 2 privé, port: ${port}, IP: ${serverIP}`);
});
```

#### `index1.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serveur 2</title>
    <style>
        body {
            background-color: blue;
            color: white;
        }
    </style>
</head>
<body>
    <h1>Serveur 2</h1>
    <p>Adresse IP du serveur : <span>172.16.10.208</span></p> <!-- Ici mettre l'adresse IP privée de l'instance privée concernée -->
    <p>Numéro de port : <span>5000</span></p> <!-- Le numéro de port-->
</body>
</html>
```

#### `app2.js`

```javascript
const express = require('express');
const path = require('path');

const app = express();
const port = 5001;
const serverIP = '172.16.10.208'; // Mettre ici l'adresse IP privée de l'instance privée concernée

// Servir le fichier index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index2.html'));
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur 3 privé, port: ${port}, IP: ${serverIP}`);
});
```

#### `index2.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serveur 3</title>
    <style>
        body {
            background-color: blue;
            color: white;
        }
    </style>
</head>
<body>
    <h1>Serveur 3</h1>
    <p>Adresse IP du serveur : <span>172.16.10.208</span></p> <!-- Ici mettre l'adresse IP privée de l'instance privée concernée -->
    <p>Numéro de port : <span>5001</span></p> <!-- Le numéro de port-->
</body>
</html>
```

### 7. Installation de Nginx

Installez Nginx sur l'instance EC2 publique.

#### `installation_nginx.sh`

```bash
sudo yum install yum-utils
```

#### `nginx.repo`

```bash
/etc/yum.repos.d/nginx.repo
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/amzn/2023/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
priority=9

[nginx-mainline]
name=nginx mainline repo
baseurl=http://nginx.org/packages/mainline/amzn/2023/$basearch/
gpgcheck=1
enabled=0
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
priority=9
```

#### `installation_nginx.sh`

```bash
sudo yum-config-manager --enable nginx-mainline
sudo yum install nginx
```

### 8. Configuration de Nginx

Modifiez le fichier de configuration `nginx.conf` pour configurer l'équilibrage de charge.

    ```nginx
    # For more information on configuration, see:
    #   * Official English Documentation: http://nginx.org/en/docs/
    #   * Official Russian Documentation: http://nginx.org/ru/docs/

    user nginx;
    worker_processes auto;
    error_log /var/log/nginx/error.log notice;
    pid /run/nginx.pid;

    # Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.
    include /usr/share/nginx/modules/*.conf;

    events {
        worker_connections 1024;
    }

    http {
        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                        '$status $body_bytes_sent "$http_referer" '
                        '"$http_user_agent" "$http_x_forwarded_for"';

        access_log  /var/log/nginx/access.log  main;

        sendfile            on;
        tcp_nopush          on;
        keepalive_timeout   65;
        types_hash_max_size 4096;

        include             /etc/nginx/mime.types;
        default_type        application/octet-stream;

        # Load modular configuration files from the /etc/nginx/conf.d directory.
        # See http://nginx.org/en/docs/ngx_core_module.html#include
        # for more information.
        include /etc/nginx/conf.d/*.conf;

        server {
            listen       80;
            listen       [::]:80;
            server_name  _;
            root         /usr/share/nginx/html;

            # Load configuration files for the default server block.
            include /etc/nginx/default.d/*.conf;

            error_page 404 /404.html;
            location = /404.html {
                internal;
            }

            error_page 500 502 503 504 /50x.html;
            location = /50x.html {
                root /usr/share/nginx/html;
            }
        }

        upstream backend_servers {
        server 34.217.45.57:5000;
        server 172.16.10.208:5000;
        server 172.16.10.208:5001;
        server 172.16.11.97:5000;
        server 172.16.11.97:5001;
        }

        server {
            listen 80;
            server_name 34.217.45.57;

            location / {
                proxy_pass http://backend_servers;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
    }
    ```

### 9. Script pour lancer deux instances du même fichier d'application (app.js)

#### `lancement_app_node_5000_5001.sh`
```bash
#!/bin/bash
cd /home/ec2-user/myapp

# Lancer l'application sur le port 5000
node app.js 5000 &

# Lancer la même application sur le port 5001
node app.js 5001 &

# Attendre que les applications se terminent
wait
```