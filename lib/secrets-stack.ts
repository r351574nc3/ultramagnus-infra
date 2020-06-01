import iam = require('@aws-cdk/aws-iam');
import kms = require('@aws-cdk/aws-kms');
import secrets = require('@aws-cdk/aws-secretsmanager');
import cdk = require('@aws-cdk/core');

export class SecretsStack extends cdk.Stack {
    keyId: string;

    constructor(scope: cdk.App, id: string, key: kms.IKey, props?: cdk.StackProps) {
        super(scope, id, props);

        const slack_secrets = new secrets.Secret(this, "slack-secrets", {
            secretName: "slack-secrets",
            description: "Secrets for oauth bot token, client id, client secret, and signing secret for slack",
            encryptionKey: key
        });

    }
}