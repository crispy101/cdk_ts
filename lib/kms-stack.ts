import * as cdk from '@aws-cdk/core';
import * as kms from '@aws-cdk/aws-kms';
import * as ssm from '@aws-cdk/aws-ssm'


export class KMSStack extends cdk.Stack {
    readonly kms_rds: kms.Key
    
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
  
      const pjt_name = this.node.tryGetContext('project_name');
      const env_name = this.node.tryGetContext('env')
  
        this.kms_rds = new kms.Key(this, 'rdskey', {
            description: pjt_name+"-key-rds",
            enableKeyRotation: true
        })

        this.kms_rds.addAlias('alias/'+pjt_name+'-key-rds')
        
        new ssm.StringParameter(this, 'rdskey-param', {
            parameterName: '/'+env_name+'/rds-kms-key',
            stringValue: this.kms_rds.keyId
        })
    }
}
