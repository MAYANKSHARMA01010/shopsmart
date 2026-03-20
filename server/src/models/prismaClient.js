const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

const isLocalhost = connectionString ? connectionString.includes('localhost') || connectionString.includes('127.0.0.1') : true;

const pool = new Pool({ 
  connectionString,
  ssl: isLocalhost ? false : { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
