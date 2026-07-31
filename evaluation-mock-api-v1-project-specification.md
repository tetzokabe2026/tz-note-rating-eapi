# Evaluation Mock API
## OpenAPI Specification Requirements — V1.0

## 1. Purpose

Define an OpenAPI Specification for a simple Mock API that evaluates technical notes.

The API returns random five-level ratings for the following four evaluation items:

- Usefulness
- Importance
- Credibility
- Vocabulary Richness

This document defines the API contract only.

Actual API implementation is not required.

---

## 2. OpenAPI Version

Use:

```yaml
openapi: 3.0.3
```

The API information must be defined as follows:

```yaml
info:
  title: Evaluation Mock API
  version: 1.0.0
```

---

## 3. Resource

The API contains only one resource:

```text
/evaluations
```

Do not define additional business resources.

---

## 4. Endpoints

Define the following three operations:

```text
POST   /evaluations
GET    /evaluations/{id}
DELETE /evaluations/{id}
```

---

## 5. POST /evaluations

Creates a mock evaluation.

### Request Body

The request body must be required.

Example:

```json
{
  "body": "Cursor agents execute commands in an isolated environment."
}
```

### Request Body Schema

| Field | Type | Required | Minimum length | Maximum length |
|---|---|---:|---:|---:|
| `body` | string | Yes | 20 characters | 255 characters |

OpenAPI schema example:

```yaml
EvaluationRequest:
  type: object
  additionalProperties: false
  required:
    - body
  properties:
    body:
      type: string
      minLength: 20
      maxLength: 255
      description: Technical note text to be evaluated.
      example: Cursor agents execute commands in an isolated environment.
```

### Successful Response

Recommended status:

```text
201 Created
```

Example response:

```json
{
  "eval-id": "eval-12345",
  "usefulness": 4,
  "importance": 2,
  "credibility": 5,
  "vocabulary-richness": 3
}
```

Requirements:

- `eval-id` must be included.
- `eval-id` must be a string.
- Each rating must be an integer from 1 to 5.
- The values represent mock evaluation results.

---

## 6. GET /evaluations/{id}

Returns a mock evaluation result for the specified evaluation ID.

### Path Parameter

| Parameter | Location | Type | Required |
|---|---|---|---:|
| `id` | path | string | Yes |

Example:

```text
GET /evaluations/eval-12345
```

### Successful Response

Recommended status:

```text
200 OK
```

Example response:

```json
{
  "eval-id": "eval-12345",
  "usefulness": 3,
  "importance": 5,
  "credibility": 4,
  "vocabulary-richness": 2
}
```

Requirements:

- The response must include `eval-id`.
- `eval-id` should represent the requested evaluation ID.
- Each rating must be an integer from 1 to 5.

The specification does not require the API to persist or retrieve actual evaluation data.

---

## 7. DELETE /evaluations/{id}

Simulates deletion of an evaluation result.

### Path Parameter

| Parameter | Location | Type | Required |
|---|---|---|---:|
| `id` | path | string | Yes |

Recommended successful response:

```text
204 No Content
```

No response body is required.

The specification does not require the API to persist or delete actual evaluation data.

---

## 8. Evaluation Response Schema

The response schema must contain exactly the following fields:

| Field | Type | Required | Range |
|---|---|---:|---|
| `eval-id` | string | Yes | Not applicable |
| `usefulness` | integer | Yes | 1 to 5 |
| `importance` | integer | Yes | 1 to 5 |
| `credibility` | integer | Yes | 1 to 5 |
| `vocabulary-richness` | integer | Yes | 1 to 5 |

OpenAPI schema example:

```yaml
Evaluation:
  type: object
  additionalProperties: false
  required:
    - eval-id
    - usefulness
    - importance
    - credibility
    - vocabulary-richness
  properties:
    eval-id:
      type: string
      description: Identifier of the evaluation.
      example: eval-12345
    usefulness:
      type: integer
      minimum: 1
      maximum: 5
      example: 4
    importance:
      type: integer
      minimum: 1
      maximum: 5
      example: 2
    credibility:
      type: integer
      minimum: 1
      maximum: 5
      example: 5
    vocabulary-richness:
      type: integer
      minimum: 1
      maximum: 5
      example: 3
```

Do not add evaluation items beyond these four.

---

## 9. Validation Error

`POST /evaluations` must define a validation error response.

Recommended status:

```text
400 Bad Request
```

Validation errors include:

- Request body is missing.
- `body` is missing.
- `body` is not a string.
- `body` contains fewer than 20 characters.
- `body` contains more than 255 characters.
- Unknown request properties are included when strict validation is applied.

Example response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body is invalid.",
    "details": [
      {
        "field": "body",
        "message": "body must contain between 20 and 255 characters."
      }
    ]
  }
}
```

### Validation Error Schema

```yaml
ValidationError:
  type: object
  additionalProperties: false
  required:
    - error
  properties:
    error:
      type: object
      additionalProperties: false
      required:
        - code
        - message
        - details
      properties:
        code:
          type: string
          example: VALIDATION_ERROR
        message:
          type: string
          example: The request body is invalid.
        details:
          type: array
          items:
            type: object
            additionalProperties: false
            required:
              - field
              - message
            properties:
              field:
                type: string
                example: body
              message:
                type: string
                example: body must contain between 20 and 255 characters.
```

The `400` response for `POST /evaluations` must reference this schema.

Example:

```yaml
"400":
  description: Validation error
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/ValidationError"
```

---

## 10. OpenAPI Specification File

Create one OpenAPI Specification file:

```text
openapi.yaml
```

It must define:

- API title and version
- `POST /evaluations`
- `GET /evaluations/{id}`
- `DELETE /evaluations/{id}`
- Required POST request body
- `body` minimum length of 20
- `body` maximum length of 255
- `eval-id` in POST and GET responses
- Usefulness rating
- Importance rating
- Credibility rating
- Rating minimum of 1
- Rating maximum of 5
- Validation error response
- Example requests and responses
- HTTP response codes

---

## 11. Repository Policy

Use only:

```text
master
```

No additional branch is required.

---

## 12. Acceptance Criteria

The OpenAPI definition is complete when:

- `openapi.yaml` uses OpenAPI 3.0.3.
- API version is `1.0.0`.
- Only the `/evaluations` resource is defined.
- `POST /evaluations` is defined.
- `GET /evaluations/{id}` is defined.
- `DELETE /evaluations/{id}` is defined.
- The POST request body is required.
- The request contains a required string field named `body`.
- `body` has `minLength: 20`.
- `body` has `maxLength: 255`.
- POST and GET responses contain `eval-id`.
- The three ratings are integers from 1 to 5.
- A structured `400 Validation Error` response is defined.
- No real implementation is required.
- No database, SAPI, external API, framework, runtime, or container is specified.
