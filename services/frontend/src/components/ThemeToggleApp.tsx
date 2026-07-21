import { Moon, SunMedium } from 'lucide-react';
import { Button } from './ui/button';
import { useThemeStore } from '../store/useThemeStore';

export default function ThemeToggleApp() {
  const { theme, toggle } = useThemeStore();

  return (
    <Button
      onClick={toggle}
      variant="ghost"
      className={'text-muted-foreground py-1.5'}
    >
      {theme === 'light' ? <Moon /> : <SunMedium />}
    </Button>
  );
}
