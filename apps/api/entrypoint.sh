#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "PostgreSQL started"

echo "Waiting for Redis..."
while ! nc -z $REDIS_HOST $REDIS_PORT; do
  sleep 1
done
echo "Redis started"

echo "Running migrations..."
# python manage.py migrate --noinput

echo "Collecting static files..."
# python manage.py collectstatic --noinput

exec "$@"