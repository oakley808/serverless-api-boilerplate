import AWS from 'aws-sdk';

/**
 * respondToClient helper function
 * @param  {Function} callback function to invoke to send data
 * @param  {object}   headers  http headers object
 * @param  {object}   response the data to return
 */
const respondToClient = (callback, headers, response) => {
  callback(null, {
    isBase64Encoded: false,
    statusCode: 200,
    headers,
    body: response,
  });
};

/**
 * kmsDecrypt helper to decrypt
 * @param  {object} encrypted an object with key value pairs to be decrypted
 * @return {promise}           decrypted object
 */
export const kmsDecrypt = (encrypted) => {
  const promise = new Promise((resolve, reject) => {
    const kms = new AWS.KMS();
    const decrypted = {};
    const decryptPromises = [];
    Object.keys(encrypted).forEach((item) => {
      decryptPromises.push(kms.decrypt({ CiphertextBlob: Buffer.from(encrypted[item], 'base64') }).promise());
    });

    Promise.all(decryptPromises).then(data => {
      Object.keys(encrypted).forEach((key, i) => {
        decrypted[key] = data[i].Plaintext.toString('ascii');
      });
      resolve(decrypted);
    }).catch(err => {
      console.log('Decrypt error:', err);
      reject(err);
    });
  });
  return promise;
};
