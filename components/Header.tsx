import Link from 'next/link';
import { useState } from 'react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-navy text-text-light border-b border-gold/20 relative z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          Éclat <span className="text-gold">AUTO</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-gold transition">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-gold transition">
                Galerie
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold transition">
                Contact
              </Link>
            </li>
          </ul>
          <Link
            href="/login"
            className="bg-gold hover:bg-yellow-400 text-navy px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 text-sm"
          >
            Login
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-text-light transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-text-light transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-text-light transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy border-t border-gold/20 px-6 py-4 flex flex-col gap-4">
          <Link href="/" className="hover:text-gold transition text-lg" onClick={() => setMenuOpen(false)}>
            Accueil
          </Link>
          <Link href="/gallery" className="hover:text-gold transition text-lg" onClick={() => setMenuOpen(false)}>
            Galerie
          </Link>
          <Link href="/contact" className="hover:text-gold transition text-lg" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
          <Link
            href="/login"
            className="bg-gold hover:bg-yellow-400 text-navy px-4 py-2 rounded-lg font-semibold transition text-sm text-center"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
