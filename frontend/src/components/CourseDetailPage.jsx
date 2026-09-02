import { useEffect, useState } from "react";
import BackButton from "./BackButton.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import { getMyId } from "../lib/identity.js";
import { API_BASE } from "../config.js";
import commentIcon from "../assets/comment-icon.png";
import teacherIcon from "../assets/teacher-icon.png";
import deptIcon from "../assets/dept-icon.png";
import semesterIcon from "../assets/semester-icon.png";
import evalIcon from "../assets/eval-icon.png";
import syllabusIcon from "../assets/syllabus-icon.png";
import ratingStarFilled from "../assets/rating-star-filled.png";
import ratingStarOutline from "../assets/rating-star-outline.png";

function InfoRow({ icon, label, bg, children }) {
  return (
    <div className={`${bg} flex flex-col gap-[10px] items-start rounded-[13px] px-[26px] py-[24px] w-full`}>
      <div className="flex gap-[16px] items-center">
        <img alt="" className="size-[23px]" src={icon} />
        <p className="font-black leading-[100.07%] text-[#289a8a] text-[15px] whitespace-nowrap">{label}</p>
      </div>
      <div className="flex items-center pl-[40px] w-full">{children}</div>
    </div>
  );
}

export default function CourseDetailPage({ courseId, onBack, onMessage }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/courses/${courseId}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "授業が見つかりません");
        setCourse(data);
      })
      .catch((e) => setError(e.message || "読み込みに失敗しました"))
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="bg-white relative w-full max-w-[402px] min-h-[max(560px,var(--rf-fill-height))] overflow-hidden shadow-xl pb-[64px]">
      <div className="h-[110px] w-full bg-gradient-to-r from-[#13b5a3] to-[#0d9488]" />
      <BackButton onClick={onBack} className="left-[20px] top-[20px]" />
      <p className="absolute left-[70px] top-[27px] font-black text-[20px] text-white">授業評価</p>
      {courseId && (
        <div className="absolute right-[24px] top-[27px]">
          <BookmarkButton courseId={courseId} size={24} inactiveColor="#ffffff" activeColor="#ffffff" />
        </div>
      )}

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

      {!loading && !error && !course && (
        <div className="flex flex-col items-center gap-[18px] px-[40px] pt-[64px] pb-[20px] w-full">
          <img alt="" className="size-[88px]" src={commentIcon} />
          <p className="font-black text-[#8a93a6] text-[15px] text-center">まだ口コミが投稿されていません</p>
        </div>
      )}

      {!loading && !error && course && (
        <>
          <div className="flex flex-col font-black gap-[6px] items-start leading-[100.07%] pl-[26px] pt-[24px] w-full">
            <p className="text-[#182642] text-[26px]">{course.授業名}</p>
            <p className="text-[#8a93a6] text-[15px]">{course.投稿者 || "匿名"}さんの授業評価</p>
          </div>

          <div className="flex flex-col gap-[14px] items-center px-[24px] pt-[24px] w-full">
            <InfoRow icon={teacherIcon} label="担当教員" bg="bg-[#f2faf8]">
              <p className="font-black text-[#182642] text-[16px] whitespace-nowrap">{course.担当教員}</p>
            </InfoRow>
            <InfoRow icon={deptIcon} label="学部学科" bg="bg-white">
              <p className="font-black text-[#182642] text-[16px]">{course.学部学科}</p>
            </InfoRow>
            <InfoRow icon={semesterIcon} label="開講学期/曜日・時限" bg="bg-[#f2faf8]">
              <p className="font-black text-[#182642] text-[16px]">
                {course.開講学期}　・　{course.曜日}曜{course.時限}限
              </p>
            </InfoRow>
            <InfoRow icon={evalIcon} label="評価方法/出席確認" bg="bg-white">
              <div className="flex gap-[20px] items-center flex-wrap">
                <div className="bg-[#e9f0fd] flex h-[25px] items-center justify-center px-[8px] py-[6px] rounded-[24px]">
                  <p className="font-black text-[#3e6cc9] text-[14px] whitespace-nowrap">{course.評価方法}</p>
                </div>
                <div className="bg-[#e6f7f4] flex h-[25px] items-center justify-center px-[26px] py-[6px] rounded-[38px]">
                  <p className="font-black text-[#0d9488] text-[14px] whitespace-nowrap">
                    {course.出席確認 ? "出席あり" : "出席なし"}
                  </p>
                </div>
              </div>
            </InfoRow>
            {course.シラバスURL && (
              <InfoRow icon={syllabusIcon} label="シラバスURL" bg="bg-[#f2faf8]">
                <a
                  href={course.シラバスURL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex font-black gap-[3px] items-center text-[#3b82f6] text-[15px]"
                >
                  <span>シラバスを見る</span>
                  <span>↗</span>
                </a>
              </InfoRow>
            )}
            {course.コメント && (
              <InfoRow icon={commentIcon} label="コメント" bg="bg-white">
                <p className="font-black text-[#182642] text-[16px]">{course.コメント}</p>
              </InfoRow>
            )}
          </div>

          <div className="flex flex-col gap-[19px] items-center pt-[32px] pb-[40px] w-full">
            <div className="bg-[#fff4e0] border border-[#ffd892] border-solid flex h-[40px] items-center justify-center gap-[20px] px-[19px] rounded-[41px] w-[201px]">
              <p className="font-black text-[#b45309] text-[16px]">楽単</p>
              <div className="flex gap-[5px] items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img key={i} alt="星" className="h-[15px] w-[16px]" src={i <= course.楽単度 ? ratingStarFilled : ratingStarOutline} />
                ))}
              </div>
            </div>
            {onMessage && (
              <button
                type="button"
                onClick={() =>
                  onMessage({ askerId: getMyId(), courseId: course.id, courseName: course.授業名, role: "asker" })
                }
                className="bg-gradient-to-r from-[#13b5a3] to-[#0d9488] flex h-[46px] items-center justify-center rounded-[50px] w-[220px]"
              >
                <p className="font-black text-white text-[15px]">メッセージを送る</p>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
