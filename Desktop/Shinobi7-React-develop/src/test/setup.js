// src/test/setup.js
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpia el DOM después de cada test
afterEach(() => {
    cleanup();
});

// Limpia el almacenamiento antes de cada test (aislamiento)
beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    // Suprime los alert() nativos en los tests
    vi.spyOn(window, 'alert').mockImplementation(() => { });
});