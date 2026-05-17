## Project Structure

```
src/
│
├── app/
│   │
│   ├── core/
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── models/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   │
│   ├── features/
│   │   │
│   │   ├── home/
│   │   │
│   │   ├── auth/
│   │   │
│   │   ├── passport/
│   │   │   ├── pages/
│   │   │   │   ├── apply/
│   │   │   │   ├── tracking/
│   │   │   │   └── appointments/
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── passport-form/
│   │   │   │   ├── status-card/
│   │   │   │   └── appointment-card/
│   │   │   │
│   │   │   ├── passport.service.ts
│   │   │   ├── passport.model.ts
│   │   │   └── passport.routes.ts
│   │   │
│   │   ├── profile/
│   │   └── admin/
│   │
│   ├── layout/
│   │   ├── navbar/
│   │   ├── sidebar/
│   │   └── footer/
│   │
│   ├── app.routes.ts
│   └── app.config.ts
│
├── assets/
├── styles.scss
├── main.ts
├── main.server.ts
└── server.ts


```
