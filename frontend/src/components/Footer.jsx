// components/Footer.jsx — marketing footer: link groups, socials, copyright.

const SOCIALS = [
  {
    label: 'Instagram',
    href: '#',
    path: 'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm4.75-.75a1 1 0 110 2 1 1 0 010-2z',
  },
  {
    label: 'X',
    href: '#',
    path: 'M18.9 2H22l-7.7 8.8L23 22h-6.6l-5.2-6.8L5.2 22H2l8.2-9.4L1 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L6.4 4H4.5l13.2 16z',
  },
  {
    label: 'Facebook',
    href: '#',
    path: 'M13 22v-9h3l.5-4H13V6.5c0-1.2.3-2 2-2h1.6V1.1C16.3 1 15.1 1 13.9 1c-3 0-5 1.8-5 5.2V9H6v4h2.9v9H13z',
  },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-900 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          <div>
            <p className="text-lg font-bold text-white">
              DEZE <span className="text-accent">Detail Central</span>
            </p>
            <p className="mt-2 max-w-xs text-sm text-zinc-500">The detailing marketplace built for pros and car owners.</p>
          </div>

          <div className="flex gap-10 text-sm">
            <a href="#" className="text-zinc-400 hover:text-white">About</a>
            <a href="#" className="text-zinc-400 hover:text-white">Contact</a>
            <a href="#" className="text-zinc-400 hover:text-white">Terms</a>
            <a href="#" className="text-zinc-400 hover:text-white">Privacy</a>
          </div>

          <div className="flex gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-900 pt-6 text-center text-xs text-zinc-600">
          &copy; {year} DEZE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
