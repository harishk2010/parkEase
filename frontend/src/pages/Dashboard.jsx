import { useEffect, useState } from 'react';
import { Car, Ticket, CreditCard, Layers, TrendingUp, Activity } from 'lucide-react';
import { floorAPI, ticketAPI, paymentAPI } from '../services/api';
import { Card, StatCard, Spinner } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [occupancy, setOccupancy] = useState([]);
  const [activeTickets, setActiveTickets] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [occ, tickets, rev, stats] = await Promise.all([
          floorAPI.getOccupancySummary(),
          ticketAPI.getActive(),
          paymentAPI.getDailyRevenue(7),
          paymentAPI.getRevenueStats({}),
        ]);
        setOccupancy(occ.data || []);
        setActiveTickets(tickets.data || []);
        setRevenue(rev.data || []);
        setRevenueStats(stats.data?.[0] || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSlots = occupancy.reduce((a, f) => a + f.totalSlots, 0);
  const occupiedSlots = occupancy.reduce((a, f) => a + f.occupiedSlots, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real-time parking overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Tickets" value={activeTickets.length} icon={Ticket} color="sky" />
        <StatCard label="Occupied Slots" value={occupiedSlots} icon={Car} color="amber" sub={`of ${totalSlots} total`} />
        <StatCard label="Total Revenue" value={revenueStats ? `₹${revenueStats.totalRevenue?.toFixed(0)}` : '₹0'} icon={CreditCard} color="emerald" />
        <StatCard label="Floors Active" value={occupancy.length} icon={Layers} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-sky-500" /> Daily Revenue (7 days)
          </h3>
          {revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No revenue data yet</div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" /> Floor Occupancy
          </h3>
          <div className="space-y-3">
            {occupancy.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No floors configured</p>
            ) : occupancy.map((f) => {
              const pct = f.totalSlots > 0 ? Math.round((f.occupiedSlots / f.totalSlots) * 100) : 0;
              return (
                <div key={f._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{f.floorName}</span>
                    <span className="text-slate-500">{f.occupiedSlots}/{f.totalSlots} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {activeTickets.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold text-slate-700 mb-4">Recent Active Tickets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 font-medium">Ticket #</th>
                  <th className="pb-3 font-medium">Vehicle</th>
                  <th className="pb-3 font-medium">Floor/Slot</th>
                  <th className="pb-3 font-medium">Entry Time</th>
                  <th className="pb-3 font-medium">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeTickets.slice(0, 8).map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs text-sky-600">{t.ticketNumber}</td>
                    <td className="py-3 font-medium">{t.vehicleNumber}</td>
                    <td className="py-3 text-slate-500">{t.floorId?.floorName} · {t.slotNumber}</td>
                    <td className="py-3 text-slate-500">{new Date(t.entryTime).toLocaleTimeString()}</td>
                    <td className="py-3 capitalize text-slate-500">{t.vehicleCategory?.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
