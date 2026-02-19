# NZXT BTC/RUB — форк brunoandradebr/nzxt

Форк проекта [brunoandradebr/nzxt](https://github.com/brunoandradebr/nzxt).
Оригинальный дизайн сохранён **полностью**: тёмный фон, цветные кольца прогресса CPU/GPU, все темы и настройки.

**Добавлено:**
- Цена BTC/USD (обновление каждые 30 сек)
- Мини-спарклайн BTC за последние 24 часа (обновление каждые 5 мин)
- Курс USD/RUB (обновление каждые 5 мин)
- Кэш в localStorage — данные остаются при потере сети, стале-точка сигнализирует об устаревших данных

```
┌──────────────────────────────┐
│  [ring]  CPU 42° 3%          │  ← кольца CPU/GPU как у Bruno
│          GPU 45° 12%         │
│  ──────── (разделитель) ─────│
│  ₿ $96,250  ↑ +1.24%        │  ← BTC/USD + изменение
│  [──────── sparkline ──── •] │  ← 24h история, цвет = тема кольца GPU
│  ₽ 89.42                     │  ← USD/RUB
└──────────────────────────────┘
```

---

## Технологии (те же что у Bruno)

- **Vite** + **React 18** + **TypeScript**
- **Styled-components** v5
- **Zustand** (persist)
- **vite-plugin-singlefile** → собирает всё в один HTML-файл
- **react-icons**, **immer**
- GIF picker через Giphy / Tenor (опционально, требует API ключи)

---

## Установка и запуск

### 1. Клонировать и установить зависимости

```bash
git clone https://github.com/YOUR_USERNAME/nzxt-btc-rub.git
cd nzxt-btc-rub
npm install
# или: yarn
```

### 2. (Опционально) Настроить API ключи для GIF-пикера

```bash
cp .env.example .env
# открыть .env и вставить ключи Giphy и Tenor
```

Без ключей GIF-пикер не заработает, но **все остальные функции** (BTC, RUB, CPU/GPU мониторинг) работают без ключей.

### 3. Запустить локально

```bash
npm run dev
```

Откроется `http://localhost:5173`

- **Без параметров** → страница настроек (Preferences UI)
- **`?kraken=1`** → виджет для LCD (то, что видит NZXT CAM)

Для предпросмотра виджета: `http://localhost:5173/?kraken=1`

---

## Сборка и деплой на GitHub Pages

### 1. Собрать

```bash
npm run build
```

Vite с `vite-plugin-singlefile` создаёт `dist/index.html` — **один самодостаточный HTML-файл** со всем JS/CSS внутри.

### 2. Создать репозиторий на GitHub

```bash
git init
git add .
git commit -m "initial: nzxt btc/rub fork"
git remote add origin https://github.com/YOUR_USERNAME/nzxt-btc-rub.git
git push -u origin main
```

### 3. Настроить GitHub Pages

1. Репозиторий → **Settings → Pages**
2. Source: **GitHub Actions** или **Deploy from branch → main → /dist**
3. Либо использовать `deploy.sh` (отредактировать имя репозитория в файле):

```bash
chmod +x deploy.sh
./deploy.sh
```

Сайт появится по адресу:
```
https://YOUR_USERNAME.github.io/nzxt-btc-rub/
```

---

## Добавить в NZXT CAM

1. Открыть **NZXT CAM**
2. Ваш Kraken → **LCD Settings**
3. Выбрать **Web Integration**
4. Вставить URL:
   ```
   https://YOUR_USERNAME.github.io/nzxt-btc-rub/?kraken=1
   ```
5. **Apply / Save**

> Важно: параметр `?kraken=1` обязателен — именно он переключает приложение в режим LCD-виджета.

---

## Источники данных (все бесплатно, без API-ключей, CORS-safe)

| Данные | Провайдер 1 | Провайдер 2 | Провайдер 3 |
|--------|------------|------------|------------|
| BTC/USD цена | CoinGecko | CoinCap | Blockchain.info |
| BTC 24h история | CoinGecko | CoinCap | — |
| USD/RUB | jsDelivr CDN (fawazahmed0) | open.er-api.com | exchangerate-api.com |

При сбое одного провайдера автоматически используется следующий. При сбое всех — показываются данные из кэша с жёлтой точкой (стале-индикатор).

---

## Что изменено относительно оригинала Bruno

| Файл | Изменение |
|------|-----------|
| `src/hooks/useCrypto/` | **НОВЫЙ** — хук для BTC + USD/RUB |
| `src/hooks/index.ts` | добавлен экспорт `useCrypto` |
| `src/components/Sparkline/` | **НОВЫЙ** — SVG спарклайн |
| `src/components/DualMonitor/index.tsx` | добавлена секция Crypto |
| `src/components/DualMonitor/styles.ts` | добавлены стили `.crypto-*` |
| `src/components/Progress/index.tsx` | мелкое: fallback `width=320` вместо 0 |
| Всё остальное | идентично оригиналу |

---

## Настройка цвета спарклайна

Спарклайн наследует цвет из **правого кольца** (GPU arc). Чтобы изменить:
Preferences → Circles → **Right circle (start)** → выбрать цвет.

---

## Интервалы обновления

| Данные | Интервал |
|--------|----------|
| BTC цена | 30 сек |
| BTC спарклайн | 5 мин |
| USD/RUB | 5 мин |

Изменить в `src/hooks/useCrypto/index.tsx`:
```ts
const t1 = setInterval(refreshPrice,   30_000)   // цена
const t2 = setInterval(refreshHistory, 300_000)  // история
const t3 = setInterval(refreshFx,      300_000)  // fx
```
