# Configuration des règles Firestore pour TryToWin

## Problème actuel

L'application rencontre une erreur de permissions lors de l'enregistrement des scores :

```
[FirebaseError: Missing or insufficient permissions.]
```

## Solution : Configuration des règles Firestore

### 1. Accéder aux règles Firestore

1. Allez sur la [Console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet `trytowin-c063c`
3. Dans le menu de gauche, cliquez sur "Firestore Database"
4. Cliquez sur l'onglet "Règles"

### 2. Règles recommandées pour le développement

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Règles pour les scores des utilisateurs
      match /scores/{gameId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Règles pour les classements (lecture publique, écriture authentifiée)
    match /leaderboards/{gameId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Règles plus permissives pour le développement uniquement

⚠️ **ATTENTION : Ces règles ne doivent être utilisées qu'en développement !**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Déploiement des règles

1. Copiez les règles dans l'éditeur de la console Firebase
2. Cliquez sur "Publier"
3. Attendez la confirmation de déploiement

### 5. Vérification

Après avoir déployé les règles, testez à nouveau la génération de données de test dans l'application.

## Mode de secours

Si les règles Firestore ne peuvent pas être modifiées, l'application utilise maintenant un mode de secours qui génère des données locales temporaires. Ces données ne sont pas persistées mais permettent de tester l'interface.

## Structure des données

### Collection `users/{userId}/scores/{gameId}`

```javascript
{
  win: number,           // Nombre de victoires
  draw: number,          // Nombre de nuls
  lose: number,          // Nombre de défaites
  totalPoints: number,   // Points totaux
  totalGames: number,    // Nombre total de parties
  totalScore: number,    // Score total
  totalDuration: number, // Durée totale en secondes
  bestScore: number,     // Meilleur score
  averageScore: number,  // Score moyen
  winRate: number,       // Taux de victoire en %
  currentStreak: number, // Série de victoires actuelle
  bestTime: number,      // Temps record en secondes
  lastUpdated: string,   // Date de dernière mise à jour
  lastPlayed: string     // Date de dernière partie
}
```

## Sécurité en production

Pour la production, utilisez des règles plus restrictives :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /scores/{gameId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /leaderboards/{gameId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```
