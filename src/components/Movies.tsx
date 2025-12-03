import { useState, useEffect } from 'react';
import { z } from 'zod';
import axios from 'axios';

const MovieSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  director: z.string().min(1, 'Diretor é obrigatório'),
  duration: z.string().min(1, 'Duração é obrigatória').transform(v => Number.parseInt(v)),
});

type MovieFormData = z.infer<typeof MovieSchema>;

interface Movie {
  id: number;
  title: string;
  description: string;
  director: string;
  duration: number;
}

interface MovieFormModalProps {
  isOpen: boolean;
  movie?: Movie | null;
  onClose: () => void;
  onSave: () => void;
}

const MovieFormModal = ({ isOpen, movie, onClose, onSave }: MovieFormModalProps) => {
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    description: '',
    director: '',
    duration: '90' as any,
  });
  const [errors, setErrors] = useState<Partial<MovieFormData>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        description: movie.description,
        director: movie.director,
        duration: String(movie.duration) as any,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        director: '',
        duration: '90' as any,
      });
    }
    setErrors({});
    setServerError(null);
  }, [movie, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof MovieFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const result = MovieSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<MovieFormData> = {};
      for (const error of result.error.errors) {
        const path = error.path[0] as keyof MovieFormData;
        fieldErrors[path] = error.message as any;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const url = movie
        ? `http://localhost:3000/api/movies/${movie.id}`
        : 'http://localhost:3000/api/movies';

      const method = movie ? 'put' : 'post';

      const response = await axios[method](url, {
        title: result.data.title,
        description: result.data.description,
        director: result.data.director,
        duration: result.data.duration,
      });

      if (response.data.success) {
        onSave();
        onClose();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || 'Erro ao salvar filme');
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {movie ? 'Editar Filme' : 'Novo Filme'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Digite o título"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <div className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Digite a descrição"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <div className="block text-sm font-medium text-gray-700 mb-1">
              Diretor
            </div>
            <input
              type="text"
              name="director"
              value={formData.director}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.director
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Digite o diretor"
            />
            {errors.director && (
              <p className="text-red-500 text-sm mt-1">{errors.director}</p>
            )}
          </div>

          <div>
            <div className="block text-sm font-medium text-gray-700 mb-1">
              Duração (minutos)
            </div>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.duration
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="90"
              min="1"
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{String(errors.duration)}</p>
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
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/movies');
      if (response.data.success) {
        setMovies(response.data.movies);
      }
      setError(null);
    } catch (err) {
      setError('Erro ao carregar filmes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleAddMovie = () => {
    setSelectedMovie(null);
    setIsModalOpen(true);
  };

  const handleEditMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleDeleteMovie = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este filme?')) return;

    try {
      setDeleteLoading(id);
      const response = await axios.delete(`http://localhost:3000/api/movies/${id}`);
      if (response.data.success) {
        setMovies(movies.filter(m => m.id !== id));
      }
    } catch (err) {
      alert('Erro ao deletar filme');
      console.error(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSaveMovie = () => {
    loadMovies();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Carregando filmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Filmes</h2>
        <button
          onClick={handleAddMovie}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          + Novo Filme
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {movies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
          Nenhum filme cadastrado. Clique em "Novo Filme" para adicionar.
        </div>
      ) : (
        <div className="grid gap-4">
          {movies.map(movie => (
            <div
              key={movie.id}
              className="bg-white rounded-lg shadow p-6 flex justify-between items-start"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{movie.title}</h3>
                <p className="text-gray-600 mt-1">{movie.description}</p>
                <div className="mt-3 text-sm text-gray-500">
                  <p>Diretor: <strong>{movie.director}</strong></p>
                  <p>Duração: <strong>{movie.duration} minutos</strong></p>
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <button
                  onClick={() => handleEditMovie(movie)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteMovie(movie.id)}
                  disabled={deleteLoading === movie.id}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {deleteLoading === movie.id ? 'Deletando...' : 'Deletar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MovieFormModal
        isOpen={isModalOpen}
        movie={selectedMovie}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMovie}
      />
    </div>
  );
};
