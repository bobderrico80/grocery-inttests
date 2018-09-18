#!/bin/bash

echo "Bringing down previously-run stack..."
docker-compose down

echo "Bringing up the stack"
docker-compose up test
