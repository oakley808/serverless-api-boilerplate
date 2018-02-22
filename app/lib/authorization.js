import jwt from 'jsonwebtoken';
import { kmsDecrypt } from 'lib/utilities';

const {
  SF_AUTH0_DOMAIN,
  SF_AUTH0_CLIENT_ID,
  SF_AUTH0_CLIENT_NAME,
  SF_AUTH0_CLIENT_SECRET,
} = process.env;


/**
 * generatePolicy - return an authorization policy response object
 *
 * @param  {string} principalId auth0
 * @param  {string} effect      Allow or Deny
 * @param  {string} methodArn   ARN string
 * @param  {string} domains     space separated list of domains
 * @return {object}
 */
export const generatePolicy = (principalId, effect, methodArn, domains) => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: `${methodArn.split('/').slice(0, 2).join('/')}/*/*`,
      },
    ],
  },
  context: {
    domains,
  },
});


/**
 * getUserDomains - helper function to parse client access list for the domains
 *
 * @param  {array} clientAccess array of clients and their respective domain privs
 * @return {string}             space separated list of domains
 */
export const getUserDomains = (clientAccess = []) =>
  clientAccess
    .find(c => c.clientName === SF_AUTH0_CLIENT_NAME).domainAccess
    .filter(d => d.permissions[0] === 'ALL')
    .map(d => d.domain)
    .join(' ');


/**
 * userAuthorizer - verify the user's jwt is valid for the requested resource
 *
 * @param  {string}   authorizationToken
 * @param  {string}   methodArn
 * @param  {object}   context
 * @param  {Function} callback
 */
export const userAuthorizer = ({ authorizationToken, methodArn }, context, callback) => {
  if (!authorizationToken) {
    callback('Unauthorized');
  } else {
    kmsDecrypt({ audience: SF_AUTH0_CLIENT_ID, secret: SF_AUTH0_CLIENT_SECRET })
      .then(decrypted => {
        const idToken = authorizationToken.split(' ')[1];
        const options = {
          audience: decrypted.audience,
          issuer: `https://${SF_AUTH0_DOMAIN}/`,
        };

        jwt.verify(idToken, decrypted.secret, options, (error, decoded) => {
          if (error) {
            callback('Unauthorized');
          } else {
            const domains = getUserDomains(decoded.clientAccess);

            if (domains === '') {
              callback(null, generatePolicy(decoded.sub, 'Deny', methodArn, domains));
            } else {
              callback(null, generatePolicy(decoded.sub, 'Allow', methodArn, domains));
            }
          }
        });
      });
  }
};
