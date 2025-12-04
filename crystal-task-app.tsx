import { useState, useEffect, useRef, useCallback } from 'react';

const CRYSTALS_TO_COMPLETE = 5;

const generateId = () => Math.random().toString(36).substr(2, 9);

const CrystalCanvas = ({ progress, completedCrystals, isComplete }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, w, h);
      
      // Draw stars
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * w;
        const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * h;
        const twinkle = Math.sin(timeRef.current * 0.002 + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255,255,255,${0.3 + twinkle * 0.7})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + twinkle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw completed crystals floating in space
      completedCrystals.forEach((c, i) => {
        const angle = (i / Math.max(completedCrystals.length, 1)) * Math.PI * 2 + timeRef.current * 0.0003;
        const radius = Math.min(w, h) * 0.25 + (i % 3) * 20;
        const cx = w / 2 + Math.cos(angle) * radius;
        const cy = h / 2 + Math.sin(angle) * radius;
        const size = 15 + (c.level || 1) * 5;
        drawCrystal(ctx, cx, cy, size, 1, c.hue || 180 + i * 30, timeRef.current);
      });

      // Draw main crystal
      const mainSize = 30 + progress * 0.5 + (isComplete ? 20 : 0);
      const mainHue = isComplete ? 60 : 200;
      drawCrystal(ctx, w / 2, h / 2, mainSize, progress / 100, mainHue, timeRef.current);

      // Progress ring
      ctx.strokeStyle = 'rgba(100,150,255,0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, mainSize + 20, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = `hsl(${180 + progress * 1.2}, 80%, 60%)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, mainSize + 20, -Math.PI / 2, -Math.PI / 2 + (progress / 100) * Math.PI * 2);
      ctx.stroke();

      timeRef.current += 16;
      animRef.current = requestAnimationFrame(draw);
    };

    const drawCrystal = (ctx, x, y, size, p, hue, t) => {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      glow.addColorStop(0, `hsla(${hue}, 80%, 60%, ${0.3 * p})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);

      const points = 6;
      for (let layer = 0; layer < 3; layer++) {
        const layerSize = size * (1 - layer * 0.2) * (0.5 + p * 0.5);
        const rot = t * 0.001 * (layer + 1) + layer * 0.5;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const a = (i / points) * Math.PI * 2 + rot;
          const r = i % 2 === 0 ? layerSize : layerSize * 0.5;
          const px = x + Math.cos(a) * r;
          const py = y + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = `hsla(${hue + layer * 20}, 70%, ${50 + layer * 10}%, ${0.6 - layer * 0.15})`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.8)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [progress, completedCrystals, isComplete]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

const UniverseThumbnail = ({ universe, onClick, isActive }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 80; canvas.height = 80;
    
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 80, 80);
    
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.2})`;
      ctx.beginPath();
      ctx.arc(Math.random() * 80, Math.random() * 80, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    universe.completedCrystals.forEach((c, i) => {
      const x = 20 + (i % 3) * 20;
      const y = 20 + Math.floor(i / 3) * 20;
      ctx.fillStyle = `hsl(${c.hue || 180 + i * 30}, 70%, 50%)`;
      ctx.beginPath();
      ctx.arc(x, y, 4 + (c.level || 1) * 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [universe]);

  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${isActive ? 'border-cyan-400 shadow-lg shadow-cyan-400/30' : 'border-gray-600 hover:border-gray-400'}`}
    >
      <canvas ref={canvasRef} width={80} height={80} />
      <div className="bg-gray-800 px-2 py-1 text-xs text-center text-gray-300 truncate">
        {universe.name}
      </div>
    </div>
  );
};

export default function App() {
  const [universes, setUniverses] = useState([{ id: generateId(), name: '宇宙 1', tasks: [], completedCrystals: [], currentProgress: 0, completedCount: 0 }]);
  const [activeUniverseId, setActiveUniverseId] = useState(universes[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [subtasks, setSubtasks] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const saveName = () => {
    if (newName.trim()) {
      updateUniverse(u => ({ ...u, name: newName.trim() }));
    }
    setEditingName(false);
  };

  const activeUniverse = universes.find(u => u.id === activeUniverseId) || universes[0];

  const updateUniverse = useCallback((updater) => {
    setUniverses(prev => prev.map(u => u.id === activeUniverseId ? updater(u) : u));
  }, [activeUniverseId]);

  const addTask = () => {
    if (!taskName.trim()) return;
    const subs = subtasks.split('\n').filter(s => s.trim()).map(s => ({ id: generateId(), text: s.trim(), done: false }));
    const newTask = { id: generateId(), name: taskName, subtasks: subs.length ? subs : [{ id: generateId(), text: taskName, done: false }], completed: false };
    updateUniverse(u => ({ ...u, tasks: [...u.tasks, newTask] }));
    setTaskName(''); setSubtasks('');
  };

  const toggleSubtask = (taskId, subId) => {
    updateUniverse(u => {
      const tasks = u.tasks.map(t => {
        if (t.id !== taskId) return t;
        const subtasks = t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s);
        const completed = subtasks.every(s => s.done);
        return { ...t, subtasks, completed };
      });
      
      const completedCount = tasks.filter(t => t.completed).length;
      const totalSubs = tasks.reduce((a, t) => a + t.subtasks.length, 0);
      const doneSubs = tasks.reduce((a, t) => a + t.subtasks.filter(s => s.done).length, 0);
      const progress = totalSubs ? Math.round((doneSubs / totalSubs) * 100) : 0;
      
      if (completedCount >= CRYSTALS_TO_COMPLETE && u.completedCount < CRYSTALS_TO_COMPLETE) {
        const level = u.completedCrystals.length + 1;
        const newCrystal = { id: generateId(), hue: Math.random() * 360, level, createdAt: Date.now() };
        return { ...u, tasks: [], completedCrystals: [...u.completedCrystals, newCrystal], currentProgress: 0, completedCount: 0 };
      }
      
      return { ...u, tasks, currentProgress: progress, completedCount };
    });
  };

  const deleteTask = (taskId) => {
    updateUniverse(u => {
      const tasks = u.tasks.filter(t => t.id !== taskId);
      const completedCount = tasks.filter(t => t.completed).length;
      const totalSubs = tasks.reduce((a, t) => a + t.subtasks.length, 0);
      const doneSubs = tasks.reduce((a, t) => a + t.subtasks.filter(s => s.done).length, 0);
      return { ...u, tasks, currentProgress: totalSubs ? Math.round((doneSubs / totalSubs) * 100) : 0, completedCount };
    });
  };

  const createNewUniverse = () => {
    const newUniverse = { id: generateId(), name: `宇宙 ${universes.length + 1}`, tasks: [], completedCrystals: [], currentProgress: 0, completedCount: 0 };
    setUniverses(prev => [...prev, newUniverse]);
    setActiveUniverseId(newUniverse.id);
    setMenuOpen(false);
  };

  const isComplete = activeUniverse.completedCount >= CRYSTALS_TO_COMPLETE;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur p-3 flex items-center justify-between sticky top-0 z-30">
        {editingName ? (
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            className="text-lg font-bold bg-transparent border-b border-cyan-400 focus:outline-none text-cyan-400 w-32"
          />
        ) : (
          <h1 
            onClick={() => { setEditingName(true); setNewName(activeUniverse.name); }}
            className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80"
            title="クリックして名前を変更"
          >
            {activeUniverse.name}
          </h1>
        )}
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-gray-700 rounded-lg transition">
          <div className="w-5 h-0.5 bg-white mb-1" /><div className="w-5 h-0.5 bg-white mb-1" /><div className="w-5 h-0.5 bg-white" />
        </button>
      </header>

      {/* Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-gray-800 p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">実績 - 宇宙一覧</h2>
              <button onClick={() => setMenuOpen(false)} className="p-1 hover:bg-gray-700 rounded">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {universes.map(u => (
                <UniverseThumbnail key={u.id} universe={u} isActive={u.id === activeUniverseId} onClick={() => { setActiveUniverseId(u.id); setMenuOpen(false); }} />
              ))}
            </div>
            <button onClick={createNewUniverse} className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:opacity-90 transition">
              + 新しい宇宙を作成
            </button>
          </div>
        </div>
      )}

      {/* Crystal Display */}
      <div className="h-48 sm:h-64 relative">
        <CrystalCanvas progress={activeUniverse.currentProgress} completedCrystals={activeUniverse.completedCrystals} isComplete={isComplete} />
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <div className="text-2xl font-bold">{activeUniverse.currentProgress}%</div>
          <div className="text-xs text-gray-400">完了タスク: {activeUniverse.completedCount} / {CRYSTALS_TO_COMPLETE}</div>
          <div className="text-xs text-purple-400">完成した結晶: {activeUniverse.completedCrystals.length}</div>
        </div>
      </div>

      {/* Task Form */}
      <div className="p-3 bg-gray-800/50 border-t border-gray-700">
        <input value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="タスク名" className="w-full p-2 mb-2 bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
        <textarea value={subtasks} onChange={e => setSubtasks(e.target.value)} placeholder="サブタスク（改行区切り）" rows={2} className="w-full p-2 mb-2 bg-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400" />
        <button onClick={addTask} className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold hover:opacity-90 transition text-sm">
          タスクを追加
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeUniverse.tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>タスクがありません</p>
            <p className="text-xs mt-1">{CRYSTALS_TO_COMPLETE}個のタスクを完了すると結晶が完成します</p>
          </div>
        ) : (
          activeUniverse.tasks.map(task => (
            <div key={task.id} className={`p-3 rounded-lg border transition-all ${task.completed ? 'bg-green-900/30 border-green-500/50' : 'bg-gray-800/50 border-gray-700'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`font-medium ${task.completed ? 'text-green-400' : ''}`}>
                  {task.completed && '✓ '}{task.name}
                </span>
                <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-300 text-sm px-2">削除</button>
              </div>
              <div className="space-y-1">
                {task.subtasks.map(sub => (
                  <label key={sub.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-700/50 rounded">
                    <input type="checkbox" checked={sub.done} onChange={() => toggleSubtask(task.id, sub.id)} className="w-4 h-4 accent-cyan-400" />
                    <span className={`text-sm ${sub.done ? 'line-through text-gray-500' : ''}`}>{sub.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {isComplete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50" onClick={() => updateUniverse(u => ({ ...u, completedCount: 0 }))}>
          <div className="text-center animate-pulse">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-xl font-bold text-yellow-400">結晶完成！</div>
            <div className="text-sm text-gray-300">タップして続ける</div>
          </div>
        </div>
      )}
    </div>
  );
}
