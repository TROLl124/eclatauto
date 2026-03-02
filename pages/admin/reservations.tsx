import type { NextPage, GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { verifyAdminAuth } = await import('../../lib/auth');
  if (!verifyAdminAuth(req as any)) {
    return { redirect: { destination: '/login?redirect=/admin/reservations', permanent: false } };
  }
  return { props: {} };
};

interface Reservation {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  service: string;
  date: string;
  time?: string;
  notes?: string;
  photos?: string[];
  status: 'pending' | 'confirmed' | 'completed';
  createdAt?: string;
  invoice?: string;
  pictures?: string[];
  comments?: string;
  technician?: string;
}

const ReservationsManager: NextPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [pictureFiles, setPictureFiles] = useState<File[]>([]);
  const [comments, setComments] = useState('');
  const [technician, setTechnician] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const fileData = await Promise.all(
      files.map(async (f) => ({ name: f.name, data: await fileToBase64(f), type: f.type }))
    );
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: fileData }),
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.urls as string[];
  };

  const patchReservation = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Patch failed');
    const updated: Reservation = await res.json();
    setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
    setSelectedReservation(updated);
    return updated;
  };

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/admin/reservations');
      if (res.ok) setReservations(await res.json());
      else setError('Erreur lors du chargement des réservations');
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // ── Selection ─────────────────────────────────────────────────────────────
  const selectReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setInvoiceUrl(reservation.invoice || '');
    setInvoiceFile(null);
    setPictureFiles([]);
    setComments(reservation.comments || '');
    setTechnician(reservation.technician || '');
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAccept = async () => {
    if (!selectedReservation) return;
    setSaving(true);
    try { await patchReservation(selectedReservation.id, { status: 'confirmed' }); }
    catch { setError('Erreur lors de la mise à jour'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedReservation) return;
    setSaving(true);
    try { await patchReservation(selectedReservation.id, { status: newStatus }); }
    catch { setError('Erreur lors de la mise à jour'); }
    finally { setSaving(false); }
  };

  const handleSaveInvoice = async () => {
    if (!selectedReservation) return;
    setSaving(true);
    try {
      let url = invoiceUrl.trim();
      if (invoiceFile) {
        const [uploaded] = await uploadFiles([invoiceFile]);
        url = uploaded;
        setInvoiceUrl(uploaded);
        setInvoiceFile(null);
      }
      await patchReservation(selectedReservation.id, { invoice: url });
    } catch {
      setError("Erreur lors de l'upload ou de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePictures = async () => {
    if (!selectedReservation) return;
    setSaving(true);
    try {
      let urls: string[] = [];
      if (pictureFiles.length > 0) {
        urls = await uploadFiles(pictureFiles);
        setPictureFiles([]);
      }
      // Append to existing pictures
      const existing = selectedReservation.pictures || [];
      await patchReservation(selectedReservation.id, { pictures: [...existing, ...urls] });
    } catch {
      setError("Erreur lors de l'upload des photos");
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePicture = async (index: number) => {
    if (!selectedReservation) return;
    const updated = (selectedReservation.pictures || []).filter((_, i) => i !== index);
    setSaving(true);
    try { await patchReservation(selectedReservation.id, { pictures: updated }); }
    catch { setError('Erreur lors de la suppression'); }
    finally { setSaving(false); }
  };

  const handleSaveComments = async () => {
    if (!selectedReservation) return;
    setSaving(true);
    try { await patchReservation(selectedReservation.id, { comments: comments.trim() }); }
    catch { setError('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const handleSaveTechnician = async () => {
    if (!selectedReservation) return;
    setSaving(true);
    try { await patchReservation(selectedReservation.id, { technician: technician.trim() }); }
    catch { setError('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette réservation ?')) return;
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, { method: 'DELETE' });
      if (res.ok) { setReservations((prev) => prev.filter((r) => r.id !== id)); setSelectedReservation(null); }
    } catch { setError('Erreur de connexion'); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-text-light mb-8">
            Gestion des <span className="text-gold">Réservations</span>
          </h1>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200 mb-6">
              {error}
              <button onClick={() => setError('')} className="ml-4 text-red-400 hover:text-red-200">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* === Left: 3 status boxes === */}
            <div className="lg:col-span-2 space-y-5">

              {/* En attente */}
              {(() => {
                const list = reservations.filter((r) => r.status === 'pending');
                return (
                  <div className="bg-navy-light/50 border-2 border-yellow-500/70 rounded-2xl p-5 backdrop-blur-sm">
                    <h2 className="text-base font-bold text-yellow-400 mb-4 flex items-center gap-2">
                      ⏳ En attente
                      <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">{list.length}</span>
                    </h2>
                    {list.length === 0
                      ? <p className="text-text-light/40 text-sm text-center py-3">Aucune</p>
                      : <div className="space-y-2">{list.map((r) => (
                          <div key={r.id} onClick={() => selectReservation(r)}
                            className={`bg-navy/50 border rounded-lg p-3 cursor-pointer transition ${selectedReservation?.id === r.id ? 'border-yellow-400' : 'border-yellow-500/30 hover:border-yellow-400/70'}`}>
                            <p className="text-text-light font-semibold text-sm truncate">{r.firstName ? `${r.firstName} ${r.lastName || ''}` : r.email}</p>
                            <p className="text-text-light/50 text-xs truncate">{r.service}</p>
                            <p className="text-text-light/50 text-xs">{r.date}{r.time ? ` à ${r.time}` : ''}</p>
                          </div>
                        ))}</div>
                    }
                  </div>
                );
              })()}

              {/* Acceptées */}
              {(() => {
                const list = reservations.filter((r) => r.status === 'confirmed');
                return (
                  <div className="bg-navy-light/50 border-2 border-blue-500/70 rounded-2xl p-5 backdrop-blur-sm">
                    <h2 className="text-base font-bold text-blue-400 mb-4 flex items-center gap-2">
                      ✓ Acceptées
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{list.length}</span>
                    </h2>
                    {list.length === 0
                      ? <p className="text-text-light/40 text-sm text-center py-3">Aucune</p>
                      : <div className="space-y-2">{list.map((r) => (
                          <div key={r.id} onClick={() => selectReservation(r)}
                            className={`bg-navy/50 border rounded-lg p-3 cursor-pointer transition ${selectedReservation?.id === r.id ? 'border-blue-400' : 'border-blue-500/30 hover:border-blue-400/70'}`}>
                            <p className="text-text-light font-semibold text-sm truncate">{r.firstName ? `${r.firstName} ${r.lastName || ''}` : r.email}</p>
                            <p className="text-text-light/50 text-xs truncate">{r.service}</p>
                            <p className="text-text-light/50 text-xs">{r.date}{r.time ? ` à ${r.time}` : ''}</p>
                          </div>
                        ))}</div>
                    }
                  </div>
                );
              })()}

              {/* Complétées */}
              {(() => {
                const list = reservations.filter((r) => r.status === 'completed');
                return (
                  <div className="bg-navy-light/50 border-2 border-green-500/70 rounded-2xl p-5 backdrop-blur-sm">
                    <h2 className="text-base font-bold text-green-400 mb-4 flex items-center gap-2">
                      ✔ Complétées
                      <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">{list.length}</span>
                    </h2>
                    {list.length === 0
                      ? <p className="text-text-light/40 text-sm text-center py-3">Aucune</p>
                      : <div className="space-y-2">{list.map((r) => (
                          <div key={r.id} onClick={() => selectReservation(r)}
                            className={`bg-navy/50 border rounded-lg p-3 cursor-pointer transition ${selectedReservation?.id === r.id ? 'border-green-400' : 'border-green-500/30 hover:border-green-400/70'}`}>
                            <p className="text-text-light font-semibold text-sm truncate">{r.firstName ? `${r.firstName} ${r.lastName || ''}` : r.email}</p>
                            <p className="text-text-light/50 text-xs truncate">{r.service}</p>
                            <p className="text-text-light/50 text-xs">{r.date}{r.time ? ` à ${r.time}` : ''}</p>
                          </div>
                        ))}</div>
                    }
                  </div>
                );
              })()}
            </div>

            {/* === Right: Details panel === */}
            <div className="lg:col-span-3">
              {selectedReservation ? (
                <div className="bg-navy-light/50 border-2 border-gold rounded-2xl p-6 backdrop-blur-sm space-y-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gold">Détails de la réservation</h3>
                    <button onClick={() => handleDelete(selectedReservation.id)}
                      className="text-red-400 hover:text-red-300 text-sm border border-red-400/50 hover:border-red-300 px-3 py-1 rounded-lg transition">
                      Supprimer
                    </button>
                  </div>

                  {/* Client Info */}
                  <div className="bg-navy/40 rounded-xl p-4 space-y-1">
                    <p className="text-gold font-semibold text-sm mb-2">Client</p>
                    {selectedReservation.firstName && (
                      <p className="text-text-light text-sm"><span className="text-text-light/50">Nom :</span> {selectedReservation.firstName} {selectedReservation.lastName}</p>
                    )}
                    <p className="text-text-light text-sm"><span className="text-text-light/50">Email :</span> {selectedReservation.email}</p>
                    {selectedReservation.phone && <p className="text-text-light text-sm"><span className="text-text-light/50">Téléphone :</span> {selectedReservation.phone}</p>}
                    {selectedReservation.address && <p className="text-text-light text-sm"><span className="text-text-light/50">Adresse :</span> {selectedReservation.address}, {selectedReservation.city} {selectedReservation.postalCode}</p>}
                  </div>

                  {/* Service Info */}
                  <div className="bg-navy/40 rounded-xl p-4 space-y-1">
                    <p className="text-gold font-semibold text-sm mb-2">Service</p>
                    <p className="text-text-light text-sm"><span className="text-text-light/50">Service :</span> {selectedReservation.service}</p>
                    <p className="text-text-light text-sm"><span className="text-text-light/50">Date :</span> {selectedReservation.date}{selectedReservation.time ? ` à ${selectedReservation.time}` : ''}</p>
                    {selectedReservation.notes && <p className="text-text-light text-sm"><span className="text-text-light/50">Notes :</span> {selectedReservation.notes}</p>}
                  </div>

                  {/* Customer Photos */}
                  {selectedReservation.photos && selectedReservation.photos.length > 0 && (
                    <div className="bg-navy/40 rounded-xl p-4">
                      <p className="text-gold font-semibold text-sm mb-3">Photos du client ({selectedReservation.photos.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedReservation.photos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Photo ${i + 1}`} className="w-full h-20 object-cover rounded-lg border border-gold/30 hover:border-gold transition" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="bg-navy/40 rounded-xl p-4 space-y-3">
                    <p className="text-gold font-semibold text-sm">Statut</p>
                    {selectedReservation.status === 'pending' && (
                      <button onClick={handleAccept} disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2 rounded-lg font-bold transition">
                        ✓ Accepter la réservation
                      </button>
                    )}
                    <select value={selectedReservation.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={saving}
                      className="w-full p-2 rounded-lg bg-navy/50 border-2 border-gold/50 text-text-light focus:outline-none focus:border-gold">
                      <option value="pending">En attente</option>
                      <option value="confirmed">Acceptée</option>
                      <option value="completed">Complétée</option>
                    </select>

                    {/* Technicien assigné */}
                    <div className="pt-1 space-y-2">
                      <label className="text-text-light/70 text-xs font-semibold uppercase tracking-wide">
                        Technicien assigné
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={technician}
                          onChange={(e) => setTechnician(e.target.value)}
                          placeholder="ex: Samuel"
                          className="flex-1 p-2 rounded-lg bg-navy/50 border-2 border-gold/50 text-text-light text-sm focus:outline-none focus:border-gold placeholder-text-light/40"
                        />
                        <button
                          onClick={handleSaveTechnician}
                          disabled={saving}
                          className="bg-gold/20 hover:bg-gold/40 disabled:opacity-50 text-gold border border-gold rounded-lg px-3 text-sm font-semibold transition"
                        >
                          Sauver
                        </button>
                      </div>
                      {selectedReservation.technician && (
                        <p className="text-blue-300 text-xs">
                          ✓ Assigné à <span className="font-bold">{selectedReservation.technician}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Invoice */}
                  <div className="bg-navy/40 rounded-xl p-4 space-y-3">
                    <p className="text-gold font-semibold text-sm">Facture</p>

                    {/* File upload zone */}
                    <label className="block cursor-pointer">
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${invoiceFile ? 'border-gold bg-gold/10' : 'border-gold/30 hover:border-gold/60'}`}>
                        <p className="text-sm">
                          {invoiceFile
                            ? <span className="text-gold font-semibold">📎 {invoiceFile.name}</span>
                            : <span className="text-text-light/50">📤 Importer un fichier (PDF, image)</span>}
                        </p>
                      </div>
                      <input type="file" accept=".pdf,image/*" className="hidden"
                        onChange={(e) => { setInvoiceFile(e.target.files?.[0] || null); setInvoiceUrl(''); }} />
                    </label>

                    {invoiceFile && (
                      <button onClick={() => setInvoiceFile(null)} className="text-red-400 text-xs hover:text-red-300">✕ Retirer le fichier</button>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gold/20" />
                      <span className="text-text-light/40 text-xs">ou lien URL</span>
                      <div className="flex-1 h-px bg-gold/20" />
                    </div>

                    <input type="url" value={invoiceUrl} onChange={(e) => { setInvoiceUrl(e.target.value); setInvoiceFile(null); }}
                      placeholder="https://..."
                      className="w-full p-2 rounded-lg bg-navy/50 border-2 border-gold/50 text-text-light text-sm focus:outline-none focus:border-gold placeholder-text-light/40" />

                    <button onClick={handleSaveInvoice} disabled={saving || (!invoiceFile && !invoiceUrl.trim())}
                      className="w-full bg-gold/20 hover:bg-gold/40 disabled:opacity-40 text-gold border border-gold rounded-lg py-2 font-semibold transition">
                      {saving ? 'Envoi...' : 'Sauvegarder la facture'}
                    </button>

                    {selectedReservation.invoice && (
                      <a href={selectedReservation.invoice} target="_blank" rel="noopener noreferrer"
                        className="text-gold text-sm hover:underline block">
                        ✓ Facture enregistrée — voir
                      </a>
                    )}
                  </div>

                  {/* Admin Photos */}
                  <div className="bg-navy/40 rounded-xl p-4 space-y-3">
                    <p className="text-gold font-semibold text-sm">Photos (admin)</p>

                    {/* File upload zone */}
                    <label className="block cursor-pointer">
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${pictureFiles.length > 0 ? 'border-gold bg-gold/10' : 'border-gold/30 hover:border-gold/60'}`}>
                        <p className="text-sm">
                          {pictureFiles.length > 0
                            ? <span className="text-gold font-semibold">🖼️ {pictureFiles.length} photo(s) sélectionnée(s)</span>
                            : <span className="text-text-light/50">📤 Importer des photos (ordinateur ou téléphone)</span>}
                        </p>
                      </div>
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => setPictureFiles(Array.from(e.target.files || []))} />
                    </label>

                    {/* Preview selected files */}
                    {pictureFiles.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {pictureFiles.map((file, i) => (
                          <img key={i} src={URL.createObjectURL(file)} alt={file.name}
                            className="w-full h-16 object-cover rounded-lg border border-gold/50" />
                        ))}
                      </div>
                    )}

                    {pictureFiles.length > 0 && (
                      <button onClick={() => setPictureFiles([])} className="text-red-400 text-xs hover:text-red-300">✕ Retirer la sélection</button>
                    )}

                    <button onClick={handleSavePictures} disabled={saving || pictureFiles.length === 0}
                      className="w-full bg-gold/20 hover:bg-gold/40 disabled:opacity-40 text-gold border border-gold rounded-lg py-2 font-semibold transition">
                      {saving ? 'Envoi...' : 'Sauvegarder les photos'}
                    </button>

                    {/* Existing pictures */}
                    {selectedReservation.pictures && selectedReservation.pictures.length > 0 && (
                      <div>
                        <p className="text-text-light/50 text-xs mb-2">Photos enregistrées ({selectedReservation.pictures.length})</p>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedReservation.pictures.map((url, i) => (
                            <div key={i} className="relative group">
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-20 object-cover rounded-lg border border-gold/30 hover:border-gold transition" />
                              </a>
                              <button onClick={() => handleRemovePicture(i)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="bg-navy/40 rounded-xl p-4 space-y-2">
                    <p className="text-gold font-semibold text-sm">Commentaire (visible par le client)</p>
                    <textarea value={comments} onChange={(e) => setComments(e.target.value)}
                      placeholder="Ajouter un commentaire pour le client..." rows={4}
                      className="w-full p-2 rounded-lg bg-navy/50 border-2 border-gold/50 text-text-light text-sm focus:outline-none focus:border-gold placeholder-text-light/40" />
                    <button onClick={handleSaveComments} disabled={saving}
                      className="w-full bg-gold/20 hover:bg-gold/40 disabled:opacity-50 text-gold border border-gold rounded-lg py-2 font-semibold transition">
                      Sauvegarder le commentaire
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-navy-light/50 border-2 border-gold/30 rounded-2xl p-8 text-text-light/60 text-center h-48 flex items-center justify-center">
                  Sélectionnez une réservation pour voir les détails
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReservationsManager;
