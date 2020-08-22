#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VPCStack } from '../lib/vpc-stack';
import { SecurityStack } from '../lib/security-stack';
import { BastionStack } from '../lib/bastion-stack';
import { KMSStack } from '../lib/kms-stack';
import { S3Stack } from '../lib/s3-stack';
import { RDSStack } from '../lib/rds-stack';
import { RedisStack } from '../lib/redis-stack';
import { CognitoStack } from '../lib/cognito-stack';
import { APIStack } from '../lib/apigw-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { CodePipelineStack } from '../lib/codepipeline-backend-stack';
import { NotificationStack } from '../lib/notifications-stack';

const prod = { account: '528928441350', region: 'us-east-1' };

const cdk_ts = new cdk.App();
const vpc = new VPCStack(cdk_ts, 'VPCStackTS');
const sg = new SecurityStack(cdk_ts, 'SecurityStackTS', vpc.vpc);
const bastion = new BastionStack(cdk_ts, 'BastionStackTS', vpc.vpc, sg.bastion_sg);
const kms = new KMSStack(cdk_ts, 'KMSStackTS')
const s3 = new S3Stack(cdk_ts, 'S3StackTS')
const rds = new RDSStack(cdk_ts, 'RDSStackTS', vpc.vpc, sg.lambda_sg, sg.bastion_sg, kms.kms_rds)
const redis = new RedisStack(cdk_ts, 'RedisStackTS', vpc.vpc, sg.redis_sg)
const cognito = new CognitoStack(cdk_ts, 'CognitoStackTS')
const apigw = new APIStack(cdk_ts, 'APIStackTS')
const lambda = new LambdaStack(cdk_ts, 'LambdaStackTS')
const codepipeline = new CodePipelineStack(cdk_ts, 'CodePipelineStackTS', s3.artifactbucket)
codepipeline.addDependency(sg, 'roles used by the code')
const notifications = new NotificationStack(cdk_ts, 'NotificationStackTS')

cdk_ts.synth();
