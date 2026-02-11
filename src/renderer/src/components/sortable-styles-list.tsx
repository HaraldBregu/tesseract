import { clsx } from 'clsx';
import { useRef } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import { DndContext, KeyboardSensor, PointerSensor, pointerWithin, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DragHandle from "@/components/icons/DragHandle";
import { getNextName } from '@/utils/constants';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import AppButton from './app/app-button';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from 'react-i18next';
import IconDelete from './app/icons/IconDelete';
import IconCopy from './app/icons/IconCopy';

function renderStyledName(name: string, item: Style): React.ReactNode {
  let content: React.ReactNode = name;

  if (item.underline) {
    content = <u>{content}</u>;
  }
  if (item.italic) {
    content = <em>{content}</em>;
  }
  if (item.bold) {
    content = <strong>{content}</strong>;
  }

  return content;
}

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
  const { t } = useTranslation();

  const textColor = selected || isDark ? "white" : item.color;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onStyleSelect();
    }
  };

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      onClick={onStyleSelect}
      onKeyDown={handleKeyDown}
      style={style}
      className={clsx(
        "flex items-center px-3 py-2 select-none rounded text-left",
        isDragging && "opacity-50",
        selected && "bg-[#0625ac] text-white",
      )}
      aria-pressed={selected}
      type="button"
    >
      <span className="cursor-grab flex-shrink-0 mr-2" {...listeners}>
        <DragHandle
          size={20}
          color={selected && "white"}
          className="dark:text-white"
        />
      </span>
      <div className="flex-1 min-w-0">
        <span
          className="truncate block"
          style={{
            fontFamily: item.fontFamily,
            fontSize: item.fontSize,
            fontWeight: item.fontWeight,
            color: textColor,
          }}
        >
          {renderStyledName(item.name, item)}
        </span>
      </div>
      <div className="flex gap-2 flex-shrink-0 ml-2">
        {item.name.split(".").length < 3 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <AppButton
                variant={selected ? "styles-selected" : "styles"}
                size="icon-xs"
                onClick={onDuplicate}
              >
                <IconCopy />
              </AppButton>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("buttons.duplicate")}
            </TooltipContent>
          </Tooltip>
        )}
        {item.type === "CUSTOM" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <AppButton
                variant={selected ? "styles-selected" : "styles"}
                size="icon-xs"
                onClick={onDelete}
              >
                <IconDelete />
              </AppButton>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t("buttons.delete")}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </button>
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

  const handleDelete = (item: Style) => {
    onStylesChange(prev => prev.filter(i => i.id !== item.id));
    setTimeout(() => {
      onStyleSelect(styles[0]);
    }, 0);
  };

  const handleDuplicate = (item: Style) => {
    const existingNames = styles.map(i => i.name);
    const newName = getNextName(item.name, existingNames);

    const clone = {
      ...item,
      id: crypto.randomUUID(),
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
  };

  const handleDragEnd = ({ active, over }) => {
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
  };

  return (
    <TooltipProvider>
      <DndContext
        collisionDetection={pointerWithin}
        sensors={sensors}
        modifiers={[restrictToFirstScrollableAncestor]}
        onDragEnd={handleDragEnd}>
        <SortableContext
          items={styles.map(i => i.id)}
          strategy={verticalListSortingStrategy}>
          <div
            ref={scrollRef}
            className="h-[27rem] overflow-y-auto py-2 flex flex-col">
            {styles.map(item => (
              <SortableStyleItem
                key={item.id}
                id={item.id}
                item={item}
                onStyleSelect={() => onStyleSelect(item)}
                selected={selectedStyle?.id === item.id}
                onDelete={() => handleDelete(item)}
                onDuplicate={() => handleDuplicate(item)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </TooltipProvider>
  );
}

export default SortableStylesList;
