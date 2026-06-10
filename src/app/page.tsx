'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { useI18n } from '@/lib/i18n';

const TOURNAMENT_START = new Date('2026-06-11T00:00:00');

const placeholderChampions = [
  { team: 'Brazil', probability: 14.2, flag: '🇧🇷' },
  { team: 'France', probability: 12.8, flag: '🇫🇷' },
  { team: 'England', probability: 10.5, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { team: 'Argentina', probability: 9.7, flag: '🇦🇷' },
  { team: 'Germany', probability: 8.3, flag: '🇩🇪' },
];

function useCountdown(target: Date) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.max(0, differenceInDays(target, now));
  const hours = Math.max(0, differenceInHours(target, now) % 24);
  const minutes = Math.max(0, differenceInMinutes(target, now) % 60);
  const seconds = Math.max(0, differenceInSeconds(target, now) % 60);

  return { days, hours, minutes, seconds, isPast: now >= target };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm sm:h-24 sm:w-24">
        <span className="text-3xl font-bold text-white sm:text-4xl">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="mt-2 text-xs uppercase tracking-wider text-gray-400">{label}</span>
    </div>
  );
}

export default function HomePage() {
  const countdown = useCountdown(TOURNAMENT_START);
  const { t } = useI18n();

  const tournamentCards = [
    { labelKey: 'home.teams', value: '48', icon: '🏳️' },
    { labelKey: 'home.groups', value: '12', icon: '📋' },
    { labelKey: 'home.matches_count', value: '104', icon: '⚽' },
    { labelKey: 'home.host_countries', value: '3', icon: '🏟️' },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#326295]/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#E3D380]/5 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 bg-[#326295]/30 text-[#E3D380] hover:bg-[#326295]/30">
            {t('home.title')}
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t('home.subtitle')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            {t('home.subtitle')}
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          {countdown.isPast ? (
            <p className="text-2xl font-bold text-[#E3D380]">🏆 {t('home.countdown')}</p>
          ) : (
            <>
              <p className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
                {t('home.countdown')}
              </p>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <CountdownUnit value={countdown.days} label={t('home.days')} />
                <span className="mt-[-20px] text-2xl text-[#E3D380]">:</span>
                <CountdownUnit value={countdown.hours} label={t('home.hours')} />
                <span className="mt-[-20px] text-2xl text-[#E3D380]">:</span>
                <CountdownUnit value={countdown.minutes} label={t('home.minutes')} />
                <span className="mt-[-20px] text-2xl text-[#E3D380]">:</span>
                <CountdownUnit value={countdown.seconds} label={t('home.seconds')} />
              </div>
            </>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/predict">
            <Button size="lg" className="bg-[#326295] text-white hover:bg-[#326295]/80">
              {t('home.make_prediction')}
            </Button>
          </Link>
          <Link href="/ai-predictions">
            <Button size="lg" variant="outline" className="border-[#E3D380]/30 text-[#E3D380] hover:bg-[#E3D380]/10">
              {t('home.view_ai')}
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Tournament Info Cards */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {tournamentCards.map((card, i) => (
              <motion.div
                key={card.labelKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              >
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center p-5 text-center">
                    <span className="text-3xl">{card.icon}</span>
                    <span className="mt-2 text-3xl font-bold text-[#E3D380]">{card.value}</span>
                    <span className="text-sm font-semibold text-white">{t(card.labelKey)}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Champion Probabilities Placeholder */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="border-[#326295]/30 bg-gradient-to-br from-[#326295]/10 to-[#E3D380]/5 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>🤖</span> {t('home.champion_probs')}
                  </CardTitle>
                  <Link href="/ai-predictions">
                    <Button variant="ghost" size="sm" className="text-[#E3D380] hover:text-[#E3D380]/80">
                      {t('common.view_all')} →
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {placeholderChampions.map((team, i) => (
                    <div key={team.team} className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-bold text-gray-500">
                        {i + 1}
                      </span>
                      <span className="text-2xl">{team.flag}</span>
                      <span className="flex-1 font-medium text-white">{team.team}</span>
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#326295] to-[#E3D380]"
                          style={{ width: `${(team.probability / 15) * 100}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-sm font-bold text-[#E3D380]">
                        {team.probability}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Today's Matches Placeholder */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>📅</span> {t('home.today_matches')}
                  </CardTitle>
                  <Link href="/matches">
                    <Button variant="ghost" size="sm" className="text-[#E3D380] hover:text-[#E3D380]/80">
                      {t('common.all_matches')} →
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-4xl">⚽</span>
                  <p className="mt-3 text-sm text-gray-400">
                    {t('home.no_matches')}
                  </p>
                  <Link href="/predict" className="mt-4">
                    <Button variant="outline" size="sm" className="border-[#326295]/50 text-gray-300 hover:bg-[#326295]/20">
                      {t('home.early_prediction')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
