"use client"

import type React from "react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarOpen: boolean
  fileCount: number
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, sidebarOpen, fileCount }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "images", label: "Image Tools", icon: "🖼️", count: 0 },
    { id: "videos", label: "Video Tools", icon: "🎬", count: 0 },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ]

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="app-logo">
          <span className="logo-icon">🎨</span>
          {sidebarOpen && <span className="logo-text">MPA</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {sidebarOpen && (
              <>
                <span className="nav-label">{item.label}</span>
              </>
            )}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
