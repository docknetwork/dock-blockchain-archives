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
  const { accountId, type, consensus } = req.query;

  if (!accountId || !type) {
    return res.status(400).json({ error: 'Missing accountId or type' });
  }

  const config = consensusConfig[consensus]
  if (!config) {
    return res.status(400).json({ error: 'Invalid network consensus type' });
  }

  const dataDir = path.join(process.cwd(), 'archives', consensus);

  const fileName = config[type];
  if (!fileName) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  const filePath = path.join(dataDir, fileName);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let results = [];

  if (type === 'account') {
    const accountInfo = data.accounts.find(account => account.address === accountId);
    if (accountInfo) {
      results.push(accountInfo);
    }
  } else if (type === 'transfer') {
    const transfers = data.transfers.filter(transfer => transfer.from === accountId || transfer.to === accountId);
    results = results.concat(transfers);
  }

  res.status(200).json(results);
}
