import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface GalleryImage {
  id: number;
  url: string;
  title: string;
  description: string;
}

const Gallery: NextPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const res = await fetch('/api/gallery/list');
        const data = await res.json();
        setImages(data);
      } catch (err) {
        console.error('Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow py-16 px-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="text-gold text-sm font-bold tracking-widest mb-4">NOS RÉALISATIONS</p>
            <h1 className="text-5xl font-bold text-text-light mb-4">
              Galerie de nos <span className="text-gold">Services</span>
            </h1>
            <p className="text-text-light/70 max-w-2xl">
              Découvrez nos réalisations et la qualité de nos services de détailing et lavage automobile.
            </p>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-text-light">Chargement de la galerie...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 bg-navy-light/30 border border-gold/30 rounded-lg">
              <p className="text-text-light/60">Aucune image dans la galerie pour le moment</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group break-inside-avoid bg-navy-light/50 border border-gold/30 rounded-2xl overflow-hidden hover:border-gold transition"
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-auto"
                  />
                  <div className="p-5">
                    <h3 className="text-text-light font-bold text-lg mb-1 group-hover:text-gold transition">
                      {image.title}
                    </h3>
                    {image.description && (
                      <p className="text-text-light/70 text-sm">{image.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
