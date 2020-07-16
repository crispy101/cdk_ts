#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { UdemyCdkTsStack } from '../lib/udemy_cdk_ts-stack';

const app = new cdk.App();
new UdemyCdkTsStack(app, 'UdemyCdkTsStack');
