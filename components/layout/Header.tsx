"use client";

import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";
import { usePathname } from "next/navigation";

/**
 * Header Component
 *
 * Global navigation header with user authentication menu.
 * Fixed position at top of viewport.
 */
export function Header() {
  const pathname = usePathname();

  // Hide header on auth pages
  if (pathname?.startsWith("/auth/")) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-lg font-montserrat font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Clauger RSE
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/rapport?page=1"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Rapport
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
