"use client"

import dynamic from "next/dynamic"
import type { Slide } from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import NextJsImage from "./NextJsImage"

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), {
  ssr: false,
})

import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"

interface ImageLightboxProps {
  slides: Slide[]
  open: boolean
  onClose: () => void
  index?: number
}

export default function ImageLightbox({
  slides,
  open,
  onClose,
  index = 0,
}: ImageLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Zoom, Fullscreen, Thumbnails]}
      render={{
        slide: NextJsImage,
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 50,
        scrollToZoom: false,
      }}
      fullscreen={{
        auto: false,
      }}
      thumbnails={{
        position: "bottom",
        width: 120,
        height: 80,
        border: 1,
        borderRadius: 4,
        padding: 4,
        gap: 16,
        imageFit: "cover",
        vignette: true,
      }}
      labels={{
        Previous: "Précédent",
        Next: "Suivant",
        Close: "Fermer",
        "Zoom in": "Agrandir",
        "Zoom out": "Réduire",
        "Show thumbnails": "Afficher les miniatures",
        "Hide thumbnails": "Masquer les miniatures",
      }}
      controller={{
        aria: true,
      }}
      animation={{
        fade: 250,
        swipe: 500,
      }}
      carousel={{
        finite: false,
        preload: 2,
        imageFit: "contain",
      }}
    />
  )
}
