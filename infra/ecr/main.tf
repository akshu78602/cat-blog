terraform{
    required_version= "~> 1.1.7"
    required_providers{
        aws= {source= "hashicorp/aws", version = ">=5.0, <6.0"}
    }

}

provider "aws"{

    region="us-east-1" #where the resource will be created 

}

resource "aws_ecr_repository" "repo" {
  name                 = "cat-blogs"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}