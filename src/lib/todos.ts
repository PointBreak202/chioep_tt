const GENERAL_KEY = "coep-tt-todos-general";
const SUBJECT_KEY = "coep-tt-todos-subject";
export const TODOS_EVENT = "coep-tt-todos-changed";

export interface GeneralTodo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface SubjectTodo {
  id: string;
  subjectKey: string;
  subjectTitle: string;
  text: string;
  done: boolean;
  createdAt: number;
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(list));
  window.dispatchEvent(new Event(TODOS_EVENT));
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// General todos

export function getGeneralTodos(): GeneralTodo[] {
  return readList<GeneralTodo>(GENERAL_KEY);
}

export function addGeneralTodo(text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const list = getGeneralTodos();
  list.push({ id: makeId(), text: trimmed, done: false, createdAt: Date.now() });
  writeList(GENERAL_KEY, list);
}

export function toggleGeneralTodo(id: string): void {
  const list = getGeneralTodos().map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  writeList(GENERAL_KEY, list);
}

export function deleteGeneralTodo(id: string): void {
  const list = getGeneralTodos().filter((t) => t.id !== id);
  writeList(GENERAL_KEY, list);
}

export function clearCompletedGeneralTodos(): void {
  const list = getGeneralTodos().filter((t) => !t.done);
  writeList(GENERAL_KEY, list);
}

// Subject todos

export function getSubjectTodos(): SubjectTodo[] {
  return readList<SubjectTodo>(SUBJECT_KEY);
}

export function getSubjectTodosFor(subjectKey: string): SubjectTodo[] {
  return getSubjectTodos().filter((t) => t.subjectKey === subjectKey);
}

export function addSubjectTodo(
  subjectKey: string,
  subjectTitle: string,
  text: string
): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const list = getSubjectTodos();
  list.push({
    id: makeId(),
    subjectKey,
    subjectTitle,
    text: trimmed,
    done: false,
    createdAt: Date.now(),
  });
  writeList(SUBJECT_KEY, list);
}

export function toggleSubjectTodo(id: string): void {
  const list = getSubjectTodos().map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  writeList(SUBJECT_KEY, list);
}

export function deleteSubjectTodo(id: string): void {
  const list = getSubjectTodos().filter((t) => t.id !== id);
  writeList(SUBJECT_KEY, list);
}

export function clearCompletedSubjectTodos(): void {
  const list = getSubjectTodos().filter((t) => !t.done);
  writeList(SUBJECT_KEY, list);
}

export function sortTodos<T extends { done: boolean; createdAt: number }>(
  list: T[]
): T[] {
  return [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.createdAt - b.createdAt;
  });
}
