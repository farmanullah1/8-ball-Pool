import React, { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Trophy, RotateCcw, Volume2, VolumeX, HelpCircle, Users, Monitor, X, Play } from 'lucide-react';
import PoolGame from './components/PoolGame';
import SpinControl from './components/SpinControl';

const App: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);
  const { 
    phase, 
    turn, 
    players, 
    isMuted, 
    toggleMute, 
    resetGame, 
    setPhase,
    setPlayerAI,
    winner
  } = useGameStore();

  const currentPlayer = players.find(p => p.id === turn);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8 font-sans selection:bg-blue-500/30">
      {/* Dynamic Header */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8 mb-12 animate-fade-in">
        
        {/* Player 1 Card */}
        <div className={`flex items-center gap-6 glass-panel p-5 rounded-3xl transition-all duration-500 border-l-4 ${turn === 1 ? 'border-l-blue-500 scale-105 shadow-blue-500/10' : 'border-l-transparent opacity-60'}`}>
          <div className={`p-4 rounded-2xl transition-all ${turn === 1 ? 'bg-blue-600 shadow-lg' : 'bg-slate-800'}`}>
            <Users className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-[120px]">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Challenger 1</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black tabular-nums">{players[0].score}</span>
              {players[0].suit && (
                <div className={`w-4 h-4 rounded-full ring-2 ring-white/20 ${players[0].suit === 'solids' ? 'bg-red-500' : 'bg-yellow-400'}`} />
              )}
            </div>
            <p className="text-xs font-bold text-blue-400/80 mt-1">{players[0].suit ? players[0].suit.toUpperCase() : 'NO SUIT'}</p>
          </div>
        </div>

        {/* Game Branding */}
        <div className="flex flex-col items-center group cursor-default">
          <div className="relative">
            <h1 className="text-5xl font-black italic tracking-tighter bg-gradient-to-br from-white via-slate-300 to-slate-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              PRO POOL 8
            </h1>
            <div className="absolute -right-6 -top-2 px-2 py-0.5 bg-blue-600 rounded text-[8px] font-black tracking-tighter text-white rotate-12 shadow-lg">ULTRA</div>
          </div>
          <div className="mt-4 px-6 py-1.5 bg-slate-900/80 rounded-full text-[10px] font-black text-slate-400 border border-white/5 tracking-[0.3em] uppercase">
            {phase === 'aiming' ? `${currentPlayer?.name}'s Shot` : phase}
          </div>
        </div>

        {/* Player 2 Card */}
        <div className={`flex items-center gap-6 glass-panel p-5 rounded-3xl transition-all duration-500 border-r-4 ${turn === 2 ? 'border-r-red-500 scale-105 shadow-red-500/10' : 'border-r-transparent opacity-60'}`}>
          <div className="min-w-[120px] text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Challenger 2</p>
            <div className="flex items-center gap-3 justify-end">
              {players[1].suit && (
                <div className={`w-4 h-4 rounded-full ring-2 ring-white/20 ${players[1].suit === 'solids' ? 'bg-red-500' : 'bg-yellow-400'}`} />
              )}
              <span className="text-3xl font-black tabular-nums">{players[1].score}</span>
            </div>
            <p className="text-xs font-bold text-red-400/80 mt-1">{players[1].suit ? players[1].suit.toUpperCase() : 'NO SUIT'}</p>
          </div>
          <div className={`p-4 rounded-2xl transition-all ${turn === 2 ? 'bg-red-600 shadow-lg' : 'bg-slate-800'}`}>
            {players[1].isAI ? <Monitor className="w-7 h-7 text-white" /> : <Users className="w-7 h-7 text-white" />}
          </div>
        </div>
      </div>

      {/* Ultra High Quality Table Container */}
      <div className="relative w-full max-w-5xl aspect-[2/1] bg-[#0a2e1f] rounded-[3.5rem] p-[1.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(0,0,0,0.5)] border-[14px] border-[#2d1a12] overflow-visible flex items-center justify-center animate-fade-in delay-100">
        
        {/* Table Felt & Game Component */}
        <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden shadow-inner bg-emerald-950">
          {phase === 'menu' ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 bg-slate-950/40 backdrop-blur-md">
              <div className="p-8 bg-white/5 rounded-full border border-white/10 shadow-2xl animate-pulse">
                <Trophy className="w-20 h-20 text-yellow-400" />
              </div>
              <div className="text-center">
                <h2 className="text-4xl font-black tracking-tight mb-2">Tournament Mode</h2>
                <p className="text-slate-400 text-sm font-medium tracking-wide">Select your match type to begin</p>
              </div>
              <div className="flex flex-col gap-4 w-64">
                <button 
                  onClick={() => { setPlayerAI(2, false); setPhase('aiming'); }}
                  className="premium-button w-full py-5 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3"
                >
                  <Play className="w-4 h-4 fill-current" /> Local PvP
                </button>
                <button 
                  onClick={() => { setPlayerAI(2, true); setPhase('aiming'); }}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-xs tracking-widest uppercase transition-all"
                >
                  Challenge AI
                </button>
              </div>
            </div>
          ) : phase === 'gameOver' ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
              <Trophy className="w-24 h-24 text-yellow-400 animate-bounce" />
              <div className="text-center">
                <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 italic">Victory!</h2>
                <p className="text-2xl font-bold text-blue-400">{players.find(p => p.id === winner)?.name} dominates the table</p>
              </div>
              <button 
                onClick={resetGame}
                className="premium-button px-12 py-5 rounded-2xl font-black text-xs tracking-widest uppercase"
              >
                Rematch
              </button>
            </div>
          ) : (
            <PoolGame />
          )}
        </div>

        {/* Structural Table Details (Rail markers/Pocket guards) */}
        <div className="absolute top-[0.6rem] left-1/2 -translate-x-1/2 w-4 h-1 bg-[#1a0f0a] rounded-full opacity-40" />
        <div className="absolute bottom-[0.6rem] left-1/2 -translate-x-1/2 w-4 h-1 bg-[#1a0f0a] rounded-full opacity-40" />
      </div>

      {/* Premium Dashboard */}
      <div className="mt-12 flex flex-col md:flex-row items-center gap-8 animate-fade-in delay-200">
        <SpinControl />
        
        <div className="flex gap-4 glass-panel p-3 rounded-[2rem]">
          <button 
            onClick={toggleMute}
            className="p-5 bg-slate-800/50 hover:bg-blue-600/20 rounded-2xl transition-all group"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-6 h-6 text-red-400" /> : <Volume2 className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />}
          </button>
          <button 
            onClick={resetGame}
            className="p-5 bg-slate-800/50 hover:bg-orange-600/20 rounded-2xl transition-all group"
            title="Reset Game"
          >
            <RotateCcw className="w-6 h-6 text-orange-400 group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <button 
            onClick={() => setShowHelp(true)}
            className="p-5 bg-slate-800/50 hover:bg-green-600/20 rounded-2xl transition-all group"
            title="Professional Guide"
          >
            <HelpCircle className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Pro Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
          <div className="glass-panel border-white/20 rounded-[3rem] p-10 max-w-2xl w-full shadow-[0_0_100px_rgba(37,99,235,0.2)] relative">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-2xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-4xl font-black mb-8 italic tracking-tighter">Pro Pool Guide</h2>
            
            <div className="space-y-8 text-slate-300">
              <section className="flex gap-6">
                <div className="w-12 h-12 shrink-0 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic">01</div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Dynamic Aiming</h3>
                  <p className="text-sm leading-relaxed">Rotate your cue to find the line. Use the <span className="text-blue-400 font-bold">Ghost Ball</span> indicator to visualize the exact impact point. Click and pull back to charge your power.</p>
                </div>
              </section>

              <section className="flex gap-6">
                <div className="w-12 h-12 shrink-0 bg-red-600 rounded-2xl flex items-center justify-center font-black italic">02</div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">The "English" (Spin)</h3>
                  <p className="text-sm leading-relaxed">Manipulate the cue ball post-impact using the spin tracker. <span className="text-yellow-400 font-bold">Top Spin</span> provides follow-through, while <span className="text-red-400 font-bold">Back Spin</span> pulls the ball back.</p>
                </div>
              </section>

              <section className="flex gap-6">
                <div className="w-12 h-12 shrink-0 bg-green-600 rounded-2xl flex items-center justify-center font-black italic">03</div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Tournament Rules</h3>
                  <ul className="text-sm space-y-2 list-disc list-inside marker:text-blue-500">
                    <li>Clear your designated suit before targeting the 8-ball.</li>
                    <li>A <span className="text-white font-bold italic">Scratch</span> (potting cue ball) grants the opponent Ball-in-Hand.</li>
                    <li>Reposition freely anywhere on the table when in hand.</li>
                  </ul>
                </div>
              </section>
            </div>
            
            <button 
              onClick={() => setShowHelp(false)}
              className="premium-button mt-10 w-full py-5 rounded-2xl font-black text-xs tracking-widest uppercase"
            >
              Enter Tournament
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
