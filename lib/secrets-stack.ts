import iam = require('@aws-cdk/aws-iam');
import secrets = require('@aws-cdk/aws-secretsmanager');
import cdk = require('@aws-cdk/core');
import { IKey } from '@aws-cdk/aws-kms';

export class SecretsStack extends cdk.Stack {
    keyId: string;

    constructor(scope: cdk.App, id: string, key: IKey, props?: cdk.StackProps) {
        super(scope, id, props);

        const slack_secrets = new secrets.Secret(this, "slack-secrets", {
            secretName: "slack-secrets",
            description: "Secrets for oauth bot token, client id, client secret, and signing secret for slack",
            encryptionKey: key
        });
        /*

        const key = Key.fromKeyArn(
            this,
            "MyImportedKey",
            "arn:aws:kms:us-west-2:615812691846:key/6b710569-df0d-499b-857c-a19571b72799"
        );
        const slack_secrets = secrets.Secret.fromSecretArn(
            this,
            "slack-secrets",
            "arn:aws:secretsmanager:us-west-2:615812691846:secret:slack-secrets-kNeEFT",
        );
        */
    }
}