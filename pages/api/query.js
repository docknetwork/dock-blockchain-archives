import fs from 'fs';
import path from 'path';

  const consensusConfig = {
    poa: {
      account: 'dock-poa-accounts.json',
      transfer: 'dock-poa-transfers.json'
    },
    pos: {
      account: 'dock-pos-accounts.json',
      transfer: 'dock-pos-transfers.json',
      rewards: 'rewards'
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
  let results = [];

  // Handle rewards separately as they come from individual account files
  if (type === 'rewards') {
    // Rewards are only available for PoS
    if (consensus !== 'pos') {
      return res.status(400).json({ error: 'Rewards are only available for PoS consensus' });
    }
    
    // Read rewards from individual account file
    const rewardsFilePath = path.join(dataDir, 'rewards', `${accountId}.json`);
    
    if (fs.existsSync(rewardsFilePath)) {
      const rewardsData = JSON.parse(fs.readFileSync(rewardsFilePath, 'utf8'));
      results = rewardsData.rewards || [];
    }
  } else {
    // Handle account and transfer data from main files
    const fileName = config[type];
    if (!fileName) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    const filePath = path.join(dataDir, fileName);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (type === 'account') {
      const accountInfo = data.accounts.find(account => account.address === accountId);
      if (accountInfo) {
        results.push(accountInfo);
      }
    } else if (type === 'transfer') {
      const transfers = data.transfers.filter(transfer => transfer.from === accountId || transfer.to === accountId);
      const transfersWithTimestamp = transfers.map(transfer => ({
        ...transfer,
        timestamp: new Date(transfer.block_timestamp * 1000).toISOString()
      }));
      results = results.concat(transfersWithTimestamp);
    }
  }

  res.status(200).json(results);
}
