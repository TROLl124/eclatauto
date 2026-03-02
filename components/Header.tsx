import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-navy text-text-light border-b border-gold/20">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="text-2xl font-bold">
          Éclat <span className="text-gold">AUTO</span>
        </div>
        <nav className="flex items-center gap-8">
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
      </div>
    </header>
  );
};

export default Header;
