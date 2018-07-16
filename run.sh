#!/bin/bash

echo "Brining down previously-run stack..."
docker-compose down

echo "Bringing up the stack"
docker-compose up test
