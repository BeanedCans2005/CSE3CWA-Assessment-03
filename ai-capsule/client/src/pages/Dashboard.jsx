import React, { useEffect, useState } from 'react';

const EMPTY_FORM = {
  project_name: '', prompt_title: '', prompt_version: '', prompt_text: '',
  response_summary: '', category: '', usefulness: '',
  reviewed: false, improved: false, screenshot_url: '', notes: '',
};

const CATEGORIES = ['All', 'Coding', 'Writing', 'Research'];

export default function Dashboard() {
  const [capsules, setCapsules] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

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

  const visibleCapsules = activeTab === 'All'
    ? capsules
    : capsules.filter((c) => (c.category || '').toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="page">
      <h1>Dashboard</h1>
      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <h2>{editingId ? 'Edit record' : 'New record'}</h2>
        <div className="form-grid">
          <input name="project_name" placeholder="Project name *" value={form.project_name} onChange={handleChange} required />
          <input name="prompt_title" placeholder="Prompt title *" value={form.prompt_title} onChange={handleChange} required />
          <input name="prompt_version" placeholder="Version (v1, v2...)" value={form.prompt_version} onChange={handleChange} />
          <textarea name="prompt_text" placeholder="Prompt text *" value={form.prompt_text} onChange={handleChange} required rows={3} />
          <textarea name="response_summary" placeholder="Response summary" value={form.response_summary} onChange={handleChange} rows={2} />
          <input name="category" placeholder="Category (Coding / Writing / Research)" value={form.category} onChange={handleChange} />
          <input name="usefulness" placeholder="Usefulness (Good / Needs Improvement)" value={form.usefulness} onChange={handleChange} />
          <label className="checkbox-row">
            <input type="checkbox" name="reviewed" checked={form.reviewed} onChange={handleChange} /> Reviewed
          </label>
          <label className="checkbox-row">
            <input type="checkbox" name="improved" checked={form.improved} onChange={handleChange} /> Improved
          </label>
          <input name="screenshot_url" placeholder="Screenshot URL" value={form.screenshot_url} onChange={handleChange} />
          <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} rows={2} />
        </div>
        <div className="form-actions">
          <button type="submit">{editingId ? 'Update' : 'Create'}</button>
          {editingId && (
            <button type="button" className="ghost" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>My prompts ({capsules.length})</h2>
      <div className="tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`tab ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {visibleCapsules.map((c) => (
          <div key={c.id} className="capsule-card">
            {!!c.reviewed && <span className="stamp">Reviewed</span>}
            <span className="capsule-title">{c.prompt_title}</span>
            {c.prompt_version && <span className="capsule-version">{c.prompt_version}</span>}
            <div className="capsule-meta">
              {c.project_name && <span>{c.project_name}</span>}
              {c.category && <span>{c.category}</span>}
            </div>
            <hr className="capsule-divider" />
            <p className="capsule-text">{c.prompt_text}</p>
            {c.notes && <p className="capsule-notes">{c.notes}</p>}
            {c.usefulness && (
              <span className={`tag ${c.usefulness.toLowerCase().includes('good') ? 'tag-good' : 'tag-needs'}`}>
                {c.usefulness}
              </span>
            )}
            <div className="capsule-actions">
              <button className="ghost" onClick={() => handleEdit(c)}>Edit</button>
              <button className="danger" onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}