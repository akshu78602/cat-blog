module "s3_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket_name = var.bucket_name
  acl    = var.acl


  versioning = {
    enabled = true
  }
}