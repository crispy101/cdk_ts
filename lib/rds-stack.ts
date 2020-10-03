import * as cdk from '@aws-cdk/core';
import * as rds from '@aws-cdk/aws-rds';
import * as ssm from '@aws-cdk/aws-ssm';
import * as kms from '@aws-cdk/aws-kms';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as sm from '@aws-cdk/aws-secretsmanager';
import { SubnetType } from '@aws-cdk/aws-ec2';
import { RemovalPolicy } from '@aws-cdk/core';

export class RDSStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc,
        lambdasg: ec2.SecurityGroup, bastionsg: ec2.SecurityGroup, kmskey: kms.Key,
        props?: cdk.StackProps) {

        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')
        
        const json_template = '{"username": "admin"}'
        const db_cres = new sm.Secret(this, 'db-secret', {
            secretName: env_name+'/rds-secret',
            generateSecretString: {
                includeSpace: false,
                passwordLength: 12,
                generateStringKey: 'rds-password',
                excludePunctuation: true,
                secretStringTemplate: json_template
            }
        })

      const db_mysql = new rds.DatabaseCluster(this, 'mysql', {
          defaultDatabaseName: pjt_name+env_name,
          engine: rds.DatabaseClusterEngine.auroraMysql({version: rds.AuroraMysqlEngineVersion.VER_5_7_12}),
          instanceProps: {
              vpc: vpc, 
              instanceType: new ec2.InstanceType('t3.small'),
              vpcSubnets: { subnetType: SubnetType.ISOLATED }
          },
        //   masterUser: {
        //       username:'admin',
        //       password: db_cres.secretValueFromJson('rds-password')
        //     },
          instances: 1,
          parameterGroup: rds.ParameterGroup.fromParameterGroupName(
              this, 'pg-dev','default.aurora-mysql5.7'
          ),
          storageEncrypted: true,
          storageEncryptionKey: kmskey,
          removalPolicy: RemovalPolicy.DESTROY
        }
        )

      db_mysql.connections.allowDefaultPortFrom(lambdasg, 'access from lambda fuctions')
      db_mysql.connections.allowDefaultPortFrom(bastionsg, 'access from bastion host')

      new ssm.StringParameter(this, 'db-host',{
          parameterName: '/'+env_name+'/db-host',
          stringValue: db_mysql.clusterEndpoint.hostname
      })
    }
}
