import { useEffect, useState } from 'react';
import { Plus, Layers, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { floorAPI } from '../services/api';
import { Card, Badge, Modal, Input, Button, EmptyState, Spinner } from '../components/UI';

const EMPTY = { floorNumber: '', floorName: '', twoWheelerSlots: '', fourWheelerSlots: '', heavyDutySlots: '' };

export default function Floors() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await floorAPI.getAll();
      setFloors(res.data || []);
    } catch (e) { toast.error('Failed to load floors'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (floor) => {
    setEditing(floor);
    setForm({ floorNumber: floor.floorNumber, floorName: floor.floorName, twoWheelerSlots: '', fourWheelerSlots: '', heavyDutySlots: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.floorName || !form.floorNumber) return toast.error('Floor number and name are required');
    setSaving(true);
    try {
      if (editing) {
        await floorAPI.update(editing._id, { floorName: form.floorName });
        toast.success('Floor updated');
      } else {
        await floorAPI.create({ ...form, floorNumber: Number(form.floorNumber), twoWheelerSlots: Number(form.twoWheelerSlots || 0), fourWheelerSlots: Number(form.fourWheelerSlots || 0), heavyDutySlots: Number(form.heavyDutySlots || 0) });
        toast.success('Floor created');
      }
      setModalOpen(false);
      load();
    } catch (e) { toast.error(e.message || 'Error saving floor'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this floor?')) return;
    try { await floorAPI.delete(id); toast.success('Floor deactivated'); load(); }
    catch (e) { toast.error(e.message || 'Error'); }
  };

  const slotsByType = (slots) => {
    const counts = { two_wheeler: 0, four_wheeler: 0, heavy_duty: 0, free_2w: 0, free_4w: 0, free_hd: 0 };
    slots?.forEach(s => {
      counts[s.vehicleType]++;
      if (!s.isOccupied) counts[`free_${s.vehicleType === 'two_wheeler' ? '2w' : s.vehicleType === 'four_wheeler' ? '4w' : 'hd'}`]++;
    });
    return counts;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>Floors</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage parking floors and slots</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Floor</Button>
      </div>

      {floors.length === 0 ? (
        <Card><EmptyState icon={Layers} title="No floors yet" subtitle="Add your first parking floor to get started" /></Card>
      ) : (
        <div className="space-y-3">
          {floors.map((floor) => {
            const counts = slotsByType(floor.slots);
            const pct = floor.slots?.length > 0 ? Math.round(((floor.slots?.length - floor.slots?.filter(s => !s.isOccupied).length) / floor.slots.length) * 100) : 0;
            const isExpanded = expanded === floor._id;
            return (
              <Card key={floor._id} className="overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                        F{floor.floorNumber}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{floor.floorName}</h3>
                        <p className="text-xs text-slate-400">{floor.slots?.length || 0} total slots</p>
                      </div>
                      <div className="hidden md:flex items-center gap-2">
                        <Badge variant="info">2W: {counts.free_2w}/{counts.two_wheeler}</Badge>
                        <Badge variant="success">4W: {counts.free_4w}/{counts.four_wheeler}</Badge>
                        <Badge variant="warning">HD: {counts.free_hd}/{counts.heavy_duty}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 hidden sm:block">{pct}% full</span>
                      <button onClick={() => openEdit(floor)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(floor._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={15} /></button>
                      <button onClick={() => setExpanded(isExpanded ? null : floor._id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Slot Details</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                      {floor.slots?.map((slot) => (
                        <div key={slot._id} className={`px-3 py-2 rounded-lg text-xs font-medium border ${slot.isOccupied ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                          {slot.slotNumber}
                          <span className="block text-[10px] opacity-70 capitalize">{slot.vehicleType.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Floor' : 'Add New Floor'}>
        <div className="space-y-4">
          <Input label="Floor Number" type="number" value={form.floorNumber} onChange={e => setForm(p => ({ ...p, floorNumber: e.target.value }))} placeholder="1" disabled={!!editing} />
          <Input label="Floor Name" value={form.floorName} onChange={e => setForm(p => ({ ...p, floorName: e.target.value }))} placeholder="Ground Floor" />
          {!editing && (
            <>
              <p className="text-sm font-medium text-slate-600 pt-1">Slot Configuration</p>
              <div className="grid grid-cols-3 gap-3">
                <Input label="2-Wheeler Slots" type="number" value={form.twoWheelerSlots} onChange={e => setForm(p => ({ ...p, twoWheelerSlots: e.target.value }))} placeholder="0" />
                <Input label="4-Wheeler Slots" type="number" value={form.fourWheelerSlots} onChange={e => setForm(p => ({ ...p, fourWheelerSlots: e.target.value }))} placeholder="0" />
                <Input label="Heavy Duty Slots" type="number" value={form.heavyDutySlots} onChange={e => setForm(p => ({ ...p, heavyDutySlots: e.target.value }))} placeholder="0" />
              </div>
            </>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} isLoading={saving} className="flex-1">{editing ? 'Update' : 'Create Floor'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
