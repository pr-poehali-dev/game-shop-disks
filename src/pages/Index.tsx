import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ───────────────────────── ТИПЫ ─────────────────────────
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface User {
  nick: string;
  coins: number;
  collection: string[];
  achievements: string[];
  clickCount: number;
  joinDate: string;
}

interface Game {
  id: string;
  title: string;
  price: number;
  genre: string;
  emoji: string;
  color: string;
  description: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: "time" | "coins" | "clicks" | "promo" | "buy";
  target: number;
  completed: boolean;
}

interface Player {
  nick: string;
  coins: number;
  collection: string[];
  achievements: string[];
  clickCount: number;
  joinDate: string;
}

// ───────────────────────── ДАННЫЕ ─────────────────────────
const GAMES: Game[] = [
  { id: "undertale", title: "Undertale", price: 750, genre: "RPG", emoji: "💛", color: "var(--neon-yellow)", description: "Легендарная RPG о подземном мире, где убийство — не единственный путь." },
  { id: "geometry-dash", title: "Geometry Dash", price: 1000, genre: "Ритм", emoji: "🔷", color: "var(--neon-cyan)", description: "Прыгай в такт музыке через смертельные препятствия." },
  { id: "fnaf-sl", title: "FNaF: Sister Location", price: 500, genre: "Хоррор", emoji: "🟣", color: "var(--neon-purple)", description: "Тёмные секреты подземного заведения аниматроников." },
  { id: "minecraft", title: "Minecraft", price: 1250, genre: "Песочница", emoji: "🟩", color: "var(--neon-green)", description: "Строй, исследуй и выживай в бесконечных мирах." },
  { id: "fnaf2", title: "FNaF 2", price: 1500, genre: "Хоррор", emoji: "🔴", color: "#ff4444", description: "Новый ресторан, новые аниматроники — страшнее, чем раньше." },
  { id: "nulls-brawl", title: "Nulls Brawl", price: 2000, genre: "Экшен", emoji: "⚡", color: "var(--neon-yellow)", description: "Приватный сервер Brawl Stars со всеми разблокированными персонажами." },
  { id: "kinitopet", title: "KinitoPET", price: 2500, genre: "Ужасы", emoji: "🖥️", color: "var(--neon-pink)", description: "Виртуальный питомец, который знает о тебе слишком много." },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: "here-i-am", name: "Here I Am", description: "Ввести промокод TBS", icon: "👁️", color: "var(--neon-purple)" },
  { id: "rich", name: "Богатей", description: "Накопить 1000 ИМ", icon: "💰", color: "var(--neon-yellow)" },
  { id: "clicker", name: "Кликер", description: "Нажать 100 раз в кликере", icon: "🖱️", color: "var(--neon-cyan)" },
  { id: "collector", name: "Коллекционер", description: "Купить 3 игры", icon: "🎮", color: "var(--neon-green)" },
  { id: "questmaster", name: "Охотник за заданиями", description: "Выполнить 3 задания", icon: "🏆", color: "var(--neon-pink)" },
];

const INITIAL_QUESTS: Quest[] = [
  { id: "time1", title: "Первый визит", description: "Провести 1 минуту на сайте", reward: 50, type: "time", target: 60, completed: false },
  { id: "coins1", title: "Копилка", description: "Заработать 200 монет", reward: 100, type: "coins", target: 200, completed: false },
  { id: "clicks1", title: "Кликер-новичок", description: "Нажать 50 раз в кликере", reward: 75, type: "clicks", target: 50, completed: false },
  { id: "clicks2", title: "Кликер-мастер", description: "Нажать 100 раз в кликере", reward: 150, type: "clicks", target: 100, completed: false },
  { id: "promo1", title: "Знаток кодов", description: "Ввести любой промокод", reward: 60, type: "promo", target: 1, completed: false },
  { id: "buy1", title: "Первая покупка", description: "Купить любую игру", reward: 200, type: "buy", target: 1, completed: false },
  { id: "coins2", title: "Тысячник", description: "Заработать 1000 монет", reward: 300, type: "coins", target: 1000, completed: false },
];

// фейковых игроков убрали — теперь только реальные

const PROMOS: Record<string, { type: "coins" | "item"; value: number | string; message: string; achievement?: string }> = {
  "TBS": { type: "item", value: "minecraft-tbs", message: "Получено дополнение «The Broken Script» для Minecraft!", achievement: "here-i-am" },
  "RELEASE": { type: "coins", value: 850, message: "Получено 850 Игровых Монет!" },
};

// ───────────────────────── ХРАНИЛИЩЕ ─────────────────────────
const STORAGE_KEY = "gameshop_user";
const PLAYERS_KEY = "gameshop_players";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveUser(u: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
}

function loadPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePlayers(players: Player[]) {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

// ───────────────────────── КОМПОНЕНТ АЧИВКИ ─────────────────────────
function AchievementPopup({ achievement, onDone }: { achievement: Achievement; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="achievement-popup fixed top-4 right-4 z-50 cyber-card border p-4 max-w-xs neon-border-purple">
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-float">{achievement.icon}</span>
        <div>
          <p className="font-orbitron text-xs neon-text-purple mb-0.5">АЧИВКА РАЗБЛОКИРОВАНА</p>
          <p className="font-orbitron text-sm text-white font-bold">{achievement.name}</p>
          <p className="font-rajdhani text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── ЗВУКИ ─────────────────────────
function playSound(type: "click" | "buy" | "achievement" | "error" | "promo") {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);

  const now = ctx.currentTime;
  if (type === "click") {
    o.type = "sine"; o.frequency.setValueAtTime(600, now); o.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    g.gain.setValueAtTime(0.12, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    o.start(now); o.stop(now + 0.08);
  } else if (type === "buy") {
    o.type = "triangle";
    o.frequency.setValueAtTime(400, now); o.frequency.setValueAtTime(600, now + 0.1); o.frequency.setValueAtTime(800, now + 0.2);
    g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    o.start(now); o.stop(now + 0.4);
  } else if (type === "achievement") {
    o.type = "sine";
    o.frequency.setValueAtTime(523, now); o.frequency.setValueAtTime(659, now + 0.12); o.frequency.setValueAtTime(784, now + 0.24);
    g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    o.start(now); o.stop(now + 0.5);
  } else if (type === "promo") {
    o.type = "square";
    o.frequency.setValueAtTime(300, now); o.frequency.setValueAtTime(500, now + 0.1); o.frequency.setValueAtTime(700, now + 0.2); o.frequency.setValueAtTime(900, now + 0.3);
    g.gain.setValueAtTime(0.12, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    o.start(now); o.stop(now + 0.45);
  } else {
    o.type = "sawtooth"; o.frequency.setValueAtTime(200, now); o.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    o.start(now); o.stop(now + 0.15);
  }
}

// ───────────────────────── ФОН СО СМАЙЛИКАМИ ─────────────────────────
const BG_EMOJIS = ["🎮","💿","🕹️","⚡","💜","🌟","🔮","🎯","👾","🦾","🌀","💫","🔷","🟣","🎲","🏆","🪙","🔑","⚔️","🛸"];

function EmojiBg() {
  const items = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    emoji: BG_EMOJIS[i % BG_EMOJIS.length],
    left: `${(i * 3.7 + Math.sin(i) * 5 + 100) % 100}%`,
    size: `${1.1 + (i % 5) * 0.35}rem`,
    duration: `${12 + (i % 10) * 2.5}s`,
    delay: `${-(i * 1.4) % 20}s`,
    opacity: 0.12 + (i % 4) * 0.04,
  }));
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {items.map(it => (
        <span
          key={it.id}
          className="emoji-bg-item"
          style={{
            left: it.left,
            fontSize: it.size,
            animationDuration: it.duration,
            animationDelay: it.delay,
            opacity: it.opacity,
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
}

// ───────────────────────── НОВОСТИ ─────────────────────────
interface NewsItem {
  id: string;
  date: string;
  tag: string;
  tagColor: string;
  title: string;
  body: string;
  emoji: string;
}

const NEWS: NewsItem[] = [
  {
    id: "n1",
    date: "28 апреля 2026",
    tag: "РЕЛИЗ",
    tagColor: "var(--neon-green)",
    title: "Геймшоп.com открыт!",
    body: "Мы рады объявить об официальном запуске геймшоп.com! Теперь ты можешь покупать диски игр за Игровые Монеты, зарабатывать их в кликере, выполнять задания и открывать ачивки. Спасибо, что вы с нами с первого дня!",
    emoji: "🚀",
  },
  {
    id: "n2",
    date: "28 апреля 2026",
    tag: "ПРОМОКОД",
    tagColor: "var(--neon-pink)",
    title: "Промокод RELEASE — 850 ИМ в подарок",
    body: "В честь старта магазина мы выпустили промокод RELEASE. Введи его в разделе Магазин и получи 850 Игровых Монет на свой счёт. Промокод действует для каждого аккаунта один раз.",
    emoji: "🎁",
  },
  {
    id: "n3",
    date: "28 апреля 2026",
    tag: "СЕКРЕТ",
    tagColor: "var(--neon-purple)",
    title: "Тайный промокод TBS",
    body: "Говорят, где-то существует промокод, который открывает секретное дополнение к Minecraft... Его название — три буквы. Введи его в разделе Магазин и узнай, что скрывается за надписью «The Broken Script». Ачивка «Here I Am» ждёт тебя.",
    emoji: "👁️",
  },
  {
    id: "n4",
    date: "28 апреля 2026",
    tag: "ОБНОВЛЕНИЕ",
    tagColor: "var(--neon-cyan)",
    title: "Версия 1.0.0 — что уже доступно",
    body: "В первой версии геймшопа: 7 игровых дисков, система Игровых Монет (ИМ), кликер, 7 заданий с наградами, 5 ачивок, промокоды, коллекция, рейтинг игроков и профиль с сменой ника. Впереди — ещё больше!",
    emoji: "📋",
  },
];

function NewsPage() {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <p className="font-mono-tech text-xs neon-text-cyan mb-1">// ЛЕНТА</p>
      <h2 className="font-orbitron text-2xl font-bold text-white mb-6">НОВОСТИ</h2>

      <div className="flex flex-col gap-4">
        {NEWS.map((n) => (
          <div key={n.id} className="cyber-card border p-5">
            <div className="flex items-start gap-4">
              <span className="text-4xl shrink-0 animate-float">{n.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span
                    className="font-orbitron text-xs px-2 py-0.5 rounded-sm border"
                    style={{ color: n.tagColor, borderColor: n.tagColor, background: `${n.tagColor}15` }}
                  >
                    {n.tag}
                  </span>
                  <span className="font-mono-tech text-xs text-white/30">{n.date}</span>
                </div>
                <h3 className="font-orbitron text-sm font-bold text-white mb-2">{n.title}</h3>
                <p className="font-rajdhani text-sm text-white/65 leading-relaxed">{n.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cyber-card border p-4 mt-4 text-center">
        <p className="font-mono-tech text-xs text-white/25">// СЛЕДИ ЗА ОБНОВЛЕНИЯМИ</p>
      </div>
    </div>
  );
}

// ───────────────────────── НАВИГАЦИЯ ─────────────────────────
const NAV_ITEMS = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "news", label: "Новости", icon: "Newspaper" },
  { id: "shop", label: "Магазин", icon: "ShoppingBag" },
  { id: "clicker", label: "Кликер", icon: "MousePointer2" },
  { id: "quests", label: "Задания", icon: "Target" },
  { id: "collection", label: "Коллекция", icon: "Library" },
  { id: "players", label: "Игроки", icon: "Users" },
  { id: "profile", label: "Профиль", icon: "User" },
  { id: "about", label: "О сайте", icon: "Info" },
];

// ───────────────────────── ГЛАВНАЯ ─────────────────────────
function HomePage({ user, onNav }: { user: User | null; onNav: (p: string) => void }) {
  return (
    <div className="animate-fade-in">
      <div className="relative min-h-[420px] flex flex-col items-center justify-center text-center py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--neon-purple), transparent 70%)" }} />
        </div>
        <p className="font-mono-tech text-xs neon-text-cyan mb-4 tracking-widest">// ДОБРО ПОЖАЛОВАТЬ В</p>
        <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-2 glitch-text" data-text="геймшоп.com">
          геймшоп.com
        </h1>
        <p className="font-orbitron text-sm text-white/40 mb-6 tracking-widest">ДИСКИ ИГР И ДРУГОЕ</p>
        <p className="font-rajdhani text-xl text-white/70 mb-8 max-w-lg">
          Покупай игровые диски за <span className="neon-text-yellow font-bold">Игровые Монеты</span>, собирай коллекцию и открывай достижения
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button className="cyber-btn cyber-btn-filled text-sm py-3 px-6" onClick={() => onNav("shop")}>
            ОТКРЫТЬ МАГАЗИН
          </button>
          <button className="cyber-btn cyber-btn-cyan text-sm py-3 px-6" onClick={() => onNav("clicker")}>
            ЗАРАБОТАТЬ МОНЕТЫ
          </button>
        </div>
        {user && (
          <div className="mt-8 font-mono-tech text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            ИГРОК: <span className="neon-text-purple">{user.nick}</span> · БАЛАНС: <span className="neon-text-yellow">{user.coins} ИМ</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[
          { emoji: "💿", title: "7 игр", sub: "в каталоге магазина", color: "var(--neon-purple)" },
          { emoji: "🪙", title: "Игровые Монеты", sub: "уникальная валюта сайта", color: "var(--neon-yellow)" },
          { emoji: "🏆", title: "Ачивки", sub: "за достижения и промокоды", color: "var(--neon-cyan)" },
        ].map(item => (
          <div key={item.title} className="cyber-card border p-6 text-center">
            <div className="text-4xl mb-3 animate-float">{item.emoji}</div>
            <p className="font-orbitron text-lg font-bold" style={{ color: item.color }}>{item.title}</p>
            <p className="font-rajdhani text-white/50 text-sm mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 cyber-card border p-6">
        <p className="font-orbitron text-xs neon-text-pink mb-3">// ГОРЯЧИЕ ПРЕДЛОЖЕНИЯ</p>
        <div className="flex flex-wrap gap-3">
          {GAMES.slice(0, 4).map(g => (
            <button key={g.id} onClick={() => onNav("shop")}
              className="flex items-center gap-2 px-3 py-2 rounded border border-white/10 hover:border-white/30 transition-all bg-white/5 hover:bg-white/10">
              <span className="text-lg">{g.emoji}</span>
              <span className="font-rajdhani text-sm text-white/80">{g.title}</span>
              <span className="font-mono-tech text-xs" style={{ color: g.color }}>{g.price} ИМ</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── МАГАЗИН ─────────────────────────
function ShopPage({ user, setUser, unlockAchievement, showToast }: {
  user: User | null;
  setUser: (u: User) => void;
  unlockAchievement: (id: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [promoCode, setPromoCode] = useState("");
  const [usedPromos, setUsedPromos] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("gameshop_promos") || "[]"); } catch { return []; }
  });

  const handlePromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    if (usedPromos.includes(code)) { showToast("Этот промокод уже использован!", "error"); return; }
    const promo = PROMOS[code];
    if (!promo) { showToast("Неверный промокод!", "error"); return; }
    if (!user) { showToast("Сначала зарегистрируйся в разделе Профиль!", "error"); return; }

    const newUsed = [...usedPromos, code];
    setUsedPromos(newUsed);
    localStorage.setItem("gameshop_promos", JSON.stringify(newUsed));

    let updated = { ...user };
    if (promo.type === "coins") {
      updated = { ...updated, coins: updated.coins + (promo.value as number) };
    } else if (promo.type === "item") {
      if (!updated.collection.includes(promo.value as string)) {
        updated = { ...updated, collection: [...updated.collection, promo.value as string] };
      }
    }
    setUser(updated);
    saveUser(updated);

    playSound("promo");
    showToast(promo.message, "success");
    if (promo.achievement) unlockAchievement(promo.achievement);

    const questsRaw = localStorage.getItem("gameshop_quests");
    if (questsRaw) {
      const quests: Quest[] = JSON.parse(questsRaw);
      const updatedQ = quests.map(q => q.type === "promo" && !q.completed ? { ...q, completed: true } : q);
      localStorage.setItem("gameshop_quests", JSON.stringify(updatedQ));
    }
    setPromoCode("");
  };

  const handleBuy = (game: Game) => {
    if (!user) { showToast("Сначала зарегистрируйся в разделе Профиль!", "error"); return; }
    if (user.collection.includes(game.id)) { showToast("Игра уже в твоей коллекции!", "info"); return; }
    if (user.coins < game.price) { showToast(`Не хватает ${game.price - user.coins} ИМ!`, "error"); return; }

    const newCollection = [...user.collection, game.id];
    const updated = { ...user, coins: user.coins - game.price, collection: newCollection };
    setUser(updated);
    saveUser(updated);
    playSound("buy");
    showToast(`🎮 ${game.title} добавлен в коллекцию!`, "success");

    if (newCollection.filter(id => !id.includes("-tbs")).length >= 3) unlockAchievement("collector");

    const questsRaw = localStorage.getItem("gameshop_quests");
    if (questsRaw) {
      const quests: Quest[] = JSON.parse(questsRaw);
      const updatedQ = quests.map(q => q.type === "buy" && !q.completed ? { ...q, completed: true } : q);
      localStorage.setItem("gameshop_quests", JSON.stringify(updatedQ));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono-tech text-xs neon-text-cyan mb-1">// КАТАЛОГ</p>
          <h2 className="font-orbitron text-2xl font-bold text-white">МАГАЗИН</h2>
        </div>
        {user && (
          <div className="flex items-center gap-2 cyber-card border px-4 py-2">
            <span className="text-lg">🪙</span>
            <span className="font-orbitron text-sm neon-text-yellow">{user.coins} ИМ</span>
          </div>
        )}
      </div>

      <div className="cyber-card border p-4 mb-6">
        <p className="font-orbitron text-xs neon-text-pink mb-3">// ПРОМОКОД</p>
        <div className="flex gap-3">
          <input
            value={promoCode}
            onChange={e => setPromoCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handlePromo()}
            placeholder="ВВЕДИ ПРОМОКОД..."
            className="flex-1 bg-black/50 border border-white/10 px-4 py-2 font-mono-tech text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 rounded-sm"
          />
          <button className="cyber-btn cyber-btn-pink" onClick={handlePromo}>ВВЕСТИ</button>
        </div>
        <p className="font-mono-tech text-xs text-white/30 mt-2">Используй промокоды для получения монет и предметов</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map(game => {
          const owned = user?.collection.includes(game.id);
          const canAfford = user && user.coins >= game.price;
          return (
            <div key={game.id} className={`cyber-card border p-5 flex flex-col gap-3 ${owned ? "opacity-70" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{game.emoji}</span>
                  <div>
                    <h3 className="font-orbitron text-sm font-bold text-white">{game.title}</h3>
                    <span className="font-mono-tech text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{game.genre}</span>
                  </div>
                </div>
                <span className="font-orbitron text-sm font-bold" style={{ color: game.color }}>{game.price} ИМ</span>
              </div>
              <p className="font-rajdhani text-sm text-white/60 flex-1">{game.description}</p>
              {owned ? (
                <div className="cyber-btn text-center" style={{ borderColor: "var(--neon-green)", color: "var(--neon-green)", pointerEvents: "none" }}>
                  ✓ В КОЛЛЕКЦИИ
                </div>
              ) : (
                <button
                  className={`cyber-btn ${canAfford ? "cyber-btn-filled" : ""}`}
                  style={!canAfford ? { borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.3)", cursor: "not-allowed" } : {}}
                  onClick={() => handleBuy(game)}
                  disabled={!canAfford}
                >
                  {user ? (canAfford ? "КУПИТЬ" : "НЕ ХВАТАЕТ МОНЕТ") : "ВОЙДИ ДЛЯ ПОКУПКИ"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────── КЛИКЕР ─────────────────────────
function ClickerPage({ user, setUser, unlockAchievement }: {
  user: User | null;
  setUser: (u: User) => void;
  unlockAchievement: (id: string) => void;
}) {
  const [clicking, setClicking] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const pIdRef = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pid = pIdRef.current++;
    setParticles(p => [...p, { id: pid, x, y }]);
    setTimeout(() => setParticles(p => p.filter(pp => pp.id !== pid)), 800);
    playSound("click");

    const newClicks = user.clickCount + 1;
    const newCoins = user.coins + 1;
    const updated = { ...user, coins: newCoins, clickCount: newClicks };
    setUser(updated);
    saveUser(updated);

    if (newClicks === 100) unlockAchievement("clicker");
    if (newCoins >= 1000 && user.coins < 1000) unlockAchievement("rich");

    const questsRaw = localStorage.getItem("gameshop_quests");
    if (questsRaw) {
      const quests: Quest[] = JSON.parse(questsRaw);
      const updatedQ = quests.map(q => {
        if (q.type === "clicks" && !q.completed && newClicks >= q.target) {
          const u2 = loadUser();
          if (u2) {
            const withReward = { ...u2, coins: u2.coins + q.reward };
            saveUser(withReward);
          }
          return { ...q, completed: true };
        }
        return q;
      });
      localStorage.setItem("gameshop_quests", JSON.stringify(updatedQ));
    }

    setClicking(true);
    setTimeout(() => setClicking(false), 150);
  };

  if (!user) return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-24 gap-4">
      <span className="text-6xl animate-float">🔒</span>
      <p className="font-orbitron text-lg text-white/50">Войди в профиль чтобы кликать</p>
    </div>
  );

  return (
    <div className="animate-fade-in flex flex-col items-center gap-8 py-8">
      <div>
        <p className="font-mono-tech text-xs neon-text-cyan mb-1 text-center">// КЛИКЕР</p>
        <h2 className="font-orbitron text-2xl font-bold text-white text-center">ЗАРАБАТЫВАЙ ИМ</h2>
      </div>

      <div className="flex gap-8 text-center">
        <div className="cyber-card border px-8 py-4">
          <p className="font-mono-tech text-xs text-white/40 mb-1">БАЛАНС</p>
          <p className="font-orbitron text-2xl neon-text-yellow">{user.coins} ИМ</p>
        </div>
        <div className="cyber-card border px-8 py-4">
          <p className="font-mono-tech text-xs text-white/40 mb-1">КЛИКОВ</p>
          <p className="font-orbitron text-2xl neon-text-cyan">{user.clickCount}</p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={handleClick}
          className={`relative w-48 h-48 rounded-full border-4 font-orbitron text-xl font-black text-white transition-transform select-none overflow-hidden pulse-neon ${clicking ? "scale-90" : "scale-100 hover:scale-105"}`}
          style={{
            borderColor: "var(--neon-purple)",
            background: "radial-gradient(circle, rgba(168,85,247,0.2), rgba(7,7,15,0.9))",
            boxShadow: "0 0 40px rgba(168,85,247,0.5), inset 0 0 40px rgba(168,85,247,0.1)",
          }}
        >
          {particles.map(p => (
            <span key={p.id} className="absolute pointer-events-none font-orbitron text-sm font-bold neon-text-yellow"
              style={{ left: p.x, top: p.y, animation: "float 0.8s ease forwards", transform: "translate(-50%, -50%)" }}>
              +1
            </span>
          ))}
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl">🪙</span>
            <span className="text-sm">КЛИК!</span>
          </div>
        </button>
      </div>

      <p className="font-mono-tech text-xs text-white/30">1 клик = 1 ИМ</p>

      <div className="w-full max-w-md cyber-card border p-4">
        <p className="font-orbitron text-xs neon-text-purple mb-3">// ПРОГРЕСС КЛИКОВ</p>
        {[50, 100, 250, 500].map(target => (
          <div key={target} className="flex items-center gap-3 mb-2">
            <span className="font-mono-tech text-xs text-white/40 w-16">{target} кл.</span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (user.clickCount / target) * 100)}%`,
                  background: user.clickCount >= target ? "var(--neon-green)" : "var(--neon-purple)",
                }} />
            </div>
            <span className="font-mono-tech text-xs" style={{ color: user.clickCount >= target ? "var(--neon-green)" : "rgba(255,255,255,0.3)" }}>
              {user.clickCount >= target ? "✓" : `${user.clickCount}/${target}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────── КОЛЛЕКЦИЯ ─────────────────────────
function CollectionPage({ user }: { user: User | null }) {
  if (!user) return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-24 gap-4">
      <span className="text-6xl animate-float">🔒</span>
      <p className="font-orbitron text-lg text-white/50">Войди в профиль чтобы видеть коллекцию</p>
    </div>
  );

  const owned = GAMES.filter(g => user.collection.includes(g.id));
  const notOwned = GAMES.filter(g => !user.collection.includes(g.id));
  const hasTBS = user.collection.includes("minecraft-tbs");

  return (
    <div className="animate-fade-in">
      <p className="font-mono-tech text-xs neon-text-cyan mb-1">// МОЯ</p>
      <h2 className="font-orbitron text-2xl font-bold text-white mb-6">КОЛЛЕКЦИЯ</h2>

      {owned.length === 0 ? (
        <div className="cyber-card border p-12 text-center">
          <span className="text-5xl mb-4 block">💿</span>
          <p className="font-orbitron text-white/40">Коллекция пуста — купи игры в магазине!</p>
        </div>
      ) : (
        <>
          <p className="font-rajdhani text-white/50 mb-4">Игр в коллекции: <span className="neon-text-purple font-bold">{owned.length}</span> из {GAMES.length}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {owned.map(game => (
              <div key={game.id} className="cyber-card border p-5 neon-border-purple">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{game.emoji}</span>
                  <div>
                    <h3 className="font-orbitron text-sm font-bold" style={{ color: game.color }}>{game.title}</h3>
                    <p className="font-mono-tech text-xs text-white/40">{game.genre}</p>
                  </div>
                  <span className="ml-auto neon-text-green text-lg">✓</span>
                </div>
                {game.id === "minecraft" && hasTBS && (
                  <div className="mt-2 px-3 py-1 rounded border text-xs font-mono-tech" style={{ borderColor: "var(--neon-purple)", color: "var(--neon-purple)" }}>
                    📦 DLC: The Broken Script
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {notOwned.length > 0 && (
        <>
          <p className="font-orbitron text-xs text-white/30 mb-3">// НЕ КУПЛЕНО</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {notOwned.map(game => (
              <div key={game.id} className="cyber-card border p-4 opacity-40 flex items-center gap-3">
                <span className="text-2xl grayscale">{game.emoji}</span>
                <div>
                  <p className="font-orbitron text-xs text-white/50">{game.title}</p>
                  <p className="font-mono-tech text-xs text-white/30">{game.price} ИМ</p>
                </div>
                <span className="ml-auto text-white/20 text-lg">🔒</span>
              </div>
            ))}
          </div>
        </>
      )}

      {hasTBS && (
        <div className="mt-6 cyber-card border p-5 neon-border-purple">
          <p className="font-orbitron text-xs neon-text-purple mb-2">// СПЕЦИАЛЬНЫЕ ПРЕДМЕТЫ</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-float">👁️</span>
            <div>
              <p className="font-orbitron text-sm text-white font-bold">The Broken Script</p>
              <p className="font-rajdhani text-sm text-white/50">DLC для Minecraft · Получено по промокоду TBS</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── ЗАДАНИЯ ─────────────────────────
function QuestsPage({ user, setUser, timeOnSite, showToast }: {
  user: User | null;
  setUser: (u: User) => void;
  timeOnSite: number;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const raw = localStorage.getItem("gameshop_quests");
      return raw ? JSON.parse(raw) : INITIAL_QUESTS;
    } catch { return INITIAL_QUESTS; }
  });

  const getProgress = (q: Quest): number => {
    if (!user) return 0;
    switch (q.type) {
      case "time": return Math.min(q.target, timeOnSite);
      case "coins": return Math.min(q.target, user.coins);
      case "clicks": return Math.min(q.target, user.clickCount);
      default: return q.completed ? q.target : 0;
    }
  };

  const claimReward = (q: Quest) => {
    if (!user) return;
    const progress = getProgress(q);
    if (progress < q.target && !q.completed) return;

    const updated = { ...user, coins: user.coins + q.reward };
    setUser(updated);
    saveUser(updated);

    const newQ = quests.map(qu => qu.id === q.id ? { ...qu, completed: true } : qu);
    setQuests(newQ);
    localStorage.setItem("gameshop_quests", JSON.stringify(newQ));
    showToast(`+${q.reward} ИМ за задание «${q.title}»!`, "success");
  };

  if (!user) return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-24 gap-4">
      <span className="text-6xl animate-float">🔒</span>
      <p className="font-orbitron text-lg text-white/50">Войди в профиль чтобы выполнять задания</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <p className="font-mono-tech text-xs neon-text-cyan mb-1">// ВЫПОЛНЯЙ И ПОЛУЧАЙ</p>
      <h2 className="font-orbitron text-2xl font-bold text-white mb-6">ЗАДАНИЯ</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quests.map(q => {
          const progress = getProgress(q);
          const pct = Math.min(100, (progress / q.target) * 100);
          const ready = progress >= q.target;

          return (
            <div key={q.id} className={`cyber-card border p-5 flex flex-col gap-3 ${q.completed ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-orbitron text-sm font-bold text-white">{q.title}</p>
                  <p className="font-rajdhani text-sm text-white/50 mt-0.5">{q.description}</p>
                </div>
                <span className="font-orbitron text-sm neon-text-yellow whitespace-nowrap ml-3">+{q.reward} ИМ</span>
              </div>

              {(q.type === "time" || q.type === "coins" || q.type === "clicks") && (
                <div>
                  <div className="flex justify-between font-mono-tech text-xs text-white/40 mb-1">
                    <span>{progress} / {q.target}</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: ready ? "var(--neon-green)" : "var(--neon-purple)" }} />
                  </div>
                </div>
              )}

              {q.completed ? (
                <div className="cyber-btn text-center text-xs" style={{ borderColor: "var(--neon-green)", color: "var(--neon-green)", pointerEvents: "none" }}>
                  ✓ ВЫПОЛНЕНО
                </div>
              ) : (
                <button
                  className={`cyber-btn text-xs ${ready ? "cyber-btn-filled" : ""}`}
                  style={!ready ? { borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.3)", cursor: "not-allowed" } : {}}
                  onClick={() => ready && claimReward(q)}
                  disabled={!ready}
                >
                  {ready ? "ПОЛУЧИТЬ НАГРАДУ" : "В ПРОЦЕССЕ..."}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────── ПРОФИЛЬ ─────────────────────────
function ProfilePage({ user, setUser, unlockAchievement, showToast }: {
  user: User | null;
  setUser: (u: User | null) => void;
  unlockAchievement: (id: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [nick, setNick] = useState("");
  const [editNick, setEditNick] = useState(false);
  const [newNick, setNewNick] = useState(user?.nick || "");

  const handleRegister = () => {
    const n = nick.trim();
    if (n.length < 2) { showToast("Ник должен быть минимум 2 символа!", "error"); return; }
    if (n.length > 20) { showToast("Ник максимум 20 символов!", "error"); return; }

    const newUser: User = {
      nick: n.toUpperCase(),
      coins: 0,
      collection: [],
      achievements: [],
      clickCount: 0,
      joinDate: new Date().toISOString().split("T")[0],
    };
    saveUser(newUser);
    setUser(newUser);

    const players = loadPlayers();
    const exists = players.find(p => p.nick === newUser.nick);
    if (!exists) {
      players.unshift({ ...newUser });
      savePlayers(players);
    }
    showToast(`Добро пожаловать, ${newUser.nick}!`, "success");
  };

  const handleChangeNick = () => {
    if (!user) return;
    const n = newNick.trim();
    if (n.length < 2) { showToast("Ник минимум 2 символа!", "error"); return; }
    const updated = { ...user, nick: n.toUpperCase() };
    setUser(updated);
    saveUser(updated);
    setEditNick(false);
    showToast("Ник обновлён!", "success");
  };

  if (!user) return (
    <div className="animate-fade-in max-w-md mx-auto py-8">
      <p className="font-mono-tech text-xs neon-text-cyan mb-1">// НОВЫЙ ИГРОК</p>
      <h2 className="font-orbitron text-2xl font-bold text-white mb-6">РЕГИСТРАЦИЯ</h2>
      <div className="cyber-card border p-6 flex flex-col gap-4">
        <div>
          <label className="font-mono-tech text-xs text-white/40 block mb-2">ИМЯ ИГРОКА</label>
          <input
            value={nick}
            onChange={e => setNick(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleRegister()}
            placeholder="ВВЕДИ НИК..."
            maxLength={20}
            className="w-full bg-black/50 border border-white/10 px-4 py-3 font-mono-tech text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 rounded-sm"
          />
        </div>
        <button className="cyber-btn cyber-btn-filled py-3" onClick={handleRegister}>
          НАЧАТЬ ИГРУ
        </button>
      </div>
    </div>
  );

  const userAchievements = ACHIEVEMENTS.filter(a => user.achievements.includes(a.id));

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <p className="font-mono-tech text-xs neon-text-cyan mb-1">// ИГРОК</p>
      <h2 className="font-orbitron text-2xl font-bold text-white mb-6">ПРОФИЛЬ</h2>

      <div className="cyber-card border p-6 mb-4 neon-border-purple">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2"
            style={{ borderColor: "var(--neon-purple)", background: "rgba(168,85,247,0.1)" }}>
            👾
          </div>
          <div className="flex-1">
            {editNick ? (
              <div className="flex gap-2">
                <input value={newNick} onChange={e => setNewNick(e.target.value)} maxLength={20}
                  className="bg-black/50 border border-white/20 px-3 py-1 font-mono-tech text-sm text-white focus:outline-none focus:border-purple-500 rounded-sm flex-1" />
                <button className="cyber-btn text-xs py-1 px-3" onClick={handleChangeNick}>OK</button>
                <button className="cyber-btn cyber-btn-pink text-xs py-1 px-3" onClick={() => setEditNick(false)}>X</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron text-xl font-bold neon-text-purple">{user.nick}</h3>
                <button onClick={() => { setEditNick(true); setNewNick(user.nick); }}
                  className="text-white/30 hover:text-white/60 transition-colors">
                  <Icon name="Pencil" size={14} />
                </button>
              </div>
            )}
            <p className="font-mono-tech text-xs text-white/40">Игрок с {user.joinDate}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "МОНЕТЫ", value: `${user.coins} ИМ`, color: "var(--neon-yellow)" },
            { label: "ИГРЫ", value: `${user.collection.filter(id => !id.includes("-tbs")).length}/${GAMES.length}`, color: "var(--neon-cyan)" },
            { label: "КЛИКОВ", value: user.clickCount, color: "var(--neon-green)" },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-white/5 rounded">
              <p className="font-orbitron text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="font-mono-tech text-xs text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cyber-card border p-5 mb-4">
        <p className="font-orbitron text-xs neon-text-pink mb-3">// ДОСТИЖЕНИЯ ({userAchievements.length}/{ACHIEVEMENTS.length})</p>
        {userAchievements.length === 0 ? (
          <p className="font-rajdhani text-white/30 text-sm">Достижений пока нет — выполняй задания и вводи промокоды!</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {userAchievements.map(a => (
              <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded border bg-white/5"
                style={{ borderColor: a.color }}>
                <span>{a.icon}</span>
                <div>
                  <p className="font-orbitron text-xs font-bold" style={{ color: a.color }}>{a.name}</p>
                  <p className="font-mono-tech text-xs text-white/40">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {ACHIEVEMENTS.filter(a => !user.achievements.includes(a.id)).map(a => (
            <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded border border-white/10 bg-white/5 opacity-30">
              <span className="grayscale">{a.icon}</span>
              <p className="font-orbitron text-xs text-white/40">{a.name}</p>
              <span className="text-white/20">🔒</span>
            </div>
          ))}
        </div>
      </div>

      <button className="cyber-btn cyber-btn-pink w-full py-3" onClick={() => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        showToast("Выход выполнен", "info");
      }}>
        ВЫЙТИ ИЗ АККАУНТА
      </button>
    </div>
  );
}

// ───────────────────────── ИГРОКИ ─────────────────────────
function PlayersPage({ currentUser }: { currentUser: User | null }) {
  const [players] = useState<Player[]>(loadPlayers);
  const [selected, setSelected] = useState<Player | null>(null);

  const sorted = [...players].sort((a, b) => b.coins - a.coins);

  return (
    <div className="animate-fade-in">
      <p className="font-mono-tech text-xs neon-text-cyan mb-1">// РЕЙТИНГ</p>
      <h2 className="font-orbitron text-2xl font-bold text-white mb-6">ИГРОКИ</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          {sorted.map((p, i) => {
            const isMe = currentUser?.nick === p.nick;
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <button key={p.nick} onClick={() => setSelected(p === selected ? null : p)}
                className={`cyber-card border p-4 text-left flex items-center gap-3 transition-all ${isMe ? "neon-border-purple" : ""} ${selected?.nick === p.nick ? "neon-border-cyan" : ""}`}>
                <span className="font-orbitron text-lg w-8">{medals[i] || `${i + 1}`}</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ borderColor: isMe ? "var(--neon-purple)" : "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}>
                  👾
                </div>
                <div className="flex-1">
                  <p className="font-orbitron text-sm font-bold" style={{ color: isMe ? "var(--neon-purple)" : "white" }}>
                    {p.nick} {isMe && <span className="text-xs text-white/40">(ты)</span>}
                  </p>
                  <p className="font-mono-tech text-xs text-white/40">{p.collection.length} игр · {p.achievements.length} ачивок</p>
                </div>
                <span className="font-orbitron text-sm neon-text-yellow">{p.coins} ИМ</span>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="cyber-card border p-5 neon-border-cyan h-fit">
            <p className="font-mono-tech text-xs neon-text-cyan mb-3">// ПРОФИЛЬ ИГРОКА</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 text-2xl"
                style={{ borderColor: "var(--neon-cyan)", background: "rgba(0,245,255,0.1)" }}>👾</div>
              <div>
                <h3 className="font-orbitron text-lg font-bold neon-text-cyan">{selected.nick}</h3>
                <p className="font-mono-tech text-xs text-white/40">с {selected.joinDate}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: "МОНЕТЫ", value: `${selected.coins} ИМ`, color: "var(--neon-yellow)" },
                { label: "КЛИКОВ", value: selected.clickCount, color: "var(--neon-green)" },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-white/5 rounded">
                  <p className="font-orbitron text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="font-mono-tech text-xs text-white/30">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="font-orbitron text-xs text-white/40 mb-2">КОЛЛЕКЦИЯ</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {selected.collection.length === 0 ? <p className="font-rajdhani text-white/30 text-sm">Пусто</p> :
                GAMES.filter(g => selected.collection.includes(g.id)).map(g => (
                  <span key={g.id} className="text-lg" title={g.title}>{g.emoji}</span>
                ))}
            </div>
            <p className="font-orbitron text-xs text-white/40 mb-2">АЧИВКИ</p>
            <div className="flex flex-wrap gap-2">
              {selected.achievements.length === 0 ? <p className="font-rajdhani text-white/30 text-sm">Нет ачивок</p> :
                ACHIEVEMENTS.filter(a => selected.achievements.includes(a.id)).map(a => (
                  <span key={a.id} className="text-xl" title={a.name}>{a.icon}</span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── О САЙТЕ ─────────────────────────
function AboutPage() {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <p className="font-mono-tech text-xs neon-text-cyan mb-1">// ИНФОРМАЦИЯ</p>
      <h2 className="font-orbitron text-2xl font-bold text-white mb-6">О САЙТЕ</h2>

      <div className="cyber-card border p-6 mb-4 neon-border-purple">
        <div className="text-center mb-6">
          <h3 className="font-orbitron text-3xl font-black neon-text-purple mb-2">геймшоп.com</h3>
          <p className="font-rajdhani text-white/60 text-lg">Диски игр и другое</p>
        </div>
        <p className="font-rajdhani text-white/70 text-base leading-relaxed">
          Геймшоп — это место, где можно купить диски игр за Игровые Монеты, зарабатывать монеты в кликере,
          выполнять задания, коллекционировать игры и соревноваться с другими игроками.
        </p>
      </div>

      {[
        { title: "КАК ЗАРАБОТАТЬ ИМ?", color: "var(--neon-yellow)", items: ["Кликай в разделе Кликер (1 клик = 1 ИМ)", "Вводи промокоды (напр. RELEASE = 850 ИМ)", "Выполняй задания за бонусы"] },
        { title: "ПРОМОКОДЫ", color: "var(--neon-pink)", items: ["TBS — дополнение The Broken Script для Minecraft + ачивка «Here I Am»", "RELEASE — 850 Игровых Монет"] },
        { title: "АЧИВКИ", color: "var(--neon-purple)", items: ACHIEVEMENTS.map(a => `${a.icon} ${a.name} — ${a.description}`) },
      ].map(section => (
        <div key={section.title} className="cyber-card border p-5 mb-4">
          <p className="font-orbitron text-xs mb-3" style={{ color: section.color }}>// {section.title}</p>
          <ul className="space-y-2">
            {section.items.map(item => (
              <li key={item} className="flex items-start gap-2 font-rajdhani text-white/70">
                <span className="neon-text-purple mt-0.5">›</span> {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="cyber-card border p-5 text-center">
        <p className="font-mono-tech text-xs text-white/30">версия 1.0.0 · 2026</p>
        <p className="font-orbitron text-xs text-white/20 mt-1">ГЕЙМШОП.COM — ДИСКИ ИГР И ДРУГОЕ</p>
      </div>
    </div>
  );
}

// ───────────────────────── ГЛАВНЫЙ КОМПОНЕНТ ─────────────────────────
export default function Index() {
  const [page, setPage] = useState("home");
  const [user, setUserState] = useState<User | null>(loadUser);
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [timeOnSite, setTimeOnSite] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u) saveUser(u);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTimeOnSite(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (timeOnSite === 60 && user) {
      const questsRaw = localStorage.getItem("gameshop_quests");
      const quests: Quest[] = questsRaw ? JSON.parse(questsRaw) : INITIAL_QUESTS;
      const updated = quests.map(q => q.type === "time" && !q.completed ? { ...q, completed: true } : q);
      localStorage.setItem("gameshop_quests", JSON.stringify(updated));
    }
  }, [timeOnSite, user]);

  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    const u = loadUser();
    if (!u) return;
    if (u.achievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return;
    const updated = { ...u, achievements: [...u.achievements, id] };
    saveUser(updated);
    setUserState(updated);
    setPendingAchievement(achievement);
    playSound("achievement");
  }, []);

  const toastColors: Record<string, string> = {
    success: "var(--neon-green)", error: "var(--neon-pink)", info: "var(--neon-cyan)"
  };

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage user={user} onNav={setPage} />;
      case "news": return <NewsPage />;
      case "shop": return <ShopPage user={user} setUser={u => setUser(u)} unlockAchievement={unlockAchievement} showToast={showToast} />;
      case "clicker": return <ClickerPage user={user} setUser={u => setUser(u)} unlockAchievement={unlockAchievement} />;
      case "quests": return <QuestsPage user={user} setUser={u => setUser(u)} timeOnSite={timeOnSite} showToast={showToast} />;
      case "collection": return <CollectionPage user={user} />;
      case "players": return <PlayersPage currentUser={user} />;
      case "profile": return <ProfilePage user={user} setUser={u => setUser(u)} unlockAchievement={unlockAchievement} showToast={showToast} />;
      case "about": return <AboutPage />;
      default: return <HomePage user={user} onNav={setPage} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--dark-bg)" }}>
      <EmojiBg />
      {pendingAchievement && (
        <AchievementPopup achievement={pendingAchievement} onDone={() => setPendingAchievement(null)} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 cyber-card border px-6 py-3 font-rajdhani text-sm text-white animate-fade-in"
          style={{ borderColor: toastColors[toast.type] || "var(--neon-purple)" }}>
          {toast.msg}
        </div>
      )}

      <nav className="relative z-40 sticky top-0 border-b scanline" style={{ borderColor: "var(--dark-border)", background: "rgba(7,7,15,0.95)", backdropFilter: "blur(10px)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14">
            <button onClick={() => setPage("home")} className="font-orbitron text-sm font-black neon-text-purple mr-6 shrink-0">
              геймшоп<span className="text-white/40">.com</span>
            </button>

            <div className="hidden md:flex items-center gap-1 flex-1">
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => setPage(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-orbitron text-xs transition-all rounded-sm ${page === item.id ? "neon-text-purple bg-purple-500/10" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
                  <Icon name={item.icon} size={13} />
                  {item.label}
                </button>
              ))}
            </div>

            {user && (
              <div className="hidden md:flex items-center gap-1.5 ml-auto mr-2 px-3 py-1.5 border rounded-sm font-orbitron text-xs neon-text-yellow"
                style={{ borderColor: "rgba(255,238,0,0.3)", background: "rgba(255,238,0,0.05)" }}>
                🪙 {user.coins} ИМ
              </div>
            )}

            <button className="md:hidden ml-auto text-white/50 hover:text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              <Icon name={mobileMenu ? "X" : "Menu"} size={20} />
            </button>
          </div>

          {mobileMenu && (
            <div className="md:hidden border-t py-2" style={{ borderColor: "var(--dark-border)" }}>
              {user && (
                <div className="flex items-center gap-1.5 px-3 py-2 font-orbitron text-xs neon-text-yellow mb-1">
                  🪙 {user.coins} ИМ
                </div>
              )}
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => { setPage(item.id); setMobileMenu(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 font-orbitron text-xs transition-all ${page === item.id ? "neon-text-purple bg-purple-500/10" : "text-white/50 hover:text-white/80"}`}>
                  <Icon name={item.icon} size={14} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {renderPage()}
      </main>

      <footer className="relative z-10 border-t mt-16 py-6 text-center" style={{ borderColor: "var(--dark-border)" }}>
        <p className="font-orbitron text-xs text-white/20">геймшоп.com · ДИСКИ ИГР И ДРУГОЕ · 2026</p>
        <p className="font-mono-tech text-xs text-white/10 mt-1">// ИГРОВЫЕ МОНЕТЫ — ВАЛЮТА САЙТА</p>
      </footer>
    </div>
  );
}