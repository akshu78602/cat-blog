resource "aws_iam_openid_connect_provider" "default" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]
  thumbprint_list = [

    "6938fd4d98bab03faadb97b34396831e3780aea1"

  ]

}


resource "aws_iam_role" "role" {
  name = var.role_name

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Federated = aws_iam_openid_connect_provider.default.arn

        }


        Condition = {

          StringEquals = {

            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"

          },

          StringLike = {

            "token.actions.githubusercontent.com:sub" = "repo:${var.repo_owner}/${var.repo_name}:*"
          }

        }

      }

    ]
  })

  tags = {
    tag-key = "tag-value"
  }
}

resource "aws_iam_policy" "policy" {
  name = var.policy_name
  path = "/"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "eks:*",
          "s3:*",
          "ecr:*",
          "iam:*",
          "sts:*",
          "kms:*",
          "ec2:*",
          "logs:*"

        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}


resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.role.name
  policy_arn = aws_iam_policy.policy.arn
}
