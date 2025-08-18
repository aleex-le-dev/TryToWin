// Script de test pour générer un QR code de test


const QRCode = require('qrcode');

// ID d'utilisateur de test (correspond à "MariePro" dans allUsers)

const testUserId = "1";
const testProfileLink = `trytowin://addfriend/${testUserId}`;

// Générer le QR code
QRCode.toFile('test-qr-code.png', testProfileLink, {
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  width: 300,
  margin: 2
}, function(err) {
  if (err) {
    console.error('Erreur lors de la génération du QR code:', err);
  } else {
    console.log('QR code de test généré avec succès !');
    console.log('Lien encodé:', testProfileLink);
    console.log('Fichier: test-qr-code.png');
    console.log('');
    console.log('Instructions de test:');
    console.log('1. Ouvrez l\'application TryToWin');
    console.log('2. Allez dans l\'onglet Social');
    console.log('3. Cliquez sur "Scanner un QR code"');
    console.log('4. Scannez le QR code généré');
    console.log('5. MariePro devrait être ajouté à vos amis');
    console.log('');
    console.log('Note: Pour tester avec un vrai utilisateur:');
    console.log('- Remplacez testUserId par un vrai ID Firestore');
    console.log('- Le système récupérera automatiquement le vrai nom depuis Firestore');
  }
}); 