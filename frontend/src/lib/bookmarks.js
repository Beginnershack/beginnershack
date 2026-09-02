const KEY = "bookmarkedCourseIds";

export function getBookmarks() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(courseId) {
  return getBookmarks().includes(courseId);
}

export function toggleBookmark(courseId) {
  const current = getBookmarks();
  const next = current.includes(courseId) ? current.filter((id) => id !== courseId) : [...current, courseId];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next.includes(courseId);
}
