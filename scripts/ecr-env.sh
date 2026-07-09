# Shared ECR settings for build/push scripts.
# Source from repo root: . "$ROOT_DIR/scripts/ecr-env.sh"

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-dev}"
IMAGE_NAME="${IMAGE_NAME:-mochiroute-app}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
PLATFORM="${PLATFORM:-linux/arm64}"

if [ -z "${AWS_ACCOUNT_ID:-}" ]; then
  if ! command -v aws >/dev/null 2>&1; then
    echo "Error: aws CLI not found. Set AWS_ACCOUNT_ID manually." >&2
    exit 1
  fi

  if [ -n "$AWS_PROFILE" ]; then
    AWS_ACCOUNT_ID="$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text)"
  else
    AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
  fi
fi

if [ -z "$AWS_ACCOUNT_ID" ] || [ "$AWS_ACCOUNT_ID" = "None" ]; then
  echo "Error: could not resolve AWS account ID." >&2
  echo "Set AWS_ACCOUNT_ID or configure AWS CLI profile '$AWS_PROFILE'." >&2
  exit 1
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
LOCAL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
ECR_IMAGE_LATEST="${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
