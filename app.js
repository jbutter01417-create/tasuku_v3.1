const CRYSTALS_TO_COMPLETE = 5;

// Utility function
const generateId = () => Math.random().toString(36).substr(2, 9);

// State management
let state = {
  universes: [
    {
      id: generateId(),
      name: '宇宙 1',
      tasks: [],
      completedCrystals: [],
      currentProgress: 0,
      completedCount: 0
    }
  ],
  activeUniverseId: null
};

// Initialize
state.activeUniverseId = state.universes[0].id;

// Load from localStorage
const loadState = () => {
  const saved = localStorage.getItem('crystalTaskApp');
  if (saved) {
    state = JSON.parse(saved);
  }
};

const saveState = () => {
  localStorage.setItem('crystalTaskApp', JSON.stringify(state));
};

// Get active universe
const getActiveUniverse = () => {
  return state.universes.find(u => u.id === state.activeUniverseId) || state.universes[0];
};

// Canvas drawing
let animationId = null;
let timeCounter = 0;

const drawCrystal = (ctx, x, y, size, progress, hue, time) => {
  // Glow effect
  const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
  glow.addColorStop(0, `hsla(${hue}, 80%, 60%, ${0.3 * progress})`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);

  const points = 6;
  for (let layer = 0; layer < 3; layer++) {
    const layerSize = size * (1 - layer * 0.2) * (0.5 + progress * 0.5);
    const rotation = time * 0.001 * (layer + 1) + layer * 0.5;
    
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2 + rotation;
      const radius = i % 2 === 0 ? layerSize : layerSize * 0.5;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    
    ctx.fillStyle = `hsla(${hue + layer * 20}, 70%, ${50 + layer * 10}%, ${0.6 - layer * 0.15})`;
    ctx.fill();
    ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.8)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

const drawCanvas = () => {
  const canvas = document.getElementById('crystalCanvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  
  const universe = getActiveUniverse();
  const progress = universe.currentProgress;
  const completedCrystals = universe.completedCrystals;
  const isComplete = universe.completedCount >= CRYSTALS_TO_COMPLETE;

  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);

  // Stars
  for (let i = 0; i < 50; i++) {
    const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * w;
    const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * h;
    const twinkle = Math.sin(timeCounter * 0.002 + i) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255,255,255,${0.3 + twinkle * 0.7})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + twinkle, 0, Math.PI * 2);
    ctx.fill();
  }

  // Completed crystals
  completedCrystals.forEach((crystal, i) => {
    const angle = (i / Math.max(completedCrystals.length, 1)) * Math.PI * 2 + timeCounter * 0.0003;
    const radius = Math.min(w, h) * 0.25 + (i % 3) * 20;
    const cx = w / 2 + Math.cos(angle) * radius;
    const cy = h / 2 + Math.sin(angle) * radius;
    const size = 15 + (crystal.level || 1) * 5;
    drawCrystal(ctx, cx, cy, size, 1, crystal.hue || 180 + i * 30, timeCounter);
  });

  // Main crystal
  const mainSize = 30 + progress * 0.5 + (isComplete ? 20 : 0);
  const mainHue = isComplete ? 60 : 200;
  drawCrystal(ctx, w / 2, h / 2, mainSize, progress / 100, mainHue, timeCounter);

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

  timeCounter += 16;
  animationId = requestAnimationFrame(drawCanvas);
};

const resizeCanvas = () => {
  const canvas = document.getElementById('crystalCanvas');
  const container = canvas.parentElement;
  canvas.width = container.offsetWidth * window.devicePixelRatio;
  canvas.height = container.offsetHeight * window.devicePixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
};

// Universe thumbnail drawing
const drawUniverseThumbnail = (canvas, universe) => {
  const ctx = canvas.getContext('2d');
  canvas.width = 80;
  canvas.height = 80;

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, 80, 80);

  // Stars
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.2})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 80, Math.random() * 80, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crystals
  universe.completedCrystals.forEach((crystal, i) => {
    const x = 20 + (i % 3) * 20;
    const y = 20 + Math.floor(i / 3) * 20;
    ctx.fillStyle = `hsl(${crystal.hue || 180 + i * 30}, 70%, 50%)`;
    ctx.beginPath();
    ctx.arc(x, y, 4 + (crystal.level || 1) * 2, 0, Math.PI * 2);
    ctx.fill();
  });
};

