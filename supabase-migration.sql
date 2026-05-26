-- Adiciona coluna para armazenar o nome de usuário do Discord
ALTER TABLE players ADD COLUMN IF NOT EXISTS discord_name TEXT;

-- Atualiza jogadores existentes com um fallback para o nick do Minecraft
UPDATE players SET discord_name = nick WHERE discord_name IS NULL;

-- Cria tabela de pedidos dos tickets
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  discord_name TEXT,
  order_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  claimed_by TEXT,
  claimed_at TIMESTAMPTZ,
  ticket_channel_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cria índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_players_discord_name ON players(discord_name);
