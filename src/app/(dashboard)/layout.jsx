
export default function MainLayout({ children }) {
  return (
    <div>
      <header style={{ background: "#333", color: "#fff", padding: "10px" }}>
        <h2>Dashboard Layout Header</h2>
      </header>
      <main style={{ padding: "20px" }}>
        {children}
      </main>
    </div>
  );
}
