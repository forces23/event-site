/**
 * One-time script: applies CORS rules to the R2 bucket so browsers can PUT
 * presigned upload URLs directly.
 *
 * Run once after creating the bucket:
 *   npm run r2:cors
 */

import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const accountId       = process.env.R2_ACCOUNT_ID!;
const accessKeyId     = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
const bucket          = process.env.R2_BUCKET_NAME!;

if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
  console.error(
    "Missing R2 env vars. Make sure .env.local contains:\n" +
    "  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME",
  );
  process.exit(1);
}

const client = new S3Client({
  region:   "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

async function main() {
  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            // Allows browsers to PUT presigned URLs from any origin.
            // After going live, replace "*" with your production domain.
            AllowedOrigins: ["*"],
            AllowedMethods: ["PUT", "GET", "HEAD"],
            // "*" covers Content-Type and every X-Amz-* header in presigned requests
            AllowedHeaders: ["*"],
            ExposeHeaders:  ["ETag"],
            MaxAgeSeconds:  3600,
          },
        ],
      },
    }),
  );

  console.log(`✓ CORS rules applied to bucket "${bucket}"`);
}

main().catch((err) => { console.error(err); process.exit(1); });
