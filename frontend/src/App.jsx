import { useState } from "react";
import ResponsiveFrame from "./components/ResponsiveFrame.jsx";
import TopPage from "./components/TopPage.jsx";
import SearchPage from "./components/SearchPage.jsx";
import PostReviewPage from "./components/PostReviewPage.jsx";
import CourseDetailPage from "./components/CourseDetailPage.jsx";
import MessageListPage from "./components/MessageListPage.jsx";
import ChatPage from "./components/ChatPage.jsx";
import FavoritesPage from "./components/FavoritesPage.jsx";
import BottomNav from "./components/BottomNav.jsx";

function loadLastChatContext() {
  try {
    const raw = localStorage.getItem("lastChatContext");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function App() {
  const [page, setPage] = useState("top");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [detailBackTo, setDetailBackTo] = useState("search");
  const [chatContext, setChatContext] = useState(loadLastChatContext);

  const goTop = () => setPage("top");
  const goSearch = () => setPage("search");
  const goChat = () => setPage("messages");
  const goFavorites = () => setPage("favorites");

  const openDetail = (id, from) => {
    setSelectedCourseId(id);
    setDetailBackTo(from);
    setPage("detail");
  };

  const openChat = (context) => {
    setChatContext(context);
    localStorage.setItem("lastChatContext", JSON.stringify(context));
    setPage("chat");
  };

  return (
    <div className="min-h-[100dvh] bg-[#f2f2f2] flex items-start justify-center">
      <ResponsiveFrame>
        {page === "top" && <TopPage onSearch={goSearch} onPostReview={() => setPage("post")} />}
        {page === "search" && <SearchPage onBack={goTop} onSelectCourse={(id) => openDetail(id, "search")} />}
        {page === "post" && <PostReviewPage onBack={goTop} />}
        {page === "detail" && (
          <CourseDetailPage courseId={selectedCourseId} onBack={() => setPage(detailBackTo)} onMessage={openChat} />
        )}
        {page === "messages" && <MessageListPage onBack={goTop} onSelectConversation={openChat} />}
        {page === "favorites" && (
          <FavoritesPage onBack={goTop} onSelectCourse={(id) => openDetail(id, "favorites")} />
        )}
        {page === "chat" && (
          <ChatPage
            askerId={chatContext.askerId}
            courseId={chatContext.courseId}
            courseName={chatContext.courseName}
            role={chatContext.role}
            onBack={() => setPage("messages")}
          />
        )}
      </ResponsiveFrame>

      <BottomNav current={page} onGoTop={goTop} onGoSearch={goSearch} onGoChat={goChat} onGoFavorites={goFavorites} />
    </div>
  );
}
