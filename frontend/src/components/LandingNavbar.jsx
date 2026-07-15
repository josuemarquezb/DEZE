// components/LandingNavbar.jsx — nav bar shown only on the public landing page.
// Distinct from the app-wide Navbar: section scroll links + a sign-up dropdown.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function SignupDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
      >
        Sign Up
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
          <Link
            to="/signup?type=customer"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            As a Customer
          </Link>
          <Link
            to="/signup?type=detailer"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            As a Detailer
          </Link>
        </div>
      )}
    </div>
  );
}

function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-900/80 bg-zinc-950/80 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="#top" className="text-lg font-bold text-white">
          DEZE
        </a>
        <div className="hidden items-center gap-8 text-sm text-zinc-300 sm:flex">
          <a href="#for-customers" className="hover:text-white">For Customers</a>
          <a href="#for-detailers" className="hover:text-white">For Detailers</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/login" className="text-zinc-300 hover:text-white">Login</Link>
          <SignupDropdown />
        </div>
      </div>
    </nav>
  );
}

export default LandingNavbar;
