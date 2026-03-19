export async function shareContent(data: {
  title: string;
  text: string;
  url?: string;
}): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch {
      // User cancelled or not supported
    }
  }

  // Fallback: copy to clipboard
  const content = data.url || data.text;
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      // Clipboard not available
    }
  }

  return false;
}
