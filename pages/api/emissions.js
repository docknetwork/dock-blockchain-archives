import fs from 'fs';
import path from 'path';

  const consensusConfig = {
    poa: {
      account: 'dock-poa-accounts.json',
      transfer: 'dock-poa-transfers.json'
    },
    pos: {
      account: 'dock-pos-accounts.json',
      transfer: 'dock-pos-transfers.json'
    }

  };

  export default function handler(req, res) {
  const { consensus } = req.query;

  if (!consensus) {
    return res.status(400).json({ error: 'Missing consensus type' });
  }

  const config = consensusConfig[consensus]
  if (!config) {
    return res.status(400).json({ error: 'Invalid network consensus type' });
  }

  const dataDir = path.join(process.cwd(), 'archives', consensus);

  const fileName = config['account'];
  if (!fileName) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  const filePath = path.join(dataDir, fileName);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let results = {};

  console.log(`Consensus: ${consensus} accounts: ${data.accounts.length}`);
    const total = data.accounts.reduce((sum, account) => {
      sum = sum + (Number(account.balance)||0);
      if (account.balance > 1000000) {
        console.log(`account: ${account.address} balance: ${account.balance}`);
      }
      return sum;
    }, 0);
    if (total) {
      results.emissions = total;
    }

  res.status(200).json(results);
}
