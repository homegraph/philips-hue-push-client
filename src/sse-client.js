const { EventEmitter } = require('events');
const EventSource = require('eventsource');
const debug = require('debug')('philips-hue-push-client/sse-client');

const { parseMessages } = require('./parse-message');

class SSEClient extends EventEmitter {
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
    this.messageParser = messageParser;

    this.es = null;
  }

  /**
   * This method will connect to the Hue Bridge and listen for events.
   */
  connect() {
    const options = {
      headers: {
        'hue-application-key': this.apiKey,
      },
      https: {
        rejectUnauthorized: false,
      },
    };

    this.es = new EventSource(`${this.baseUrl}/eventstream/clip/v2`, options);

    this.es.onmessage = (event) => {
      debug('Received event: ', event);
      if (event && event.type === 'message' && event.data) {
        const data = JSON.parse(event.data);
        this.messageParser(data).forEach((update) => this.emit('update', update));
      }
    };

    this.es.onopen = () => this.emit('connected');
    this.es.onerror = (err) => this.emit('error', err);
  }

  close() {
    this.es.close();
    this.es = null;
  }
}

module.exports = SSEClient;
