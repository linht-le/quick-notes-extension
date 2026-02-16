import {
    Bold,
    Edit2, Eraser,
    Italic,
    List, ListOrdered,
    Quote,
    Underline,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ToolbarProps {
  isDrawMode: boolean;
  onClearCanvas: () => void;
  // Paint settings
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  isEraser: boolean;
  setIsEraser: (isEraser: boolean) => void;
  // Text settings
  fontSize: number;
  setFontSize: (size: number) => void;
}

export default function Toolbar({
  isDrawMode, onClearCanvas,
  brushColor, setBrushColor, brushSize, setBrushSize, isEraser, setIsEraser,
  fontSize, setFontSize
}: ToolbarProps) {
  const [commandStates, setCommandStates] = useState<Record<string, boolean>>({});

  const updateStates = () => {
    const states = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      blockquote: document.queryCommandValue('formatBlock')?.toLowerCase() === 'blockquote'
    };
    setCommandStates(states);
  };

  useEffect(() => {
    const handleEvents = () => updateStates();
    document.addEventListener('selectionchange', handleEvents);
    document.addEventListener('keyup', handleEvents);
    document.addEventListener('mouseup', handleEvents);
    return () => {
      document.removeEventListener('selectionchange', handleEvents);
      document.removeEventListener('keyup', handleEvents);
      document.removeEventListener('mouseup', handleEvents);
    };
  }, []);

  const handleAction = (e: React.MouseEvent, command: string, value: string | undefined = undefined) => {
    e.preventDefault(); // Prevent focus loss from editor
    document.execCommand(command, false, value);
    updateStates();
  };

  const PAINT_COLORS = ['#1a1a1a', '#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ffffff'];

  if (isDrawMode) {
    return (
      <div className="editor-toolbar">
        <div className="toolbar-row" id="paintTools">
          <div className="toolbar-group">
             <button
               className={`tool-btn ${!isEraser ? 'active' : ''}`}
               title="Pen Tool"
               onClick={() => setIsEraser(false)}
             >
               <Edit2 size={14} />
             </button>
             <button
               className={`tool-btn eraser-btn ${isEraser ? 'active' : ''}`}
               title="Eraser Tool"
               onClick={() => setIsEraser(true)}
             >
               <Eraser size={14} />
             </button>
             <button className="tool-btn" onClick={onClearCanvas} title="Clear Canvas">
               <X size={14} />
             </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="paint-color-grid">
            {PAINT_COLORS.map(color => (
              <div
                key={color}
                className={`paint-color-dot ${brushColor === color && !isEraser ? 'active' : ''}`}
                style={{ background: color }}
                onClick={() => {
                  setBrushColor(color);
                  setIsEraser(false);
                }}
              />
            ))}
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group" style={{ flex: 1, minWidth: '80px' }}>
            <input
              type="range"
              className="brush-size-input"
              min="1" max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              title="Brush Size"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-toolbar">
      <div className="toolbar-row" id="textTools">
        <div className="toolbar-group">
          <button className={`tool-btn ${commandStates.bold ? 'active' : ''}`} onMouseDown={(e) => handleAction(e, 'bold')} title="Bold">
            <Bold size={16} />
          </button>
          <button className={`tool-btn ${commandStates.italic ? 'active' : ''}`} onMouseDown={(e) => handleAction(e, 'italic')} title="Italic">
            <Italic size={16} />
          </button>
          <button className={`tool-btn ${commandStates.underline ? 'active' : ''}`} onMouseDown={(e) => handleAction(e, 'underline')} title="Underline">
            <Underline size={16} />
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button className={`tool-btn ${commandStates.insertUnorderedList ? 'active' : ''}`} onMouseDown={(e) => handleAction(e, 'insertUnorderedList')} title="Bullet List">
            <List size={16} />
          </button>
          <button className={`tool-btn ${commandStates.insertOrderedList ? 'active' : ''}`} onMouseDown={(e) => handleAction(e, 'insertOrderedList')} title="Numbered List">
            <ListOrdered size={16} />
          </button>
          <button className={`tool-btn ${commandStates.blockquote ? 'active' : ''}`} onMouseDown={(e) => handleAction(e, 'formatBlock', 'blockquote')} title="Quote">
            <Quote size={16} />
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
           <input
             type="range"
             className="brush-size-input" // Reuse same style
             min="1" max="7"
             value={fontSize}
             onMouseDown={(e) => e.stopPropagation()} // Prevent focus loss when starting to drag
             onChange={(e) => {
               const val = e.target.value;
               setFontSize(parseInt(val));
               document.execCommand('fontSize', false, val);
               updateStates();
             }}
             title="Font Size"
           />
        </div>
      </div>
    </div>
  );
}
