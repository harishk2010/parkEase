import { useEffect, useState } from 'react';
import { Plus, Car, Edit2, Trash2, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { vehicleTypeAPI } from '../services/api';
import { Card, Modal, Input, Button, EmptyState, Badge, Spinner } from '../components/UI';

const CATEGORIES = [
  { value: 'two_wheeler', label: 'Two Wheeler' },
  { value: 'four_wheeler', label: 'Four Wheeler' },
  { value: 'heavy_duty', label: 'Heavy Duty' },
];

const EMPTY_TYPE = { category: 'two_wheeler', displayName: '', description: '', baseRatePerHour: '', baseRatePerDay: '' };
const EMPTY_SUB = { name: '', description: '', ratePerHour: '', ratePerDay: '' };

export default function Vehicles() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'subclass'
  const [selectedType, setSelectedType] = useState(null);
  const [form, setForm] = useState(EMPTY_TYPE);
  const [subForm, setSubForm] = useState(EMPTY_SUB);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await vehicleTypeAPI.getAll();
      setTypes(res.data || []);
    } catch { toast.error('Failed to load vehicle types'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.displayName || !form.baseRatePerHour) return toast.error('Display name and rate are required');
    setSaving(true);
    try {
      await vehicleTypeAPI.create({ ...form, baseRatePerHour: Number(form.baseRatePerHour), baseRatePerDay: Number(form.baseRatePerDay || 0) });
      toast.success('Vehicle type created');
      setModal(null);
      load();
    } catch (e) { toast.error(e.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleAddSubClass = async () => {
    if (!subForm.name || !subForm.ratePerHour) return toast.error('Name and rate required');
    setSaving(true);
    try {
      await vehicleTypeAPI.addSubClass(selectedType._id, { ...subForm, ratePerHour: Number(subForm.ratePerHour), ratePerDay: Number(subForm.ratePerDay || 0) });
      toast.success('Sub-class added');
      setModal(null);
      load();
    } catch (e) { toast.error(e.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleRemoveSubClass = async (typeId, subId) => {
    try { await vehicleTypeAPI.removeSubClass(typeId, subId); toast.success('Sub-class removed'); load(); }
    catch (e) { toast.error(e.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this vehicle type?')) return;
    try { await vehicleTypeAPI.delete(id); toast.success('Deactivated'); load(); }
    catch (e) { toast.error(e.message || 'Error'); }
  };

  const catColors = { two_wheeler: 'info', four_wheeler: 'success', heavy_duty: 'warning' };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>Vehicle Types</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure categories and pricing</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_TYPE); setModal('create'); }}><Plus size={16} /> Add Type</Button>
      </div>

      {types.length === 0 ? (
        <Card><EmptyState icon={Car} title="No vehicle types" subtitle="Configure vehicle types and pricing before creating tickets" /></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((type) => (
            <Card key={type._id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge variant={catColors[type.category]}>{type.category.replace('_', ' ')}</Badge>
                  <h3 className="font-bold text-slate-800 mt-2" style={{ fontFamily: 'Syne, sans-serif' }}>{type.displayName}</h3>
                  {type.description && <p className="text-xs text-slate-400 mt-0.5">{type.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleDelete(type._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-slate-500">Base Rate</p>
                <p className="font-bold text-slate-800">₹{type.baseRatePerHour}/hr {type.baseRatePerDay ? `· ₹${type.baseRatePerDay}/day` : ''}</p>
              </div>

              {type.subClasses?.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sub-classes</p>
                  {type.subClasses.map((sub) => (
                    <div key={sub._id} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{sub.name}</p>
                        <p className="text-xs text-slate-400">₹{sub.ratePerHour}/hr</p>
                      </div>
                      <button onClick={() => handleRemoveSubClass(type._id, sub._id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setSelectedType(type); setSubForm(EMPTY_SUB); setModal('subclass'); }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 py-2 border border-dashed border-sky-200 rounded-xl hover:bg-sky-50 transition-colors"
              >
                <PlusCircle size={14} /> Add Sub-class
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Add Vehicle Type">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <Input label="Display Name" value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} placeholder="e.g. Motorcycle" />
          <Input label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Rate per Hour (₹)" type="number" value={form.baseRatePerHour} onChange={e => setForm(p => ({ ...p, baseRatePerHour: e.target.value }))} placeholder="20" />
            <Input label="Rate per Day (₹)" type="number" value={form.baseRatePerDay} onChange={e => setForm(p => ({ ...p, baseRatePerDay: e.target.value }))} placeholder="200" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} isLoading={saving} className="flex-1">Create</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'subclass'} onClose={() => setModal(null)} title={`Add Sub-class to ${selectedType?.displayName}`}>
        <div className="space-y-4">
          <Input label="Sub-class Name" value={subForm.name} onChange={e => setSubForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Heavy Bike" />
          <Input label="Description" value={subForm.description} onChange={e => setSubForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Rate per Hour (₹)" type="number" value={subForm.ratePerHour} onChange={e => setSubForm(p => ({ ...p, ratePerHour: e.target.value }))} placeholder="30" />
            <Input label="Rate per Day (₹)" type="number" value={subForm.ratePerDay} onChange={e => setSubForm(p => ({ ...p, ratePerDay: e.target.value }))} placeholder="300" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleAddSubClass} isLoading={saving} className="flex-1">Add Sub-class</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
