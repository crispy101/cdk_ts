import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ssm from '@aws-cdk/aws-ssm';
import * as cdn from '@aws-cdk/aws-cloudfront';

export class S3Stack extends cdk.Stack {
    readonly artifactbucket: s3.Bucket
    readonly frontendbucket: s3.Bucket
    // OAI needs to be created with the s3 bucket. Unless, it will cause a cyclinc reference error.
    readonly oai: cdn.OriginAccessIdentity

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')
    
        const account_id = cdk.Aws.ACCOUNT_ID
        const region = cdk.Aws.REGION
        const lambda_bucket = new s3.Bucket(this, 'lambda-bucket', {
            accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            bucketName: account_id+'-'+env_name+'-'+region+'-lambda-deploy-packages',
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicAcls: true,
                blockPublicPolicy: true,
                ignorePublicAcls: true,
                restrictPublicBuckets: true
            }),
            removalPolicy: cdk.RemovalPolicy.DESTROY
            })

        this.artifactbucket = new s3.Bucket(this, 'artifactbucket', {
            accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            bucketName: account_id+'-'+env_name+'-'+region+'-build-artifacts',
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicAcls: true,
                blockPublicPolicy: true,
                ignorePublicAcls: true,
                restrictPublicBuckets: true
            }),
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })

        this.frontendbucket = new s3.Bucket(this, 'frontendbucket', {
            accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            bucketName: account_id+'-'+env_name+'-'+region+'-frontend',
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicAcls: true,
                blockPublicPolicy: true,
                ignorePublicAcls: true,
                restrictPublicBuckets: true
            }),
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })

        this.oai = new cdn.OriginAccessIdentity(this, 'OAI')

        new ssm.StringParameter(this, 'ssm-lambda-bucket', {
            parameterName: '/'+env_name+'/lambda-s3-bucket',
            stringValue: lambda_bucket.bucketName
            })

        new ssm.StringParameter(this, 'frontend-bucket', {
            parameterName: '/'+env_name+'/frontend-bucket',
            stringValue: this.frontendbucket.bucketName
            })
    }
}