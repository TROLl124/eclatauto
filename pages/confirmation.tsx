import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Confirmation: NextPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 md:px-6 py-12">
        <div className="text-center max-w-2xl w-full">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-500 rounded-full mb-6">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gold mb-4">Réservation Confirmée!</h1>

          <p className="text-text-light mb-6 text-base md:text-lg">
            Merci! Votre réservation a été reçue avec succès.
          </p>

          <div className="bg-navy-light/30 border-2 border-gold rounded-lg p-6 md:p-8 mb-8">
            <p className="text-text-light/80 mb-4 text-sm md:text-base">
              Vous recevrez bientôt un email de confirmation à votre adresse couriel avec tous les détails de votre réservation.
            </p>
            <p className="text-text-light/80 text-sm md:text-base">
              Si vous avez des questions, n'hésitez pas à nous appeler au{' '}
              <a href="tel:438-493-1451" className="text-gold font-bold hover:text-yellow-400 transition">
                438 493-1451
              </a>
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="inline-block bg-gold hover:bg-yellow-400 text-navy px-8 py-3 rounded-lg font-bold transition transform hover:scale-105"
          >
            Retour à l'Accueil
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Confirmation;
