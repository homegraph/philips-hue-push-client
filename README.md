# About this project

Recent versions of the Hue Bridge firmware are exposing an unreleased new API version for the Hue system. The API v2 does support "push" style notifications for every change in the system, without the need for polling the Bridge.

We know little about the new APIs; this project is based on reverse engineering of the APIs and it is subject to change at any time.

# How are notifications implemented

The Hue Bridge is now exposing an endpoint using [Nchan](https://nchan.io/#http-multipart-mixed) technology (supporting only HTTP multipart/mixed method at the moment).

The new APIs are **ONLY available when using HTTPS** so make sure you're connecting using HTTPS.

## What do we know so far
- Here's a list of [exposed endpoints](https://pastebin.com/hE68CpMc)
- Here's some [sample data captured from a Hue Bridge](https://pastebin.com/xFBLwNnz)
- Here's the **[full message schema](https://pastebin.com/hyMhMPRY)**

# How to use this package

```javascript
const { NchanClient } = require('@homegraph/philips-hue-push-client');

const huePush = new NchanClient(
  'https://YOUR_BRIDGE_IP:443',
  'YOUR_API_KEY',
);

huePush.on('update', (data) => console.log('RECEIVED UPDATE====', data));

// Note: this method will throw on network errors / timeouts / disconnections. Please implement your own logic for handling failures.
huePush.connect();
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
- for all the remaining properties
