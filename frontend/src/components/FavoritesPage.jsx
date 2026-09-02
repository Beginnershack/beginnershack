import { useEffect, useState } from "react";
import BackButton from "./BackButton.jsx";
import ResultCard from "./ResultCard.jsx";
import commentIcon from "../assets/comment-icon.png";
import { getBookmarks } from "../lib/bookmarks.js";
import { API_BASE } from "../config.js";

export default function FavoritesPage({ onBack, onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ids = getBookmarks();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/courses`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((all) => setCourses(all.filter((c) => ids.includes(c.id))))
      .catch(() => setError("読み込みに失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white relative w-full max-w-[402px] min-h-[max(560px,var(--rf-fill-height))] overflow-hidden shadow-xl pb-[64px]">
      <div className="h-[110px] w-full bg-gradient-to-r from-[#13b5a3] to-[#0d9488]" />
      <BackButton onClick={onBack} className="left-[20px] top-[20px]" />
      <p className="absolute left-[70px] top-[27px] font-black text-[20px] text-white">お気に入り</p>

      {loading && (
        <div className="flex items-center justify-center px-[40px] pt-[64px] pb-[20px] w-full">
          <p className="font-black text-[#8a93a6] text-[15px]">読み込み中…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-[18px] px-[40px] pt-[64px] pb-[20px] w-full">
          <img alt="" className="size-[88px]" src={commentIcon} />
          <p className="font-black text-[#ef4444] text-[15px] text-center">{error}</p>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="flex flex-col items-center gap-[18px] px-[40px] pt-[64px] pb-[20px] w-full">
          <img alt="" className="size-[88px]" src={commentIcon} />
          <p className="font-black text-[#8a93a6] text-[15px] text-center">
            まだお気に入りに追加した授業がありません
          </p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="flex flex-col gap-[16px] items-center px-[19px] py-[24px] w-full">
          {courses.map((course) => (
            <ResultCard key={course.id} course={course} onClick={() => onSelectCourse?.(course.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
