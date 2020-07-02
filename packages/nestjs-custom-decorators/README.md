# Nestjs-custom-decorators

A set of nestjs custom decorators.

## User decorator

A param decorator that fetches the `request.user` (could be added by a middleware or a guard) and add it to the params.

### Usage:

```ts
 @Get('/user')
 public getUser(@User() user: any): void {
   return user;
 }
```

## DecodeJWT

A param decorator that decodes the JSON web token added to the request by a middleware or a guard and add it to the params.

### Usage:

```ts
 @Get('/decode-jwt')
 public getDecodedJWT(@DecodeJWT() decodedJwt: any): void {
   return decodedJwt;
 }

```
