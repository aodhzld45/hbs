# HSBS Backend CRUD Pattern

This document describes the standard backend CRUD structure for HSBS admin modules.

## Purpose

Use this pattern when generating or extending admin CRUD features in the Spring Boot backend.

The goal is to make new modules look and behave like existing HSBS modules.

## Standard Backend Layers

A typical HSBS admin CRUD module includes:

- Entity
- Repository
- Service
- Controller
- Request DTO
- Response DTO
- ListResponse DTO

## Entity Rules

- Every entity must inherit from `AuditBase`.
- Do not duplicate standard audit columns inside each entity unless there is a specific legacy reason.
- Standard audit behavior is inherited from the existing HSBS base model.
- Logical deletion must be used by default.

### Required conventions
- use `del_tf = 'Y'` for soft delete
- preserve `use_tf` handling where applicable
- keep entity naming domain-based and explicit
- follow existing table and column naming style in the repository

### Example naming
- `FaqCategory`
- `PopupBanner`
- `KbSource`

## Repository Rules

- Use Spring Data JPA repositories.
- Prefer pageable list queries for admin list pages.
- Reuse existing repository style already used in HSBS.
- Do not introduce a completely new repository abstraction if an existing pattern already works.

### Typical responsibilities
- paginated list retrieval
- detail lookup
- filtering by keyword / use flag / delete flag if needed
- tenant-aware filtering when the module is siteKey-scoped

## Service Rules

The service layer should handle practical admin CRUD logic.

Typical responsibilities:
- list
- detail
- create
- update
- soft delete
- use flag toggle
- validation or duplicate checks when needed

### Service guidelines
- keep business logic in service layer, not controller
- preserve existing HSBS coding style
- do not over-abstract simple CRUD logic
- prefer clarity over generic framework-like patterns

## Controller Rules

The controller should expose admin-oriented endpoints and delegate logic to the service layer.

Typical responsibilities:
- receive request DTOs
- pass pageable/search params
- return response DTOs
- keep controller thin

### Controller guidelines
- do not put business logic directly in controller
- follow existing admin API style already present in HSBS
- reuse current request/response conventions

## DTO Pattern

HSBS uses a fixed DTO structure.

### Request
One `Request` DTO handles both create and update.

Example:
- `FaqCategoryRequest`

### Response
One `Response` DTO handles detail view.

Example:
- `FaqCategoryResponse`

### ListResponse
One `ListResponse` DTO handles paginated list response.

Required fields:
- `items`
- `totalCount`
- `totalPages`

Example:
- `FaqCategoryListResponse`

### Mapping
- Prefer static mapping methods such as `from()` or `of()`
- Keep mapping explicit and readable
- Do not introduce inconsistent mapper styles inside the same module

## Delete Policy

HSBS uses logical deletion by default.

### Rules
- do not physically delete unless explicitly requested
- update `del_tf` to `'Y'`
- preserve audit update flow consistently
- list queries should exclude deleted data unless explicitly required otherwise

## Pagination Pattern

For admin list pages:
- prefer Spring Data `Pageable`
- keep list responses compatible with frontend pagination needs
- map page results into `ListResponse`

## Tenant-Aware Pattern

If the module is related to siteKey or tenant-specific data:
- preserve tenant isolation
- include tenant-aware query filtering
- do not accidentally expose cross-tenant data
- follow the current HSBS multi-tenant direction

## Practical Generation Checklist

When generating a backend CRUD module, verify:

- entity extends `AuditBase`
- soft delete is used
- Request/Response/ListResponse names are correct
- pageable list pattern is used when needed
- controller is thin
- service owns main CRUD flow
- repository follows existing JPA style
- no new build files are created
- no new architecture is introduced unnecessarily

## Example Output Shape

A typical generated backend module may include:

- `Xxx.java`
- `XxxRepository.java`
- `XxxService.java`
- `XxxController.java`
- `XxxRequest.java`
- `XxxResponse.java`
- `XxxListResponse.java`

The exact package structure should follow the closest existing HSBS module rather than inventing a new package layout.