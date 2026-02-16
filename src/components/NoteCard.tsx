import { Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onResize: (width: string, height: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete, onResize }: NoteCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Apply saved dimensions
  useEffect(() => {
    if (cardRef.current) {
      if (note.width) cardRef.current.style.width = note.width;
      if (note.height) cardRef.current.style.height = note.height;
    }
  }, [note.width, note.height]);

  const resizeTimeoutRef = useRef<any>();

  // Handle resizing
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      const entry = entries[0];
      if (entry && cardRef.current) {
        if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);

        // Use offsetWidth/Height to get the full border-box dimensions
        const width = cardRef.current.offsetWidth;
        const height = cardRef.current.offsetHeight;

        resizeTimeoutRef.current = setTimeout(() => {
          onResize(`${width}px`, `${height}px`);
        }, 500);
      }
    });

    observer.observe(cardRef.current);
    return () => {
      observer.disconnect();
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [onResize]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'JUST NOW';
    if (diffMins < 60) return `${diffMins}M AGO`;
    if (diffHours < 24) return `${diffHours}H AGO`;
    if (diffDays < 7) return `${diffDays}D AGO`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const mouseDownPos = useRef<{ x: number, y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseDownPos.current) return;

    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
    const dy = Math.abs(e.clientY - mouseDownPos.current.y);
    mouseDownPos.current = null;

    // If moved more than 5 pixels, assume it was a resize
    if (dx > 5 || dy > 5) {
      return;
    }

    onEdit();
  };

  return (
    <div
      className="note-card"
      style={{ background: note.color }}
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="note-header">
        <div className="note-time">{formatTime(note.timestamp)}</div>
        <div className="note-actions">
          <button
            className="note-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="note-content">
        <div
          dangerouslySetInnerHTML={{ __html: note.content }}
          style={{
            wordBreak: 'break-word',
            marginBottom: note.drawing ? '10px' : '0',
            maxHeight: note.drawing ? '100px' : 'none',
            overflow: 'hidden'
          }}
        />
        {note.drawing && (
          <img
            src={note.drawing}
            alt="drawing"
            style={{
              width: '100%',
              maxHeight: '120px',
              objectFit: 'contain',
              borderRadius: '4px',
              pointerEvents: 'none',
              opacity: 0.9
            }}
          />
        )}
      </div>
    </div>
  );
}
