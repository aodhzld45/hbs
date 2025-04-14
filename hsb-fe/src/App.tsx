import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContentManager from './pages/Admin/Hbs/ContentManager';
import EventForm from './pages/Admin/EventForm';
import EventPage from './pages/EventPage';
import MediaPage from './pages/MediaPage';
import MainPage from './pages/MainPage';
import PromPage from './pages/PromPage';
import HbsCardList from './components/Hbs/HbsCardList';
import HbsDetailPage from './pages/hbs/HbsDetailPage';
import ContentManagerDetail from "./pages/Admin/Hbs/ContentManagerDetail";
import AdminLogin from "./pages/Admin/Login";


function App() {
  return (
    
  <Router>
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/hbs-list" element={<HbsCardList />} />
      <Route path="/prom" element={<PromPage />} />
      <Route path="/event" element={<EventPage />} />
      <Route path="/media" element={<MediaPage />} />
    
      
      <Route path="/admin/Login" element={<AdminLogin />} />
      <Route path="/admin/event-form" element={<EventForm />} />
      <Route path="/admin/content-manager" element={<ContentManager />} />
      <Route path="/admin/hbs/:fileId" element={<ContentManagerDetail />} />
      
      <Route path="/content-files/:fileId" element={<HbsDetailPage />} />
      


    </Routes>
  </Router>

  );
}

export default App;
