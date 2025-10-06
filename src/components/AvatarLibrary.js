// Composant AvatarLibrary : sélection d'avatars multi-collections (carrousel horizontal 2 lignes)
// Utilisé dans la modale de modification de profil pour choisir un avatar
// UX : carrousel infini horizontal sur 2 lignes pour toutes les collections

import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import { AVATAR_COLLECTIONS } from "../constants/avatars";

const HorizontalGridCarousel = ({
  data,
  onSelect,
  imageStyle,
  btnStyle,
  numRows = 2,
}) => {
  // Découpe les données en colonnes (une colonne = numRows éléments)
  const columns = [];
  for (let i = 0; i < data.length; i += numRows) {
    columns.push(data.slice(i, i + numRows));
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 0,
        marginBottom: 0,
      }}>
      {columns.map((col, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: "column",
            alignItems: "center",
            marginRight: 8,
          }}>
          {col.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => onSelect(item.url)}
              style={btnStyle}>
              <Image 
                source={{ uri: item.url }} 
                style={imageStyle}
                accessibilityLabel={`Avatar ${item.name}`}
              />
            </TouchableOpacity>
          ))}
          {/* Si la colonne n'a qu'un élément (dernier impair), on ajoute un espace vide pour garder la grille */}
          {col.length < numRows &&
            Array(numRows - col.length)
              .fill(0)
              .map((_, i) => (
                <View
                  key={i}
                  style={{
                    height: imageStyle?.height || 52,
                    width: imageStyle?.width || 52,
                    margin: 6,
                  }}
                />
              ))}
        </View>
      ))}
    </ScrollView>
  );
};


const AvatarLibrary = ({ onSelect }) => {
  const [currentCollection, setCurrentCollection] = useState(0);
  const currentCollectionData = AVATAR_COLLECTIONS[currentCollection];

  // Styles spécifiques selon la collection
  const getImageStyle = () =>
    currentCollectionData.id === "flags" ? styles.flagImg : styles.avatarImg;
  const getBtnStyle = () =>
    currentCollectionData.id === "animals"
      ? styles.animalBtn
      : styles.avatarBtn;

  // Affichage d'un message si la collection est vide
  if (
    !currentCollectionData.avatars ||
    currentCollectionData.avatars.length === 0
  ) {
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.collectionTabs}
          contentContainerStyle={styles.collectionTabsContent}>
          {AVATAR_COLLECTIONS.map((collection, index) => (
            <TouchableOpacity
              key={collection.id}
              style={[
                styles.collectionTab,
                currentCollection === index && styles.collectionTabActive,
              ]}
              onPress={() => setCurrentCollection(index)}>
              <Text
                style={[
                  styles.collectionTabText,
                  currentCollection === index && styles.collectionTabTextActive,
                ]}>
                {collection.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.collectionHeader}>
          <Text style={styles.collectionTitle}>
            {currentCollectionData.name}
          </Text>
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#888", fontSize: 16, marginTop: 30 }}>
            Aucun avatar à afficher dans cette collection
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Onglets minimalistes pour changer de collection */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.collectionTabs}
        contentContainerStyle={styles.collectionTabsContent}>
        {AVATAR_COLLECTIONS.map((collection, index) => (
          <TouchableOpacity
            key={collection.id}
            style={[
              styles.collectionTab,
              currentCollection === index && styles.collectionTabActive,
            ]}
            onPress={() => setCurrentCollection(index)}>
            <Text
              style={[
                styles.collectionTabText,
                currentCollection === index && styles.collectionTabTextActive,
              ]}>
              {collection.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Titre de la collection actuelle */}
      <View style={styles.collectionHeader}>
        <Text style={styles.collectionTitle}>{currentCollectionData.name}</Text>
        <Text style={styles.collectionSubtitle}>
          {currentCollectionData.avatars.length} avatars disponibles
        </Text>
      </View>

      {/* Carrousel horizontal 2 lignes pour toutes les collections */}
      <HorizontalGridCarousel
        data={currentCollectionData.avatars}
        onSelect={onSelect}
        imageStyle={getImageStyle()}
        btnStyle={getBtnStyle()}
        numRows={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 260,
  },
  collectionTabs: {
    maxHeight: 35,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  collectionTabsContent: {
    paddingHorizontal: 8,
  },
  collectionTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 15,
    backgroundColor: "#f8f9fa",
  },
  collectionTabActive: {
    backgroundColor: "#667eea",
  },
  collectionTabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  collectionTabTextActive: {
    color: "#fff",
  },
  collectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: "center",
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  collectionSubtitle: {
    fontSize: 11,
    color: "#666",
  },
  avatarBtn: {
    margin: 6,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#eee",
    overflow: "hidden",
    width: 52,
    height: 52,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  animalBtn: {
    margin: 6,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#bbb",
    overflow: "hidden",
    width: 52,
    height: 52,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    resizeMode: "cover",
  },
  flagImg: {
    width: 54,
    height: 36,
    borderRadius: 18,
    resizeMode: "cover",
  },
});

export default AvatarLibrary;
