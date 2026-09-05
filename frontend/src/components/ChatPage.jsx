import { useEffect, useRef, useState } from "react";
import BackButton from "./BackButton.jsx";
import commentIcon from "../assets/comment-icon.png";
import { API_BASE } from "../config.js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });
}

// スレッドは常に (askerId, courseId) の組で識別する。
// 自分が質問する側なら sendAs=askerId、投稿者として返信する側なら
// sendAs=courseId というトリックで、同じスレッドに双方向で書き込める。
export default function ChatPage({ askerId, courseId, courseName, role, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [image, setImage] = useState(null); // data URL のプレビュー/送信用
  const fileInputRef = useRef(null);

  const sendAs = role === "poster" ? courseId : askerId;
  const sendTo = role === "poster" ? askerId : courseId;

  const loadMessages = () => {
    if (!askerId || !courseId) return;
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/messages?user1=${encodeURIComponent(askerId)}&user2=${encodeURIComponent(courseId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        setMessages(await res.json());
      })
      .catch(() => setError("メッセージの読み込みに失敗しました"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askerId, courseId]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("画像は5MB以下にしてください");
      return;
    }
    try {
      setImage(await fileToDataUrl(file));
    } catch (err) {
      setError(err.message || "画像の読み込みに失敗しました");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !image) || !askerId || !courseId) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 送信者: sendAs, 受信者: sendTo, 本文: text.trim(), 画像: image }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "送信に失敗しました");
      setMessages((prev) => [...prev, data]);
      setText("");
      setImage(null);
    } catch (err) {
      setError(err.message || "送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  const hasThread = !!(askerId && courseId);

  return (
    <div className="bg-white relative w-full max-w-[402px] min-h-[max(560px,var(--rf-fill-height))] overflow-hidden shadow-xl flex flex-col pb-[64px]">
      <div className="h-[110px] w-full bg-gradient-to-r from-[#13b5a3] to-[#0d9488] shrink-0" />
      <BackButton onClick={onBack} className="left-[20px] top-[20px]" />
      <div className="absolute left-[76px] top-[20px] right-[20px]">
        <p className="font-black text-[20px] text-white leading-tight">チャット</p>
        {courseName && <p className="font-medium text-[14px] text-white/80 truncate">{courseName}</p>}
      </div>

      {!hasThread && (
        <div className="flex flex-col items-center gap-[18px] px-[40px] pt-[64px] pb-[20px] w-full">
          <img alt="" className="size-[88px]" src={commentIcon} />
          <p className="font-black text-[#8a93a6] text-[15px] text-center">まだメッセージはありません</p>
        </div>
      )}

      {hasThread && (
        <>
          <div className="flex flex-col gap-[15px] px-[20px] py-[20px] w-full">
            {loading && <p className="font-black text-[#8a93a6] text-[15px] text-center">読み込み中…</p>}
            {!loading && messages.length === 0 && !error && (
              <div className="flex flex-col items-center gap-[12px] py-[20px]">
                <img alt="" className="size-[64px]" src={commentIcon} />
                <p className="font-black text-[#8a93a6] text-[15px] text-center">まだメッセージはありません</p>
              </div>
            )}
            {!loading &&
              messages.map((m, i) =>
                m.送信者 === sendAs ? (
                  <div key={i} className="flex flex-col gap-[4px] items-end pl-[60px] w-full">
                    <div
                      className="flex flex-col gap-[6px] items-end px-[14px] py-[10px] rounded-tl-[13px] rounded-tr-[13px] rounded-bl-[13px] rounded-br-[5px] max-w-full"
                      style={{ backgroundImage: "linear-gradient(to right, #a0d8ee 0%, #269ecc 99.99%)" }}
                    >
                      {m.画像 && (
                        <img src={m.画像} alt="送信された画像" className="max-w-full max-h-[220px] rounded-[10px] object-contain" />
                      )}
                      {m.本文 && <p className="font-bold leading-[135%] text-[15px] text-white break-words">{m.本文}</p>}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex flex-col gap-[4px] items-start pr-[60px] w-full">
                    <div className="bg-[#eef0f4] flex flex-col gap-[6px] items-start px-[14px] py-[10px] rounded-tl-[13px] rounded-tr-[13px] rounded-br-[13px] rounded-bl-[5px] max-w-full">
                      {m.画像 && (
                        <img src={m.画像} alt="送信された画像" className="max-w-full max-h-[220px] rounded-[10px] object-contain" />
                      )}
                      {m.本文 && <p className="font-bold leading-[135%] text-[#182642] text-[15px] break-words">{m.本文}</p>}
                    </div>
                  </div>
                )
              )}
          </div>

          {error && <p className="font-bold text-[#ef4444] text-[15px] text-center px-[20px]">{error}</p>}

          {image && (
            <div className="flex items-center gap-[10px] px-[20px] pt-[10px] w-full mt-auto">
              <div className="relative">
                <img src={image} alt="送信する画像のプレビュー" className="h-[64px] w-[64px] object-cover rounded-[10px] border border-[#eef0f4]" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  aria-label="画像を取り消す"
                  className="absolute -top-[6px] -right-[6px] bg-[#182642] text-white size-[20px] rounded-full text-[12px] leading-none flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className={`flex gap-[10px] items-center px-[20px] py-[16px] w-full ${image ? "" : "mt-auto"}`}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="画像を添付"
              className="bg-[#f2f4f7] flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full text-[20px]"
            >
              📷
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="メッセージを入力"
              className="bg-[#f2f4f7] flex-1 h-[42px] rounded-[21px] px-[16px] text-[15px] outline-none"
            />
            <button
              type="submit"
              disabled={sending || (!text.trim() && !image)}
              className="bg-gradient-to-r from-[#13b5a3] to-[#0d9488] flex h-[48px] items-center justify-center rounded-[21px] w-[64px] shrink-0 font-black text-white text-[15px] disabled:opacity-50"
            >
              送信
            </button>
          </form>
        </>
      )}
    </div>
  );
}
