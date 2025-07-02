// Composant de l'onglet Statistique du ProfileScreen
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const StatsTab = ({ userStats, styles, renderStatCard }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: "#f8f9fa",
      alignItems: "center",
      paddingTop: 18,
      paddingBottom: 32,
    }}>
    {/* Statistiques principales */}
    <View
      style={[
        styles.statsGrid,
        { width: "95%", alignSelf: "center", backgroundColor: "#fff" },
      ]}>
      {renderStatCard("trophy", userStats.totalScore, "Score Total", "#FF6B6B")}
      {renderStatCard(
        "game-controller",
        userStats.gamesPlayed,
        "Parties Jouées",
        "#4ECDC4"
      )}
      {renderStatCard(
        "checkmark-circle",
        userStats.gamesWon,
        "Victoires",
        "#45B7D1"
      )}
      {renderStatCard(
        "trending-up",
        `${userStats.winRate}%`,
        "Taux de Victoire",
        "#96CEB4"
      )}
    </View>
    {/* Statistiques détaillées */}
    <View style={[styles.detailedStats, { width: "95%", alignSelf: "center" }]}>
      <Text style={styles.sectionTitle}>Statistiques Détaillées</Text>
      <View style={styles.statRow}>
        <Ionicons name='star' size={20} color='#FFD700' />
        <Text style={styles.statRowLabel}>Meilleur jeu</Text>
        <Text style={styles.statRowValue}>{userStats.bestGame}</Text>
      </View>
      <View style={styles.statRow}>
        <Ionicons name='flame' size={20} color='#FF6B6B' />
        <Text style={styles.statRowLabel}>Série actuelle</Text>
        <Text style={styles.statRowValue}>
          {userStats.currentStreak} victoires
        </Text>
      </View>
      <View style={styles.statRow}>
        <Ionicons name='time' size={20} color='#4ECDC4' />
        <Text style={styles.statRowLabel}>Temps total</Text>
        <Text style={styles.statRowValue}>{userStats.totalTime}</Text>
      </View>
    </View>
    {/* Actions rapides */}
    <View style={[styles.quickActions, { width: "95%", alignSelf: "center" }]}>
      <Text style={styles.sectionTitle}>Actions Rapides</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name='share-outline' size={24} color='#667eea' />
          <Text style={styles.actionButtonText}>Partager</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name='download-outline' size={24} color='#667eea' />
          <Text style={styles.actionButtonText}>Exporter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name='help-circle-outline' size={24} color='#667eea' />
          <Text style={styles.actionButtonText}>Aide</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default StatsTab;
