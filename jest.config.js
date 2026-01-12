module.exports = {
  // Путь к setup файлу
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Коллекция расширений файлов, которые Jest будет искать
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  
  // Пути к файлам тестов
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
  ],
  
  // Мокаем файлы стилей и других ресурсов
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Настройки для покрытия кода
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js',
    '!src/**/index.js',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}'
  ],
  
  // Директория для вывода отчета о покрытии
  coverageDirectory: 'coverage',
  
  // Порог покрытия кода (опционально)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Трансформеры
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Файлы, которые игнорируются при трансформации
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)'
  ]
};