// Modèle de score
// Utilisé pour gérer les scores des utilisateurs dans les jeux

export class Score {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.gameId = data.gameId;
    this.score = data.score;
    this.duration = data.duration;
    this.timestamp = data.timestamp || new Date();
    this.level = data.level || 'normal';
  }

  static fromFirestore(doc) {
    return new Score({ id: doc.id, ...doc.data() });
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      gameId: this.gameId,
      score: this.score,
      duration: this.duration,
      timestamp: this.timestamp,
      level: this.level,
    };
  }
} 