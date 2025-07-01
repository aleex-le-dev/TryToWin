// Modèle utilisateur avec logique métier
// Utilisé pour gérer les données utilisateur dans toute l'application

export class User {
  constructor(data) {
    this.id = data.uid || data.id;
    this.email = data.email;
    this.displayName = data.displayName;
    this.photoURL = data.photoURL;
    this.createdAt = data.metadata?.creationTime;
    this.lastSignIn = data.metadata?.lastSignInTime;
    this.emailVerified = data.emailVerified || false;
  }

  static fromFirebase(firebaseUser) {
    return new User(firebaseUser);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      createdAt: this.createdAt,
      lastSignIn: this.lastSignIn,
      emailVerified: this.emailVerified,
    };
  }

  isValid() {
    return this.email && this.displayName;
  }

  getInitials() {
    if (!this.displayName) return "?";
    return this.displayName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
}
