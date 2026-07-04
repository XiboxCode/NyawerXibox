# Trakteer Integration

## Public API

### Headers Settings

| Headers | Parameter/Value | Description |
| - | - | - |
| key | String | API Key Trakteer |
| Accept | application/json |  |
| X-Requested-With | XMLHttpRequest |  |

### Quantity Given

POST `https://api.trakteer.id/v1/public/quantity-given`

API ini digunakan untuk melihat jumlah unit trakteer-an yang telah diberikan oleh supporter (berdasarkan email) selama 30 hari terakhir.

| Parameter | Type  | Description     |
| --------- | ----- | --------------- |
| email     | Email | Supporter Email |

#### Response

```json
{
  "status": "success",
  "status_code": 200,
  "result": 10,
  "message": "OK"
}
```

| Field       | Type   | Description                                                           |
| ----------- | ------ | --------------------------------------------------------------------- |
| status      | string | The status of the response (success or error).                        |
| status_code | int    | The HTTP status code.                                                 |
| result      | int    | The number of Trakteer units given by supporters in the last 30 days. |
| message     | string | A short message describing the response.                              |

### Support History

GET `https://api.trakteer.id/v1/public/supports`

API ini digunakan untuk mendapatkan riwayat trakteer-an yang kamu terima dari supporter.

| Parameter | Type | Description |
| --------- | - | - |
| limit     | Number | Number of records |
| page      | Number | Current page in paginated records |
| include   | String (separated by comma) | Additional column to show more details. Available includes: is_guest, reply_message, net_amount, payment_method, order_id, supporter_email, updated_at_diff_label |

#### Response

```json
{
  "status": "success",
  "status_code": 200,
  "result": {
    "data": [
      {
        "creator_name": "Janessa West",
        "support_message": "Selalu berkarya bang!",
        "quantity": 2,
        "amount": 30000,
        "unit_name": "Kopi",
        "status": "success",
        "updated_at": "2025-03-11 13:44:07",
        "payment_method": "OVO",
        "order_id": "j1ee3b42-35f8-5cb1-a316-a405bee9d3a1"
      },
      {
        "creator_name": "Sidney Torp",
        "support_message": "Karena bilang makasih aja gacukup 😁😁",
        "quantity": 1,
        "amount": 15000,
        "unit_name": "Kopi",
        "status": "success",
        "updated_at": "2025-02-11 00:21:37",
        "payment_method": "QRIS",
        "order_id": "46ef4334-3e57-53f1-9423-7222d2b1ff55"
      }
    ]
  },
  "message": "OK"
}
```

| Field | Type | Description |
| - | - | - |
| status | string | The status of the response (success or error). |
| status_code | int | The HTTP status code. |
| result | object | Contains the support history data. |
| result.data | array | List of support transactions. |
| result.data[].creator_name | string | The name of the creator receiving the support. |
| result.data[].support_message | string | The message left by the supporter. |
| result.data[].quantity | int | Number of units supported. |
| result.data[].amount | int | Total amount of support in rupiah . |
| result.data[].unit_name | string | The unit of support (unit trakteeran) (e.g., "Mie Ayam", "Kopi"). |
| result.data[].status | string | Status of the transaction (success, pending, failed, refund). |
| result.data[].updated_at | string (datetime) | Last update timestamp of the transaction. |
| result.data[].is_guest | boolean | Is support using guest email / not login (Only available with ?include=is_guest) |
| result.data[].reply_message | string | Creator's reply to the support message, null if none (Only available with ?include=reply_message) |
| result.data[].net_amount | int | Final amount going to trakteer balance, after deducted by platfrom fee and payment gateway fee (Only available with ?include=net_amount) |
| result.data[].payment_method | string | Payment method used. e.g., "OVO", "QRIS". (Only available with ?include=payment_method) |
| result.data[].order_id | string | Unique identifier for the transaction order (Only available with ?include=order_id) |
| result.data[].supporter_email | string | Email used by supporter if they checked the "Tampilkan email saya pada kreator" option, null if not available. (Only available with ?include=supporter_email) |
| result.data[].updated_at_diff_label | string | Last update timestamp of the transaction in short version of human readable format. (Only available with ?include=updated_at_diff_label) |
| message | string | A short message describing the response. |

### Current Balance

GET `https://api.trakteer.id/v1/public/current-balance`

API ini digunakan untuk melihat jumlah saldo yang dimiliki.

#### Response

```json
{
  "status": "success",
  "status_code": 200,
  "result": "6483.00",
  "message": "OK"
}
```

| Field | Type | Description |
| - | - | - |
| status | string | The status of the response (success or error). |
| status_code | int | The HTTP status code. |
| result | string | Current balance amount, formatted to two decimal places. |
| message | string | A short message describing the response. |

### Transaction History

GET `https://api.trakteer.id/v1/public/transactions`

API ini digunakan untuk mendapatkan riwayat trakteer-an yang telah kamu berikan kepada kreator.

| Parameter | Type | Description |
| - | - | - |
| limit | Number | Number of records |
| page | Number | Current page in paginated records |
| include | String (separated by comma) | Additional column to show more details. Available includes: is_guest, reply_message, net_amount, updated_at_diff_label |

#### Response

```json
{
    "status": "success",
    "status_code": 200,
    "result": {
      "data": [
        {
          "supporter_name": "Seseorang",
          "support_message": "Sekali lagi",
          "quantity": 1,
          "amount": 15000,
          "unit_name": "Kopi",
          "updated_at": "2024-12-16 13:41:48"
        },
        {
          "supporter_name": "Janessa West",
          "support_message": "Yang semagat dong streamingnya",
          "quantity": 1,
          "amount": 15000,
          "unit_name": "Kopi",
          "updated_at": "2024-10-01 21:33:50"
        }
      ]
    },
    "message": "OK"
}
```

