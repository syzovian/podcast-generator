import React, { useState } from 'react';
import { PodcastGenerator } from './components/PodcastGenerator';
import { Header } from './components/Header';
import { SetupNotice } from './components/SetupNotice';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <SetupNotice />
        <PodcastGenerator />
      </div>
    </div>
  );
}

export default App;