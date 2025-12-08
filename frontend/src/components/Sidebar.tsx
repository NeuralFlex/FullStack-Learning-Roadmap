import type React from "react"

interface NavigationItem {
  id: string
  label: string
  icon: string
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "images", label: "Image Tools", icon: "🖼️" },
  { id: "videos", label: "Video Tools", icon: "🎬" },
  { id: "settings", label: "Settings", icon: "⚙️" },
]

interface SidebarProps {
  sidebarOpen: boolean
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, activeTab, onTabChange }) => {
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="app-logo">
          <span className="logo-icon">🎨</span>
          {sidebarOpen && <span className="logo-text">MPA</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {sidebarOpen && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
