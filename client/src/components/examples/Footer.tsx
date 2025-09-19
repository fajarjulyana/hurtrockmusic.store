import Footer from '../Footer';

export default function FooterExample() {
  return (
    <Footer 
      onNewsletterSubmit={(email) => console.log('Newsletter signup:', email)}
    />
  );
}