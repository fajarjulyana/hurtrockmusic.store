import FeaturedArtists from '../FeaturedArtists';

export default function FeaturedArtistsExample() {
  return (
    <FeaturedArtists 
      onArtistClick={(artistId) => console.log('Artist clicked:', artistId)}
    />
  );
}