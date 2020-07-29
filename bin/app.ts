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

const prod = { account: '528928441350', region: 'us-east-1' };

const cdk_ts = new cdk.App();
const vpc = new VPCStack(cdk_ts, 'VPCStackTS');
const sg = new SecurityStack(cdk_ts, 'SecurityStackTS', vpc.vpc);
const bastion = new BastionStack(cdk_ts, 'BastionStackTS', vpc.vpc, sg.bastion_sg);
const kms = new KMSStack(cdk_ts, 'KMSStackTS')
const s3 = new S3Stack(cdk_ts, 'S3StackTS')
const rds = new RDSStack(cdk_ts, 'RDSStackTS', vpc.vpc, sg.lambda_sg, sg.bastion_sg, kms.kms_rds)
const redis = new RedisStack(cdk_ts, 'RedisStackTS', vpc.vpc, sg.redis_sg)

cdk_ts.synth();
