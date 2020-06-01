#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AppStack } from '../lib/app-stack';
import { KmsStack } from '../lib/kms-stack';
import { SecretsStack } from '../lib/secrets-stack';

const app = new cdk.App();
const kms_stack = new KmsStack(app, 'ultramagnus-kms-key-policy');
const secrets_stack = new SecretsStack(
    app, 
    "ultramagnus-secrets",
    kms_stack.getKey(),
    );

/*
const app_stack = new AppStack(
    app,
    'ultramagnus-aws-fargate-autoscaling', 
    {
        "keyId": kms_stack.keyId,
    }
);
*/
