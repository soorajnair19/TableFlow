/** Persisted theme preference for the UI (localStorage). */
export const THEME_STORAGE_KEY = "tableflow-theme";

/** Runs before paint so `dark` class matches stored preference and avoids flash. */
export function themeBootstrapScript(): string {
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t==="dark")document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark");}catch(e){}})();`;
}
