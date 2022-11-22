const debug = require('debug')('philips-hue-push-client/parse-message');

const parseUpdateMessage = (data, creationTime) => data.map(({
  id_v1: idv1, ...rest
}) => ({
  creationTime,
  ...rest,
}));

const parseMessage = (message) => {
  const { type: messageType, creationtime: creationTime, data } = message;

  if (messageType !== 'update') {
    debug('Message type not supported', message);
    return [];
  }

  return parseUpdateMessage(data, creationTime);
};

module.exports = {
  parseMessages: (messages) => {
    const mergedResourcePayloads = {};

    // Parse each message and merge updates from different zigbee clusters in a single payload
    messages.forEach((message) => {
      parseMessage(message).forEach((payload) => {
        const resId = `${payload.type}/${payload.id}`;

        mergedResourcePayloads[resId] = {
          ...mergedResourcePayloads[resId] || {},
          ...payload,
        };
      });
    });

    return Object.values(mergedResourcePayloads);
  },
};
