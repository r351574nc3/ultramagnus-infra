#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AppStack } from '../lib/app-stack';

const app = new cdk.App();
new AppStack(app, 'ultramagnus-aws-fargate-autoscaling');
