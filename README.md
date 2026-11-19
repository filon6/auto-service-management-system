<div align="center">

# AutoService

**Веб-приложение для управления автосервисом**  
Учёт автомобилей, мастеров, услуг и выполненных работ с аналитикой и отчётами.

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-CC0200?logo=flyway&logoColor=white)
![React](https://img.shields.io/badge/React-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

</div>

## Возможности

- **Справочники:** автомобили, мастера и услуги — поиск и CRUD.
- **Журнал работ:** история обслуживания с привязкой к мастеру, автомобилю и услуге.
- **Панель управления:** сводная статистика и последние работы.
- **Отчёты:** выручка, средняя стоимость обслуживания, загрузка мастеров и экспорт в CSV.
- **Авторизация:** Spring Security, сессии и роли `ADMIN` / `USER`.

## Интерфейс

### Авторизация

Вход в систему по логину и паролю. Доступ к данным и операциям зависит от роли пользователя: `ADMIN` или `USER`.

<p align="center">
  <img src="docs/screenshots/login.png" alt="Страница авторизации AutoService" width="900">
</p>

### Панель управления

Главная страница показывает количество автомобилей, мастеров, услуг и выполненных работ, а также список последних обслуживаний.

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Главная панель AutoService" width="900">
</p>

### Автомобили

Справочник хранит **государственный номер, марку, цвет и происхождение** автомобиля (отечественный или иностранный). Можно искать автомобили по номеру, марке и цвету; администратор может добавлять, редактировать и удалять записи.

<p align="center">
  <img src="docs/screenshots/cars.png" alt="Справочник автомобилей" width="900">
</p>

### Мастера

Справочник сотрудников с поиском по имени. Администратор управляет записями мастеров; на уровне базы данных действует ограничение **не более 10 мастеров**.

<p align="center">
  <img src="docs/screenshots/masters.png" alt="Управление мастерами" width="900">
</p>

### Услуги

Каталог видов обслуживания с **отдельными ценами для отечественных и иностранных автомобилей**. Доступны поиск по названию и, для администратора, создание, изменение и удаление услуг.

<p align="center">
  <img src="docs/screenshots/service.png" alt="Каталог услуг автосервиса" width="900">
</p>

### Выполненные работы

Журнал связывает **дату выполнения, автомобиль, мастера и услугу**. Можно искать записи и просматривать историю обслуживания; администратор назначает новые работы, редактирует и удаляет существующие. Ограничения на выполнение работ проверяет PostgreSQL.

<p align="center">
  <img src="docs/screenshots/works.png" alt="Журнал выполненных работ" width="900">
</p>

### Отчёты и аналитика

Раздел содержит расчёты **выручки по услугам, дохода мастеров, средней стоимости обслуживания**, сравнение услуг двух мастеров, сведения об отдельном мастере, выручку по типам автомобилей и рейтинг мастеров за месяц. Для доступных сводок предусмотрен **экспорт в CSV**.

<p align="center">
  <img src="docs/screenshots/report_1.png" alt="Отчёты AutoService — таблицы и сводные показатели" width="900">
</p>

<p align="center">
  <img src="docs/screenshots/report_2.png" alt="Отчёты AutoService — расчёты и фильтры" width="900">
</p>

## Архитектура

```text
React + TypeScript (frontend/)
            │ HTTP /api
            ▼
Spring Boot + Spring Security + JDBC (backend/)
            │ SQL / PL/pgSQL
            ▼
        PostgreSQL
```

Миграции схемы, представления, функции, процедуры и триггеры находятся в [`backend/src/main/resources/db/migration/`](backend/src/main/resources/db/migration/). Управление версиями БД выполняет **Flyway**.

## Локальный запуск

Нужны **JDK 21**, **PostgreSQL**, **Node.js** и **npm**. Для локального профиля настрой подключение к БД `autoservice_dev` (в проекте использовался порт `5433`) и секреты backend — не добавляй их в Git.

```powershell
# Клонирование
git clone https://github.com/filon6/auto-service-management-system.git
cd auto-service-management-system
```

**Терминал 1 — backend:**

```powershell
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

**Терминал 2 — frontend (из корня репозитория):**

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Приложение: **http://localhost:5173** · API: **http://localhost:8081**. В режиме разработки Vite проксирует `/api` на backend.

## REST API

| Раздел | Маршруты |
| --- | --- |
| Авторизация | `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/csrf` |
| Справочники | `/api/cars`, `/api/masters`, `/api/services` |
| Выполненные работы | `/api/works` |
| Отчёты | `/api/reports/*` |

Для справочников и работ предусмотрены `GET`, `POST`, `PUT`, `DELETE`. Изменение данных доступно роли `ADMIN`; `USER` имеет доступ к просмотру. Подробные операции и аналитические запросы реализованы в backend.