// https://docs.aws.amazon.com/polly/latest/dg/API_SynthesizeSpeech.html

'use strict';
const AWS = require('aws-sdk');
const { v4: uuidV4 } = require('uuid');
const Polly = new AWS.Polly({ apiVersion: '2016-06-10' });
const S3 = new AWS.S3({ apiVersion: 'latest' });

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
      const destinationObjectKey = `${uuidV4()}.mp3`;

      const s3Params = {
        Bucket: destinationBucketName,
        Key: destinationObjectKey,
        data: data.AudioStream,
        ContentType: 'audio/mpeg',
      };

      await putObjectToS3(s3Params);
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
