var e={id:`auth-headers-params`,h:{en:`Login, headers, params and certificates`,hi:`Login, headers, params aur certificates`},body:{en:`

<p>A request is more than a URL. You tell requests who you are, which format you want, what extra options to add and whether to check the certificate. Each is a <b>named argument</b>: you write <code>name=value</code> inside the brackets of the call. Order does not matter.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="The knobs on a requests call, all written as name=value."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="30" width="600" height="40" rx="10" fill="#bae6fd"/><text x="310" y="55" text-anchor="middle" class="svg-ink" font-size="14">requests.get( url,  auth=(...),  headers={...},  params={...},  verify=...,  timeout=... )</text><text x="100" y="105" text-anchor="middle" class="svg-accent" font-size="13">auth</text><text x="205" y="105" text-anchor="middle" class="svg-accent" font-size="13">headers</text><text x="320" y="105" text-anchor="middle" class="svg-accent" font-size="13">params</text><text x="420" y="105" text-anchor="middle" class="svg-accent" font-size="13">verify</text><text x="520" y="105" text-anchor="middle" class="svg-accent" font-size="13">timeout</text><text x="100" y="128" text-anchor="middle" class="svg-muted" font-size="11">who I am</text><text x="205" y="128" text-anchor="middle" class="svg-muted" font-size="11">format, labels</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="11">?depth=1</text><text x="420" y="128" text-anchor="middle" class="svg-muted" font-size="11">check certificate</text><text x="520" y="128" text-anchor="middle" class="svg-muted" font-size="11">give up after</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="13">Each is a named argument: name=value</text></svg><p class="cap">The knobs on a requests call, all written as name=value.</p></div>

<h3>auth: who you are</h3>
<p><code>auth=("netops", "NK@2026")</code> is a <b>tuple</b>: two values in round brackets, username first. requests turns it into the Basic Authorization header for you. If the password is wrong, the router answers 401 and the body explains why:</p>
<pre class="code">import requests
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
r = requests.get(url, auth=("netops", "nk@2026"))
print(r.status_code)
print(r.text)</pre><pre class="out">AUTO&gt; python3 b.py
<span class="hl">401</span>
{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "access-denied",
<span class="hl">        "error-message": "authentication failed for user \\"netops\\""</span>
      }
    ]
  }
}</pre>
<p>The only difference from the working call is lower-case <code>nk@2026</code>. Passwords are case sensitive. Notice that Python did not crash: a 401 is a normal reply, so the script carries on and prints it. requests only raises an error for network problems unless you ask it to (chapter 6).</p>

<h3>headers: format and labels</h3>
<p><code>headers={"Accept": "application/yang-data+json"}</code> is a <b>dictionary</b>. Each key is a header name and each value its content. You met these in the REST module: Accept for the format you want back, Content-Type for the format you send.</p>

<h3>params and verify</h3>
<p><code>params={"depth": 1}</code> adds a query string to the URL for you (<code>?depth=1</code>), including any needed escaping. And <code>verify</code> controls certificate checking. The next script uses all of them, and prints the final URL that was called:</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"), verify=True)
print(r.status_code)
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"), verify=False)
print(r.status_code)
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"), params={"depth": 1})
print(r.status_code, r.url)</pre><pre class="out">AUTO&gt; python3 l.py
200
200
200 h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0</pre>
<p>Read it: the first call has <code>verify=True</code> (the default: check the certificate); the second has <code>verify=False</code> (do not check); the third adds <code>params</code>. In this lab all three return 200, because the simulated router accepts them, and note that the lab router ignores <code>depth</code> (it does not trim the data). Also note the final line: the printed URL has no <code>?depth=1</code> in it in this simulator, so do not rely on r.url to show query strings here. On a real device, the URL would end with <code>?depth=1</code>.</p>

<h3>The certificate question</h3>
<p>Routers in a lab have <i>self-signed</i> certificates that your computer does not trust. Real requests then raises an SSL error. Writing <code>verify=False</code> makes the error go away, and also removes the protection against someone pretending to be the router. So:</p>
<ul>
<li><b>Lab only:</b> <code>verify=False</code>, and silence the warning with <code>requests.packages.urllib3.disable_warnings()</code>, as the lab scripts do.</li>
<li><b>Real network:</b> keep <code>verify=True</code> and give requests the path of your company CA file with <code>verify="/path/to/ca.pem"</code>.</li>
</ul>
<p>Reference code (not run in the simulator):</p>
<pre class="code">r = requests.get(url, auth=AUTH, headers=HEADERS, verify="/etc/ssl/company-ca.pem", timeout=5)</pre>

<div class="eg"><p><b>Worked example.</b> You copy a working call and change only the router address. It returns 401. You compare the two calls: the password in your copy is <code>nk@2026</code>. One letter case. You fix it and the call returns 200. When a copy of a working call fails, diff it against the original before anything else.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Hard-coding real passwords in a script you share; use placeholders in examples and a secret store in real life. (2) Using <code>verify=False</code> in production code. (3) Writing <code>auth="netops","NK@2026"</code> without the brackets. (4) Using the wrong name: it is <code>headers</code> (plural) and <code>auth</code>, not <code>header</code> or <code>login</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> auth is a tuple of username and password (HTTP Basic). headers is a dict. params becomes the query string. verify=False disables TLS certificate validation and is for labs only. timeout is in seconds.</p></div>

<div class="scn"><h4>The warning that hid the risk</h4><p>A script written in a lab used <code>verify=False</code> plus a line that silenced the warning. It was copied into the production monitoring tool unchanged. Months later a security review found that the tool would have accepted any certificate from any device. The fix took five minutes: a CA file path. The review took a week.</p><p><b>Lesson:</b> lab shortcuts must not travel to production. Put a comment at the line, or better, remove it.</p></div>

<div class="iv"><p class="q">"How do you handle self-signed certificates in a Python script?"</p><p>In a throw-away lab I may pass verify=False and silence the warning. In real networks I keep verification on and either use a certificate signed by an internal CA, or point verify to the CA bundle file. Disabling verification removes protection against man-in-the-middle attacks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Call options are named arguments: auth, headers, params, verify, timeout.</li>
<li>auth is a (username, password) tuple; headers is a dictionary.</li>
<li>A 401 is a normal reply, not a Python crash.</li>
<li>verify=False is lab only; use a CA file path in real networks.</li>
<li>Compare a failing copy with the original, character by character.</li>
</ul></div>

`,hi:`

<p>Request sirf URL nahi hoti. Aap requests ko batate ho ki aap kaun ho, kaunsa format chahiye, kaunse extra options lagane hain aur certificate check karna hai ya nahi. Har ek <b>named argument</b> hai: call ke brackets ke andar <code>name=value</code> likhte ho. Kram matter nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="requests call ke knobs, sab name=value ke roop mein."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="30" width="600" height="40" rx="10" fill="#bae6fd"/><text x="310" y="55" text-anchor="middle" class="svg-ink" font-size="14">requests.get( url,  auth=(...),  headers={...},  params={...},  verify=...,  timeout=... )</text><text x="100" y="105" text-anchor="middle" class="svg-accent" font-size="13">auth</text><text x="205" y="105" text-anchor="middle" class="svg-accent" font-size="13">headers</text><text x="320" y="105" text-anchor="middle" class="svg-accent" font-size="13">params</text><text x="420" y="105" text-anchor="middle" class="svg-accent" font-size="13">verify</text><text x="520" y="105" text-anchor="middle" class="svg-accent" font-size="13">timeout</text><text x="100" y="128" text-anchor="middle" class="svg-muted" font-size="11">main kaun</text><text x="205" y="128" text-anchor="middle" class="svg-muted" font-size="11">format, labels</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="11">?depth=1</text><text x="420" y="128" text-anchor="middle" class="svg-muted" font-size="11">certificate check</text><text x="520" y="128" text-anchor="middle" class="svg-muted" font-size="11">itne baad chhodo</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="13">Har ek named argument hai: name=value</text></svg><p class="cap">requests call ke knobs, sab name=value ke roop mein.</p></div>

<h3>auth: aap kaun ho</h3>
<p><code>auth=("netops", "NK@2026")</code> ek <b>tuple</b> hai: gol brackets mein do values, pehle username. requests ise aapke liye Basic Authorization header bana deta hai. Password galat ho to router 401 deta hai aur body wajah batati hai:</p>
<pre class="code">import requests
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
r = requests.get(url, auth=("netops", "nk@2026"))
print(r.status_code)
print(r.text)</pre><pre class="out">AUTO&gt; python3 b.py
<span class="hl">401</span>
{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "access-denied",
<span class="hl">        "error-message": "authentication failed for user \\"netops\\""</span>
      }
    ]
  }
}</pre>
<p>Chalti call se sirf ek farak hai: lower-case <code>nk@2026</code>. Passwords case sensitive hote hain. Dhyan do ki Python crash nahi hua: 401 ek normal reply hai, isliye script aage chalti hai aur use print karti hai. requests network problems par hi error deta hai jab tak aap khud na kahein (chapter 6).</p>

<h3>headers: format aur labels</h3>
<p><code>headers={"Accept": "application/yang-data+json"}</code> ek <b>dictionary</b> hai. Har key header ka naam hai aur value uska content. REST module mein inse mile the: Accept wapas chahiye format ke liye, Content-Type bheje gaye format ke liye.</p>

<h3>params aur verify</h3>
<p><code>params={"depth": 1}</code> aapke liye URL mein query string (<code>?depth=1</code>) jod deta hai, zaroori escaping ke saath. Aur <code>verify</code> certificate checking tay karta hai. Agli script sab use karti hai, aur jo final URL call hua woh print karti hai:</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"), verify=True)
print(r.status_code)
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"), verify=False)
print(r.status_code)
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"), params={"depth": 1})
print(r.status_code, r.url)</pre><pre class="out">AUTO&gt; python3 l.py
200
200
200 h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0</pre>
<p>Padho: pehli call mein <code>verify=True</code> hai (default: certificate check karo); doosri mein <code>verify=False</code> (check mat karo); teesri mein <code>params</code> hai. Is lab mein teeno 200 deti hain kyunki simulated router unhe accept karta hai, aur lab router <code>depth</code> ko ignore karta hai (data chhota nahi karta). Aakhri line bhi dekho: is simulator mein print hue URL mein <code>?depth=1</code> nahi hai, isliye yahan r.url se query string dekhne par bharosa mat karo. Asli device par URL ke end mein <code>?depth=1</code> hota.</p>

<h3>Certificate ka sawaal</h3>
<p>Lab ke routers ke certificates <i>self-signed</i> hote hain jo aapka computer trust nahi karta. Asli requests tab SSL error deta hai. <code>verify=False</code> likhne se error chala jaata hai, aur saath mein router ka naqli roop dharne wale se bachav bhi. To:</p>
<ul>
<li><b>Sirf lab:</b> <code>verify=False</code>, aur warning ko <code>requests.packages.urllib3.disable_warnings()</code> se chup karo, jaisa lab scripts karti hain.</li>
<li><b>Asli network:</b> <code>verify=True</code> rakho aur requests ko apni company CA file ka path do: <code>verify="/path/to/ca.pem"</code>.</li>
</ul>
<p>Reference code (not run in the simulator):</p>
<pre class="code">r = requests.get(url, auth=AUTH, headers=HEADERS, verify="/etc/ssl/company-ca.pem", timeout=5)</pre>

<div class="eg"><p><b>Worked example.</b> Aap chalti call copy karke sirf router address badalte ho. 401 aata hai. Dono calls compare karte ho: aapki copy mein password <code>nk@2026</code> hai. Ek akshar ka case. Theek karte ho aur call 200 deti hai. Chalti call ki copy fail ho to sabse pehle original se diff karo.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Share ki jaane wali script mein asli passwords hard-code karna; examples mein placeholder aur asli mein secret store use karo. (2) Production code mein <code>verify=False</code>. (3) <code>auth="netops","NK@2026"</code> bina brackets ke likhna. (4) Galat naam: <code>headers</code> (plural) aur <code>auth</code> hai, <code>header</code> ya <code>login</code> nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> auth username aur password ka tuple hai (HTTP Basic). headers dict hai. params query string banta hai. verify=False TLS certificate validation band karta hai aur sirf lab ke liye hai. timeout seconds mein hota hai.</p></div>

<div class="scn"><h4>Warning jisne risk chhupaya</h4><p>Lab mein likhi script ne <code>verify=False</code> aur warning chup karne wali line use ki. Use jyon ka tyon production monitoring tool mein copy kar diya gaya. Mahino baad security review ne paaya ki tool kisi bhi device ka koi bhi certificate accept kar leta. Fix paanch minute ka tha: ek CA file path. Review mein ek hafta laga.</p><p><b>Lesson:</b> lab ke shortcuts production tak nahi jaane chahiye. Us line par comment rakho, ya behtar, hata do.</p></div>

<div class="iv"><p class="q">"Python script mein self-signed certificates ko kaise sambhalte ho?"</p><p>Throw-away lab mein verify=False de sakta hoon aur warning chup kar sakta hoon. Asli networks mein verification on rakhta hoon aur ya to internal CA ka signed certificate use karta hoon, ya verify ko CA bundle file par point karta hoon. Verification band karne se man-in-the-middle se bachav hat jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Call options named arguments hain: auth, headers, params, verify, timeout.</li>
<li>auth (username, password) tuple hai; headers dictionary hai.</li>
<li>401 normal reply hai, Python crash nahi.</li>
<li>verify=False sirf lab ke liye; asli networks mein CA file path.</li>
<li>Fail hoti copy ko original se akshar-akshar compare karo.</li>
</ul></div>

`}};export{e as default};