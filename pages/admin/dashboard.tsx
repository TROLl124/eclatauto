import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const AdminDashboard: NextPage = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const menuItems = [
    {
      title: 'Gérer la Galerie',
      description: 'Ajouter ou supprimer des images de vos services',
      icon: '🖼️',
      href: '/admin/gallery',
    },
    {
      title: 'Réservations',
      description: 'Gérer les réservations et ajouter des factures/photos',
      icon: '📅',
      href: '/admin/reservations',
    },
    {
      title: 'Paramètres',
      description: 'Modifier les prix, formules et promotions',
      icon: '⚙️',
      href: '/admin/settings',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow py-12 px-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl font-bold text-text-light mb-2">
                Dashboard <span className="text-gold">Admin</span>
              </h1>
              <p className="text-text-light/60">Bienvenue, propriétaire !</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-text-light px-8 py-3 rounded-lg font-bold transition transform hover:scale-105"
            >
              Déconnexion
            </button>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => router.push(item.href)}
                className="border-2 border-gold hover:border-yellow-400 bg-gradient-to-br from-gold/10 to-transparent hover:from-gold/20 cursor-pointer hover:scale-105 transition transform rounded-2xl p-8"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h2 className="text-2xl font-bold text-text-light mb-2">{item.title}</h2>
                <p className="text-text-light/70 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Info */}
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-navy-light/50 border border-gold/50 rounded-xl p-6">
              <p className="text-text-light/60 text-sm mb-2">Statut du site</p>
              <p className="text-2xl font-bold text-gold">En ligne</p>
            </div>
            <div className="bg-navy-light/50 border border-gold/50 rounded-xl p-6">
              <p className="text-text-light/60 text-sm mb-2">Dernière mise à jour</p>
              <p className="text-lg font-bold text-text-light">{new Date().toLocaleDateString('fr-CA')}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
