import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2 } from 'lucide-react';
import heroImage from '@assets/generated_images/Vintage_concert_stage_hero_7a5a4ca2.png';

interface HeroProps {
  onShopNowClick?: () => void;
  onExploreClick?: () => void;
}

export default function Hero({ onShopNowClick, onExploreClick }: HeroProps) {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
        data-testid="hero-background"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center lg:text-left">
        <div className="max-w-2xl">
          <div className="flex items-center justify-center lg:justify-start mb-6">
            <Volume2 className="h-8 w-8 text-primary mr-3" />
            <span className="font-rock text-lg text-primary" data-testid="text-tagline">
              Legenda Rock Sejak Dulu
            </span>
          </div>
          
          <h1 className="font-bebas text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight" data-testid="text-hero-title">
            <span className="text-foreground">WUJUDKAN</span>
            <br />
            <span className="text-primary">LEGENDA ROCK</span>
            <br />
            <span className="text-foreground">ANDA</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl" data-testid="text-hero-description">
            Temukan alat musik vintage asli, amplifier klasik, dan aksesoris musik legendaris yang membentuk sejarah rock. Dari gitar ikonik hingga peralatan musik berkualitas tinggi.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={onShopNowClick}
              data-testid="button-shop-now"
            >
              Belanja Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="backdrop-blur-sm bg-background/20 border-primary/30 text-foreground hover:bg-primary/10"
              onClick={onExploreClick}
              data-testid="button-explore-collection"
            >
              Jelajahi Koleksi
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
            <div className="text-center lg:text-left" data-testid="stat-instruments">
              <div className="font-bebas text-3xl text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Alat Musik</div>
            </div>
            <div className="text-center lg:text-left" data-testid="stat-years">
              <div className="font-bebas text-3xl text-primary">15+</div>
              <div className="text-sm text-muted-foreground">Tahun Pengalaman</div>
            </div>
            <div className="text-center lg:text-left" data-testid="stat-artists">
              <div className="font-bebas text-3xl text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Artis Bahagia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}