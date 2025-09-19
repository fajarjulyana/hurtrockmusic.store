import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Quote, ExternalLink, Star } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  genre: string;
  instrument: string;
  quote: string;
  image: string;
  verified: boolean;
}

interface FeaturedArtistsProps {
  onArtistClick?: (artistId: string) => void;
}

export default function FeaturedArtists({ onArtistClick }: FeaturedArtistsProps) {
  // Mock artist data - todo: remove mock functionality
  const artists: Artist[] = [
    {
      id: '1',
      name: 'Jake "Thunder" Morrison',
      genre: 'Hard Rock',
      instrument: 'Gibson Les Paul Standard',
      quote: "Hurtrock has been my go-to for over 20 years. Their vintage collection is unmatched, and the sound quality is legendary.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face",
      verified: true
    },
    {
      id: '2',
      name: 'Sarah "Vinyl" Chen',
      genre: 'Classic Rock',
      instrument: 'Fender Stratocaster',
      quote: "The staff at Hurtrock doesn't just sell instruments - they understand the soul of rock music. Every purchase feels like joining a family.",
      image: "https://images.unsplash.com/photo-1494790108755-2616c0763c5c?w=400&h=400&fit=crop&crop=face",
      verified: true
    },
    {
      id: '3',
      name: 'Mike "Sticks" Rodriguez',
      genre: 'Progressive Rock',
      instrument: 'DW Collector\'s Series',
      quote: "From vintage classics to cutting-edge gear, Hurtrock has everything a serious musician needs. The quality is always top-notch.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      verified: true
    }
  ];

  const handleArtistClick = (artistId: string) => {
    onArtistClick?.(artistId);
    console.log('Artist clicked:', artistId);
  };

  return (
    <section className="py-16" data-testid="section-featured-artists">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-bebas text-4xl md:text-5xl mb-4" data-testid="text-artists-title">
            WHAT ARTISTS SAY
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-artists-description">
            Hear from the rock legends who trust Hurtrock Music Store 
            for their most important performances and recordings.
          </p>
        </div>

        {/* Artists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <Card 
              key={artist.id} 
              className="group hover-elevate overflow-hidden"
              data-testid={`card-artist-${artist.id}`}
            >
              <CardContent className="p-6">
                {/* Quote */}
                <div className="mb-6">
                  <Quote className="h-8 w-8 text-primary mb-4" />
                  <blockquote className="text-muted-foreground italic leading-relaxed" data-testid={`text-artist-quote-${artist.id}`}>
                    "{artist.quote}"
                  </blockquote>
                </div>

                {/* Artist Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-16 h-16 rounded-full object-cover"
                    data-testid={`img-artist-${artist.id}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold" data-testid={`text-artist-name-${artist.id}`}>
                        {artist.name}
                      </h4>
                      {artist.verified && (
                        <Star className="h-4 w-4 fill-primary text-primary" data-testid={`icon-verified-${artist.id}`} />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-artist-genre-${artist.id}`}>
                        {artist.genre}
                      </Badge>
                      <p className="text-sm text-muted-foreground" data-testid={`text-artist-instrument-${artist.id}`}>
                        Plays: {artist.instrument}
                      </p>
                    </div>
                  </div>
                </div>

                {/* View Profile Button */}
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between group-hover:text-primary transition-colors"
                    onClick={() => handleArtistClick(artist.id)}
                    data-testid={`button-view-artist-${artist.id}`}
                  >
                    View Artist Profile
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-muted/50 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="font-bebas text-2xl mb-4" data-testid="text-become-artist-title">
              JOIN OUR ARTIST FAMILY
            </h3>
            <p className="text-muted-foreground mb-6" data-testid="text-become-artist-description">
              Are you a professional musician? Join our community of rock legends 
              and get exclusive access to new arrivals and special deals.
            </p>
            <Button 
              size="lg"
              onClick={() => console.log('Apply for artist program')}
              data-testid="button-join-artists"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}