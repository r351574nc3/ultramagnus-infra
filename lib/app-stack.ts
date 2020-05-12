import ecs = require('@aws-cdk/aws-ecs');
import ecs_patterns = require('@aws-cdk/aws-ecs-patterns');
import sms = require('@aws-cdk/aws-secretsmanager');
import ec2 = require('@aws-cdk/aws-ec2');
import cdk = require('@aws-cdk/core');

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const account_id = process.env.AWS_ACCOUNT_ID
    const slack_secrets = sms.Secret.fromSecretArn(
      this,
      "ultramagnus-slack-secrets",
      `arn:aws:secretsmanager:region:${account_id}:secret:slack-secrets`,
    );

    // Create a cluster
    const vpc = new ec2.Vpc(this, 'ultramagnus-Vpc', { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, 'botopolis', { vpc });

    // Create Fargate Service
    const fargateService = new ecs_patterns.NetworkLoadBalancedFargateService(this, 'ultramagnus-from-cdk', {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("r351574nc3/ultramagnus:0.2.7"),
        secrets: {
          "SLACK_SECRETS": ecs.Secret.fromSecretsManager(slack_secrets),
        },
      },
    });

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