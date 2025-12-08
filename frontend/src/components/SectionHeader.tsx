import type React from "react"

interface SectionHeaderProps {
  title: string
  description: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => {
  return (
    <div className="section-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}
