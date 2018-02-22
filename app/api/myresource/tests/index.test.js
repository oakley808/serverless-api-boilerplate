/**
 * @jest-environment node
 */
// ^^^ required for jest v22 -- just for now https://github.com/facebook/jest/issues/5119

// TDD examples:
// https://kalinchernev.github.io/tdd-serverless-jest/
// https://github.com/kalinchernev/aws-node-signed-uploads/blob/master/__tests__/lib/envVarsChecker.spec.js
// https://serverless.com/blog/tdd-serverless/

import {
  handler,
} from 'api/myresource';

import {
  getMyResource,
} from 'api/myresource/myresourceHelpers';

import jestPlugin from 'serverless-jest-plugin';
const { lambdaWrapper } = jestPlugin;
const wrappedLambda = lambdaWrapper.wrap({ handler }, { handler: 'handler' });

// Fixtures
const someFixtureData = [
  {
    id: 123,
    name: 'I am data object 123',
  },
];


describe('handler', () => {
  beforeAll((done) => {
    done();
  });

  it('implements tests here', () => {
    console.log('here we go!');
    return wrappedLambda
      .run({})
      .then((response) => {
        console.log('response', response);
        expect(response).toBeDefined();
      });
  });
});
