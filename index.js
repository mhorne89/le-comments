const AWS = require('aws-sdk');
const schedule = require('node-schedule');

require('dotenv').config();

const {
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    PRIMARY_BUCKET,
    ARCHIVE_BUCKET
} = process.env;

AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID, 
    secretAccessKey: AWS_SECRET_ACCESS_KEY, 
    region: AWS_REGION
  });

const s3 = new AWS.S3();

const moveFiles = async () => {
  try {
    const params = {
      Bucket: PRIMARY_BUCKET,
    };
    
    const listObjectsOutput = await s3.listObjects(params).promise();

    for (const content of listObjectsOutput.Contents || []) {
      const copyParams = {
        Bucket: ARCHIVE_BUCKET,
        CopySource: `${primaryBucket}/${content.Key}`,
        Key: content.Key,
      };

      const deleteParams = {
        Bucket: PRIMARY_BUCKET,
        Key: content.Key,
      };

      await s3.copyObject(copyParams).promise();
      await s3.deleteObject(deleteParams).promise();
    }
  } catch (error) {
    console.error(error);
  }
};

// Schedule CRON job to run every weekday at 1pm GMT
schedule.scheduleJob('0 13 * * 1-5', () => {
  console.log('Moving files to archive bucket');
  moveFiles();
});
