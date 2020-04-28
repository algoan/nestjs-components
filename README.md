<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>


[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Algoan NestJS components

A collection of [NestJS](https://docs.nestjs.com) components.

## NestJS Pagination

A simple interceptor formatting a HTTP response with a `Link` header and a `Content-Range`.

See [the documentation here](./packages/pagination/).

## NestJS Logging interceptor

A simple NestJS interceptor catching request details and logging it using the built-in [Logger](https://docs.nestjs.com/techniques/logger#logger) class. It will use the default Logger implementation unless you pass your own to your Nest application.

See [the documentation here](./packages/logging-interceptor/).

## NestJS Http Exception Filter

A simple NestJS Http Exception Filter.

See [the documentation here](./packages/http-exception-filter/).

## NestJS Google Cloud PubSub MicroService

A Google Cloud PubSub transport strategy for NestJS.

See [the documentation here](./packages/google-pubsub-microservice/).

## NestJS Google Cloud PubSub Client Proxy

An extended [Client Proxy](https://docs.nestjs.com/microservices/basics#client) for Google Cloud PubSub.

See [the documentation here](./packages/google-pubsub-client/).
