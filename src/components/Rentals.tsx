import { useState, useEffect } from 'react';
import { z } from 'zod';
import axios from 'axios';

const RentalSchema = z.object({
  movieId: z.string().min(1, 'Filme é obrigatório'),
  clientId: z.string().min(1, 'Cliente é obrigatório'),
});

type RentalFormData = z.infer<typeof RentalSchema>;

interface Movie {
  id: number;
  title: string;
}

interface Client {
  id: number;
  name: string;
}

interface Rental {
  id: number;
  movieId: number;
  clientId: number;
  rentalDate: string;
  returnDate: string | null;
  movie: Movie;
  client: Client;
}

interface RentalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  movies: Movie[];
  clients: Client[];
}

const RentalFormModal = ({ isOpen, onClose, onSave, movies, clients }: RentalFormModalProps) => {
  const [formData, setFormData] = useState<RentalFormData>({
    movieId: '',
    clientId: '',
  });
  const [errors, setErrors] = useState<Partial<RentalFormData>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        movieId: '',
        clientId: '',
      });
      setErrors({});
      setServerError(null);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof RentalFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const result = RentalSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<RentalFormData> = {};
      for (const error of result.error.errors) {
        const path = error.path[0] as keyof RentalFormData;
        fieldErrors[path] = error.message as any;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/rentals', {
        movieId: result.data.movieId,
        clientId: result.data.clientId,
      });

      if (response.data.success) {
        onSave();
        onClose();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || 'Erro ao criar aluguel');
      } else {
        setServerError('Erro ao conectar com o servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Novo Aluguel</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-1">
              Filme
            </div>
            <select
              name="movieId"
              value={formData.movieId}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.movieId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Selecione um filme</option>
              {movies.map(movie => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
            {errors.movieId && (
              <p className="text-red-500 text-sm mt-1">{errors.movieId}</p>
            )}
          </div>

          <div>
            <div className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </div>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.clientId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Selecione um cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>
            )}
          </div>

          {serverError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {serverError}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Alugando...' : 'Alugar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Rentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rentalsRes, moviesRes, clientsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/rentals'),
        axios.get('http://localhost:3000/api/movies'),
        axios.get('http://localhost:3000/api/clients'),
      ]);

      if (rentalsRes.data.success) setRentals(rentalsRes.data.rentals);
      if (moviesRes.data.success) setMovies(moviesRes.data.movies);
      if (clientsRes.data.success) setClients(clientsRes.data.clients);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReturnMovie = async (id: number) => {
    if (!confirm('Tem certeza que deseja marcar este filme como devolvido?')) return;

    try {
      setActionLoading(id);
      const response = await axios.put(`http://localhost:3000/api/rentals/${id}/return`);
      if (response.data.success) {
        setRentals(rentals.map(r => r.id === id ? response.data.rental : r));
      }
    } catch (err) {
      alert('Erro ao registrar devolução');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRental = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este aluguel?')) return;

    try {
      setActionLoading(id);
      const response = await axios.delete(`http://localhost:3000/api/rentals/${id}`);
      if (response.data.success) {
        setRentals(rentals.filter(r => r.id !== id));
      }
    } catch (err) {
      alert('Erro ao deletar aluguel');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveRental = () => {
    loadData();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Carregando aluguéis...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Aluguéis</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          + Novo Aluguel
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {rentals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
          Nenhum aluguel cadastrado. Clique em "Novo Aluguel" para adicionar.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Filme</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data Aluguel</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(rental => (
                <tr key={rental.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{rental.movie.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{rental.client.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(rental.rentalDate)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full font-semibold text-white ${
                        rental.returnDate
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                    >
                      {rental.returnDate ? 'Devolvido' : 'Em andamento'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    {!rental.returnDate && (
                      <button
                        onClick={() => handleReturnMovie(rental.id)}
                        disabled={actionLoading === rental.id}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-semibold py-1 px-3 rounded-lg text-sm transition-colors"
                      >
                        {actionLoading === rental.id ? 'Salvando...' : 'Devolver'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteRental(rental.id)}
                      disabled={actionLoading === rental.id}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-1 px-3 rounded-lg text-sm transition-colors"
                    >
                      {actionLoading === rental.id ? 'Deletando...' : 'Deletar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RentalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRental}
        movies={movies}
        clients={clients}
      />
    </div>
  );
};
