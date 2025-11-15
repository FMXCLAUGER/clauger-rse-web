"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Image from "next/image"
import { useSwipeable } from "react-swipeable"
import { useSession } from "next-auth/react"
import { PAGES, TOTAL_PAGES } from "@/lib/constants"
import { reportPageSchema } from "@/lib/validations/searchParams"
import NavigationControls from "./NavigationControls"
import ThumbnailSidebar from "./ThumbnailSidebar"
import ImageLightbox from "@/components/lightbox/ImageLightbox"
import { PageSelectionModal } from "@/components/export/PageSelectionModal"
import { FocusMode } from "./FocusMode"
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation"
import { useReadingState } from "@/hooks/useReadingState"
import { ZOOM_LEVELS, type ZoomLevel } from "@/lib/design/clauger-colors"
import { toast } from "sonner"
import { useAnnotations } from "@/hooks/useAnnotations"
import { AnnotationLayer } from "@/components/annotations/AnnotationLayer"
import { AnnotationEditor } from "@/components/annotations/AnnotationEditor"
import { AnnotationList } from "@/components/annotations/AnnotationList"
import { AnnotationToolbar } from "@/components/annotations/AnnotationToolbar"
import { ANNOTATION_COLORS } from "@/types/annotation-types"
import type { Annotation, CreateAnnotationPayload } from "@/types/annotation-types"

interface ReportViewerProps {
  initialPage: number
}

