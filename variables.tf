variable "ecr_repo_name" {

  type        = string
  description = "name of repo"

}

variable "repo_types" {

  type        = string
  default     = "MUTABLE"
  description = "weather the repo should be mutable or immutable "
}



variable "scan_image_on_push" {

  type        = bool
  default     = true
  description = "scans images on push for vurnabilities"

}

variable "bucket_name" {

    type= string


}

variable "acl"{

    type= string
    default= "private"

}

variable "role_name" {

  type = string

}

variable "policy_name" {

  type = string

}

variable "repo_owner" {

  type = string

}

variable "repo_name" {


  type = string
}

variable "vpc_id" {
  type        = string
  description = "Existing VPC ID for the EKS cluster"
}

variable "subnet_ids" {
  type        = list(string)
  description = "List of existing subnet IDs for EKS cluster"
}

variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
}
