---
name: hsbs-admin-crud-generator
description: Generate or extend HSBS admin CRUD modules inside the existing repository using current Spring Boot + React + MySQL conventions. Follow AuditBase inheritance, soft delete, Request/Response/ListResponse DTO rules, frontend feature-based admin structure, tenant-aware design when applicable, UTF-8 without BOM, and strict build/project safety rules.
---

# hsbs-admin-crud-generator

This skill is used to generate or extend HSBS admin CRUD features inside the existing HSBS repository.

It must follow the project-wide rules defined in `AGENTS.md` and preserve the current project architecture.

## Primary Goal

Create a new admin CRUD module that fits naturally into the current HSBS codebase without scaffolding a new project or introducing a different architecture.

This skill may generate, when requested:

- backend entity / repository / service / controller
- request / response / list response DTOs
- frontend admin feature structure
- API service functions
- admin list/detail/create/update/delete patterns
- soft delete and `use_tf` handling
- tenant-aware design when the module is related to `siteKey`

## Scope

This skill is appropriate for:

- new admin management pages
- category/code/config tables
- board-like admin modules
- mapping/configuration modules
- popup/banner/content-like CRUD modules
- siteKey-aware admin modules

This skill is not for:

- creating a new standalone Spring Boot project
- creating a new React app
- changing Gradle structure
- redesigning repository-wide architecture
- implementing advanced AI orchestration logic directly in Spring services

## Mandatory HSBS Rules

Always follow these rules.

### Backend rules
- All entities must inherit from `AuditBase`.
- Standard audit columns follow the existing HSBS base structure.
- Always use soft delete unless physical delete is explicitly requested.
- Use `del_tf = 'Y'` for logical deletion.
- Reuse existing Spring Data JPA + Pageable list patterns.
- Avoid introducing new architecture when an HSBS precedent already exists.

### DTO rules
- Use one `Request` DTO for both create and update.
- Use one `Response` DTO for detail view.
- Use one `ListResponse` DTO containing:
  - `items`
  - `totalCount`
  - `totalPages`
- Use static mapping methods such as `from()` or `of()` consistently.

### Frontend rules
Admin frontend features must follow this structure:

`src/features/admin/{FeatureName}/`
- `components/`
- `hooks/`
- `services/`
- `types/`
- `index.tsx`

Additional frontend rules:
- `index.tsx` is the page controller layer.
- Detailed UI blocks go in `components/`.
- State and page logic go in `hooks/`.
- API calls go in `services/`.
- Types align with backend DTO naming:
  - `XxxRequest`
  - `XxxResponse`
  - `XxxListResponse`
- Do not introduce a global state library unless explicitly requested.

### Multi-tenant rules
If the module is tenant-scoped:
- respect `siteKey` boundaries
- preserve tenant isolation
- do not introduce global logic that bypasses siteKey scoping

### Encoding and project safety
- All files must be UTF-8 without BOM.
- Do not create or replace Gradle build files unless explicitly requested.
- Do not scaffold a new backend or frontend project.
- Reuse the current repository layout as the source of truth.

## Required Workflow

Unless the user explicitly asks for full code immediately, follow this order:

1. Inspect the existing repository structure.
2. Find the closest existing HSBS module.
3. Reuse the nearest existing pattern instead of inventing a new one.
4. Propose the target file structure first.
5. Briefly explain the responsibility of each file.
6. Generate only the requested scope.
7. Keep edits minimal and architecture-consistent.

## Output Strategy

Prefer this output order:

1. module overview
2. backend file list
3. frontend file list
4. DTO naming
5. API function naming
6. implementation notes
7. code generation

If the user asks for only part of the module, generate only that part.

Examples:
- backend only
- DTO only
- frontend scaffold only
- service/controller only
- index.tsx + hooks + services only

## Naming Conventions

### Backend
Use explicit domain-based names.

Examples:
- `FaqCategory`
- `FaqCategoryRepository`
- `FaqCategoryService`
- `FaqCategoryController`
- `FaqCategoryRequest`
- `FaqCategoryResponse`
- `FaqCategoryListResponse`

### Frontend
Feature folders should follow existing HSBS style, usually PascalCase.

Examples:
- `src/features/admin/AdminFaqCategory/`
- `src/features/admin/AdminPopupBanner/`

### Service function names
Prefer clear verb-based names:

- `fetchXxxList`
- `fetchXxxDetail`
- `createXxx`
- `updateXxx`
- `deleteXxx`
- `updateXxxUseTf`

## Generation Guidelines

When generating backend code:
- prefer practical HSBS CRUD structure over abstract patterns
- use pageable list query structure when pagination is expected
- keep delete behavior logical by default
- keep response mapping explicit

When generating frontend code:
- prefer table + search + pagination + modal patterns for admin pages
- keep page-level orchestration in `index.tsx`
- move form/table/modal into `components/`
- keep API functions isolated in `services/`
- keep types near the feature in `types/`

## Reuse Policy

Before generating anything:
- search for the most similar existing HSBS module
- copy its pattern, not necessarily its domain names
- preserve consistency with the current repository over introducing new abstractions
- avoid unnecessary refactors outside the requested scope

## Avoid Rules

Do not do the following unless explicitly requested:
- create `build.gradle`, `settings.gradle`, or Gradle wrapper files
- create a new project root
- migrate build scripts
- add Redux, Zustand, or another global state library
- redesign repository-wide architecture
- move large shared structures without a direct request
- implement physical delete by default

## Example Requests

- Create a new HSBS admin CRUD module named `FaqCategory`.
- Scaffold only the frontend admin feature for `AdminFaqCategory`.
- Generate backend entity, DTOs, repository, service, and controller for `PopupCategory`.
- Extend an existing admin module with `use_tf` toggle and soft delete support.
- Add list/detail/create/update/delete API structure following current HSBS rules.

## Success Criteria

A successful result should:
- look like it already belongs to the current HSBS codebase
- reuse existing module patterns
- follow DTO conventions exactly
- preserve AuditBase + soft delete rules
- preserve frontend feature architecture
- avoid build or project structure accidents