import React, { useState, useCallback } from "react"
import "./styles/media-app.css"
import { Sidebar } from "./components/Sidebar"
import { TopNav } from "./components/TopNav"
import { ToastContainer } from "./components/ToastContainer"
import { DashboardSection } from "./components/DashboardSection"
import { ImageToolsSection } from "./components/ImageToolsSection"
import { VideoToolsSection } from "./components/VideoToolsSection"
import { SettingsSection } from "./components/SettingsSection"
import { useToast } from "./hooks/useToast"
import { useFFmpeg } from "./hooks/useFFmpeg"
import { useImageProcessor } from "./hooks/useImageProcessor"
import { useVideoProcessor } from "./hooks/useVideoProcessor"
import { useDragAndDrop } from "./hooks/useDragAndDrop"
import { useMediaFiles } from "./hooks/useMediaFiles"

export default function MediaProcessingApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")

  // Use our custom hooks
  const { toasts, addToast } = useToast()
  const { ffmpegRef, ffmpegLoaded } = useFFmpeg(addToast)
  const {
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleFilesSelected: handleFilesSelectedDrag,
    handleDrop,
    handleFileInputChange,
  } = useDragAndDrop()

  const {
    files,
    setFiles,
    updateFile,
    expandedCard,
    uploadFiles,
    deleteFile,
    downloadFile,
    handleToggleExpand,
  } = useMediaFiles(ffmpegRef, ffmpegLoaded, addToast, setActiveTab)

  const { resizeImage } = useImageProcessor(files, setFiles, updateFile, addToast)
  const { trimVideo } = useVideoProcessor(files, setFiles, updateFile, ffmpegRef, ffmpegLoaded, addToast)

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(!sidebarOpen)
  }, [sidebarOpen])

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  const handleFileInputChangeWrapper = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = handleFileInputChange(e)
    if (files.length > 0) {
      uploadFiles(files)
    }
  }, [handleFileInputChange, uploadFiles])

  const handleFilesSelectedWrapper = useCallback((files: FileList | null) => {
    if (files) {
      const fileArray = handleFilesSelectedDrag(files)
      if (fileArray.length > 0) {
        uploadFiles(fileArray)
      }
    }
  }, [handleFilesSelectedDrag, uploadFiles])

  const handleDropWrapper = useCallback((e: React.DragEvent) => {
    const fileArray = handleDrop(e)
    if (fileArray.length > 0) {
      uploadFiles(fileArray)
    }
  }, [handleDrop, uploadFiles])

  return (
    <div className="app-container">
      <Sidebar sidebarOpen={sidebarOpen} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* MAIN WRAPPER */}
      <div className="main-wrapper">
        <TopNav sidebarOpen={sidebarOpen} onSidebarToggle={handleSidebarToggle} activeTab={activeTab} />

        {/* MAIN CONTENT */}
        <main className="main-content">
          {activeTab === "dashboard" && (
            <DashboardSection
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropWrapper}
              onFilesSelected={handleFilesSelectedWrapper}
              fileInputRef={fileInputRef}
              ffmpegLoaded={ffmpegLoaded}
            />
          )}

          {activeTab === "images" && (
            <ImageToolsSection
              files={files}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropWrapper}
              onFilesSelected={handleFilesSelectedWrapper}
              fileInputRef={fileInputRef}
              expandedCard={expandedCard}
              ffmpegLoaded={ffmpegLoaded}
              onResize={resizeImage}
              onDelete={deleteFile}
              onDownload={downloadFile}
              onToggleExpand={handleToggleExpand}
            />
          )}

          {activeTab === "videos" && (
            <VideoToolsSection
              files={files}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropWrapper}
              onFilesSelected={handleFilesSelectedWrapper}
              fileInputRef={fileInputRef}
              expandedCard={expandedCard}
              ffmpegLoaded={ffmpegLoaded}
              onTrim={trimVideo}
              onDelete={deleteFile}
              onDownload={downloadFile}
              onToggleExpand={handleToggleExpand}
            />
          )}

          {activeTab === "settings" && <SettingsSection />}
        </main>

        <ToastContainer toasts={toasts} />
      </div>
    </div>
  )
}
