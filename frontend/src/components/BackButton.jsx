export default function BackButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="戻る"
      className={`absolute z-10 flex items-center justify-center rounded-full bg-white/90 shadow-md size-[36px] text-[#182642] text-[18px] font-bold ${className}`}
    >
      ‹
    </button>
  );
}