// UI Updates
const updateUI = () => {
  const universe = getActiveUniverse();

  // Update title
  const titleEl = document.getElementById('universeTitle');
  titleEl.textContent = universe.name;

  // Update stats
  document.getElementById('progressText').textContent = `${universe.currentProgress}%`;
  document.getElementById('completedCount').textContent = universe.completedCount;
  document.getElementById('crystalCount').textContent = universe.completedCrystals.length;

  // Update task list
  const taskList = document.getElementById('taskList');
  if (universe.tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <p>タスクがありません</p>
        <p class="empty-state-subtitle">5個のタスクを完了すると結晶が完成します</p>
      </div>
    `;
  } else {
    taskList.innerHTML = universe.tasks.map(task => `
      <div class="task-card ${task.completed ? 'completed' : ''}">
        <div class="task-header">
          <span class="task-name ${task.completed ? 'completed' : ''}">${task.completed ? '✓ ' : ''}${task.name}</span>
          <button class="delete-btn" onclick="deleteTask('${task.id}')">削除</button>
        </div>
        <div class="subtask-list">
          ${task.subtasks.map(sub => `
            <label class="subtask-item">
              <input type="checkbox" class="subtask-checkbox" ${sub.done ? 'checked' : ''} onchange="toggleSubtask('${task.id}', '${sub.id}')">
              <span class="subtask-text ${sub.done ? 'done' : ''}">${sub.text}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Update universe grid
  const universeGrid = document.getElementById('universeGrid');
  universeGrid.innerHTML = state.universes.map(u => {
    const isActive = u.id === state.activeUniverseId;
    return `
      <div class="universe-thumbnail ${isActive ? 'active' : ''}" onclick="switchUniverse('${u.id}')">
        <canvas id="thumb-${u.id}" width="80" height="80"></canvas>
        <div class="universe-name">${u.name}</div>
      </div>
    `;
  }).join('');

  // Draw thumbnails
  state.universes.forEach(u => {
    const canvas = document.getElementById(`thumb-${u.id}`);
    if (canvas) {
      drawUniverseThumbnail(canvas, u);
    }
  });

  // Show completion overlay
  const overlay = document.getElementById('completionOverlay');
  if (universe.completedCount >= CRYSTALS_TO_COMPLETE) {
    overlay.classList.add('show');
  } else {
    overlay.classList.remove('show');
  }

  saveState();
};

// Task operations
const addTask = () => {
  const taskNameInput = document.getElementById('taskNameInput');
  const subtasksInput = document.getElementById('subtasksInput');
  
  const taskName = taskNameInput.value.trim();
  if (!taskName) return;

  const subtaskTexts = subtasksInput.value.split('\n').filter(s => s.trim());
  const subtasks = subtaskTexts.length > 0
    ? subtaskTexts.map(text => ({ id: generateId(), text: text.trim(), done: false }))
    : [{ id: generateId(), text: taskName, done: false }];

  const newTask = {
    id: generateId(),
    name: taskName,
    subtasks: subtasks,
    completed: false
  };

  const universe = getActiveUniverse();
  universe.tasks.push(newTask);

  taskNameInput.value = '';
  subtasksInput.value = '';
  updateUI();
};

const toggleSubtask = (taskId, subId) => {
  const universe = getActiveUniverse();
  const task = universe.tasks.find(t => t.id === taskId);
  if (!task) return;

  const subtask = task.subtasks.find(s => s.id === subId);
  if (!subtask) return;

  subtask.done = !subtask.done;
  task.completed = task.subtasks.every(s => s.done);

  // Recalculate progress
  const completedCount = universe.tasks.filter(t => t.completed).length;
  const totalSubs = universe.tasks.reduce((sum, t) => sum + t.subtasks.length, 0);
  const doneSubs = universe.tasks.reduce((sum, t) => sum + t.subtasks.filter(s => s.done).length, 0);
  universe.currentProgress = totalSubs ? Math.round((doneSubs / totalSubs) * 100) : 0;
  universe.completedCount = completedCount;

  // Check if crystal is complete
  if (completedCount >= CRYSTALS_TO_COMPLETE && universe.tasks.length > 0) {
    const level = universe.completedCrystals.length + 1;
    const newCrystal = {
      id: generateId(),
      hue: Math.random() * 360,
      level: level,
      createdAt: Date.now()
    };
    universe.completedCrystals.push(newCrystal);
    universe.tasks = [];
    universe.currentProgress = 0;
    universe.completedCount = 0;
  }

  updateUI();
};

const deleteTask = (taskId) => {
  const universe = getActiveUniverse();
  universe.tasks = universe.tasks.filter(t => t.id !== taskId);

  const completedCount = universe.tasks.filter(t => t.completed).length;
  const totalSubs = universe.tasks.reduce((sum, t) => sum + t.subtasks.length, 0);
  const doneSubs = universe.tasks.reduce((sum, t) => sum + t.subtasks.filter(s => s.done).length, 0);
  universe.currentProgress = totalSubs ? Math.round((doneSubs / totalSubs) * 100) : 0;
  universe.completedCount = completedCount;

  updateUI();
};

// Universe operations
const switchUniverse = (universeId) => {
  state.activeUniverseId = universeId;
  document.getElementById('menuOverlay').classList.remove('open');
  updateUI();
};

const createNewUniverse = () => {
  const newUniverse = {
    id: generateId(),
    name: `宇宙 ${state.universes.length + 1}`,
    tasks: [],
    completedCrystals: [],
    currentProgress: 0,
    completedCount: 0
  };
  state.universes.push(newUniverse);
  state.activeUniverseId = newUniverse.id;
  document.getElementById('menuOverlay').classList.remove('open');
  updateUI();
};

// Name editing
const setupNameEditing = () => {
  const titleEl = document.getElementById('universeTitle');
  titleEl.addEventListener('click', () => {
    const universe = getActiveUniverse();
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'header-title-input';
    input.value = universe.name;
    
    const save = () => {
      const newName = input.value.trim();
      if (newName) {
        universe.name = newName;
        updateUI();
      }
      titleEl.style.display = '';
      input.remove();
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
    });

    titleEl.style.display = 'none';
    titleEl.parentElement.insertBefore(input, titleEl);
    input.focus();
  });
};

// Event listeners
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('menuOverlay').classList.add('open');
});

document.getElementById('closeBtn').addEventListener('click', () => {
  document.getElementById('menuOverlay').classList.remove('open');
});

document.getElementById('menuOverlay').addEventListener('click', () => {
  document.getElementById('menuOverlay').classList.remove('open');
});

document.getElementById('createUniverseBtn').addEventListener('click', createNewUniverse);

document.getElementById('addTaskBtn').addEventListener('click', addTask);

document.getElementById('taskNameInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    addTask();
  }
});

document.getElementById('completionOverlay').addEventListener('click', () => {
  const universe = getActiveUniverse();
  universe.completedCount = 0;
  updateUI();
});

// Initialize
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
  loadState();
  resizeCanvas();
  updateUI();
  drawCanvas();
  setupNameEditing();
});
