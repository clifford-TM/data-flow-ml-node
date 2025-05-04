// Carregando as dependências
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// requerindo o arquivo .env 
require('dotenv').config()



// conexao com banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true
  }
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados: ', err.stack);
    return;
  }
  console.log('Conectado ao banco de dados.');
});

// Configurar para aceitar JSON (se ainda não tiver)
app.use(express.json());

// servindo arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Rota principal serve o arquivo HTML da pasta "public"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auditoria.html'));
});



// Fazendo um POST para auditoria
app.post('/auditoria', (req, res) => {
  const { turno, etd, canalizacao, data } = req.body;

  // query usada para consulta sql
  const query = `
    SELECT h.hu, h.canalizacao, h.posicao
    FROM hus h
    JOIN hu_pedidos hp ON h.hu = hp.hu
    JOIN pedidos p ON hp.pedido = p.pedido
    WHERE NOT EXISTS (
      SELECT 1
      FROM pedidos p2
      JOIN hu_pedidos hp2 ON p2.pedido = hp2.pedido
      WHERE hp2.hu = h.hu
        AND p2.desvio BETWEEN h.data_criacao AND h.data_final
    )
    AND p.etd = ?
    AND p.canalizacao = ?
    AND h.posicao = (
      SELECT rampa
      FROM pedidos
      WHERE etd = ?
        AND canalizacao = ?
        AND aging > 5
      LIMIT 1
    );
  `;

  if (!etd || !canalizacao) {
    return res.status(400).send('Parâmetros obrigatórios ausentes');
  }

  // excutando a querry
  db.execute(query, [etd, canalizacao, etd, canalizacao], (err, results) => {
    if (err) {
      console.error('Erro na consulta: ', err);
      res.status(500).send('Erro no servidor');
      return;
    }

    res.json({ message: 'Dados recebidos com sucesso!', data: results });
  });
});

//Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
