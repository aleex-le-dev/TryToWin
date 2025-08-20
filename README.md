# TryToWin

**TryToWin** est une application mobile de jeux multijoueurs contre l'ia Mistral avec profils personnalisés, classement mondial et par pays, QR code de partage, et interface moderne.

### Live 

Pour tester l'application, scannnez le qr code ci dessous à partir de l'application mobile Expo Go : 

![QR Code Expo Go](assets/eas-update.svg)


## 🎮 Fonctionnalités principales

### Jeux disponibles (contre IA Mistral)

- **Puissance 4** - Alignez 4 pions pour gagner
- **Othello** - Retournez les pions adverses
- **Morpion / TicTacToe** - 3 en ligne pour gagner 
- **Echec** - Plateau de jeux d'échec


### 🤖 Intelligence Artificielle

- **IA Mistral intégrée** dans tous les jeux
- Alternance intelligente entre joueur et IA


### 👤 Profils et Social

- Création et personnalisation avancée de profil (avatar, bannière, pays, bio, carrousel d'avatars)
- Classements : Top 10 mondial et par pays, pour chaque jeu et pour le profil
- Partage de profil via QR code ou lien unique
- Ajout d'ami par scan ou lien
- Statistiques détaillées par joueur et par jeu (victoires, défaites, nuls, points, séries de victoires, temps de jeu)

### 🎯 Système de Points

- Notifications toast personnalisées et harmonisées (succès, erreur, info)
- Gestion des scores avec multiplicateur de série de victoires
- Barème de points équilibré par jeu

### 🔐 Sécurité et Authentification

- Authentification sécurisée (Firebase) et gestion de la validation d'email
- Réinitialisation de mot de passe et gestion des erreurs utilisateur
- Upload et synchronisation de la photo de profil (Cloudinary)

### 🎨 Interface et UX

- Interface utilisateur moderne et responsive
- Support multi-plateforme (Android/iOS)
- Architecture modulaire (services, hooks, contextes, composants réutilisables)
- Effets visuels avancés (machine à écrire, textes animés)

## 📱 Aperçus de l'application

<div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
  <img src="assets/apercu/apercu1.png" width="48%" alt="Aperçu 1">
  <img src="assets/apercu/apercu2.png" width="48%" alt="Aperçu 2">
  <img src="assets/apercu/apercu3.png" width="48%" alt="Aperçu 3">
  <img src="assets/apercu/apercu4.png" width="48%" alt="Aperçu 4">
</div>

## 🚀 Technologies utilisées

- **Frontend** : React Native, Expo
- **Backend** : Firebase (Firestore, Authentication, Storage)
- **IA** : Mistral AI API
- **Navigation** : React Navigation
- **UI/UX** : React Native Animated, LinearGradient
- **Notifications** : React Native Toast Message
