module "ecr_image" {

  source               = "./tf_modules/ecr"
  ecr_repo_name        = var.ecr_repo_name
  repo_types           = var.repo_types

  scan_image_on_push = var.scan_image_on_push

}

import {

id =  "cat-blogs"
to = module.ecr_image.aws_ecr_repository.repo


}


module "iam_oidc" {
  source= "./tf_modules/iam"
  role_name =  var.role_name
  policy_name= var.policy_name
  repo_name= var.repo_name
  repo_owner= var.repo_owner



}

import {
id =  "abc"
to = module.iam_oidc.aws_iam_role.role
}

import {
  id = "arn:aws:iam::424851482428:oidc-provider/token.actions.githubusercontent.com"
  to = module.iam_oidc.aws_iam_openid_connect_provider.default
}