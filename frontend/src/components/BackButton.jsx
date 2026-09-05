export default function BackButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="戻る"
      className={`absolute z-10 flex items-center justify-center rounded-full bg-white/90 shadow-md size-[48px] text-[#182642] text-[20px] font-bold ${className}`}
    >
      ‹
    </button>
  );
}
