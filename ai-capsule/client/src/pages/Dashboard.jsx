import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  project_name: '', prompt_title: '', prompt_version: '', prompt_text: '',
  response_summary: '', category: '', usefulness: '',
  reviewed: false, improved: false, screenshot_url: '', notes: '',
};

export default function Dashboard() {
  const [capsules, setCapsules] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const loadCapsules = async () => {
    try {
      const res = await fetch('/api/capsules', { credentials: 'include' });
      if (res.status === 401) {
        setError('Not logged in — please sign in first.');
        return;
      }
      setCapsules(await res.json());
      setError(null);
    } catch {
      setError('Could not reach the server.');
    }
  };

  useEffect(() => { loadCapsules(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/capsules/${editingId}` : '/api/capsules';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadCapsules();
    } else {
      setError('Save failed.');
    }
  };

  const handleEdit = (capsule) => {
    setForm({ ...capsule, reviewed: !!capsule.reviewed, improved: !!capsule.improved });
    setEditingId(capsule.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this prompt record?')) return;
    await fetch(`/api/capsules/${id}`, { method: 'DELETE', credentials: 'include' });
    loadCapsules();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 800 }}>
      <h1>Dashboard</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
        <h2>{editingId ? 'Edit record' : 'New record'}</h2>
        <input name="project_name" placeholder="Project name *" value={form.project_name} onChange={handleChange} required />
        <input name="prompt_title" placeholder="Prompt title *" value={form.prompt_title} onChange={handleChange} required />
        <input name="prompt_version" placeholder="Version (v1, v2...)" value={form.prompt_version} onChange={handleChange} />
        <textarea name="prompt_text" placeholder="Prompt text *" value={form.prompt_text} onChange={handleChange} required rows={3} />
        <textarea name="response_summary" placeholder="Response summary" value={form.response_summary} onChange={handleChange} rows={2} />
        <input name="category" placeholder="Category (Coding / Writing / Research)" value={form.category} onChange={handleChange} />
        <input name="usefulness" placeholder="Usefulness (Good / Needs Improvement)" value={form.usefulness} onChange={handleChange} />
        <label><input type="checkbox" name="reviewed" checked={form.reviewed} onChange={handleChange} /> Reviewed</label>
        <label><input type="checkbox" name="improved" checked={form.improved} onChange={handleChange} /> Improved</label>
        <input name="screenshot_url" placeholder="Screenshot URL" value={form.screenshot_url} onChange={handleChange} />
        <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} rows={2} />
        <div>
          <button type="submit">{editingId ? 'Update' : 'Create'}</button>
          {editingId && (
            <button type="button" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); }} style={{ marginLeft: '0.5rem' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>My prompts ({capsules.length})</h2>
      {capsules.map((c) => (
        <div key={c.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
          <strong>{c.prompt_title}</strong> <em>{c.prompt_version}</em>
          <div style={{ fontSize: '0.9em', color: '#666' }}>{c.project_name} · {c.category} · {c.usefulness}</div>
          <p>{c.prompt_text}</p>
          {c.notes && <p style={{ fontStyle: 'italic' }}>{c.notes}</p>}
          <button onClick={() => handleEdit(c)}>Edit</button>
          <button onClick={() => handleDelete(c.id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
        </div>
      ))}
    </div>
  );
}