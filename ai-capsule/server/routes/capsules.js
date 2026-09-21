const express = require('express');
const db = require('../db/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Every route in this file is JWT-protected.
router.use(requireAuth);

// READ — only the authenticated user's records
router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM capsules WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json(rows);
});

// CREATE — owner is taken from the verified JWT, not the request body
router.post('/', (req, res) => {
  const {
    project_name, prompt_title, prompt_version, prompt_text,
    response_summary, category, usefulness, reviewed,
    improved, screenshot_url, notes,
  } = req.body;

  if (!project_name || !prompt_title || !prompt_text) {
    return res.status(400).json({
      error: 'project_name, prompt_title and prompt_text are required',
    });
  }

  const result = db.prepare(`
    INSERT INTO capsules (
      user_id, project_name, prompt_title, prompt_version, prompt_text,
      response_summary, category, usefulness, reviewed, improved,
      screenshot_url, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id, project_name, prompt_title, prompt_version || '', prompt_text,
    response_summary || '', category || '', usefulness || '',
    reviewed ? 1 : 0, improved ? 1 : 0, screenshot_url || '', notes || ''
  );

  const created = db
    .prepare('SELECT * FROM capsules WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json(created);
});

// UPDATE — the user_id condition prevents editing another user's record
router.put('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM capsules WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!existing) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const merged = { ...existing, ...req.body };

  db.prepare(`
    UPDATE capsules SET
      project_name = ?, prompt_title = ?, prompt_version = ?, prompt_text = ?,
      response_summary = ?, category = ?, usefulness = ?, reviewed = ?,
      improved = ?, screenshot_url = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `).run(
    merged.project_name, merged.prompt_title, merged.prompt_version,
    merged.prompt_text, merged.response_summary, merged.category,
    merged.usefulness, merged.reviewed ? 1 : 0, merged.improved ? 1 : 0,
    merged.screenshot_url, merged.notes,
    req.params.id, req.user.id
  );

  const updated = db
    .prepare('SELECT * FROM capsules WHERE id = ?')
    .get(req.params.id);
  res.json(updated);
});

// DELETE — same ownership guard
router.delete('/:id', (req, res) => {
  const result = db
    .prepare('DELETE FROM capsules WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Record not found' });
  }
  res.json({ success: true });
});

module.exports = router;