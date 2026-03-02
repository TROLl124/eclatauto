import type { NextPage } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold text-gold mb-8">Contact</h1>
        <p className="text-text-light mb-4">
          Pour toute question, envoyez un courriel ou appelez-nous au 438 493-1451.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
