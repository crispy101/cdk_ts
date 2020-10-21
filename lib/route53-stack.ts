import * as cdk from '@aws-cdk/core';
import * as r53 from '@aws-cdk/aws-route53';
import * as r53targets from '@aws-cdk/aws-route53-targets';

export class DnsStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
         
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env');
        
        const hosted_zone = new r53.HostedZone(this, 'somewhereoverthe.cloud', {
            zoneName: 'somewhereoverthe.cloud'
        })
        
        const dev = new r53.ARecord(this, 'dev', {
            target: { values: ["1.1.1.1"]},
            zone: hosted_zone,
            ttl: cdk.Duration.minutes(3)
        })
    }
}