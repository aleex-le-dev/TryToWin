// Page Application > Accessibilité
// Cette page centralise les engagements d'accessibilité et d'éthique.
// Les préférences sont persistées localement pour être consommées par l'app.
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Switch,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";

const STORAGE_KEYS = {
	HIGH_CONTRAST: "a11y_high_contrast",
	LARGE_TOUCH_TARGETS: "a11y_large_touch_targets",
	RESPECT_OS_PREFS: "a11y_respect_os_prefs",
	REDUCE_MOTION: "a11y_reduce_motion",
	LARGER_SPACING: "a11y_larger_spacing",
	SHOW_TUTORIALS: "a11y_show_tutorials",
	HAPTICS: "a11y_haptics",
	SOUNDS: "a11y_sounds",
};

const AccessibilitySettings = ({ navigation }) => {
	// États des préférences d'accessibilité
	const [highContrast, setHighContrast] = useState(true);
	const [largeTouchTargets, setLargeTouchTargets] = useState(true);
	const [respectOsPrefs, setRespectOsPrefs] = useState(true);
	const [reduceMotion, setReduceMotion] = useState(false);
	const [largerSpacing, setLargerSpacing] = useState(false);
	const [showTutorials, setShowTutorials] = useState(true);
	const [haptics, setHaptics] = useState(true);
	const [sounds, setSounds] = useState(false);

	// Chargement des préférences persistées
	useEffect(() => {
		(async () => {
			try {
				const entries = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
				const map = Object.fromEntries(entries);
				if (map[STORAGE_KEYS.HIGH_CONTRAST] != null)
					setHighContrast(map[STORAGE_KEYS.HIGH_CONTRAST] === "true");
				if (map[STORAGE_KEYS.LARGE_TOUCH_TARGETS] != null)
					setLargeTouchTargets(map[STORAGE_KEYS.LARGE_TOUCH_TARGETS] === "true");
				if (map[STORAGE_KEYS.RESPECT_OS_PREFS] != null)
					setRespectOsPrefs(map[STORAGE_KEYS.RESPECT_OS_PREFS] === "true");
				if (map[STORAGE_KEYS.REDUCE_MOTION] != null)
					setReduceMotion(map[STORAGE_KEYS.REDUCE_MOTION] === "true");
				if (map[STORAGE_KEYS.LARGER_SPACING] != null)
					setLargerSpacing(map[STORAGE_KEYS.LARGER_SPACING] === "true");
				if (map[STORAGE_KEYS.SHOW_TUTORIALS] != null)
					setShowTutorials(map[STORAGE_KEYS.SHOW_TUTORIALS] === "true");
				if (map[STORAGE_KEYS.HAPTICS] != null)
					setHaptics(map[STORAGE_KEYS.HAPTICS] === "true");
				if (map[STORAGE_KEYS.SOUNDS] != null)
					setSounds(map[STORAGE_KEYS.SOUNDS] === "true");
			} catch {}
		})();
	}, []);

	// Persistance utilitaire
	const persist = async (key, value) => {
		try {
			await AsyncStorage.setItem(key, String(value));
		} catch {}
	};

	// Lien de contact accessible
	const openContact = () => {
		try {
			Linking.openURL("mailto:support@trytowin.app?subject=Accessibilite");
		} catch {}
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					accessibilityLabel="Revenir en arrière"
					accessibilityRole="button"
					onPress={() => navigation.goBack()}
					style={styles.backBtn}>
					<Ionicons name='arrow-back' size={22} color='#23272a' />
				</TouchableOpacity>
				<Text style={styles.title}>Accessibilité et éthique</Text>
			</View>

			<ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
				{/* Contraste élevé, ergonomie mobile, labels accessibles */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Contraste et ergonomie</Text>
					<Row
						label="Contraste élevé"
						desc="Renforce les contrastes pour une meilleure lisibilité"
						value={highContrast}
						onValueChange={(v) => {
							setHighContrast(v);
							persist(STORAGE_KEYS.HIGH_CONTRAST, v);
						}}
					/>
					<Row
						label="Cibles tactiles larges"
						desc="Boutons et zones tactiles plus larges"
						value={largeTouchTargets}
						onValueChange={(v) => {
							setLargeTouchTargets(v);
							persist(STORAGE_KEYS.LARGE_TOUCH_TARGETS, v);
						}}
					/>
					<Text style={styles.note}>Tous les contrôles disposent d'un label accessible (compatibles VoiceOver/TalkBack).</Text>
				</View>

				{/* Navigation et tailles/espacements */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Navigation et tailles</Text>
					<Row
						label="Respecter les préférences de l'OS"
						desc="Taille du texte, contraste renforcé, etc."
						value={respectOsPrefs}
						onValueChange={(v) => {
							setRespectOsPrefs(v);
							persist(STORAGE_KEYS.RESPECT_OS_PREFS, v);
						}}
					/>
					<Row
						label="Réduire les animations"
						desc="Désactive certaines animations pour limiter la gêne visuelle"
						value={reduceMotion}
						onValueChange={(v) => {
							setReduceMotion(v);
							persist(STORAGE_KEYS.REDUCE_MOTION, v);
						}}
					/>
					<Row
						label="Espacements élargis"
						desc="Augmente les espacements et interlignes"
						value={largerSpacing}
						onValueChange={(v) => {
							setLargerSpacing(v);
							persist(STORAGE_KEYS.LARGER_SPACING, v);
						}}
					/>
					<Text style={styles.note}>Les parcours sont pensés pour l'usage à une main sur smartphone et tablette.</Text>
				</View>

				{/* Documentation, tutoriels, feedback */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Aide et feedback</Text>
					<Row
						label="Tutoriels et overlays d'aide"
						desc="Afficher des tutoriels contextuels à la première utilisation"
						value={showTutorials}
						onValueChange={(v) => {
							setShowTutorials(v);
							persist(STORAGE_KEYS.SHOW_TUTORIALS, v);
						}}
					/>
					<Row
						label="Vibrations (haptique)"
						desc="Feedback haptique lors d'actions importantes"
						value={haptics}
						onValueChange={(v) => {
							setHaptics(v);
							persist(STORAGE_KEYS.HAPTICS, v);
						}}
					/>
					<Row
						label="Sons système"
						desc="Jouer un son léger (désactivable) lors des validations"
						value={sounds}
						onValueChange={(v) => {
							setSounds(v);
							persist(STORAGE_KEYS.SOUNDS, v);
						}}
					/>
					<Text style={styles.note}>FAQ et tutoriels sont accessibles depuis l'app et lors de la découverte de nouvelles fonctions.</Text>
				</View>

				{/* Pratiques avancées et responsabilités éthiques */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Pratiques avancées et éthique</Text>
					<Text style={styles.paragraph}>
						Compatibilité privilégiée avec VoiceOver et TalkBack (annonces vocales, focus auto, textes alternatifs).
						Sons/animations désactivables. Multilingue prévu, gestion RTL lorsque nécessaire. Langage clair et navigation pour limiter la charge cognitive.
					</Text>
				</View>

				{/* Charte éthique et contact */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Charte éthique et inclusion</Text>
					<Text style={styles.paragraph}>
						L'application s'oppose à toute discrimination et favorise la diversité.
						Collecte de données minimale (privacy by design) et usage transparent.
					</Text>
					<TouchableOpacity
						accessibilityLabel="Contacter le support accessibilité"
						accessibilityRole="button"
						style={styles.contactBtn}
						onPress={openContact}>
						<Ionicons name='mail' size={18} color='#fff' />
						<Text style={styles.contactBtnText}>Signaler une difficulté d'accès</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

// Ligne paramètre avec Switch accessible
const Row = ({ label, desc, value, onValueChange }) => (
	<View style={styles.row}>
		<View style={{ flex: 1 }}>
			<Text style={styles.rowLabel}>{label}</Text>
			{!!desc && <Text style={styles.rowDesc}>{desc}</Text>}
		</View>
		<Switch
			accessibilityLabel={label}
			value={value}
			onValueChange={onValueChange}
		/>
	</View>
);

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff" },
	header: { flexDirection: "row", alignItems: "center", padding: 24, paddingBottom: 12 },
	backBtn: { marginRight: 10, padding: 4 },
	title: { color: "#23272a", fontSize: 22, fontWeight: "bold" },
	card: {
		backgroundColor: "#f8f9fa",
		marginHorizontal: 16,
		marginTop: 12,
		borderRadius: 14,
		padding: 16,
		elevation: 2,
	},
	cardTitle: { color: "#23272a", fontWeight: "bold", fontSize: 16, marginBottom: 8 },
	row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
	rowLabel: { color: "#23272a", fontSize: 14, fontWeight: "600" },
	rowDesc: { color: "#6c757d", fontSize: 12, marginTop: 2, maxWidth: 240 },
	note: { color: "#6c757d", fontSize: 12, marginTop: 6 },
	paragraph: { color: "#23272a", fontSize: 14 },
	contactBtn: { marginTop: 12, backgroundColor: "#667eea", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" },
	contactBtnText: { color: "#fff", fontWeight: "bold" },
});

export default AccessibilitySettings;
