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