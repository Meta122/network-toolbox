# Contribuer à Network Toolbox

Les corrections, améliorations d'accessibilité et contributions à la documentation sont les bienvenues. Pour un changement important, ouvrez une issue afin de préciser le problème et le comportement attendu.

1. Forkez le dépôt et créez une branche dédiée.
2. Installez les dépendances avec `pnpm install --frozen-lockfile`.
3. Développez avec `pnpm dev`.
4. Exécutez `pnpm typecheck` et `pnpm build`. Utilisez aussi `pnpm lint` pour examiner les problèmes de qualité existants et ceux introduits par votre changement.
5. Vérifiez dans un navigateur les parcours concernés. Les changements PWA doivent aussi être vérifiés après un premier chargement en ligne, puis hors connexion.
6. Ouvrez une pull request décrivant le problème, la correction et les vérifications effectuées.

Les diagnostics doivent distinguer une mesure, une observation manuelle et une hypothèse. Un échec réseau ou une fonctionnalité indisponible doit rester explicite. N'ajoutez pas de résultat simulé dans les parcours utilisateur.

N'incluez ni secret, ni export de données personnelles, ni profil de navigateur dans une contribution. Utilisez des domaines d'exemple et des données fictives dans les captures ou rapports.

Les contributions sont proposées sous la [licence MIT du projet](LICENSE). Conservez les notices de crédit et de licence des composants réutilisés.
