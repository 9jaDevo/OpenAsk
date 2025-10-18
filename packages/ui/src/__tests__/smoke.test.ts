import { describe, it, expect } from 'vitest';

describe('ui smoke', () => {
    it('runs a trivial assertion', () => {
        expect(2 * 3).toBe(6);
    });
});
