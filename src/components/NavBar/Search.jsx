export default function Search({ onQueryHandle, query }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => onQueryHandle(e.target.value)}
    />
  );
}
