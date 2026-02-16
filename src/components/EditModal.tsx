import { Check, Edit3, Palette, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Note } from '../types';
import Canvas from './Canvas';
import ColorPicker from './ColorPicker';
import Toolbar from './Toolbar';

interface EditModalProps {
  note: Note | null;
  onClose: () => void;
  onSave: (noteData: Partial<Note>) => void;
  onDelete: () => void;
  pastelColors: string[];
}

export default function EditModal({ note, onClose, onSave, onDelete, pastelColors }: EditModalProps) {
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState(note?.color || pastelColors[Math.floor(Math.random() * pastelColors.length)]);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  // Drawing state
  const [brushColor, setBrushColor] = useState('#1a1a1a');
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // Text state
  const [fontSize, setFontSize] = useState(3);

  const editorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<{ getDataURL: () => string; clear: () => void; isBlank: () => boolean }>(null);

  useEffect(() => {
    if (editorRef.current && !isDrawMode) {
      editorRef.current.focus();
    }
  }, [isDrawMode]);

  const handleSave = () => {
    const editorContent = editorRef.current?.innerHTML || '';
    const textContent = editorRef.current?.innerText.trim() || '';
    const drawingData = canvasRef.current?.getDataURL() || null;
    const isCanvasBlank = canvasRef.current ? canvasRef.current.isBlank() : true;

    // If both text and drawing are empty, don't create/save
    if (!textContent && isCanvasBlank) {
      onClose();
      return;
    }

    onSave({
      content: editorContent,
      drawing: isCanvasBlank ? null : drawingData,
      color: color,
    });
  };

  const toggleDrawMode = () => {
    if (!isDrawMode) {
      // Switching to draw mode
      setIsDrawMode(true);
    } else {
      setIsDrawMode(false);
    }
  };

  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ backgroundColor: color }}>
        <div className="modal-header">
          <div className="modal-left">
            <button className="header-icon-btn" onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}>
              <Palette size={18} />
            </button>
            {isColorPickerOpen && (
              <ColorPicker
                colors={pastelColors}
                selectedColor={color}
                onSelect={(c: string) => { setColor(c); setIsColorPickerOpen(false); }}
              />
            )}
            <button className={`header-icon-btn ${isDrawMode ? 'active' : ''}`} onClick={toggleDrawMode}>
              <Edit3 size={18} />
            </button>
          </div>
          <div className="modal-header-actions">
            {note && (
              <button className="header-icon-btn" onClick={() => { onDelete(); onClose(); }}>
                <Trash2 size={18} />
              </button>
            )}
            <button className="header-icon-btn check-btn" onClick={handleSave}>
              <Check size={18} />
            </button>
            <button className="header-icon-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="draw-canvas-container" style={{ display: isDrawMode ? 'flex' : 'none' }}>
            <Canvas
              ref={canvasRef}
              initialImage={note?.drawing}
              brushColor={brushColor}
              brushSize={brushSize}
              isEraser={isEraser}
            />
          </div>

          <div
            className="editor"
            contentEditable
            suppressContentEditableWarning
            ref={editorRef}
            data-placeholder="Type something..."
            style={{ display: isDrawMode ? 'none' : 'block' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <Toolbar
            isDrawMode={isDrawMode}
            onClearCanvas={() => canvasRef.current?.clear()}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            isEraser={isEraser}
            setIsEraser={setIsEraser}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
        </div>
      </div>
    </div>
  );
}
