import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, RefreshCw, Plus, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentAPI, ticketAPI } from '../services/api';
import { Card, Modal, Input, Select, Button, EmptyState, Badge, Spinner, StatCard } from '../components/UI';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const statusVariant = { pending: 'warning', paid: 'success', failed: 'danger', refunded: 'purple' };
const METHODS = ['cash', 'card', 'upi', 'online'];
const PIE_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [exitedTickets, setExitedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodBreakdown, setMethodBreakdown] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ ticketId: '', paymentMethod: 'cash', discount: '', tax: '', notes: '' });
  const [confirmModal, setConfirmModal] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    try {
      const [p, t, mb, rs] = await Promise.all([
        paymentAPI.getAll(),
        ticketAPI.getAll({ status: 'exited' }),
        paymentAPI.getMethodBreakdown(),
        paymentAPI.getRevenueStats({}),
      ]);
      setPayments(p.data || []);
      setExitedTickets(t.data || []);
      setMethodBreakdown(mb.data || []);
      setRevenueStats(rs.data?.[0] || null);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.ticketId || !form.paymentMethod) return toast.error('Ticket and payment method required');
    setSaving(true);
    try {
      await paymentAPI.create({ ...form, discount: Number(form.discount || 0), tax: Number(form.tax || 0) });
      toast.success('Payment record created');
      setModal(null);
      load();
    } catch (e) { toast.error(e.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await paymentAPI.confirm(confirmModal._id, transactionId);
      toast.success('Payment confirmed!');
      setConfirmModal(null);
      load();
    } catch (e) { toast.error(e.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleRefund = async (id) => {
    const reason = prompt('Refund reason:');
    if (reason === null) return;
    try { await paymentAPI.refund(id, reason); toast.success('Refunded'); load(); }
    catch (e) { toast.error(e.message || 'Error'); }
  };

  const filtered = statusFilter ? payments.filter(p => p.paymentStatus === statusFilter) : payments;
  const pieData = methodBreakdown.map(m => ({ name: m._id, value: m.total }));

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>Payments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Billing and transaction management</p>
        </div>
        <Button onClick={() => { setForm({ ticketId: '', paymentMethod: 'cash', discount: '', tax: '', notes: '' }); setModal('create'); }}>
          <Plus size={16} /> Create Payment
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${revenueStats?.totalRevenue?.toFixed(0) || 0}`} icon={TrendingUp} color="emerald" />
        <StatCard label="Transactions" value={revenueStats?.totalTransactions || 0} icon={CreditCard} color="sky" />
        <StatCard label="Avg Amount" value={`₹${revenueStats?.avgAmount?.toFixed(0) || 0}`} icon={CreditCard} color="purple" />
        <StatCard label="Pending" value={payments.filter(p => p.paymentStatus === 'pending').length} icon={RefreshCw} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
              <option value="">All Status</option>
              {['pending', 'paid', 'failed', 'refunded'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </Card>

          {filtered.length === 0 ? (
            <Card><EmptyState icon={CreditCard} title="No payments yet" subtitle="Payments appear after vehicle exit" /></Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 font-medium">Ticket</th>
                      <th className="px-4 py-3 font-medium">Vehicle</th>
                      <th className="px-4 py-3 font-medium">Duration</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-sky-600">{p.ticketNumber}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{p.vehicleNumber}</td>
                        <td className="px-4 py-3 text-slate-500">{p.durationHours}h</td>
                        <td className="px-4 py-3 font-bold text-slate-800">₹{p.totalAmount}</td>
                        <td className="px-4 py-3 capitalize text-slate-500">{p.paymentMethod}</td>
                        <td className="px-4 py-3"><Badge variant={statusVariant[p.paymentStatus]}>{p.paymentStatus}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {p.paymentStatus === 'pending' && (
                              <Button size="sm" variant="success" onClick={() => { setConfirmModal(p); setTransactionId(''); }}>
                                <CheckCircle size={13} /> Confirm
                              </Button>
                            )}
                            {p.paymentStatus === 'paid' && (
                              <Button size="sm" variant="outline" onClick={() => handleRefund(p._id)}>
                                <RefreshCw size={13} /> Refund
                              </Button>
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
        </div>

        <Card className="p-6">
          <h3 className="font-bold text-slate-700 mb-4">Revenue by Method</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`₹${v}`, '']} />
                <Legend formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No payment data yet</div>
          )}
        </Card>
      </div>

      {/* Create Payment Modal */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Create Payment">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Select Exited Ticket</label>
            <select value={form.ticketId} onChange={e => setForm(p => ({ ...p, ticketId: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">Select a ticket</option>
              {exitedTickets.map(t => <option key={t._id} value={t._id}>{t.ticketNumber} — {t.vehicleNumber}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Payment Method</label>
            <select value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 capitalize">
              {METHODS.map(m => <option key={m} value={m} className="capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Discount (₹)" type="number" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} placeholder="0" />
            <Input label="Tax (₹)" type="number" value={form.tax} onChange={e => setForm(p => ({ ...p, tax: e.target.value }))} placeholder="0" />
          </div>
          <Input label="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes" />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} isLoading={saving} className="flex-1">Create</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirm Payment">
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">₹{confirmModal?.totalAmount}</p>
            <p className="text-sm text-emerald-600">{confirmModal?.vehicleNumber} · {confirmModal?.ticketNumber}</p>
          </div>
          <Input label="Transaction ID (optional)" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="UPI/Card reference" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setConfirmModal(null)} className="flex-1">Cancel</Button>
            <Button variant="success" onClick={handleConfirm} isLoading={saving} className="flex-1">Confirm Paid</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
