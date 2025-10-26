export default function YahooConnectButton() {
  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Yahoo Fantasy (read‑only)</div>
          <div className="text-sm opacity-80">Connect once, always return here.</div>
        </div>
        <a href="https://api.customvenom.com/api/yahoo/connect?returnTo=/tools" className="px-3 py-2 rounded bg-black text-white">
          Connect Yahoo
        </a>
      </div>
    </div>
  )
}
