// Setup simplificado sin MongoDB Memory Server
// Importar jest explícitamente para ES Modules
import { jest } from '@jest/globals';

beforeEach(() => {
  // Limpiar todos los mocks antes de cada test
  jest.clearAllMocks();
});

afterEach(() => {
  // Restaurar todos los mocks después de cada test
  jest.restoreAllMocks();
});