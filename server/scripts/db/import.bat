@echo off
setlocal enableextensions enabledelayedexpansion

echo Importing fresh database (drop, create, migrate, seed)...
call npx sequelize-cli db:drop
call npx sequelize-cli db:create
call npx sequelize-cli db:migrate
call npx sequelize-cli db:seed:all
echo Database import completed.

endlocal


