# Kahoot — Authentication & Authorization (Intern)

12 câu, mức easy → medium, bám theo `presentation/auth-outline.md` (section 0–5). Không có câu nào hỏi về các chủ đề đã cắt (OAuth 1.0, PKCE chi tiết, refresh token rotation, JWKS, mTLS, ABAC, SAML…).

## Cách đưa vào Kahoot

**Cách 1: nhập tay.** kahoot.com → **Create** → **Kahoot** → với mỗi câu bên dưới: **Add question → Quiz**, dán câu hỏi, điền 4 đáp án theo đúng thứ tự A–D, tick đáp án ✅, chọn time limit.

**Cách 2: import spreadsheet.** Trong trình soạn kahoot → **Add question → Import spreadsheet** → tải template `.xlsx` của Kahoot. Template có các cột: `Question` · `Answer 1` · `Answer 2` · `Answer 3` · `Answer 4` · `Time limit (sec)` · `Correct answer(s)` (số 1–4). Dán khối CSV ở cuối file vào template (Excel/Google Sheets: Data → Split text to columns, dấu phẩy), lưu lại `.xlsx` rồi upload.

Giới hạn Kahoot đã kiểm: câu hỏi ≤ 120 ký tự, mỗi đáp án ≤ 75 ký tự, 4 đáp án, 20 s (30 s cho câu có đoạn code). Vị trí đáp án đúng được trộn, không dồn vào một ô.

---

## 0. Giới thiệu

### Q1 · 20 s

**Hotel: the front desk checks your ID card. Your key card opens only room 702. The key card is…**

- A. Authentication: proving who you are
- B. Authorization: what you are allowed to do ✅
- C. Both at the same time
- D. Neither, it's just a door lock

> **Giải thích:** Lễ tân kiểm CCCD là AuthN (bạn là ai); thẻ phòng chỉ mở phòng 702 là AuthZ (bạn được làm gì). AuthN luôn chạy trước.

### Q2 · 20 s

**You're logged in as a viewer and call DELETE /users/42. Viewers can't delete users. Right status code?**

- A. 401 Unauthorized
- B. 400 Bad Request
- C. 403 Forbidden ✅
- D. 200 OK

> **Giải thích:** Server đã biết bạn là ai nhưng không cho phép → 403. 401 là khi chưa biết bạn là ai; login lại cũng không đổi được 403.

## 1. Mật khẩu

### Q3 · 20 s

**Your users table has a column password = 'hunter2'. How should passwords be stored instead?**

- A. Encrypted with AES, key kept on the same server
- B. Hashed with bcrypt or Argon2 ✅
- C. Hashed with SHA-256, it's one-way
- D. Base64-encoded

> **Giải thích:** Password phải hash bằng hàm chậm có chủ đích như bcrypt/Argon2. AES giải được nếu có key; SHA-256 quá nhanh, GPU thử hàng tỷ lần/giây; Base64 ai cũng decode được.

### Q4 · 20 s

**Two users both pick the password 123456. With bcrypt, their stored hashes are…**

- A. Identical, same password gives same hash
- B. Different, each user gets a random salt ✅
- C. Identical, unless the cost factor differs
- D. Empty, bcrypt doesn't store anything

> **Giải thích:** bcrypt tự sinh salt ngẫu nhiên cho từng user (nằm sẵn trong chuỗi $2b$12$…), nên cùng password vẫn ra hash khác → rainbow table vô dụng.

## 2. Session & JWT

### Q5 · 20 s

**You paste an eyJ… JWT into jwt.io without knowing the secret. What can you see?**

- A. Nothing, the token is encrypted
- B. Only the signature
- C. The payload: sub, role, exp ✅
- D. Only the header, the payload needs the secret

> **Giải thích:** JWT chỉ là base64url, không phải mã hoá: ai cũng đọc được payload. Vì vậy không bao giờ để password hay dữ liệu nhạy cảm trong JWT.

### Q6 · 20 s

**Set-Cookie: sid=abc; ___ ; Secure; SameSite=Lax. Which flag stops JavaScript from reading the cookie?**

- A. HttpOnly ✅
- B. Path=/
- C. Max-Age=3600
- D. Domain=example.com

> **Giải thích:** HttpOnly làm cho JavaScript (kể cả script XSS) không đọc được cookie. Đây là lý do mặc định lưu token trong cookie HttpOnly thay vì localStorage.

## 3. Login with Google

### Q7 · 20 s

**A calendar app wants to read your Google Calendar. What's the right way to give it access?**

- A. Type your Google password into the calendar app
- B. Email the app an export of your calendar
- C. Share your Google session cookie with the app
- D. Get redirected to Google, log in there, click Allow ✅

> **Giải thích:** Đó là OAuth 2.0: password chỉ đi tới Google, app chỉ nhận quyền một phần (scope=calendar.readonly) và bạn thu hồi riêng được, như chìa khoá valet.

### Q8 · 20 s

**In "Login with Google" (OIDC), which token tells your app WHO the user is?**

- A. access_token
- B. id_token ✅
- C. client_secret
- D. The authorization code

