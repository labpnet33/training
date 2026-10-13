var e={id:`cli-kv`,h:{en:`The vault command and KV version 2`,hi:`vault command aur KV version 2`},body:{en:`
<p>Before any Python, learn the tool that every Vault engineer types first: the <code>vault</code> command. It is a small client for Vault's web interface, and it is the quickest way to see what a secret looks like, which version you are on and why a script is being refused. Everything you do here, <code>hvac</code> does later from code.</p>

<h3>An analogy: a filing cabinet that keeps old copies</h3>
<p>Imagine a cabinet where, each time you replace a folder, the clerk files the old one behind it instead of throwing it away. You can ask for the newest, for version 1, or for the list of folders. That is the KV version 2 engine.</p>

<h3>Two settings the command needs</h3>
<table class="cmp"><tr><th>Variable</th><th>Meaning</th><th>If missing</th></tr><tr><td><code>VAULT_ADDR</code></td><td>Where the server is</td><td>The command asks <code>127.0.0.1</code> on port 8200 over TLS, which is nobody</td></tr><tr><td><code>VAULT_TOKEN</code></td><td>Your badge</td><td>The server answers 403 permission denied</td></tr></table>
<pre class="out">AUTO01$ vault status
Error checking seal status: Get "h&#116;tps://127.0.0.1:8200/v1/sys/seal-status": dial tcp 127.0.0.1:8200: connect: connection refused</pre>
<p>That is the real message: the command did not reach Vault, it knocked on its own front door. Point it at the server and ask again. <code>Sealed false</code> means the vault is open for business.</p>
<pre class="code">export VAULT_ADDR=h&#116;tp://10.99.0.70:8200</pre>
<pre class="out">AUTO01$ vault status
Key             Value
---             -----
Seal Type       shamir
<span class="hl">Initialized     true</span>
<span class="hl">Sealed          false</span>
Total Shares    1
Threshold       1
Version         1.15.4
Build Date      2023-12-04T17:45:28Z
Storage Type    inmem
Cluster Name    vault-cluster-871571dc
Cluster ID      ab9176e2-739e-4121-9dd4-5f173b4a4cf3
HA Enabled      false</pre>
<p>Now the badge. Without one, even a harmless question is refused, and Vault answers a missing token and a wrong token in exactly the same way.</p>
<pre class="out">AUTO01$ vault secrets list
Error listing secrets: Error making API request.

URL: GET h&#116;tp://10.99.0.70:8200/v1/sys/mounts
<span class="hl">Code: 403</span>. Errors:

* permission denied</pre>
<pre class="code">export VAULT_TOKEN=root-token-for-lab</pre>
<pre class="out">AUTO01$ vault secrets list
Path          Type         Accessor              Description
----          ----         --------              -----------
cubbyhole/    cubbyhole    cubbyhole_137bbe1d    per-token private secret storage
identity/     identity     identity_e1d9b252     identity store
<span class="hl">secret/       kv</span>           kv_167ef4eb           key/value secret storage
sys/          system       system_b6d9d9ec       system endpoints used for control, policy and debugging</pre>
<p>The lab's setup token is <code>root-token-for-lab</code>. On a real server a root token is used once, to set things up, and then revoked; people sign in with their own login. KV version 2 is mounted at <code>secret/</code>.</p>

<h3>Paths: the same secret under three names</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="One secret has a CLI path, a data path and a metadata path">
<rect x="20" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="13">CLI path</text><text x="110" y="58" text-anchor="middle" class="svg-muted" font-size="12">secret/net/demo</text>
<rect x="230" y="20" width="190" height="46" rx="8" fill="#bbf7d0"/><text x="325" y="40" text-anchor="middle" class="svg-ink" font-size="13">API data path</text><text x="325" y="58" text-anchor="middle" class="svg-muted" font-size="12">secret/data/net/demo</text>
<rect x="450" y="20" width="170" height="46" rx="8" fill="#fde68a"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="13">metadata path</text><text x="535" y="58" text-anchor="middle" class="svg-muted" font-size="12">secret/metadata/net/demo</text>
<line x1="200" y1="43" x2="230" y2="43" stroke="#64748b" stroke-width="2"/><line x1="420" y1="43" x2="450" y2="43" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<rect x="20" y="100" width="600" height="70" rx="8" fill="#e2e8f0"/>
<text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="13">vault kv adds the middle word for you</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">policies and raw API calls must spell it out: data/ for the values, metadata/ for names and versions</text>
<text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">hvac does the same: you pass path="net/demo" and mount_point="secret"</text>
</svg><p class="cap">KV version 2 puts the values under data/ and the history under metadata/. You will need this in the policy chapter.</p></div>

<h3>Write, read, version</h3>
<pre class="out">AUTO01$ vault kv put secret/net/demo user=netops password=demo-only-123
======= Secret Path =======
secret/data/net/demo

======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:22.386619595Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
destroyed          false
<span class="hl">version            1</span></pre>
<pre class="out">AUTO01$ vault kv get secret/net/demo
======= Secret Path =======
secret/data/net/demo

======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:22.386619595Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
destroyed          false
<span class="hl">version            1</span>

====== Data ======
Key         Value
---         -----
<span class="hl">password    demo-only-123</span>
user        netops</pre>
<pre class="out">AUTO01$ vault kv get -field=user secret/net/demo
netops</pre>
<p><code>-field=user</code> prints one value and nothing else, which is how shell scripts take a single value. Writing the same path again does not overwrite: it makes version 2 and keeps version 1.</p>
<pre class="out">AUTO01$ vault kv put secret/net/demo user=netops password=demo-only-456
======= Secret Path =======
secret/data/net/demo

======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:24.208766259Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
destroyed          false
<span class="hl">version            2</span>
AUTO01$ vault kv get -version=1 secret/net/demo
======= Secret Path =======
secret/data/net/demo

======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:22.386619595Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
destroyed          false
<span class="hl">version            1</span>

====== Data ======
Key         Value
---         -----
password    demo-only-123
user        netops</pre>
<pre class="out">AUTO01$ vault kv list secret/net
Keys
----
demo</pre>

<div class="warn"><p><b>Common mistake.</b> Typing <code>password=...</code> on the command line. The value lands in your shell history and is visible in the process list while the command runs. The demo values here are fake. For real secrets pass a file or standard input, or better, let a script do the write (next chapter).</p></div>
<p>Two safer ways with the same command are a JSON file, <code>vault kv put secret/net/demo2 @demo.json</code>, and standard input with a dash. The file must be created with mode 600 and removed afterwards.</p>
<pre class="out">AUTO01$ vault kv put secret/net/demo2 @demo.json
======= Secret Path =======
secret/data/net/demo2

======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:29.666285448Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
destroyed          false
<span class="hl">version            1</span></pre>

<h3>Under the hood it is just H&#84;TP</h3>
<p>The command and <code>hvac</code> are wrappers around web requests with the token in a header called <code>X-Vault-Token</code>. When a library behaves oddly, ask the server directly:</p>
<pre class="out">AUTO01$ curl -s -i h&#116;tp://10.99.0.70:8200/v1/secret/data/net/demo
H&#84;TP/1.1 <span class="hl">403 Forbidden</span>
Cache-Control: no-store
Content-Type: application/json
Strict-Transport-Security: max-age=31536000; includeSubDomains
Date: Sun, 11 Oct 2026 15:27:26 GMT
Content-Length: 32

{"errors":["<span class="hl">permission denied</span>"]}</pre>

<div class="exam"><p><b>Exam trap.</b> <code>vault kv get secret/net/demo</code> reads the data path for you. If you write <code>secret/data/net/demo</code> in the CLI you ask for <code>secret/data/data/net/demo</code>, which does not exist. In a policy or a raw request you must write the <code>data/</code> part yourself.</p></div>

<div class="scn"><h4>Everything is refused, even a status check</h4><p>A new engineer reported "Vault is broken": <code>vault kv get</code> returned 403 and <code>vault status</code> returned connection refused on 127.0.0.1. The server was healthy. The first command had no token, and the second was using the default address because <code>VAULT_ADDR</code> was set in a different terminal. Two exports fixed both.</p><p><b>Lesson:</b> Check the address first, then the token, before you suspect the server.</p></div>

<div class="iv"><p class="q">"What is the difference between a delete in KV version 2 and in version 1?"</p><p>Version 1 stores one value per path, so write overwrites and delete removes it for good. Version 2 keeps versions: write adds a version, delete only marks the latest as deleted and can be undone, and destroy removes the data for chosen versions. That is why KV version 2 is the default choice for credentials you may need to roll back.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Set <code>VAULT_ADDR</code> and <code>VAULT_TOKEN</code>; the defaults point at your own machine and at nobody.</li><li><code>vault status</code> needs no token; reading and writing secrets do.</li><li>KV version 2 keeps every write as a new version; the CLI hides the <code>data/</code> segment, policies do not.</li><li>Never type a real password as a command argument; use a file, standard input or a script.</li><li>A 403 does not say whether the token is missing, expired or simply not allowed on that path.</li></ul></div>
`,hi:`
<p>Python se pehle woh tool seekho jo har Vault engineer sabse pehle type karta hai: <code>vault</code> command. Yeh Vault ke web interface ka chhota client hai, aur yeh dekhne ka sabse tez tareeka hai ki secret kaisa dikhta hai, tum kaunse version par ho aur script ko mana kyun kiya ja raha hai. Jo kuch tum yahan karte ho, <code>hvac</code> baad mein code se karta hai.</p>

<h3>Ek analogy: purani copies rakhne wali filing cabinet</h3>
<p>Ek cabinet socho jahan har baar folder badalne par clerk purana folder phenkne ke bajaye uske peeche file kar deta hai. Tum sabse naya maang sakte ho, version 1 maang sakte ho, ya folders ki list. Yahi KV version 2 engine hai.</p>

<h3>Command ko do settings chahiye</h3>
<table class="cmp"><tr><th>Variable</th><th>Matlab</th><th>Na ho to</th></tr><tr><td><code>VAULT_ADDR</code></td><td>Server kahan hai</td><td>Command TLS par port 8200 par <code>127.0.0.1</code> se poochhta hai, jahan koi nahi hai</td></tr><tr><td><code>VAULT_TOKEN</code></td><td>Tumhara badge</td><td>Server 403 permission denied deta hai</td></tr></table>
<pre class="out">AUTO01$ vault status
Error checking seal status: Get "h&#116;tps://127.0.0.1:8200/v1/sys/seal-status": dial tcp 127.0.0.1:8200: connect: connection refused</pre>
<p>Yeh asli message hai: command Vault tak pahunchi hi nahi, usne apne hi darwaze par dastak di. Use server ki taraf point karo aur dobara poochho. <code>Sealed false</code> ka matlab vault kaam ke liye khula hai.</p>
<pre class="code">export VAULT_ADDR=h&#116;tp://10.99.0.70:8200</pre>
<pre class="out">AUTO01$ vault status
Key             Value
---             -----
Seal Type       shamir
<span class="hl">Initialized     true</span>
<span class="hl">Sealed          false</span>
Total Shares    1
Threshold       1
Version         1.15.4
Build Date      2023-12-04T17:45:28Z
Storage Type    inmem
Cluster Name    vault-cluster-871571dc
Cluster ID      ab9176e2-739e-4121-9dd4-5f173b4a4cf3
HA Enabled      false</pre>
<p>Ab badge. Uske bina ek bholi sawaal bhi mana ho jaata hai, aur Vault missing token aur galat token ko bilkul ek jaise jawab deta hai.</p>
<pre class="out">AUTO01$ vault secrets list
Error listing secrets: Error making API request.

URL: GET h&#116;tp://10.99.0.70:8200/v1/sys/mounts
<span class="hl">Code: 403</span>. Errors:

* permission denied</pre>
<pre class="code">export VAULT_TOKEN=root-token-for-lab</pre>
<pre class="out">AUTO01$ vault secrets list
Path          Type         Accessor              Description
----          ----         --------              -----------
cubbyhole/    cubbyhole    cubbyhole_137bbe1d    per-token private secret storage
identity/     identity     identity_e1d9b252     identity store
<span class="hl">secret/       kv</span>           kv_167ef4eb           key/value secret storage
sys/          system       system_b6d9d9ec       system endpoints used for control, policy and debugging</pre>
<p>Lab ka setup token <code>root-token-for-lab</code> hai. Asli server par root token ek baar setup ke liye use hota hai, phir revoke kar diya jaata hai; log apne login se sign in karte hain. KV version 2 <code>secret/</code> par mount hai.</p>

<h3>Paths: ek hi secret, teen naam</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Ek secret ka CLI path, data path aur metadata path hota hai">
<rect x="20" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="13">CLI path</text><text x="110" y="58" text-anchor="middle" class="svg-muted" font-size="12">secret/net/demo</text>
<rect x="230" y="20" width="190" height="46" rx="8" fill="#bbf7d0"/><text x="325" y="40" text-anchor="middle" class="svg-ink" font-size="13">API data path</text><text x="325" y="58" text-anchor="middle" class="svg-muted" font-size="12">secret/data/net/demo</text>
<rect x="450" y="20" width="170" height="46" rx="8" fill="#fde68a"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="13">metadata path</text><text x="535" y="58" text-anchor="middle" class="svg-muted" font-size="12">secret/metadata/net/demo</text>
<line x1="200" y1="43" x2="230" y2="43" stroke="#64748b" stroke-width="2"/><line x1="420" y1="43" x2="450" y2="43" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<rect x="20" y="100" width="600" height="70" rx="8" fill="#e2e8f0"/>
<text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="13">vault kv beech ka word khud jod deta hai</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">policies aur raw API calls mein use khud likhna padta hai: values ke liye data/, names aur versions ke liye metadata/</text>
<text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">hvac bhi aisa hi karta hai: tum path="net/demo" aur mount_point="secret" dete ho</text>
</svg><p class="cap">KV version 2 values ko data/ ke neeche aur history ko metadata/ ke neeche rakhta hai. Policy chapter mein yeh kaam aayega.</p></div>

<h3>Likho, padho, version dekho</h3>
<pre class="out">AUTO01$ vault kv put secret/net/demo user=netops password=demo-only-123
======= Secret Path =======
secret/data/net/demo

======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:22.386619595Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
destroyed          false
<span class="hl">version            1</span></pre>
<pre class="out">AUTO01$ vault kv get secret/net/demo
======= Secret Path =======
secret/data/net/demo

======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:22.386619595Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
destroyed          false
<span class="hl">version            1</span>

====== Data ======
Key         Value
---         -----
<span class="hl">password    demo-only-123</span>
user        netops</pre>
<pre class="out">AUTO01$ vault kv get -field=user secret/net/demo
netops</pre>
<p><code>-field=user</code> sirf ek value print karta hai aur kuch nahi; shell scripts aise hi ek value leti hain. Wahi path dobara likhne par overwrite nahi hota: version 2 banta hai aur version 1 bacha rehta hai.</p>
<pre class="out">AUTO01$ vault kv put secret/net/demo user=netops password=demo-only-456
======= Secret Path =======
secret/data/net/demo

======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:24.208766259Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
destroyed          false
<span class="hl">version            2</span>
AUTO01$ vault kv get -version=1 secret/net/demo
======= Secret Path =======
secret/data/net/demo

======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:22.386619595Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
destroyed          false
<span class="hl">version            1</span>

====== Data ======
Key         Value
---         -----
password    demo-only-123
user        netops</pre>
<pre class="out">AUTO01$ vault kv list secret/net
Keys
----
demo</pre>

<div class="warn"><p><b>Aam galti.</b> Command line par <code>password=...</code> type karna. Value tumhari shell history mein aa jaati hai aur command chalte waqt process list mein dikhti hai. Yahan ki demo values fake hain. Asli secrets ke liye file ya standard input do, ya behtar, script se write karao (agla chapter).</p></div>
<p>Isi command ke do surakshit tareeke hain: JSON file, <code>vault kv put secret/net/demo2 @demo.json</code>, aur dash ke saath standard input. File mode 600 se banao aur baad mein hata do.</p>
<pre class="out">AUTO01$ vault kv put secret/net/demo2 @demo.json
======= Secret Path =======
secret/data/net/demo2

======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:29.666285448Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
destroyed          false
<span class="hl">version            1</span></pre>

<h3>Andar se yeh sirf H&#84;TP hai</h3>
<p>Command aur <code>hvac</code> web requests ke wrapper hain, jinme token <code>X-Vault-Token</code> naam ke header mein jaata hai. Library ajeeb chale to server se seedha poochho:</p>
<pre class="out">AUTO01$ curl -s -i h&#116;tp://10.99.0.70:8200/v1/secret/data/net/demo
H&#84;TP/1.1 <span class="hl">403 Forbidden</span>
Cache-Control: no-store
Content-Type: application/json
Strict-Transport-Security: max-age=31536000; includeSubDomains
Date: Sun, 11 Oct 2026 15:27:26 GMT
Content-Length: 32

{"errors":["<span class="hl">permission denied</span>"]}</pre>

<div class="exam"><p><b>Exam trap.</b> <code>vault kv get secret/net/demo</code> data path tumhare liye khud padhta hai. Agar CLI mein <code>secret/data/net/demo</code> likhoge to tum <code>secret/data/data/net/demo</code> maangte ho, jo hai hi nahi. Policy ya raw request mein <code>data/</code> wala hissa tumhe khud likhna padta hai.</p></div>

<div class="scn"><h4>Sab kuch mana hai, status check bhi</h4><p>Ek naye engineer ne report kiya "Vault toot gaya": <code>vault kv get</code> ne 403 diya aur <code>vault status</code> ne 127.0.0.1 par connection refused. Server theek tha. Pehli command mein token nahi tha, aur doosri default address use kar rahi thi kyunki <code>VAULT_ADDR</code> kisi doosre terminal mein set tha. Do exports ne dono theek kar diye.</p><p><b>Seekh:</b> Server par shak karne se pehle address check karo, phir token.</p></div>

<div class="iv"><p class="q">"KV version 2 aur version 1 mein delete ka kya fark hai?"</p><p>Version 1 ek path par ek value rakhta hai, isliye write overwrite karta hai aur delete hamesha ke liye hata deta hai. Version 2 versions rakhta hai: write ek version jodta hai, delete sirf latest ko deleted mark karta hai aur undo ho sakta hai, aur destroy chune hue versions ka data hata deta hai. Isi liye jin credentials ko roll back karna pad sakta hai unke liye KV version 2 default choice hai.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul><li><code>VAULT_ADDR</code> aur <code>VAULT_TOKEN</code> set karo; defaults tumhari apni machine aur kisi ko nahi point karte.</li><li><code>vault status</code> ko token nahi chahiye; secrets padhne aur likhne ko chahiye.</li><li>KV version 2 har write ko naya version banata hai; CLI <code>data/</code> segment chhipata hai, policies nahi.</li><li>Asli password kabhi command argument mein type mat karo; file, standard input ya script use karo.</li><li>403 nahi batata ki token missing hai, expired hai ya us path par allowed nahi hai.</li></ul></div>
`}};export{e as default};