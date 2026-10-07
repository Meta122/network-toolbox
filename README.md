# Network Toolbox

[![Build and typecheck](https://github.com/Meta122/network-toolbox/actions/workflows/ci.yml/badge.svg)](https://github.com/Meta122/network-toolbox/actions/workflows/ci.yml)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)

**Comprendre sa connexion et diagnostiquer ses services réseau, depuis une interface en français.**

Network Toolbox regroupe des diagnostics web et DNS, des outils de calcul et un historique local. L'application aide à comparer ce qui est observé depuis l'appareil avec ce qui est mesuré depuis un serveur de diagnostic, sans transformer un résultat incertain en conclusion définitive.

L'interface s'adapte aux téléphones et aux ordinateurs, propose des thèmes clair et sombre, et peut s'installer comme application web progressive (PWA). Un lanceur Windows permet aussi de l'ouvrir dans une fenêtre dédiée.

## Fonctionnalités

- **Connexion** : IPv4/IPv6 publiques, informations d'opérateur et de localisation approximative, temps de réponse HTTP vers l'application.
- **Diagnostic d'une cible** : résolution DNS via Cloudflare et Google, réponse HTTP, redirections et en-têtes, vérification depuis le navigateur et observations manuelles datées.
- **Comparaison de réseaux** : captures horodatées pour comparer deux connexions ou deux contextes d'accès, par exemple avec et sans VPN.
- **Organisation** : cibles favorites avec ports et notes, historique consultable et relance des diagnostics.
- **Rapports** : copie ou partage d'un rapport texte, export JSON et suppression des données locales.
- **Outils** : calcul de sous-réseaux IPv4, décomposition d'URL et estimation du temps de téléchargement.
- **Agent optionnel** : connexions TCP, certificats TLS, ping ICMP et traceroute depuis une machine Linux distincte.

## Installation rapide

### Prérequis

- Node.js **22.13 ou plus récent** ; Node.js 24 est utilisé en intégration continue.
- pnpm **11.25.0**, version fixée par le projet.
- Git et un navigateur récent.

Si pnpm n'est pas déjà installé :

```sh
npm install --global pnpm@11.25.0
```

### Développement

```sh
git clone https://github.com/Meta122/network-toolbox.git
cd network-toolbox
pnpm install --frozen-lockfile
pnpm dev
```

Ouvrez [http://localhost:5173](http://localhost:5173). Aucun compte ChatGPT, secret ou service d'agent n'est nécessaire pour utiliser la copie locale avec les diagnostics web et DNS.

Les informations réseau nécessitent un accès Internet et dépendent de la disponibilité des services externes. Les calculs fonctionnent localement.

### Exécuter une version compilée

```sh
pnpm build
pnpm start
```

Wrangler démarre le Worker compilé sur [http://127.0.0.1:8787](http://127.0.0.1:8787). Il ne publie pas l'application sur Internet.

### Fenêtre dédiée sur Windows

Après l'installation des dépendances et `pnpm build`, double-cliquez sur [Ouvrir Network Toolbox.cmd](Ouvrir%20Network%20Toolbox.cmd), ou exécutez :

```sh
pnpm desktop
```

Le lanceur ouvre Microsoft Edge ou Google Chrome en mode application et démarre un serveur sur `127.0.0.1:8787`. Le serveur s'arrête à la fermeture de la fenêtre. La console peut rester ouverte pendant l'utilisation.

Cette fenêtre possède un profil séparé dans `.network-toolbox-runtime/browser-profile`. Ses favoris et historiques sont indépendants de ceux enregistrés dans votre navigateur habituel ou sur une instance hébergée. Le port 8787 doit être disponible.

## Ce que les mesures permettent de conclure

| Mesure | Origine | Limite principale |
| --- | --- | --- |
| IPv4/IPv6 publique | Navigateur → ipify | Un échec IPv6 signifie « non confirmé ». |
| Opérateur et localisation | Métadonnées Cloudflare et ipwho.is | La localisation est approximative ; les métadonnées peuvent manquer en local. |
| Temps de réponse vers l'application | Cinq requêtes HTTP vers `/api/echo` | Ce n'est ni un ping ICMP, ni un test de débit. En local, il concerne le serveur local. |
| DNS de la cible | Serveur → DNS-over-HTTPS Cloudflare et Google | Les réponses ne décrivent pas les DNS configurés sur l'appareil. |
| Réponse HTTP | Serveur de diagnostic → cible | Le trajet diffère de celui de l'appareil ; la durée inclut DNS et redirections. |
| Accès depuis l'appareil | Navigateur → cible, requête HEAD | Une réponse opaque ne révèle ni le statut HTTP, ni le contenu de la page. |
| TCP, TLS, ICMP, traceroute | Agent optionnel → cible | Les résultats décrivent le trajet de l'agent. |

Les observations « la page s'ouvre », « elle ne s'ouvre pas » et « alerte de sécurité » sont enregistrées séparément des mesures automatiques. Une comparaison de captures indique des différences observées, sans en prouver la cause.

Les adresses privées ou réservées sont filtrées par les contrôles de cible. Cette application vise le diagnostic de services publics ; elle ne fournit pas un inventaire du réseau local.

**Fonctions indisponibles dans cette version :** détection fiable d'un VPN/proxy, observation des DNS système, mesure réelle du débit, protocole HTTP négocié côté hébergement et diagnostic UDP Minecraft Bedrock. Le préréglage Bedrock affiche cette limite ; un test TCP ne remplace pas un échange UDP.

## Données et confidentialité

Les cibles, captures et diagnostics sont enregistrés dans le stockage du navigateur, sans base de données applicative ni synchronisation entre appareils :

- `nt-data-v1` : cibles, jusqu'à 100 diagnostics et 50 captures.
- `nt-dark` : préférence d'affichage.
- Cache PWA : interface et ressources statiques ; les résultats des API réseau ne sont pas mis en cache.

Une capture renouvelle la mesure de connexion et peut inclure le dernier diagnostic affiché, avec son horodatage propre. Elle ne relance pas automatiquement ce diagnostic.

Les mesures contactent des services externes : ipify pour les adresses publiques, ipwho.is pour les informations d'IP, Cloudflare et Google pour le DNS, ainsi que la cible demandée. Les polices sont chargées depuis Google Fonts. Ces services reçoivent les informations nécessaires aux requêtes ; « stockage local » ne signifie donc pas « aucune requête externe ».

L'export permet de sauvegarder les données avant de vider le stockage. Les exports et rapports peuvent contenir des IP, domaines et notes personnels : vérifiez leur contenu avant de les partager.

## Application installable et accès hors ligne

Utilisez le bouton **Installer** dans un navigateur compatible. Si aucune invite n'est disponible, l'application indique les étapes pour ajouter l'icône à l'écran d'accueil sur Android ou iOS.

Après un premier chargement réussi en ligne d'une version compilée, le service worker prépare l'interface et les ressources statiques pour un usage hors connexion. Les calculs, favoris, captures et historiques restent accessibles. Les nouveaux diagnostics nécessitent une connexion ; les anciennes mesures conservent leur date.

L'installation et le service worker nécessitent une origine sécurisée : HTTPS ou une adresse locale reconnue comme `localhost`. Une adresse HTTP de réseau local ne suffit pas. L'installation effective dépend du navigateur et de l'appareil. La validation sur téléphone reste à effectuer pour chaque environnement de déploiement.

## Agent de diagnostic avancé

L'agent est facultatif et s'exécute séparément. Consultez [son guide d'installation et ses variables](agent/README.md) pour le déployer sur Linux derrière un reverse proxy HTTPS.

| Variable côté application | Description |
| --- | --- |
| `PROBE_AGENT_URL` | Origine HTTPS de l'agent, sans suffixe `/probe`. |
| `PROBE_AGENT_TOKEN` | Même secret aléatoire que celui configuré sur l'agent, au moins 32 caractères. |

Pour `pnpm dev`, copiez `.dev.vars.example` vers `.dev.vars` à la racine et remplacez les exemples. Pour `pnpm start` ou le lanceur Windows, placez ce fichier dans `dist/server/.dev.vars` après la compilation : Wrangler charge les secrets près de sa configuration compilée. Une nouvelle compilation peut recréer `dist/` ; réinstallez alors ce fichier. Ces fichiers sont ignorés par Git. Les valeurs restent côté serveur ; ne préfixez jamais le secret par `NEXT_PUBLIC_`.

L'agent écoute par défaut sur `127.0.0.1:8788`, exige un jeton, filtre les adresses privées et propose une liste de cibles autorisées (`ALLOWED_TARGETS`). Il limite la concurrence et la fréquence des requêtes. Il ne conserve pas d'historique persistant.

## Architecture

L'interface utilise **React 19**, **TypeScript**, **Tailwind CSS 4** et **Lucide**. **Vinext**, basé sur Vite et compatible avec les conventions Next.js, produit le serveur **Cloudflare Workers**. Vinext est encore une dépendance bêta ; le lockfile fixe les versions utilisées.

```text
app/          Interface, installation PWA et routes API
lib/          Validation, diagnostics, calculs et contexte des requêtes
agent/        Agent Node.js optionnel pour les tests avancés
public/       Icônes, manifeste et service worker
build/        Intégration du Worker et de l'environnement Sites
scripts/      Compilation, exécution locale et lanceur Windows
.github/      Vérifications automatiques
```

Les adaptateurs Sites sont conservés pour la compatibilité avec l'hébergement d'origine. Une copie neuve utilise `.openai/hosting.example.json`, avec des paramètres neutres et sans identifiant de projet. Une éventuelle configuration locale `.openai/hosting.json` reste ignorée par Git. Aucun abonnement Cloudflare n'est nécessaire pour l'exécution locale.

## Vérifications et contribution

```sh
pnpm typecheck
pnpm build
pnpm lint
```

L'intégration continue vérifie les types et la compilation depuis une copie propre. ESLint reste un audit supplémentaire : le code applicatif comporte encore une dette de typage (`any`) et des avertissements liés aux effets React. Son résultat doit être examiné ; il n'est pas présenté comme une validation déjà acquise.

Les appels à des services externes et l'installation PWA dépendent du réseau et du navigateur. Vérifiez les parcours concernés dans votre environnement ; une compilation réussie ne confirme pas la disponibilité de ces services.

Pour proposer une amélioration ou signaler un problème, consultez [CONTRIBUTING.md](CONTRIBUTING.md) et ouvrez une [issue](https://github.com/Meta122/network-toolbox/issues) avec les étapes de reproduction. Retirez les données personnelles des rapports joints.

## Assistance au développement

Ce projet a été développé avec l'assistance de Codex pour l'implémentation, la documentation et certaines vérifications techniques. Les orientations du projet et les décisions de publication restent sous la responsabilité du mainteneur.

## Licence et crédit

Network Toolbox est distribué sous [licence MIT](LICENSE). Vous pouvez l'utiliser, le modifier et le redistribuer, y compris commercialement, en conservant la notice de copyright et le texte de la licence dans les copies ou portions substantielles réutilisées.

La notice identifie **Network Toolbox — Meta122 (Metacraft)** et [le dépôt d'origine](https://github.com/Meta122/network-toolbox). Vous pouvez également reprendre ce crédit dans la documentation de votre projet. MIT impose la conservation des notices ; elle n'impose pas un badge visible dans l'interface.

Les composants tiers conservent leurs propres conditions, décrites dans [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
