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
  // Component is now empty - no content will be displayed
  return null;
}