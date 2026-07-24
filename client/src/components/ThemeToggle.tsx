import { useEffect, useState } from "react";
import { Switch } from "./ui/Switch";

export function ThemeToggle() {
  // Initialize with system preference 🌗
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  // Apply data-theme attribute whenever state updates ⚡
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle theme"
      />
      <span className="text-sm font-medium text-fg">
        {isDark ? "Dark Mode" : "Light Mode"}
      </span>
    </div>
  );
}
