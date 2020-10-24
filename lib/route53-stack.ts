import * as cdk from '@aws-cdk/core';
import * as r53 from '@aws-cdk/aws-route53';
import * as ssm from '@aws-cdk/aws-ssm'

export class DnsStack extends cdk.Stack {
    readonly hosted_zone: r53.HostedZone
        
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env');
        
        this.hosted_zone = new r53.HostedZone(this, 'somewhereoverthe.cloud', {
            zoneName: 'somewhereoverthe.cloud'
        })
        
        // Dummy record for testing. Actual CNAME records is creaded in ACM or CDN stack. 
        // const dev = new r53.ARecord(this, 'dev', {
        //     target: { values: ["1.1.1.1"]},
        //     zone: hosted_zone,
        //     ttl: cdk.Duration.minutes(3)
        // })

        // This was for ACM referencing the zone but doesn't has to be in SSM; Just let ACM stack use hostedZoneId as a parameter.  
        new ssm.StringParameter(this, 'zone-id', {
            parameterName: '/'+env_name+'/zone-id',
            stringValue: this.hosted_zone.hostedZoneId
        })
    }
}