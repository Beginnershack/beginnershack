import { useEffect, useState } from "react";
import BackButton from "./BackButton.jsx";
import commentIcon from "../assets/comment-icon.png";
import { getMyId } from "../lib/identity.js";
import { API_BASE } from "../config.js";

const AVATAR_COLORS = ["#14b8a6", "#f97316", "#3b82f6", "#a855f7", "#ef4444", "#0d9488"];

function avatarColorFor(id) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function Row({ id, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex gap-[14px] items-center px-[24px] py-[14px] w-full text-left hover:bg-[#f7f9fb] border-b border-[#f0f2f5]"
    >
      <div className="flex items-center justify-center rounded-full shrink-0 size-[50px]" style={{ backgroundColor: avatarColorFor(id) }}>
        <p className="font-bold text-[18px] text-white">匿</p>
      </div>
      <div className="flex flex-col gap-[4px] min-w-0 flex-1">
        <p className="font-black text-[#182642] text-[16px] truncate">{title}</p>
        <p className="font-medium text-[#8a93a6] text-[15px] truncate">{subtitle}</p>
      </div>
    </button>
  );
}

export default function MessageListPage({ onBack, onSelectConversation }) {
  const myId = getMyId();
  const [tab, setTab] = useState("inbox");
  const [inbox, setInbox] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch(`${API_BASE}/api/messages/inbox?myId=${encodeURIComponent(myId)}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_BASE}/api/courses`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([inboxData, coursesData]) => {
        setInbox(inboxData);
        setCourses(coursesData);
        setTab(inboxData.length > 0 ? "inbox" : "courses");
      })
      .catch(() => setError("読み込みに失敗しました"))
      .finally(() => setLoading(false));
  }, [myId]);

  const items = tab === "inbox" ? inbox : courses;

  return (
    <div className="bg-white relative w-full max-w-[402px] min-h-[var(--rf-fill-height)] overflow-hidden">
      <div className="h-[110px] w-full bg-gradient-to-r from-[#13b5a3] to-[#0d9488]" />
      <BackButton onClick={onBack} className="left-[20px] top-[20px]" />
      <p className="absolute left-[76px] top-[27px] font-black text-[20px] text-white">メッセージ</p>

      <div className="flex gap-[8px] px-[20px] pt-[16px] pb-[8px] w-full">
        <button
          type="button"
          onClick={() => setTab("inbox")}
          className={`flex-1 h-[36px] rounded-[18px] font-black text-[15px] ${
            tab === "inbox" ? "bg-[#13b5a3] text-white" : "bg-[#f2f4f7] text-[#8a93a6]"
          }`}
        >
          自分宛 {inbox.length > 0 ? `(${inbox.length})` : ""}
        </button>
        <button
          type="button"
          onClick={() => setTab("courses")}
          className={`flex-1 h-[36px] rounded-[18px] font-black text-[15px] ${
            tab === "courses" ? "bg-[#13b5a3] text-white" : "bg-[#f2f4f7] text-[#8a93a6]"
          }`}
        >
          質問する
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center pt-[60px] w-full">
          <p className="font-black text-[#8a93a6] text-[15px]">読み込み中…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-[12px] pt-[60px] w-full">
          <img alt="" className="size-[64px]" src={commentIcon} />
          <p className="font-black text-[#ef4444] text-[15px]">{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center gap-[12px] pt-[60px] w-full">
          <img alt="" className="size-[64px]" src={commentIcon} />
          <p className="font-black text-[#8a93a6] text-[15px]">
            {tab === "inbox" ? "まだ届いたメッセージはありません" : "まだ口コミがありません"}
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col w-full">
          {tab === "inbox"
            ? inbox.map((thread) => (
                <Row
                  key={`${thread.courseId}-${thread.otherUserId}`}
                  id={thread.otherUserId}
                  title={thread.courseName}
                  subtitle={thread.lastMessage}
                  onClick={() =>
                    onSelectConversation?.({
                      askerId: thread.otherUserId,
                      courseId: thread.courseId,
                      courseName: thread.courseName,
                      role: "poster",
                    })
                  }
                />
              ))
            : courses.map((course) => (
                <Row
                  key={course.id}
                  id={course.id}
                  title={`${course.投稿者 || "匿名"}さん`}
                  subtitle={course.授業名}
                  onClick={() =>
                    onSelectConversation?.({
                      askerId: myId,
                      courseId: course.id,
                      courseName: course.授業名,
                      role: "asker",
                    })
                  }
                />
              ))}
        </div>
      )}
    </div>
  );
}
