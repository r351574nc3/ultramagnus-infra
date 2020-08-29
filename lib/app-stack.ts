import { Cluster, ContainerImage, Secret } from '@aws-cdk/aws-ecs';
import ecs_patterns = require('@aws-cdk/aws-ecs-patterns');
import sms = require('@aws-cdk/aws-secretsmanager');
import * as ec2 from '@aws-cdk/aws-ec2';
import cdk = require('@aws-cdk/core');
import * as config from "../bin/config"
import { Key } from '@aws-cdk/aws-kms';
import { HostedZone, HostedZoneAttributes } from '@aws-cdk/aws-route53';
import { SecureStringParameterAttributes, StringParameter } from '@aws-cdk/aws-ssm';
import { SecretsStack } from './secrets-stack';
import { HealthCheck, Protocol } from '@aws-cdk/aws-elasticloadbalancingv2';

export class AppStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const key = Key.fromKeyArn(
			this,
			"slack-secrets-key-cdk",
			"arn:aws:kms:us-west-2:615812691846:key/6b710569-df0d-499b-857c-a19571b72799"
		);

		const account_id = config.environment.account
		/* 
		Secrets Manager not working with Fargate
		const slack_secrets = sms.Secret.fromSecretAttributes(
		  this,
		  "ultramagnus-slack-secrets",
		  {
			secretArn: `arn:aws:secretsmanager:us-west-2:${account_id}:secret:slack-secrets-kNeEFT`,
			encryptionKey: key,
		  } as SecretAttributes
		);
		  */

		// Create a cluster
		const vpc = new ec2.Vpc(this, 'ultramagnus-Vpc', { maxAzs: 2 });
		const cluster = new Cluster(this, 'botopolis', { vpc });

		const slack_secrets = StringParameter.fromSecureStringParameterAttributes(
			this,
			"slack-secrets",
			{
				parameterName: "/ultramagnus/secrets/slack-secrets",
				version: 1,
				encryptionKey: key,
			} as SecureStringParameterAttributes
		)

		// Create Fargate Service
		const fargateService = new ecs_patterns.NetworkLoadBalancedFargateService(this, 'ultramagnus-from-cdk', {
			cluster,
			publicLoadBalancer: true,
			domainName: "ultramagnus.steemapps.cloud",
			domainZone: HostedZone.fromHostedZoneAttributes(
				this,
				"steemapps-cloud",
				{
					hostedZoneId: "Z3PIULITM0N161",
					zoneName: "steemapps.cloud"
				} as HostedZoneAttributes
			),
			taskImageOptions: {
				containerPort: 8080,
				image: ContainerImage.fromRegistry("r351574nc3/ultramagnus:0.2.8"),
				secrets: {
					"SLACK_SECRETS": Secret.fromSsmParameter(slack_secrets)
				},
			},
		});
		fargateService.targetGroup.configureHealthCheck(
			{
				enabled: true,
				path: "/healthcheck",
				port: "8080",
				protocol: Protocol.HTTP
			} as HealthCheck
		)
		fargateService.service.connections.securityGroups.forEach(
			(sg) => {
				sg.addIngressRule(
					ec2.Peer.anyIpv4(),
					new ec2.Port(
						{
							protocol: ec2.Protocol.TCP,
							stringRepresentation: "incoming1",
							fromPort: 8080,
							toPort: 8080
						} as ec2.PortProps
					)
				)
				sg.addIngressRule(
					ec2.Peer.anyIpv4(),
					new ec2.Port(
						{
							protocol: ec2.Protocol.TCP,
							stringRepresentation: "incoming1",
							fromPort: 80,
							toPort: 80
						} as ec2.PortProps
					)
				)
			}
		)

		// Setup AutoScaling policy
		const scaling = fargateService.service.autoScaleTaskCount({ maxCapacity: 2 });
		scaling.scaleOnCpuUtilization('CpuScaling', {
			targetUtilizationPercent: 50,
			scaleInCooldown: cdk.Duration.seconds(60),
			scaleOutCooldown: cdk.Duration.seconds(60)
		});

		new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: fargateService.loadBalancer.loadBalancerDnsName });
	}
}