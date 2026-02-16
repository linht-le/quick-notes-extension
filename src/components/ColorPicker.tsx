
interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  onSelect: (color: string) => void;
}

export default function ColorPicker({ colors, selectedColor, onSelect }: ColorPickerProps) {
  return (
    <div className="color-picker-popup show">
      <div className="color-grid">
        {colors.map((color) => (
          <button
            key={color}
            className={`color-option ${selectedColor === color ? 'selected' : ''}`}
            style={{ background: color }}
            onClick={() => onSelect(color)}
          />
        ))}
      </div>
    </div>
  );
}
