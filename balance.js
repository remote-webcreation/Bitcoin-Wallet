import fetch from 'node-fetch';

const address = 'tb1qrd9dqp3fvds2500wc2vl6cutpe38rgaa7xf7wd';

const url = `https://blockstream.info/testnet/api/address/${address}`;

try {
    const res = await fetch(url);
    const data = await res.json();

    const funded = data.chain_stats.funded_txo_sum / 1e8;
    const spent = data.chain_stats.spent_txo_sum / 1e8;
    const balance = funded - spent;

    console.log(`💰 Empfangene BTC: ${funded}`);
    console.log(`💸 Ausgegebene BTC: ${spent}`);
    console.log(`🧮 Aktueller Kontostand: ${balance} BTC`);

} catch (err) {
  console.error('❌ Fehler beim Abrufen des Kontostands:', err.message);
}