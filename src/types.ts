export interface Note {
  id: number;
  content: string;
  drawing: string | null;
  color: string;
  timestamp: string;
  width?: string;
  height?: string;
}

export interface AppSettings {
  ext_size: 'small' | 'medium' | 'large';
  font_size: 'small' | 'medium' | 'large';
  font_family: 'sans' | 'serif' | 'mono';
  line_height: 'tight' | 'normal' | 'relaxed';
}
