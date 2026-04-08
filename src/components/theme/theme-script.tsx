/**
 * Inline script that runs before React hydration to prevent theme flash.
 * Reads the stored theme from localStorage and applies it to <html>
 * before the browser paints, avoiding a flash of the default theme.
 */
function buildThemeScript(storageKey: string) {
  return `(function(){try{var k=${JSON.stringify(storageKey)};var t=localStorage.getItem(k);if(t&&["light","dark","navy","colorblind"].indexOf(t)!==-1){document.documentElement.setAttribute("data-theme",t);document.documentElement.className=document.documentElement.className.replace(/ ?dark/g,"");if(t!=="light")document.documentElement.classList.add("dark")}}catch(e){}})()`;
}

export function ThemeScript({ storageKey = "convergio-theme" }: { storageKey?: string }) {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: buildThemeScript(storageKey) }}
    />
  );
}
