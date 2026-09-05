import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import ResponsiveFrame from "./components/ResponsiveFrame.jsx";
import TopPage from "./components/TopPage.jsx";
import SearchPage from "./components/SearchPage.jsx";
import PostReviewPage from "./components/PostReviewPage.jsx";
import CourseDetailPage from "./components/CourseDetailPage.jsx";
import MessageListPage from "./components/MessageListPage.jsx";
import ChatPage from "./components/ChatPage.jsx";
import FavoritesPage from "./components/FavoritesPage.jsx";
import BottomNav from "./components/BottomNav.jsx";

function navKeyFromPath(pathname) {
  if (pathname === "/") return "top";
  if (pathname === "/search") return "search";
  if (pathname === "/favorites") return "favorites";
  if (pathname === "/messages" || pathname === "/chat") return "messages";
  return null;
}

function TopRoute() {
  const navigate = useNavigate();
  return <TopPage onSearch={() => navigate("/search")} onPostReview={() => navigate("/post")} />;
}

function SearchRoute() {
  const navigate = useNavigate();
  return (
    <SearchPage
      onBack={() => navigate("/")}
      onSelectCourse={(id) => navigate(`/course/${id}`)}
    />
  );
}

function PostReviewRoute() {
  const navigate = useNavigate();
  return <PostReviewPage onBack={() => navigate("/")} />;
}

function CourseDetailRoute() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  return (
    <CourseDetailPage
      courseId={courseId}
      onBack={() => navigate(-1)}
      onMessage={(context) => navigate("/chat", { state: context })}
    />
  );
}

function MessageListRoute() {
  const navigate = useNavigate();
  return (
    <MessageListPage
      onBack={() => navigate("/")}
      onSelectConversation={(context) => navigate("/chat", { state: context })}
    />
  );
}

function FavoritesRoute() {
  const navigate = useNavigate();
  return (
    <FavoritesPage
      onBack={() => navigate("/")}
      onSelectCourse={(id) => navigate(`/course/${id}`)}
    />
  );
}

function ChatRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const context = location.state || {};
  return (
    <ChatPage
      askerId={context.askerId}
      courseId={context.courseId}
      courseName={context.courseName}
      role={context.role}
      onBack={() => navigate("/messages")}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const navKey = navKeyFromPath(location.pathname);

  return (
    <div className="min-h-[100dvh] bg-[#f2f2f2] flex items-start justify-center">
      <ResponsiveFrame>
        <Routes>
          <Route path="/" element={<TopRoute />} />
          <Route path="/search" element={<SearchRoute />} />
          <Route path="/post" element={<PostReviewRoute />} />
          <Route path="/course/:courseId" element={<CourseDetailRoute />} />
          <Route path="/messages" element={<MessageListRoute />} />
          <Route path="/chat" element={<ChatRoute />} />
          <Route path="/favorites" element={<FavoritesRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ResponsiveFrame>

      <BottomNav
        current={navKey}
        onGoTop={() => navigate("/")}
        onGoSearch={() => navigate("/search")}
        onGoChat={() => navigate("/messages")}
        onGoFavorites={() => navigate("/favorites")}
      />
    </div>
  );
}
