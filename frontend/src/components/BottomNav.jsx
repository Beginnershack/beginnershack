const ICONS = {
  top: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11.5L12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3.5v-5.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V20H17a1 1 0 0 0 1-1v-9"
        stroke={active ? "#0d9488" : "#9aa3b2"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  search: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="10.5" cy="10.5" r="6.5" stroke={active ? "#0d9488" : "#9aa3b2"} strokeWidth="2" />
      <path d="M19 19l-4-4" stroke={active ? "#0d9488" : "#9aa3b2"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  chat: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5v-9Z"
        stroke={active ? "#0d9488" : "#9aa3b2"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  favorites: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#0d9488" : "none"}>
      <path
        d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"
        stroke={active ? "#0d9488" : "#9aa3b2"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function NavItem({ id, label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center justify-center gap-[2px] flex-1 py-[6px]">
      {ICONS[id](active)}
      <span className={`text-[12px] font-bold whitespace-nowrap ${active ? "text-[#0d9488]" : "text-[#9aa3b2]"}`}>{label}</span>
    </button>
  );
}

export default function BottomNav({ current, onGoTop, onGoSearch, onGoChat, onGoFavorites }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full sm:max-w-[402px] z-50">
      <div className="flex items-center bg-white border-t border-[#eceff3] shadow-[0px_-2px_10px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
        <NavItem id="top" label="ホーム" active={current === "top"} onClick={onGoTop} />
        <NavItem id="search" label="検索" active={current === "search"} onClick={onGoSearch} />
        <NavItem id="favorites" label="お気に入り" active={current === "favorites"} onClick={onGoFavorites} />
        <NavItem id="chat" label="チャット" active={current === "chat" || current === "messages"} onClick={onGoChat} />
      </div>
    </div>
  );
}
