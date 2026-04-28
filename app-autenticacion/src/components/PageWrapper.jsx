import Sidebar from "./Sidebar";

export default function PageWrapper({ children, profileName }) {
  return (
    <div className="app-layout">
      <Sidebar profileName={profileName} />
      <main className="main-content">{children}</main>
    </div>
  );
}