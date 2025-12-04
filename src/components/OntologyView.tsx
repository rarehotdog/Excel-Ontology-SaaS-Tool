import { useState, useEffect } from 'react';
import { Book, Plus, Search, Tag, AlertCircle, Check } from 'lucide-react';

interface StandardTerm {
  id: string;
  name: string;
  description: string;
  data_type: string;
  aliases: string[];
}

export function OntologyView() {
  const [terms, setTerms] = useState<StandardTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Term State
  const [newTerm, setNewTerm] = useState({
    name: '',
    description: '',
    data_type: 'string',
    aliases: ''
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/dictionary/terms');
      const data = await res.json();
      setTerms(data);
    } catch (err) {
      console.error("Failed to fetch terms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTerm = async () => {
    if (!newTerm.name) return;

    try {
      const termData = {
        id: `term_${Date.now()}`,
        name: newTerm.name,
        description: newTerm.description,
        data_type: newTerm.data_type,
        aliases: newTerm.aliases.split(',').map(a => a.trim()).filter(a => a)
      };

      const res = await fetch('http://localhost:8000/dictionary/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(termData)
      });

      if (res.ok) {
        await fetchTerms();
        setShowAddForm(false);
        setNewTerm({ name: '', description: '', data_type: 'string', aliases: '' });
      }
    } catch (err) {
      console.error("Failed to add term:", err);
    }
  };

  return (
    <div className="h-full overflow-auto p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-pink-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
                <Book className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900 mb-1">Data Dictionary</h1>
                <p className="text-gray-600">Manage standard business terms and validation rules</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium shadow-lg shadow-pink-200 hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Term
            </button>
          </div>
        </div>

        {/* Add Form Modal/Card */}
        {showAddForm && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-pink-100 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">New Standard Term</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Term Name</label>
                <input
                  type="text"
                  value={newTerm.name}
                  onChange={e => setNewTerm({ ...newTerm, name: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="e.g. Customer ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                <select
                  value={newTerm.data_type}
                  onChange={e => setNewTerm({ ...newTerm, data_type: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="email">Email</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newTerm.description}
                  onChange={e => setNewTerm({ ...newTerm, description: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="Brief description of the term..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Aliases (comma separated)</label>
                <input
                  type="text"
                  value={newTerm.aliases}
                  onChange={e => setNewTerm({ ...newTerm, aliases: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="e.g. cust_id, c_code, client_ref"
                />
                <p className="text-xs text-gray-500 mt-1">These will be used for auto-mapping columns.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTerm}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium shadow-lg shadow-pink-200 transition-all"
              >
                Save Term
              </button>
            </div>
          </div>
        )}

        {/* Term List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-500" />
              Standard Terms ({terms.length})
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search terms..."
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                <tr>
                  <th className="px-6 py-4">Term Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Aliases</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {terms.map(term => (
                  <tr key={term.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{term.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium uppercase">
                        {term.data_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{term.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {term.aliases.map(alias => (
                          <span key={alias} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs border border-blue-100">
                            {alias}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-pink-600 transition-colors">Edit</button>
                    </td>
                  </tr>
                ))}
                {terms.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No terms defined yet. Click "Add Term" to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
