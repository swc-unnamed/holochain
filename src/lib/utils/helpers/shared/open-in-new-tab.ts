
/**
 * Open a URL in a new browser tab
 * @param url 
 * @returns 
 */
export function openInNewTab(url: string) {
  if (!url) return;
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
}