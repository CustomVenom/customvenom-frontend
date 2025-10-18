interface TileProps {
  title: string;
  value: string | number;
  unit?: string;
  label?: string;
  status: 'live' | 'placeholder';
  loading?: boolean;
}

export function Tile({ title, value, unit, label, status, loading = false }: TileProps) {
  return (
    <div className={`bg-white border-2 rounded-xl p-6 shadow-sm transition-all ${status === 'live' ? 'border-green-500 bg-gradient-to-br from-blue-50 to-cyan-50' : 'border-gray-300 opacity-70'}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold text-gray-800">{title}</span>
        <span className={`px-2 py-1 rounded-xl text-xs font-bold tracking-wide ${status === 'live' ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-400 text-white'}`}>
          {status === 'live' ? 'LIVE' : 'PLACEHOLDER'}
        </span>
      </div>
      
      {loading ? (
        <div className="text-center text-xl text-gray-600 py-10">Loading...</div>
      ) : (
        <>
          <div className="text-5xl font-bold text-[#667eea] my-4 flex items-baseline gap-2">
            {value}
            {unit && <span className="text-2xl text-gray-500 font-normal">{unit}</span>}
          </div>
          {label && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface DualTileProps {
  title: string;
  values: {
    speak: number;
    suppress: number;
  };
  label?: string;
  status: 'live' | 'placeholder';
  loading?: boolean;
}

export function DualTile({ title, values, label, status, loading = false }: DualTileProps) {
  return (
    <div className={`bg-white border-2 rounded-xl p-6 shadow-sm transition-all ${status === 'live' ? 'border-green-500 bg-gradient-to-br from-blue-50 to-cyan-50' : 'border-gray-300 opacity-70'}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold text-gray-800">{title}</span>
        <span className={`px-2 py-1 rounded-xl text-xs font-bold tracking-wide ${status === 'live' ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-400 text-white'}`}>
          {status === 'live' ? 'LIVE' : 'PLACEHOLDER'}
        </span>
      </div>
      
      {loading ? (
        <div className="text-center text-xl text-gray-600 py-10">Loading...</div>
      ) : (
        <>
          <div className="flex items-center justify-around my-5">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-gray-600 uppercase tracking-wider">Speak</span>
              <span className="text-3xl font-bold text-[#667eea]">{values.speak}</span>
            </div>
            <div className="text-4xl text-gray-300 font-light">/</div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-gray-600 uppercase tracking-wider">Suppress</span>
              <span className="text-3xl font-bold text-[#667eea]">{values.suppress}</span>
            </div>
          </div>
          {label && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

