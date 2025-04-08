variable "GITHUB_TEST_USER" {}
variable "GITHUB_TEST_ORGANIZATION" {}
variable "GITHUB_TEST_IMAGE_NAME" {}
variable "GITHUB_TEST_IMAGE_TAG" {}

target "default" {
  context = "."
  dockerfile = "Dockerfile"
  platforms = [
    "linux/amd64",
#    "linux/arm64",
  ]
  tags = [
    "ghcr.io/${GITHUB_TEST_USER}/${GITHUB_TEST_IMAGE_NAME}:${GITHUB_TEST_IMAGE_TAG}",
    "ghcr.io/${GITHUB_TEST_ORGANIZATION}/${GITHUB_TEST_IMAGE_NAME}:${GITHUB_TEST_IMAGE_TAG}",
  ]
}
