import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/security/rate-limiter-server"

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

  const isDev = process.env.NODE_ENV === "development"
  const isPreview = process.env.VERCEL_ENV === "preview"

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimitResult = await checkRateLimit(ip, request.nextUrl.pathname)

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      )

      const headers = getRateLimitHeaders(rateLimitResult)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }
  }

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: http: ${isDev ? "'unsafe-eval'" : ""} ${isPreview ? "'unsafe-inline'" : ""} https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com https://r2cdn.perplexity.ai;
    connect-src 'self' https://vitals.vercel-insights.com ${isPreview ? "https://vercel.live wss://*.pusher.com wss://*.pusherapp.com" : ""};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src ${isPreview ? "https://vercel.live https://vercel.com" : "'none'"};
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", cspHeader)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview') {
    response.headers.set("Content-Security-Policy", cspHeader)
  } else {
    response.headers.set("Content-Security-Policy-Report-Only", cspHeader)
  }

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  )
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  )

  return response
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
