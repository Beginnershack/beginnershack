import { useState } from "react";
import { isBookmarked, toggleBookmark } from "../lib/bookmarks.js";

export default function BookmarkButton({ courseId, className = "", size = 20, inactiveColor = "#9aa3b2", activeColor = "#13b5a3" }) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(courseId));

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={bookmarked ? "お気に入りから外す" : "お気に入りに追加"}
      onClick={(e) => {
        e.stopPropagation();
        setBookmarked(toggleBookmark(courseId));
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          setBookmarked(toggleBookmark(courseId));
        }
      }}
      className={`inline-flex items-center justify-center cursor-pointer shrink-0 ${className}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={bookmarked ? activeColor : "none"}>
        <path
          d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"
          stroke={bookmarked ? activeColor : inactiveColor}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
