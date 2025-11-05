-- Fix dob column to allow NULL values
-- Run this SQL directly in your PostgreSQL database

ALTER TABLE memberships ALTER COLUMN dob DROP NOT NULL;

