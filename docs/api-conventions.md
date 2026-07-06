# API Conventions

## Base URL
- Development: http://localhost:8000/api/v1/
- Staging: https://staging.voevoda.ru/api/v1/
- Production: https://api.voevoda.ru/v1/

## Versioning
- URL-based versioning (/api/v1/, /api/v2/)
- Breaking changes = new version

## Authentication
- JWT Bearer tokens
- Token in Authorization header: Bearer <token>
- HttpOnly cookies for web clients

## Response Format
\\\json
{
  "success": true,
  "data": {},
  "error": null
}
\\\

## Error Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Naming
- snake_case for fields (django standard)
- RESTful resource naming: /users/, /courses/, /enrollments/
