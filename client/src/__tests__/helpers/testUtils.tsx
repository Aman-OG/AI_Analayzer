// src/__tests__/helpers/testUtils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that includes common providers
 */
export function renderWithRouter(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, {
        wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
        ...options,
    });
}

/**
 * Wait for a specific amount of time
 */
export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock file for testing
 */
export function createMockFile(
    name: string,
    size: number,
    type: string,
    content: string = 'test content'
): File {
    const file = new File([content], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
}

/**
 * Create a mock PDF file
 */
export function createMockPDF(name: string = 'test.pdf', size: number = 1024 * 1024): File {
    const pdfContent = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // %PDF-1.4
    const file = new File([pdfContent], name, { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: size });
    return file;
}

/**
 * Create a mock DOC file
 */
export function createMockDOC(name: string = 'test.doc', size: number = 1024 * 1024): File {
    const docContent = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    const file = new File([docContent], name, { type: 'application/msword' });
    Object.defineProperty(file, 'size', { value: size });
    return file;
}

/**
 * Create a mock DOCX file
 */
export function createMockDOCX(name: string = 'test.docx', size: number = 1024 * 1024): File {
    const docxContent = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
    const file = new File([docxContent], name, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    Object.defineProperty(file, 'size', { value: size });
    return file;
}

/**
 * Mock localStorage
 */
export const mockLocalStorage = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

/**
 * Mock sessionStorage
 */
export const mockSessionStorage = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();
