import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import { isMainThread } from 'worker_threads';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import * as ssm from '@aws-cdk/aws-ssm';


export class SecurityStack extends cdk.Stack {
  readonly bastion_sg: ec2.SecurityGroup
  readonly lambda_sg: ec2.SecurityGroup
  readonly redis_sg: ec2.SecurityGroup
  readonly kibana_sg: ec2.SecurityGroup


  constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, props?: cdk.StackProps) {
    super(scope, id, props);

    const pjt_name = this.node.tryGetContext('project_name');
    const env_name = this.node.tryGetContext('env')

    this.lambda_sg = new ec2.SecurityGroup(this, 'lambda_sg', {
        vpc: vpc,
        securityGroupName: 'lambda_sg',
        description: "SG for Lambda Functions",
        allowAllOutbound: true
    })

    this.bastion_sg = new ec2.SecurityGroup(this, 'bastion_sg', {
        vpc: vpc,
        securityGroupName: 'bastion_sg',
        description: "SG for Bastion Host",
        allowAllOutbound: true
    })

    this.bastion_sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "SSH Access")

    this.redis_sg = new ec2.SecurityGroup(this, 'redis_sg', {
        securityGroupName: 'redis_sg',
        vpc: vpc,
        description: "SG for Redis Cluster",
        allowAllOutbound: true
    })

    this.redis_sg.addIngressRule(this.lambda_sg, ec2.Port.tcp(6379), 'Access from Lambda Function')
    this.redis_sg.addIngressRule(this.bastion_sg, ec2.Port.tcp(6379), 'Access from Bastion Host')

    const lambda_role = new iam.Role(this, 'lambda_role', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        roleName: 'lambda_role',
        managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaBasicExecutionRole'
            )
        ]
    })

    lambda_role.addToPolicy(new iam.PolicyStatement({
            actions: ['s3:*', 'rds:*'], 
            resources: ['*'], 
            effect: iam.Effect.ALLOW
            }
        )
    )

    this.kibana_sg = new ec2.SecurityGroup(this, 'kibana_sg', {
        vpc: vpc,
        securityGroupName: 'kibana_sg',
        description: "SG for Kibana Access",
        allowAllOutbound: true
    })

    this.kibana_sg.addIngressRule(this.bastion_sg, ec2.Port.tcp(443), "Access from jumpbox")

    const kibana_role = new iam.CfnServiceLinkedRole(this, 'kibanarole', {
        awsServiceName: 'es.amazonaws.com'
    })

    new ssm.StringParameter(this, 'lambdasg-param', {
        parameterName: '/'+env_name+'/lambda-sg',
        stringValue: this.lambda_sg.securityGroupId
    })

    new ssm.StringParameter(this, 'lambdarole-param', {
        parameterName: '/'+env_name+'/lambda-role-arn',
        stringValue: lambda_role.roleArn
    })

    new ssm.StringParameter(this, 'lambdarole-param-name', {
        parameterName: '/'+env_name+'/lambda-role-name',
        stringValue: lambda_role.roleName
    })

  }
}