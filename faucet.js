const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');

const app = express();
const port = process.env.PORT || 3000;

const RPC_URL = 'https://testnet.dplabs-internal.com';
const PRIVATE_KEY = 'e12f9b03327a875c2d5bf9b40a75cd2effeed46ea508ee595c6bc708c386da8c';

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// USD Token config
const USD_CONTRACT = '0x78ac5e2d8a78a8b8e6d10c7b7274b03c10c91cef';
const USD_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const usdContract = new ethers.Contract(USD_CONTRACT, USD_ABI, wallet);

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
    console.log("🔁 Envoi de 0.001 PHRS + 10000 USD à :", address);

    const nativeTx = await wallet.sendTransaction({
      to: address,
      value: ethers.utils.parseUnits('0.001', 'ether'),
      gasLimit: 21000,
      gasPrice: ethers.utils.parseUnits('1', 'gwei'),
    });

    console.log("✅ TX native envoyée :", nativeTx.hash);

    const usdTx = await usdContract.transfer(address, ethers.utils.parseUnits('10000', 6));
    console.log("✅ TX USD envoyée :", usdTx.hash);

    sentAddresses.add(address);
    res.json({ success: true, txHashNative: nativeTx.hash, txHashUSD: usdTx.hash });
  } catch (error) {
    console.error('❌ Erreur :', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 FAROS Faucet actif sur le port ${port}`);
});
