import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Floors from './pages/Floors';
import Vehicles from './pages/Vehicles';
import Tickets from './pages/Tickets';
import Payments from './pages/Payments';

export default function App() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/floors" element={<Floors />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
