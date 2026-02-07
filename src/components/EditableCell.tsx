import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface EditableCellProps {
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
  displayMultiplier?: number;
}

export function EditableCell({ 
  value, 
  onChange, 
  maxValue = 10,
  displayMultiplier = 1 
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!isEditing && cellRef.current === document.activeElement) {
        if (e.key === 'F2' || e.key === 'Enter') {
          e.preventDefault();
          startEditing();
        }
      }
    };

    const cell = cellRef.current;
    cell?.addEventListener('keydown', handleKeyDown);
    return () => cell?.removeEventListener('keydown', handleKeyDown);
  }, [isEditing]);

  const startEditing = () => {
    setEditValue(String(value));
    setIsEditing(true);
  };

  const commitEdit = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxValue) {
      onChange(numValue);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    } else if (e.key === 'Tab') {
      commitEdit();
    }
  };

  const displayValue = (value * displayMultiplier).toFixed(displayMultiplier === 1 ? 0 : 1);

  if (isEditing) {
    return (
      <td className="cell-editing p-0">
        <input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          min={0}
          max={maxValue}
          step={0.5}
          className="w-full h-full px-2 py-1.5 text-center bg-transparent outline-none"
        />
      </td>
    );
  }

  return (
    <td
      ref={cellRef}
      tabIndex={0}
      onDoubleClick={startEditing}
      className="cell-editable"
    >
      {displayValue}
    </td>
  );
}
