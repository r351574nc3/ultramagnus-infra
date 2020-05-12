import iam = require('@aws-cdk/aws-iam');
import kms = require('@aws-cdk/aws-kms');
import cdk = require('@aws-cdk/core');
import { Effect } from '@aws-cdk/aws-iam';

export class KmsStack extends cdk.Stack {
    keyId: string;
    account_id: string;

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        if (process.env.AWS_ACCOUNT_ID != undefined) {
            this.account_id = process.env.AWS_ACCOUNT_ID;
        }

        // Create a KMS Key
        const key_policy = new iam.PolicyDocument({
            "statements": [
                new iam.PolicyStatement({
                    "sid": "Enable IAM User Permissions",
                    "effect": Effect.ALLOW,
                    "principals": [
                        new iam.ArnPrincipal(`arn:aws:iam::${this.account_id}:root`),
                    ],
                    "actions": [ "kms:*" ],
                    "resources": [ "*" ],
                }),
                new iam.PolicyStatement({
                    "sid": "Allow access for Key Administrators",
                    "effect": Effect.ALLOW,
                    "principals": [
                        new iam.ArnPrincipal(`arn:aws:iam::${this.account_id}:user/Administrator`),
                    ],
                    "actions": [
                        "kms:Create*",
                        "kms:Describe*",
                        "kms:Enable*",
                        "kms:List*",
                        "kms:Put*",
                        "kms:Update*",
                        "kms:Revoke*",
                        "kms:Disable*",
                        "kms:Encrypt",
                        "kms:Decrypt",
                        "kms:ReEncrypt*",
                        "kms:GenerateDataKey*",
                        "kms:DescribeKey",
                        "kms:Get*",
                        "kms:Delete*",
                        "kms:TagResource",
                        "kms:UntagResource",
                        "kms:ScheduleKeyDeletion",
                        "kms:CancelKeyDeletion"
                    ],
                    "resources": [ "*" ], 
                }),
                new iam.PolicyStatement({
                    "sid": "Allow use of the key",
                    "effect": Effect.ALLOW,
                    "principals": [
                        new iam.ArnPrincipal(`arn:aws:iam::${this.account_id}:user/leo`),
                        new iam.ArnPrincipal(`arn:aws:iam::${this.account_id}:user/leo-cdk`),
                    ],
                    "actions": [
                        "kms:Encrypt",
                        "kms:Decrypt",
                        "kms:ReEncrypt*",
                        "kms:GenerateDataKey*",
                        "kms:DescribeKey",
                    ],
                    "resources": [ "*" ], 
                }),
                new iam.PolicyStatement({
                    "sid": "Allow attachment of persistent resources",
                    "effect": Effect.ALLOW,
                    "principals": [
                        new iam.ArnPrincipal(`arn:aws:iam::${this.account_id}:user/leo`),
                        new iam.ArnPrincipal(`arn:aws:iam::${this.account_id}:user/leo-cdk`),
                    ],
                    "actions": [
                        "kms:CreateGrant",
                        "kms:ListGrants",
                        "kms:RevokeGrant",
                    ],
                    "resources": [ "*" ],
                    "conditions": {
                        "Bool": {
                            "kms:GrantIsForAWSResource": true,
                        }
                    }
                }),
            ]
        });

        const key = new kms.Key(this, "botopolis-key", {
            "alias": "slack-secrets-key-cdk",
            "description": "Secrets for slack including oauth bot token, client id, client secret, and signing secret",
            "enabled": true, 
            "enableKeyRotation": true,
            "policy": key_policy,
        });
        // this.keyId = "5433c839-4a75-435f-a4b4-8db2c4ff7f91";
        this.keyId = key.keyId;

        new cdk.CfnOutput(this, 'KMS Slack Key ARN', { value:  key.keyArn });
    }
}