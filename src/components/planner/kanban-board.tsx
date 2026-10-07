"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Circle,
  CircleDot,
  CheckCircle2,
} from "lucide-react";
import type { Task, TaskStatus } from "@/domain/types";
import { TaskCard } from "@/components/tasks/task-card";
import { changeTaskStatus } from "@/lib/commands";
import { faNumber } from "@/domain/calculations";
import { cn } from "@/lib/utils";

const columns: { status: TaskStatus; name: string; icon: typeof Circle }[] = [
  { status: "todo", name: "برای انجام", icon: Circle },
  { status: "doing", name: "در حال انجام", icon: CircleDot },
  { status: "done", name: "انجام شده", icon: CheckCircle2 },
];

function DraggableTask({
  task,
  highlighted,
}: {
  task: Task;
  highlighted: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      <TaskCard
        task={task}
        highlighted={highlighted}
        handle={
          <button
            className="task-drag"
            {...attributes}
            {...listeners}
            aria-label={`جابه‌جایی ${task.title}`}
          >
            <GripVertical size={16} />
          </button>
        }
      />
    </div>
  );
}
function Column({
  status,
  name,
  icon: Icon,
  tasks,
  onAdd,
  highlighted,
}: (typeof columns)[number] & {
  tasks: Task[];
  onAdd: (status: TaskStatus) => void;
  highlighted?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "kanban-column",
        `kanban-${status}`,
        isOver && "kanban-over",
      )}
      data-column={status}
    >
      <header>
        <span>
          <Icon size={17} />
          {name}
          <i>{faNumber(tasks.length)}</i>
        </span>
        <button aria-label={`افزودن کار ${name}`} onClick={() => onAdd(status)}>
          <Plus size={18} />
        </button>
      </header>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="kanban-tasks">
          {tasks.map((task) => (
            <DraggableTask
              key={task.id}
              task={task}
              highlighted={task.id === highlighted}
            />
          ))}
          {!tasks.length && (
            <div className="kanban-empty">
              {status === "done"
                ? "اولین کار تمام‌شده منتظر توست"
                : "کار را اینجا رها کن"}
            </div>
          )}
        </div>
      </SortableContext>
      <button className="column-add" onClick={() => onAdd(status)}>
        <Plus size={15} />
        افزودن کار
      </button>
    </section>
  );
}

export function KanbanBoard({
  tasks,
  onAdd,
  highlighted,
}: {
  tasks: Task[];
  onAdd: (status: TaskStatus) => void;
  highlighted?: string;
}) {
  const [dragged, setDragged] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const end = ({ active, over }: DragEndEvent) => {
    setDragged(null);
    if (!over) return;
    const overId = String(over.id);
    const status = overId.startsWith("column-")
      ? (overId.slice(7) as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status;
    if (status) changeTaskStatus(String(active.id), status);
  };
  return (
    <DndContext
      id="planner-dnd"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }: DragStartEvent) =>
        setDragged(tasks.find((t) => t.id === active.id) ?? null)
      }
      onDragEnd={end}
      onDragCancel={() => setDragged(null)}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "برای برداشتن کار Space، برای جابه‌جایی کلیدهای جهت، برای رهاکردن Space و برای لغو Escape را بزن.",
        },
      }}
    >
      <div className="kanban-board">
        {columns.map((column) => (
          <Column
            key={column.status}
            {...column}
            tasks={tasks.filter((t) => t.status === column.status)}
            onAdd={onAdd}
            highlighted={highlighted}
          />
        ))}
      </div>
      <DragOverlay>
        {dragged && (
          <div className="task-drag-overlay">
            <TaskCard task={dragged} overlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
