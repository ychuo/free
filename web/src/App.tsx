import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import AllocationAnalysis from './pages/AllocationAnalysis';
import AssetOverview from './pages/AssetOverview';
import FireTracking from './pages/FireTracking';
import ReturnAttribution from './pages/ReturnAttribution';
import StrategyExplorer from './pages/StrategyExplorer';
import TransactionList from './pages/TransactionList';
import UserGuide from './pages/UserGuide';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<AssetOverview />} />
          <Route path="/fire" element={<FireTracking />} />
          <Route path="/allocation" element={<AllocationAnalysis />} />
          <Route path="/returns" element={<ReturnAttribution />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/strategies" element={<StrategyExplorer />} />
          <Route path="/guide" element={<UserGuide />} />
        </Route>
      </Routes>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--color-ivory)',
            border: '1px solid var(--color-sand)',
            color: 'var(--color-deep)',
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
          },
        }}
      />
    </>
  );
}
