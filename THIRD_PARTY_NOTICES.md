# Composants tiers

Network Toolbox est distribué sous licence MIT. Les dépendances conservent leurs propres licences ; la licence du projet ne les remplace pas.

Le fichier `build/sites-vite-plugin.ts` est adapté de `@openai/sites-vite-plugin` et conserve sa notice MIT OpenAI dans [build/sites-vite-plugin.LICENSE](build/sites-vite-plugin.LICENSE).

Les autres bibliothèques sont installées via pnpm et identifiées dans [package.json](package.json) et [pnpm-lock.yaml](pnpm-lock.yaml). Leurs notices sont fournies dans les paquets correspondants. Si vous redistribuez ces bibliothèques ou un bundle qui les intègre, conservez les notices requises par leurs licences.

Les polices DM Sans et Manrope sont chargées depuis Google Fonts par `app/globals.css`. Leur chargement nécessite une connexion ; des polices système prennent le relais hors ligne. Les polices conservent leurs licences respectives.
