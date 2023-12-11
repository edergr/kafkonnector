# Kafkonnector v1.3.2

Kafkonnector is a versatile tool designed to transform large files into Kafka messages efficiently. This project leverages various technologies to provide a seamless solution for your data processing needs.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Validation Schema](#validation-schema)
- [Folder Structure and Processing Logic](#folder-structure-and-processing-logic)
- [Project Structure](#project-structure)
- [Performance](#performance)

## Installation
To install Kafkonnector, ensure you have Node.js and npm installed. Then, run the following commands:

```bash
npm install
npm start
```

## Usage
Kafkonnector exposes a set of APIs for managing connectors and efficiently processing files. The service automatically creates folders for pending, processed, and retry files within the `/data/` directory.

### API Endpoints

#### 1. List Connectors
- **Endpoint:** `GET /connectors`
- **Description:** Retrieve an array of all registered connectors.

**Example:**
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

**Example:**
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

**Example:**
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

- **name:** A unique name for the connector configuration.

- **delimiter:** This property specifies the delimiter between fields in the file. For example, if your file format is `text;text;text`, the delimiter should be specified as `;`.

- **topic:** This property represents the destination topic where messages should be written.

- **fieldNames:** This property is a string with the names of fields separated by `;`. For example, if the file contains the names, ages, and birthdates (`Arthur;18;12;02;1990`), `fieldNames` should be something like: "name;age;birthMonth;birthDay;birthYear".

- **retry:** This boolean property indicates whether there should be a retry attempt for records that encountered errors during processing.

### Filters Operation

The filters are not mandatory; however, if you wish to include filters in your connector, it is mandatory to provide the `sequence` and the `jobs`. The number of `jobs` must be equal to the number of names in the `sequence`, which should be separated by the delimiter `;`.

The operation of filters occurs as follows:

Suppose the `sequence` is defined as follows:
```json
"sequence": "renameName;removeAge;appendMonthAndDay;appendMonthDayAndYear"
```

And the jobs are specified in the `jobs` array, following the example provided in the sequence:
```json
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
  },
  {
    "name": "appendMonthAndDay",
    "type" : "append", 
    "firstField" : "birthMonth", 
    "secondField" : "birthDay", 
    "newFieldName" : "birthMonthAndDay"
  },
  {
    "name": "appendMonthDayAndYear",
    "type" : "append", 
    "firstField" : "birthMonthAndDay", 
    "secondField" : "birthYear", 
    "newFieldName" : "birthFullDate"
  }
]
```

Applying the filters above to a file containing the fields: `"name;age;birthMonth;birthDay;birthYear"`, the payload to be written to the topic will be:

```json
{
  "userName": "Pedro",
  "birthFullDate": "12021990"
}
```

In this example, the `name` property was renamed to `userName`, the `age` property was removed, and the properties related to birth were concatenated according to the sequence of filters: first `appendMonthAndDay`, followed by `appendMonthDayAndYear`.

This mechanism allows flexible and customizable transformations to be applied to the data before being written to the specified Kafka topic.
  
The provided filters currently include three types: `rename`, `remove`, and `append`.


## Folder Structure and Processing Logic

When creating new connectors using the POST method, the `mongoWatcher` automatically maps specific folders within the `/data/` directory. This mapping is exemplified in the scenario described below:

- `/data/kafkonnector/subscription/pending`: This folder is designated for files awaiting processing. Users should place files that need to be processed in this directory.

- `/data/kafkonnector/subscription/processed`: Upon successful processing, the service compiles the processed lines into a file within this folder. The file is named `${currentTimestamp}_subscriptions.txt`, and it contains the lines successfully written to the Kafka topic.

- `/data/kafkonnector/subscription/retry`: For lines that encountered processing errors and were not successfully written to the Kafka topic, these lines are compiled into a file within the retry folder. 

  - If the connector is registered with the 'retry' property set to true, after the completion of processing, the file in the retry folder is moved back to the pending folder for reprocessing.

  - If during this reprocessing attempt 'n' records are successfully written, the processed folder receives an additional file named `${currentTimestamp}_r_subscriptions.txt`, containing the 'n' lines that were successfully processed.

  - If 'n' records still encounter errors during this reprocessing attempt, the processed folder receives another file named `erro_$currentTimestamp_r_subscription.txt`.

  - If the connector is registered with 'retry' set to false, the processed folder, in addition to receiving the file `${currentTimestamp}_subscriptions.txt` with the 'n' lines successfully written, also receives a file named `erro_${currentTimestamp}_subscriptions.txt`, containing the 'n' lines that were not successfully written to the topic.

Upon starting the service, it checks the number of connectors in the database and whether the mapped folders already exist. If any or all of the folders do not exist, the service creates them automatically.

## Project Structure

The project is organized into distinct modules, each responsible for specific aspects of its functionality:

- **connector-config:** This module encapsulates the logic for configuring connectors. It handles the creation and modification of connector settings, ensuring that the system operates with the desired configurations.

- **data-processor:** The data-processor module is dedicated to processing the content of files. It manages the transformation and manipulation of data according to the specified configurations, preparing it for transmission to the Kafka topic.

- **file-processor:** Within this module lies the logic for processing files. It orchestrates the interaction between the data-processor and the file system, ensuring efficient and accurate file processing.

- **handle-folders:** This module manages the treatment of folders within the system. It oversees the creation and handling of the folders related to pending, processed, and retry files, ensuring a seamless workflow during file processing.

- **server:** The server module is responsible for managing the startup and shutdown procedures of the entire project. It coordinates the initialization and termination of services, providing a central point of control.

- **streams:** The streams module encompasses the logic for Kafka interactions and the MongoDB watcher. It facilitates the communication with Kafka topics and monitors the MongoDB for changes, ensuring a dynamic and responsive system.

## Performance

### Processing a Million Lines

One million lines of data were processed in the following scenario:

- Input: File with one million lines
- Operation: All lines were treated with specific filters
- Output: Messages were sent to a Kafka topic with 5 partitions

#### Kafka Topic Details

- **Partition 0:**
  - Offset Range: 0 to 200001
  - Messages: 200002
![image](https://github.com/edergr/kafkonnector/assets/107067613/d88c0ae2-9f26-4e8f-85c1-9112de6bf77d)

- **Partition 1:**
  - Offset Range: 0 to 200287
  - Messages: 200288
![image](https://github.com/edergr/kafkonnector/assets/107067613/66f4822d-93c7-48d4-94da-88e343addc4a)

- **Partition 2:**
  - Offset Range: 0 to 199810
  - Messages: 199811
![image](https://github.com/edergr/kafkonnector/assets/107067613/0bf46829-c164-49bb-814d-c6a3658da641)

- **Partition 3:**
  - Offset Range: 0 to 199654
  - Messages: 199655
![image](https://github.com/edergr/kafkonnector/assets/107067613/cc57e02b-0520-43d4-9806-6c8aafc19e87)

- **Partition 4:**
  - Offset Range: 0 to 200243
  - Messages: 200244
![image](https://github.com/edergr/kafkonnector/assets/107067613/8e9634d5-3ca0-4f59-896f-4db5053fc26b)

- **Total Messages:** 1000000

#### Processing Time

The processing time for the entire operation was:
- **2 minutes, 24 seconds, and 924 milliseconds**
![image](https://github.com/edergr/kafkonnector/assets/107067613/dd2418fe-b977-4bee-9234-103793d76cee)

This showcases the efficient performance of our service in handling large datasets and processing them swiftly.

Enjoy using Kafkonnector for seamless and efficient file-to-message transformations!
