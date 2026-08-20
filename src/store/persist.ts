/** Accept persisted state from older storage versions when the shape is unchanged. */
export function identityMigrate<T>(state: unknown): T {
  return state as T
}
