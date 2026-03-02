import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Confirmation: NextPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-gold mb-4">Réservation Confirmée!</h1>
          
          <p className="text-text-light mb-6 text-lg">
            Merci! Votre réservation a été reçue avec succès.
          </p>
          
          <div className="bg-navy-light/30 border-2 border-gold rounded-lg p-8 mb-8">
            <p className="text-text-light/80 mb-4">
              Vous recevrez bientôt un email de confirmation à votre adresse couriel avec tous les détails de votre réservation.
            </p>
            <p className="text-text-light/80 mb-4">
              Si vous avez des questions, n'hésitez pas à nous appeler au <span className="text-gold font-bold">438 493-1451</span>
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/')}
              className="inline-block bg-gold hover:bg-yellow-400 text-navy px-8 py-3 rounded-lg font-bold transition transform hover:scale-105"
            >
              Retour à l'Accueil
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Confirmation;
