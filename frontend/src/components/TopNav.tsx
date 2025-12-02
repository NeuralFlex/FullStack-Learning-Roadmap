"use client"

import type React from "react"

interface TopNavProps {
  setSidebarOpen: (open: boolean) => void
  sidebarOpen: boolean
  activeTab: string
}

const TopNav: React.FC<TopNavProps> = ({ setSidebarOpen, sidebarOpen, activeTab }) => {
  return (
    <header className="top-nav">
      <div className="nav-content">
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar">
          {sidebarOpen ? "◀" : "▶"}
        </button>
        <h2 className="page-title">
          {activeTab === "dashboard" && "Media Processing App"}
          {activeTab === "images" && "Image Tools"}
          {activeTab === "videos" && "Video Tools"}
          {activeTab === "settings" && "Settings"}
        </h2>
        <div className="nav-spacer"></div>
      </div>
    </header>
  )
}

export default TopNav
