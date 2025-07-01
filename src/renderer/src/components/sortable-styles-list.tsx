import { clsx } from 'clsx';
import { useRef } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import { DndContext, KeyboardSensor, PointerSensor, pointerWithin, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Copy from "@/components/icons/Copy";
import Button from "@/components/ui/button";
import DragHandle from "@/components/icons/DragHandle";
import Delete from "@/components/icons/Delete";
import { getNextName } from '@/utils/stylesUtils';
import { v4 as uuidv4 } from 'uuid'

import { useTheme } from '@/hooks/use-theme';

function SortableStyleItem({ id, item, onDelete, onDuplicate, selected, onStyleSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { isDark } = useTheme();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      onClick={onStyleSelect}
      style={style}
      className={clsx(
        'flex items-center justify-between px-3 py-2 select-none rounded',
        isDragging && 'opacity-50',
        selected && 'bg-[#0625ac] text-white',
      )}
    >
      <div className="flex items-center gap-2">
        <span className="cursor-grab" {...listeners}>
          <DragHandle size={20} color={selected && 'white'} className="dark:text-white" />
        </span>
        <span
          className="truncate"
          style={{
            fontFamily: item.fontFamily,
            fontSize: item.fontSize,
            fontWeight: item.fontWeight,
            // color: selected ? 'white' : item.color,
            color: selected ? 'white' : isDark ? 'white' : item.color,
            display: 'inline-block',
            maxWidth: '9.5rem',
          }}
        >
          {item.name}
        </span>
      </div>
      <div className="flex gap-2">
        {item.name.split(".").length < 3 && (
          <Button
            variant="icon"
            size="iconMini"
            intent="secondary"
            icon={<Copy size={20} color={selected && 'white'} />}
            onClick={onDuplicate}
          />
        )}
        {item.type === "CUSTOM" && <Button
          variant="icon"
          size="iconMini"
          intent="secondary"
          icon={<Delete size={20} color={selected && 'white'} />}
          onClick={onDelete}
        />}
      </div>
    </div>
  );
}


function SortableStylesList({ styles, onStylesChange, selectedStyle, onStyleSelect }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext
      collisionDetection={pointerWithin}
      sensors={sensors}
      modifiers={[restrictToFirstScrollableAncestor]}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;

        const oldIndex = styles.findIndex(i => i.id === active.id);
        const newIndex = styles.findIndex(i => i.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = arrayMove(styles, oldIndex, newIndex);
          onStylesChange(newItems);

          if (newIndex === newItems.length - 1) {
            setTimeout(() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  top: scrollRef.current.scrollHeight,
                  behavior: 'smooth',
                });
              }
            }, 0);
          }
        }
      }}
    >
      <SortableContext items={styles.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={scrollRef}
          className="max-h-[400px] overflow-y-auto pb-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {styles.map(item => (
            <SortableStyleItem
              key={item.id}
              id={item.id}
              item={item}
              onStyleSelect={() => onStyleSelect(item)}
              selected={selectedStyle?.id === item.id}
              onDelete={() => {
                onStylesChange(prev => prev.filter(i => i.id !== item.id));

                // should handle this as unique state update
                setTimeout(() => {
                  onStyleSelect(styles[0])
                }, 0)
              }}
              onDuplicate={() => {
                const existingNames = styles.map(i => i.name);
                const newName = getNextName(item.name, existingNames);

                const clone = {
                  ...item,
                  id: uuidv4(),
                  name: newName,
                  type: "CUSTOM",
                  level: undefined
                } satisfies Style;

                const index = styles.findIndex(i => i.id === item.id);
                const newList = [...styles];
                newList.splice(index + 1, 0, clone);

                onStylesChange(newList);

                // should handle this as unique state update
                setTimeout(() => {
                  onStyleSelect(clone);
                }, 0);
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default SortableStylesList;
