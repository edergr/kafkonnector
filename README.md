# Kafkonnector v1.3.3

Kafkonnector is a versatile tool designed to transform large files into Kafka messages efficiently. This project leverages various technologies to provide a seamless solution for your data processing needs.

## Table of Contents
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Validation Schema](#validation-schema)
- [Filters Operation](#filters-operation)
- [Folder Structure](#folder-structure)
- [Processing Logic](#processing-logic)
- [Performance](#performance)

## Installation
To install Kafkonnector, ensure you have Node.js and npm installed. Then, run the following commands:

```bash
npm install
npm start
```

## Environment Configuration

Kafkonnector utilizes various environment variables to configure different aspects of the service. Here are the available variables and their default values:

- **PORT:** `3000`  
  The port number on which the service will run.

- **MONGODB_URI:** `mongodb://localhost:27017/kafkonnector`  
  The connection URI to the MongoDB database where connector configurations are stored.

- **ROOT_FOLDER:** `/data/kafkonnector`  
 The root directory in which the service organizes folders for pending, processed, and retry files.

- **KAFKA_CONNECT_URL:** `localhost:9092`  
  The connection URL to the Kafka cluster.

- **KAFKA_SECURITY_PROTOCOL:** `PLAINTEXT`  
  The security protocol used to communicate with the Kafka cluster.

- **KAFKA_USERNAME:** `username`  
  The username, if required, for authentication to the Kafka cluster.

- **KAFKA_PASSWORD:** `userpass`  
  The password corresponding to the username for authentication to the Kafka cluster.

- **SCHEMA_REGISTRY_URL:** `http://localhost:8081`  
  The URL of the Schema Registry, if in use.

Make sure to adjust these variables according to your environment's requirements before starting the Kafkonnector service.

## Usage
Kafkonnector exposes a set of APIs for managing connectors and efficiently processing files. The service automatically creates folders for pending, processed, and retry files within the `/data/` directory.

### API Endpoints

#### 1. List Connectors
- **Endpoint:** `GET /connectors`
- **Description:** Retrieve an array of all registered connectors.

**Response example:**
```bash
[
  'mobiles',
  'operators',
  'subscription'
]
```
#### 2. Get Connector Configuration
- **Endpoint:** `GET /connectors/:connector/configs`
- **Description:** Retrieve the configuration details of a specific connector.

**Response example:**
```json
{
  "_id": "65722975fe1d43e902a05302",
  "name": "mobiles",
  "delimiter": ";",
  "topic": "event-streaming.connector.mobiles",
  "fieldNames": "mobile;operatorCode;operatorName;regionCode",
  "filters": {
    "sequence": "renameMobile;removeOperationName;appendCodes",
    "jobs": [
      {
        "name": "renameMobile",
        "type": "rename",
        "field": "mobile",
        "target": "mobileNumber"
      },
      {
        "name": "removeOperationName",
        "type": "remove",
        "field": "operationName"
      },
      {
        "name": "appendCodes",
        "type": "append",
        "firstField": "operationCode",
        "secondField": "regionCode",
        "newFieldName": "codes"
      }
    ]
  },
  "retry": false
}
```

#### 3. Delete Connector
- **Endpoint:** `DELETE /connectors/:connector`
- **Description:** Delete a connector.

#### 4. Create/Update Connector
- **Endpoint:** `POST /connectors`
- **Description:** Create or update a connector. The name property is used to identify existing connectors for updates.

**Request example:**
```json
{
  "name": "subscriptions",
  "delimiter": ";",
  "topic": "event-streaming.connector.subscriptions",
  "fieldNames": "name;age;subscriptionName;active;data",
  "filters": {
    "sequence": "renameName;removeAge",
    "jobs": [
      {
        "name": "renameName",
        "type": "rename",
        "field": "name",
        "target": "userName"
      },
      {
        "name": "removeAge",
        "type": "remove",
        "field": "age"
      }
    ]
  },
  "retry": false
}
```

## Validation Schema
A JSON schema is provided for validating the POST request payload. It ensures the correctness of the connector configuration.

### Connector Configuration Validation Schema

When making a POST request to configure a connector, the request payload is validated against the following JSON schema. This schema ensures the correctness and completeness of the connector configuration:

```json
{
  "$id": "connectorConfig",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "delimiter": {
      "type": "string",
      "minLength": 1,
      "maxLength": 1
    },
    "topic": {
      "type": "string"
    },
    "fieldNames": {
      "type": "string"
    },
    "filters": {
      "type": "object",
      "properties": {
        "sequence": {
          "type": "string"
        },
        "jobs": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "type": {
                "type": "string",
                "enum": [
                  "rename",
                  "remove",
                  "append"
                ]
              },
              "field": {
                "type": "string",
                "required": [
                  "rename",
                  "remove"
                ]
              },
              "target": {
                "type": "string",
                "required": [
                  "rename"
                ]
              },
              "firstField": {
                "type": "string",
                "required": [
                  "append"
                ]
              },
              "secondField": {
                "type": "string",
                "required": [
                  "append"
                ]
              },
              "newFieldName": {
                "type": "string",
                "required": [
                  "append"
                ]
              }
            },
            "required": [
              "name",
              "type"
            ]
          }
        }
      },
      "required": [
        "sequence",
        "jobs"
      ]
    },
    "retry": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "name",
    "delimiter",
    "topic",
    "fieldNames",
    "retry"
  ]
}
```

## Filters Operation

The filters are not mandatory; however, if you wish to include filters in your connector, it is mandatory to provide the `sequence` and the `jobs`. The number of `jobs` must be equal to the number of names in the `sequence`, which should be separated by the delimiter `;`.

The existing filters are:

### Rename

The `rename` filter is responsible for renaming a specific field. Since the user defines the connector, they will set the field names in the fieldNames property. However, if needed, the `rename` filter can change the name of a field before writing the message to Kafka.
Usage example:

Suppose the fieldNames defined in the connector's POST request are: `"name;age;birthDate"`.

Given the line in the file arrives as: `"Liz;33;19901202"`.

```json
"filters": {
  "sequence": "renameName",
  "jobs": [
    {
      "name": "renameName",
      "type": "rename",
      "field": "name",
      "target": "userName"
    }
  ]
}
```

The final result when the filter is applied will be:

```json
{
  "userName": "Liz",
  "age": "33",
  "birthDate": "19901202"
}
```

### Create

The `create` filter will create a new field in the body of the message to be sent to Kafka.

Usage example for the same case above: `"name;age;birthDate"`.

Given the line in the file arrives as: `"Liz;33;19901202"`.

```json
"filters": {
  "sequence": "createAddress",
  "jobs": [
    {
      "name": "createAddress",
      "type": "create",
      "fieldName": "address",
      "fieldValue": "Av. Test, 123"
    }
  ]
}
```

The final result when the filter is applied will be:

```json
{
  "name": "Liz",
  "age": "33",
  "birthDate": "19901202",
  "address": "Av. Test, 123"
}
```

### Drop

The `drop` filter will eliminate a row from being written to Kafka based on a logical operation with an expected value.

Considering the following lines: `["Liz;33;19901202", "Eder;13;20101202"]`

```json
"filters": {
  "sequence": "dropAge",
  "jobs": [
    {
      "name": "dropAge",
      "type": "drop",
      "fieldTarget": "age",
      "comparison": {
        "operator": "===",
        "value": "13"
      }
    }
  ]
}
```

The final result to be written to Kafka:

```json
{
   "name": "Liz",
   "age": "33",
   "birthDate": "19901202"
}
```

### PositionedDrop

Similar to `drop`, `positionedDrop` will consider a specific character in the string.

Considering the following lines: `["Liz;33;19901202", "Eder;13;20101202"]`

```json
"filters": {
  "sequence": "dropNameWithIIndex1",
  "jobs": [
    {
      "name": "dropNameWithIIndex1",
      "type": "positionedDrop",
      "fieldTarget": "name",
      "comparison": {
        "operator": "===",
        "value": "i"
        "digit" : 1
      }
    }
  ]
}
```

The final result to be written to Kafka:

```json
{
   "name": "Eder",
   "age": "13",
   "birthDate": "20101202"
}
```

### remove

The `remove` filter will eliminate a field from being written to Kafka.

Given the fields: `"name;age;birthDate"` and the line: `"Liz;33;19901202"`.

```json
"filters": {
  "sequence": "removeName;removeAge",
  "jobs": [
    {
      "name": "removeName",
      "type": "remove",
      "fieldTarget": "name"
    },
    {
      "name": "removeAge",
      "type": "remove",
      "fieldTarget": "age"
    }
  ]
}
```

The final result to be written to Kafka:

```json
{
   "birthDate": "19901202"
}
```

### append

The `append` filter combines two properties into one, assigning the name defined in newFieldName to the resulting combined property. This filter allows merging of two fields into a single field with a specified name.

Given the fields: `"name;age;birthDate"` and the line: `"Liz;33;19901202"`.

```json
"filters": {
  "sequence": "appendNameAge;appendNameAndAgeBirthDate",
  "jobs": [
    {
      "name": "appendNameAge",
      "type": "append",
      "firstField" : "name", 
      "secondField" : "age", 
      "newFieldName" : "nameAndAge"
    },
    {
      "name": "appendNameAndAgeBirthDate",
      "type": "append",
      "firstField" : "nameAndAge", 
      "secondField" : "birthDate", 
      "newFieldName" : "nameAndAgeAndBirthDate"
    }
  ]
}
```

The final result to be written to Kafka:

```json
{
   "nameAndAgeAndBirthDate": "Liz3319901202"
}
```

### set

The `set` filter is highly specific, and its usage should be carefully considered. If your file lacks clear delimiters such as ';', you can use the set filter to assign fields and their respective values without needing to preprocess the file before submitting it to the Kafkonnector.

The property `positionTarget` is used to indicate the position within the array where this value should be placed.

Given the fields: `"name;age;birthDate"` and the file line: `[ "Liz 3319901202", "Eder1320101202" ]`.

```json
"filters": {
  "sequence": "setName;setAge;setBirth",
  "jobs": [
    {
      "name": "setName",
      "type": "set",
      "positionStart" : 0, 
      "fieldLength" : 4, 
      "positionTarget" : 0
    },
    {
      "name": "setAge",
      "type": "set",
      "positionStart" : 4, 
      "fieldLength" : 2, 
      "positionTarget" : 1
    },
    {
      "name": "setBirth",
      "type": "set",
      "positionStart" : 6, 
      "fieldLength" : 8, 
      "positionTarget" : 2
    }
  ]
}
```

For this case, it is essential that each line of the file has the same number of characters.

The final result to be written to Kafka:

```json
{
   "name": "Liz",
   "age": "33",
   "birthDate": "19901202"
},
{
   "name": "Eder",
   "age": "13",
   "birthDate": "20101202"
}
```

New filters are being developed such as `parseInt`, `parseString`, and others...

## Folder Structure

When creating new connectors using the POST method, the `mongoWatcher` automatically maps specific folders within the `/data/` directory. This mapping is exemplified in the scenario described below:

- `/data/kafkonnector/subscription/pending`: This folder is designated for files awaiting processing. Users should place files that need to be processed in this directory.

- `/data/kafkonnector/subscription/processed`: Upon successful processing, the service compiles the processed lines into a file within this folder. The file is named `${currentTimestamp}_subscriptions.txt`, and it contains the lines successfully written to the Kafka topic.

- `/data/kafkonnector/subscription/retry`: For lines that encountered processing errors and were not successfully written to the Kafka topic, these lines are compiled into a file within the retry folder. 

## Processing Logic

- If the connector is configured with the `retry` property set to true, after the initial processing, any files in the retry folder are moved back to the pending folder for reprocessing.

- During this reprocessing, if 'n' records are successfully written, an additional file is generated in the processed folder named `${currentTimestamp}_r_subscriptions.txt`. This file contains the 'n' lines that were successfully processed.

- If, during this reprocessing attempt, some records still encounter errors, another file is created in the processed folder named `error_${currentTimestamp}_r_subscription.txt`.

- Conversely, if the connector is configured with 'retry' set to false, the processed folder receives the file `${currentTimestamp}_subscriptions.txt` with the 'n' lines that were successfully written. Additionally, a file named `error_${currentTimestamp}_subscriptions.txt` is generated, containing the 'n' lines that were not successfully written to the Kafka topic.

This mechanism allows for flexible handling of records, providing insight into both successful and unsuccessful processing attempts based on the retry configuration of the connector.

## Performance

| Test | Lines Processed | Execution Time |  
|------|-----------------|-----------------|  
| 1    | 100,000         | 13 seconds      |  
| 2    | 1,000,000       | 2 minutes 25 seconds |  
| 3    | 10,000,000      | 23 minutes 8 seconds |  

This showcases the efficient performance of our service in handling large datasets and processing them swiftly.

Enjoy using Kafkonnector for seamless and efficient file-to-message transformations!
