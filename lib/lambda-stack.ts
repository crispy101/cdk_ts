// Sample for cdk-based lambda/apigw deployment demontration. 
// Actual resources can be deployed via serverless framework
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
 
export class LambdaStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
         
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')
    
        const lambda_function = new lambda.Function(this, 'helloworldfunction', {
            code: lambda.Code.asset('lambda'),
            runtime: lambda.Runtime.PYTHON_3_8,
            handler: 'hello.handler'
        })

        const api_gateway = new apigw.LambdaRestApi(this, 'helloworld', {
            handler: lambda_function,
            restApiName: 'mylambdaapi',
            // Comment out below if 'ANY' is required
            proxy: false
        })

        // Comment out if 'ANY' is required
        api_gateway.root.addMethod('GET')
    }
}