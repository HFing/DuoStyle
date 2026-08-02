# Coolmate-inspired local seed data design

## Goal

Replace the current hard-coded fashion seed catalog with a curated local-demo dataset of 30 products sourced from the current public Coolmate catalog. Each product must have current name, price, category assignment, useful variants, and two to four product images copied to the user's Cloudinary account.

The user is responsible for ensuring they have permission to reuse Coolmate names, descriptions, prices, and images. This dataset is intended only for local demonstration.

## Source manifest

- Store curated source data in `backend/src/main/resources/seed/coolmate-products.json`.
- Include exactly 30 products.
- Each product contains source URL, name, slug, short factual description, price in VND, gender target, category slug, image source URLs, and variants.
- Each product contains two to four distinct image URLs.
- Categories reflect the current Coolmate navigation but remain compatible with DuoStyle's parent/child category model.
- The application never scrapes Coolmate during normal startup.

## Category model

Create parent categories for `Nam`, `Nữ`, `Thể thao`, and `Phụ kiện`. Create only child categories needed by the 30 selected products, including apparel groups such as áo thun, polo, sơ mi, quần shorts, quần dài, chạy bộ, pickleball, and đồ lót.

Category slugs are unique and stable. Gender targets use the existing `MEN`, `WOMEN`, and `UNISEX` enum values.

## Cloudinary import

- Extend URL upload to accept a deterministic public ID derived from the product slug and image position.
- Store assets under a dedicated folder such as `duostyle_products/coolmate_seed`.
- Use overwrite-safe deterministic IDs so rerunning a seed replaces/reuses the same logical assets instead of creating duplicates.
- A successful upload must return a Cloudinary HTTPS URL.
- Do not silently retain a Coolmate source URL when upload fails. Throw an error identifying the product and source image so partial seed data is rolled back.
- The product thumbnail is the first successfully uploaded image; all uploaded images are persisted as `ProductImage` rows.

## Reset and execution safety

- Destructive reset runs only when `APP_SEED_RESET=true`.
- When reset is disabled and products already exist, initialization does not alter catalog data.
- When reset is enabled, delete dependent data in foreign-key-safe order, then recreate roles, demo users, vouchers, categories, products, variants, images, and sample historical orders.
- The database work is transactional. A manifest validation or Cloudinary failure aborts the seed instead of leaving a partially populated catalog.
- After a successful reset, log a clear instruction to restart with `APP_SEED_RESET=false`. The application does not modify the environment file automatically.

## Validation

Before destructive database work or external upload begins, validate the complete manifest:

- Exactly 30 products.
- Unique nonblank product slugs.
- Every referenced category exists in the manifest category definitions.
- Every product has two to four distinct HTTPS image URLs.
- Every product has a positive price and at least one variant.
- Variant SKUs are globally unique, sizes map to `ClothingSize`, prices are positive, and stock is nonnegative.

## Tests and verification

- Unit-test manifest parsing and every validation invariant.
- Unit-test deterministic Cloudinary upload options and failure propagation.
- Integration-test reset gating so catalog deletion cannot occur without `APP_SEED_RESET=true`.
- Verify the real seed against the configured local MySQL and Cloudinary account.
- After seeding, query MySQL to verify 30 products, expected categories, and at least two Cloudinary image rows per product.
- Run the full backend test suite and start the application once with reset disabled to prove normal startup does not reseed.
