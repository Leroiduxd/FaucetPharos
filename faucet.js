const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');

const app = express();
const port = process.env.PORT || 3000;

// === Configuration ===
const RPC_URL = 'https://testnet.dplabs-internal.com';
const PRIVATE_KEY = 'e12f9b03327a875c2d5bf9b40a75cd2effeed46ea508ee595c6bc708c386da8c';

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const sentAddresses = new Set();

app.use(bodyParser.json());

app.post('/send', async (req, res) => {
  const { address } = req.body;

  if (!ethers.utils.isAddress(address)) {
    return res.status(400).json({ error: 'Adresse invalide' });
  }

  if (sentAddresses.has(address)) {
    return res.status(429).json({ error: 'Cette adresse a déjà reçu des fonds' });
  }

  try {
    const tx = await wallet.sendTransaction({
      to: address,
      value: ethers.utils.parseUnits('0.001', 'ether'),
      gasLimit: 21000,
      gasPrice: ethers.utils.parseUnits('1', 'gwei'),
    });

    console.log("✅ TX envoyée :", tx.hash);
    sentAddresses.add(address);
    res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error('❌ Erreur :', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Faucet FAROS actif sur le port ${port}`);
});
