import { useState } from "react";
import BackButton from "./BackButton.jsx";
import { getMyId } from "../lib/identity.js";
import { FACULTIES, DEPARTMENTS } from "../lib/facultyOptions.js";
import { API_BASE } from "../config.js";
import postHeroBg from "../assets/post-hero-bg.webp";
import postLogo from "../assets/post-logo.png";
import starFilled from "../assets/star-filled.png";
import starOutline from "../assets/star-outline.png";
import postSubmitButton from "../assets/post-submit-button.webp";
import chevronIcon from "../assets/chevron-icon.png";

function FieldLabel({ children, required = true }) {
  return (
    <div className="flex font-black items-center leading-[100.07%]">
      <p className="h-[22px] text-[#4b5768] text-[15px]">{children}</p>
      {required ? (
        <p className="h-[16px] text-[#f97316] text-[12px] w-[28px] ml-1">必須</p>
      ) : (
        <p className="h-[16px] text-[#8a93a6] text-[12px] whitespace-nowrap ml-1">（任意）</p>
      )}
    </div>
  );
}

function TextField({ label, placeholder, value, onChange }) {
  return (
    <div className="flex flex-col gap-[10px] items-start w-[272px]">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-white border-[#d7d7d7] border-[0.5px] border-solid drop-shadow-[1px_1px_2px_rgba(0,0,0,0.25)] flex h-[53px] items-center pl-[18px] rounded-[11px] shrink-0 w-full font-bold text-[#182642] placeholder:text-[#8a93a6] text-[16px] outline-none"
      />
    </div>
  );
}

function SelectField({ label, placeholder, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-[10px] items-start w-[272px]">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative w-full">
        <select
          value={value}
          onChange={onChange}
          className={`bg-white border-[#d7d7d7] border-[0.5px] border-solid drop-shadow-[1px_1px_2px_rgba(0,0,0,0.25)] h-[53px] pl-[18px] pr-[36px] rounded-[11px] shrink-0 w-full font-bold text-[16px] outline-none appearance-none ${
            value ? "text-[#182642]" : "text-[#8a93a6]"
          }`}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-[#182642]">
              {opt}
            </option>
          ))}
        </select>
        <img
          alt=""
          className="absolute h-[11px] right-[18px] top-1/2 -translate-y-1/2 w-[12px] pointer-events-none"
          src={chevronIcon}
        />
      </div>
    </div>
  );
}

function PillOption({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`content-stretch flex items-center justify-center px-[21px] py-[13px] rounded-[45px] shrink-0 font-black text-[15px] whitespace-nowrap ${
        selected ? "bg-[#13b5a3] text-white" : "bg-white border-[1.5px] border-[rgba(217,217,217,0.73)] border-solid text-[#8a93a6]"
      }`}
    >
      {label}
    </button>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-[12px] items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="h-[30px] w-[32px] p-0 border-0 bg-transparent appearance-none cursor-pointer flex items-center justify-center"
        >
          <img alt={`星${star}`} className="h-[30px] w-auto" src={star <= value ? starFilled : starOutline} />
        </button>
      ))}
    </div>
  );
}

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];
const PERIODS = ["１", "２", "３", "４", "５", "６", "７"];
const SEMESTERS = ["前期", "後期", "通年"];
const EVAL_METHODS = ["なし", "試験", "レポート", "試験とレポート"];

