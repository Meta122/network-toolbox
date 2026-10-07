# Agent Network Toolbox

Les tests web et DNS de l’application hébergée fonctionnent sans agent. Cet agent optionnel apporte TCP, vérification TLS, ping ICMP et traceroute. Il ne teste que des adresses publiques. Son emplacement est affiché dans chaque résultat ; ces mesures ne décrivent pas le trajet du téléphone.

## Installation sur Linux

1. Installer Node.js 22 ou plus récent, `ping` et `traceroute` (sur Debian : `apt install iputils-ping traceroute`).
2. Générer un secret aléatoire : `openssl rand -hex 32`.
3. Définir `PROBE_AGENT_TOKEN` avec ce secret, `PROBE_LOCATION` avec le lieu réel (par exemple « PC maison · France »), et idéalement `ALLOWED_TARGETS` avec les domaines/IP autorisés séparés par des virgules.
4. Exécuter `node agent/server.mjs` comme un service permanent. Il écoute uniquement sur 127.0.0.1:8788 par défaut.
5. Exposer ce service derrière un reverse proxy HTTPS, par exemple Caddy ou nginx, avec un certificat valide. Ne pas exposer le port HTTP brut sur Internet.
6. Dans les variables serveur du Site, définir `PROBE_AGENT_URL` (origine HTTPS du reverse proxy, sans `/probe`) et `PROBE_AGENT_TOKEN` (même secret). Le navigateur ne reçoit jamais ce secret.

Le pare-feu doit autoriser les sorties TCP/ICMP/UDP nécessaires aux tests et l’entrée HTTPS vers le reverse proxy. Les tests sont limités à 8 ports par requête, 4 requêtes simultanées et 15 requêtes par minute par adresse du proxy. Restreindre les cibles avec ALLOWED_TARGETS est recommandé. Les échecs et outils manquants sont affichés, jamais remplacés par des résultats inventés.

La sélection d’adresse privilégie la première réponse du système. Elle ne compare pas toutes les IP d’une cible. Les certificats rejetés par Node donnent une erreur TLS ; les métadonnées d’un certificat rejeté ne sont pas récupérées par une seconde connexion non vérifiée. Le traceroute affiche la sortie native et au maximum 12 sauts ; des astérisques peuvent signifier que les routeurs ne répondent pas. Minecraft Bedrock UDP n’est pas implémenté.

## Variables

| Variable | Rôle |
|---|---|
| PROBE_AGENT_TOKEN | Secret obligatoire, 32 caractères minimum |
| PROBE_LOCATION | Emplacement réel visible dans l’application |
| ALLOWED_TARGETS | Liste de noms/IP autorisés, facultative |
| PORT | 8788 par défaut |
| BIND_ADDRESS | 127.0.0.1 par défaut |

Aucune collecte persistante n’est effectuée par l’agent.
