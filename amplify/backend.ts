import { defineBackend } from '@aws-amplify/backend';
import { SSEType } from '@aws-amplify/data-construct';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { Key } from 'aws-cdk-lib/aws-kms';
import { RemovalPolicy, Duration } from 'aws-cdk-lib';
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  ArnPrincipal,
  ServicePrincipal,
  AccountRootPrincipal
} from 'aws-cdk-lib/aws-iam';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
});

const tableKey = new Key(backend.stack, "A-Custom-Key", {
  enableKeyRotation: true,
  removalPolicy: RemovalPolicy.DESTROY,
  pendingWindow: Duration.days(7),
  policy: new PolicyDocument({
    statements: [
      // Allow all IAM principals in this account using DynamoDB
      new PolicyStatement({
        sid: "Allow use via DynamoDB in this account",
        effect: Effect.ALLOW,
        principals: [new ArnPrincipal("*")],
        actions: [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:CreateGrant",
          "kms:DescribeKey"
        ],
        resources: ["*"],
        conditions: {
          StringEquals: {
            "kms:CallerAccount": backend.stack.account,
          },
          StringLike: {
            "kms:ViaService": `dynamodb.${backend.stack.region}.amazonaws.com`,
          }
        }
      }),
      // Allow account root to administer the key
      new PolicyStatement({
        sid: "Allow account to administer key",
        effect: Effect.ALLOW,
        principals: [new AccountRootPrincipal()],
        actions: [
          "kms:*"
        ],
        resources: ["*"]
      }),
      // Allow DynamoDB service to describe key (optional but useful)
      new PolicyStatement({
        sid: "Allow DynamoDB to describe key",
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("dynamodb.amazonaws.com")],
        actions: [
          "kms:Describe*",
          "kms:Get*",
          "kms:List*"
        ],
        resources: ["*"]
      })
    ]
  })
});

const { amplifyDynamoDbTables } = backend.data.resources.cfnResources;

for (const amplifyTable of Object.values(amplifyDynamoDbTables)) {
  amplifyTable.pointInTimeRecoveryEnabled = true;
  amplifyTable.sseSpecification = {
    kmsMasterKeyId: tableKey.keyArn,
    sseEnabled: true,
    sseType: SSEType.KMS
  };
}