import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalization } from "@/contexts/LocalizationContext";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocalization();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLocale('en-US')}
          className={locale === 'en-US' ? 'bg-accent' : ''}
        >
          🇺🇸 English (USD)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('id-ID')}
          className={locale === 'id-ID' ? 'bg-accent' : ''}
        >
          🇮🇩 Bahasa Indonesia (IDR)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}