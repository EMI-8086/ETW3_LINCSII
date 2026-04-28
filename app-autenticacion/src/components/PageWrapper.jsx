import Sidebar from "./Sidebar";

export default function PageWrapper({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}