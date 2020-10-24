import * as cdk from '@aws-cdk/core';
import * as r53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager'
import { Method } from '@aws-cdk/aws-apigateway';

export class AcmStack extends cdk.Stack {
    readonly SSLCert: acm.Certificate

    constructor(scope: cdk.Construct, id: string, HostedZone: r53.HostedZone, props?: cdk.StackProps) {
        
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env');
        
        this.SSLCert = new acm.DnsValidatedCertificate(this, 'SSLCert', {
            hostedZone: HostedZone, 
            domainName: HostedZone.zoneName,
            subjectAlternativeNames: ['*.'+HostedZone.zoneName ],
            region: 'us-east-1'
        })
    }
}
