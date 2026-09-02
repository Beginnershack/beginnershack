import { useState } from "react";
import BackButton from "./BackButton.jsx";
import ResultCard from "./ResultCard.jsx";
import searchBg from "../assets/search-bg.webp";
import searchLogo from "../assets/search-logo.png";
import chevronIcon from "../assets/chevron-icon.png";
import searchButton from "../assets/search-button.png";
import searchFooterLogo from "../assets/search-footer-logo.png";
import { FACULTIES, DEPARTMENTS } from "../lib/facultyOptions.js";
import { API_BASE } from "../config.js";

const FILTER_FIELDS = ["学部", "学科", "開講学期", "曜日", "時限"];

const FILTER_OPTIONS = {
  学部: FACULTIES,
  学科: DEPARTMENTS,
  開講学期: ["前期", "後期", "通年"],
  曜日: ["月", "火", "水", "木", "金", "土", "日"],
  時限: ["1限", "2限", "3限", "4限", "5限", "6限", "7限"],
};

export default function SearchPage({ onBack, onSelectCourse }) {
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherQuery, setTeacherQuery] = useState("");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setHasSearched(true);

    const params = new URLSearchParams();
    if (searchQuery) params.set("keyword", searchQuery);
    else if (teacherQuery) params.set("keyword", teacherQuery);
    if (filters.学部 && filters.学科) params.set("faculty", `${filters.学部}　${filters.学科}`);
    if (filters.曜日) params.set("day", filters.曜日);
    if (filters.時限) params.set("period", filters.時限.replace("限", ""));

    try {
      const res = await fetch(`${API_BASE}/api/courses?${params.toString()}`);
      if (!res.ok) throw new Error();
      let data = await res.json();
      if (searchQuery && teacherQuery) {
        data = data.filter((c) => (c.担当教員 || "").includes(teacherQuery));
      }
      setResults(data);
    } catch {
      setError("検索に失敗しました。しばらくしてからもう一度お試しください");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#ecf0f5] relative w-full max-w-[402px] overflow-hidden min-h-[var(--rf-fill-height)]">
      <BackButton onClick={onBack} className="left-[14px] top-[16px]" />

      {/* ヒーロー: 背景 + ロゴ + 検索フォーム */}
      <div className="relative h-[680px] w-full overflow-hidden">
        <div className="absolute h-[874px] left-[-8px] overflow-hidden top-0 w-[419px]">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={searchBg} />
        </div>

        <div className="absolute h-[69px] left-[64px] top-[46px] w-[322px]">
          <img alt="愛工大の裏キャンパス" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={searchLogo} />
        </div>

        <div className="absolute flex flex-col gap-[4px] items-center left-[-19px] px-[66px] pt-[220px] pb-[30px] top-0 w-[440px]">
          <div className="flex flex-col gap-[4px] items-center w-[306px]">
            <div className="flex flex-col font-medium gap-[9px] items-center leading-[100.07%] w-[297px]">
              <p className="h-[29px] min-w-full text-[#2a3451] text-[24px]">～あなたの理想の履修を～</p>
              <p className="text-[14px] text-black text-center w-[273px]">
                全学部のシラバス、試験日程、先生の評判まで、すべてこの場所で。
              </p>
            </div>
            <div className="flex flex-col gap-[38px] items-center w-full">
              <div className="bg-[#cce7f3] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)] h-[160px] relative rounded-[14px] w-full">
                <div className="absolute h-[28px] left-[15px] rounded-[6px] top-[10px] w-[276px] overflow-hidden bg-white">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="講義名で検索"
                    className="h-full w-full bg-transparent pl-[10px] pr-[10px] text-[13px] text-black placeholder:text-[#8a93a6] outline-none"
                  />
                </div>
                <div className="absolute h-[28px] left-[15px] rounded-[6px] top-[44px] w-[276px] overflow-hidden bg-white">
                  <input
                    type="text"
                    value={teacherQuery}
                    onChange={(e) => setTeacherQuery(e.target.value)}
                    placeholder="先生の名前で検索"
                    className="h-full w-full bg-transparent pl-[10px] pr-[10px] text-[13px] text-black placeholder:text-[#8a93a6] outline-none"
                  />
                </div>
                <div className="absolute gap-x-[12px] gap-y-[4px] grid grid-cols-3 grid-rows-2 h-[68px] left-[15px] top-[82px] w-[276px]">
                  {FILTER_FIELDS.map((label, i) => (
                    <div key={label} className={`${i === 0 ? "bg-[#fefefe]" : "bg-white"} relative rounded-[4px]`}>
                      <select
                        value={filters[label] || ""}
                        onChange={(e) => setFilters((f) => ({ ...f, [label]: e.target.value }))}
                        className="absolute inset-0 h-full w-full appearance-none rounded-[4px] bg-transparent pl-[5px] pr-[18px] font-normal text-[12px] text-black outline-none"
                      >
                        <option value="">{label}</option>
                        {FILTER_OPTIONS[label].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <img alt="" className="absolute h-[11px] left-[65px] top-[12px] w-[12px] pointer-events-none" src={chevronIcon} />
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" onClick={handleSearch} className="flex flex-col items-start p-[10px] w-[234px]">
                <div className="aspect-[4096/823] relative rounded-[20px] shadow-[0px_3px_4px_0px_rgba(0,0,0,0.25)] w-full">
                  <img alt="履修情報を検索する" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={searchButton} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 検索結果カード一覧 */}
      <div className="flex flex-col gap-[16px] items-center px-[19px] py-[24px] w-full">
        {loading && <p className="font-medium text-[#8a93a6] text-[15px]">検索中…</p>}
        {!loading && error && <p className="font-medium text-[#ef4444] text-[15px]">{error}</p>}
        {!loading && !error && hasSearched && results.length === 0 && (
          <p className="font-medium text-[#8a93a6] text-[15px]">条件に合う授業評価はまだありません</p>
        )}
        {!loading && !error && !hasSearched && (
          <p className="font-medium text-[#8a93a6] text-[15px]">条件を入力して検索してください</p>
        )}
        {!loading &&
          !error &&
          results.map((course) => (
            <ResultCard key={course.id} course={course} onClick={() => onSelectCourse?.(course.id)} />
          ))}
      </div>

      {/* フッター */}
      <div className="w-full flex flex-col items-center bg-[#1a2b3a] pt-[20px] pb-[44px]">
        <img alt="愛工大の裏キャンパス" className="h-[34px] w-auto" src={searchFooterLogo} />
      </div>
    </div>
  );
}
