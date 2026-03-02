import type { NextPage } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow py-10 md:py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          <p className="text-gold text-xs md:text-sm font-bold tracking-widest mb-4">NOUS JOINDRE</p>
          <h1 className="text-3xl md:text-5xl font-black text-text-light mb-8">
            Contact<span className="text-gold">.</span>
          </h1>

          <div className="space-y-4">
            <div className="bg-navy-light/30 border border-gold/20 rounded-xl p-5 md:p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-text-light/60 text-xs md:text-sm mb-1">Téléphone</p>
                <a href="tel:438-493-1451" className="text-text-light font-bold text-lg md:text-xl hover:text-gold transition">
                  438 493-1451
                </a>
              </div>
            </div>

            <div className="bg-navy-light/30 border border-gold/20 rounded-xl p-5 md:p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-text-light/60 text-xs md:text-sm mb-1">Zone de service</p>
                <p className="text-text-light font-bold text-lg md:text-xl">Saint-Pie, QC</p>
              </div>
            </div>

            <div className="bg-navy-light/30 border border-gold/20 rounded-xl p-5 md:p-6">
              <p className="text-text-light/80 text-sm md:text-base leading-relaxed">
                Pour toute question ou demande de renseignements, n'hésitez pas à nous appeler. Nous sommes disponibles pour répondre à vos questions et planifier votre prochain lavage.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
