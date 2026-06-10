'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/language-switcher';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();

  const navLinks = [
    { href: '/', labelKey: 'nav.home' },
    { href: '/ai-predictions', labelKey: 'nav.ai_predictions', badge: 'AI' },
    { href: '/predict', labelKey: 'nav.predict' },
    { href: '/my-predictions', labelKey: 'nav.my_predictions' },
    { href: '/standings', labelKey: 'nav.standings' },
    { href: '/bracket', labelKey: 'nav.bracket' },
    { href: '/leaderboard', labelKey: 'nav.leaderboard' },
    { href: '/matches', labelKey: 'nav.matches' },
    { href: '/self-evolution', labelKey: 'nav.self_evolution', badge: 'AI' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A1628]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#E3D380]">⚽</span>
          <span className="text-lg font-bold text-white">
            WC<span className="text-[#E3D380]">2026</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-[#E3D380]'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-lg bg-[#326295]/30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative">{t(link.labelKey)}</span>
                  {link.badge && (
                    <Badge className="relative ml-1 bg-[#326295] text-[10px] text-white hover:bg-[#326295]">
                      {link.badge}
                    </Badge>
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Auth buttons + Language switcher desktop */}
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              {t('nav.login')}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-[#326295] text-white hover:bg-[#326295]/80">
              {t('nav.signup')}
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex flex-col gap-1.5 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={cn('block h-0.5 w-6 bg-white transition-transform', mobileOpen && 'translate-y-2 rotate-45')} />
          <span className={cn('block h-0.5 w-6 bg-white transition-opacity', mobileOpen && 'opacity-0')} />
          <span className={cn('block h-0.5 w-6 bg-white transition-transform', mobileOpen && '-translate-y-2 -rotate-45')} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 bg-[#0A1628]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#326295]/30 text-[#E3D380]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {t(link.labelKey)}
                    {link.badge && (
                      <Badge className="bg-[#326295] text-[10px] text-white hover:bg-[#326295]">
                        {link.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
              <div className="flex items-center gap-2 pt-2">
                <LanguageSwitcher />
              </div>
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full text-gray-400">{t('nav.login')}</Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-[#326295] text-white hover:bg-[#326295]/80">{t('nav.signup')}</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
