#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VPCStack } from '../lib/vpc-stack';
import { SecurityStack } from '../lib/security-stack';
import { BastionStack } from '../lib/bastion-stack';
import { Vpc } from '@aws-cdk/aws-ec2';

const prod = { account: '528928441350', region: 'us-east-1' };

const cdk_ts = new cdk.App();
const vpc = new VPCStack(cdk_ts, 'VPCStackTS');
const sg = new SecurityStack(cdk_ts, 'SecurityStackTS', vpc.vpc);
const bastion = new BastionStack(cdk_ts, 'BastionStackTS', vpc.vpc, sg.bastion_sg);

cdk_ts.synth();
