import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ssm from '@aws-cdk/aws-ssm';

import { accessSync } from 'fs';
import { BlockPublicAccess } from '@aws-cdk/aws-s3';
import { SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER } from 'constants';


export class S3Stack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
  
      const pjt_name = this.node.tryGetContext('project_name');
      const env_name = this.node.tryGetContext('env')
  
      const account_id = cdk.Aws.ACCOUNT_ID
      const region = cdk.Aws.REGION
      const lambda_bucket = new s3.Bucket(this, 'lambda-bucket', {
          accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
          encryption: s3.BucketEncryption.S3_MANAGED,
          bucketName: account_id+'-'+env_name+'-'+region+'-lambda-deploy-pacakages',
          blockPublicAccess: new s3.BlockPublicAccess({
              blockPublicAcls: true,
              blockPublicPolicy: true,
              ignorePublicAcls: true,
              restrictPublicBuckets: true
          }),
          removalPolicy: cdk.RemovalPolicy.DESTROY
      }
      )

      new ssm.StringParameter(this, 'ssm-lambda-bucket', {
          parameterName: '/'+env_name+'/lambda-s3-bucket',
          stringValue: lambda_bucket.bucketName
        }
    )
    }
}