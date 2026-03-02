import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import type { NextPage, GetServerSideProps } from 'next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { verifyAdminAuth } = await import('../../lib/auth');
  if (!verifyAdminAuth(req as any)) {
    return { redirect: { destination: '/login?redirect=/admin/gallery', permanent: false } };
  }
  return { props: {} };
};

interface GalleryImage {
  id: number;
  url: string;
  title: string;
  description: string;
}

const AdminGallery: NextPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { loadGallery(); }, []);

  const loadGallery = async () => {
    try {
      const res = await fetch('/api/gallery/list');
      setImages(await res.json());
    } catch {
      setMessage('Erreur lors du chargement de la galerie');
    }
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      if (!newTitle) setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFileChange(file);
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { setMessage('Veuillez sélectionner une image'); return; }
    if (!newTitle.trim()) { setMessage('Le titre est requis'); return; }

    setLoading(true);
    setMessage('');
    try {
      // 1. Upload file
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: [{ name: selectedFile.name, data: base64, type: selectedFile.type }] }),
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const { urls } = await uploadRes.json();

      // 2. Save to gallery
      const addRes = await fetch('/api/gallery/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urls[0], title: newTitle.trim(), description: newDescription.trim() }),
      });

      if (!addRes.ok) throw new Error('Add failed');

      setSelectedFile(null);
      setPreview(null);
      setNewTitle('');
      setNewDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMessage('Image ajoutée avec succès !');
      loadGallery();
    } catch {
      setMessage("Erreur lors de l'ajout de l'image");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm('Supprimer cette image de la galerie ?')) return;
    try {
      const res = await fetch('/api/gallery/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) { setMessage('Image supprimée'); loadGallery(); }
      else setMessage('Erreur lors de la suppression');
    } catch {
      setMessage('Erreur de connexion');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow py-12 px-6">
        <div className="container mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-text-light mb-2">
                Gérer la <span className="text-gold">Galerie</span>
              </h1>
              <p className="text-text-light/60">{images.length} image(s) dans la galerie</p>
            </div>
            <button onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition">
              Déconnexion
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('Erreur') ? 'bg-red-900/30 border border-red-500 text-red-200' : 'bg-green-900/30 border border-green-500 text-green-200'}`}>
              {message}
              <button onClick={() => setMessage('')} className="ml-4 opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Add Image Form */}
            <div className="lg:col-span-1">
              <div className="bg-navy-light/50 border-2 border-gold rounded-2xl p-6 sticky top-4">
                <h2 className="text-xl font-bold text-text-light mb-5">
                  Ajouter une <span className="text-gold">image</span>
                </h2>

                <form onSubmit={handleAddImage} className="space-y-4">

                  {/* Drop zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl cursor-pointer transition overflow-hidden ${
                      selectedFile ? 'border-gold' : 'border-gold/30 hover:border-gold/70'
                    }`}
                  >
                    {preview ? (
                      <img src={preview} alt="Aperçu" className="w-full h-auto" />
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-4xl mb-3">📷</p>
                        <p className="text-text-light/60 text-sm">
                          Cliquez ou glissez une image ici
                        </p>
                        <p className="text-text-light/30 text-xs mt-1">
                          Ordinateur ou téléphone
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />

                  {selectedFile && (
                    <button type="button" onClick={() => handleFileChange(null)}
                      className="text-red-400 text-xs hover:text-red-300">
                      ✕ Retirer l'image
                    </button>
                  )}

                  <div>
                    <label className="block text-text-light/70 text-xs font-semibold mb-1 uppercase tracking-wide">Titre *</label>
                    <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ex: Détailing intérieur complet"
                      className="w-full p-2 rounded-lg bg-navy/50 border border-gold/50 text-text-light text-sm focus:outline-none focus:border-gold placeholder-text-light/30"
                      disabled={loading} />
                  </div>

                  <div>
                    <label className="block text-text-light/70 text-xs font-semibold mb-1 uppercase tracking-wide">Description</label>
                    <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Description optionnelle..." rows={2}
                      className="w-full p-2 rounded-lg bg-navy/50 border border-gold/50 text-text-light text-sm focus:outline-none focus:border-gold placeholder-text-light/30"
                      disabled={loading} />
                  </div>

                  <button type="submit" disabled={loading || !selectedFile}
                    className="w-full bg-gold hover:bg-yellow-400 disabled:opacity-40 text-navy px-4 py-2 rounded-lg font-bold transition">
                    {loading ? 'Envoi en cours...' : 'Ajouter à la galerie'}
                  </button>
                </form>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="lg:col-span-2">
              <div className="bg-navy-light/50 border-2 border-gold rounded-2xl p-6">
                <h2 className="text-xl font-bold text-text-light mb-5">Images de la galerie</h2>

                {images.length === 0 ? (
                  <p className="text-text-light/50 text-center py-12">Aucune image dans la galerie</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {images.map((image) => (
                      <div key={image.id} className="border border-gold/40 rounded-xl overflow-hidden hover:border-gold transition group">
                        <img src={image.url} alt={image.title} className="w-full h-auto" />
                        <div className="p-3 bg-navy/60">
                          <p className="text-text-light font-semibold text-sm">{image.title}</p>
                          {image.description && <p className="text-text-light/50 text-xs mt-0.5">{image.description}</p>}
                          <button onClick={() => handleDeleteImage(image.id)}
                            className="mt-3 w-full bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-semibold transition">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminGallery;
