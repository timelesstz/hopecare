import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center bg-rose-600 text-white px-6 py-3 rounded-md hover:bg-rose-700 transition-colors"
        >
          <Home className="h-5 w-5 mr-2" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;