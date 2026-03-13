# AGENTS.md

HSBS is a CMS-style full-stack SaaS platform built with Spring Boot, React, and MySQL.

The project includes:
- Admin CMS features
- siteKey-based SaaS architecture
- PromptProfile-based AI configuration
- KB / RAG document operations
- Widget configuration and public chatbot integration

When generating or editing code, always follow the existing HSBS project conventions before introducing new patterns.

## Tech Stack

- Backend: Java, Spring Boot, Spring Data JPA
- Frontend: React, TypeScript
- Database: MySQL
- Deployment: Apache, Linux server environment
- AI/Platform: siteKey-based SaaS, PromptProfile, KB/RAG, WidgetConfig

## Backend Architecture Rules

- All Entities should inherit from `AuditBase`.
- Standard audit columns must follow the HSBS convention:
  `use_tf`, `del_tf`, `reg_adm`, `reg_date`, `up_adm`, `up_date`, `del_adm`, `del_date`.

- Always use soft delete unless a physical delete is explicitly required.
- Use `del_tf = 'Y'` for logical deletion.
- Use Spring Data JPA and Pageable for list queries where pagination is needed.
- Follow existing HSBS backend patterns before creating new structures.
- Avoid introducing new architectural patterns when an HSBS precedent exists.

## DTO Rules

For all new admin/backend modules:

- `Request` handles both create and update in a single class.
- `ListResponse` returns:
  - `items`
  - `totalCount`
  - `totalPages`
- `Response` returns the full detail view.
- Use static mapping methods such as `from()` or `of()` consistently.
- Keep frontend types aligned with backend DTO structures whenever possible.

## Frontend Feature Architecture Rules

Frontend admin features must follow a feature-based structure.

Base structure:
src/features/admin/{FeatureName}/
- components/
- hooks/
- services/
- types/
- index.tsx

Definitions:
- `components/`: feature-specific UI parts such as tables, forms, modals, preview panels
- `hooks/`: feature-specific custom hooks for state, effects, refs, params, querystring handling, and page flow
- `services/`: API request functions
- `types/`: frontend types mapped to backend DTOs
- `index.tsx`: main page component for the feature

## Frontend Implementation Rules

- `index.tsx` should focus on page composition and orchestration.
- `index.tsx` acts as the page controller layer coordinating hooks, components, and services.
- Move detailed UI blocks into `components/`.
- Move feature state and page logic into `hooks/`.
- Keep API calls out of components and place them in `services/`.
- Keep types aligned with backend DTO naming:
  - `XxxRequest`
  - `XxxResponse`
  - `XxxListResponse`
- Shared/common components must live outside feature folders.
- Avoid introducing global state libraries unless explicitly required.

## Naming Conventions

- Backend class names should be explicit and domain-based.
- DTO names should follow:
  - `XxxRequest`
  - `XxxResponse`
  - `XxxListResponse`
- React feature folder names should use PascalCase where existing HSBS features do so.
- Service functions should use clear verb-based naming:
  - `fetchXxxList`
  - `fetchXxxDetail`
  - `createXxx`
  - `updateXxx`
  - `deleteXxx`
  - `updateXxxUseTf`

## Reuse Existing Patterns First

Before creating new code:
- search for an existing HSBS module with a similar purpose
- reuse existing folder structure, DTO patterns, service patterns, and page composition style
- prefer consistency with current HSBS modules over introducing new abstractions

## Multi-Tenant Architecture (siteKey)

HSBS operates as a siteKey-based multi-tenant SaaS platform.

- All AI, KB, and Widget operations must be scoped by `siteKey`.
- Data isolation between siteKeys must be preserved.
- New features must consider tenant-aware design.
- Do not introduce global AI or KB logic that bypasses siteKey boundaries.

## AI / RAG Architecture

HSBS includes an AI retrieval-augmented architecture.

- Knowledge must be organized via kb_source, kb_document, kb_job, and kb_binding.
- Prompt behavior is controlled via PromptProfile.
- AI features should prioritize retrieval before generation.

## File Encoding Rules

- All source files must be encoded in UTF-8 without BOM.
- Do not generate files with UTF-8 BOM.
- Ensure compatibility across:
  - Java (Spring Boot)
  - TypeScript / React
  - Python (FastAPI)
  - JSON / YAML / Properties files
- Avoid locale-dependent encodings such as EUC-KR or CP949.
- Korean text must be preserved correctly in:
  - source code
  - JSON responses
  - database content
  - API request/response payloads
  - Always assume UTF-8 environment on Linux deployment servers.

## Build System Safety Rules

- Do not create new Gradle build files unless explicitly requested.
- Do not create, replace, or rename:
  - `build.gradle`
  - `build.gradle.kts`
  - `settings.gradle`
  - `settings.gradle.kts`
- Do not migrate between Groovy Gradle and Kotlin Gradle DSL unless explicitly requested.
- Do not change the existing multi-module or single-module build structure unless explicitly requested.
- When adding a dependency or plugin, modify the existing build file minimally instead of generating a new one.
- Always inspect and reuse the current build configuration before proposing build-related changes.
- Preserve the current Gradle structure as the source of truth.

## Project Structure Safety Rules

- Do not create duplicate project roots.
- Do not scaffold a new backend or frontend project inside the existing repository.
- Do not introduce alternative build tools unless explicitly requested.
- Reuse the current repository layout as the source of truth.

