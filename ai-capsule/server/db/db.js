const path = require('path');
const Database = require('better-sqlite3');

// NOTE (from assignment spec): on Render's free tier the local filesystem
// is ephemeral — this SQLite file may be wiped on restart/redeploy.
// Document that limitation in the README when we get to deployment.
const db = new Database(path.join(__dirname, 'capsules.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS capsules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    prompt_title TEXT NOT NULL,
    prompt_version TEXT,
    prompt_text TEXT NOT NULL,
    response_summary TEXT,
    category TEXT,
    usefulness TEXT,
    reviewed INTEGER DEFAULT 0,
    improved INTEGER DEFAULT 0,
    screenshot_url TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;