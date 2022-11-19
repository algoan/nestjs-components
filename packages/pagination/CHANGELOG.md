# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 5.0.8 (2022-11-19)

**Note:** Version bump only for package @algoan/nestjs-pagination





## 5.0.7 (2022-11-19)

**Note:** Version bump only for package @algoan/nestjs-pagination





## 5.0.6 (2022-07-26)

**Note:** Version bump only for package @algoan/nestjs-pagination





## 5.0.5 (2022-05-19)

**Note:** Version bump only for package @algoan/nestjs-pagination





## 5.0.4 (2022-01-07)

**Note:** Version bump only for package @algoan/nestjs-pagination





## [5.0.3](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@5.0.2...@algoan/nestjs-pagination@5.0.3) (2021-10-24)

**Note:** Version bump only for package @algoan/nestjs-pagination





## [5.0.2](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@5.0.1...@algoan/nestjs-pagination@5.0.2) (2021-08-06)

**Note:** Version bump only for package @algoan/nestjs-pagination





## [5.0.1](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@5.0.0...@algoan/nestjs-pagination@5.0.1) (2021-06-01)


### Bug Fixes

* **pagination:** change the default limit for pagination results to 200 ([49fd48d](https://github.com/algoan/nestjs-components/commit/49fd48db170832e7de1015029a6b6a6c4f0aba0d))
* **pagination:** change the default limit for the paginations results to 200 and test corrections ([5d2b6d4](https://github.com/algoan/nestjs-components/commit/5d2b6d4cd6f10fc074a78fa1ea0195c119c94282))





# [5.0.0](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@4.1.1...@algoan/nestjs-pagination@5.0.0) (2021-05-31)


### Bug Fixes

* **pagination:** adding options to the body pagination ([daadfae](https://github.com/algoan/nestjs-components/commit/daadfaedc2e84cf14ae0e40ed70642110afbccba))
* **pagination:** adding the new pagination to the already existing pagination folder ([404b372](https://github.com/algoan/nestjs-components/commit/404b37268cc89dca5b646f56935c5230ee7be4d3))
* **pagination:** creating const variables for the page name and page limit ([f9fd196](https://github.com/algoan/nestjs-components/commit/f9fd19616ee0c4828d3af778a571929c77331694))
* **pagination:** fixing the body interceptor default values ([cc58537](https://github.com/algoan/nestjs-components/commit/cc585377240c3c2132c7d5975a5712de3344a085))
* **pagination:** readme file and packages lock file modifications ([fc40998](https://github.com/algoan/nestjs-components/commit/fc409982bafd88334cb40dcaf5c277d2593cdc7d))
* **pagination:** readme file corrections ([b588e59](https://github.com/algoan/nestjs-components/commit/b588e5968b081fd34aee7c1ddccb1093b8647a15))
* **pagination:** upgrade dev dependencies to their lts version ([0b6f708](https://github.com/algoan/nestjs-components/commit/0b6f7084feb1721cd261a0991ad0d3e9fb072b2d))


### BREAKING CHANGES

* **pagination:** the controller must return "totalResources" and "resources"





## [4.1.2](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@4.1.1...@algoan/nestjs-pagination@4.1.2) (2021-05-27)


### Bug Fixes

* **pagination:** adding options to the body pagination ([daadfae](https://github.com/algoan/nestjs-components/commit/daadfaedc2e84cf14ae0e40ed70642110afbccba))
* **pagination:** adding the new pagination to the already existing pagination folder ([404b372](https://github.com/algoan/nestjs-components/commit/404b37268cc89dca5b646f56935c5230ee7be4d3))
* **pagination:** creating const variables for the page name and page limit ([f9fd196](https://github.com/algoan/nestjs-components/commit/f9fd19616ee0c4828d3af778a571929c77331694))
* **pagination:** fixing the body interceptor default values ([cc58537](https://github.com/algoan/nestjs-components/commit/cc585377240c3c2132c7d5975a5712de3344a085))
* **pagination:** readme file and packages lock file modifications ([fc40998](https://github.com/algoan/nestjs-components/commit/fc409982bafd88334cb40dcaf5c277d2593cdc7d))
* **pagination:** readme file corrections ([b588e59](https://github.com/algoan/nestjs-components/commit/b588e5968b081fd34aee7c1ddccb1093b8647a15))





## [4.1.1](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@4.1.0...@algoan/nestjs-pagination@4.1.1) (2021-04-07)

**Note:** Version bump only for package @algoan/nestjs-pagination





# [4.1.0](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@4.0.0...@algoan/nestjs-pagination@4.1.0) (2020-12-21)


### Features

* **mongo-pagination-param:** filter the keys in the query based on a list provided in the options ([c9a8cda](https://github.com/algoan/nestjs-components/commit/c9a8cda6533ffcf551388c41e4d95a7df4357d94))
* **mongo-pagination-param.decorator:** change option param name and set its default value ([cd1785c](https://github.com/algoan/nestjs-components/commit/cd1785c5cd2654394f8cddd880da2b80a2828f9d))





# [4.0.0](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.4.2...@algoan/nestjs-pagination@4.0.0) (2020-12-14)


### Bug Fixes

* **mongo-pagination-param.decorator:** change default value of "sort" and "project" from [] to {} ([f182562](https://github.com/algoan/nestjs-components/commit/f182562504ea4e0821bf5056169979cb975ee60a)), closes [#112](https://github.com/algoan/nestjs-components/issues/112)
* **mongo-pagination-param.decorator:** specify the value range for sort and project fields ([34c0a5d](https://github.com/algoan/nestjs-components/commit/34c0a5d1ee69ea3ebe36f0061ddc8969918afb3c))


### BREAKING CHANGES

* **mongo-pagination-param.decorator:** Modify the default value of "sort" and "project" fields in MongoPagination from []
to {} to conform with the Mongoose documentation.





## [3.4.2](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.4.1...@algoan/nestjs-pagination@3.4.2) (2020-11-09)

**Note:** Version bump only for package @algoan/nestjs-pagination





## [3.4.1](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.4.0...@algoan/nestjs-pagination@3.4.1) (2020-10-30)


### Bug Fixes

* add test ([a79a205](https://github.com/algoan/nestjs-components/commit/a79a205414a611a5ad7449961210d5f90b76ff03))
* no result + 1 result ([a01c8ad](https://github.com/algoan/nestjs-components/commit/a01c8ad00b7311875519f9ca283908578bbdeeef))





# [3.4.0](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.3.0...@algoan/nestjs-pagination@3.4.0) (2020-10-22)


### Features

* set default limit ([85f7c32](https://github.com/algoan/nestjs-components/commit/85f7c3298b8244b8dd1442f42debc4998f2f9aa4))





# [3.3.0](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.2.4...@algoan/nestjs-pagination@3.3.0) (2020-10-21)


### Features

* improved content range calculation ([5bcf028](https://github.com/algoan/nestjs-components/commit/5bcf0286697d60e802ef651a20e23cd176953f37))





## [3.2.4](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.2.3...@algoan/nestjs-pagination@3.2.4) (2020-10-20)


### Bug Fixes

* fixed update last rel calculation ([8b27442](https://github.com/algoan/nestjs-components/commit/8b274421496096e4b558c2cc7a855f618fac66fd))





## [3.2.3](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.2.2...@algoan/nestjs-pagination@3.2.3) (2020-10-19)

**Note:** Version bump only for package @algoan/nestjs-pagination





## [3.2.2](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.2.1...@algoan/nestjs-pagination@3.2.2) (2020-09-21)

**Note:** Version bump only for package @algoan/nestjs-pagination





## [3.2.1](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.2.0...@algoan/nestjs-pagination@3.2.1) (2020-08-27)

**Note:** Version bump only for package @algoan/nestjs-pagination





# [3.2.0](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.0.4...@algoan/nestjs-pagination@3.2.0) (2020-08-05)


### Features

* **nestjs-pagination:** allow projection ([c216100](https://github.com/algoan/nestjs-components/commit/c216100f8a445fb902b6b780e52f23c4ea11adab))





## [3.0.4](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.0.3...@algoan/nestjs-pagination@3.0.4) (2020-07-27)


### Bug Fixes

* **deps:** upgrade dependencies ([c62a9b6](https://github.com/algoan/nestjs-components/commit/c62a9b6f9cf84ffe1794c3f9cd60cd98cb68e044))





## [3.0.3](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.0.2...@algoan/nestjs-pagination@3.0.3) (2020-05-27)


### Bug Fixes

* **pagination:** return a 0 content range header ([c282f52](https://github.com/algoan/nestjs-components/commit/c282f52d8ff9a2613a289cf411dab9cbaf1c793f))





## [3.0.2](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.0.1...@algoan/nestjs-pagination@3.0.2) (2020-05-26)


### Bug Fixes

* **mongo-pagination:** update the filter type to be more generic ([538b626](https://github.com/algoan/nestjs-components/commit/538b626ea4330da28d9d0fcea924a8cf0d70286b))





## [3.0.1](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@3.0.0...@algoan/nestjs-pagination@3.0.1) (2020-04-28)

**Note:** Version bump only for package @algoan/nestjs-pagination





# [3.0.0](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@2.2.3...@algoan/nestjs-pagination@3.0.0) (2020-04-22)


### Features

* **nestjs-pagination:** migrate the custom decorator to nest 7 ([963d304](https://github.com/algoan/nestjs-components/commit/963d304d347ea50718efd28f328b617df4532a56))


### BREAKING CHANGES

* **nestjs-pagination:** The new decorator works with nest7. This do not work with nest 6





## [2.2.3](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@2.2.2...@algoan/nestjs-pagination@2.2.3) (2020-04-21)

**Note:** Version bump only for package @algoan/nestjs-pagination





## [2.2.2](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@2.2.1...@algoan/nestjs-pagination@2.2.2) (2020-04-16)


### Bug Fixes

* **deps:** bump dependencies to upgrade minimist ([3ce7045](https://github.com/algoan/nestjs-components/commit/3ce7045aae674558a74484f9b5f376455e912749))





## [2.2.1](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@2.2.0...@algoan/nestjs-pagination@2.2.1) (2020-04-16)

**Note:** Version bump only for package @algoan/nestjs-pagination





# [2.2.0](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@2.1.3...@algoan/nestjs-pagination@2.2.0) (2020-04-15)


### Features

* **http-exception-filter:** init package ([e474567](https://github.com/algoan/nestjs-components/commit/e4745671c3450134ae83f2b9412551e1dc1a30d8))





## [2.1.3](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@2.1.2...@algoan/nestjs-pagination@2.1.3) (2020-04-14)


### Bug Fixes

* **nestjs-pagination:** fetch correctly the limit and the page ([85bbee8](https://github.com/algoan/nestjs-components/commit/85bbee8e214518778ef4d9f19de4ddbc0baad8cf))





## [2.1.2](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@2.1.1...@algoan/nestjs-pagination@2.1.2) (2020-04-03)


### Bug Fixes

* **dependencies:** move packages from dependencies to devDependencies ([488b886](https://github.com/algoan/nestjs-components/commit/488b8869570bb0b2ccf3dbebff50e5d9bab8c2d6))





## [2.1.1](https://github.com/algoan/nestjs-components/compare/@algoan/nestjs-pagination@2.1.0...@algoan/nestjs-pagination@2.1.1) (2020-04-03)

**Note:** Version bump only for package @algoan/nestjs-pagination





# 2.1.0 (2020-04-01)


### Bug Fixes

* **interceptor:** return the entire resource array ([6ab5d17](https://github.com/algoan/nestjs-pagination/commit/6ab5d171466086ac0682011264311fd1d071f0e4))


### Features

* **interceptor:** add the content-range header to the response ([12357f9](https://github.com/algoan/nestjs-pagination/commit/12357f912784bc7d5c3c4c60dd9c4e21f94d13c7))
* **interceptor:** create a add link-header-interceptor ([0c1c8d0](https://github.com/algoan/nestjs-pagination/commit/0c1c8d01eed2301daa01117cd41f4cffea19c656))





# 1.1.0 (2020-03-31)


### Bug Fixes

* **interceptor:** return the entire resource array ([1a1e5b2](https://github.com/algoan/nestjs-pagination/commit/1a1e5b20704960f6388db7d920030af6c60e13e6))


### Features

* **interceptor:** add the content-range header to the response ([0c41f77](https://github.com/algoan/nestjs-pagination/commit/0c41f7778e111090a204fb32902389f789016a9c))
* **interceptor:** create a add link-header-interceptor ([2dc39be](https://github.com/algoan/nestjs-pagination/commit/2dc39bea20cc6179d59647a21066d1f1c8a3ea4a))
