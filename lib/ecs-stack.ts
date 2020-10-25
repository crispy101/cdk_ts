import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs'
import * as ecr from '@aws-cdk/aws-ecr'


export class EcsStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, props?: cdk.StackProps) {
        
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env');
        
        const ecr_path = '528928441350.dkr.ecr.ap-southeast-2.amazonaws.com/'

        // Create ECR 
        const reponames = ['code', 'app', 'cron', 'management']
        for (var repo of reponames) {
            const repository = new ecr.Repository(this, repo+'-repo', {
                imageScanOnPush: true,
                repositoryName: repo
                }
            )
        }
        
        const repo_test = new ecr.Repository(this, 'test-repo')

        
        // Create ECS Cluster
        const cluster = new ecs.Cluster(this, 'Backend-cluster', {
            capacity: {
                instanceType: new ec2.InstanceType('t2.micro'), // Needs to be parameterised via env setup in app.ts
                allowAllOutbound: true //Default. Container instances do require external network access to communicate with the Amazon ECS service endpoint. Complete the following steps to add these optional security group rules.
            },
            vpc: vpc
        })

        // Task Definition
        const taskDefinition = new ecs.Ec2TaskDefinition(this, 'Backend-taskdefinition')

        // ECS Container Definition
        // To-do: control outbound allowlist
        const containerCron = new ecs.ContainerDefinition(this, 'cron', {
            image: ecs.ContainerImage.fromEcrRepository(repo_test, '0001'), // To-do: itertate or reference the repositories created in the for..loop.
            taskDefinition: taskDefinition,
            memoryLimitMiB: 64
        })

        // ECS EC2Service (vs Fargate)
        const service = new ecs.Ec2Service(this, 'Backend-service', {
            cluster: cluster,
            taskDefinition: taskDefinition
        })



        // Create EC2 ASG for ECS Cluster
    }
}