import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface Reservation {
  id: string;
  email: string;
  service: string;
  date: string;
  time?: string;
  status: 'pending' | 'confirmed' | 'completed';
  notes?: string;
  invoice?: string;
  pictures?: string[];
  comments?: string;
  technician?: string;
}

const CustomerDashboard: NextPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [expandedPhotos, setExpandedPhotos] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedEmail = localStorage.getItem('customerEmail');
      if (!storedEmail) {
        router.push('/customer/login');
        return;
      }
      setEmail(storedEmail);
      fetchReservations(storedEmail);
    };

    checkAuth();
  }, [router]);

  const fetchReservations = async (customerEmail: string) => {
    try {
      const res = await fetch(`/api/customer/reservations?email=${customerEmail}`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      } else {
        setError('Erreur lors du chargement des réservations');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerEmail');
    router.push('/customer/login');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white';
      case 'confirmed': return 'bg-blue-600 text-white';
      case 'pending':   return 'bg-yellow-600 text-white';
      default:          return 'bg-gray-600 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '✓ Complétée';
      case 'confirmed': return '✓ Acceptée';
      case 'pending':   return '⏳ En attente de confirmation';
      default:          return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-text-light text-xl">Chargement...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-text-light mb-2">
                Mon <span className="text-gold">Compte</span>
              </h1>
              <p className="text-text-light/60">{email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Déconnexion
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200 mb-6">
              {error}
            </div>
          )}

          {/* Reservations */}
          <div className="bg-navy-light/50 border-2 border-gold rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-text-light mb-6">
              Mes <span className="text-gold">Réservations</span>
            </h2>

            {reservations.length === 0 ? (
              <div className="text-text-light/60 text-center py-8">
                Aucune réservation pour le moment
              </div>
            ) : (
              <div className="space-y-6">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="bg-navy/50 border border-gold/30 rounded-xl p-6 space-y-4"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-text-light">{reservation.service}</h3>
                        <p className="text-text-light/60 text-sm mt-1">
                          {reservation.date}
                          {reservation.time ? ` à ${reservation.time}` : ''}
                        </p>
                      </div>
                      <span className={`${getStatusStyle(reservation.status)} px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                    </div>

                    {/* Status banner for confirmed */}
                    {reservation.status === 'confirmed' && (
                      <div className="bg-blue-900/40 border border-blue-500/50 rounded-lg px-4 py-3 text-blue-200 text-sm space-y-1">
                        <p>Votre réservation a été acceptée par l&apos;équipe. Nous avons hâte de vous accueillir !</p>
                        {reservation.technician && (
                          <p className="font-semibold text-blue-100">
                            👤 Votre technicien : <span className="text-white">{reservation.technician}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Customer notes */}
                    {reservation.notes && (
                      <p className="text-text-light/70 text-sm italic">"{reservation.notes}"</p>
                    )}

                    {/* Admin content (only show section if something exists) */}
                    {(reservation.comments || reservation.invoice || (reservation.pictures && reservation.pictures.length > 0)) && (
                      <div className="border-t border-gold/20 pt-4 space-y-4">
                        <p className="text-gold text-xs font-semibold uppercase tracking-wider">De l&apos;équipe</p>

                        {/* Admin comment */}
                        {reservation.comments && (
                          <div className="bg-navy/60 rounded-lg p-4">
                            <p className="text-gold text-xs font-semibold mb-1">Commentaire</p>
                            <p className="text-text-light text-sm whitespace-pre-wrap">{reservation.comments}</p>
                          </div>
                        )}

                        {/* Invoice + Photos links */}
                        <div className="flex gap-3 flex-wrap">
                          {reservation.invoice && (
                            <a
                              href={reservation.invoice}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-gold/20 hover:bg-gold/40 text-gold border border-gold rounded-lg px-4 py-2 text-sm transition"
                            >
                              📄 Voir la facture
                            </a>
                          )}

                          {reservation.pictures && reservation.pictures.length > 0 && (
                            <button
                              onClick={() =>
                                setExpandedPhotos(
                                  expandedPhotos === reservation.id ? null : reservation.id
                                )
                              }
                              className="flex items-center gap-2 bg-gold/20 hover:bg-gold/40 text-gold border border-gold rounded-lg px-4 py-2 text-sm transition"
                            >
                              🖼️ Photos ({reservation.pictures.length}){' '}
                              {expandedPhotos === reservation.id ? '▲' : '▼'}
                            </button>
                          )}
                        </div>

                        {/* Photo gallery */}
                        {expandedPhotos === reservation.id && reservation.pictures && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {reservation.pictures.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={url}
                                  alt={`Photo ${i + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-gold/30 hover:border-gold transition"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
