import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs'
import * as ecr from '@aws-cdk/aws-ecr'
import { countReset } from 'console';


export class EcsStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, props?: cdk.StackProps) {
        
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env');
        
        // const ecr_path = '528928441350.dkr.ecr.ap-southeast-2.amazonaws.com/'
        
        // Creation order in a cluster is important due to the referencing order. 
        // Cluster && TaskDef before ContainerDef (which TaskDef this belongs to) before Service (which TaskDef - must have one or more essential Container - to use)
        // Create ECS Clusters
        const backendCluster = new ecs.Cluster(this, 'Backend-cluster', {
            capacity: {
                instanceType: new ec2.InstanceType('t2.micro'), // Needs to be parameterised via env setup in app.ts
                allowAllOutbound: true //Default. Container instances do require external network access to communicate with the Amazon ECS service endpoint. Complete the following steps to add these optional security group rules.
            },
            vpc: vpc
        })
        // Task Definition. 
        const appTaskDefinition = new ecs.Ec2TaskDefinition(this, 'App-taskdefinition')
        const utilTaskDefinition = new ecs.Ec2TaskDefinition(this, 'Util-taskdefinition')


        // ECS Container Definition
        // To-do: control outbound allowlist
        const appImageTag = '0001' // Needs to be parameterised via env setup in app.ts
        const appRepo = new ecr.Repository(this, 'app-repo', {
            imageScanOnPush: true,
            repositoryName: 'app',
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })
        const appContainer = new ecs.ContainerDefinition(this, 'app', {
            image: ecs.ContainerImage.fromEcrRepository(appRepo, appImageTag), 
            taskDefinition: appTaskDefinition,
            memoryLimitMiB: 128,
            essential: true
        })
        const appService = new ecs.Ec2Service(this, 'App-service', {
            cluster: backendCluster,
            taskDefinition: appTaskDefinition
        })

        const cronImageTag = '0001' // Needs to be parameterised via env setup in app.ts
        const cronRepo = new ecr.Repository(this, 'cron-repo', {
            imageScanOnPush: true,
            repositoryName: 'cron',
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })
        const cronContainer = new ecs.ContainerDefinition(this, 'cron', {
            image: ecs.ContainerImage.fromEcrRepository(cronRepo, cronImageTag), 
            taskDefinition: utilTaskDefinition,
            memoryLimitMiB: 64,
            essential: true
        })
        const utilAppContainer = new ecs.ContainerDefinition(this, 'util-app', {
            image: ecs.ContainerImage.fromEcrRepository(appRepo, appImageTag), 
            taskDefinition: utilTaskDefinition,
            memoryLimitMiB: 64
        })
        const utilService = new ecs.Ec2Service(this, 'Util-service', {
            cluster: backendCluster,
            taskDefinition: utilTaskDefinition
        })
    }
}