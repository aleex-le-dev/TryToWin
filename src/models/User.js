// Modèle utilisateur avec logique métier
// Utilisé pour gérer les données utilisateur dans toute l'application

export class User {
  constructor(data) {
    this.id = data.uid || data.id;
    this.email = data.email;
    this.username = data.username || data.displayName || "Utilisateur";
    this.displayName = data.displayName;
    this.photoURL = data.photoURL;
    this.createdAt = data.metadata?.creationTime;
    this.lastSignIn = data.metadata?.lastSignInTime;
    this.emailVerified = data.emailVerified || false;
    this.points = data.points || 0;
    this.gamesPlayed = data.gamesPlayed || 0;
    this.bestScore = data.bestScore || 0;
  }

  static fromFirebase(firebaseUser) {
    return new User(firebaseUser);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      displayName: this.displayName,
      photoURL: this.photoURL,
      createdAt: this.createdAt,
      lastSignIn: this.lastSignIn,
      emailVerified: this.emailVerified,
      points: this.points,
      gamesPlayed: this.gamesPlayed,
      bestScore: this.bestScore,
    };
  }

  isValid() {
    return this.email && this.username;
  }

  getInitials() {
    if (!this.username) return "?";
    return this.username
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
}
