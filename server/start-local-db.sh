#!/bin/bash

CONTAINER_NAME="mochiroute-db"

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Starting existing container..."
  docker start -ai $CONTAINER_NAME
else
  echo "Creating new container..."
  docker run --name $CONTAINER_NAME \
    -e POSTGRES_USER=mochi \
    -e POSTGRES_PASSWORD=mochi \
    -e POSTGRES_DB=mochiroute \
    -p 5432:5432 \
    -it postgres:16
fi