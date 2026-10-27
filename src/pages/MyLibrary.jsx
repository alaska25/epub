import LibraryPanel from "../components/LibraryPanel.jsx";

export default function MyLibrary() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl text-ivory">My library</h1>
      <div className="mt-10">
        <LibraryPanel />
      </div>
    </div>
  );
}