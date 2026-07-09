#!/bin/sh
set -eu

./build.sh
docker tag mochiroute-app 325879634266.dkr.ecr.us-east-1.amazonaws.com/mochiroute-app:latest
docker push 325879634266.dkr.ecr.us-east-1.amazonaws.com/mochiroute-app:latest
