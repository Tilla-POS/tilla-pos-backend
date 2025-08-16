import { DataResponseInterceptor } from './data-response.interceptor';

describe('DataResponseInterceptor', () => {
  it('should be defined', () => {
    // Provide a mock Reflector as required by the constructor
    const mockReflector = { get: jest.fn() } as any;
    expect(new DataResponseInterceptor(mockReflector)).toBeDefined();
  });
});
