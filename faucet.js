const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');

const app = express();
const port = process.env.PORT || 3000;

// === Configuration ===
const RPC_URL = 'https://testnet.dplabs-internal.com';
const PRIVATE_KEY = 'e12f9b03327a875c2d5bf9b40a75cd2effeed46ea508ee595c6bc708c386da8c';

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Anti-spam simple (1 envoi max par adresse tant que l'app tourne)
const sentAddresses = new Set();

app.use(bodyParser.json());

// === Endpoint faucet ===
app.post('/send', async (req, res) => {
  const { address } = req.body;

  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Adresse invalide' });
  }

  if (sentAddresses.has(address)) {
    return res.status(429).json({ error: 'Cette adresse a déjà reçu des fonds' });
  }

  try {
    const gasPrice = ethers.parseUnits('1', 'gwei'); // 🚫 empêche appel eth_maxPriorityFeePerGas

    console.log("🔁 Envoi vers :", address);

    const tx = await wallet.sendTransaction({
      to: address,
      value: ethers.parseUnits('0.001', 'ether'), // 0.001 PHRS natif
      gasLimit: 21000,
      gasPrice
    });

    console.log("✅ TX envoyée :", tx.hash);

    sentAddresses.add(address);
    return res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error('❌ Erreur interne :', error);
    return res.status(500).json({ error: error.message || 'Erreur interne' });
  }
});

// === Lancement du serveur ===
app.listen(port, () => {
  console.log(`🚀 FAROS Faucet actif sur le port ${port}`);
});
