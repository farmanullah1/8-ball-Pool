import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PhysicsEngine } from '../physics/engine';
import { createInitialBalls } from '../utils/gameUtils';
import { Vector2D } from '../physics/vector2d';
import { PoolAI } from '../ai/poolAI';
import SoundManager from '../utils/soundManager';
import { 
  TABLE_WIDTH, 
  TABLE_HEIGHT, 
  BALL_RADIUS, 
  POCKETS, 
  POCKET_RADIUS 
} from '../constants/game';
import type { Ball, Vector2D as Vector2DType } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const PoolGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenFeltRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRailsRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(useGameStore.getState());
  
  const { 
    phase, 
    balls, 
    updateBalls, 
    setPhase, 
    turn, 
    setTurn,
    players,
    addScore,
    setPlayerSuit,
    setWinner,
    isMuted,
    cueBallInHand,
    setCueBallInHand
  } = useGameStore();

  const [pocketFlashes, setPocketFlashes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [aimAngle, setAimAngle] = useState(0);
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [cameraShake, setCameraShake] = useState(0);
  
  const requestRef = useRef<number | null>(null);
  const firstHitRef = useRef<number | null>(null);
  const pocketedThisShotRef = useRef<number[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const trailsRef = useRef<Map<number, { x: number; y: number; alpha: number }[]>>(new Map());
  const lightPulseRef = useRef(0);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => { stateRef.current = state; });
    return unsub;
  }, []);

  useEffect(() => {
    const felt = document.createElement('canvas');
    felt.width = TABLE_WIDTH; felt.height = TABLE_HEIGHT;
    const fCtx = felt.getContext('2d')!;
    fCtx.fillStyle = '#064e3b'; fCtx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
    for (let i = 0; i < 60000; i++) {
      const x = Math.random() * TABLE_WIDTH; const y = Math.random() * TABLE_HEIGHT;
      fCtx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.05})`; fCtx.fillRect(x, y, 1, 1);
    }
    offscreenFeltRef.current = felt;

    const rails = document.createElement('canvas');
    const margin = 60;
    rails.width = TABLE_WIDTH + margin * 2; rails.height = TABLE_HEIGHT + margin * 2;
    const rCtx = rails.getContext('2d')!;
    rCtx.fillStyle = '#1a0f0a'; rCtx.fillRect(0, 0, rails.width, rails.height);
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * rails.width; const y = Math.random() * rails.height;
      rCtx.fillStyle = `rgba(255, 255, 255, 0.015)`; rCtx.fillRect(x, y, Math.random() * 150, 0.5);
    }
    offscreenRailsRef.current = rails;
  }, []);

  useEffect(() => {
    if (balls.length === 0 && phase !== 'menu') updateBalls(createInitialBalls());
  }, [phase, balls.length, updateBalls]);

  useEffect(() => { SoundManager.setMuted(isMuted); }, [isMuted]);

  useEffect(() => {
    if (phase === 'aiming' && turn === 2) {
      const p2 = players.find(p => p.id === 2);
      if (p2?.isAI) {
        const aiTimeout = setTimeout(() => {
          const currentBalls = stateRef.current.balls;
          if (stateRef.current.cueBallInHand) {
            const newBalls = currentBalls.map(b => b.id === 0 ? { ...b, position: { x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT / 2 } } : b);
            updateBalls(newBalls); setCueBallInHand(false);
          }
          const shot = PoolAI.calculateShot(currentBalls, p2.suit);
          if (shot) {
            setAimAngle(shot.angle); setPower(shot.power);
            setTimeout(() => {
              const dx = Math.cos(shot.angle); const dy = Math.sin(shot.angle);
              SoundManager.playCueHit(shot.power);
              const finalBalls = stateRef.current.balls.map(b => b.id === 0 ? { ...b, velocity: { x: dx * (shot.power / 2.5), y: dy * (shot.power / 2.5) } } : b);
              updateBalls(finalBalls); setPhase('moving'); setPower(0);
            }, 1000);
          }
        }, 1500);
        return () => clearTimeout(aiTimeout);
      }
    }
    return undefined;
  }, [phase, turn, players, updateBalls, setCueBallInHand, setPhase]);

  const emitParticles = (x: number, y: number, color: string, count: number, speed: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2; const s = Math.random() * speed;
      particlesRef.current.push({ x, y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s, life: 1.0, color });
    }
  };

  const handleTurnEnd = () => {
    const currentBalls = stateRef.current.balls;
    const firstHit = firstHitRef.current;
    const pocketed = pocketedThisShotRef.current;
    const currentPlayer = players.find(p => p.id === turn)!;
    
    let isFoul = false; let switchTurn = true;
    if (pocketed.includes(0)) {
      isFoul = true;
      const newBalls = currentBalls.map(b => b.id === 0 ? { ...b, isPocketed: false, position: { x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT / 2 }, velocity: { x: 0, y: 0 } } : b);
      updateBalls(newBalls);
    }
    if (firstHit === null) isFoul = true;
    else if (currentPlayer.suit) {
      const hitBall = currentBalls.find(b => b.id === firstHit);
      if (hitBall && hitBall.type !== 'black' && ((currentPlayer.suit === 'solids' && hitBall.type === 'stripe') || (currentPlayer.suit === 'stripes' && hitBall.type === 'solid'))) isFoul = true;
    }
    if (!isFoul && pocketed.length > 0) {
      const scoringBalls = pocketed.filter(id => id !== 0);
      if (scoringBalls.length > 0) {
        if (!currentPlayer.suit) {
          const firstPocketed = currentBalls.find(b => b.id === scoringBalls[0]);
          if (firstPocketed && (firstPocketed.type === 'solid' || firstPocketed.type === 'stripe')) setPlayerSuit(turn, firstPocketed.type === 'solid' ? 'solids' : 'stripes');
        }
        const ownBallPocketed = scoringBalls.some(id => {
          const b = currentBalls.find(ball => ball.id === id);
          if (!b) return false;
          const suit = useGameStore.getState().players.find(p => p.id === turn)?.suit;
          if (!suit) return b.type === 'solid' || b.type === 'stripe';
          return (suit === 'solids' && b.type === 'solid') || (suit === 'stripes' && b.type === 'stripe');
        });
        if (ownBallPocketed) { switchTurn = false; addScore(turn, scoringBalls.length); }
      }
    }
    const blackBall = currentBalls.find(b => b.type === 'black')!;
    if (pocketed.includes(blackBall.id)) {
      const remainingOwnBalls = currentBalls.filter(b => !b.isPocketed && ((currentPlayer.suit === 'solids' && b.type === 'solid') || (currentPlayer.suit === 'stripes' && b.type === 'stripe'))).length;
      if (remainingOwnBalls === 0 && !isFoul) { setWinner(turn); SoundManager.playWin(); }
      else { setWinner(turn === 1 ? 2 : 1); }
      return;
    }
    firstHitRef.current = null; pocketedThisShotRef.current = [];
    useGameStore.getState().setCueSpin({ x: 0, y: 0 });
    if (isFoul) { setPhase('foul'); setCueBallInHand(true); setTimeout(() => setPhase('aiming'), 1500); setTurn(turn === 1 ? 2 : 1); }
    else if (switchTurn) { setTurn(turn === 1 ? 2 : 1); setPhase('aiming'); }
    else { setPhase('aiming'); }
  };

  const draw = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { balls: currentBalls, phase: currentPhase, cueBallInHand: inHand } = stateRef.current;
    lightPulseRef.current += 0.02; const pulse = Math.sin(lightPulseRef.current) * 0.02;

    ctx.save();
    if (cameraShake > 0) { ctx.translate((Math.random()-0.5)*cameraShake, (Math.random()-0.5)*cameraShake); setCameraShake(s => Math.max(0, s*0.9)); }
    ctx.clearRect(-100, -100, TABLE_WIDTH+200, TABLE_HEIGHT+200);
    
    if (offscreenRailsRef.current) ctx.drawImage(offscreenRailsRef.current, -60, -60);
    if (offscreenFeltRef.current) ctx.drawImage(offscreenFeltRef.current, 0, 0);

    const lampG = ctx.createRadialGradient(TABLE_WIDTH/2, TABLE_HEIGHT/2, 50, TABLE_WIDTH/2, TABLE_HEIGHT/2, TABLE_WIDTH*0.8);
    lampG.addColorStop(0, `rgba(255, 255, 200, ${0.1+pulse})`); lampG.addColorStop(0.4, 'transparent'); lampG.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = lampG; ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

    ctx.fillStyle = '#fef3c7';
    for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.arc((TABLE_WIDTH/8)*i, -32, 3, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc((TABLE_WIDTH/8)*i, TABLE_HEIGHT+32, 3, 0, Math.PI*2); ctx.fill(); }
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.arc(-32, (TABLE_HEIGHT/4)*i, 3, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(TABLE_WIDTH+32, (TABLE_HEIGHT/4)*i, 3, 0, Math.PI*2); ctx.fill(); }

    POCKETS.forEach(p => {
      ctx.beginPath(); const pG = ctx.createRadialGradient(p.x, p.y, POCKET_RADIUS*0.2, p.x, p.y, POCKET_RADIUS*1.1);
      pG.addColorStop(0, '#000'); pG.addColorStop(0.8, '#0f172a'); pG.addColorStop(1, '#1e293b');
      ctx.fillStyle = pG; ctx.arc(p.x, p.y, POCKET_RADIUS*1.1, 0, Math.PI*2); ctx.fill();
    });

    pocketFlashes.forEach(flash => {
      const grad = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, POCKET_RADIUS * 2.5);
      grad.addColorStop(0, 'rgba(100, 200, 255, 0.3)'); grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(flash.x, flash.y, POCKET_RADIUS * 2.5, 0, Math.PI * 2); ctx.fill();
    });

    particlesRef.current.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.94; p.vy *= 0.94;
      p.life -= 0.02;
      if (p.life <= 0) particlesRef.current.splice(i, 1);
      else { ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('rgb', 'rgba'); ctx.beginPath(); ctx.arc(p.x, p.y, 1.2, 0, Math.PI*2); ctx.fill(); }
    });

    currentBalls.forEach(ball => {
      if (ball.isPocketed) return;
      const speed = Math.sqrt(ball.velocity.x**2 + ball.velocity.y**2);
      if (speed > 1) {
        ctx.save(); ctx.globalAlpha = 0.1; const steps = 4;
        for (let i = 1; i <= steps; i++) { ctx.beginPath(); ctx.arc(ball.position.x - ball.velocity.x*(i/steps), ball.position.y - ball.velocity.y*(i/steps), ball.radius, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill(); }
        ctx.restore();
      }
      
      const sG = ctx.createRadialGradient(ball.position.x+3, ball.position.y+3, 0, ball.position.x+3, ball.position.y+3, ball.radius*1.5);
      sG.addColorStop(0, 'rgba(0,0,0,0.5)'); sG.addColorStop(1, 'transparent');
      ctx.fillStyle = sG; ctx.beginPath(); ctx.arc(ball.position.x+3, ball.position.y+3, ball.radius*1.5, 0, Math.PI*2); ctx.fill();

      let trail = trailsRef.current.get(ball.id) || [];
      if (speed > 0.1) {
        trail.push({ x: ball.position.x, y: ball.position.y, alpha: 0.1 });
        if (trail.length > 10) trail.shift();
      } else if (trail.length > 0) trail.shift();
      trailsRef.current.set(ball.id, trail);
      if (trail.length > 1) {
        ctx.beginPath(); ctx.moveTo(trail[0].x, trail[0].y);
        for (let j = 1; j < trail.length; j++) ctx.lineTo(trail[j].x, trail[j].y);
        ctx.strokeStyle = `rgba(255, 255, 255, 0.03)`; ctx.lineWidth = ball.radius * 0.8; ctx.lineCap = 'round'; ctx.stroke();
      }
    });

    const cueBall = currentBalls.find(b => b.id === 0);
    currentBalls.forEach(ball => {
      if (ball.isPocketed) return;
      const { x, y } = ball.position; const r = ball.radius;
      if (currentPhase === 'aiming' && cueBall) { ctx.filter = `blur(${Math.min(Math.sqrt((x-cueBall.position.x)**2+(y-cueBall.position.y)**2)/500, 1.5)}px)`; }
      
      let base = '#fff'; if (ball.type === 'black') base = '#111';
      else if (ball.type === 'solid') base = ball.number && ball.number > 8 ? '#facc15' : '#ef4444';
      else if (ball.type === 'stripe') base = '#3b82f6';
      
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fillStyle = base; ctx.fill();
      const envG = ctx.createLinearGradient(x-r, y-r, x+r, y+r); envG.addColorStop(0, 'rgba(255,255,255,0.2)'); envG.addColorStop(0.5, 'transparent'); envG.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = envG; ctx.fill();
      const shG = ctx.createRadialGradient(x+r*0.3, y+r*0.3, r*0.5, x, y, r); shG.addColorStop(0, 'transparent'); shG.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = shG; ctx.fill();
      const spG = ctx.createRadialGradient(x-r*0.4, y-r*0.4, 0, x-r*0.4, y-r*0.4, r*0.8); spG.addColorStop(0, 'rgba(255,255,255,0.8)'); spG.addColorStop(1, 'transparent');
      ctx.fillStyle = spG; ctx.fill();
      if (ball.number) {
        ctx.beginPath(); ctx.arc(x, y, ball.type === 'stripe' ? r*0.65 : r*0.45, 0, Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.fillStyle = ball.type === 'black' ? '#fff' : '#000'; ctx.font = `bold ${r*0.9}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ball.number.toString(), x, y);
      }
      ctx.filter = 'none';
    });

    if (currentPhase === 'aiming' && cueBall && !cueBall.isPocketed) {
      const dx = Math.cos(aimAngle); const dy = Math.sin(aimAngle);
      let ghostPos: Vector2DType | null = null; let minHit = 800;
      currentBalls.forEach((ball: Ball) => {
        if (ball.isPocketed || ball.id === 0) return;
        const d = Vector2D.fromObject(ball.position).sub(Vector2D.fromObject(cueBall.position));
        const proj = d.dot(new Vector2D(dx, dy));
        if (proj > 0) {
          const off = Math.sqrt(d.magnitude()**2 - proj**2);
          if (off < BALL_RADIUS * 2) {
            const cD = proj - Math.sqrt((BALL_RADIUS*2)**2 - off**2);
            if (cD < minHit) { minHit = cD; ghostPos = { x: cueBall.position.x+dx*cD, y: cueBall.position.y+dy*cD }; }
          }
        }
      });
      ctx.setLineDash([10, 5]); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cueBall.position.x, cueBall.position.y); ctx.lineTo(cueBall.position.x+dx*minHit, cueBall.position.y+dy*minHit); ctx.stroke(); ctx.setLineDash([]);
      if (ghostPos) {
        const { x: gx, y: gy } = ghostPos as Vector2DType;
        ctx.beginPath(); ctx.arc(gx, gy, BALL_RADIUS, 0, Math.PI*2); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
        const target = currentBalls.find(b => b.id !== 0 && !b.isPocketed && Math.sqrt((b.position.x-gx)**2+(b.position.y-gy)**2) < 1);
        if (target) {
          const bP = Vector2D.fromObject(target.position);
          const gP = Vector2D.fromObject(ghostPos);
          const impact = bP.sub(gP).normalize();
          ctx.beginPath(); ctx.moveTo(bP.x, bP.y); ctx.lineTo(bP.x+impact.x*180, bP.y+impact.y*180);
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)'; ctx.lineWidth = 2; ctx.stroke();
        }
      }
      if (!inHand) {
        const sD = 10 + power * 2.8; ctx.save(); ctx.translate(cueBall.position.x, cueBall.position.y); ctx.rotate(aimAngle + Math.PI);
        const sG = ctx.createLinearGradient(sD, -5, sD+450, 5); sG.addColorStop(0, '#fde68a'); sG.addColorStop(0.1, '#d97706'); sG.addColorStop(1, '#020617');
        ctx.fillStyle = sG; ctx.shadowBlur = 25; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowOffsetX = 12; ctx.shadowOffsetY = 12;
        ctx.beginPath(); ctx.moveTo(sD, -3.2); ctx.lineTo(sD+450, -8); ctx.lineTo(sD+450, 8); ctx.lineTo(sD, 3.2); ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  };

  const update = () => {
    const currentState = stateRef.current;
    if (currentState.phase === 'moving') {
      const { updatedBalls, pocketedBallIds, firstBallHitId } = PhysicsEngine.update(currentState.balls, (v) => { SoundManager.playCollision(v); if (v > 18) setCameraShake(v/5); if (v > 6) emitParticles(TABLE_WIDTH/2, TABLE_HEIGHT/2, 'rgb(255,255,255)', Math.floor(v), v/4); }, useGameStore.getState().cueSpin);
      if (firstBallHitId !== null && firstHitRef.current === null) firstHitRef.current = firstBallHitId;
      if (pocketedBallIds.length > 0) {
        pocketedThisShotRef.current = [...new Set([...pocketedThisShotRef.current, ...pocketedBallIds])]; SoundManager.playPocket();
        pocketedBallIds.forEach(id => {
          const ball = currentState.balls.find(b => b.id === id);
          if (ball) {
            let cp = POCKETS[0]; let md = Infinity; POCKETS.forEach(p => { const d = Math.sqrt((ball.position.x-p.x)**2+(ball.position.y-p.y)**2); if(d<md){md=d; cp=p;} });
            setPocketFlashes(prev => [...prev, { id: Math.random(), x: cp.x, y: cp.y }]); setTimeout(() => setPocketFlashes(prev => prev.slice(1)), 800); emitParticles(cp.x, cp.y, 'rgb(100, 200, 255)', 30, 4);
          }
        });
      }
      updateBalls(updatedBalls);
      const stillMoving = updatedBalls.some(b => !b.isPocketed && (Math.abs(b.velocity.x) > 0.05 || Math.abs(b.velocity.y) > 0.05));
      if (!stillMoving) handleTurnEnd();
    }
    draw(); requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  const handleMouseDown = () => { if (stateRef.current.phase === 'aiming') setIsCharging(true); };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (stateRef.current.phase !== 'aiming') return;
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect(); const mouseX = (e.clientX - rect.left) * (TABLE_WIDTH/rect.width); const mouseY = (e.clientY - rect.top) * (TABLE_HEIGHT/rect.height);
    const cueBall = stateRef.current.balls.find(b => b.id === 0); if (!cueBall) return;
    if (stateRef.current.cueBallInHand) {
      const cX = Math.min(Math.max(mouseX, BALL_RADIUS), TABLE_WIDTH-BALL_RADIUS); const cY = Math.min(Math.max(mouseY, BALL_RADIUS), TABLE_HEIGHT-BALL_RADIUS);
      if (!stateRef.current.balls.some(b => b.id !== 0 && !b.isPocketed && Math.sqrt((cX-b.position.x)**2+(cY-b.position.y)**2) < BALL_RADIUS*2)) updateBalls(stateRef.current.balls.map(b => b.id === 0 ? { ...b, position: { x: cX, y: cY } } : b));
      return;
    }
    if (!isCharging) setAimAngle(Math.atan2(mouseY - cueBall.position.y, mouseX - cueBall.position.x));
    else setPower(Math.min(Math.max((Math.sqrt((mouseX-cueBall.position.x)**2+(mouseY-cueBall.position.y)**2)-20)/2.5, 0), 90));
  };
  const handleMouseUp = () => {
    if (stateRef.current.phase !== 'aiming') return;
    if (stateRef.current.cueBallInHand) { setCueBallInHand(false); return; }
    if (!isCharging) return;
    const cueBall = stateRef.current.balls.find(b => b.id === 0);
    if (cueBall) {
      const { x: sx } = useGameStore.getState().cueSpin; const shotVel = power / 2.2;
      SoundManager.playCueHit(power); setPhase('moving'); setCameraShake(power/6); emitParticles(cueBall.position.x, cueBall.position.y, 'rgb(59, 130, 246)', 25, 4);
      updateBalls(stateRef.current.balls.map(b => b.id === 0 ? { ...b, velocity: { x: Math.cos(aimAngle+sx*0.08)*shotVel, y: Math.sin(aimAngle)*shotVel } } : b));
    }
    setIsCharging(false); setPower(0);
  };

  return (
    <div className="relative w-full h-full group perspective-[1500px]">
      <canvas ref={canvasRef} width={TABLE_WIDTH} height={TABLE_HEIGHT} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} className="w-full h-full cursor-crosshair touch-none rounded-[2.8rem] shadow-[0_0_120px_rgba(0,0,0,0.8)] transition-all duration-1000 hover:rotate-x-[2deg]" />
      {cueBallInHand && <div className="absolute top-12 left-1/2 -translate-x-1/2 px-14 py-6 bg-gradient-to-br from-blue-800 to-blue-600 backdrop-blur-3xl rounded-[2.5rem] text-white font-black text-[12px] tracking-[0.6em] shadow-[0_40px_80px_rgba(37,99,235,0.6)] border border-white/30 animate-fade-in pointer-events-none uppercase italic">Master Access • Position Shot</div>}
      {isCharging && !cueBallInHand && <div className="absolute right-14 top-1/2 -translate-y-1/2 w-8 h-96 bg-black/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.7)] p-2.5"><div className="h-full w-full bg-slate-950 rounded-[1.8rem] relative overflow-hidden"><div className="absolute bottom-0 w-full bg-gradient-to-t from-red-700 via-orange-500 via-yellow-400 to-white shadow-[0_0_40px_rgba(255,255,255,0.5)]" style={{ height: `${(power/90)*100}%`, transition: 'height 0.05s linear' }} /></div></div>}
    </div>
  );
};

export default PoolGame;
