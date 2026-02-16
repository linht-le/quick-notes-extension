import { X } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onClose: () => void;
  onUpdate: (newSettings: Partial<AppSettings>) => void;
}

export default function SettingsModal({ settings, onClose, onUpdate }: SettingsModalProps) {
  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content settings-content">
        <div className="modal-header">
          <div className="modal-left">
            <h3>Settings</h3>
          </div>
          <div className="modal-header-actions">
            <button className="header-icon-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className="setting-item">
            <label>Extension Size</label>
            <select
              value={settings.ext_size}
              onChange={(e) => onUpdate({ ext_size: e.target.value as any })}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Font Size</label>
            <select
              value={settings.font_size}
              onChange={(e) => onUpdate({ font_size: e.target.value as any })}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Font Family</label>
            <select
              value={settings.font_family}
              onChange={(e) => onUpdate({ font_family: e.target.value as any })}
            >
              <option value="sans">Sans-serif</option>
              <option value="serif">Serif</option>
              <option value="mono">Monospace</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Line Height</label>
            <select
              value={settings.line_height}
              onChange={(e) => onUpdate({ line_height: e.target.value as any })}
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
