#!/bin/bash

# Скрипт для запуска тестов с генерацией отчета о покрытии

echo "🚀 Запуск тестов с генерацией отчета о покрытии..."

# Создаем директорию для отчетов, если её нет
mkdir -p coverage

# Запускаем тесты с покрытием
npm test -- --coverage --watchAll=false

echo "✅ Тесты завершены!"
echo "📊 Отчет о покрытии доступен в директории coverage/"
echo "📄 HTML отчет: coverage/lcov-report/index.html"