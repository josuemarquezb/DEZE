// middleware/validation.js — request validation middleware (structure only).
// Pick a schema library (zod, joi, express-validator, etc.) and wire it into
// `validate()` below once request shapes are finalized. Every route keeps the
// same call signature, so adopting a library later doesn't touch route files.

/**
 * validate(schema) — returns middleware that checks req.body (or req.query /
 * req.params, depending on the route) against `schema` before the request
 * reaches the controller. Responds 400 with details on failure.
 *
 * Currently a pass-through placeholder — no validation is performed yet.
 *
 * @param {object} schema - validation schema (shape depends on chosen library)
 */
export const validate = (schema) => (req, res, next) => {
  // TODO: run req.body / req.query / req.params through `schema` and
  // respond res.status(400).json({ errors: [...] }) on failure.
  next();
};
