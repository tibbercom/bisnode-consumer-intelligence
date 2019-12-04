## Purpose

The package is a thin wrapper around the bisnode consumer intelligence API.

ClientId/Secret must be obtained from bisnode.

## Install

NPM:
```
$ npm install --save bisnode-consumer-intelligence
```

Yarn:

```
$ yarn add bisnode-consumer-intelligence
```

## Usage

````
import getClient from 'bisnode-consumer-intelligence';

const client = getClient({clientId, clientSecret});

const result = client.searchOne({country: "NO", "firstName": "Ola", "lastName": "Norman" });

//success result

//{
//        "gedi": "bisnode_unique_id",
//        "firstName": "Ola",
//        "lastName": "Norman",
//        "gender": "Male",
//        "dateOfBirth": "1983-03-22",
//        "yearOfBirth": 1983,
//        "deceased": false,
//        "language": "nb-NO",
//        "directMarketingRestriction": false,
//        "phoneNumber": "+4799999999",
//        "address": {
//            "type": "Postal",
//            "streetName": "Somewhere",
//            "streetNumber": "35",
//            "entrance": "",
//            "postalCode": "6812",
//            "city": "Somplace",
//            "country": "NO",
//            "formattedAddress": [
//                "Somewhere 35",
//                "6817 Somplace"
//            ]
//        }
//  }

````

Currently there are three methods available. `searchOne`which is demonstrated above `search` which returns a list of search results and `searchRaw` which returns the unformatted response from bisnode.