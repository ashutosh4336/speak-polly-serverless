# speak-polly-serverless

This is a simple serverless application that uses Amazon Polly to convert text to speech.

the serverless.yml file contains the following: - a lambda function that converts text to speech - two S3 buckets, one for the input (Text File) and one for the output (generated audio files storage in S3 Bucket) - IAM role for the lambda function - IAM policy for the lambda function

## How to use

1. Install the serverless framework
2. Install the AWS CLI
3. Configure the AWS CLI
   - `aws configure`
   - enter your AWS Access Key ID
   - enter your AWS Secret Access Key
   - enter your AWS region
   - enter your AWS output format `json`
   - `aws sts get-caller-identity` to verify your credentials
   - I've used the `serverless-admin` profile as I've multiple aws accounts configured, but you can use the default profile.
   - To use the `serverless-admin` profile, you need to add the following to your `~/.aws/credentials` file:
     - `[serverless-admin]`
     - `aws_access_key_id = <your access key>`
     - `aws_secret_access_key = <your secret key>`
   - To use Default profile, you need to add the following to your `~/.aws/credentials` file:
     - `[default]`
     - `aws_access_key_id = <your access key>`
     - `aws_secret_access_key = <your secret key>`
4. Clone this repository
5. Run `npm install` to install the dependencies
6. Run `serverless deploy` to deploy the application
7. Upload a text file to the input bucket
8. Wait for the lambda function to convert the text to speech
9. Download the audio file from the output bucket

Yayyy! You're done!

## Author

This project was created by [Ashutosh](https://ashutosh.app) [`Not Under Active Development`]

- [TheHTTP](https://thehttp.in) [Side Project `Under Development`]
- [TheHTTPBlog](https://blog.thehttp.in) [Side Project `Under Development`]

Twitter: [@ashutosh4336](https://twitter.com/ashutosh4336)
