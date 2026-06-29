export type ShareResult = 'shared' | 'copied' | 'cancelled';

type SharePayload = {
  title: string;
  text: string;
  url?: string;
};

export async function shareOrCopy({ title, text, url = window.location.href }: SharePayload): Promise<ShareResult> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }

  const content = `${text}\n${url}`;
  try {
    await navigator.clipboard.writeText(content);
    return 'copied';
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied ? 'copied' : 'cancelled';
  }
}
