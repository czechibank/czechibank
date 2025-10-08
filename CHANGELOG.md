# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.5](https://github.com/czechibank/czechibank/compare/v0.1.3...v0.1.5) (2025-10-08)

### Features

- [CZBANK-23] Features ([#17](https://github.com/czechibank/czechibank/issues/17)) ([4899e11](https://github.com/czechibank/czechibank/commit/4899e116f245135e1c140e91a884e6e3fd8d5df6))
- add API documentation and implement Playwright tests ([c8fcddc](https://github.com/czechibank/czechibank/commit/c8fcddc6f97766988cabbad8ab3ec3f493cbac28))
- add Swagger documentation for API key retrieval endpoint and update Swagger schema ([#29](https://github.com/czechibank/czechibank/issues/29)) ([4f87e35](https://github.com/czechibank/czechibank/commit/4f87e35a05bfb2cc6da7d0d57355dda3650d67b0))
- add transaction limit parameter to getAllTransactionsByUserAndBankAccountId and update TransactionTable to reflect changes ([56aa2e1](https://github.com/czechibank/czechibank/commit/56aa2e1a4236b1c4eff0bcf2305248d672eb155f))
- enhance API documentation styling and dark mode support ([50bb9dd](https://github.com/czechibank/czechibank/commit/50bb9dd9879bff4dd43baa0d157c1e274e0f2dd5))
- enhance database preparation script and transaction generation ([a0b9b64](https://github.com/czechibank/czechibank/commit/a0b9b64921e630839c0b63a4c4f3d2176d0cb44a))
- enhance testing framework and add health check endpoint ([655c90d](https://github.com/czechibank/czechibank/commit/655c90dc0cd188f1f79aed31499493c021e90829))
- implement HTTP method handlers for unsupported methods ([7408a2c](https://github.com/czechibank/czechibank/commit/7408a2cf39cbacf555d59ab7955ea963e20ba2fe))
- integrate Plausible tracking for API calls ([029dd51](https://github.com/czechibank/czechibank/commit/029dd515fedd0115e77036e1a20953ddc3d0dd04))
- integrate Vitest for testing and refactor bank account and transaction services ([ca8e95e](https://github.com/czechibank/czechibank/commit/ca8e95e3b8f452de8df7451a25c93e8292c668c1))
- update API docs URL handling ([5b450e6](https://github.com/czechibank/czechibank/commit/5b450e6e66e5f8ee1c9fb6ec87d73f2c8ff5a97d))

### Bug Fixes

- [CZBANK-2] insufficient balance ([#2](https://github.com/czechibank/czechibank/issues/2)) ([ec08ab8](https://github.com/czechibank/czechibank/commit/ec08ab8288229974c51b4d62ce84d60e80b17141))
- [CZBANK-4] Sent money from a different account via API ([#18](https://github.com/czechibank/czechibank/issues/18)) ([73c5a3f](https://github.com/czechibank/czechibank/commit/73c5a3f2ead4f3627a13fac8b3aa53edc5bf7729))
- [CZBANK-56] FIX Implement better-auth into project to handle auth ([#15](https://github.com/czechibank/czechibank/issues/15)) ([cf1b77b](https://github.com/czechibank/czechibank/commit/cf1b77b880a44fdc5dc13488d376ba111e52d691))
- [CZBANK-69] bug: back-button cache issue ([#20](https://github.com/czechibank/czechibank/issues/20)) ([7c5e6b1](https://github.com/czechibank/czechibank/commit/7c5e6b16667f979fadc7a4ed9a4663d6bef7f8b0))
- 401 correct response ([6e8c23b](https://github.com/czechibank/czechibank/commit/6e8c23b98daa118337a9f27008920118223f38e7))
- About ([cf95ccd](https://github.com/czechibank/czechibank/commit/cf95ccd8ebec52e891a0f2627f036fce1cadc902))
- add CORS middleware for API requests ([1dccf8f](https://github.com/czechibank/czechibank/commit/1dccf8f9c9968bd856a77d523f6d1bbc11764d18))
- add DATABASE_URL environment variable for database operations in API tests workflow ([f98d6d2](https://github.com/czechibank/czechibank/commit/f98d6d207c86e74ff6dbcaf58e2fb3c933e9cd45))
- adding env into test api config ([b1ad3f6](https://github.com/czechibank/czechibank/commit/b1ad3f60cb3c70b74f0fcb270b74b24bd181d43c))
- auth problem ([12564da](https://github.com/czechibank/czechibank/commit/12564dae9702226287427697a2004edcc16df172))
- back ([144433e](https://github.com/czechibank/czechibank/commit/144433edfe2788bf5284374a7574ee2ecc130961))
- bank account grid ([c875469](https://github.com/czechibank/czechibank/commit/c875469c19537164ae5f0b0e704bc3d08ad5e01e))
- bearer token ([54ab110](https://github.com/czechibank/czechibank/commit/54ab110289b056c725a4f7b6afa69df591c1262f))
- cors middleware ([b8e637c](https://github.com/czechibank/czechibank/commit/b8e637c305d4d8b420bfdccecd7b44e4b5f715d1))
- discord for brno + ui fix ([b822f32](https://github.com/czechibank/czechibank/commit/b822f32e11483be834644a1e77319b97c8f8acb5))
- doesn't show password in /user ([5b8b0c8](https://github.com/czechibank/czechibank/commit/5b8b0c8c5335efc1b57fceaaed1c04df4e0d3d4f))
- dynamically import SwaggerUI for improved client-side rendering ([513fb16](https://github.com/czechibank/czechibank/commit/513fb16db7db62b2cfcf016a93e4cf89ffec177b))
- enhance CORS middleware logging and update allowed headers ([d33c043](https://github.com/czechibank/czechibank/commit/d33c04367039d61ddae456d18e768ca23f1f3268))
- enhance CORS middleware to handle preflight requests ([16e777d](https://github.com/czechibank/czechibank/commit/16e777d39e93d7399a82f55ba41eae28f77c02ea))
- enhance error handling in bank account retrieval and update validation messages ([fbcca49](https://github.com/czechibank/czechibank/commit/fbcca49129704b84c3fd4f6652c400d220106354))
- enhance transaction amount validation and update tests ([11fb6da](https://github.com/czechibank/czechibank/commit/11fb6dafc5ac22358edc5d13103b8834ebb743a9))
- exclude Uptime-Kuma from tracking in middleware ([3be9e14](https://github.com/czechibank/czechibank/commit/3be9e146e5360cdc9e639790a39b59e73ebb0aa4))
- filterBy time ([ffe63de](https://github.com/czechibank/czechibank/commit/ffe63de800e32a7f937631205b26d5533457fb7f))
- getAll - add pagination into meta ([3f138a0](https://github.com/czechibank/czechibank/commit/3f138a0ec8ff93aa38714e4802c2c84b39898951))
- health ([6479f55](https://github.com/czechibank/czechibank/commit/6479f557f2c61ebdec2819c4e1d974867a93f445))
- hot-fix wrong property blocking build ([#9](https://github.com/czechibank/czechibank/issues/9)) ([5e9c63e](https://github.com/czechibank/czechibank/commit/5e9c63eb7a132603e7cdbcc49451d20fcfa4383a))
- hotfix of performance problem of FE ([0563f6b](https://github.com/czechibank/czechibank/commit/0563f6bb0aa5e25c5b01c7abe434e6b5b6ca3492))
- pnpm prisma issue ([93564ca](https://github.com/czechibank/czechibank/commit/93564ca1a97a37b389042ad013075e28b869bd47))
- refine CORS middleware to allow specific origins ([0098a2f](https://github.com/czechibank/czechibank/commit/0098a2f5b2442b0424d55b432d793a647760fa86))
- Remove feature from build step ([#24](https://github.com/czechibank/czechibank/issues/24)) ([48aab4e](https://github.com/czechibank/czechibank/commit/48aab4e2862ac1c8c9dc1dd12b846f12d8ac267f))
- remove feature from build step ([#25](https://github.com/czechibank/czechibank/issues/25)) ([f3f90bb](https://github.com/czechibank/czechibank/commit/f3f90bb6f7cf1fa9d1d17deeb82045904441da1f))
- signin invalid login alert ([9cdf903](https://github.com/czechibank/czechibank/commit/9cdf903d4c959128b8f34cc3e9615fc2c8fe723e))
- some styling issues ([beb3a51](https://github.com/czechibank/czechibank/commit/beb3a51f330d62eab836b1ce69b32d1a07c3df1d))
- time ([331398e](https://github.com/czechibank/czechibank/commit/331398ea0b880bc4b6baf63a86f1bd99df20db91))
- transaction last 10 ([498dc88](https://github.com/czechibank/czechibank/commit/498dc88ddf020c836bf4b60ad7c1a6101e0f896f))
- transactions order ([7b480f8](https://github.com/czechibank/czechibank/commit/7b480f80595bc8b0ee717884d212b4a0ae41c83e))
- update API authentication method and enhance error handling ([d98393a](https://github.com/czechibank/czechibank/commit/d98393a137bb9cfaaa55c16fa036049cf25fc35c))
- update build script in package.json to remove database seeding step ([#23](https://github.com/czechibank/czechibank/issues/23)) ([7fb0ea1](https://github.com/czechibank/czechibank/commit/7fb0ea11c7639859572623c1704777ffa454bb52))
- update CORS configuration and logging in middleware ([ea658f1](https://github.com/czechibank/czechibank/commit/ea658f1b1872c6995cf53574c8eb701be696dd71))
- update CORS configuration and OPTIONS response handling ([b03cb18](https://github.com/czechibank/czechibank/commit/b03cb186a4dd2673de9d525bf9755566d66a1c5a))
- update CORS middleware and enhance logging ([addf8a1](https://github.com/czechibank/czechibank/commit/addf8a1828c8b562ce16b71ca1fffaa76a72199a))
- update CORS middleware to allow all origins ([31173f0](https://github.com/czechibank/czechibank/commit/31173f0b90f4362b9f1785a89838cb8923622fe0))
- update CORS middleware to dynamically set allowed origin ([bc4dbb1](https://github.com/czechibank/czechibank/commit/bc4dbb1aa397406489b11e94a06f482d6792e740))
- update error handling and type definitions in API routes and user service ([#22](https://github.com/czechibank/czechibank/issues/22)) ([0aa3814](https://github.com/czechibank/czechibank/commit/0aa381482203b73be547e8fea0ecd5de0bae9fac))
- update error message in Swagger documentation to provide a more generic and creative description ([e96de1b](https://github.com/czechibank/czechibank/commit/e96de1b3df302a5e4d882715c11a18ad0361c014))
- update Swagger documentation with correct repository URL and add additional production server endpoints ([1d41961](https://github.com/czechibank/czechibank/commit/1d41961f99c376062b6b2cabb22c04dbed090062))
- update user creation logic to use default role and simplify validation ([#27](https://github.com/czechibank/czechibank/issues/27)) ([db14853](https://github.com/czechibank/czechibank/commit/db14853789b422977295810b6959e5f9f5a1cfad))

### [0.1.3](https://github.com/vojtech-cerveny/czechibank/compare/v0.1.2...v0.1.3) (2024-04-10)

### Bug Fixes

- nested filter ([5e44fc2](https://github.com/vojtech-cerveny/czechibank/commit/5e44fc22f7408d40171d8705afb462a55e9407df))

### [0.1.2](https://github.com/vojtech-cerveny/czechibank/compare/v0.1.1...v0.1.2) (2024-04-05)

### Features

- /about route ([d59547c](https://github.com/vojtech-cerveny/czechibank/commit/d59547ca9532512c60081b9639975b30d60573c4))
- api create use ([b6dfd09](https://github.com/vojtech-cerveny/czechibank/commit/b6dfd09ad17aafd04423a89b8323fb21b2a6d640))
- k6 script ([ae5afa6](https://github.com/vojtech-cerveny/czechibank/commit/ae5afa6208e3d8ca7ae92b908049385abdeebb56))
- postman collection ([0520ffc](https://github.com/vojtech-cerveny/czechibank/commit/0520ffcf76f9a8ab5833ae6453cd2347d726e5c2))
- postman stuff ([d7247c0](https://github.com/vojtech-cerveny/czechibank/commit/d7247c00c78df72eaff84ab5d882f67d5a0c5b54))
- slackMessages ([bb06066](https://github.com/vojtech-cerveny/czechibank/commit/bb0606609565805c45942e4f2bf761b5fcaf6f3a))
- transaction detail ([a7f97f7](https://github.com/vojtech-cerveny/czechibank/commit/a7f97f793c9cf401742e6a7f5ce5249bf6e0987f))
- tsx and prepare-db script ([86ee369](https://github.com/vojtech-cerveny/czechibank/commit/86ee369684b9ce2c895b2878de34f4f1cf288206))
- ui improvements ([de23216](https://github.com/vojtech-cerveny/czechibank/commit/de23216da25251c2a6aa6b7f2cb012989a87d175))

### Bug Fixes

- add additional information into transaction/create ([8f8b58d](https://github.com/vojtech-cerveny/czechibank/commit/8f8b58d7b214c165e739e09f3737d0a7eaf349c1))
- add correct port ([59ae1ba](https://github.com/vojtech-cerveny/czechibank/commit/59ae1bad126e57a2b6f2f3a89a7e1414aa08e9e6))
- add link to register ([3cec1d6](https://github.com/vojtech-cerveny/czechibank/commit/3cec1d62353a2608235fe97ccb8195360d79c716))
- add zod safeParse ([60814f9](https://github.com/vojtech-cerveny/czechibank/commit/60814f9cf138391e3d1f28c5b10cf7301c49f562))
- build ([430d2a2](https://github.com/vojtech-cerveny/czechibank/commit/430d2a2d232bc77ad87e7f7664587d87fd2b46cf))
- **ci:** postinstall ([b095d27](https://github.com/vojtech-cerveny/czechibank/commit/b095d275b85e81b6fa28d6f120e6ee766fee0bc3))
- cors api ([8401807](https://github.com/vojtech-cerveny/czechibank/commit/8401807c0af0a795ed87b8e0b9bd02048e4ff2cd))
- fix build problems ([87948b6](https://github.com/vojtech-cerveny/czechibank/commit/87948b6a294bafa8948524dcf16279dbf84c5aee))
- register button ([2c11bab](https://github.com/vojtech-cerveny/czechibank/commit/2c11bab1620476f86f5a1c4687a3da465bbeeb5a))
- register form update ([c53d93a](https://github.com/vojtech-cerveny/czechibank/commit/c53d93aea7f2d079e1584bac1c86eac1a31c9b54))
- removing shapr ([759fae6](https://github.com/vojtech-cerveny/czechibank/commit/759fae65fd4dfb11798352140e5eca04c2c68f64))
- routes ([09534bc](https://github.com/vojtech-cerveny/czechibank/commit/09534bcffef648097107310a9661e480fa95bd8f))
- send money to bankAccountNumber ([22f6910](https://github.com/vojtech-cerveny/czechibank/commit/22f6910508667d4e87145a35ce8569b0bae4f794))
- some issues ([a5cb630](https://github.com/vojtech-cerveny/czechibank/commit/a5cb630ff7dbb23aa7fb576abba904d4b2c944e7))
- status codes ([9f8c239](https://github.com/vojtech-cerveny/czechibank/commit/9f8c239178602cff6bba8184ff9b31bdecee9213))
- status codes + handle errors ([0d76fc9](https://github.com/vojtech-cerveny/czechibank/commit/0d76fc907b4ee75cf6d3d5e95eddb99c30605091))
- update routes + some fixes ([a8d1628](https://github.com/vojtech-cerveny/czechibank/commit/a8d1628efa4bb4a4356f459a06a350778c51284c))
- update slack messages ([346b50f](https://github.com/vojtech-cerveny/czechibank/commit/346b50faa0fda85d8c12ccbcbf0b80b78258bccc))
- updates ([5e72f63](https://github.com/vojtech-cerveny/czechibank/commit/5e72f63cfed27c335fa659c6fbb486acc7ff88b1))
- user/create api ([8d188fd](https://github.com/vojtech-cerveny/czechibank/commit/8d188fd763d7798629dfd3fb283d1ce829616655))

### 0.1.1 (2024-02-09)

### Features

- init ([5cc0d72](https://github.com/vojtech-cerveny/nextjs-auth-template/commit/5cc0d72909a25fe3f0bda5d22190684f7a2d53e2))
- ui - shadcn + tailwind + components ([10fa5f5](https://github.com/vojtech-cerveny/nextjs-auth-template/commit/10fa5f5dc8911f764674aab0c1035d37ee97d798))

### Bug Fixes

- doc + env example ([b3241bd](https://github.com/vojtech-cerveny/nextjs-auth-template/commit/b3241bdcb2062a8a151760de4f37859a34b52c3a))
- name in docker-compose ([104df44](https://github.com/vojtech-cerveny/nextjs-auth-template/commit/104df44b587932fc505657dc292f088e7c42bdb2))
