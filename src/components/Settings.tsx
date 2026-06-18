import { Moon, Sun, Globe, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage, type SupportedLang } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

const LANGUAGES: { value: SupportedLang; label: string; native: string; available: boolean }[] = [
  { value: 'en', label: 'English',     native: 'English',       available: true },
  { value: 'am', label: 'Amharic',     native: 'አማርኛ',         available: true },
  { value: 'om', label: 'Afaan Oromo', native: 'Afaan Oromoo',  available: false },
  { value: 'ti', label: 'Tigrinya',    native: 'ትግርኛ',         available: false },
  { value: 'so', label: 'Somali',      native: 'Soomaali',      available: false },
  { value: 'si', label: 'Sidama',      native: 'Sidaamu Afoo',  available: false },
];

export function Settings({ open, onOpenChange, theme, onThemeChange }: SettingsProps) {
  const { lang, setLang, t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* ── Language ── */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Globe className="w-4 h-4" />
              {t('settings.language')}
            </label>

            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(({ value, label, native, available }) => {
                const isActive = lang === value;
                return (
                  <button
                    key={value}
                    onClick={() => available && setLang(value)}
                    disabled={!available}
                    className={cn(
                      'relative flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all',
                      isActive
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : available
                          ? 'border-border bg-muted/40 hover:border-primary/50 hover:bg-muted'
                          : 'border-border/40 bg-muted/20 text-muted-foreground/50 cursor-not-allowed',
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{native}</div>
                      {native !== label && (
                        <div className="text-xs text-muted-foreground truncate">{label}</div>
                      )}
                    </div>
                    {isActive && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                    {!available && (
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">soon</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Theme ── */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {t('settings.theme')}
            </label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => onThemeChange('light')}
                className="flex-1"
              >
                <Sun className="w-4 h-4 mr-2" />
                {t('settings.light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => onThemeChange('dark')}
                className="flex-1"
              >
                <Moon className="w-4 h-4 mr-2" />
                {t('settings.dark')}
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
