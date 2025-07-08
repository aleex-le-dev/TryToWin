import React from "react";
import GameLayout from "./GameLayout";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Morpion2 = () => {
  return (
    <GameLayout
      title='Morpion2'
      stats={{
        win: 0,
        lose: 0,
        draw: 0,
        totalPoints: 0,
        totalGames: 0,
        winRate: 0,
      }}
      streak={0}
      currentTurnLabel='Votre tour'
      currentSymbol='X'
      timerLabel='0:00'
      renderMainActionButton={() => (
        <TouchableOpacity>
          <Ionicons name='refresh' size={22} color='#667eea' />
        </TouchableOpacity>
      )}>
      {/* Plateau fictif */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 32, color: "#667eea", marginBottom: 20 }}>
          [ Plateau Morpion2 ]
        </Text>
      </View>
    </GameLayout>
  );
};

export default Morpion2;
