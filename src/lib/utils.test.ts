import { describe, it, expect, vi } from "vitest";
import { newId } from "./utils";

describe("backend-compatible IDs", () => {
  it("creates UUID v4 IDs in HTTP preview contexts without randomUUID", () => {
    const original = globalThis.crypto;
    vi.stubGlobal("crypto", {
      getRandomValues: original.getRandomValues.bind(original),
    });
    try {
      const id = newId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(newId()).not.toBe(id);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
