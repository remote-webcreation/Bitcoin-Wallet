import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
// Netzwerk: Testnet statt Mainnet!
import { writeFileSync } from 'fs';
import { Buffer } from 'buffer';

const ECPair = ECPairFactory(ecc);

const network = bitcoin.networks.testnet;
// Schlüsselpaar generieren
const keyPair = ECPair.makeRandom({ network });

// WIF = "Wallet Import Format" (für Backup)
const privateKey = keyPair.toWIF();
const { address } = bitcoin.payments.p2wpkh({
  pubkey: Buffer.from(keyPair.publicKey),
  network,
});

console.log("🚀 Deine Testnet-Adresse:", address);
console.log("🔐 Dein privater Schlüssel (WIF):", privateKey);

// ❗ Niemals keys/mywallet.json in Git tracken oder hochladen!
//    Dieser Ordner enthält sensible private Schlüssel und sollte
//    immer in deiner .gitignore stehen.

const walletData = {
    address,
    privateKey,
}

writeFileSync('keys/mywallet.json', JSON.stringify(walletData, null, 2));