export default function PostReviewPage({ onBack }) {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [teacher, setTeacher] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [weekday, setWeekday] = useState(WEEKDAYS[0]);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [evalMethod, setEvalMethod] = useState(EVAL_METHODS[0]);
  const [attendance, setAttendance] = useState("あり");
  const [rakutanRating, setRakutanRating] = useState(0);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    const payload = {
      授業名: courseName,
      担当教員: teacher,
      開講学期: semester,
      授業コード: courseCode,
      学部学科: [faculty, department].filter(Boolean).join("　"),
      曜日: weekday,
      時限: PERIODS.indexOf(period) + 1,
      評価方法: evalMethod,
      出席確認: attendance === "あり",
      楽単度: rakutanRating,
      コメント: comment,
      投稿者ID: getMyId(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "投稿に失敗しました");
        return;
      }
      setSuccess(true);
      setCourseName("");
      setCourseCode("");
      setTeacher("");
      setFaculty("");
      setDepartment("");
      setSemester(SEMESTERS[0]);
      setWeekday(WEEKDAYS[0]);
      setPeriod(PERIODS[0]);
      setEvalMethod(EVAL_METHODS[0]);
      setAttendance("あり");
      setRakutanRating(0);
      setComment("");
    } catch {
      setError("通信に失敗しました。しばらくしてからもう一度お試しください");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white relative w-full max-w-[402px] min-h-[max(1560px,var(--rf-fill-height))] overflow-hidden">
      <BackButton onClick={onBack} className="left-[14px] top-[16px]" />

      <div className="absolute h-[540px] left-0 top-0 w-full overflow-hidden">
        <img alt="" className="absolute h-[125.74%] left-0 max-w-none top-0 w-full" src={postHeroBg} />
      </div>

      <div className="relative flex flex-col gap-[10px] items-start px-[45px] pt-[29px] pb-[93px] w-full">
        <div className="flex flex-col gap-[138px] items-center w-[312px]">
          <div className="flex flex-col items-start p-[10px] w-[278px]">
            <div className="aspect-[2028/432] relative w-full">
              <img alt="愛工大の裏キャンパス" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={postLogo} />
            </div>
          </div>
          <div className="flex flex-col font-bold gap-[10px] items-start leading-[100.07%] w-full">
            <p className="h-[28px] text-[#182642] text-[24px] w-full">口コミを投稿する</p>
            <p className="h-[15px] text-[#8a93a6] text-[15px] w-full">わかる範囲でOK!みんなの役に立ちます</p>
          </div>
        </div>

        <form className="flex flex-col gap-[17px] items-start w-full mt-[20px]" onSubmit={handleSubmit}>
          <TextField label="授業名" placeholder="電気回路Ⅰ" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
          <TextField label="授業コード" placeholder="v1007000" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
          <TextField label="担当教員" placeholder="山田太郎" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
          <SelectField label="学部" placeholder="選択してください" value={faculty} onChange={(e) => setFaculty(e.target.value)} options={FACULTIES} />
          <SelectField label="学科" placeholder="選択してください" value={department} onChange={(e) => setDepartment(e.target.value)} options={DEPARTMENTS} />

          <div className="flex flex-col gap-[10px] items-start w-[240px]">
            <FieldLabel>開講学期</FieldLabel>
            <div className="flex gap-[12px]">
              {SEMESTERS.map((s) => (
                <PillOption key={s} label={s} selected={semester === s} onClick={() => setSemester(s)} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[7px] items-start w-full">
            <FieldLabel>曜日</FieldLabel>
            <div className="flex flex-wrap gap-[23px] w-full">
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setWeekday(day)}
                  className={`flex items-center justify-center size-[42px] rounded-[73px] border-[1.5px] border-[rgba(217,217,217,0.73)] border-solid font-black text-[15px] ${
                    weekday === day ? "bg-[#13b5a3] text-white" : "bg-white text-[#8a93a6]"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[7px] items-start w-full">
            <FieldLabel>時限</FieldLabel>
            <div className="flex flex-wrap gap-[23px] w-full">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`flex items-center justify-center size-[42px] rounded-[73px] border-[1.5px] border-[rgba(217,217,217,0.73)] border-solid font-black text-[15px] ${
                    period === p ? "bg-[#13b5a3] text-white" : "bg-white text-[#8a93a6]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[12px] items-start w-[264px]">
            <FieldLabel>評価方法</FieldLabel>
            <div className="grid grid-cols-3 gap-[11px] w-full">
              <PillOption label="なし" selected={evalMethod === "なし"} onClick={() => setEvalMethod("なし")} />
              <PillOption label="試験" selected={evalMethod === "試験"} onClick={() => setEvalMethod("試験")} />
              <PillOption label="レポート" selected={evalMethod === "レポート"} onClick={() => setEvalMethod("レポート")} />
              <div className="col-span-2">
                <PillOption
                  label="試験とレポート"
                  selected={evalMethod === "試験とレポート"}
                  onClick={() => setEvalMethod("試験とレポート")}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[13px] items-start w-full">
            <FieldLabel>出席確認</FieldLabel>
            <div className="flex gap-[16px] items-center relative">
              <button
                type="button"
                onClick={() => setAttendance("あり")}
                className={`h-[46px] rounded-[10px] w-[128px] font-black text-[15px] ${
                  attendance === "あり"
                    ? "bg-gradient-to-l from-[#ff842d] to-[#ac602b] text-[#fffdfd]"
                    : "bg-white border-[1.5px] border-[rgba(217,217,217,0.73)] border-solid text-black"
                }`}
              >
                あり
              </button>
              <button
                type="button"
                onClick={() => setAttendance("なし")}
                className={`h-[46px] rounded-[10px] w-[128px] font-black text-[15px] ${
                  attendance === "なし"
                    ? "bg-gradient-to-l from-[#ff842d] to-[#ac602b] text-[#fffdfd]"
                    : "bg-white border-[1.5px] border-[rgba(217,217,217,0.73)] border-solid text-black"
                }`}
              >
                なし
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-[6px] items-start w-full">
            <FieldLabel>楽単度</FieldLabel>
            <StarRating value={rakutanRating} onChange={setRakutanRating} />
          </div>

          <div className="flex flex-col gap-[9px] items-start w-full">
            <FieldLabel required={false}>コメント</FieldLabel>
            <textarea
              placeholder="そんなに厳しくないです。"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-[#fff3f3] h-[72px] rounded-[6px] w-[279px] p-[10px] font-black text-[#182642] placeholder:text-[#8a93a6] text-[13px] outline-none resize-none"
            />
          </div>

          {error && (
            <p className="font-bold text-[#ef4444] text-[15px] w-full">{error}</p>
          )}
          {success && (
            <p className="font-bold text-[#13b5a3] text-[15px] w-full">投稿しました！ありがとうございます。</p>
          )}

          <button type="submit" disabled={submitting} className="flex flex-col items-start p-[10px] w-[292px] disabled:opacity-50">
            <div className="aspect-[708/144] border border-[#24b39b] border-solid relative rounded-[50px] shadow-[1px_1px_4px_0px_rgba(0,0,0,0.25)] w-full overflow-hidden">
              {submitting ? (
                <div className="absolute inset-0 flex items-center justify-center font-black text-[#24b39b] text-[15px]">送信中…</div>
              ) : (
                <img alt="投稿する" className="absolute h-[2738.33%] left-[-6.92%] max-w-none top-[-2537.57%] w-[113.84%]" src={postSubmitButton} />
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
