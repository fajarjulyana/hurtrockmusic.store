import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactSectionProps {
  onFormSubmit?: (data: ContactFormData) => void;
}

export default function ContactSection({ onFormSubmit }: ContactSectionProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onFormSubmit?.(formData);
    console.log('Contact form submitted:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      alert('Message sent successfully!');
    }, 1000);
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: 'Alamat',
      value: 'Jl Gegerkalong Girang complex Darut Tauhid Kav 22, Gegerkalong, Setiabudhi North Bandung Area, Sukasari, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40153',
      testId: 'contact-address'
    },
    {
      icon: Phone,
      label: 'Telepon',
      value: '0821-1555-8035',
      testId: 'contact-phone'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@hurtrockstore.com',
      testId: 'contact-email'
    },
    {
      icon: Clock,
      label: 'Jam Operasional',
      value: 'Senin - Kamis: 09.30 - 18.00, Jumat: 09.30 - 18.00, Sabtu: 09.30 - 17.00, Minggu: Tutup',
      testId: 'contact-hours'
    }
  ];

  const subjects = [
    'General Inquiry',
    'Product Question',
    'Order Support',
    'Technical Support',
    'Partnership',
    'Other'
  ];

  return (
    <section className="py-16 bg-muted/30" data-testid="section-contact">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-bebas text-4xl md:text-5xl mb-4" data-testid="text-contact-title">
            GET IN TOUCH
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-contact-description">
            Ada pertanyaan tentang instrumen kami? Butuh saran ahli? 
            Para legenda rock kami siap membantu Anda menemukan suara yang sempurna.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="font-bebas text-2xl mb-6" data-testid="text-contact-info-title">
                KUNJUNGI TOKO KAMI
              </h3>
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-4" data-testid={info.testId}>
                    <div className="bg-primary/10 p-3 rounded-md">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{info.label}</div>
                      <div className="text-muted-foreground">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <Card className="overflow-hidden" data-testid="map-placeholder">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">Peta Interaktif</p>
                  <p className="text-sm text-muted-foreground">Kunjungi kami di jantung kota Bandung</p>
                </div>
              </div>
            </Card>

            {/* Store Features */}
            <div>
              <h4 className="font-semibold mb-4" data-testid="text-store-features-title">
                What to Expect
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2" data-testid="feature-try-before-buy">
                  • Try before you buy - test any instrument
                </li>
                <li className="flex items-center gap-2" data-testid="feature-expert-advice">
                  • Expert advice from professional musicians
                </li>
                <li className="flex items-center gap-2" data-testid="feature-repair-service">
                  • On-site repair and maintenance services
                </li>
                <li className="flex items-center gap-2" data-testid="feature-vintage-collection">
                  • Exclusive vintage and rare instrument collection
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <Card data-testid="contact-form-card">
            <CardHeader>
              <CardTitle className="font-bebas text-2xl" data-testid="text-contact-form-title">
                SEND US A MESSAGE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Your full name"
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <Select value={formData.subject} onValueChange={(value) => handleChange('subject', value)}>
                    <SelectTrigger data-testid="select-contact-subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Tell us how we can help you..."
                    className="min-h-32"
                    data-testid="textarea-contact-message"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                  data-testid="button-contact-submit"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}