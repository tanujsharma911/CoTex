import type { ThemeStore } from "@/types";
import { create } from "zustand";

const useThemeStore = create<ThemeStore>()((set, get) => ({
  theme: (localStorage.getItem("theme") || "light") as "dark" | "light",

  toggle: () => {
    const setTheme = get().theme === "dark" ? "light" : "dark";

    set({ theme: setTheme });

    if (setTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", setTheme);

    return setTheme;
  },

  init: () => {
    const theme = get().theme;

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  },
}));

export { useThemeStore };
