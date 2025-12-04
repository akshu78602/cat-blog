terraform {
  backend "s3" {
    bucket  = "qa-catblog-tfstate"
    key     = "terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
