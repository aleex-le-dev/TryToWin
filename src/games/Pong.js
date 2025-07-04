/**
 * Composant du jeu Pong.
 * Enregistre et affiche uniquement les points du barème (pas de score brut).
 * Utilisé dans la navigation et la BDD sous l'identifiant "Pong".
 */
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  recordGameResult,
  getUserGameScore,
  getUserRankInLeaderboard,
} from "../services/scoreService";
import { useAuth } from "../hooks/useAuth";
import { GAME_POINTS, getSerieMultiplier } from "../constants/gamePoints";
import GameLayout from "./GameLayout";

const Pong = ({ navigation }) => {
  const { user } = useAuth();
  const [partieTerminee, setPartieTerminee] = useState(false);
  const [stats, setStats] = useState({
    win: 0,
    draw: 0,
    lose: 0,
    totalPoints: 0,
    totalGames: 0,
    winRate: 0,
  });
  const [rank, setRank] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(null);

  useEffect(() => {
    const chargerStats = async () => {
      if (user?.id) {
        const s = await getUserGameScore(user.id, "Pong");
        setStats(s);
        const { rank, total } = await getUserRankInLeaderboard(user.id, "Pong");
        setRank(rank);
        setTotalPlayers(total);
      }
    };
    chargerStats();
  }, [user?.id]);

  const enregistrerVictoire = async () => {
    if (user?.id) {
      await recordGameResult(user.id, "Pong", "win", 0, 0);
      const s = await getUserGameScore(user.id, "Pong");
      setStats(s);
      const { rank, total } = await getUserRankInLeaderboard(user.id, "Pong");
      setRank(rank);
      setTotalPlayers(total);

      // Afficher le toast avec les points gagnés et la série si applicable
      const points = GAME_POINTS["Pong"]["win"];
      const mult = getSerieMultiplier(s.currentStreak);
      const pointsAvecMultiplicateur =
        mult > 0 ? Math.round(points * (1 + mult)) : points;

      let toastConfig = {
        type: "success",
        position: "top",
        topOffset: 40,
        visibilityTime: 3000,
      };

      if (mult > 0) {
        toastConfig.text1 = `🔥 Victoire ! Série de ${s.currentStreak}`;
        toastConfig.text2 = `+${pointsAvecMultiplicateur} points (x${(
          1 + mult
        ).toFixed(2)})`;
      } else {
        toastConfig.text1 = "Victoire enregistrée !";
        toastConfig.text2 = `+${points} points`;
      }

      Toast.show(toastConfig);
    }
  };

  return (
    <GameLayout
      title='Pong'
      stats={stats}
      streak={stats.currentStreak}
      onBack={() => navigation.goBack()}>
      <View style={styles.container}>
        <Text style={styles.title}>Pong</Text>
        {/* Plateau de jeu à implémenter ici */}
        <TouchableOpacity style={styles.button} onPress={enregistrerVictoire}>
          <Ionicons name='trophy' size={20} color='#fff' />
          <Text style={styles.buttonText}>Simuler une victoire</Text>
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text>Points : {stats.totalPoints}</Text>
          <Text>Victoires : {stats.win}</Text>
          <Text>Nuls : {stats.draw}</Text>
          <Text>Défaites : {stats.lose}</Text>
          <Text>Parties : {stats.totalGames}</Text>
          <Text>Winrate : {stats.winRate}%</Text>
          <Text>
            Classement : {rank ? `#${rank} sur ${totalPlayers}` : "-"}
          </Text>
        </View>
      </View>
      <Toast />
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#667eea",
    padding: 12,
    borderRadius: 8,
    marginVertical: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  stats: { marginTop: 20 },
});

export default Pong;
