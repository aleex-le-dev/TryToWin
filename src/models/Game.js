// Modèle de jeu
// Utilisé pour gérer les données des jeux dans l'application

export class Game {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.difficulty = data.difficulty;
    this.imageUrl = data.imageUrl;
    this.isActive = data.isActive || true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromFirestore(doc) {
    return new Game({ id: doc.id, ...doc.data() });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      difficulty: this.difficulty,
      imageUrl: this.imageUrl,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
