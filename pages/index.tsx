import type { NextPage } from 'next';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Formula {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  featured: boolean;
  order: number;
}

interface Promotion {
  name: string;
  active: boolean;
  description: string;
}

const Home: NextPage = () => {
  const promotionsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setFormulas(data.formulas || []);
        setPromotion(data.promotion || null);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePhoneCall = () => {
    window.location.href = 'tel:438-493-1451';
  };

  const handleReservation = (service: string) => {
    router.push(`/reservation?service=${service}`);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy/50 via-navy to-navy/50"></div>

          {/* Wavy decoration elements */}
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(218, 165, 32, 0.1)" />
                <stop offset="100%" stopColor="rgba(218, 165, 32, 0.05)" />
              </linearGradient>
            </defs>
            <path d="M 0,300 Q 300,150 600,300 T 1200,300 L 1200,0 L 0,0 Z" fill="url(#waveGradient)" />
            <path d="M 0,500 Q 300,400 600,500 T 1200,500 L 1200,800 L 0,800 Z" fill="rgba(218, 165, 32, 0.08)" />
          </svg>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center py-20 md:py-0">
            {/* Left Side */}
            <div className="md:pr-12 text-center md:text-left">
              <div className="mb-8">
                <p className="text-gold text-xs md:text-sm font-bold tracking-widest mb-4">LAVAGE & DÉTAILING</p>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-text-light leading-tight mb-6 md:mb-8">
                  Éclat<br /><span className="text-gold">AUTO</span>
                </h1>
                <p className="text-text-light/80 text-base md:text-lg leading-relaxed mb-4">
                  Votre véhicule mérite une attention d'exception. Nous venons directement chez vous — sans tracas, sans compromis.
                </p>
                <p className="text-gold font-semibold text-sm">SAINT-PIE, QC</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => router.push('/gallery')}
                  className="bg-gold hover:bg-yellow-400 text-navy px-8 py-4 rounded-lg font-bold text-sm transition transform hover:scale-105 hover:shadow-lg">
                  EXPLORER PLUS
                </button>
                <button
                  onClick={() => router.push('/reservation')}
                  className="border-2 border-gold text-gold hover:bg-gold/10 px-8 py-4 rounded-lg font-bold text-sm transition">
                  RÉSERVER MAINTENANT
                </button>
              </div>
            </div>

            {/* Right Side - Service Cards (hidden on mobile) */}
            <div className="hidden md:flex relative h-96 items-end justify-end">
              <div className="absolute top-0 right-0 w-40 h-56 bg-gold/20 rounded-3xl backdrop-blur-sm border border-gold/30 flex flex-col items-center justify-center p-6 transform -rotate-12">
                <p className="text-gold text-4xl font-black mb-2">01</p>
                <p className="text-text-light text-center text-sm font-semibold">Détailing<br />Premium</p>
              </div>
              <div className="absolute top-20 right-32 w-40 h-56 bg-navy-light/40 rounded-3xl backdrop-blur-sm border border-gold/40 flex flex-col items-center justify-center p-6 transform rotate-6 shadow-2xl">
                <p className="text-gold text-4xl font-black mb-2">02</p>
                <p className="text-text-light text-center text-sm font-semibold">Lavage<br />Personnalisé</p>
              </div>
              <div className="absolute bottom-0 right-16 w-40 h-56 bg-gold/30 rounded-3xl backdrop-blur-sm border border-gold/50 flex flex-col items-center justify-center p-6 transform rotate-12 shadow-2xl">
                <p className="text-gold text-4xl font-black mb-2">03</p>
                <p className="text-text-light text-center text-sm font-semibold">Packages<br />Prépayés</p>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
            onClick={() => scrollToSection(promotionsRef)}
          >
            <div className="text-gold text-center">
              <p className="text-xs md:text-sm font-semibold mb-2">DÉCOUVRIR</p>
              <svg className="w-6 h-6 animate-bounce mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* Promotions Section */}
        {promotion && promotion.active && (
          <section ref={promotionsRef} className="py-16 md:py-20 px-6 bg-gradient-to-r from-gold/10 via-transparent to-gold/10 border-t-2 border-b-2 border-gold">
            <div className="container mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <p className="text-gold text-xs md:text-sm font-bold tracking-widest mb-4 animate-pulse">✨ {promotion.name.toUpperCase()} EN COURS</p>
                <h2 className="text-3xl md:text-5xl font-black text-text-light mb-4">
                  Promotion<br /><span className="text-gold">{promotion.name}</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold rounded-2xl p-8 md:p-12 text-center">
                  <p className="text-gold text-xs md:text-sm font-bold tracking-widest mb-4">PRIX UNIQUE</p>
                  <p className="text-5xl md:text-7xl font-black text-gold mb-4">
                    ${formulas.length > 0 ? formulas[0].price.toFixed(2) : '0.00'}
                  </p>
                  <p className="text-text-light text-lg mb-8">Tous les véhicules</p>
                  <p className="text-text-light text-sm mb-8 leading-relaxed">
                    {promotion.description}
                  </p>
                  {formulas.length > 0 && (
                    <button
                      onClick={() => handleReservation(formulas[0].id)}
                      className="w-full bg-gold hover:bg-yellow-400 text-navy px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 hover:shadow-lg">
                      RÉSERVER CETTE PROMOTION
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-navy-light/40 border-l-4 border-gold rounded-lg p-6">
                    <h3 className="text-text-light font-bold text-lg mb-3">✓ Inclus dans la promotion :</h3>
                    {formulas.length > 0 && (
                      <ul className="text-text-light/80 text-sm space-y-2">
                        {formulas[0].features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-green-900/30 border-l-4 border-gold rounded-lg p-6">
                    <p className="text-gold font-bold text-sm mb-2">⏰ DISPONIBLE</p>
                    <p className="text-text-light text-sm">Contactez-nous pour plus d'informations ou réservez en ligne!</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Services Section */}
        <section ref={servicesRef} className="py-16 md:py-24 px-4 md:px-6 bg-navy-dark/50 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path d="M 0,200 Q 300,100 600,200 T 1200,200" stroke="rgba(218, 165, 32, 0.3)" strokeWidth="2" fill="none" />
          </svg>

          <div className="container mx-auto relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <p className="text-gold text-xs md:text-sm font-bold tracking-widest mb-4">NOS SERVICES</p>
              <h2 className="text-3xl md:text-5xl font-black text-text-light mb-4">
                {formulas.length > 0 ? formulas.length : 'Nos'} formules<br /><span className="text-gold">adaptées à vos besoins</span>
              </h2>
            </div>

            {loading ? (
              <div className="text-center text-text-light">Chargement...</div>
            ) : formulas.length > 0 ? (
              <div className="relative">
                {/* Scroll Buttons */}
                {formulas.length > 2 && (
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gold/80 hover:bg-gold text-navy p-2 md:p-3 rounded-full transition shadow-lg"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Horizontal Scroll Container */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-6 md:gap-8 overflow-x-auto pb-4 scroll-smooth px-8 md:px-12 snap-x snap-mandatory"
                  style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}
                >
                  {formulas.map((formula) => (
                    <div
                      key={formula.id}
                      className={`flex-shrink-0 w-72 md:w-80 rounded-2xl p-6 md:p-8 transition transform hover:-translate-y-2 snap-center ${
                        formula.featured
                          ? 'border-2 border-gold bg-gradient-to-br from-gold/20 to-transparent'
                          : 'border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent hover:border-gold/80'
                      }`}
                    >
                      <div className="mb-6">
                        <p className="text-gold text-4xl md:text-5xl font-black mb-2">${formula.price.toFixed(2)}</p>
                        {formula.featured && (
                          <p className="text-gold text-xs font-bold tracking-widest">PLUS POPULAIRE</p>
                        )}
                      </div>
                      <h3 className="text-text-light text-xl md:text-2xl font-bold mb-4">{formula.name}</h3>
                      <p className="text-text-light/80 text-sm mb-4 line-clamp-2">{formula.description}</p>
                      <ul className="text-text-light/70 text-sm space-y-3 mb-8">
                        {formula.features.slice(0, 4).map((feature, index) => (
                          <li key={index}>✓ {feature}</li>
                        ))}
                        {formula.features.length > 4 && (
                          <li className="text-gold text-xs">+{formula.features.length - 4} de plus</li>
                        )}
                      </ul>
                      <button
                        onClick={() => handleReservation(formula.id)}
                        className={`w-full py-3 rounded-lg font-bold text-base md:text-lg transition transform hover:scale-105 ${
                          formula.featured
                            ? 'bg-gold hover:bg-yellow-400 text-navy'
                            : 'bg-gold/20 hover:bg-gold/40 text-gold border border-gold'
                        }`}
                      >
                        Sélectionner
                      </button>
                    </div>
                  ))}
                </div>

                {formulas.length > 2 && (
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gold/80 hover:bg-gold text-navy p-2 md:p-3 rounded-full transition shadow-lg"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center text-text-light">Aucune formule disponible</div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="py-16 md:py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5"></div>

          <div className="container mx-auto relative z-10 text-center">
            <p className="text-gold text-xs md:text-sm font-bold tracking-widest mb-6">PRÊT À COMMENCER ?</p>
            <h2 className="text-3xl md:text-5xl font-black text-text-light mb-6 md:mb-8 leading-tight">
              Réservez votre<br /><span className="text-gold">créneau maintenant</span>
            </h2>
            <p className="text-text-light/80 max-w-2xl mx-auto mb-10 md:mb-12 text-base md:text-lg">
              Appelez-nous au <span className="text-gold font-bold">438 493-1451</span> ou réservez en ligne en quelques clics
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
              <button
                onClick={() => router.push('/reservation')}
                className="bg-gold hover:bg-yellow-400 text-navy px-8 md:px-10 py-4 rounded-lg font-bold text-base md:text-lg transition transform hover:scale-105 hover:shadow-xl">
                RÉSERVER EN LIGNE
              </button>
              <button
                onClick={handlePhoneCall}
                className="border-2 border-gold text-gold hover:bg-gold/10 px-8 md:px-10 py-4 rounded-lg font-bold text-base md:text-lg transition">
                NOUS APPELER
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
