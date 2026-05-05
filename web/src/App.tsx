import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AllocationAnalysis from './pages/AllocationAnalysis';
import AssetOverview from './pages/AssetOverview';
import FireTracking from './pages/FireTracking';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AssetOverview />} />
        <Route path="/fire" element={<FireTracking />} />
        <Route path="/allocation" element={<AllocationAnalysis />} />
      </Route>
    </Routes>
  );
}
