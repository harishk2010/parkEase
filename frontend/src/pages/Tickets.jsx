import { useEffect, useState } from 'react';
import { Plus, Ticket, Search, LogOut, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { ticketAPI, floorAPI, vehicleTypeAPI } from '../services/api';
import { Card, Modal, Input, Select, Button, EmptyState, Badge, Spinner } from '../components/UI';

const statusVariant = { active: 'success', exited: 'default', cancelled: 'danger' };

const EMPTY_FORM = { vehicleNumber: '', vehicleCategory: '', vehicleSubClass: '', floorId: '', ownerName: '', ownerPhone: '' };

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [floors, setFloors] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [exitResult, setExitResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchNum, setSearchNum] = useState('');

  const load = async () => {
    try {
      const [t, f, v] = await Promise.all([ticketAPI.getAll(), floorAPI.getAll(), vehicleTypeAPI.getAll()]);
      setTickets(t.data || []);
      setFloors(f.data || []);
      setVehicleTypes(v.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const selectedVT = vehicleTypes.find(v => v.category === form.vehicleCategory);

  const handleCreate = async () => {
    if (!form.vehicleNumber || !form.vehicleCategory || !form.floorId) return toast.error('Vehicle number, category and floor are required');
    setSaving(true);
    try {
      await ticketAPI.create(form);
      toast.success('Ticket created! Slot assigned.');
      setModal(null);
      load();
    } catch (e) { toast.error(e.message || 'Error creating ticket'); }
    finally { setSaving(false); }
  };

  const handleExit = async (ticketNumber) => {
    setSaving(true);
    try {
      const res = await ticketAPI.processExit(ticketNumber);
      setExitResult(res.data);
      setModal('exitResult');
      load();
    } catch (e) { toast.error(e.message || 'Error processing exit'); }
    finally { setSaving(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this ticket?')) return;
    try { await ticketAPI.cancel(id); toast.success('Ticket cancelled'); load(); }
    catch (e) { toast.error(e.message || 'Error'); }
  };

  const filtered = tickets.filter(t => {
    const matchText = !filter || t.vehicleNumber.toLowerCase().includes(filter.toLowerCase()) || t.ticketNumber.toLowerCase().includes(filter.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchText && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>Tickets</h1>
          <p className="text-sm text-slate-500 mt-0.5">{tickets.filter(t => t.status === 'active').length} active · {tickets.length} total</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setModal('create'); }}><Plus size={16} /> New Ticket</Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search by vehicle number or ticket #..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="exited">Exited</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Ticket} title="No tickets found" subtitle="Create a new ticket when a vehicle enters" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 font-medium">Ticket #</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Floor · Slot</th>
                  <th className="px-4 py-3 font-medium">Entry</th>
                  <th className="px-4 py-3 font-medium">Exit</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-sky-600 font-medium">{t.ticketNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{t.vehicleNumber}</div>
                      {t.ownerName && <div className="text-xs text-slate-400">{t.ownerName}</div>}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600">{t.vehicleCategory?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{t.floorId?.floorName} · {t.slotNumber}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.entryTime).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{t.exitTime ? new Date(t.exitTime).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[t.status]}>{t.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {t.status === 'active' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleExit(t.ticketNumber)} isLoading={saving}>
                              <LogOut size={13} /> Exit
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleCancel(t._id)}>
                              <X size={13} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Ticket Modal */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="New Entry Ticket">
        <div className="space-y-4">
          <Input label="Vehicle Number" value={form.vehicleNumber} onChange={e => setForm(p => ({ ...p, vehicleNumber: e.target.value.toUpperCase() }))} placeholder="TN01AB1234" />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Vehicle Category</label>
            <select value={form.vehicleCategory} onChange={e => setForm(p => ({ ...p, vehicleCategory: e.target.value, vehicleSubClass: '' }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">Select category</option>
              {vehicleTypes.map(v => <option key={v._id} value={v.category}>{v.displayName}</option>)}
            </select>
          </div>
          {selectedVT?.subClasses?.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Sub-class (optional)</label>
              <select value={form.vehicleSubClass} onChange={e => setForm(p => ({ ...p, vehicleSubClass: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Base rate — ₹{selectedVT.baseRatePerHour}/hr</option>
                {selectedVT.subClasses.map(s => <option key={s._id} value={s.name}>{s.name} — ₹{s.ratePerHour}/hr</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Floor</label>
            <select value={form.floorId} onChange={e => setForm(p => ({ ...p, floorId: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">Select floor</option>
              {floors.map(f => <option key={f._id} value={f._id}>{f.floorName} (Floor {f.floorNumber})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Owner Name (optional)" value={form.ownerName} onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))} placeholder="John Doe" />
            <Input label="Phone (optional)" value={form.ownerPhone} onChange={e => setForm(p => ({ ...p, ownerPhone: e.target.value }))} placeholder="9876543210" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} isLoading={saving} className="flex-1">Create Ticket</Button>
          </div>
        </div>
      </Modal>

      {/* Exit Result Modal */}
      <Modal isOpen={modal === 'exitResult'} onClose={() => setModal(null)} title="Exit Processed">
        {exitResult && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-700" style={{ fontFamily: 'Syne, sans-serif' }}>₹{exitResult.amount}</p>
              <p className="text-sm text-emerald-600 mt-1">Total Amount Due</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium">{exitResult.durationHours} hour{exitResult.durationHours !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Rate</span>
                <span className="font-medium">₹{exitResult.ratePerHour}/hr</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 text-center">Go to Payments to complete the transaction</p>
            <Button onClick={() => setModal(null)} className="w-full">Close</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
