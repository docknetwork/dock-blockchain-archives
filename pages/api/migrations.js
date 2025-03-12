import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const migrationsFilePath = path.join(process.cwd(), 'archives', 'migrations', 'migrations.json');
  const { password } = req.headers;

  if (password !== process.env.NEXT_PUBLIC_MIGRATIONS_PASSWORD) {
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

    let migrations = [];
    if (fs.existsSync(migrationsFilePath)) {
      const fileContent = fs.readFileSync(migrationsFilePath, 'utf8');
      migrations = JSON.parse(fileContent);
    } else {
      res.status(500).json({ error: 'Migrations file not found' });
      return;
    }

    const migratedAccounts = migrations.map(migration => migration.dockAccount);
    if (migratedAccounts.includes(migrationObject.dockAccount)) {
      res.status(400).json({ error: 'This Dock account has already been migrated' });
      return;
    }

    migrations.push(migrationObject);

    fs.writeFileSync(migrationsFilePath, JSON.stringify(migrations, null, 2));

    res.status(200).json({ message: 'Migration object appended successfully' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
