import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

// Delete the test database so every run starts with a clean, empty one.
// The server builds the tables again when it starts up.
const file = process.env.DB_FILE || 'budget.test.db';

// SQLite can leave two extra files behind, so clear those as well.
for (const suffix of ['', '-wal', '-shm']) {
  rmSync(resolve(process.cwd(), file + suffix), { force: true });
}

console.log(`Reset test database: ${file}`);