| Field | Type | Description |
| - | - | - |
| status | string | The status of the response (success or error). |
| status_code | int | The HTTP status code. |
| result | object | Contains the support history data. |
| result.data | array | List of support transactions. |
| result.data[].supporter_name | string | The name of the supporter. |
| result.data[].support_message | string | The message left by the supporter. |
| result.data[].quantity | int | Number of units supported. |
| result.data[].amount | int | Total amount of support in rupiah. |
| result.data[].unit_name | string | The unit of support (unit trakteeran) (e.g., "Mie Ayam", "Kopi"). |
| result.data[].updated_at | string (datetime) | Last update timestamp of the transaction. |
| result.data[].is_guest | boolean | Is support using guest email / not login (Only available with ?include=is_guest) |
| result.data[].reply_message | string | Creator's reply to the support message, null if none (Only available with ?include=reply_message) |
| result.data[].net_amount | int | Final amount going to trakteer balance, after deducted by platfrom fee and payment gateway fee (Only available with ?include=net_amount) |
| result.data[].updated_at_diff_label | string | Last update timestamp of the transaction in short version of human readable format. (Only available with ?include=updated_at_diff_label) |
| message | string | A short message describing the response. |


## Webhook

### List of Events

#### Tip Event: 

Tip event akan dikirimkan ketika ada trakteeran / tip yang ditujukan ke kreator. Event berisi data detail transaksi dan informasi supporter.

Event Payload

```json
{
   "created_at": "2023-07-14T14:50:10+07:00",
   "transaction_id": "test-xxxxxxxx-xxxx-xxxxxxx-xxxxxxxxx",
   "type": "tip",
   "supporter_name": "Egis",
   "supporter_avatar": "https://trakteer.id/images/v2/stats-1.png",
   "supporter_message": "Selalu Berkarya",
   "media": {
      "gif": "3oEduQAsYcJKQH2XsI", // ID gif selection from Giphy
      "video": {
         "type": "tiktok", // Empty if youtube
         "id": "z3U0udLH974", // Youtube or Tiktok video ID,
         "start": 0 // Start youtube video duration
      },
      "voice": "https://edge-cdn.trakteer.id/audio/vn-sample-cat-voice.mp3" // Voice note
   },
   "unit": "Kopi",
   "unit_icon": "http://trakteer.lab/storage/images/units/uic-YnhIryi1ZgDGv1QFJw91VLTA3ROawV1m1658122113.png",
   "quantity": 1,
   "price": 5000,
   "net_amount": 4750
}
```

Event Object Structure

- `created_at` (string): The timestamp when the event occurred. It follows the ISO 8601 format: YYYY-MM-DDTHH:MM:SS±HH:MM.
- `transaction_id` (string): The unique identifier for the transaction.
- `type` (string): The type of event that occurred. In this case, it is a "tip" event.
- `supporter_name` (string): The name of the supporter who send the tip.
- `supporter_avatar` (string): The URL of the supporter's avatar image.
- `supporter_message` (string): A message left by the supporter (optional).
- `media` (object): A media object containing additional details about the media (Media Share feature).
- `unit` (string): The unit of creator.
- `unit_icon` (string): The URL of the icon image representing the unit.
- `quantity` (number): The quantity of the unit associated with the tip.
- `price` (float): The total price of the unit in the tip.
- `net_amount` (float): The net amount received after deductions, such as payment fee and service fee.

### Setting Up Webhooks

Untuk mengatur webhook di Trakteer, ikuti langkah-langkah berikut:

- Buat Endpoint Webhook: kamu perlu memiliki server atau aplikasi yang mampu menerima dan memproses permintaan HTTP. Siapkan URL endpoint di mana Trakteer akan mengirimkan notifikasi webhook.
- Daftarkan Webhook: Di pengaturan akun Trakteer kamu, cari menu Integrasi -> Webhook dan masukkan URL endpoint webhook kamu, lalu simpan.
- Verifikasi Webhook: Untuk menguji webhook kamu, gunakan tombol "Send Webhook Test" yang disediakan oleh Trakteer. Trakteer akan mengirimkan test payload ke URL webhook yang ditentukan. Pastikan bahwa endpoint kamu dikonfigurasi dengan benar dengan response sukses untuk menangani dan memproses notifikasi webhook.
- Aktifkan Webhook: Setelah berhasil diverifikasi, jangan lupa untuk mengaktifkannya.

### Security Considerations

Ketika mengimplementasikan integrasi webhook, sangat penting untuk memastikan keamanan endpoint kamu. Trakteer mendukung pengiriman webhook yang aman menggunakan HTTPS dan menyertakan token dalam header payload webhook X-Webhook-Token. Token dapat ditemukan dihalaman pengaturan webhook kamu. kamu dapat menggunakan token ini untuk memverifikasi keaslian permintaan webhook.

### Notes
- Delivery attempts and retries: Event webhook akan gagal apabila HTTP response status code dari server/aplikasi kamu mengirimkan kode >=300. Terdapat upaya pengiriman dan percobaan ulang sebanyak tiga kali, jika terjadi kesalahan.
- Automate shutdown: Jika dalam 3 kali event yang dikirim gagal, maka webhook akan dimatikan secara otomatis. Trakteer akan memberi notifikasi ke kreator untuk dilakukan konfigurasi ulang.
- Event History: Trakteer menyediakan history event yang dikirimkan melalui webhook. Maksimal history yang disimpan adalah 10 event terakhir.