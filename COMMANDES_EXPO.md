# Création du fichier APK

```bash
# 1. Installer EAS CLI
npm install -g eas-cli

# 2. Se connecter à Expo
npx eas login

# 3. Configurer le projet
npx eas build:configure

# 4. Créer l'APK (build cloud)
npx eas build --platform android --profile development
```

# Envoyer en ligne Mise à jour

```bash
# 1. Installer EAS CLI
npm install -g eas-cli

# 2. Se connecter à Expo
npx eas login

# 3. Configurer le projet
npx eas build:configure

# 4. Créer un build initial
npx eas build --platform android --profile production

# 5. Mettre à jour en ligne
npx eas update --branch production --message "Version 1.0"
```

# Expo Go

```bash
# 1. Démarrer pour Expo Go
npx expo start

# 2. Démarrer avec tunnel (partage en ligne)
npx expo start --tunnel

# 3. Démarrer spécifiquement pour Android
npx expo start --android

# 4. Démarrer avec tunnel pour Android
npx expo start --tunnel --android

# 5. Nettoyer le cache
npx expo start --clear

# 6. Démarrer en mode développement
npx expo start --dev-client

# 7. Vérifier la configuration
npx expo doctor

# 8. Installer les dépendances
npx expo install

# 9. Optimiser les assets
npx expo optimize

# 10. Publier les assets
npx expo publish
```

# Commande pour Android Studio

```bash
# 1. Générer le projet Android natif
npx expo prebuild --platform android

# 2. Ouvrir dans Android Studio
npx expo run:android --android

# 3. Nettoyer le projet Android
npx expo prebuild --platform android --clean

# 4. Générer avec configuration spécifique
npx expo prebuild --platform android --config app.config.js

# 5. Build debug avec Gradle
./gradlew assembleDebug

# 6. Build release avec Gradle
./gradlew assembleRelease

# 7. Installer l'APK sur l'appareil
./gradlew installDebug

# 8. Nettoyer le build
./gradlew clean

# 9. Voir les tâches disponibles
./gradlew tasks

# 10. Build bundle pour Play Store
./gradlew bundleRelease
```