import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ssm from '@aws-cdk/aws-ssm';

export class VPCStack extends cdk.Stack {
  readonly vpc: ec2.Vpc

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pjt_name = this.node.tryGetContext('project_name');
    const env_name = this.node.tryGetContext('env')

    this.vpc = new ec2.Vpc(this, 'VPC', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE,
        },
        {
          cidrMask: 24,
          name: 'Isolated',
          subnetType: ec2.SubnetType.ISOLATED,
        }
      ],
      natGateways: 1
    })

    var count = 1
    for (var ps of this.vpc.privateSubnets) {
      new ssm.StringParameter(this, 'private-subnet-'+count, {
        stringValue: ps.subnetId,
        parameterName: '/'+env_name+'/private-subnet-'+count
      })
      count += 1
    }
  }
}
