terraform {
  required_version = "~> 1.1.7"
  required_providers {
    aws = { source = "hashicorp/aws", version = ">=5.0, <6.0" }
  }

}

provider "aws" {

  region = "us-east-1" #where the resource will be created 

}