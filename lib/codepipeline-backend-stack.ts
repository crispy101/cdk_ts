import * as cdk from '@aws-cdk/core';
import * as cp from '@aws-cdk/aws-codepipeline';
import * as cp_actions from '@aws-cdk/aws-codepipeline-actions';
import * as cb from '@aws-cdk/aws-codebuild';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as ssm from '@aws-cdk/aws-ssm';

export class CodePipelineStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, artifactbucket: s3.Bucket, props?: cdk.StackProps) {
         
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')

        // Let's try to directly reference a bucket object vs the bucket name
        // const artifact_bucket = s3.Bucket.fromBucketName(this, 'artifactbucket', artifactbucket)

        const github_token = cdk.SecretValue.secretsManager(
            env_name+'/github-token', {jsonField: 'github-token'}
        )

        const build_project = new cb.PipelineProject(this, 'buildproject', {
            projectName: env_name+'-'+pjt_name+'-build-project',
            description: 'package lambda functions',
            environment: {
                buildImage: cb.LinuxBuildImage.STANDARD_4_0,
                environmentVariables: {
                    'ENV': {value: 'dev'},
                    'PRJ': {value: pjt_name},
                    'STAGE': {value: 'dev'}
                }
            },
            cache: cb.Cache.bucket(artifactbucket, { prefix: 'codebuild-cache'}),
            buildSpec: cb.BuildSpec.fromObject({
                'version': '0.2',
                'phases': {
                    'install': {
                        'commands': [
                            'echo "--INSTALL PHASE--"',
                            'npm install --silent --no-progress serverless -g'
                        ]
                    },
                    'pre_build': {
                        'commands': [
                            'echo "--PRE BUILD PHASE--"',
                            'npm install --silent --no-progress'
                        ]
                    },
                    'build': {
                        'commands': [
                            'echo "--BUILD PHASE--"',
                            'serverless deploy -s $STAGE'
                        ]
                    }
                },
                'artifacts': {
                    'files': [ '**/*' ],
                    'base-directory': '.serverless'
                }
            })
        })

        const pipeline = new cp.Pipeline(this, 'backend-pipeline', {
            pipelineName: env_name+'-'+pjt_name+'-backend-pipe',
            artifactBucket: artifactbucket,
            restartExecutionOnUpdate: false
        })

        const source_output = new cp.Artifact('source')
        const build_output = new cp.Artifact('build')

        pipeline.addStage({
            stageName: 'Source', 
            actions: [ new cp_actions.GitHubSourceAction({
                oauthToken: github_token,
                output: source_output, 
                owner: 'crispy101',
                branch: 'master',
                repo: 'udemycdk',
                actionName: 'GithubSource'
            })]
        })

        pipeline.addStage({
            stageName: 'Deploy', 
            actions: [ new cp_actions.CodeBuildAction({
                actionName: 'DeployToDev',
                project: build_project,
                input: source_output,
                outputs: [build_output]
            })]
        })

        build_project.role?.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
        )

        const accout_id = cdk.Aws.ACCOUNT_ID
        const region = cdk.Aws.REGION
        
        new ssm.StringParameter(this, 'accountId', {
            parameterName: '/'+env_name+'/account-id',
            stringValue: accout_id
        })

        new ssm.StringParameter(this, 'region', {
            parameterName: '/'+env_name+'/region',
            stringValue: region
        })
      }
    }
