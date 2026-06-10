'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t } = useI18n();

  const footerLinks = [
    {
      titleKey: 'footer.tournament',
      links: [
        { labelKey: 'nav.matches', href: '/matches' },
        { labelKey: 'nav.standings', href: '/standings' },
        { labelKey: 'nav.bracket', href: '/bracket' },
      ],
    },
    {
      titleKey: 'footer.predictions',
      links: [
        { labelKey: 'nav.ai_predictions', href: '/ai-predictions' },
        { labelKey: 'nav.predict', href: '/predict' },
        { labelKey: 'nav.my_predictions', href: '/my-predictions' },
        { labelKey: 'nav.leaderboard', href: '/leaderboard' },
      ],
    },
    {
      titleKey: 'footer.account',
      links: [
        { labelKey: 'nav.login', href: '/login' },
        { labelKey: 'nav.signup', href: '/register' },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0A1628]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">⚽</span>
              <span className="text-xl font-bold text-white">
                WC<span className="text-[#E3D380]">2026</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-400">
              {t('footer.description')}
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.titleKey}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#E3D380]">
                {t(group.titleKey)}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-gray-500">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
