"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TODOS_EVENT,
  getGeneralTodos,
  getSubjectTodos,
  type GeneralTodo,
  type SubjectTodo,
} from "./todos";

export function useTodos() {
  const [general, setGeneral] = useState<GeneralTodo[]>(() => getGeneralTodos());
  const [subject, setSubject] = useState<SubjectTodo[]>(() => getSubjectTodos());

  const refresh = useCallback(() => {
    setGeneral(getGeneralTodos());
    setSubject(getSubjectTodos());
  }, []);

  useEffect(() => {
    window.addEventListener(TODOS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(TODOS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return { general, subject };
}
