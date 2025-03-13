import fs from 'fs';
import path from 'path';
import { cryptoWaitReady, signatureVerify, decodeAddress } from '@polkadot/util-crypto';
import { u8aToHex, stringToU8a } from '@polkadot/util';
import { DOCK_SS58_FORMAT } from '../constants.js';

export default async function handler(req, res) {
  const migrationsFilePath = path.join(process.cwd(), 'archives', 'migrations', 'migrations.json');
  const { password } = req.headers;

  if (password !== process.env.MIGRATIONS_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { accountId } = req.query;
    if (fs.existsSync(migrationsFilePath)) {
      const fileContent = fs.readFileSync(migrationsFilePath, 'utf8');
      const migrations = JSON.parse(fileContent);
      const alreadyMigrated = migrations.some(migration => migration.dockAccount === accountId);
      res.status(200).json({ alreadyMigrated });
    } else {
      res.status(500).json({ error: 'Migrations file not found' });
    }
  } else if (req.method === 'POST') {
    const migrationObject = req.body;
    const message = JSON.stringify(migrationObject.message);

    // Validate the signature
    await cryptoWaitReady();
    const publicKey = decodeAddress(migrationObject.message.dockAccount, false, DOCK_SS58_FORMAT);
    const hexPublicKey = u8aToHex(publicKey);
    try {
      const { isValid } = signatureVerify(
        stringToU8a(message),
        migrationObject.signature,
        hexPublicKey
      );

      if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    try {
      const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: `Off-chain migration request:\n\`\`\`${JSON.stringify(migrationObject, null, 2)}\`\`\``
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message to Slack');
      }

      res.status(200).json({ message: 'Migration object published to Slack successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to publish migration object to Slack' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
