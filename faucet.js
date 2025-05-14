const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');

const app = express();
const port = process.env.PORT || 3000;

// Configuration
const RPC_URL = 'https://testnet.dplabs-internal.com';
const PRIVATE_KEY = 'e12f9b03327a875c2d5bf9b40a75cd2effeed46ea508ee595c6bc708c386da8c';

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const sentAddresses = new Set();

app.use(bodyParser.json());

app.post('/send', async (req, res) => {
  const { address } = req.body;

  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Adresse invalide' });
  }

  if (sentAddresses.has(address)) {
    return res.status(429).json({ error: 'Déjà reçu' });
  }

 try {
  const tx = await wallet.sendTransaction({
    to: address,
    value: ethers.parseUnits('0.001', 'ether'),
    gasLimit: 21000,
    gasPrice: ethers.parseUnits('1', 'gwei') // important pour RPC Pharos
  });

  sentAddresses.add(address);
  return res.json({ success: true, txHash: tx.hash });
} catch (error) {
  console.error('Erreur en envoyant :', error.message);
  return res.status(500).json({ error: error.message });
}
