// https://docs.aws.amazon.com/polly/latest/dg/API_SynthesizeSpeech.html

'use strict';

const AWS = require('aws-sdk');
const { v4: uuidV4 } = require('uuid');
const Polly = new AWS.Polly({ apiVersion: '2016-06-10' });
const S3 = new AWS.S3({ apiVersion: 'latest' });
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

module.exports.speakPolly = async (event) => {
  try {
    const records = event['Records'];

    for (const record of records) {
      const bucketName = record['s3']['bucket']['name'];
      const objectKey = record['s3']['object']['key'];
      // const objectSize = record['s3']['object']['size'];

      const objectDetails = await getObjectFromS3(bucketName, objectKey);
      const text = objectDetails.Body.toString('utf-8');
      const voiceId = process.env.VOICE_AGENT || 'Carla';

      const params = {
        Engine: 'standard',
        OutputFormat: 'mp3',
        SampleRate: '22050',
        Text: text,
        TextType: 'text',
        VoiceId: voiceId,
      };

      const data = await Polly.synthesizeSpeech(params).promise();

      const destinationBucketName = process.env.AUDIO_BUCKET;
      const mp3FileKey = uuidV4();
      const destinationObjectKey = `${mp3FileKey}.mp3`;

      const s3Params = {
        Bucket: destinationBucketName,
        Key: destinationObjectKey,
        data: data.AudioStream,
        ContentType: 'audio/mpeg',
      };

      const dynamoTableName = process.env.DYNAMODB_TABLE;

      const done = await Promise.all([
        putObjectToS3(s3Params),
        putItemToDynamoDB(dynamoTableName, {
          id: { S: mp3FileKey },
          text: { S: text },
          voiceId: { S: voiceId },
          bucket: { S: destinationBucketName },
          createdAt: { S: new Date().toISOString() },
          updatedAt: { S: new Date().toISOString() },
        }),
      ]);

      console.log(60, '---->', done);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(
        { message: 'Successfully executed', data: event },
        null,
        2
      ),
    };
  } catch (err) {
    console.error('/Error Happened in speakPolly: ', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error', data: err }, null, 2),
    };
  }
};

async function getObjectFromS3(bucket_name, object_key) {
  const params = {
    Bucket: bucket_name,
    Key: unquotePlus(object_key),
  };

  return await S3.getObject(params).promise();
}

async function putObjectToS3({ Bucket, Key, data, ContentType }) {
  const params = {
    Bucket: Bucket,
    Key: Key,
    Body: data,
    ContentType: ContentType,
  };

  return await S3.putObject(params).promise();
}

async function putItemToDynamoDB(TableName, Item) {
  const params = {
    TableName: TableName,
    Item: Item,
  };

  return await dynamodb.putItem(params).promise();
}

function unquotePlus(s) {
  return decodeURIComponent(s.replace(/\+/g, ' '));
}

// const sampleParam = {
//   Engine: 'string',
//   LanguageCode: 'string',
//   LexiconNames: ['string'],
//   OutputFormat: 'string',
//   SampleRate: 'string',
//   SpeechMarkTypes: ['string'], (sentence | ssml | viseme | word)
//   Text: 'string',
//   TextType: 'string',
//   VoiceId: 'string', (Aditi | Amy | Astrid | Bianca | Brian | Camila | Carla | Carmen | Celine | Chantal | Conchita | Cristiano | Dora | Emma | Enrique | Ewa | Filiz | Gabrielle | Geraint | Giorgio | Gwyneth | Hans | Ines | Ivy | Jacek | Jan | Joanna | Joey | Justin | Karl | Kendra | Kevin | Kimberly | Lea | Liv | Lotte | Lucia | Lupe | Mads | Maja | Marlene | Mathieu | Matthew | Maxim | Mia | Miguel | Mizuki | Naja | Nicole | Olivia | Penelope | Raveena | Ricardo | Ruben | Russell | Salli | Seoyeon | Takumi | Tatyana | Vicki | Vitoria | Zeina | Zhiyu | Aria | Ayanda)
// };
