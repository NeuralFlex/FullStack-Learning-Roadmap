import React from "react"

export const SettingsSection: React.FC = React.memo(() => {
  return (
    <section className="settings-section">
      <div className="section-header">
        <h1>Settings</h1>
        <p>Configure your preferences</p>
      </div>
      <div className="settings-card">
        <h3>About Media Processing App</h3>
        <p>Version 1.0.0</p>
        <p>
          A modern web-based media processing tool for images and videos with advanced editing capabilities.
        </p>
      </div>
    </section>
  )
})
