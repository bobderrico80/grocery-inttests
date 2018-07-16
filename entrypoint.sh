#!/bin/bash
echo "Waiting for the Grocery API to be ready..."

while true
do
    curl -o /dev/null -s http://app:8080/healthcheck
    if [ $? -eq 0 ]
    then
        echo 'App is READY!'
        break
    fi
    echo "..."
    sleep 1
done

echo "Installing test suite dependencies..."
npm install

echo "Starting tests..."
npm test
