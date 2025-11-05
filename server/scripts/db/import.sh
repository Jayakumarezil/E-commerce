#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV=${NODE_ENV:-development}

echo "Importing fresh database (drop, create, migrate, seed) for NODE_ENV=$NODE_ENV..."
npx sequelize-cli db:drop || true
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
echo "Database import completed."


