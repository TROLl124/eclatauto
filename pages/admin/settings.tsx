import type { NextPage } from 'next';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface Formula {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  featured: boolean;
  order: number;
}

interface Settings {
  promotion: {
    name: string;
    active: boolean;
    description: string;
  };
  formulas: Formula[];
  businessHours: {
    start: number;
    end: number;
    lunchStart: number;
    lunchEnd: number;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

const AdminSettings: NextPage = () => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [showFormulaForm, setShowFormulaForm] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setLoading(false);
      }
    } catch (err) {
      setError('Erreur lors du chargement des paramètres');
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSuccess('Paramètres sauvegardés avec succès!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updatePromotion = (field: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      promotion: { ...settings.promotion, [field]: value }
    });
  };

  const updateFormula = (field: string, value: any) => {
    if (!editingFormula) return;
    setEditingFormula({ ...editingFormula, [field]: value });
  };

  const saveFormula = () => {
    if (!editingFormula || !settings) return;

    const formulaIndex = settings.formulas.findIndex(f => f.id === editingFormula.id);

    if (formulaIndex >= 0) {
      // Update existing
      const newFormulas = [...settings.formulas];
      newFormulas[formulaIndex] = editingFormula;
      setSettings({ ...settings, formulas: newFormulas });
    } else {
      // Add new
      const newFormulas = [...settings.formulas, editingFormula];
      setSettings({ ...settings, formulas: newFormulas });
    }

    setEditingFormula(null);
    setShowFormulaForm(false);
    setSuccess('Formule mise à jour!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const deleteFormula = (id: string) => {
    if (!settings) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formule?')) {
      setSettings({
        ...settings,
        formulas: settings.formulas.filter(f => f.id !== id)
      });
    }
  };

  const addFeature = () => {
    if (!editingFormula || !newFeature.trim()) return;
    setEditingFormula({
      ...editingFormula,
      features: [...editingFormula.features, newFeature]
    });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    if (!editingFormula) return;
    setEditingFormula({
      ...editingFormula,
      features: editingFormula.features.filter((_, i) => i !== index)
    });
  };

  const startNewFormula = () => {
    setEditingFormula({
      id: `formula_${Date.now()}`,
      name: '',
      price: 0,
      description: '',
      features: [],
      featured: false,
      order: (settings?.formulas.length || 0) + 1
    });
    setShowFormulaForm(true);
  };

  const startEditFormula = (formula: Formula) => {
    setEditingFormula({ ...formula });
    setShowFormulaForm(true);
  };

  const moveFormula = (fromIndex: number, direction: 'up' | 'down') => {
    if (!settings) return;
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= settings.formulas.length) return;

    const newFormulas = [...settings.formulas];
    [newFormulas[fromIndex], newFormulas[toIndex]] = [newFormulas[toIndex], newFormulas[fromIndex]];

    // Update order numbers
    newFormulas.forEach((f, i) => {
      f.order = i + 1;
    });

    setSettings({ ...settings, formulas: newFormulas });
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-text-light">Chargement...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-red-400">Erreur lors du chargement des paramètres</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy via-navy-dark to-navy">
      <Header />
      <main className="flex-grow py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-black text-gold">Paramètres</h1>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-text-light hover:text-gold transition"
            >
              ← Retour
            </button>
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-red-400 mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-4 text-green-400 mb-6">
              {success}
            </div>
          )}

          {/* Promotion Section */}
          <div className="bg-navy-light/30 border border-gold/20 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gold mb-6">Promotion Active</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-text-light/80 text-sm mb-2">Nom de la Promotion</label>
                <input
                  type="text"
                  value={settings.promotion.name}
                  onChange={(e) => updatePromotion('name', e.target.value)}
                  className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-text-light/80 text-sm mb-2">Description</label>
                <textarea
                  value={settings.promotion.description}
                  onChange={(e) => updatePromotion('description', e.target.value)}
                  className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light focus:outline-none focus:border-gold h-24 resize-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-text-light/80 text-sm">Promotion Active</label>
                <button
                  onClick={() => updatePromotion('active', !settings.promotion.active)}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.promotion.active ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                    settings.promotion.active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Formulas Section */}
          <div className="bg-navy-light/30 border border-gold/20 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gold">Formules de Service</h2>
              <button
                onClick={startNewFormula}
                className="bg-gold hover:bg-yellow-400 text-navy py-2 px-6 rounded-lg font-bold text-sm transition"
              >
                + Ajouter une Formule
              </button>
            </div>

            {/* Horizontal Scroll Container */}
            {settings.formulas.length > 0 && (
              <div className="relative">
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gold/80 hover:bg-gold text-navy p-2 rounded-full transition"
                >
                  ←
                </button>

                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto pb-4 scroll-smooth px-12"
                >
                  {settings.formulas.map((formula, index) => (
                    <div
                      key={formula.id}
                      className="flex-shrink-0 w-80 bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-lg p-4"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gold mb-1">{formula.name}</h3>
                        <p className="text-gold text-2xl font-bold">${formula.price.toFixed(2)}</p>
                      </div>

                      <p className="text-text-light/70 text-sm mb-3 line-clamp-2 h-10">{formula.description}</p>

                      <div className="mb-4">
                        <p className="text-text-light/60 text-xs mb-2">{formula.features.length} caractéristiques</p>
                        <ul className="text-text-light/70 text-xs space-y-1">
                          {formula.features.slice(0, 2).map((feature, i) => (
                            <li key={i}>✓ {feature}</li>
                          ))}
                          {formula.features.length > 2 && (
                            <li className="text-gold text-xs">+{formula.features.length - 2} de plus</li>
                          )}
                        </ul>
                      </div>

                      <div className="flex gap-2 mb-3">
                        {formula.featured && (
                          <span className="text-xs bg-gold/30 text-gold px-2 py-1 rounded">Vedette</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => startEditFormula(formula)}
                          className="w-full bg-gold/20 hover:bg-gold/40 text-gold text-sm py-2 rounded transition"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteFormula(formula.id)}
                          className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm py-2 rounded transition"
                        >
                          Supprimer
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveFormula(index, 'up')}
                            disabled={index === 0}
                            className="flex-1 bg-navy/50 hover:bg-navy-light disabled:opacity-50 text-text-light text-sm py-2 rounded transition disabled:cursor-not-allowed"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveFormula(index, 'down')}
                            disabled={index === settings.formulas.length - 1}
                            className="flex-1 bg-navy/50 hover:bg-navy-light disabled:opacity-50 text-text-light text-sm py-2 rounded transition disabled:cursor-not-allowed"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gold/80 hover:bg-gold text-navy p-2 rounded-full transition"
                >
                  →
                </button>
              </div>
            )}

            {settings.formulas.length === 0 && (
              <div className="text-center py-8 text-text-light/60">
                Aucune formule créée. Cliquez sur "Ajouter une Formule" pour commencer.
              </div>
            )}
          </div>

          {/* Formula Edit Form Modal */}
          {showFormulaForm && editingFormula && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
              <div className="bg-navy-dark border-2 border-gold rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
                <h3 className="text-2xl font-bold text-gold mb-6">
                  {settings.formulas.find(f => f.id === editingFormula.id) ? 'Modifier' : 'Ajouter'} Formule
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-light/80 text-sm mb-2">Nom *</label>
                      <input
                        type="text"
                        value={editingFormula.name}
                        onChange={(e) => updateFormula('name', e.target.value)}
                        className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-text-light/80 text-sm mb-2">Prix *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingFormula.price}
                        onChange={(e) => updateFormula('price', parseFloat(e.target.value))}
                        className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-light/80 text-sm mb-2">Description</label>
                    <textarea
                      value={editingFormula.description}
                      onChange={(e) => updateFormula('description', e.target.value)}
                      className="w-full bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light focus:outline-none focus:border-gold h-16 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-text-light/80 text-sm">Formule Vedette (en avant)</label>
                    <button
                      onClick={() => updateFormula('featured', !editingFormula.featured)}
                      className={`w-12 h-6 rounded-full transition ${
                        editingFormula.featured ? 'bg-gold' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition transform ${
                        editingFormula.featured ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-text-light/80 text-sm mb-2">Caractéristiques</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Ajouter une caractéristique"
                        className="flex-1 bg-navy/50 border border-gold/30 rounded py-2 px-3 text-text-light focus:outline-none focus:border-gold text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      />
                      <button
                        onClick={addFeature}
                        className="bg-gold/20 hover:bg-gold/40 text-gold px-4 py-2 rounded text-sm transition"
                      >
                        +
                      </button>
                    </div>
                    <div className="space-y-2">
                      {editingFormula.features.map((feature, index) => (
                        <div key={index} className="flex justify-between items-center bg-navy/50 p-2 rounded text-sm">
                          <span className="text-text-light">✓ {feature}</span>
                          <button
                            onClick={() => removeFeature(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={saveFormula}
                    className="flex-1 bg-gold hover:bg-yellow-400 text-navy py-2 px-4 rounded-lg font-bold transition"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => {
                      setShowFormulaForm(false);
                      setEditingFormula(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-text-light py-2 px-4 rounded-lg font-bold transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex-1 bg-gold hover:bg-yellow-400 disabled:bg-gray-600 text-navy py-4 px-8 rounded-lg font-bold text-lg transition"
            >
              {saving ? 'Sauvegarde en cours...' : 'Sauvegarder les Paramètres'}
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-text-light py-4 px-8 rounded-lg font-bold text-lg transition"
            >
              Annuler
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSettings;
