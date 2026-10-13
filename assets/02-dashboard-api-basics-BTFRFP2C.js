var e={id:`dashboard-api-basics`,h:{en:`Dashboard API basics: access, key, base URL and ids`,hi:`Dashboard API basics: access, key, base URL aur ids`},body:{en:`
<h3>Four things you need before the first call</h3>
<p>To talk to the Dashboard API from code you need four things: <b>access switched on</b>, an <b>API key</b>, the <b>base URL</b> and the <b>ids</b> of the organization and networks you want. Missing any one gives an error you will learn to recognise in chapter 4.</p>

<h3>1. Switch API access on</h3>
<p>On the <b>Admins and API</b> page there is an organization setting that enables API access. It is off until an administrator turns it on, like a locked door. If it is off, every call is refused with <b>403</b>. Turning it on is a policy decision: you are allowing code to read, and maybe change, the network. Only trusted admins should do it, and the change appears in the change log.</p>

<h3>2. The API key: your password for code</h3>
<p>An <b>API key</b> is a long secret string that identifies you to the API. In the request it travels in the <code>Authorization</code> header as a <b>Bearer token</b>: the word <code>Bearer</code>, a space, then the key. "Bearer" means "whoever bears (carries) this token is allowed in". In the lab the key is stored in a file named <code>key.txt</code> on the API lab host AUTO (198.51.100.100). Your script reads the file instead of having the key typed into the code.</p>
<pre class="code"><span class="c"># read the key from a file, not from the code</span>
with open("key.txt") as f:
    KEY = f.read().strip()

HEADERS = {
    "Authorization": "Bearer " + KEY,
    "Content-Type": "application/json",
}</pre>

<div class="warn"><p><b>Key safety rules.</b> A key is as powerful as the admin who created it.<br>1. Never paste a key into a chat, a ticket, an email or a screenshot.<br>2. Never commit a key to a Git repository, even a private one. Keep it in a file that is listed in <code>.gitignore</code>, or in an environment variable.<br>3. Give each script its own key where possible and revoke a key you no longer need.<br>4. If a key leaks, revoke it at once and create a new one.<br>5. Print only the first few characters when debugging, never the whole key.</p></div>

<h3>3. The base URL</h3>
<p>The <b>base URL</b> is the front part of every address. In our lab it is the secure web scheme, the dashboard IP address 203.0.113.80, then <code>/api/v1</code>. You write it once as a variable and add a path for each call. In code, the scheme is written with the entity form so that this page can be stored safely; in your own Python file you type the normal letters.</p>
<pre class="code">BASE = "h&#116;tps://203.0.113.80/api/v1"

<span class="c"># full address = BASE + path</span>
url = BASE + "/organizations"</pre>
<p>Using the IP address (203.0.113.80), not a hostname, avoids a DNS problem hiding the real fault.</p>

<h3>4. Organization and network ids</h3>
<p>Most paths contain an id. The organization is <code>1001</code> (Bharat Retail Co). The networks are <code>mum</code>, <code>blr</code> and <code>del</code>. You get them from the API itself, not from memory: <code>GET /organizations</code> lists the organizations and <code>GET /organizations/{orgId}/networks</code> lists networks with their ids.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Anatomy of an API call">
<rect x="10" y="20" width="620" height="50" rx="8" fill="#e2e8f0"/>
<rect x="14" y="26" width="80" height="38" rx="6" fill="#bae6fd"/><text x="54" y="50" text-anchor="middle" class="svg-ink" font-size="13">GET</text>
<rect x="100" y="26" width="270" height="38" rx="6" fill="#bbf7d0"/><text x="235" y="50" text-anchor="middle" class="svg-ink" font-size="12">BASE: scheme + 203.0.113.80 + /api/v1</text>
<rect x="376" y="26" width="248" height="38" rx="6" fill="#fde68a"/><text x="500" y="50" text-anchor="middle" class="svg-ink" font-size="12">/organizations/1001/networks</text>
<rect x="10" y="95" width="300" height="55" rx="8" fill="#ddd6fe"/><text x="160" y="118" text-anchor="middle" class="svg-ink" font-size="13">Header</text><text x="160" y="137" text-anchor="middle" class="svg-muted" font-size="12">Authorization: Bearer key</text>
<rect x="330" y="95" width="300" height="55" rx="8" fill="#fed7aa"/><text x="480" y="118" text-anchor="middle" class="svg-ink" font-size="13">Answer</text><text x="480" y="137" text-anchor="middle" class="svg-muted" font-size="12">200 plus JSON list of networks</text>
<rect x="10" y="170" width="620" height="55" rx="8" fill="#fecaca"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">No access: 403. No or wrong key: 401. Unknown id: 404.</text><text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">The key never goes into chat or into Git</text>
</svg><p class="cap">Method, base URL, path, header and answer.</p></div>

<h3>The first successful call</h3>
<pre class="code">import requests

BASE = "h&#116;tps://203.0.113.80/api/v1"
with open("key.txt") as f:
    KEY = f.read().strip()
HEADERS = {"Authorization": "Bearer " + KEY}

r = requests.get(BASE + "/organizations", headers=HEADERS)
print(r.status_code)
print(r.json())</pre>
<pre class="out">200
[{'id': '1001', 'name': 'Bharat Retail Co'}]</pre>
<p>Status <span class="hl">200</span> and a list with one organization. The id <code>1001</code> goes into later paths.</p>

<div class="eg"><p><b>Worked example.</b> A new engineer runs the script before API access is enabled. The result is status 403. The error is not in the code; the organization setting on Admins and API is off. A senior admin enables it, the change log records the action, and the script returns 200. With a wrong key (one letter changed) the answer would be 401 instead.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Enabling API access changes an organization policy: it allows authenticated requests to the API. Creating a key adds a credential. A GET with that key reads configuration but changes nothing. Both settings appear in the change log.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 means "I do not know who you are" (missing or wrong key). 403 means "I know who you are, but it is not allowed" (API access off or no rights). Do not mix them up.</p></div>

<div class="scn"><h4>The key in the chat</h4><p>A junior engineer pasted a script with the full key into a team chat while asking for help. The security lead saw it within minutes, revoked the key, created a new one in key.txt on AUTO, and added key.txt to .gitignore. No harm was done, but the team added a rule: scripts read the key from a file or environment, never inline.</p><p><b>Lesson:</b> treat an API key like a password; revoke first, ask questions later.</p></div>

<div class="iv"><p class="q">"How do you authenticate to a REST API and keep the key safe?"</p><p>Strong answer: send the key in the Authorization header as a Bearer token. Read it from a file or environment variable, never hard-code it, never paste it in chat or commit it, restrict who can create keys, and revoke immediately if it leaks. Mention 401 versus 403.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Need: API access on, a key, the base URL and the ids.</li>
<li>The key goes in the header as Authorization: Bearer key.</li>
<li>Base URL here: scheme, 203.0.113.80, /api/v1; the org id is 1001.</li>
<li>Read ids from the API (organizations, then networks).</li>
<li>Never paste keys into chat or commit them; revoke leaked keys.</li>
</ul></div>
`,hi:`
<h3>Pehli call se pehle chaar cheezein</h3>
<p>Code se Dashboard API se baat karne ke liye chaar cheezein chahiye: <b>access on</b>, ek <b>API key</b>, <b>base URL</b> aur jin organization aur networks ki zaroorat hai unke <b>ids</b>. Koi ek bhi missing ho to error aata hai jise aap chapter 4 mein pehchanna seekhoge.</p>

<h3>1. API access on karo</h3>
<p><b>Admins and API</b> page par ek organization setting hai jo API access enable karti hai. Jab tak administrator use on na kare woh off rehti hai, taale lage darwaze ki tarah. Agar woh off hai to har call <b>403</b> se refuse hoti hai. Ise on karna policy decision hai: aap code ko network padhne, aur shayad badalne, ki ijazat de rahe ho. Sirf trusted admins ko yeh karna chahiye, aur change, change log mein dikhta hai.</p>

<h3>2. API key: code ka password</h3>
<p><b>API key</b> ek lambi secret string hai jo API ko batati hai ki aap kaun ho. Request mein yeh <code>Authorization</code> header mein <b>Bearer token</b> ke roop mein jaati hai: shabd <code>Bearer</code>, ek space, phir key. "Bearer" ka matlab "jo bhi yeh token carry karta hai use andar aane do". Lab mein key API lab host AUTO (198.51.100.100) par <code>key.txt</code> naam ki file mein rakhi hai. Aapki script key ko code mein type karne ke bajay file se padhti hai.</p>
<pre class="code"><span class="c"># key ko file se padho, code se nahi</span>
with open("key.txt") as f:
    KEY = f.read().strip()

HEADERS = {
    "Authorization": "Bearer " + KEY,
    "Content-Type": "application/json",
}</pre>

<div class="warn"><p><b>Key safety rules.</b> Key utni hi powerful hai jitna use banane wala admin.<br>1. Key ko kabhi chat, ticket, email ya screenshot mein paste mat karo.<br>2. Key ko kabhi Git repository mein commit mat karo, private mein bhi nahi. Use <code>.gitignore</code> mein listed file mein ya environment variable mein rakho.<br>3. Jahan ho sake har script ko apni key do aur jo key ab nahi chahiye use revoke karo.<br>4. Agar key leak ho jaye to turant revoke karo aur nayi banao.<br>5. Debugging mein key ke sirf pehle kuch characters print karo, poori kabhi nahi.</p></div>

<h3>3. Base URL</h3>
<p><b>Base URL</b> har address ka aagey ka hissa hai. Humare lab mein yeh secure web scheme hai, phir dashboard IP address 203.0.113.80, phir <code>/api/v1</code>. Aap ise ek baar variable mein likhte ho aur har call ke liye path jodte ho. Code mein scheme entity form mein likhi gayi hai taaki yeh page safely store ho sake; apni Python file mein aap normal letters type karoge.</p>
<pre class="code">BASE = "h&#116;tps://203.0.113.80/api/v1"

<span class="c"># poora address = BASE + path</span>
url = BASE + "/organizations"</pre>
<p>Hostname ki jagah IP address (203.0.113.80) use karne se DNS problem asli fault ko nahi chhupati.</p>

<h3>4. Organization aur network ids</h3>
<p>Zyadatar paths mein ek id hoti hai. Organization <code>1001</code> hai (Bharat Retail Co). Networks <code>mum</code>, <code>blr</code> aur <code>del</code> hain. Aap unhe yaad se nahi, API se lete ho: <code>GET /organizations</code> organizations list karta hai aur <code>GET /organizations/{orgId}/networks</code> networks ko unki ids ke saath list karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="API call ki anatomy">
<rect x="10" y="20" width="620" height="50" rx="8" fill="#e2e8f0"/>
<rect x="14" y="26" width="80" height="38" rx="6" fill="#bae6fd"/><text x="54" y="50" text-anchor="middle" class="svg-ink" font-size="13">GET</text>
<rect x="100" y="26" width="270" height="38" rx="6" fill="#bbf7d0"/><text x="235" y="50" text-anchor="middle" class="svg-ink" font-size="12">BASE: scheme + 203.0.113.80 + /api/v1</text>
<rect x="376" y="26" width="248" height="38" rx="6" fill="#fde68a"/><text x="500" y="50" text-anchor="middle" class="svg-ink" font-size="12">/organizations/1001/networks</text>
<rect x="10" y="95" width="300" height="55" rx="8" fill="#ddd6fe"/><text x="160" y="118" text-anchor="middle" class="svg-ink" font-size="13">Header</text><text x="160" y="137" text-anchor="middle" class="svg-muted" font-size="12">Authorization: Bearer key</text>
<rect x="330" y="95" width="300" height="55" rx="8" fill="#fed7aa"/><text x="480" y="118" text-anchor="middle" class="svg-ink" font-size="13">Jawab</text><text x="480" y="137" text-anchor="middle" class="svg-muted" font-size="12">200 plus networks ki JSON list</text>
<rect x="10" y="170" width="620" height="55" rx="8" fill="#fecaca"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Access nahi: 403. Key nahi ya galat: 401. Unknown id: 404.</text><text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">Key kabhi chat ya Git mein nahi jaati</text>
</svg><p class="cap">Method, base URL, path, header aur jawab.</p></div>

<h3>Pehli successful call</h3>
<pre class="code">import requests

BASE = "h&#116;tps://203.0.113.80/api/v1"
with open("key.txt") as f:
    KEY = f.read().strip()
HEADERS = {"Authorization": "Bearer " + KEY}

r = requests.get(BASE + "/organizations", headers=HEADERS)
print(r.status_code)
print(r.json())</pre>
<pre class="out">200
[{'id': '1001', 'name': 'Bharat Retail Co'}]</pre>
<p>Status <span class="hl">200</span> aur ek organization wali list. Id <code>1001</code> aage ke paths mein jaati hai.</p>

<div class="eg"><p><b>Worked example.</b> Naya engineer API access enable hone se pehle script chalata hai. Result status 403 aata hai. Galti code mein nahi hai; Admins and API par organization setting off hai. Senior admin use enable karta hai, change log action record karta hai, aur script 200 deti hai. Galat key (ek letter badla hua) hoti to jawab 401 hota.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> API access enable karne se organization policy badalti hai: yeh authenticated requests ko API tak jaane deti hai. Key banane se ek credential judta hai. Us key ke saath GET configuration padhta hai lekin kuch nahi badalta. Dono settings change log mein dikhti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 ka matlab "main nahi jaanta aap kaun ho" (key missing ya galat). 403 ka matlab "main jaanta hoon aap kaun ho, lekin allowed nahi" (API access off ya rights nahi). Inhe mix mat karo.</p></div>

<div class="scn"><h4>Chat mein key</h4><p>Ek junior engineer ne madad maangte waqt poori key wali script team chat mein paste kar di. Security lead ne kuch minute mein dekha, key revoke ki, AUTO par key.txt mein nayi key banayi, aur key.txt ko .gitignore mein jodha. Koi nuksan nahi hua, lekin team ne rule banaya: scripts key ko file ya environment se padhengi, kabhi inline nahi.</p><p><b>Seekh:</b> API key ko password ki tarah treat karo; pehle revoke karo, sawal baad mein.</p></div>

<div class="iv"><p class="q">"REST API par authenticate kaise karte ho aur key safe kaise rakhte ho?"</p><p>Strong answer: key ko Authorization header mein Bearer token ke roop mein bhejo. Use file ya environment variable se padho, kabhi hard-code mat karo, chat mein paste ya commit mat karo, key banane wale logon ko restrict karo, aur leak par turant revoke karo. 401 aur 403 ka fark batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chahiye: API access on, ek key, base URL aur ids.</li>
<li>Key header mein jaati hai: Authorization: Bearer key.</li>
<li>Yahan base URL: scheme, 203.0.113.80, /api/v1; org id 1001 hai.</li>
<li>Ids API se lo (organizations, phir networks).</li>
<li>Keys ko chat mein paste ya commit mat karo; leak hui keys revoke karo.</li>
</ul></div>
`}};export{e as default};