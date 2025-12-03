terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 5.44.0"
    }
  }
}


provider "aws" {

  region = "us-east-1" #where the resource will be created 

}