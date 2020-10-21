import * as cdk from '@aws-cdk/core';
import * as wafv2 from '@aws-cdk/aws-wafv2';


export class WafStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
         
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env');
        
        const basic_rule = {
                    name: 'basic_rule',
                    priority: 0,
                    statement: {
                        managedRuleGroupStatement: {
                            name: 'AWSManagedRulesCommonRuleSet',
                            vendorName: 'AWS'
                        }
                    },
                    overrideAction: { count: {} },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        metricName: 'AWSManagedRule',
                        sampledRequestsEnabled: true
                    }
                }

        const web_acl = new wafv2.CfnWebACL(this, 'WebACL-TS', {
            defaultAction: {
                allow: {}
            },
            scope: 'CLOUDFRONT',
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: 'WebACL',
                sampledRequestsEnabled: true,
            },
            rules: [ basic_rule ]
            }
        )
    }
}
