#!/bin/sh
set -eu

aws ecr get-login-password --region us-east-1 --profile dev \
  | docker login --username AWS --password-stdin 325879634266.dkr.ecr.us-east-1.amazonaws.com

SERVICE=mochiroute-app
STAMP=`date -Iseconds -u | sed -e 's/:/-/g' | sed -e 's/\+.*/Z/'`

docker build . --platform linux/amd64 --no-cache -t "$SERVICE:latest"

CMD="docker tag $SERVICE:latest 325879634266.dkr.ecr.us-east-1.amazonaws.com/$SERVICE:latest"
echo $CMD
$CMD

CMD="docker tag $SERVICE:latest 325879634266.dkr.ecr.us-east-1.amazonaws.com/$SERVICE:$STAMP"
echo $CMD
$CMD