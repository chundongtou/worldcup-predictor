'use client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  
  return (
    <div className="flex items-center gap-1">
      <Button
        variant={locale === 'zh' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLocale('zh')}
        className="h-8 px-2 text-xs"
      >
        中文
      </Button>
      <Button
        variant={locale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLocale('en')}
        className="h-8 px-2 text-xs"
      >
        EN
      </Button>
    </div>
  );
}
