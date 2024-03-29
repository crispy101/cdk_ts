import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdn from '@aws-cdk/aws-cloudfront';
import * as ssm from '@aws-cdk/aws-ssm'
import * as r53target from '@aws-cdk/aws-route53-targets'
import * as r53 from '@aws-cdk/aws-route53'
import * as acm from '@aws-cdk/aws-certificatemanager'


export class CdnStack extends cdk.Stack {
    readonly distibution: cdn.CloudFrontWebDistribution

    constructor(scope: cdk.Construct, id: string, 
        frontendbucket: s3.Bucket, oai: cdn.OriginAccessIdentity, HostedZone: r53.HostedZone,  SSLCert: acm.Certificate, props?: cdk.StackProps) {
        // OAI needs to be created with the s3 bucket. Unless, it will cause a cyclinc reference error.

        super(scope, id, props);
        
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')

        this.distibution = new cdn.CloudFrontWebDistribution(this, 'webhosting-cdn', {
            originConfigs: [{
                    s3OriginSource: {
                        s3BucketSource: frontendbucket, 
                        originAccessIdentity: oai
                    },
                    behaviors: [ {isDefaultBehavior: true}],
                    originPath: '/build',
                }],
            errorConfigurations: [
                {
                    errorCode: 400,
                    responseCode: 200,
                    responsePagePath: '/'
                },
                {
                    errorCode: 403,
                    responseCode: 200,
                    responsePagePath: '/'
                },
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: '/'
                }
            ],
            aliasConfiguration: {
                acmCertRef: SSLCert.certificateArn,
                names: ['app.'+HostedZone.zoneName, HostedZone.zoneName ]
            }
        }
        )

        new r53.ARecord(this, 'app', {
            recordName: 'app',
            target: r53.RecordTarget.fromAlias(new r53target.CloudFrontTarget(this.distibution)),
            zone: HostedZone, 
            ttl: cdk.Duration.minutes(3)
        })

        new ssm.StringParameter(this, 'cdn-dist-id', {
            parameterName: '/'+env_name+'/app-distribution-id',
            stringValue: this.distibution.distributionId
        })
        new ssm.StringParameter(this, 'cdn-url', {
            parameterName: '/'+env_name+'/app-cdn-url',
            stringValue: this.distibution.domainName
        })
    }
}
