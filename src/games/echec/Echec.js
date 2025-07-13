import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import GameLayout from "../GameLayout";

// Génère un plateau d'échecs vide (8x8)
function createInitialBoard() {
  const emptyRow = Array(8).fill(null);
  return Array(8)
    .fill(null)
    .map(() => [...emptyRow]);
}

// Composant principal du jeu d'échecs (IA vs Joueur)
const Echec = () => {
  // État du plateau
  const [board, setBoard] = useState(createInitialBoard());
  // Tour actuel : "white" ou "black"
  const [turn, setTurn] = useState("white");
  // Statistiques fictives pour l'exemple
  const stats = { win: 0, lose: 0, draw: 0, totalPoints: 0 };

  // Gestion du clic sur une case (à compléter pour la logique d'échecs)
  const handleCellPress = (rowIdx, colIdx) => {
    // Exemple : alterne le tour sans logique réelle
    setTurn(turn === "white" ? "black" : "white");
  };

  // Affichage du plateau d'échecs
  const renderBoard = () => (
    <View style={{ aspectRatio: 1, width: "98%", alignSelf: "center" }}>
      {board.map((row, rowIdx) => (
        <View key={rowIdx} style={{ flexDirection: "row", flex: 1 }}>
          {row.map((cell, colIdx) => {
            const isWhite = (rowIdx + colIdx) % 2 === 0;
            return (
              <TouchableOpacity
                key={colIdx}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  backgroundColor: isWhite ? "#f0d9b5" : "#b58863",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 0.5,
                  borderColor: "#888",
                }}
                onPress={() => handleCellPress(rowIdx, colIdx)}>
                {/* Affichage de la pièce (à compléter) */}
                <Text style={{ fontSize: 18 }}>{cell || ""}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );

  return (
    <GameLayout
      title='Échecs'
      stats={stats}
      streak={0}
      onBack={null}
      rank={null}
      totalPlayers={null}
      bestTime={null}
      currentTurnLabel={turn === "white" ? "Tour Blancs" : "Tour Noirs"}
      currentSymbol={turn === "white" ? "♔" : "♚"}
      timerLabel={null}
      renderMainActionButton={null}
      onPressMainActionButton={null}
      countryRank={null}
      countryTotal={null}
      countryCode={"FR"}
      showFirstTurnOverlay={false}>
      {/* Plateau d'échecs */}
      {renderBoard()}
      {/* À compléter : gestion des pièces, IA, victoire, etc. */}
    </GameLayout>
  );
};

export default Echec;
