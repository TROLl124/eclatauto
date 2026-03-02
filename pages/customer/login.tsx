import type { NextPage } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const CustomerLogin: NextPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/customer/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          localStorage.setItem('customerEmail', email);
          router.push('/customer/dashboard');
        } else {
          const data = await res.json();
          setError(data.error || 'Erreur d\'inscription');
        }
      } else {
        const res = await fetch('/api/customer/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          localStorage.setItem('customerEmail', email);
          router.push('/customer/dashboard');
        } else {
          setError('Email ou mot de passe incorrect');
        }
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-navy-light/50 border-2 border-gold rounded-2xl p-8 backdrop-blur-sm">
            <h1 className="text-4xl font-bold text-text-light mb-2 text-center">
              {isSignUp ? 'Créer un compte' : 'Connexion'} <span className="text-gold">Client</span>
            </h1>
            <p className="text-text-light/60 text-center text-sm mb-8">
              {isSignUp ? 'Inscrivez-vous pour accéder à vos réservations' : 'Accédez à vos réservations'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-text-light font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre email"
                  className="w-full p-3 rounded-lg bg-navy/50 border-2 border-gold/50 text-text-light font-medium focus:outline-none focus:border-gold placeholder-text-light/40"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-text-light font-semibold mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le mot de passe"
                  className="w-full p-3 rounded-lg bg-navy/50 border-2 border-gold/50 text-text-light font-medium focus:outline-none focus:border-gold placeholder-text-light/40"
                  disabled={loading}
                  required
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-text-light font-semibold mb-2">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez le mot de passe"
                    className="w-full p-3 rounded-lg bg-navy/50 border-2 border-gold/50 text-text-light font-medium focus:outline-none focus:border-gold placeholder-text-light/40"
                    disabled={loading}
                    required
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-yellow-400 disabled:opacity-50 text-navy px-6 py-3 rounded-lg font-bold transition transform hover:scale-105"
              >
                {loading ? (isSignUp ? 'Inscription...' : 'Connexion...') : isSignUp ? 'S\'inscrire' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-gold/30 pt-6">
              <p className="text-text-light/60 text-sm mb-3">
                {isSignUp ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}
              </p>
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-gold hover:text-yellow-400 font-semibold text-sm transition"
              >
                {isSignUp ? 'Se connecter' : 'S\'inscrire'}
              </button>
            </div>

            <div className="mt-6 text-center border-t border-gold/30 pt-6">
              <p className="text-text-light/60 text-xs mb-2">Propriétaire ?</p>
              <a
                href="/login"
                className="text-gold hover:text-yellow-400 font-semibold text-xs transition"
              >
                Accédez à votre panel propriétaire
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLogin;
