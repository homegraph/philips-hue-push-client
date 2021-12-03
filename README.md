# About this project

Recent versions of the Hue Bridge firmware are exposing a new API version for the Hue system. The API v2 does support "push" style notifications for every change in the system, without the need for polling the Bridge.

[Read the official documentation](https://developers.meethue.com/develop/hue-api-v2/migration-guide-to-the-new-hue-api/#Event%20Stream)


# How are notifications implemented

The Hue Bridge is now exposing an endpoint using [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).

The new APIs are **ONLY available when using HTTPS** so make sure you're connecting using HTTPS.

This library will automatically try to reconnect on failure.

# How to use this package

```javascript
const { SSEClient } = require('@homegraph/philips-hue-push-client');

const huePush = new SSEClient(
  'https://YOUR_BRIDGE_IP:443',
  'YOUR_API_KEY',
);

huePush.on('connected', () => console.log('Connected to the Hue Bridge'));
huePush.on('update', (data) => console.log('UPDATE RECEIVED', data));
huePush.on('error', (err) => console.error('ERROR RECEIVED, implement your logic here', err));

huePush.connect();

// To close the connection with the bridge:
// huePush.close();
```

# `update` event spec

Payload example:
```json
{
  "resource": "lights",
  "idv1": "38",
  "idv2": "3dba6784-3fa6-4e51-979c-daed68cad240",
  "creationTime": "2021-01-01T15:32:04Z",
  "dimming": { "brightness": 100 },
  "color": { "xy": { "x": 0.3691, "y": 0.3719 } },
  "color_temperature": { "mirek": 233 }
}
```

- `resource` is the Hue API v1 resource name (e.g. `lights`, `groups`, `sensors`, etc)
- `idv1` is the Hue API v1 resource ID (in this example this light is available under `/lights/38`)
- `idv2` is the Hue API v2 resource ID. It looks like the API v2 is using UUIDs instead of incremental numeric IDs
- all remaining props as per [documentation](https://developers.meethue.com/develop/hue-api-v2/)
