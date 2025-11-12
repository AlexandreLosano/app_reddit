-- Adicionar campo para rastrear última atualização
ALTER TABLE subreddits ADD COLUMN last_cached TIMESTAMP NULL DEFAULT NULL;
