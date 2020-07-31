
import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as ssm from '@aws-cdk/aws-ssm';

 
export class CognitoStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
         
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')
        

        const user_pool = new cognito.CfnUserPool(this, 'cognito_userpool', {
            autoVerifiedAttributes: [ 'email' ],
            usernameAttributes: [ 'email', 'phone_number' ],
            userPoolName: pjt_name+'-user-pool',
            schema: [
                {
                    attributeDataType: 'String',
                    name: 'param1',
                    mutable: true
                }
            ],
            policies: { 
                passwordPolicy: {
                    minimumLength: 10,
                    requireLowercase: true,
                    temporaryPasswordValidityDays: 10
                }
            }

        })

        const user_pool_client = new cognito.CfnUserPoolClient(this, 'pool-client', {
            userPoolId: user_pool.ref,
            clientName: pjt_name+'-'+env_name+'-app-client'
        })

        const identity_pool = new cognito.CfnIdentityPool(this, 'identity-pool', {
            allowUnauthenticatedIdentities: false,
            cognitoIdentityProviders: [
                {
                    clientId: user_pool_client.ref,
                    providerName: user_pool.attrProviderName
                }
            ],
            identityPoolName: pjt_name+'-'+env_name+'-identity-pool'
        })

        new ssm.StringParameter(this, 'app-id', {
            parameterName: '/'+env_name+'/cognito-app-client-id',
            stringValue: user_pool_client.ref
        })

        new ssm.StringParameter(this, 'user-pool-id', {
            parameterName: '/'+env_name+'/cognito-user-pool-id',
            stringValue: user_pool_client.userPoolId
        })


        new ssm.StringParameter(this, 'identity-pool-id', {
            parameterName: '/'+env_name+'/cognito-identity-pool-id',
            stringValue: identity_pool.ref
        })

    }
}

