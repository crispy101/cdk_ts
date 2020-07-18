import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as vpc from '../lib/vpc-stack';

export class SecurityStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda_sg = new ec2.SecurityGroup(this, 'lambda_sg', {
        vpc: vpc,
        securityGroupName: 'lambda_sg',
        description: "SG for Lambda Functions",
        allowAllOutbound: true
    } 
    )
  }
}