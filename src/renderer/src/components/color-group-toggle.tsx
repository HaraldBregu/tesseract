import { clsx } from "clsx";
import Typogaphy from "@/components/Typography";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useEffect, useMemo, useState } from "react";

const COLORS = [
  { value: '#ffffff', label: 'White' },
  { value: '#ffa500', label: 'Orange' },
  { value: '#ffff00', label: 'Yellow' },
  { value: '#00ff00', label: 'Lime' },
  { value: '#00ffff', label: 'Cyan' },
  { value: '#4682b4', label: 'Steel Blue' },
  { value: '#0000ff', label: 'Blue' },
  { value: '#8000ff', label: 'Purple' },
  { value: '#000000', label: 'Black' },
];

const COLOR_VALUES = COLORS.map(c => c.value.toLowerCase());

const ensureHexColor = (c?: string) => {
  if (!c) return '#000000';
  const s = c.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) {
    if (s.length === 4) return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
    return s.toUpperCase();
  }
  const noHash = s.replace(/^#/, '');
  if (/^[0-9a-f]{6}$/i.test(noHash)) return ('#' + noHash).toUpperCase();
  return '#000000';
};

function ColorToggleGroup({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const normalized = ensureHexColor(value);
  const isPredefined = COLOR_VALUES.includes(normalized.toLowerCase());

  const [customColor, setCustomColor] = useState('#000000');

  useEffect(() => {
    if (!isPredefined) {
      setCustomColor(normalized);
    }
  }, [isPredefined, normalized]);

  const activeToggleValue = useMemo(() => {
    return isPredefined ? normalized.toLowerCase() : 'custom';
  }, [isPredefined, normalized]);

  const safeEmit = (next: string) => {
    const hex = ensureHexColor(next);
    if (hex !== normalized) onChange(hex);
  };

  return (
    <div>
      <Typogaphy component="p" className="ml-2 mb-1 text-[12px] font-semibold">
        Text Color
      </Typogaphy>

      <ToggleGroup.Root
        type="single"
        value={activeToggleValue}
        onValueChange={(val) => {
          if (!val) return;
          if (val === 'custom') {
            safeEmit(customColor);
          } else {
            safeEmit(val);
          }
        }}
        className="flex gap-2 flex-wrap p-1"
      >
        {COLORS.map((color) => {
          const v = color.value.toLowerCase();
          return (
            <ToggleGroup.Item
              key={v}
              value={v}
              className={clsx(
                'w-[40px] h-[40px] border border-gray-300 rounded overflow-hidden',
                activeToggleValue === v && 'outline outline-[3px] outline-blue-600'
              )}
              style={{
                background: color.value,
                borderColor: color.value === '#ffffff' ? '#C2C7CF' : undefined,
              }}
              aria-label={`Color ${color.label}`}
            />
          );
        })}

        <ToggleGroup.Item
          value="custom"
          className={clsx(
            'relative w-[40px] h-[40px] border border-gray-300 rounded overflow-hidden',
            activeToggleValue === 'custom' && 'outline outline-[3px] outline-blue-600'
          )}
          style={{
            background: isPredefined
              ? 'conic-gradient(red, orange, yellow, lime, cyan, blue, indigo, violet, red)'
              : normalized,
            borderColor: '#C2C7CF',
          }}
          aria-label="Custom Color"
        >
          {!isPredefined && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
                borderRadius: '20px',
                pointerEvents: 'none',
              }}
            />
          )}
          <input
            type="color"
            value={isPredefined ? customColor : normalized}
            onChange={(e) => {
              setCustomColor(e.target.value);
              safeEmit(e.target.value);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
}

export default ColorToggleGroup;