> **Giải thích:** OAuth là authorization: access_token chỉ nói "app được đọc lịch". OIDC thêm id_token, một JWT có sub, email, name → đó mới là login.

## 4. Phân quyền & lỗi

### Q9 · 20 s

**GET /orders/1024 shows your order. Changing it to /orders/1025 shows a stranger's order. What's the fix?**

- A. Hide the order ID in the frontend
- B. Check that the user is logged in
- C. Query WHERE id = ? AND user_id = ? ✅
- D. Return 500 when the ID is wrong

> **Giải thích:** Đây là Broken Access Control (IDOR), OWASP #1. Đã login chưa đủ: phải kiểm quyền sở hữu ngay trong query, ở backend.

### Q10 · 30 s

**Login query: "...WHERE email = '" + email + "'". Input ' OR '1'='1 gets in with no password. Best fix?**

- A. Block the ' character in the frontend form
- B. Use a parameterized query or an ORM ✅
- C. Wrap the query in try/catch
- D. Return 403 instead of 401 on failure

> **Giải thích:** SQL Injection xảy ra vì nối chuỗi. Parameterized query/ORM tách dữ liệu khỏi câu SQL. Chặn ở frontend vô ích vì attacker gọi thẳng API bằng curl/Postman.

### Q11 · 30 s

**You render a user's comment in React. Which line is the safe default against XSS?**

- A. `<p dangerouslySetInnerHTML={{ __html: comment }} />`
- B. `el.innerHTML = comment`
- C. `<p>{comment}</p>` ✅
- D. `document.write(comment)`

> **Giải thích:** React {} tự escape nên <script> trong comment chỉ hiện ra dạng chữ. dangerouslySetInnerHTML / innerHTML chạy luôn script → đánh cắp token trong localStorage.

## 2b. JWT — sửa payload

### Q12 · 30 s

**You edit the JWT payload "role":"viewer" to "admin" and keep the old signature. Server replies?**

- A. 200 OK, you're admin now
- B. 401, the signature no longer matches ✅
- C. 403, viewers can't edit tokens
- D. 500, the token can't be parsed

> **Giải thích:** Server tính lại HMAC từ header + payload mới bằng secret → khác chữ ký cũ → 401. Muốn giả được phải có secret, nên secret lộ = mọi thứ lộ.

---

## CSV cho template import của Kahoot

```csv
Question,Answer 1,Answer 2,Answer 3,Answer 4,Time limit (sec),Correct answer(s)
Hotel: the front desk checks your ID card. Your key card opens only room 702. The key card is…,Authentication: proving who you are,Authorization: what you are allowed to do,Both at the same time,"Neither, it's just a door lock",20,2
You're logged in as a viewer and call DELETE /users/42. Viewers can't delete users. Right status code?,401 Unauthorized,400 Bad Request,403 Forbidden,200 OK,20,3
Your users table has a column password = 'hunter2'. How should passwords be stored instead?,"Encrypted with AES, key kept on the same server",Hashed with bcrypt or Argon2,"Hashed with SHA-256, it's one-way",Base64-encoded,20,2
"Two users both pick the password 123456. With bcrypt, their stored hashes are…","Identical, same password gives same hash","Different, each user gets a random salt","Identical, unless the cost factor differs","Empty, bcrypt doesn't store anything",20,2
You paste an eyJ… JWT into jwt.io without knowing the secret. What can you see?,"Nothing, the token is encrypted",Only the signature,"The payload: sub, role, exp","Only the header, the payload needs the secret",20,3
Set-Cookie: sid=abc; ___ ; Secure; SameSite=Lax. Which flag stops JavaScript from reading the cookie?,HttpOnly,Path=/,Max-Age=3600,Domain=example.com,20,1
A calendar app wants to read your Google Calendar. What's the right way to give it access?,Type your Google password into the calendar app,Email the app an export of your calendar,Share your Google session cookie with the app,"Get redirected to Google, log in there, click Allow",20,4
"In ""Login with Google"" (OIDC), which token tells your app WHO the user is?",access_token,id_token,client_secret,The authorization code,20,2
GET /orders/1024 shows your order. Changing it to /orders/1025 shows a stranger's order. What's the fix?,Hide the order ID in the frontend,Check that the user is logged in,Query WHERE id = ? AND user_id = ?,Return 500 when the ID is wrong,20,3
"Login query: ""...WHERE email = '"" + email + ""'"". Input ' OR '1'='1 gets in with no password. Best fix?",Block the ' character in the frontend form,Use a parameterized query or an ORM,Wrap the query in try/catch,Return 403 instead of 401 on failure,30,2
You render a user's comment in React. Which line is the safe default against XSS?,<p dangerouslySetInnerHTML={{ __html: comment }} />,el.innerHTML = comment,<p>{comment}</p>,document.write(comment),30,3
"You edit the JWT payload ""role"":""viewer"" to ""admin"" and keep the old signature. Server replies?","200 OK, you're admin now","401, the signature no longer matches","403, viewers can't edit tokens","500, the token can't be parsed",30,2
```
