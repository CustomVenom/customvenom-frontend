export default function YahooConnectButton() {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
  const href = `${apiBase}/api/connect/start?host=yahoo&from=${encodeURIComponent('/tools')}`;

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Yahoo Fantasy (read‑only)</div>
          <div className="text-sm opacity-80">Connect once, always return here.</div>
        </div>
        <a href={href} className="px-3 py-2 rounded bg-black text-white">
          Connect Yahoo
        </a>
      </div>
    </div>
  )
}
