#!/bin/bash
# Fix Prisma schema to use PostgreSQL

cd /root/reagent

# Update provider to postgresql
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# Remove SQLite-specific settings if any
sed -i '/relationMode/d' prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

echo "✅ Prisma schema updated to PostgreSQL"
