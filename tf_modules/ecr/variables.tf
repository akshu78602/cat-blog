variable "ecr_repo_name"{

    type = string
    description= "name of repo"

}

variable "repo_types"{

        type = string
        default = "MUTABLE"
        description= "weather the repo image tags should be mutable or immutable "

        validation {

                    condition = contains(["IMMUTABLE","MUTABLE"], var.repo_types)
                    error_message = "Images repo can either b mutable or immutable"

                }

}
variable "scan_image_on_push"{

    type = bool
    default= true
    description= "scans images on push for vurnabilities"

}