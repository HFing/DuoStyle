# Coolmate Seed Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing hard-coded demo catalog with a validated 30-product Coolmate-inspired seed manifest, upload 2–4 images per product to Cloudinary, and reseed the local MySQL database only when explicitly enabled.

**Architecture:** A JSON manifest is parsed and fully validated before any destructive work. `DataInitializer` gates reset behavior with `APP_SEED_RESET`, then deletes dependent records in foreign-key-safe order and rebuilds the catalog using a strict, deterministic Cloudinary upload API. Normal application startup remains non-destructive.

**Tech Stack:** Java 21, Spring Boot, Spring Data JPA, Jackson, MySQL, Cloudinary Java SDK, JUnit 5, Mockito, Maven.

## Global Constraints

- The manifest contains exactly 30 products gathered from current public Coolmate pages.
- Each product has 2–4 distinct HTTPS source images, a positive VND price, valid category, variants, unique slug, and unique SKU values.
- Normal startup must not scrape Coolmate and must not mutate existing data.
- Destructive reseeding is allowed only when `APP_SEED_RESET=true`.
- Manifest validation must finish before database deletion or Cloudinary upload begins.
- Seed uploads use folder `duostyle_products/coolmate_seed` and deterministic public IDs based on product slug and image index.
- A failed seed image upload aborts the seed; source URLs must never be silently persisted as fallback images.
- Do not log or commit Cloudinary credentials.
- This workspace is not a Git repository, so commit steps are intentionally omitted.

---

## File Structure

- Create `backend/src/main/java/com/DuoStyle/DuoStyle/config/seed/SeedCatalog.java`: typed manifest root and nested category/product/image/variant records.
- Create `backend/src/main/java/com/DuoStyle/DuoStyle/config/seed/SeedCatalogLoader.java`: classpath JSON parsing and complete preflight validation.
- Create `backend/src/main/resources/seed/coolmate-products.json`: curated 30-product snapshot with source attribution.
- Modify `backend/src/main/java/com/DuoStyle/DuoStyle/service/CloudinaryService.java`: expose strict deterministic seed upload contract.
- Modify `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/CloudinaryServiceImpl.java`: implement deterministic upload options and propagate failure.
- Modify `backend/src/main/java/com/DuoStyle/DuoStyle/config/DataInitializer.java`: reset gate, validated import, FK-safe cleanup, and catalog creation.
- Modify `backend/src/main/resources/application.yaml`: bind reset flag with a false default.
- Create `backend/src/test/java/com/DuoStyle/DuoStyle/config/seed/SeedCatalogLoaderTest.java`: manifest parsing and validation tests.
- Modify `backend/src/test/java/com/DuoStyle/DuoStyle/common/CloudinaryServiceImplTest.java`: deterministic strict upload tests.
- Create `backend/src/test/java/com/DuoStyle/DuoStyle/config/DataInitializerTest.java`: reset gating and preflight-order tests.

### Task 1: Typed manifest and validation

**Files:**
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/config/seed/SeedCatalog.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/config/seed/SeedCatalogLoader.java`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/config/seed/SeedCatalogLoaderTest.java`

**Interfaces:**
- Produces: `SeedCatalogLoader.loadAndValidate(String resourcePath): SeedCatalog`
- Produces records: `SeedCatalog`, `SeedCategory`, `SeedProduct`, `SeedVariant`

- [ ] **Step 1: Write failing happy-path and validation tests**

  Test that a valid resource is parsed; then test wrong product count, duplicate slug/SKU, missing category, non-HTTPS or duplicate image URLs, image count outside 2–4, non-positive price, invalid enum size, and negative stock. Assert the thrown `IllegalStateException` identifies the invalid field/product.

- [ ] **Step 2: Run the focused test and confirm failure**

  Run: `mvn.cmd -Dmaven.repo.local=C:\Users\CodexSandboxOffline\.m2\repository -Dtest=SeedCatalogLoaderTest test`

- [ ] **Step 3: Implement records, parsing, and complete validation**

  Inject Jackson `ObjectMapper`, load with `ClassPathResource`, normalize no values silently, validate all global uniqueness and referential rules, and return only after the entire document is valid.

- [ ] **Step 4: Run the focused test and confirm pass**

  Run the command from Step 2; expected result is all `SeedCatalogLoaderTest` cases passing.

### Task 2: Strict deterministic Cloudinary seed upload

**Files:**
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/CloudinaryService.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/CloudinaryServiceImpl.java`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/common/CloudinaryServiceImplTest.java`

**Interfaces:**
- Consumes: HTTPS source URL and deterministic public ID from the importer.
- Produces: `String uploadSeedImageFromUrl(String sourceUrl, String publicId)` returning a secure Cloudinary URL or throwing on failure.

- [ ] **Step 1: Add failing tests for upload options and failures**

  Capture Cloudinary upload options and assert `folder=duostyle_products/coolmate_seed`, exact `public_id`, `overwrite=true`, and `resource_type=image`; assert missing `secure_url` and SDK exceptions throw instead of returning the source URL.

- [ ] **Step 2: Run the focused test and confirm failure**

  Run: `mvn.cmd -Dmaven.repo.local=C:\Users\CodexSandboxOffline\.m2\repository -Dtest=CloudinaryServiceImplTest test`

