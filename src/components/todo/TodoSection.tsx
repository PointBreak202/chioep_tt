"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTodos } from "@/lib/useTodos";
import {
  addGeneralTodo,
  clearCompletedGeneralTodos,
  clearCompletedSubjectTodos,
  deleteGeneralTodo,
  deleteSubjectTodo,
  sortTodos,
  toggleGeneralTodo,
  toggleSubjectTodo,
  type GeneralTodo,
  type SubjectTodo,
} from "@/lib/todos";

type FilterMode = "general" | "subject" | "both";

function TodoRow({
  text,
  done,
  onToggle,
  onDelete,
}: {
  text: string;
  done: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <button
        type="button"
        onClick={onToggle}
        aria-label={done ? "Mark task incomplete" : "Mark task complete"}
        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border ${
          done ? "border-accent-soft bg-accent-soft" : "border-border-strong"
        }`}
      >
        {done && <span className="h-2 w-2 rounded-sm bg-bg-base" />}
      </button>
      <span
        className={`flex-1 text-sm ${
          done ? "text-text-tertiary line-through" : "text-text-primary"
        }`}
      >
        {text}
      </span>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete task"
        className="text-text-tertiary hover:text-danger"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function TodoSection() {
  const { general, subject } = useTodos();
  const [filter, setFilter] = useState<FilterMode>("both");
  const [newTaskText, setNewTaskText] = useState("");

  const sortedGeneral = useMemo(() => sortTodos<GeneralTodo>(general), [general]);

  const subjectGroups = useMemo(() => {
    const groups = new Map<string, { title: string; items: SubjectTodo[] }>();
    for (const t of subject) {
      const g = groups.get(t.subjectKey);
      if (g) {
        g.items.push(t);
      } else {
        groups.set(t.subjectKey, { title: t.subjectTitle, items: [t] });
      }
    }
    return Array.from(groups.values()).map((g) => ({
      title: g.title,
      items: sortTodos<SubjectTodo>(g.items),
    }));
  }, [subject]);

  const hasCompleted =
    general.some((t) => t.done) || subject.some((t) => t.done);

  function handleAddTask() {
    addGeneralTodo(newTaskText);
    setNewTaskText("");
  }

  function handleClearCompleted() {
    clearCompletedGeneralTodos();
    clearCompletedSubjectTodos();
  }

  const showGeneral = filter === "general" || filter === "both";
  const showSubject = filter === "subject" || filter === "both";

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">To-do</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterMode)}
          className="rounded-lg border border-border-subtle bg-bg-elevated px-2 py-1 text-xs text-text-secondary outline-none"
        >
          <option value="general">General</option>
          <option value="subject">Subject</option>
          <option value="both">Both</option>
        </select>
      </div>

      {showGeneral && (
        <div className="glass mt-3 rounded-2xl px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            General
          </p>

          <div className="mt-2 flex items-center gap-2">
            <input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
              }}
              placeholder="Add a task…"
              className="min-w-0 flex-1 rounded-lg bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
            />
            <button
              type="button"
              onClick={handleAddTask}
              aria-label="Add task"
              className="glass-strong flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-accent-soft"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="mt-2 divide-y divide-border-subtle">
            {sortedGeneral.length === 0 ? (
              <p className="py-3 text-sm text-text-tertiary">No general tasks yet.</p>
            ) : (
              sortedGeneral.map((t) => (
                <TodoRow
                  key={t.id}
                  text={t.text}
                  done={t.done}
                  onToggle={() => toggleGeneralTodo(t.id)}
                  onDelete={() => deleteGeneralTodo(t.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {showSubject && (
        <div className="mt-3 flex flex-col gap-3">
          {subjectGroups.length === 0 ? (
            <div className="glass rounded-2xl px-4 py-3">
              <p className="text-sm text-text-tertiary">
                No subject tasks yet. Add some from the Week tab.
              </p>
            </div>
          ) : (
            subjectGroups.map((group) => (
              <div key={group.title} className="glass rounded-2xl px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  {group.title}
                </p>
                <div className="mt-1 divide-y divide-border-subtle">
                  {group.items.map((t) => (
                    <TodoRow
                      key={t.id}
                      text={t.text}
                      done={t.done}
                      onToggle={() => toggleSubjectTodo(t.id)}
                      onDelete={() => deleteSubjectTodo(t.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {hasCompleted && (
        <button
          type="button"
          onClick={handleClearCompleted}
          className="mt-4 w-full rounded-xl border border-border-subtle py-2.5 text-xs font-medium text-text-secondary"
        >
          Clear Completed Tasks
        </button>
      )}
    </div>
  );
}
