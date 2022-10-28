# Changelog

## [1.1.1](https://github.com/oae/kaizoku/compare/kaizoku-v1.1.0...kaizoku-v1.1.1) (2022-10-28)


### Bug Fixes

* prevent incorrect image generation ([31075fd](https://github.com/oae/kaizoku/commit/31075fd7aceb3d9dfe603541a52dd165d30e82c7))

## [1.1.0](https://github.com/oae/kaizoku/compare/kaizoku-v1.0.0...kaizoku-v1.1.0) (2022-10-27)


### Features

* add ability to bind manga metadata to another anilist id ([a3a9252](https://github.com/oae/kaizoku/commit/a3a9252bc8a613e570ea3df312b49a7e923cb9df))
* add support for custom interval. closes [#12](https://github.com/oae/kaizoku/issues/12) ([a7323d8](https://github.com/oae/kaizoku/commit/a7323d8c4c45312a551c8e82472e4bcd982bca08))
* implement update popup for metadata and interval ([e82d934](https://github.com/oae/kaizoku/commit/e82d93452a7745603d5d9cdb2a93fc949d3ab79f))
* reschedule checkChapter jobs on startup. closes [#14](https://github.com/oae/kaizoku/issues/14) ([ab14475](https://github.com/oae/kaizoku/commit/ab1447533bb888189778d47033323c3c1da1df73))


### Bug Fixes

* check for out-of-sync chapters ([caf6720](https://github.com/oae/kaizoku/commit/caf6720dacda4de28d8da2a5bf61442f55384245))
* don't store completed notification jobs ([373fc3b](https://github.com/oae/kaizoku/commit/373fc3b8bd46b86fbc8f21cf362772b9d629b9b9))
* filter out empty lines when getting the sources ([b150575](https://github.com/oae/kaizoku/commit/b150575b7f1d869bd214ee4be707b1dec892c046))

## 1.0.0 (2022-10-22)


### Features

* add cascade on delete ([e09b656](https://github.com/oae/kaizoku/commit/e09b656917a59e8a47cf67b077d1311be83ca9e4))
* add interval option to manga selection ([fb9dc13](https://github.com/oae/kaizoku/commit/fb9dc133cf9071b04f6f3f7c434991e5f28be620))
* add manga detail page ([707560e](https://github.com/oae/kaizoku/commit/707560ef2fe3ce02c5031ad2cb336a21f1dd8344))
* add manga route ([0bfc47d](https://github.com/oae/kaizoku/commit/0bfc47d8a5979b5af952c850e6504c49c8f1961d))
* add mangal to docker image ([95bb65a](https://github.com/oae/kaizoku/commit/95bb65a2b65ede4af15338b1b0f28cf74f7ac806))
* add metadata ([a2c3d60](https://github.com/oae/kaizoku/commit/a2c3d605d4534c9ba704122367cd85356b77e2f3))
* add new manga card ([127382d](https://github.com/oae/kaizoku/commit/127382d220368b8bc7247db80c536d36ab8ecc41))
* add new manga to spotlight actions ([ae65666](https://github.com/oae/kaizoku/commit/ae65666aafb2cad523c1e16b0dc256997e9326d6))
* add scheduling ([bce4832](https://github.com/oae/kaizoku/commit/bce483282bc90ba7770a2d070affe59ab6842617))
* add search to header ([87f23cc](https://github.com/oae/kaizoku/commit/87f23cc8858415585cea16509af48612b45f5db7))
* add skeleton to main page ([787bbba](https://github.com/oae/kaizoku/commit/787bbbacfab6295332824cf6429a1385e501ec60))
* cancel job if exists ([130c339](https://github.com/oae/kaizoku/commit/130c3393734bdf850297808009cd0ccbffc08286))
* dockerize application ([5743227](https://github.com/oae/kaizoku/commit/57432270a5ce39ddbcdbb852fb1ef3fc09cbcfca))
* implement add manga ([8c45e0c](https://github.com/oae/kaizoku/commit/8c45e0cb1aa543bfa2938fe2a7713f4ca0baf35f))
* implement nav bar ([6e9a6a4](https://github.com/oae/kaizoku/commit/6e9a6a4e018bea1c22386aa4987c55788d6fb956))
* implement remove files option to modal ([355c1ae](https://github.com/oae/kaizoku/commit/355c1aebde3d7283fbc548b990c656ca61f1cba1))
* initial commit ([7ed5e4f](https://github.com/oae/kaizoku/commit/7ed5e4f2e10125737a061c66a1fd343fa641c6e7))
* polish main page ([bdefdfc](https://github.com/oae/kaizoku/commit/bdefdfc3fc22fbcd4884408cf5f63e9e9173b45e))
* restrict height of the manga metadata in details page ([7aac2ef](https://github.com/oae/kaizoku/commit/7aac2ef54931bcad6c22c93b81165057678ea073))
* show source and interval in details ([155a367](https://github.com/oae/kaizoku/commit/155a367f1e47c4a3dc3542c5fa32e78c49b68236))
* sync db with files ([e6b6f64](https://github.com/oae/kaizoku/commit/e6b6f64513708b602af1a64f65647885dea6f611))
* use custom server for downloader ([077a7ba](https://github.com/oae/kaizoku/commit/077a7ba2f4adcf8d34a4a7ca62ac76f9cafb2d79))
* use mantine ([2ba146b](https://github.com/oae/kaizoku/commit/2ba146b330a088f04715bedde1fa7bdb82a7d9db))


### Bug Fixes

* add alt to header image ([0152736](https://github.com/oae/kaizoku/commit/015273613c65bfc2deb8a826a465aa1338437acb))
* create single instance for prisma client ([879250c](https://github.com/oae/kaizoku/commit/879250c0238c8f2c1f9b4139518b3bd4c0a556d4))
* dont create multiple prisma clients ([cea8da2](https://github.com/oae/kaizoku/commit/cea8da23abd990b40196661cb7843475590483c3))
* filter empty result ([977b3d8](https://github.com/oae/kaizoku/commit/977b3d8c321cfe6a37b74b3880adce46cfa7643d))
* hide navbar if window is too narrow ([1abe552](https://github.com/oae/kaizoku/commit/1abe552f23781763282bca2f498e36d6f3cb5bb3))
* rate limit notifications ([20ada9b](https://github.com/oae/kaizoku/commit/20ada9ba1abb69594e1998cda347b9faaec2d037))
* remove metadata when manga is removed ([76b688f](https://github.com/oae/kaizoku/commit/76b688f889d6d87d8951626013c7d0c901d388df))
* remove minutely from intervals ([bc5b14c](https://github.com/oae/kaizoku/commit/bc5b14c1c071e3b6ef09f2d40bd5515fb4ca941b))
* search selection ([216b926](https://github.com/oae/kaizoku/commit/216b9261e04e91a78c7e6729cc4b86c24be520b9))
* show error if user tries to add same manga ([cc2d6dd](https://github.com/oae/kaizoku/commit/cc2d6dda60a2854951c50d7e148dc0409f400276))
