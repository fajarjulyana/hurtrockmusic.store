import Hero from '../Hero';

export default function HeroExample() {
  return (
    <Hero 
      onShopNowClick={() => console.log('Shop now clicked')}
      onExploreClick={() => console.log('Explore collection clicked')}
    />
  );
}