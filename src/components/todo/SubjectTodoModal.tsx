"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useTodos } from "@/lib/useTodos";
import {
  addSubjectTodo,
  deleteSubjectTodo,
  sortTodos,
  toggleSubjectTodo,
} from "@/lib/todos";

interface Props {
  subjectKey: string;
  subjectTitle: string;
  onClose: () => void;
}

export default function SubjectTodoModal({ subjectKey, subjectTitle, onClose }: Props) {
  const { subject } = useTodos();
  const [text, setText] = useState("");

  const tasks = sortTodos(subject.filter((t) => t.subjectKey === subjectKey));

  function handleAdd() {
    addSubjectTodo(subjectKey, subjectTitle, text);
    setText("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-0 sm:items-center sm:px-4"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-md rounded-t-3xl px-5 pb-6 pt-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">{subjectTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-text-tertiary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="Add a task…"
            autoFocus
            className="min-w-0 flex-1 rounded-lg bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          />
          <button
            type="button"
            onClick={handleAdd}
            aria-label="Add task"
            className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-accent-soft"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="mt-4 max-h-[50vh] divide-y divide-border-subtle overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="py-4 text-sm text-text-tertiary">No tasks yet for this subject.</p>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5 py-2">
                <button
                  type="button"
                  onClick={() => toggleSubjectTodo(t.id)}
                  aria-label={t.done ? "Mark task incomplete" : "Mark task complete"}
                  className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border ${
                    t.done ? "border-accent-soft bg-accent-soft" : "border-border-strong"
                  }`}
                >
                  {t.done && <span className="h-2 w-2 rounded-sm bg-bg-base" />}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    t.done ? "text-text-tertiary line-through" : "text-text-primary"
                  }`}
                >
                  {t.text}
                </span>
                <button
                  type="button"
                  onClick={() => deleteSubjectTodo(t.id)}
                  aria-label="Delete task"
                  className="text-text-tertiary hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
