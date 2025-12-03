import { useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import { Movies } from './components/Movies';
import { Clients } from './components/Clients';
import { Rentals } from './components/Rentals';
import { useState } from 'react';

type DashboardPage = 'movies' | 'clients' | 'rentals';

const Dashboard = ({ username, onLogout }: { username: string; onLogout: () => void }) => {
  const [currentPage, setCurrentPage] = useState<DashboardPage>('movies');

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Locadora</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Olá, <strong>{username}</strong></span>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-6 space-y-2">
            <button
              onClick={() => setCurrentPage('movies')}
              className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors ${
                currentPage === 'movies'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Filmes
            </button>
            <button
              onClick={() => setCurrentPage('clients')}
              className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors ${
                currentPage === 'clients'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setCurrentPage('rentals')}
              className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors ${
                currentPage === 'rentals'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Aluguéis
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {currentPage === 'movies' && <Movies />}
          {currentPage === 'clients' && <Clients />}
          {currentPage === 'rentals' && <Rentals />}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const { auth, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return auth.isAuthenticated && auth.adminId && auth.username ? (
    <Dashboard username={auth.username} onLogout={logout} />
  ) : (
    <Login onLoginSuccess={login} />
  );
}

export default App