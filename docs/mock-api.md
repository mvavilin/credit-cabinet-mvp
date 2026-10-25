# Контракт будущего API (в MVP операции выполняются локально)

Предлагаемые маршруты для последующего выделения backend:

- `GET /api/products` — список кредитных продуктов.
- `POST /api/applications` — создать заявку из профиля и выбранного продукта.
- `GET /api/applications/{id}` — получить заявку и текущий статус.
- `POST /api/applications/{id}/process` — запустить синтетические проверки.
- `PATCH /api/applications/{id}` — добавить недостающие сведения до принятия решения.

Пример тела создания заявки:

```json
{
  "company": "ООО Дом и уют",
  "inn": "7701234567",
  "purpose": "Закупка товара",
  "amount": 2000000,
  "term": 12,
  "revenue": 1500000,
  "expenses": 1100000,
  "existingPayments": 50000,
  "docsReady": true,
  "overdue": false,
  "productId": "working-capital"
}
```

Пример результата мок-проверки:

```json
{
  "applicationId": "MVP-123456",
  "status": "Одобрено (демо)",
  "outcome": "approved",
  "message": "Заявка прошла демонстрационные правила. Это симуляция, а не реальное решение банка."
}
```

Это документация целевого контракта, а не работающий HTTP API в текущем frontend-only прототипе.
