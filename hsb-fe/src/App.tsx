import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContentManager from './pages/Admin/ContentManager';
import EventForm from './pages/Admin/EventForm';
import EventPage from './pages/EventPage';
import MediaPage from './pages/MediaPage';
import NewsPage from './pages/NewsPage';
import MainPage from './pages/MainPage';
import PromPage from './pages/PromPage';


function App() {
  return (
    
  <Router>
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/prom" element={<PromPage />} />
      <Route path="/event" element={<EventPage />} />
      <Route path="/media" element={<MediaPage />} />
      <Route path="/admin/event-form" element={<EventForm />} />
      <Route path="/admin/content-manager" element={<ContentManager />} />
    </Routes>
  </Router>

  );
}

export default App;
