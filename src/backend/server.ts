import express from "express";
import cors from "cors";
import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client.ts';

const app = express();

const adapter = new PrismaBetterSqlite3({
  url: 'file:../../dev.db',
});
const prisma = new PrismaClient({ adapter }) as any;

app.use(cors());
app.use(express.json());

//----------------------- Rota de login --------------------------
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username e password são obrigatórios",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || admin.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Username ou senha incorretos",
      });
    }

    return res.json({
      success: true,
      message: "Login realizado com sucesso",
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

//----------------------- Rota para listar filmes --------------------------
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await prisma.movie.findMany();
    return res.json({
      success: true,
      movies,
    });
  } catch (error) {
    console.error("Erro ao listar filmes:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao listar filmes",
    });
  }
});

//----------------------- Rota para criar filme --------------------------
app.post("/api/movies", async (req, res) => {
  try {
    const { title, description, director, duration } = req.body;

    if (!title || !description || !director || !duration) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios",
      });
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        director,
        duration: Number.parseInt(duration),
      },
    });

    return res.json({
      success: true,
      message: "Filme criado com sucesso",
      movie,
    });
  } catch (error) {
    console.error("Erro ao criar filme:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao criar filme",
    });
  }
});

//----------------------- Rota para atualizar filme --------------------------
app.put("/api/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, director, duration } = req.body;

    if (!title || !description || !director || !duration) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios",
      });
    }

    const movie = await prisma.movie.update({
      where: { id: Number.parseInt(id) },
      data: {
        title,
        description,
        director,
        duration: Number.parseInt(duration),
      },
    });

    return res.json({
      success: true,
      message: "Filme atualizado com sucesso",
      movie,
    });
  } catch (error) {
    console.error("Erro ao atualizar filme:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar filme",
    });
  }
});

//----------------------- Rota para deletar filme --------------------------
app.delete("/api/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.movie.delete({
      where: { id: Number.parseInt(id) },
    });

    return res.json({
      success: true,
      message: "Filme deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar filme:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao deletar filme",
    });
  }
});

//----------------------- ROTAS DE CLIENTES --------------------------
app.get("/api/clients", async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    return res.json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao listar clientes",
    });
  }
});

//----------------------- Rota para criar cliente --------------------------
app.post("/api/clients", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios",
      });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
      },
    });

    return res.json({
      success: true,
      message: "Cliente criado com sucesso",
      client,
    });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao criar cliente",
    });
  }
});

//----------------------- Rota para atualizar cliente --------------------------
app.put("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios",
      });
    }

    const client = await prisma.client.update({
      where: { id: Number.parseInt(id) },
      data: {
        name,
        email,
        phone,
      },
    });

    return res.json({
      success: true,
      message: "Cliente atualizado com sucesso",
      client,
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar cliente",
    });
  }
});

//----------------------- Rota para deletar cliente --------------------------
app.delete("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.client.delete({
      where: { id: Number.parseInt(id) },
    });

    return res.json({
      success: true,
      message: "Cliente deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao deletar cliente",
    });
  }
});

//----------------------- ROTAS DE ALUGUÉIS --------------------------

//----------------------- Rota para listar aluguéis --------------------------
app.get("/api/rentals", async (_req, res) => {
  try {
    const rentals = await prisma.rental.findMany({
      include: {
        movie: true,
        client: true,
      },
    });
    return res.json({
      success: true,
      rentals,
    });
  } catch (error) {
    console.error("Erro ao listar aluguéis:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao listar aluguéis",
    });
  }
});

//----------------------- Rota para criar aluguel --------------------------
app.post("/api/rentals", async (req, res) => {
  try {
    const { movieId, clientId } = req.body;

    if (!movieId || !clientId) {
      return res.status(400).json({
        success: false,
        message: "Filme e cliente são obrigatórios",
      });
    }

    const rental = await prisma.rental.create({
      data: {
        movieId: Number.parseInt(movieId),
        clientId: Number.parseInt(clientId),
      },
      include: {
        movie: true,
        client: true,
      },
    });

    return res.json({
      success: true,
      message: "Aluguel criado com sucesso",
      rental,
    });
  } catch (error) {
    console.error("Erro ao criar aluguel:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao criar aluguel",
    });
  }
});

//----------------------- Rota para retornar um filme (marcar como devolvido) --------------------------
app.put("/api/rentals/:id/return", async (req, res) => {
  try {
    const { id } = req.params;

    const rental = await prisma.rental.update({
      where: { id: Number.parseInt(id) },
      data: {
        returnDate: new Date(),
      },
      include: {
        movie: true,
        client: true,
      },
    });

    return res.json({
      success: true,
      message: "Devolução registrada com sucesso",
      rental,
    });
  } catch (error) {
    console.error("Erro ao devolver filme:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao devolver filme",
    });
  }
});

//----------------------- Rota para deletar aluguel --------------------------
app.delete("/api/rentals/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.rental.delete({
      where: { id: Number.parseInt(id) },
    });

    return res.json({
      success: true,
      message: "Aluguel deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar aluguel:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao deletar aluguel",
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http:localhost:${PORT}`);
});
