export function getMyId() {
  let id = localStorage.getItem("anonUserId");
  if (!id) {
    id = "user_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("anonUserId", id);
  }
  return id;
}
