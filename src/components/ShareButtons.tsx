'use client';

interface ShareButtonsProps {
  text?: string;
  url?: string;
}

export default function ShareButtons({
  text = 'Check out Custom Venom — Pick Your Poison',
  url = 'https://customvenom.com',
}: ShareButtonsProps) {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  const bsky = `https://bsky.app/intent/compose?text=${encodedText}&url=${encodedUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${text} ${url}`);
  };

  return (
    <div className="flex items-center gap-2">
      <a
        href={bsky}
        target="_blank"
        rel="noopener noreferrer"
        className="cv-btn-secondary"
        aria-label="Share on Bluesky"
      >
        Share on Bluesky
      </a>
      <button
        className="cv-btn-ghost px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={handleCopy}
        aria-label="Copy link to clipboard"
      >
        Copy link
      </button>
    </div>
  );
}
