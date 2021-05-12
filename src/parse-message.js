const debug = require('debug')('philips-hue-push-client/parse-message');

const parseUpdateMessage = (data, creationTime) => data.map(({
  id_v1: idv1, type, id: idv2, ...rest
}) => {
  const [resource, id] = idv1.split('/').filter(Boolean);

  return {
    resource,
    creationTime,
    idv1: id,
    idv2,
    ...rest,
  };
});

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
        const resId = `${payload.resource}/${payload.idv1}`;

        mergedResourcePayloads[resId] = {
          ...mergedResourcePayloads[resId] || {},
          ...payload,
        };
      });
    });

    return Object.values(mergedResourcePayloads);
  },
};
