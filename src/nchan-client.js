const stream = require('stream');
const { EventEmitter } = require('events');
const { promisify } = require('util');
const debug = require('debug')('philips-hue-push-client/nchan-client');
const got = require('got');
const split2 = require('split2');

const { parseMessages } = require('./parse-message');

const pipeline = promisify(stream.pipeline);

class NchanClient extends EventEmitter {
  /**
   *
   * @param baseUrl The base URL for your Hue Bridge (e.g. https://10.0.1.3:443)
   * @param apiKey The Hue Bridge API key
   * @param messageParser Optional - Set your own message parser
   */
  constructor(baseUrl, apiKey, messageParser = parseMessages) {
    super();
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    const streamSplit = split2();

    streamSplit.on('data', (line) => {
      try {
        debug('Received line:', line);
        const data = JSON.parse(line);

        messageParser(data).forEach((update) => this.emit('update', update));
      } catch (e) {
        debug('Skipping message, not a valid JSON: ', line);
      }
    });

    this.streamSplit = streamSplit;
  }

  /**
   * This method will connect to the Hue Bridge and listen for events.
   * Please note: it does return a promise that will never be fulfilled. It will also throw exceptions in case of errors. Catch the exceptions in your code and implement your own re-connection logic
   *
   * @returns {Promise<unknown>}
   */
  async connect() {
    const options = {
      headers: {
        'hue-application-key': this.apiKey,
        accept: 'multipart/mixed',
      },
      https: {
        rejectUnauthorized: false,
      },
    };

    return pipeline(
      got.stream(`${this.baseUrl}/eventstream/clip/v2`, options),
      this.streamSplit,
    );
  }
}

module.exports = NchanClient;
