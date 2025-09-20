import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';

interface FooterProps {
  onNewsletterSubmit?: (email: string) => void;
}

export default function Footer({ onNewsletterSubmit }: FooterProps) {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNewsletterSubmit?.(email);
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const footerLinks = {
    shop: [
      { name: 'Gitar Elektrik', href: '#guitars' },
      { name: 'Gitar Akustik', href: '#acoustic' },
      { name: 'Gitar Bass', href: '#bass' },
      { name: 'Drum', href: '#drums' },
      { name: 'Amplifier', href: '#amps' },
      { name: 'Aksesoris', href: '#accessories' }
    ],
    support: [
      { name: 'Hubungi Kami', href: '#contact' },
      { name: 'Info Pengiriman', href: '#shipping' },
      { name: 'Pengembalian', href: '#returns' },
      { name: 'Panduan Ukuran', href: '#sizing' },
      { name: 'Petunjuk Perawatan', href: '#care' },
      { name: 'Garansi', href: '#warranty' }
    ],
    company: [
      { name: 'Tentang Kami', href: '#about' },
      { name: 'Cerita Kami', href: '#story' },
      { name: 'Karir', href: '#careers' },
      { name: 'Pers', href: '#press' },
      { name: 'Blog', href: '#blog' },
      { name: 'Artis', href: '#artists' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: '#facebook', name: 'Facebook' },
    { icon: Instagram, href: '#instagram', name: 'Instagram' },
    { icon: Twitter, href: '#twitter', name: 'Twitter' },
    { icon: Youtube, href: '#youtube', name: 'YouTube' }
  ];

  return (
    <footer className="bg-background border-t" data-testid="footer">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="font-bebas text-2xl text-primary mb-4" data-testid="text-footer-brand">
              HURTROCK MUSIC STORE
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md" data-testid="text-footer-description">
              Destinasi utama Anda untuk alat musik rock entry level dan profesional serta aksesoris musik berkualitas. 
              Kami telah melayani musisi pemula hingga profesional selama lebih dari 15 tahun.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2" data-testid="contact-address">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Jl Gegerkalong Girang complex Darut Tauhid Kav 22, Gegerkalong, Setiabudhi North Bandung Area, Sukasari, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40153</span>
              </div>
              <div className="flex items-center gap-2" data-testid="contact-phone">
                <Phone className="h-4 w-4 text-primary" />
                <span>0821-1555-8035</span>
              </div>
              <div className="flex items-center gap-2" data-testid="contact-email">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@hurtrockstore.com</span>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="mt-4 space-y-1 text-sm" data-testid="operating-hours">
              <h5 className="font-medium text-foreground">Jam Operasional:</h5>
              <div className="text-muted-foreground">
                <div>Senin - Kamis: 09.30 - 18.00</div>
                <div>Jumat: 09.30 - 18.00</div>
                <div>Sabtu: 09.30 - 17.00</div>
                <div>Minggu: Tutup</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2 mt-6">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="outline"
                  size="icon"
                  asChild
                  className="hover-elevate"
                  data-testid={`button-social-${social.name.toLowerCase()}`}
                >
                  <a href={social.href} aria-label={social.name}>
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-shop-title">Toko</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`link-shop-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-support-title">Dukungan</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`link-support-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-company-title">Perusahaan</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`link-company-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t">
          <div className="max-w-md">
            <h4 className="font-semibold mb-2" data-testid="text-newsletter-title">
              Stay in the Loop
            </h4>
            <p className="text-sm text-muted-foreground mb-4" data-testid="text-newsletter-description">
              Get the latest news about new arrivals, exclusive deals, and rock legends.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button type="submit" data-testid="button-newsletter-submit">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div data-testid="text-copyright">
            © 2024 Hurtrock Music Store. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-primary transition-colors" data-testid="link-privacy">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-primary transition-colors" data-testid="link-terms">
              Terms of Service
            </a>
            <a href="#cookies" className="hover:text-primary transition-colors" data-testid="link-cookies">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}