// utils/password.js — password hashing/verification via bcryptjs.
// Never store or compare plaintext passwords directly — always go through
// these two functions.

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/** Hashes a plaintext password for storage. */
export const hashPassword = (plaintext) => bcrypt.hash(plaintext, SALT_ROUNDS);

/** Compares a plaintext password against a stored hash. Returns true/false. */
export const verifyPassword = (plaintext, hash) => bcrypt.compare(plaintext, hash);