- [ ] **Step 3: Implement the strict method without changing regular uploads**

  Keep `uploadImageFromUrl` behavior for existing admin flows, add the strict seed-specific method, validate both inputs, send deterministic options, require an HTTPS `secure_url`, and wrap errors with source/public-ID context.

- [ ] **Step 4: Run the focused test and confirm pass**

  Run the command from Step 2; expected result is all Cloudinary tests passing.

### Task 3: Curate and validate the 30-product snapshot

**Files:**
- Create: `backend/src/main/resources/seed/coolmate-products.json`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/config/seed/SeedCatalogLoaderTest.java`

**Interfaces:**
- Consumes: current official Coolmate product/category pages and official Coolmate CDN image URLs.
- Produces: a static manifest accepted by `SeedCatalogLoader`.

- [ ] **Step 1: Collect exact source data from official pages**

  Record 30 unique product URLs, current display names and prices, relevant Nam/Nữ/Thể thao/Phụ kiện category hierarchy, factual descriptions, and 2–4 distinct product-gallery HTTPS URLs for each product.

- [ ] **Step 2: Write the manifest with stable local identifiers**

  Use lowercase ASCII kebab-case slugs; assign color/size/stock variants with globally unique SKUs such as `CM-<PRODUCT>-<COLOR>-<SIZE>`; preserve source URLs for attribution but never use them at runtime after seeding.

- [ ] **Step 3: Add a real-manifest contract test**

  Load `seed/coolmate-products.json` and assert exactly 30 products, every product has 2–4 images and at least one variant, and all rules from Task 1 pass.

- [ ] **Step 4: Run the manifest test**

  Run: `mvn.cmd -Dmaven.repo.local=C:\Users\CodexSandboxOffline\.m2\repository -Dtest=SeedCatalogLoaderTest test`

### Task 4: Reset-gated database importer

**Files:**
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/config/DataInitializer.java`
- Modify: `backend/src/main/resources/application.yaml`
- Create: `backend/src/test/java/com/DuoStyle/DuoStyle/config/DataInitializerTest.java`

**Interfaces:**
- Consumes: `SeedCatalogLoader.loadAndValidate("seed/coolmate-products.json")` and `CloudinaryService.uploadSeedImageFromUrl(sourceUrl, publicId)`.
- Produces: reset-only catalog recreation with persisted Cloudinary URLs and existing demo roles/users/vouchers/history.

- [ ] **Step 1: Write failing reset-gate tests**

  Assert `APP_SEED_RESET=false` performs no repository deletes, saves, manifest load, or Cloudinary calls. Assert `true` validates the manifest before the first delete and uploads each image using `<slug>-<1-based-index>`.

- [ ] **Step 2: Run the focused test and confirm failure**

  Run: `mvn.cmd -Dmaven.repo.local=C:\Users\CodexSandboxOffline\.m2\repository -Dtest=DataInitializerTest test`

- [ ] **Step 3: Refactor initializer around the approved lifecycle**

  Bind `app.seed.reset: ${APP_SEED_RESET:false}`. Return immediately when false. When true, load/validate first, delete dependent tables in the existing FK-safe order, recreate base roles/users/vouchers, recursively create parent/child categories, create products/variants, upload all images strictly, then recreate sample order history. Log completion and instruct restarting with `APP_SEED_RESET=false`.

- [ ] **Step 4: Improve failure context and transaction behavior**

  Wrap upload/import failures with product slug and image index. Keep database mutations transactional so DB rows roll back on failure; document that already-uploaded deterministic Cloudinary assets may remain and will be safely overwritten on retry.

- [ ] **Step 5: Run focused initializer tests**

  Run the command from Step 2; expected result is all `DataInitializerTest` cases passing.

### Task 5: Verification against local services

**Files:**
- Verify only; do not add credentials or generated secrets to the repository.

**Interfaces:**
- Consumes: local MySQL, configured Cloudinary environment, and the completed application.
- Produces: evidence that the catalog is usable and normal startup is safe.

- [ ] **Step 1: Run the full backend suite**

  Run: `mvn.cmd -Dmaven.repo.local=C:\Users\CodexSandboxOffline\.m2\repository test`
  Expected: build success with all existing and new tests passing.

- [ ] **Step 2: Start once with reset enabled**

  Start backend with `APP_SEED_RESET=true`. Expected: validation succeeds, 30 products are imported, every image URL points to HTTPS Cloudinary, and the completion warning instructs disabling reset.

- [ ] **Step 3: Verify database invariants**

  Query counts and relationships: exactly 30 products; 60–120 product images; every product has 2–4 images and at least one variant; no duplicate product slug/SKU; no orphan categories/images/variants; all stored product image URLs use Cloudinary HTTPS.

- [ ] **Step 4: Restart with reset disabled**

  Start backend with `APP_SEED_RESET=false` or unset. Verify counts and IDs remain unchanged and no Cloudinary upload occurs.

- [ ] **Step 5: Smoke-test public APIs**

  Call the home/product list, category list, and one product-detail endpoint. Confirm seeded categories, prices, variants, and multiple images serialize correctly for the current frontend.

## Self-Review Result

- Spec coverage: all approved requirements map to Tasks 1–5, including preflight-before-delete, exact product/image counts, deterministic uploads, FK-safe reset, rollback semantics, and disabled-startup safety.
- Placeholder scan: no deferred implementation placeholders remain.
- Type consistency: the loader and strict upload signatures are identical wherever consumed; the manifest resource path and deterministic ID format are fixed throughout.
