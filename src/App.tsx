import { Navigate, Route, Routes } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { CreateSplitPage } from './pages/CreateSplitPage';
import { HomePage } from './pages/HomePage';
import { MySplitsPage } from './pages/MySplitsPage';
import { PaySplitPage } from './pages/PaySplitPage';
import { SplitDetailPage } from './pages/SplitDetailPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF8] text-[#0B4F5C]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateSplitPage />} />
          <Route path="/splits" element={<MySplitsPage />} />
          <Route path="/pay" element={<PaySplitPage />} />
          <Route path="/pay/:splitId" element={<PaySplitPage />} />
          <Route path="/split/:splitId" element={<SplitDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
