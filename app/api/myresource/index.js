import { getMyResource } from 'api/myresource/myresourceHelpers';
import { respondToClient } from 'lib/utilities';


/**
 * handler - amazon lambda handler function
 * @param  {object}   event    aws event object
 * @param  {object}   context  context of lambda function
 * @param  {Function} callback handler for sending data to client
 */
export const handler = (event, context, callback) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  getMyResource().then(results => {
    respondToClient(callback, headers, JSON.stringify(results));
  });
};
