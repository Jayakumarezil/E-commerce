#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV=${NODE_ENV:-development}

echo "Seeding database for NODE_ENV=$NODE_ENV..."
npx sequelize-cli db:seed:all
echo "Seeding completed."


