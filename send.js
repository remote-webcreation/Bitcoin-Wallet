import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';
import { readFileSync } from 'fs';
import { Buffer } from 'buffer';

const ECPair = ECPairFactory(ecc);
const network = bitcoin.networks.testnet;

// 📥 Wallet laden
const wallet = JSON.parse(readFileSync('./keys/mywallet.json', 'utf-8'));
const keyPair = ECPair.fromWIF(wallet.privateKey, network);
const senderAddress = wallet.address;

// ✏️ Zieladresse und Betrag in Satoshi
const recipientAddress = 'tb1qrd9dqp3fvds2500wc2vl6cutpe38rgaa7xf7wd'; // ERSETZEN!
const amountToSend = 1000; // z. B. 1000 sats (0.00001 BTC)
const fee = 500; // fixe Gebühr

// 🔍 UTXOs abrufen
const utxos = (await axios.get(`https://blockstream.info/testnet/api/address/${senderAddress}/utxo`)).data;

if (utxos.length === 0) {
  console.log('❌ Kein verfügbares Guthaben.');
  process.exit(1);
}

// 🎯 UTXO auswählen (für Demo: nur den ersten)
const utxo = utxos[0];
const txid = utxo.txid;
const vout = utxo.vout;
const value = utxo.value;

if (value < amountToSend + fee) {
  console.log('❌ Nicht genug Guthaben inkl. Gebühr.');
  process.exit(1);
}

// 🧠 Raw TX zur Signatur vorbereiten
const psbt = new bitcoin.Psbt({ network });

psbt.addInput({
  hash: txid,
  index: vout,
  witnessUtxo: {
    script: bitcoin.payments.p2wpkh({ pubkey: Buffer.from(keyPair.publicKey), network }).output,
    value: value,
  },
});

psbt.addOutput({
  address: recipientAddress,
  value: amountToSend,
});

psbt.addOutput({
  address: senderAddress,
  value: value - amountToSend - fee, // Rückgabe (change)
});

// ✍️ Signieren & abschließen
psbt.signAllInputs(keyPair);
psbt.finalizeAllInputs();
const rawTx = psbt.extractTransaction().toHex();

// 📤 Transaktion broadcasten
const res = await axios.post('https://blockstream.info/testnet/api/tx', rawTx);

console.log('✅ Transaktion gesendet!');
console.log('🔗 TXID:', res.data);