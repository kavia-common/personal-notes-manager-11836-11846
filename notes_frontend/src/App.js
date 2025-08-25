import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Notes Frontend Application
 * - Modern, light-themed layout with sidebar navigation
 * - Features: view, create, edit, delete, search notes
 * - Persistence: localStorage (with room for backend integration)
 * - Colors: primary #1976d2, secondary #424242, accent #ffb300
 */

// Types
/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {number} updatedAt
 * @property {string[]} tags
 */

// Utils
const STORAGE_KEY = 'notes_app_items_v1';

// PUBLIC_INTERFACE
export function loadNotes() {
  /** Load notes from localStorage with safe parsing. */
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveNotes(notes) {
  /** Save notes array to localStorage safely. */
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore storage errors
  }
}

// PUBLIC_INTERFACE
export function generateId() {
  /** Generate a reasonably unique ID. */
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// PUBLIC_INTERFACE
function App() {
  /** Root component for the notes app UI and state management. */
  const [notes, setNotes] = useState(() => loadNotes());
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState({ title: '', content: '', tags: '' });

  // Persist notes
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Keep draft in sync when selection changes
  useEffect(() => {
    const n = notes.find(n => n.id === selectedId);
    if (n) {
      setDraft({
        title: n.title,
        content: n.content,
        tags: n.tags?.join(', ') || ''
      });
    } else {
      setDraft({ title: '', content: '', tags: '' });
    }
  }, [selectedId, notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    return notes
      .filter(n => (n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q) || (n.tags || []).some(t => t.toLowerCase().includes(q))))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, search]);

  const selectedNote = useMemo(() => notes.find(n => n.id === selectedId) || null, [notes, selectedId]);

  // PUBLIC_INTERFACE
  const createNote = () => {
    /** Create a new blank note and select it. */
    const now = Date.now();
    const newNote = {
      id: generateId(),
      title: 'Untitled',
      content: '',
      updatedAt: now,
      tags: []
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedId(newNote.id);
  };

  // PUBLIC_INTERFACE
  const deleteNote = (id) => {
    /** Delete a note by id. */
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  // PUBLIC_INTERFACE
  const updateSelected = () => {
    /** Apply draft edits to the selected note. */
    if (!selectedNote) return;
    const tags = draft.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    setNotes(prev =>
      prev.map(n => (n.id === selectedNote.id
        ? { ...n, title: draft.title || 'Untitled', content: draft.content || '', tags, updatedAt: Date.now() }
        : n
      ))
    );
  };

  // PUBLIC_INTERFACE
  const clearAll = () => {
    /** Clear all notes (local reset). */
    if (!window.confirm('This will delete all notes from this browser. Continue?')) return;
    setNotes([]);
    setSelectedId(null);
  };

  return (
    <div className="app-shell">
      <Sidebar
        notes={filteredNotes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={createNote}
        onDelete={deleteNote}
        search={search}
        setSearch={setSearch}
        onClearAll={clearAll}
      />
      <main className="main-area">
        {selectedNote ? (
          <Editor
            draft={draft}
            setDraft={setDraft}
            onSave={updateSelected}
            note={selectedNote}
          />
        ) : (
          <EmptyState onCreate={createNote} />
        )}
        <Footer />
      </main>
    </div>
  );
}

function Sidebar({ notes, selectedId, onSelect, onCreate, onDelete, search, setSearch, onClearAll }) {
  /** Sidebar navigation with search, create, and list of notes. */
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">🗒️</div>
        <div>
          <div className="brand-title">Notes</div>
          <div className="brand-sub">Personal Manager</div>
        </div>
      </div>

      <div className="controls">
        <div className="search-bar">
          <input
            aria-label="Search notes"
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn primary" onClick={onCreate}>+ New Note</button>
        <button className="btn ghost" onClick={onClearAll} title="Delete all notes from this browser">Clear All</button>
      </div>

      <div className="list">
        {notes.length === 0 && <div className="empty-list">No notes. Create your first note!</div>}
        {notes.map(n => (
          <button
            key={n.id}
            className={`list-item ${selectedId === n.id ? 'active' : ''}`}
            onClick={() => onSelect(n.id)}
            title={n.title}
          >
            <div className="list-title">{n.title || 'Untitled'}</div>
            <div className="list-meta">
              <span>{new Date(n.updatedAt).toLocaleString()}</span>
              <span className="tags">{(n.tags || []).slice(0, 3).map(t => `#${t}`).join(' ')}</span>
            </div>
            <div className="list-actions" onClick={(e) => e.stopPropagation()}>
              <button className="icon-button danger" onClick={() => onDelete(n.id)} aria-label={`Delete note ${n.title}`}>🗑️</button>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function Editor({ draft, setDraft, onSave, note }) {
  /** Main editor for the selected note. */
  return (
    <section className="editor">
      <div className="editor-header">
        <input
          className="title-input"
          placeholder="Note title"
          value={draft.title}
          onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))}
        />
        <button className="btn accent" onClick={onSave}>Save</button>
      </div>

      <textarea
        className="content-area"
        placeholder="Write your note here..."
        value={draft.content}
        onChange={(e) => setDraft(d => ({ ...d, content: e.target.value }))}
      />

      <div className="editor-footer">
        <input
          className="tags-input"
          placeholder="Tags (comma separated)"
          value={draft.tags}
          onChange={(e) => setDraft(d => ({ ...d, tags: e.target.value }))}
        />
        <div className="updated-at">Last edited: {new Date(note.updatedAt).toLocaleString()}</div>
      </div>
    </section>
  );
}

function EmptyState({ onCreate }) {
  /** Placeholder when no note is selected. */
  return (
    <section className="empty-state">
      <h2>Welcome to Notes</h2>
      <p>Create, edit, and search your notes. Everything is saved in your browser.</p>
      <button className="btn primary" onClick={onCreate}>Create your first note</button>
    </section>
  );
}

function Footer() {
  /** App footer. */
  return (
    <footer className="footer">
      <span>Light themed • Primary #1976d2 • Secondary #424242 • Accent #ffb300</span>
      <span>Local storage persistence</span>
    </footer>
  );
}

export default App;
