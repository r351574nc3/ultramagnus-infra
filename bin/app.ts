#!/usr/bin/env node
import { App } from '@aws-cdk/core';
import { AppStack } from '../lib/app-stack';
import { KmsStack } from '../lib/kms-stack';
import { SecretsStack } from '../lib/secrets-stack';
import * as kms from '@aws-cdk/aws-kms';
import * as secrets from '@aws-cdk/aws-secretsmanager';
import * as config from "./config"
import { EcsGolangStack } from '../lib/ecs-go-mvp-stack';

class BotApp extends App {
	constructor() {
		super();

        const kms_stack = new KmsStack(
            this,
            'ultramagnus-kms-key-policy',
			{
				env: config.environment
            },
        );

        const secrets_stack = new SecretsStack(
            this, 
            "ultramagnus-secrets",
            kms_stack.getKey(),
			{
				env: config.environment
            },
        );

        const app_stack = new AppStack(
            this,
            'ultramagnus-aws-fargate-autoscaling',
            {
				env: config.environment
			},
        );
    }
}
new BotApp().synth()