
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";

export default function NotFoundPage() {
  const { translations, locale } = useLocalization();

  const notFoundTexts = {
    'en-US': {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist.',
      backHome: 'Back to Home'
    },
    'id-ID': {
      title: 'Halaman Tidak Ditemukan',
      description: 'Halaman yang Anda cari tidak ada.',
      backHome: 'Kembali ke Beranda'
    }
  };

  const texts = notFoundTexts[locale as keyof typeof notFoundTexts] || notFoundTexts['en-US'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="font-bebas text-6xl text-primary mb-4">404</h1>
        <h2 className="font-bebas text-2xl mb-4">{texts.title}</h2>
        <p className="text-muted-foreground mb-8">
          {texts.description}
        </p>
        <Button asChild>
          <a href="/" data-testid="button-back-home">
            {texts.backHome}
          </a>
        </Button>
      </div>
    </div>
  );
}
