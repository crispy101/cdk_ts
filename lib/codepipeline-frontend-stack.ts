import * as cdk from '@aws-cdk/core';
import * as cp from '@aws-cdk/aws-codepipeline';
import * as cp_actions from '@aws-cdk/aws-codepipeline-actions';
import * as cb from '@aws-cdk/aws-codebuild';
import * as ccm from '@aws-cdk/aws-codecommit';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as ssm from '@aws-cdk/aws-ssm';
import * as cdn from '@aws-cdk/aws-cloudfront';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { countReset } from 'console';

export class CodePipelineFEStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, webhostingbucket: s3.Bucket, cdnendpoint: cdn.CloudFrontWebDistribution, props?: cdk.StackProps) {
         
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')

        // const cdn_id = ssm.StringParameter.fromStringParameterName(this, 'cdnid', '/'+env_name+'/app-distribution-id')
        // Create Source Repository within the stack
        const source_repo = new ccm.Repository(this, 'repoid', {
            repositoryName: 'devops',
            description: 'frontend app repository'
        })
        // Another way - use a pre-existing repository
        // const source_repo = ccm.Repository.fromRepositoryName(this, 'repoid', 'devops')



        const artifactBucket = new s3.Bucket(this, 'artifiactbucketid', {
            encryption: s3.BucketEncryption.S3_MANAGED,
            accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL
        })

        const build_project = new cb.PipelineProject(this, 'buildfrontend', {
            projectName: env_name+'-'+pjt_name+'-build-frontend',
            description: 'frontend project for SPA',
            environment: {
                buildImage: cb.LinuxBuildImage.STANDARD_4_0,
                environmentVariables: {
                    'distributionid': { value: cdnendpoint.distributionId }
                }
            },
            cache: cb.Cache.bucket(artifactBucket, { prefix: 'codebuild-cache'}),
            buildSpec: cb.BuildSpec.fromObject({
                'version': '0.2',
                'phases': {
                    'install': {
                        'commands': [
                            'echo "--INSTALL PHASE--"',
                            'pip install awscli'
                        ]
                    },
                    'pre_build': {
                        'commands': [
                            'echo "--PRE BUILD PHASE--"',
                            'yarn install'
                        ]
                    },
                    'build': {
                        'commands': [
                            'echo "--BUILD PHASE--"',
                            'yarn run build'
                        ]
                    },
                    'post_build': {
                        'commands': [
                            'echo "--POST BUILD PHASE--"',
                            'aws cloudfront create-invalidation --distribution-id $distributionid --paths "/*" d'
                        ]
                    }
                },
                'artifacts': {
                    'files': [ '**/*' ]
                },
                'cache': {
                    'paths': [ './node_modules/**/*' ]
                }
            })
        })

        const pipeline = new cp.Pipeline(this, 'frontend-pipeline', {
            pipelineName: env_name+'-'+pjt_name+'-frontend-pipe',
            artifactBucket: artifactBucket,
            restartExecutionOnUpdate: false
        })

        const source_output = new cp.Artifact('source')
        const build_output = new cp.Artifact('build')

        pipeline.addStage({
            stageName: 'Source', 
            actions: [ new cp_actions.CodeCommitSourceAction({
                output: source_output, 
                branch: 'master',
                repository: source_repo,
                actionName: 'CodeCommitSource'
            })]
        })

        pipeline.addStage({
            stageName: 'Build', 
            actions: [ new cp_actions.CodeBuildAction({
                actionName: 'Build',
                input: source_output,
                project: build_project,
                outputs: [ build_output ]
            })]
        })

        // Specify the resoure with cdn ARN?
        build_project.role?.addToPolicy(new iam.PolicyStatement(
            {
                actions: [ 'Cloudfront:CreateInvalidataion'],
                resources: [ 'arn:aws:cloudfront::'+cdk.Aws.ACCOUNT_ID+':distribution/'+cdnendpoint.distributionId ]
            }
        ))

        pipeline.addStage({
            stageName: 'Deploy', 
            actions: [ new cp_actions.S3DeployAction({
                actionName: 'Deploy',
                input: build_output,
                extract: true,
                bucket: webhostingbucket
            })]
        })

      }
    }
