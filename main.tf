module "ecr_image" {

  source        = "./modules/ecr"
  ecr_repo_name = var.ecr_repo_name
  repo_types    = var.repo_types

  scan_image_on_push = var.scan_image_on_push

}

import {

  id = "cat-blogs"
  to = module.ecr_image.aws_ecr_repository.repo


}


module "iam_oidc" {
  source      = "./modules/iam"
  role_name   = var.role_name
  policy_name = var.policy_name
  repo_name   = var.repo_name
  repo_owner  = var.repo_owner



}

import {
  id = "abc"
  to = module.iam_oidc.aws_iam_role.role
}

import {
  id = "https://token.actions.githubusercontent.com"
  to = module.iam_oidc.aws_iam_openid_connect_provider.default
}

import {
  id = "arn:aws:iam::424851482428:policy/test1"
  to = module.iam_oidc.aws_iam_policy.policy
}

data "aws_vpc" "default_vpc" {
  default = true
}

data "aws_subnets" "default_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default_vpc.id]
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.21.0"

  cluster_name = var.cluster_name
  vpc_id       = data.aws_vpc.default_vpc.id
  subnet_ids   = data.aws_subnets.default_subnets.ids

  cluster_enabled_log_types = []
  create_cloudwatch_log_group = false

}