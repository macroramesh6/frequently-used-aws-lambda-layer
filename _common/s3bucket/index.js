const AWS = require('aws-sdk');
const config = require('../config');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { promisesCollector } = require('../utils');

/**
 * upload to s3
 * @param path
 * @param file
 * @param options
 * @returns {Promise<unknown>}
 */
const uploadToS3 = (path, file, options) => {
  return new Promise(async (resolve, reject) => {
    const allConfig = await config.get();

    const s3 = new AWS.S3({
      accessKeyId: allConfig.awsCredentials.accessKeyId,
      secretAccessKey: allConfig.awsCredentials.secretAccessKey,
      region: allConfig.awsCredentials.region
    });

    // upload data
    s3.putObject({
      Bucket: allConfig.s3bucket,
      Key: path,
      Body: file,
      ACL: 'public-read',
      ...options
    }, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve(path);
    });
  });
};

/**
 * upload multiform
 * @type {function(): Multer}
 */
const uploadMultiForm = async () => {
  const allConfig = await config.get();

  return multer({
    storage: multerS3({
      s3: new AWS.S3({
        accessKeyId: allConfig.awsCredentials.accessKeyId,
        secretAccessKey: allConfig.awsCredentials.secretAccessKey,
        region: allConfig.awsCredentials.region
      }),
      bucket: allConfig.s3bucket,
      acl: 'private',
      metadata: (req, file, cb) => {
        cb(null, {fieldName: file.fieldname});
      },
      key: (req, file, cb) => {
        const url = `${req.internalParams.filesUrl}/${file.originalname}`;
        cb(null, url);
      }
    }),
    limits: {
      fileSize: 50 * 1024 * 1024,
      fields: 20,
      parts: 100,
    },
  });
}

/**
 * download from S3
 * @param path
 * @returns {Promise<unknown>}
 */
const downloadFileFromS3 = async (path) => {
  return new Promise(async (resolve, reject) => {
    //some vars
    const allConfig = await config.get();

    let s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      accessKeyId: allConfig.awsCredentials.accessKeyId,
      secretAccessKey: allConfig.awsCredentials.secretAccessKey,
      region: allConfig.awsCredentials.region
    });
    let params = {
      Bucket: allConfig.s3bucket,
      Key: path
    };
    s3.getObject(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

/**
 * upload files to s3
 * @param path
 * @param files
 * @param options
 * @returns {Promise<unknown>}
 */
const uploadFilesToS3 = async (path, files, extension, options = {
  ACL: "private",
  ContentEncoding: "base64",
  ContentType: "application/pdf",
}) => {
  if (files.length === 0) {
    return "";
  }
  if (!path) {
    return "";
  }
  files = Array.isArray(files) ? [...files] : [files];
  extension = extension ? extension : 'pdf';
  return await promisesCollector(files, async (_file) => {
    let _path = `${path}${new Date().getTime()}.${extension}`;
    try {
      let file = Buffer.from(_file.content, "base64");
      return await uploadToS3(_path, file, options);
    } catch (e) {
      throw {
        message: "Error creating file in AWS",
      };
    }
  });
};

module.exports = {
  uploadToS3,
  downloadFileFromS3,
  uploadMultiForm,
  uploadFilesToS3
};
