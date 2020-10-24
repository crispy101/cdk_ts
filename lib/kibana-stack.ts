import * as cdk from '@aws-cdk/core';
import * as es from '@aws-cdk/aws-elasticsearch'
import * as ec2 from '@aws-cdk/aws-ec2';


export class KibanaStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, 
        vpc: ec2.Vpc, kibanasg: ec2.SecurityGroup, props?: cdk.StackProps) {

        super(scope, id, props);
        
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')

        const subnets = vpc.privateSubnets

        const es_domain = new es.CfnDomain(this, 'elasticsearch', {
            accessPolicies: {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {
                            "AWS": "*"
                        },
                        "Action": "es:*",
                        "Resource": "*"
                    }
                ]}, 
            domainName: pjt_name+'-'+env_name+'-domain',
            elasticsearchClusterConfig: {
                dedicatedMasterEnabled: false,
                instanceCount: 1,
                instanceType: 't2.small.elasticsearch'
            },
            ebsOptions: {
                ebsEnabled: true,
                volumeType: 'gp2',
                volumeSize: 10
            },
            vpcOptions: {
                securityGroupIds: [kibanasg.securityGroupId],
                subnetIds: [subnets[0].subnetId]
            },
            elasticsearchVersion: '7.4'
        })
        }
    }
