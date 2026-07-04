# Saweria Webhook Test

Method: POST

### Headers

```js
{
  host: "skylark-destined-internally.ngrok-free.app",
  "user-agent": "Saweria/1.0 (Webhook; +https://saweria.co/docs/webhook)",
  "content-length": "349",
  accept: "*/*",
  "accept-encoding": "gzip, deflate",
  "content-type": "application/json",
  baggage: "sentry-trace_id=d6d4ea6f4861433ea9133cf75cdd421a,sentry-environment=production,sentry-release=0f65e4b7,sentry-public_key=0e9518fa7293175b666b301ef04517d0,sentry-transaction=callbacks.do_fake_callback,sentry-sample_rate=0.001618",
  "saweria-callback-signature": "92d8c7be6d19a48bbd10346b777618bf55e9bb3e8a1f1197c3ff16427dd88aeb",
  "sentry-trace": "d6d4ea6f4861433ea9133cf75cdd421a-b2e6fea73ef88f78-0",
  "x-forwarded-for": "157.230.37.7",
  "x-forwarded-host": "skylark-destined-internally.ngrok-free.app",
  "x-forwarded-proto": "https",
}
```

### Body

```js
{
  version: "2022.01",
  created_at: "2021-01-01T12:00:00+00:00",
  id: "00000000-0000-0000-0000-000000000000",
  type: "donation",
  amount_raw: 69420,
  cut: 3471,
  donator_name: "Someguy",
  donator_email: "someguy@example.com",
  donator_is_user: false,
  message: "THIS IS A FAKE MESSAGE! HAVE A GOOD ONE",
  etc: {
    amount_to_display: 69420,
  },
}
```
