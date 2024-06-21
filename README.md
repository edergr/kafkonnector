# Kafkonnector v1.4.4

Kafkonnector is a versatile tool designed to transform large files into Kafka messages efficiently. This project leverages various technologies to provide a seamless solution for your data processing needs.

## Table of Contents
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Validation Schema](#validation-schema)
- [Filters Operations](#filters-operations)
- [Folder Structure](#folder-structure)
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
  Port on which the service will run.

- **MONGODB_URI:** `mongodb://localhost:27017/kafkonnector`  
  Connection URI to the MongoDB database where connector configurations are stored.

- **ROOT_FOLDER:** `/data/kafkonnector`  
  Root directory in which the service organizes folders for pending, processed, and retry files.

- **KAFKA_CONNECT_URL:** `localhost:9092`  
  The connection URL to the Kafka cluster.

- **KAFKA_SECURITY_PROTOCOL:** `PLAINTEXT`  
  The security protocol used to communicate with the Kafka cluster.

- **KAFKA_USERNAME:** `username`  
  Username, if required, for authentication to the Kafka cluster.

- **KAFKA_PASSWORD:** `userpass`  
  Password corresponding to the username for authentication to the Kafka cluster.

- **SCHEMA_REGISTRY_URL:** `http://localhost:8081`  
  Schema Registry URL, if in use.

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
        "fieldTarget": "mobile",
        "newFieldName": "mobileNumber"
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
        "fieldTarget": "name",
        "newFieldName": "userName"
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

When making a POST request to configure a connector, the request payload is validated against the following JSON schema. This schema ensures the correctness and completeness of the connector configuration:

### JSON
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
    },
    "topic": {
      "type": "string"
    },
    "schemaValueId": {
      "type": "integer"
    },
    "fieldNames": {
      "type": "string"
    },
    "propertiesPosition": {
      "type": "array"
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
                  "append",
                  "create",
                  "drop",
                  "positionedDrop",
                  "remove",
                  "rename",
                  "set"
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
                  "append",
                  "rename"
                ]
              },
              "fieldName": {
                "type": "string",
                "required": [
                  "create"
                ]
              },
              "fieldValue": {
                "type": "string",
                "required": [
                  "create"
                ]
              },
              "fieldTarget": {
                "type": "string",
                "required": [
                  "remove",
                  "rename",
                  "drop",
                  "positionedDrop"
                ]
              },
              "comparsion": {
                "type": "object",
                "required": [
                  "drop",
                  "positionedDrop"
                ],
                "properties": {
                  "operator": {
                    "type": "string",
                    "enum": [
                      "===",
                      "!==",
                      ">",
                      "<",
                      ">=",
                      "<="
                    ],
                    "required": [
                      "drop",
                      "positionedDrop"
                    ]
                  },
                  "value": {
                    "type": "string",
                    "required": [
                      "drop",
                      "positionedDrop"
                    ]
                  },
                  "digit": {
                    "type": "integer",
                    "required": [
                      "positionedDrop"
                    ]
                  }
                }
              },
              "positionStart": {
                "type": "integer",
                "required": [
                  "set"
                ]
              },
              "fieldLength": {
                "type": "integer",
                "required": [
                  "set"
                ]
              },
              "positionTarget": {
                "type": "integer",
                "required": [
                  "set"
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
    "topic",
    "fieldNames",
    "retry"
  ]
}
```

### Properties Definition

#### Top-Level Properties
`name` - Represents the name of the connector. This name will also be used to create a folder in ROOT_FOLDER and consequently receive the folders pending, retry, and processed.
<br>`delimiter` - This property is used to split the lines of files. If not specified in the connector configuration, the default value ';' will be considered.
<br>`topic` - Name of the topic to which this connector should write messages.
<br>`schemaValueId` - ID of the Schema related to the topic.
<br>`fieldNames` - Names of the fields representing data in the file line.
<br>`propertiesPosition` - Option to avoid using the filter: set. propertiesPosition is an array where each element should contain the initial character that represents where each field starts. To define the end character, the service itself considers the next position in the array minus 1. For example, assuming the received line in the file is: 'Eder3319901202', defining propertiesPosition as: [0, 4, 6], the service will understand that the line is divided as follows: 
<br>0   4 6
<br>Eder3319901202' thus, it will format it as follows to apply the filters: 'Eder;33;19901202';
<br>`filters` - Definition of filters.
<br>`retry` - Defines whether to perform write retry or not.

#### Properties of filters
`filters.sequence` - Sequence in which jobs should be executed: 'renameUser;removeAddress;createCode'
<br>`filters.jobs` - Definition of jobs (explained later with examples)

#### Properties of jobs (inside filters)
`filters.jobs[].name` - Job name, same name used in the sequence property.
<br>`filters.jobs[].type` - Job type: append, create, drop, positionedDrop, remove, rename, and set.
<br>`filters.jobs[].firstField` - First field when applying the append filter. 
<br>`filters.jobs[].secondField` - Second field when applying the append filter. 
<br>`filters.jobs[].newFieldName` - New field name, used for append and rename operations.
<br>`filters.jobs[].fieldName` - New field name in the create filter.
<br>`filters.jobs[].fieldValue` - Value of the new field in the create filter.
<br>`filters.jobs[].fieldTarget` - Target field for drop, positionedDrop, remove, and rename filters.
<br>`filters.jobs[].comparison` - Object for drop and positionedDrop filters.
<br>`filters.jobs[].comparison.operator` - Type of operation to validate whether to remove the line or not. Used in drop and positionedDrop filters.
<br>`filters.jobs[].comparison.value` - Value considered for validation. Used in drop and positionedDrop filters.
<br>`filters.jobs[].comparison.digit` - Only for positionedDrop filter, represents the index of the character for validation.
<br>`filters.jobs[].positionStart` - Used in set filter to define the starting index in the string where the field begins.
<br>`filters.jobs[].fieldLength` - Used in set filter to define the length of this field.
<br>`filters.jobs[].positionTarget` - Used in set filter to define the index where it should be positioned in the message.

## Schema Analysis
The schema is a JSON object with an identifier ($id) "connectorConfig".
It includes various properties, some of which are required and others optional.

### Required Properties
The properties that are necessary for the JSON object to be valid, as defined in the "required" list at the end of the schema, are:
<br>`name`: Must be a string.
<br>`topic`: Must be a string.
<br>`fieldNames`: Must be a string.
<br>`retry`: Must be a boolean, with a default value of false if not specified.

### Optional Properties
The properties that are not required and may or may not be present in the JSON object are:
<br>`delimiter`: Must be a string
<br>`schemaValueId`: Must be an integer.
<br>`propertiesPosition`: Must be an array.
<br>`filters`: Must be an object with its own internal structure and specific requirements.

### Structure of the filters Property
If the filters property is present, it must include:
<br>`sequence`: A string (required).
<br>`jobs`: An array with at least one item (defined by minItems: 1) 
<br>Each item is an object that must contain at least:
<br>- `name`: A string.
<br>- `type`: A string that must be one of the specific values: "append", "create", "drop", "positionedDrop", "remove", "rename", "set".

Depending on the value of type, some additional properties may be required:
<br>`firstField`, `secondField`: Required for type `append`. 
<br>`newFieldName`:  Required for type `append` and `rename`.
<br>`fieldName`, `fieldValue`: Required for type `create`.
<br>`fieldTarget`: Required for types `remove`, `drop`, `positionedDrop` and `rename`.
<br>`comparison`: Required for types `drop`, `positionedDrop`. Must contain `operator` and `value`, and `digit` additionally for `positionedDrop`. `operator` must be one of the specific values: ===, !==, >, <, >=, <=.
<br>`positionStart`, `fieldLength`, `positionTarget`: Required for type `set`.

### Summary of Rules
<br>Required at the top level: `name`, `topic`, `fieldNames`, `retry`.
<br>Optional at the top level: `delimiter`, `schemaValueId`, `propertiesPosition`, `filters`.
<br>Internal rules for `filters`: `sequence` and `jobs` are required.
<br>Each job must have `name` and `type`.
<br>Additional properties for `jobs` depend on the value of `type`.

### Example of a Valid Object
Here is an example of a valid JSON object based on this schema:

```json
{
  "name": "exampleConnector",
  "delimiter": ";",
  "topic": "exampleTopic",
  "fieldNames": "field1,field2",
  "retry": true,
  "filters": {
    "sequence": "job1;job2;job3;job4;job5;job6",
    "jobs": [
      {
        "name": "job1",
        "type": "rename",
        "fieldTarget": "oldFieldName",
        "newFieldName": "newFieldName"
      },
      {
        "name": "job2",
        "type": "append",
        "firstField": "field1",
        "secondField": "field2",
        "newFieldName": "appendedField"
      },
      {
        "name": "job3",
        "type": "create",
        "fieldName": "newField",
        "fieldValue": "value"
      },
      {
        "name": "job4",
        "type": "drop",
        "fieldTarget": "fieldToDrop",
        "comparsion": {
          "operator": "!==",
          "value": "someValue"
        }
      },
      {
        "name": "job5",
        "type": "positionedDrop",
        "fieldTarget": "fieldToDrop",
        "comparsion": {
          "operator": "===",
          "value": "someValue",
          "digit": 3
        }
      },
      {
        "name": "job6",
        "type": "set",
        "positionStart": 0,
        "fieldLength": 5,
        "positionTarget": 10
      }
    ]
  }
}
```

## Filters Operations

The filters are not mandatory; however, if you wish to include filters in your connector, it is required to provide the `sequence` and the `jobs`. The number of `jobs` must be equal to the number of names in the `sequence`, which should be separated by the delimiter `;`.

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
      "fieldTarget": "name",
      "newFieldName": "userName"
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

### Remove

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

### Append

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

### Set

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

### Processing Folder Logic

- If the connector is configured with the `retry` property set to true, after the initial processing, any files in the retry folder are moved back to the pending folder for reprocessing.

- During this reprocessing, if 'n' records are successfully written, an additional file is generated in the processed folder named `${currentTimestamp}_r_subscriptions.txt`. This file contains the 'n' lines that were successfully processed.

- If, during this reprocessing attempt, some records still encounter errors, another file is created in the processed folder named `error_${currentTimestamp}_r_subscription.txt`.

- Conversely, if the connector is configured with 'retry' set to false, the processed folder receives the file `${currentTimestamp}_subscriptions.txt` with the 'n' lines that were successfully written. Additionally, a file named `error_${currentTimestamp}_subscriptions.txt` is generated, containing the 'n' lines that were not successfully written to the Kafka topic.

This mechanism allows for flexible handling of records, providing insight into both successful and unsuccessful processing attempts based on the retry configuration of the connector.

## Performance

| Test | Processed Lines | Execution Time |  
|------|-----------------|-----------------|  
| 1    | 100,000         | 13 seconds      |  
| 2    | 1,000,000       | 2 minutes 25 seconds |  
| 3    | 10,000,000      | 23 minutes 8 seconds |  

This showcases the efficient performance of our service in handling large datasets and processing them swiftly.

Enjoy using Kafkonnector for seamless and efficient file-to-message transformations!
