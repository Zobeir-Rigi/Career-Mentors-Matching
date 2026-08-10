import { useState, useCallback } from "react";

export function useToggleSet(initialValues: string[] = []) {
  const [set, setSet] = useState<Set<string>>(() => new Set(initialValues));

  const toggle = useCallback((item: string) => {
    setSet((previousSet) => {
      const nextSet = new Set(previousSet);
      if (nextSet.has(item)) {
        nextSet.delete(item);
      } else {
        nextSet.add(item);
      }
      return nextSet;
    });
  }, []);

  const setAll = useCallback((items: string[] | Set<string> = []) => {
    setSet(new Set(items));
  }, []);

  return [set, toggle, setAll] as const;
}
