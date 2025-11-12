"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronDown } from "lucide-react"
import { CircularScore } from "./CircularScore"

interface HeroSectionProps {
  title: string
  baseline: string
  score: number
  heroImage: {
    src: string
    blurDataURL?: string
  }
}

export function HeroSection({ title, baseline, score, heroImage }: HeroSectionProps) {
  const [parallaxOffset, setParallaxOffset] = useState(0)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const handleScroll = () => {
      const scrolled = window.scrollY
      setParallaxOffset(scrolled * 0.5)
      setShowScrollIndicator(scrolled < 100)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isMobile])

  return (
    <section className="relative h-dvh overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(44, 62, 80, 0.7), rgba(44, 62, 80, 0.4))"
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: isMobile ? "none" : `translateY(${parallaxOffset}px)`,
            transition: isMobile ? "none" : undefined
          }}
        >
          <Image
            src={heroImage.src}
            alt="Couverture du rapport RSE Clauger 2025"
            fill
            className="object-cover object-center"
            priority
            quality={85}
            placeholder={heroImage.blurDataURL ? "blur" : "empty"}
            blurDataURL={heroImage.blurDataURL}
          />
        </div>
      </div>

      <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white z-10">
        <div className="mb-8 inline-block animate-fadeInUp">
          <span className="text-sm font-semibold tracking-wider uppercase bg-[#0088CC] px-4 py-2 rounded-full">
            1er Rapport Durable
          </span>
        </div>

        <h1 className="font-montserrat text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp animation-delay-200">
          {title}
        </h1>

        <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl animate-fadeInUp animation-delay-400">
          {baseline}
        </p>

        <div className="mb-12 animate-fadeInUp animation-delay-600">
          <CircularScore score={score} />
        </div>

        <Link
          href="/rapport?page=1"
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg text-white transition-all hover:-translate-y-2 animate-fadeInUp animation-delay-800"
          style={{
            background: "linear-gradient(135deg, #0088CC 0%, #0066AA 100%)",
            boxShadow: "0 8px 16px rgba(0, 136, 204, 0.3)"
          }}
        >
          Explorer le rapport
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-500 z-10 ${
          showScrollIndicator ? "opacity-70" : "opacity-0"
        }`}
      >
        <ChevronDown className="w-8 h-8 text-[#0088CC] animate-bounceScroll" />
      </div>
    </section>
  )
}
