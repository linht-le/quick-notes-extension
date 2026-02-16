import { FileText, Plus, Settings as SettingsIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import EditModal from './components/EditModal';
import NoteCard from './components/NoteCard';
import SettingsModal from './components/SettingsModal';
import { AppSettings, Note } from './types';

const PASTEL_COLORS = [
  '#fff9c4', '#e2f3e3', '#e3f2fd', '#fce4ec',
  '#f3e5f5', '#fff3e0', '#e0f7fa', '#ffffff'
];

const DEFAULT_SETTINGS: AppSettings = {
  ext_size: 'medium',
  font_size: 'medium',
  font_family: 'sans',
  line_height: 'normal',
};

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  useEffect(() => {
    // Load data from Chrome storage
    chrome.storage.local.get(['notes', 'app_settings'], (result) => {
      if (result.notes) setNotes(result.notes as Note[]);
      if (result.app_settings) {
        setSettings(result.app_settings as AppSettings);
      }
    });
  }, []);

  useEffect(() => {
    // Apply body classes from settings
    const body = document.body;
    body.className = '';
    body.classList.add(`size-${settings.ext_size}`);
    body.classList.add(`font-size-${settings.font_size}`);
    body.classList.add(`font-family-${settings.font_family}`);
    body.classList.add(`line-height-${settings.line_height}`);
  }, [settings]);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    chrome.storage.local.set({ notes: updatedNotes });
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    chrome.storage.local.set({ app_settings: updated });
  };

  const handleAddNote = () => {
    setCurrentNote(null);
    setIsEditModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setIsEditModalOpen(true);
  };

  const handleDeleteNote = (id: number) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    let updatedNotes: Note[];
    if (currentNote) {
      updatedNotes = notes.map(n => n.id === currentNote.id ? { ...n, ...noteData, timestamp: new Date().toISOString() } as Note : n);
    } else {
      const newNote: Note = {
        id: Date.now(),
        content: noteData.content || '',
        drawing: noteData.drawing || null,
        color: noteData.color || PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
        timestamp: new Date().toISOString(),
        width: '',
        height: 'auto',
      };
      updatedNotes = [newNote, ...notes];
    }
    saveNotes(updatedNotes);
    setIsEditModalOpen(false);
  };

  const handleResizeNote = useCallback((id: number, width: string, height: string) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, width, height } : n);
      chrome.storage.local.set({ notes: updated });
      return updated;
    });
  }, []);

  return (
    <div className="container">
      <header className="header">
        <button className="add-btn" onClick={handleAddNote}>
          <Plus size={20} />
        </button>
        <button className="add-btn" onClick={() => setIsSettingsModalOpen(true)}>
          <SettingsIcon size={20} />
        </button>
      </header>

      <main className="notes-container">
        {notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={64} strokeWidth={1} />
            </div>
            <p>No notes yet<br />Click <strong>+</strong> to start</p>
          </div>
        ) : (
          notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => handleEditNote(note)}
              onDelete={() => handleDeleteNote(note.id)}
              onResize={(w: string, h: string) => handleResizeNote(note.id, w, h)}
            />
          ))
        )}
      </main>

      {isEditModalOpen && (
        <EditModal
          note={currentNote}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveNote}
          onDelete={() => currentNote && handleDeleteNote(currentNote.id)}
          pastelColors={PASTEL_COLORS}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setIsSettingsModalOpen(false)}
          onUpdate={updateSettings}
        />
      )}
    </div>
  );
}
