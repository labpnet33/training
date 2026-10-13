var e={id:`rest-api-security`,h:{en:`REST API security`,hi:`REST API security`},body:{en:`
<p>A REST API is a service window at the back of the building where programs, not people, hand in requests. It skips the SSH front door, so everything you learned about AAA must be rebuilt for the window: who is knocking (authentication), what may they ask for (authorization), is the conversation private (encryption), and is it logged (accounting). Blueprint item 5.3 asks you to <b>describe</b> REST API security; the <b>YANG, NETCONF and RESTCONF</b> module later uses these ideas hands-on.</p>

<h3>A quick REST refresher</h3>
<p>REST APIs use HTTP verbs on resources identified by a path: <code>GET</code> reads, <code>POST</code> creates, <code>PUT</code> replaces, <code>PATCH</code> modifies, <code>DELETE</code> removes. On IOS XE, RESTCONF exposes the configuration as YANG data, for example <code>GET /restconf/data/Cisco-IOS-XE-native:native/hostname</code>. Controllers such as Catalyst Center and SD-WAN Manager expose their own REST APIs.</p>

<h3>Protect the transport: HTTPS with TLS</h3>
<p>Plain HTTP sends everything, including credentials and tokens, in clear text on TCP 80. Always use <b>HTTPS</b> (HTTP over TLS, TCP 443): TLS encrypts the session, protects integrity, and the server certificate proves the server's identity. On IOS XE, RESTCONF runs only over HTTPS:</p>
<pre class="code">ip h&#116;tp secure-server                  <span class="c">! HTTPS on TCP 443</span>
no ip h&#116;tp server                      <span class="c">! disable plain HTTP</span>
ip h&#116;tp authentication local           <span class="c">! or: aaa, to use your TACACS+/RADIUS lists</span>
ip h&#116;tp secure-trustpoint TP-API      <span class="c">! use a CA-signed certificate, not self-signed</span>
restconf
username api-ro privilege 15 algorithm-type scrypt secret Ap1-R3ad0nly!</pre>
<p>Clients must <b>validate the certificate</b>. Disabling certificate checks in a script ("verify = False") turns TLS into encryption with an unknown party, which is exactly what a man-in-the-middle wants.</p>

<h3>Authentication options</h3>
<table class="cmp"><tr><th>Method</th><th>How it works</th><th>Risk</th></tr>
<tr><td>HTTP Basic</td><td>Header <code>Authorization: Basic</code> + base64 of "user:password" on every request</td><td>Base64 is encoding, not encryption; the password travels with every call and is easy to leak in logs</td></tr>
<tr><td>Token (session)</td><td>Log in once with credentials, receive a token, send it in a header on later calls</td><td>Token theft; limit lifetime</td></tr>
<tr><td>OAuth 2.0 bearer token</td><td><code>Authorization: Bearer</code> + a short-lived, scoped token from an authorization server</td><td>Needs an identity provider; best practice for large systems</td></tr>
<tr><td>API key</td><td>A long random string in a header, identifying an application</td><td>Often long-lived and not tied to a person; must be rotated and scoped</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Basic authentication decoded. User <code>netadmin</code>, password <code>Adm!n-26</code>. The client sends <code>Authorization: Basic bmV0YWRtaW46QWRtIW4tMjY=</code>. Anyone who sees that header runs a base64 decode and gets <code>netadmin:Adm!n-26</code>. Over HTTPS the header is encrypted on the wire, but it still ends up in proxy logs, debug output or a script in Git if handled carelessly.</p></div>

<h3>Token-based flow (Catalyst Center example)</h3>
<ol>
<li>The client sends <code>POST /dna/system/api/v1/auth/token</code> over HTTPS with Basic credentials, once.</li>
<li>The controller returns JSON such as <code>{"Token": "eyJhbGciOi..."}</code>, valid for a limited time (about an hour).</li>
<li>Every later request carries the header <code>X-Auth-Token: eyJhbGciOi...</code> instead of the password.</li>
<li>When the token expires, the API answers <code>401 Unauthorized</code> and the client requests a new token.</li>
</ol>
<p>The password is sent once, the token expires on its own, and it can be revoked. SD-WAN Manager uses a similar idea with a session cookie plus a cross-site request forgery (XSRF) token.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Token authentication flow">
<rect x="30" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="90" y="45" text-anchor="middle" class="svg-ink" font-size="13">Script</text>
<rect x="490" y="20" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="550" y="45" text-anchor="middle" class="svg-ink" font-size="13">Controller</text>
<line x1="90" y1="60" x2="90" y2="215" stroke="#64748b" stroke-dasharray="3 3"/><line x1="550" y1="60" x2="550" y2="215" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="90" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">1. POST auth/token (Basic, once)</text>
<line x1="550" y1="115" x2="90" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">2. Token (expires)</text>
<line x1="90" y1="150" x2="550" y2="150" stroke="#64748b" stroke-width="2"/><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">3. GET ... with X-Auth-Token</text>
<line x1="550" y1="180" x2="90" y2="180" stroke="#64748b" stroke-width="2"/><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">4. 200 OK + JSON (or 401 when expired)</text>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">All over HTTPS (TLS)</text>
</svg><p class="cap">The password crosses the wire once; later calls use a short-lived token.</p></div>

<h3>Authorization: RBAC and least privilege</h3>
<p><b>Role-based access control</b> (RBAC) gives each API account a role: read-only for monitoring tools, write access only for the automation platform, admin for very few. Controllers map roles to allowed API endpoints and verbs. On IOS XE, RESTCONF and NETCONF require a privilege 15 user, so control what that user can reach: restrict source addresses, use AAA (<code>ip h&#116;tp authentication aaa</code>) with TACACS+ accounting, and keep separate accounts per tool so logs show which tool did what.</p>

<h3>Status codes you must recognise</h3>
<ul>
<li><b>200 OK</b>, <b>201 Created</b>, <b>204 No Content</b>: success.</li>
<li><b>400 Bad Request</b>: malformed body or parameters.</li>
<li><b>401 Unauthorized</b>: not authenticated: missing, wrong or expired credentials or token.</li>
<li><b>403 Forbidden</b>: authenticated, but your role does not allow this action.</li>
<li><b>404 Not Found</b>, <b>429 Too Many Requests</b> (rate limited), <b>500</b> server error.</li>
</ul>

<h3>Secret hygiene</h3>
<p>Never hard-code passwords, tokens or API keys in scripts or commit them to Git. Use environment variables or a secrets vault, rotate keys, give tokens short lifetimes, and rate-limit APIs so a leaked key cannot hammer the controller.</p>

<div class="warn"><p><b>Common mistake.</b> Leaving <code>ip h&#116;tp server</code> enabled "because the web UI needs it". Plain HTTP exposes credentials. Use the secure server only, and if nobody uses the web UI or RESTCONF, disable both.</p></div>

<div class="exam"><p><b>Exam trap.</b> 401 means "who are you?" (authentication), 403 means "I know who you are, and no" (authorization). Base64 in Basic authentication is encoding, not encryption; HTTPS is what protects it. Tokens are sent in a header, not in the URL.</p></div>

<div class="scn"><h4>The API key in the public repository</h4><p>A network automation intern pushed a script to a public code repository with a controller API key and an admin password inside. Within hours, automated scanners found them and started calling the API. Luckily the key was read-only. The team revoked the key, rotated the password, moved secrets into environment variables loaded from a vault, added a secret scanner to the commit pipeline, and gave each tool its own least-privilege account.</p><p><b>Lesson:</b> treat API keys and tokens like passwords: scoped, short-lived, stored in a vault, never in code.</p></div>

<div class="iv"><p class="q">"How do you secure access to a network controller's REST API?"</p><p>HTTPS only with a trusted certificate and certificate validation in clients; token-based authentication (short-lived tokens, OAuth 2.0 where available) instead of Basic authentication on every call; RBAC with least-privilege roles and separate accounts per tool; secrets in a vault, not in code; rate limiting and logging. Explain 401 versus 403 and why base64 is not encryption.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>REST APIs need the same AAA thinking: authentication, authorization, encryption, logging.</li>
<li>Use HTTPS (TLS, TCP 443) with validated certificates; disable plain HTTP (<code>no ip h&#116;tp server</code>).</li>
<li>Basic authentication sends base64 "user:password" on every call; tokens send the password once and expire.</li>
<li>API keys identify applications; scope, rotate and vault them. RBAC gives least privilege.</li>
<li>401 = not authenticated, 403 = authenticated but not allowed.</li>
</ul></div>
`,hi:`
<p>REST API building ke peeche ki ek service khidki hai jahan log nahi, programs requests dete hain. Yeh SSH front door ko skip karti hai, isliye AAA ke baare mein jo aapne seekha woh sab is khidki ke liye dobara banana padta hai: kaun khatkhata raha hai (authentication), woh kya maang sakta hai (authorization), kya baatcheet private hai (encryption), aur kya log hoti hai (accounting). Blueprint item 5.3 aapse REST API security <b>describe</b> karne ko kehta hai; <b>YANG, NETCONF aur RESTCONF</b> module baad mein in ideas ko hands-on use karta hai.</p>

<h3>REST ka chhota refresher</h3>
<p>REST APIs path se pehchaane gaye resources par HTTP verbs use karti hain: <code>GET</code> padhta hai, <code>POST</code> banata hai, <code>PUT</code> replace karta hai, <code>PATCH</code> modify karta hai, <code>DELETE</code> hataata hai. IOS XE par RESTCONF configuration ko YANG data ki tarah dikhata hai, jaise <code>GET /restconf/data/Cisco-IOS-XE-native:native/hostname</code>. Catalyst Center aur SD-WAN Manager jaise controllers apni REST APIs dete hain.</p>

<h3>Transport bachao: TLS ke saath HTTPS</h3>
<p>Plain HTTP sab kuch, credentials aur tokens samet, TCP 80 par clear text mein bhejta hai. Hamesha <b>HTTPS</b> (TLS par HTTP, TCP 443) use karo: TLS session encrypt karta hai, integrity bachata hai, aur server certificate server ki pehchaan sabit karta hai. IOS XE par RESTCONF sirf HTTPS par chalta hai:</p>
<pre class="code">ip h&#116;tp secure-server                  <span class="c">! TCP 443 par HTTPS</span>
no ip h&#116;tp server                      <span class="c">! plain HTTP band</span>
ip h&#116;tp authentication local           <span class="c">! ya: aaa, apni TACACS+/RADIUS lists ke liye</span>
ip h&#116;tp secure-trustpoint TP-API      <span class="c">! CA-signed certificate, self-signed nahi</span>
restconf
username api-ro privilege 15 algorithm-type scrypt secret Ap1-R3ad0nly!</pre>
<p>Clients ko <b>certificate validate</b> karna chahiye. Script mein certificate checks band karna ("verify = False") TLS ko ek anjaan party ke saath encryption bana deta hai, jo bilkul wahi hai jo man-in-the-middle chahta hai.</p>

<h3>Authentication options</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise kaam karta hai</th><th>Risk</th></tr>
<tr><td>HTTP Basic</td><td>Har request par header <code>Authorization: Basic</code> + "user:password" ka base64</td><td>Base64 encoding hai, encryption nahi; password har call ke saath jaata hai aur logs mein aasaani se leak hota hai</td></tr>
<tr><td>Token (session)</td><td>Ek baar credentials se login, token milta hai, agli calls par header mein bhejo</td><td>Token chori; lifetime seemit karo</td></tr>
<tr><td>OAuth 2.0 bearer token</td><td><code>Authorization: Bearer</code> + authorization server se chhoti umar ka, scoped token</td><td>Identity provider chahiye; bade systems ke liye best practice</td></tr>
<tr><td>API key</td><td>Header mein lamba random string, jo application ko pehchanta hai</td><td>Aksar lambi umar ka aur kisi insaan se juda nahi; rotate aur scope karna zaroori</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Basic authentication decode. User <code>netadmin</code>, password <code>Adm!n-26</code>. Client bhejta hai <code>Authorization: Basic bmV0YWRtaW46QWRtIW4tMjY=</code>. Jo bhi yeh header dekhe, base64 decode chalaye aur <code>netadmin:Adm!n-26</code> paa le. HTTPS par header wire par encrypted hai, lekin laaparwaahi se handle karne par phir bhi proxy logs, debug output ya Git ki kisi script mein pahunch jaata hai.</p></div>

<h3>Token-based flow (Catalyst Center example)</h3>
<ol>
<li>Client HTTPS par Basic credentials ke saath <code>POST /dna/system/api/v1/auth/token</code> bhejta hai, ek baar.</li>
<li>Controller JSON lautata hai jaise <code>{"Token": "eyJhbGciOi..."}</code>, seemit samay ke liye valid (lagbhag ek ghanta).</li>
<li>Har agli request password ki jagah header <code>X-Auth-Token: eyJhbGciOi...</code> le jaati hai.</li>
<li>Token expire hone par API <code>401 Unauthorized</code> jawab deti hai aur client naya token maangta hai.</li>
</ol>
<p>Password ek baar jaata hai, token apne aap expire hota hai, aur use revoke kiya jaa sakta hai. SD-WAN Manager isi tarah ka idea session cookie plus cross-site request forgery (XSRF) token ke saath use karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Token authentication flow">
<rect x="30" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="90" y="45" text-anchor="middle" class="svg-ink" font-size="13">Script</text>
<rect x="490" y="20" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="550" y="45" text-anchor="middle" class="svg-ink" font-size="13">Controller</text>
<line x1="90" y1="60" x2="90" y2="215" stroke="#64748b" stroke-dasharray="3 3"/><line x1="550" y1="60" x2="550" y2="215" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="90" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">1. POST auth/token (Basic, ek baar)</text>
<line x1="550" y1="115" x2="90" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">2. Token (expire hota hai)</text>
<line x1="90" y1="150" x2="550" y2="150" stroke="#64748b" stroke-width="2"/><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">3. X-Auth-Token ke saath GET ...</text>
<line x1="550" y1="180" x2="90" y2="180" stroke="#64748b" stroke-width="2"/><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">4. 200 OK + JSON (expire par 401)</text>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">Sab HTTPS (TLS) par</text>
</svg><p class="cap">Password wire par ek baar jaata hai; baad ki calls chhoti umar ka token use karti hain.</p></div>

<h3>Authorization: RBAC aur least privilege</h3>
<p><b>Role-based access control</b> (RBAC) har API account ko ek role deta hai: monitoring tools ke liye read-only, sirf automation platform ke liye write access, bahut kam logon ke liye admin. Controllers roles ko allowed API endpoints aur verbs se map karte hain. IOS XE par RESTCONF aur NETCONF ko privilege 15 user chahiye, isliye control karo ki woh user kahan tak pahunch sake: source addresses seemit karo, TACACS+ accounting ke saath AAA (<code>ip h&#116;tp authentication aaa</code>) use karo, aur har tool ke liye alag account rakho taaki logs dikhayein kis tool ne kya kiya.</p>

<h3>Status codes jo pehchanne chahiye</h3>
<ul>
<li><b>200 OK</b>, <b>201 Created</b>, <b>204 No Content</b>: safalta.</li>
<li><b>400 Bad Request</b>: kharab body ya parameters.</li>
<li><b>401 Unauthorized</b>: authenticated nahi: missing, galat ya expired credentials ya token.</li>
<li><b>403 Forbidden</b>: authenticated, lekin aapka role yeh action allow nahi karta.</li>
<li><b>404 Not Found</b>, <b>429 Too Many Requests</b> (rate limited), <b>500</b> server error.</li>
</ul>

<h3>Secret hygiene</h3>
<p>Passwords, tokens ya API keys kabhi scripts mein hard-code mat karo ya Git mein commit mat karo. Environment variables ya secrets vault use karo, keys rotate karo, tokens ko chhoti umar do, aur APIs ko rate-limit karo taaki leak hui key controller par hathauda na chala sake.</p>

<div class="warn"><p><b>Common galti.</b> <code>ip h&#116;tp server</code> ko "web UI ko chahiye" kehkar chalu chhod dena. Plain HTTP credentials khol deta hai. Sirf secure server use karo, aur agar koi web UI ya RESTCONF use nahi karta, to dono band karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> 401 ka matlab "aap kaun ho?" (authentication), 403 ka matlab "main jaanta hoon aap kaun ho, aur nahi" (authorization). Basic authentication mein base64 encoding hai, encryption nahi; use HTTPS bachata hai. Tokens header mein bheje jaate hain, URL mein nahi.</p></div>

<div class="scn"><h4>Public repository mein API key</h4><p>Ek network automation intern ne ek script public code repository mein push kar di jisme controller API key aur admin password the. Ghanton mein automated scanners ne unhe dhoond liya aur API call karni shuru kar di. Kismat se key read-only thi. Team ne key revoke ki, password rotate kiya, secrets ko vault se load hone wale environment variables mein daala, commit pipeline mein secret scanner joda, aur har tool ko apna least-privilege account diya.</p><p><b>Seekh:</b> API keys aur tokens ko passwords ki tarah treat karo: scoped, chhoti umar, vault mein, code mein kabhi nahi.</p></div>

<div class="iv"><p class="q">"Network controller ki REST API ka access kaise secure karte ho?"</p><p>Trusted certificate ke saath sirf HTTPS aur clients mein certificate validation; har call par Basic authentication ki jagah token-based authentication (chhoti umar ke tokens, jahan ho sake OAuth 2.0); least-privilege roles aur har tool ke alag accounts ke saath RBAC; secrets vault mein, code mein nahi; rate limiting aur logging. 401 vs 403 aur base64 encryption kyun nahi hai, yeh samjhao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>REST APIs ko wahi AAA soch chahiye: authentication, authorization, encryption, logging.</li>
<li>Validated certificates ke saath HTTPS (TLS, TCP 443) use karo; plain HTTP band karo (<code>no ip h&#116;tp server</code>).</li>
<li>Basic authentication har call par base64 "user:password" bhejta hai; tokens password ek baar bhejte hain aur expire hote hain.</li>
<li>API keys applications ko pehchanti hain; unhe scope, rotate aur vault karo. RBAC least privilege deta hai.</li>
<li>401 = authenticated nahi, 403 = authenticated lekin allowed nahi.</li>
</ul></div>
`}};export{e as default};