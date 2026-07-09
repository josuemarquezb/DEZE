// App.jsx — top-level route definitions.
// Add new screens under pages/ and register their routes here.

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';

function App() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Future routes:
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        */}
      </Routes>
    </div>
  );
}

export default App;
