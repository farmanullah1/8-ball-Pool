import { create } from 'zustand';
import type { GameState, PlayerId, Ball, GamePhase, Player } from '../types';

interface GameStore extends GameState {
  setPhase: (phase: GamePhase) => void;
  setTurn: (turn: PlayerId) => void;
  updateBalls: (balls: Ball[]) => void;
  setWinner: (winner: PlayerId | undefined) => void;
  toggleMute: () => void;
  resetGame: () => void;
  setPlayerSuit: (playerId: PlayerId, suit: 'solids' | 'stripes') => void;
  addScore: (playerId: PlayerId, points: number) => void;
  setPlayerAI: (playerId: PlayerId, isAI: boolean) => void;
  setCueBallInHand: (inHand: boolean) => void;
  setCueSpin: (spin: { x: number; y: number }) => void;
}

const initialPlayers: [Player, Player] = [
  { id: 1, name: 'Player 1', score: 0, isAI: false },
  { id: 2, name: 'Player 2', score: 0, isAI: false },
];

export const useGameStore = create<GameStore>((set) => ({
  phase: 'menu',
  turn: 1,
  players: initialPlayers,
  balls: [],
  cueBallInHand: true,
  isMuted: false,
  cueSpin: { x: 0, y: 0 },

  setPhase: (phase) => set({ phase }),
  setTurn: (turn) => set({ turn }),
  updateBalls: (balls) => set({ balls }),
  setWinner: (winner) => set({ winner, phase: winner ? 'gameOver' : 'menu' }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  resetGame: () => set({
    phase: 'menu',
    turn: 1,
    players: initialPlayers.map(p => ({ ...p, score: 0, suit: undefined })) as [Player, Player],
    balls: [],
    cueBallInHand: true,
    winner: undefined,
    lastFoul: undefined,
    cueSpin: { x: 0, y: 0 },
  }),
  setPlayerSuit: (playerId, suit) => set((state) => ({
    players: state.players.map((p) => 
      p.id === playerId ? { ...p, suit } : { ...p, suit: suit === 'solids' ? 'stripes' : 'solids' }
    ) as [Player, Player]
  })),
  addScore: (playerId, points) => set((state) => ({
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, score: p.score + points } : p
    ) as [Player, Player]
  })),
  setPlayerAI: (playerId, isAI) => set((state) => ({
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, isAI } : p
    ) as [Player, Player]
  })),
  setCueBallInHand: (cueBallInHand) => set({ cueBallInHand }),
  setCueSpin: (cueSpin) => set({ cueSpin }),
}));
