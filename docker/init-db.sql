-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE sakura_db TO sakura;
