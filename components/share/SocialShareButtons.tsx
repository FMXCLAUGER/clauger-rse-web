'use client'

import { Share2, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface SocialShareButtonsProps {
  url?: string
  title?: string
  description?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function SocialShareButtons({
  url,
  title = 'Tableau de Bord RSE 2025',
  description = 'Découvrez nos indicateurs de performance ESG',
  variant = 'outline',
  size = 'default',
}: SocialShareButtonsProps) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}%20-%20${encodedDescription}&url=${encodedUrl}`,
  }

  const handleShare = (platform: 'linkedin' | 'twitter') => {
    try {
      const width = 600
      const height = 600
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      window.open(
        shareLinks[platform],
        `${platform}-share`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0`
      )

      toast.success(`Partage ${platform === 'linkedin' ? 'LinkedIn' : 'Twitter'} ouvert`)
    } catch (error) {
      // Error handling - toast notification provides user feedback
      toast.error('Erreur lors du partage')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Lien copié dans le presse-papiers')
    } catch (error) {
      // Error handling - toast notification provides user feedback
      toast.error('Erreur lors de la copie du lien')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="gap-2"
          title="Partager sur les réseaux sociaux"
        >
          <Share2 className="w-4 h-4" />
          <span>Partager</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleShare('linkedin')}
          className="cursor-pointer gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleShare('twitter')}
          className="cursor-pointer gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="cursor-pointer gap-2"
        >
          <LinkIcon className="w-4 h-4" />
          Copier le lien
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
