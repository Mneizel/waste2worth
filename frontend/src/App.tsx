import { Navigate, Route, Routes } from 'react-router-dom';

import { ConfirmPage } from './pages/ConfirmPage';
import { GuidePage } from './pages/GuidePage';
import { IdeasPage } from './pages/IdeasPage';
import { UploadPage } from './pages/UploadPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/scan/:scanId/confirm" element={<ConfirmPage />} />
      <Route path="/scan/:scanId/ideas" element={<IdeasPage />} />
      <Route path="/scan/:scanId/idea/:ideaId" element={<GuidePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
