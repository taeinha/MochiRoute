#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "$ROOT_DIR/scripts/ecr-env.sh"

"$ROOT_DIR/build.sh"
docker push "$ECR_IMAGE_LATEST"

echo "Pushed ${ECR_IMAGE_LATEST}"
