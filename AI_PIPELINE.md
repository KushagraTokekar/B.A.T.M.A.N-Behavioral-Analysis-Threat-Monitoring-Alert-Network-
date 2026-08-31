# Intelligence pipeline

## Current production-safe baseline
On submission, `reportIntelligence` evaluates severity, meaningful detail, high-risk terms, nearby 24-hour activity, duplicate proximity/type/time, and submission frequency. It returns bounded threat and authenticity scores with a human-review flag. This is deterministic triage—not a trained predictive model—and is presented as such.

The hotspot endpoint groups historical non-rejected reports spatially and scores cluster severity/density. It is useful for situational awareness, not a certainty or forecast.

## Planned trained model
A future Python service should ingest de-identified, verified historical reports; derive spatial cells, hour/day/month, category, severity, density, and temporal features; train and calibrate a time-split model; publish confidence/uncertainty, data freshness, and validation metrics; and retain model/version audit metadata. It must reject insufficient/out-of-range input and never automatically reject reports or direct emergency response.

## Provider boundary
External intelligence must use authorized provider APIs through: provider → collection → text/location/classification → confidence → admin verification. No scraping is part of BATMAN.
