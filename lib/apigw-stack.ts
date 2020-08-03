import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as ssm from '@aws-cdk/aws-ssm';
 
export class APIStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
         
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')
    
        const region = cdk.Aws.REGION

        const api_gateway = new apigw.RestApi(this, 'restapi', {
            endpointConfiguration: {
                types: [ apigw.EndpointType.REGIONAL ]
            },
            restApiName: pjt_name+env_name+'-service'
        })

        api_gateway.root.addMethod('GET')

        new ssm.StringParameter(this, 'api-gw', {
            parameterName: '/'+env_name+'/api-gw-url',
            stringValue: 'https://'+api_gateway.restApiId+'.excecute-api.'+region+'.amazonaws.com/'
        })

        new ssm.StringParameter(this, 'api-gw-id', {
            parameterName: '/'+env_name+'/api-gw-id',
            stringValue: 'https://'+api_gateway.restApiId
        })


    }
}
