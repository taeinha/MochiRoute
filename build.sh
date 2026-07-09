#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "$ROOT_DIR/scripts/ecr-env.sh"

STAMP="$(date -Iseconds -u | sed -e 's/:/-/g' -e 's/\+.*/Z/')"
ECR_IMAGE_STAMP="${ECR_REGISTRY}/${IMAGE_NAME}:${STAMP}"

echo "ECR registry: ${ECR_REGISTRY}"
echo "Local image:  ${LOCAL_IMAGE}"
echo "Platform:     ${PLATFORM}"

if [ -n "$AWS_PROFILE" ]; then
  aws ecr get-login-password --region "$AWS_REGION" --profile "$AWS_PROFILE" \
    | docker login --username AWS --password-stdin "$ECR_REGISTRY"
else
  aws ecr get-login-password --region "$AWS_REGION" \
    | docker login --username AWS --password-stdin "$ECR_REGISTRY"
fi

docker build "$ROOT_DIR" --platform "$PLATFORM" --no-cache -t "$LOCAL_IMAGE"
docker tag "$LOCAL_IMAGE" "$ECR_IMAGE_LATEST"
docker tag "$LOCAL_IMAGE" "$ECR_IMAGE_STAMP"

echo "Tagged:"
echo "  ${ECR_IMAGE_LATEST}"
echo "  ${ECR_IMAGE_STAMP}"
