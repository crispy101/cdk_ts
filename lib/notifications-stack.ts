import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as events from '@aws-cdk/aws-events';
import * as logs from '@aws-cdk/aws-logs';
import * as sns from '@aws-cdk/aws-sns';
import * as subscription from '@aws-cdk/aws-sns-subscriptions';


export class NotificationStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
         
        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')

        const lambda_function = new lambda.Function(this, 'notification-lambda', {
            runtime: lambda.Runtime.PYTHON_3_8,
            code: lambda.Code.asset('lambda'),
            handler: 'hello.handler',
            logRetention: logs.RetentionDays.THREE_DAYS
        })

        const cw_rule = new events.Rule(this, 'cwrule-5am-everyday', {
            schedule: events.Schedule.cron({
                minute: '0',
                hour: '5'
            })
        })
        cw_rule.addTarget.bind(lambda_function)

        const lambda_topic = new sns.Topic(this, 'topic-to-call-lambda', {
            topicName: 'serverless-lambda-topic'
        })

        lambda_topic.addSubscription(new subscription.LambdaSubscription(lambda_function))
    // lambda_topic.add_subscription(subs.LambdaSubscription(lambda_function))
    }
}