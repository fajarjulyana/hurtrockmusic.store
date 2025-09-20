import ContactSection from '../ContactSection';

export default function ContactSectionExample() {
  return (
    <ContactSection 
      onFormSubmit={(data) => console.log('Contact form submitted:', data)}
    />
  );
}