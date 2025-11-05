#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV=${NODE_ENV:-development}

echo "Running migrations for NODE_ENV=$NODE_ENV..."
npx sequelize-cli db:migrate
echo "Migrations completed."


