import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Formula {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  featured: boolean;
  order: number;
}

const Reservation: NextPage = () => {
  const router = useRouter();
  const { service: initialService } = router.query;
  
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [formulasLoading, setFormulasLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    date: '',
    time: '',
    notes: ''
  });
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFormulas();
  }, []);

  const fetchFormulas = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setFormulas(data.formulas || []);
        if (data.formulas && data.formulas.length > 0) {
          setSelectedService(data.formulas[0].id);
        }
        setFormulasLoading(false);
      }
    } catch (err) {
      console.error('Error fetching formulas:', err);
      setFormulasLoading(false);
    }
  };

  useEffect(() => {
    const serviceParam = Array.isArray(initialService) ? initialService[0] : initialService;
    if (serviceParam && formulas.some(f => f.id === serviceParam)) {
      setSelectedService(serviceParam);
    } else if (formulas.length > 0 && !selectedService) {
      setSelectedService(formulas[0].id);
    }
  }, [initialService, formulas]);

  // Check available times when date changes
  useEffect(() => {
    if (formData.date) {
      checkAvailableTimes(formData.date);
    }
  }, [formData.date]);

  const checkAvailableTimes = async (date: string) => {
    try {
      const response = await fetch(`/api/availability?date=${date}`);
      const data = await response.json();
      
      if (response.ok) {
        setAvailableTimes(data.availableTimes);
        setFormData(prev => ({ ...prev, time: '' }));
      }
    } catch (err) {
      console.error('Error checking availability:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Ensure date is not in the past
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate >= today) {
      setFormData(prev => ({ ...prev, date: value }));
    } else {
      setError('La date sélectionnée ne peut pas être dans le passé');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Limit to 10 photos
    if (photos.length + files.length > 10) {
      setError('Maximum 10 photos autorisées');
      return;
    }

    setPhotos(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setError('');
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
          !formData.address || !formData.date || !formData.time) {
        setError('Tous les champs obligatoires doivent être remplis.');
        setLoading(false);
        return;
      }

      // Convert images to base64
      const photosBase64: Array<{ name: string; data: string; type: string }> = [];
      
      for (const photo of photos) {
        const reader = new FileReader();
        const promise = new Promise<void>((resolve) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            photosBase64.push({
              name: photo.name,
              data: base64,
              type: photo.type
            });
            resolve();
          };
        });
        reader.readAsDataURL(photo);
        await promise;
      }

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        service: selectedService,
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        photos: photosBase64
      };

      const response = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/confirmation');
        }, 2000);
      } else {
        setError(result.message || 'Erreur lors de la création de la réservation');
      }
    } catch (err) {
      setError('Erreur lors de la soumission. Veuillez réessayer.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
        <Header />
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gold mb-4">Réservation Confirmée!</h1>
            <p className="text-text-light mb-2">Votre réservation a été reçue avec succès.</p>
            <p className="text-text-light/70">Redirection en cours...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentFormula = formulas.find(f => f.id === selectedService);

  if (formulasLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
        <Header />
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="text-text-light">Chargement des formules...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (formulas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
        <Header />
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="text-text-light">Aucune formule disponible pour le moment.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-black text-gold mb-2">Nouvelle Réservation</h1>
          <p className="text-text-light/80 mb-8">Remplissez le formulaire ci-dessous pour confirmer votre réservation</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-red-400">
                    {error}
                  </div>
                )}

                {/* Personal Information */}
                <div className="bg-navy-light/30 border border-gold/20 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gold mb-4">Informations Personnelles</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Prénom *"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light placeholder-text-light/50 focus:outline-none focus:border-gold"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Nom *"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light placeholder-text-light/50 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <input
                      type="email"
                      name="email"
                      placeholder="Adresse couriel *"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light placeholder-text-light/50 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Numéro de téléphone *"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light placeholder-text-light/50 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-navy-light/30 border border-gold/20 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gold mb-4">Adresse</h2>
                  
                  <div className="mb-4">
                    <input
                      type="text"
                      name="address"
                      placeholder="Adresse *"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light placeholder-text-light/50 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="Ville"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light placeholder-text-light/50 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Code postal"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light placeholder-text-light/50 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Date & Time Selection */}
                <div className="bg-navy-light/30 border border-gold/20 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gold mb-4">Date et Heure</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-text-light/80 text-sm mb-2">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleDateChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light focus:outline-none focus:border-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-text-light/80 text-sm mb-2">Heure *</label>
                      <select
                        name="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light focus:outline-none focus:border-gold"
                        required
                        disabled={!formData.date || availableTimes.length === 0}
                      >
                        <option value="">Sélectionner une heure</option>
                        {availableTimes.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {formData.date && availableTimes.length === 0 && (
                    <p className="text-amber-400 text-sm">Aucun créneau disponible pour cette date</p>
                  )}
                </div>

                {/* Photos Upload */}
                <div className="bg-navy-light/30 border border-gold/20 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gold mb-4">Photos du Véhicule</h2>
                  <p className="text-text-light/70 text-sm mb-4">Ajoutez des photos de votre véhicule (maximum 10 fichiers, tous formats acceptés)</p>
                  
                  <div className="mb-4">
                    <label className="block w-full border-2 border-dashed border-gold/40 rounded-lg p-6 text-center cursor-pointer hover:border-gold/80 transition">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-text-light font-semibold">Cliquez ou déposez des fichiers</p>
                      <p className="text-text-light/60 text-sm">Compatible mobile</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Photo Previews */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img src={url} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded border border-gold/30" />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-text-light/60 text-sm mt-4">{photos.length}/10 photos ajoutées</p>
                </div>

                {/* Notes */}
                <div className="bg-navy-light/30 border border-gold/20 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gold mb-4">Remarques Additionnelles</h2>
                  <textarea
                    name="notes"
                    placeholder="Des détails particuliers? (Problèmes spécifiques, préférences, etc.)"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light placeholder-text-light/50 focus:outline-none focus:border-gold h-24 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold hover:bg-yellow-400 disabled:bg-gray-600 text-navy py-4 rounded-lg font-bold text-lg transition transform hover:scale-105"
                >
                  {loading ? 'Soumission en cours...' : 'Confirmer la Réservation'}
                </button>
              </form>
            </div>

            {/* Service Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-navy-light/30 border-2 border-gold rounded-lg p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gold mb-6">Résumé</h3>

                {/* Change Service */}
                <div className="mb-6">
                  <p className="text-text-light/80 text-sm mb-3">Changer de formule:</p>
                  <div className="space-y-2">
                    {formulas.map((formula) => (
                      <button
                        key={formula.id}
                        onClick={() => setSelectedService(formula.id)}
                        className={`w-full text-left p-3 rounded border transition ${
                          selectedService === formula.id
                            ? 'bg-gold/30 border-gold text-gold font-semibold'
                            : 'bg-navy/50 border-gold/30 text-text-light/80 hover:border-gold/80'
                        }`}
                      >
                        <p className="font-semibold">{formula.name}</p>
                        <p className="text-sm">${formula.price.toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Service Details */}
                {currentFormula && (
                  <div className="border-t border-gold/30 pt-6">
                    <h4 className="text-text-light font-bold mb-3">Service Sélectionné</h4>
                    <p className="text-gold text-2xl font-bold mb-2">${currentFormula.price.toFixed(2)}</p>
                    <p className="text-text-light font-semibold mb-2">{currentFormula.name}</p>
                    <p className="text-text-light/70 text-sm mb-6">{currentFormula.description}</p>

                    {/* Reservation Summary */}
                    <div className="bg-navy/50 rounded p-4 space-y-3 text-sm">
                      {formData.firstName && (
                        <div>
                          <p className="text-text-light/60">Nom</p>
                          <p className="text-text-light font-semibold">{formData.firstName} {formData.lastName}</p>
                        </div>
                      )}
                      {formData.email && (
                        <div>
                          <p className="text-text-light/60">Email</p>
                          <p className="text-text-light font-semibold break-all">{formData.email}</p>
                        </div>
                      )}
                      {formData.phone && (
                        <div>
                          <p className="text-text-light/60">Téléphone</p>
                          <p className="text-text-light font-semibold">{formData.phone}</p>
                        </div>
                      )}
                      {formData.date && formData.time && (
                        <div>
                          <p className="text-text-light/60">Date et Heure</p>
                          <p className="text-text-light font-semibold">{new Date(formData.date).toLocaleDateString('fr-CA')} à {formData.time}</p>
                        </div>
                      )}
                    </div>
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

export default Reservation;
