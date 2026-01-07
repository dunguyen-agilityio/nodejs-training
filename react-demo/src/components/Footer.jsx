/**
 * Footer component with credits and links
 * @returns {JSX.Element} Footer component
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Credits */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-300">
              © {currentYear} BlogDemo. Built with React and Vite.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              React Docs
            </a>
            <a
              href="https://vitejs.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Vite
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
