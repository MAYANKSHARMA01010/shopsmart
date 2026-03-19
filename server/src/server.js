require('dotenv').config();
const express = require('express');
const cors = require('cors');

const logger = require('./utils/logger');
const productRoutes = require('./routes/productRoutes');
const { errorHandler, routeNotFoundHandler } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ShopSmart Backend is running',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'ShopSmart Backend Service v2 (Modular)', version: '2.0.1' });
});

app.use('/api/products', productRoutes);

app.use(routeNotFoundHandler);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
