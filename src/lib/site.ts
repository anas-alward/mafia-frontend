/**
 * Canonical public origin and default share metadata.
 *
 * Scrapers (LinkedIn, Facebook, WhatsApp, X) need absolute URLs for
 * og:image — a relative path renders no preview — so the origin lives
 * here as a single source of truth.
 */
export const SITE_URL = 'https://mafia.alward.dev'
export const SITE_TITLE = 'Mafia — Social Deduction Online'
export const SITE_DESCRIPTION =
  'Mafia is a multiplayer social deduction game. Deceive, deduce, and survive — play online with friends.'
/** 1200×630 — the aspect ratio LinkedIn/Facebook/X preview cards expect. */
export const SHARE_IMAGE = `${SITE_URL}/preview.png`
export const SHARE_IMAGE_WIDTH = 1200
export const SHARE_IMAGE_HEIGHT = 630