export default function ReportViewerWithAnnotations({ initialPage }: ReportViewerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  // UI State
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusModeOpen, setFocusModeOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(100)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const hasShownResumeToast = useRef(false)

  // Annotation State
  const [annotationMode, setAnnotationMode] = useState(false)
  const [annotationColor, setAnnotationColor] = useState<string>(ANNOTATION_COLORS.default)
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [annotationListOpen, setAnnotationListOpen] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Page handling
  const pageParam = searchParams.get("page")
  const result = reportPageSchema.safeParse({ page: pageParam || String(initialPage) })
  const currentPage = result.success ? result.data.page : initialPage
  const currentImage = PAGES[currentPage - 1]

  // Annotations hook
  const {
    annotations,
    isLoading: annotationsLoading,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = useAnnotations("rapport-rse-2025", currentPage)

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > TOTAL_PAGES) return
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(page))
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const { savedState, saveState, hasResumePoint } = useReadingState(
    currentPage,
    zoomLevel,
    sidebarCollapsed
  )

  useEffect(() => {
    if (savedState && !hasShownResumeToast.current) {
      setZoomLevel(savedState.zoomLevel)
      setSidebarCollapsed(savedState.sidebarCollapsed)
      if (savedState.lastPage > 1 && savedState.lastPage !== currentPage) {
        toast.info(`Reprendre à la page ${savedState.lastPage}`, {
          duration: 5000,
          action: {
            label: 'Reprendre',
            onClick: () => goToPage(savedState.lastPage),
          },
        })
      }
      hasShownResumeToast.current = true
    }
  }, [savedState, currentPage, goToPage])

  useEffect(() => {
    saveState(currentPage, zoomLevel, sidebarCollapsed)
  }, [currentPage, zoomLevel, sidebarCollapsed, saveState])

  const nextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES) goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const zoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel)
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoomLevel(ZOOM_LEVELS[currentIndex + 1])
    }
  }, [zoomLevel])

  const zoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel)
    if (currentIndex > 0) {
      setZoomLevel(ZOOM_LEVELS[currentIndex - 1])
    }
  }, [zoomLevel])

  const zoomReset = useCallback(() => {
    setZoomLevel(100)
  }, [])

  const toggleFocusMode = useCallback(() => {
    setFocusModeOpen((prev) => !prev)
  }, [])

  const toggleAnnotationMode = useCallback(() => {
    if (!session?.user) {
      toast.error("Vous devez être connecté pour annoter")
      return
    }
    setAnnotationMode((prev) => !prev)
    if (!annotationMode) {
      setAnnotationListOpen(true)
      toast.success("Mode annotation activé")
    }
  }, [session, annotationMode])

  const handleCreateAnnotation = useCallback(
    async (payload: CreateAnnotationPayload) => {
      const annotation = await createAnnotation(payload)
      if (annotation) {
        toast.success("Annotation créée")
        setSelectedAnnotation(annotation)
        setEditorOpen(true)
      }
    },
    [createAnnotation]
  )

  const handleSelectAnnotation = useCallback((annotation: Annotation | null) => {
    setSelectedAnnotation(annotation)
    if (annotation) {
      setEditorOpen(true)
    }
  }, [])

  const handleSaveAnnotation = useCallback(
    async (annotationId: string, payload: any) => {
      await updateAnnotation(annotationId, payload)
      toast.success("Annotation mise à jour")
    },
    [updateAnnotation]
  )

  const handleDeleteAnnotation = useCallback(
    async (annotationId: string) => {
      const success = await deleteAnnotation(annotationId)
      if (success) {
        toast.success("Annotation supprimée")
        setSelectedAnnotation(null)
      }
    },
    [deleteAnnotation]
  )

  useKeyboardNavigation({
    onPrev: prevPage,
    onNext: nextPage,
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onZoomReset: zoomReset,
    onToggleFocus: toggleFocusMode,
    enabled: !focusModeOpen && !editorOpen,
  })

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentPage < TOTAL_PAGES) {
        nextPage()
        toast.success(`Page ${currentPage + 1}/${TOTAL_PAGES}`, {
          duration: 1000,
          position: 'bottom-center',
        })
      } else {
        toast.info('Dernière page', {
          duration: 800,
          position: 'bottom-center',
        })
      }
    },
    onSwipedRight: () => {
      if (currentPage > 1) {
        prevPage()
        toast.success(`Page ${currentPage - 1}/${TOTAL_PAGES}`, {
          duration: 1000,
          position: 'bottom-center',
        })
      } else {
        toast.info('Première page', {
          duration: 800,
          position: 'bottom-center',
        })
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 30,
    preventScrollOnSwipe: true,
    swipeDuration: 500,
  })

  useEffect(() => {
    const adjacentPages = [currentPage - 1, currentPage + 1].filter(
      (p) => p >= 1 && p <= TOTAL_PAGES
    )

    adjacentPages.forEach((page) => {
      const link = document.createElement("link")
      link.rel = "prefetch"
      link.as = "image"
      link.href = PAGES[page - 1].src
      document.head.appendChild(link)
    })
  }, [currentPage])

  return (
    <div className="flex h-full bg-gray-100 dark:bg-gray-950">
      <ThumbnailSidebar
        pages={PAGES}
        currentPage={currentPage}
        onSelectPage={goToPage}
        resumePageId={savedState?.lastPage}
      />

      <div className="flex-1 flex flex-col">
        <NavigationControls
          currentPage={currentPage}
          totalPages={TOTAL_PAGES}
          onPrev={prevPage}
          onNext={nextPage}
          onZoom={() => setLightboxOpen(true)}
          onDownloadPDF={() => setPdfModalOpen(true)}
          onSearch={() => {
            const event = new KeyboardEvent('keydown', {
              key: 'k',
              metaKey: true,
              ctrlKey: true,
              bubbles: true
            })
            document.dispatchEvent(event)
          }}
          zoomLevel={zoomLevel}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onToggleFocus={toggleFocusMode}
        />

        {/* Annotation Toolbar */}
        {session?.user && (
          <AnnotationToolbar
            enabled={annotationMode}
            onToggle={toggleAnnotationMode}
            currentColor={annotationColor}
            onColorChange={setAnnotationColor}
            annotationCount={annotations.length}
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          <main id="main-content" className="flex-1 relative bg-white dark:bg-gray-900 p-4 md:p-8 overflow-auto transition-colors duration-200">
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              Page {currentPage} sur {TOTAL_PAGES}
            </div>

            <div {...swipeHandlers} className="relative w-full h-full flex items-center justify-center touch-pan-y">
              <div
                className="relative max-w-full max-h-full transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                <div className="relative">
                  {/* Annotation-enabled image */}
                  <img
                    ref={imageRef}
                    src={currentImage.src}
                    alt={`Page ${currentPage} du rapport RSE Clauger 2025`}
                    className="w-auto h-auto max-w-full max-h-[calc(100vh-200px)] object-contain shadow-2xl dark:shadow-gray-800"
                    onLoad={() => {
                      // Image loaded, Annotorious can attach
                    }}
                  />

                  {/* Annotation Layer */}
                  {session?.user && imageRef.current && (
                    <AnnotationLayer
                      imageElement={imageRef.current}
                      reportId="rapport-rse-2025"
                      pageNumber={currentPage}
                      annotations={annotations}
                      onCreateAnnotation={handleCreateAnnotation}
                      onSelectAnnotation={handleSelectAnnotation}
                      enabled={annotationMode}
                      color={annotationColor}
                    />
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Annotation List Sidebar */}
          {session?.user && annotationListOpen && (
            <AnnotationList
              annotations={annotations}
              onSelectAnnotation={handleSelectAnnotation}
              selectedAnnotationId={selectedAnnotation?.id}
            />
          )}
        </div>
      </div>

      {/* Annotation Editor Modal */}
      {session?.user && (
        <AnnotationEditor
          annotation={selectedAnnotation}
          isOpen={editorOpen}
          onClose={() => {
            setEditorOpen(false)
            setSelectedAnnotation(null)
          }}
          onSave={handleSaveAnnotation}
          onDelete={handleDeleteAnnotation}
        />
      )}

      <ImageLightbox
        slides={PAGES.map((page) => ({
          src: page.src,
          alt: page.alt,
          width: page.width,
          height: page.height,
          blurDataURL: page.blurDataURL,
        }))}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        index={currentPage - 1}
      />

      <PageSelectionModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        currentPage={currentPage}
      />

      <FocusMode
        isOpen={focusModeOpen}
        onClose={() => setFocusModeOpen(false)}
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPrev={prevPage}
        onNext={nextPage}
      >
        <div
          className="relative max-w-full max-h-full transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          <Image
            src={currentImage.src}
            alt={`Page ${currentPage} du rapport RSE Clauger 2025`}
            width={currentImage.width || 1200}
            height={currentImage.height || 1600}
            className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain shadow-2xl"
            priority
            quality={90}
            placeholder={currentImage.blurDataURL ? "blur" : "empty"}
            blurDataURL={currentImage.blurDataURL}
          />
        </div>
      </FocusMode>
    </div>
  )
}
