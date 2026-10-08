/** Light/dark theme (dark is the default; the visitor's choice is remembered on this device). */
export type Theme = "dark" | "light";
export const THEME_KEY = "gh-theme";
export const THEME_COLOR: Record<Theme, string> = { dark: "#090909", light: "#f4f2ee" };

/**
 * Inline script for <head>: applies the saved theme before the first paint (no flash).
 * Kept tiny and dependency-free; storage may be blocked (private mode) → stays dark.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"){document.documentElement.dataset.theme="light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","${THEME_COLOR.light}")}}catch(e){}`;
