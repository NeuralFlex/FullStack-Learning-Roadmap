import type React from "react"

interface TopNavProps {
  sidebarOpen: boolean
  onSidebarToggle: () => void
  activeTab: string
}

export const TopNav: React.FC<TopNavProps> = ({ sidebarOpen, onSidebarToggle, activeTab }) => {
  const getPageTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Media Processing App"
      case "images":
        return "Image Tools"
      case "videos":
        return "Video Tools"
      case "settings":
        return "Settings"
      default:
        return "Media Processing App"
    }
  }

  return (
    <header className="top-nav">
      <div className="nav-content">
        <button className="menu-toggle" onClick={onSidebarToggle} title="Toggle sidebar">
          {sidebarOpen ? "◀" : "▶"}
        </button>
        <h2 className="page-title">{getPageTitle(activeTab)}</h2>
        <div className="nav-spacer"></div>
      </div>
    </header>
  )
}
