import { Button } from '@/components/ui/button';
import { useLocalization } from '@/contexts/LocalizationContext';
import heroImage from '@assets/generated_images/Vintage_concert_stage_hero_7a5a4ca2.png';
import { ArrowRight, Volume2 } from 'lucide-react';

interface HeroProps {
  onShopNowClick?: () => void;
  onExploreClick?: () => void;
}

export default function Hero({ onShopNowClick, onExploreClick }: HeroProps) {
  const { translations } = useLocalization();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Hero content based on locale */}
        <div className="flex items-center justify-center lg:justify-start mb-6">
          <Volume2 className="h-8 w-8 text-orange-400 mr-3" />
          <span className="font-rock text-lg text-orange-400" data-testid="text-tagline">
            {translations.hero?.title || translations.hero?.subtitle}
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bebas text-white mb-6 leading-tight tracking-wide" data-testid="text-hero-title">
          {translations.hero?.title}
          <br />
          <span className="text-orange-400">{translations.hero?.subtitle}</span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed" data-testid="text-hero-description">
          {translations.hero?.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-4 text-lg transition-all hover-elevate"
            onClick={onShopNowClick}
            data-testid="button-shop-now"
          >
            {translations.hero?.shopNow}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-slate-900 font-semibold px-8 py-4 text-lg transition-all hover-elevate"
            onClick={onExploreClick}
            data-testid="button-explore-collection"
          >
            {translations.hero?.exploreCollection}
          </Button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}