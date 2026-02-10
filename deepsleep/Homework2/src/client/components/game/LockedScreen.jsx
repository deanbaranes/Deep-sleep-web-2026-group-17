export default function LockedScreen({ onClose }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-md text-center p-8 z-50">
            <div className="text-6xl mb-6">🛑</div>
            <h2 className="text-3xl font-bold text-white mb-3">FLIGHT PERMIT EXPIRED</h2>
            <p className="text-gray-400 mb-8 max-w-md">
                Daily flight allowance reached.
                <br />
                Pilots must rest to ensure peak cognitive performance.
                <br /><br />
                <span className="text-indigo-400">Next launch window: Tomorrow.</span>
            </p>
            <button
                onClick={onClose}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
                Return to Dashboard
            </button>
        </div>
    );
}
