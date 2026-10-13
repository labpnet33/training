var e={id:`nxapi`,h:{en:`NX-API: CLI and REST (DME) access to Nexus switches`,hi:`NX-API: Nexus switches tak CLI aur REST (DME) access`},body:{en:`
<p>Think of a bank. You can walk to the counter and chat with the cashier (the CLI over SSH), or you can fill in a standard deposit slip and drop it in a machine that returns a printed receipt (an API). The machine does not care who you are beyond your card and PIN, it never misreads handwriting, and it can serve thousands of slips an hour. <b>NX-API</b> is that machine for Nexus switches: a web service on the switch that accepts requests in JSON or XML and returns structured answers.</p>

<h3>Turning NX-API on</h3>
<pre class="code">LEAF1(config)# feature nxapi
<span class="c">! HTTPS on TCP 443 is enabled by default when the feature starts</span>
LEAF1(config)# nxapi h&#116;tp port 80
<span class="c">! adds plain HTTP on port 80: lab only, credentials travel unencrypted</span>
LEAF1(config)# nxapi use-vrf management
<span class="c">! optional: listen only in the management VRF</span>
LEAF1(config)# nxapi sandbox
<span class="c">! optional: the Developer Sandbox web page</span></pre>
<pre class="out">LEAF1# show nxapi
nxapi enabled
NXAPI timeout 10
<span class="hl">HTTP Listen on port 80</span>
HTTPS Listen on port 443
Certificate Information: ...</pre>
<p>The port command is rejected until <code>feature nxapi</code> is on; this is exactly Lab 1, task 2. The <b>sandbox</b> is a browser page on the switch where you type a CLI command, pick a message format and see the request, the response and even generated Python code. It is the fastest way to learn the payload format.</p>

<h3>NX-API CLI: sending CLI commands inside JSON</h3>
<p>The first flavour, <b>NX-API CLI</b>, wraps ordinary CLI commands in a JSON (or XML, or JSON-RPC) envelope and POSTs it to the <code>/ins</code> endpoint on the switch. The important fields are:</p>
<dl class="terms">
<dt>type</dt><dd><code>cli_show</code> returns structured JSON (like <code>| json</code>); <code>cli_show_ascii</code> returns the plain text; <code>cli_conf</code> runs configuration commands; <code>bash</code> runs a Bash command (needs <code>feature bash-shell</code>).</dd>
<dt>input</dt><dd>The command. Several commands go in one request separated by " ;", for example <code>interface Ethernet1/5 ;description WEB-01</code>.</dd>
<dt>output_format</dt><dd><code>json</code> or <code>xml</code>.</dd>
<dt>chunk and sid</dt><dd>For very large outputs; "0" and "1" are normal for small requests.</dd>
</dl>
<pre class="code">{
  "ins_api": {
    "version": "1.0",
    "type": "cli_show",
    "chunk": "0",
    "sid": "1",
    "input": "show vlan brief",
    "output_format": "json"
  }
}</pre>
<p>The response wraps the same TABLE and ROW data you met in the previous chapter:</p>
<pre class="out">{ "ins_api": { "type": "cli_show", "version": "1.0", "sid": "eoc",
  "outputs": { "output": {
      "input": "show vlan brief", <span class="hl">"code": "200", "msg": "Success",</span>
      "body": { "TABLE_vlanbriefxbrief": { "ROW_vlanbriefxbrief": [ ...
          { "vlanshowbr-vlanid": 30, <span class="hl">"vlanshowbr-vlanname": "APP"</span>, ... } ] } } } } } }</pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NX-API request and response">
<rect x="10" y="60" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="75" y="82" text-anchor="middle" class="svg-ink" font-size="13">DEVBOX</text><text x="75" y="100" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.50</text>
<rect x="250" y="60" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">NX-API /ins</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">auth + RBAC role</text>
<rect x="500" y="60" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="82" text-anchor="middle" class="svg-ink" font-size="13">NX-OS CLI</text><text x="565" y="100" text-anchor="middle" class="svg-muted" font-size="12">LEAF1</text>
<line x1="140" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="140" y1="97" x2="250" y2="97" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="195" y="50" text-anchor="middle" class="svg-accent" font-size="12">POST JSON</text>
<text x="195" y="130" text-anchor="middle" class="svg-accent" font-size="12">JSON reply</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">the command runs with the caller's role</text>
</svg><p class="cap">NX-API authenticates the caller, runs the command with that user's permissions and returns structured data.</p></div>

<h3>Authentication and permissions</h3>
<p>NX-API uses the switch's normal users (local or AAA). The first request carries a username and password (basic authentication); the switch replies with a session cookie called <code>nxapi_auth</code> that later requests can reuse, so the password is not checked on every call. Every request runs <b>with the role of the authenticated user</b>. A network-operator account can use <code>cli_show</code>, but a <code>cli_conf</code> request fails with a permission error. That is why automation service accounts should get a custom role with only what they need.</p>

<h3>Doing it in Lab 1</h3>
<p>On DEVBOX the lab provides a small command-line client called <code>rest</code>; the task hint gives the full command. It POSTs the body above to the <code>/ins</code> endpoint on 10.10.10.1 as admin. In the JSON reply, find the row where <code>vlanshowbr-vlanid</code> is 30 and read its <code>vlanshowbr-vlanname</code>: <b>APP</b>. Finally run <code>copy running-config startup-config</code> so the NX-API settings survive a reload.</p>

<h3>The same call in Python</h3>
<p>The scheme and address are kept as variables (read from the environment), so the script never hard-codes where it connects or with which password.</p>
<pre class="code">import os
import requests

host = '10.10.10.1'
port = 443
scheme = os.environ['NX_SCHEME']          <span class="c"># the secure web scheme, set outside the script</span>
url = scheme + '://' + host + ':' + str(port) + '/ins'

payload = {'ins_api': {'version': '1.0', 'type': 'cli_show', 'chunk': '0',
                       'sid': '1', 'input': 'show vlan brief', 'output_format': 'json'}}

r = requests.post(url, json=payload, auth=('admin', os.environ['NX_PASS']),
                  verify='lab-ca.pem', timeout=10)
body = r.json()['ins_api']['outputs']['output']['body']
for row in body['TABLE_vlanbriefxbrief']['ROW_vlanbriefxbrief']:
    print(row['vlanshowbr-vlanid'], row['vlanshowbr-vlanname'])</pre>

<h3>NX-API REST: the object model (DME)</h3>
<p>The second flavour does not send CLI at all. Internally, NX-OS stores its configuration and state in the <b>DME</b> (Data Management Engine) as a tree of <b>managed objects</b>, the same idea used by ACI. Each object has a <b>class</b> (its type) and a <b>distinguished name (DN)</b>, its unique path in the tree. For example, interface Ethernet1/5 is DN <code>sys/intf/phys-[eth1/5]</code> of class <code>l1PhysIf</code>, and VLAN 10 is <code>sys/bd/bd-[vlan-10]</code> of class <code>l2BD</code>.</p>
<table class="cmp"><tr><th>Action</th><th>Request (path on the switch)</th></tr>
<tr><td>Log in, get a token</td><td>POST <code>/api/aaaLogin.json</code> with the user name and password</td></tr>
<tr><td>Read one object</td><td>GET <code>/api/mo/sys/intf/phys-[eth1/5].json</code></td></tr>
<tr><td>Read all objects of a class</td><td>GET <code>/api/class/l1PhysIf.json</code></td></tr>
<tr><td>Configure</td><td>POST the object's JSON to <code>/api/mo/sys.json</code></td></tr>
</table>
<p>NX-API REST is model-driven: you change attributes such as <code>adminSt</code> or <code>descr</code> directly, which is faster and more precise than CLI text and is what controllers and the Terraform NX-OS provider use. <b>Visore</b>, the object browser on the switch, helps you explore DNs and classes.</p>

<div class="eg"><p><b>Worked example.</b> An audit needs the MTU of every interface on 60 leaves. With NX-API CLI, a script sends <code>show interface | json</code> and walks <code>TABLE_interface</code>. With NX-API REST it sends one GET for class <code>l1PhysIf</code> per switch and reads the <code>mtu</code> attribute of each object. 60 requests, one per switch, finish in seconds; the result is a table of 60 x 54 = 3,240 interfaces sorted in a spreadsheet.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving port 80 enabled in production. Using the admin account in scripts instead of a least-privilege service account. Forgetting that <code>cli_show_ascii</code> gives text, so the script cannot index into it. Disabling certificate checks permanently instead of trusting the switch's certificate or installing a proper one.</p></div>
<div class="exam"><p><b>Exam trap.</b> NX-API is enabled with <code>feature nxapi</code>, listens on HTTPS 443 by default, and the CLI endpoint is <code>/ins</code>. <code>cli_show</code> = structured, <code>cli_show_ascii</code> = text, <code>cli_conf</code> = configuration. NX-API REST uses the DME object model (DN and class), like ACI.</p></div>

<div class="scn"><h4>The monitoring script that suddenly got "permission denied"</h4><p>A NOC script read interface counters from 80 leaves over NX-API every five minutes. After a security project moved switch logins to TACACS+, the script started failing only on configuration pushes it made at night. The engineer checked the response and saw an error code instead of "Success" for the <code>cli_conf</code> calls. The service account's TACACS+ profile now returned the network-operator role, which can read but not configure. The team created a custom role that allowed only the interface description commands the script needed, mapped the service account to it, and the night jobs worked again.</p><p><b>Lesson:</b> NX-API calls run with the caller's RBAC role; design service accounts with exactly the rights the automation needs.</p></div>

<div class="iv"><p class="q">"Explain NX-API CLI versus NX-API REST."</p><p>Strong answer: NX-API CLI sends CLI commands in a JSON, JSON-RPC or XML envelope to <code>/ins</code> and returns structured output; types are cli_show, cli_show_ascii and cli_conf. NX-API REST is model-driven, working on DME managed objects identified by DN and class, with aaaLogin, mo and class queries, just like the APIC. Mention <code>feature nxapi</code>, HTTPS 443, the sandbox, cookie-based sessions and that RBAC applies to every call.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>feature nxapi</code> starts NX-API on HTTPS 443; plain HTTP on port 80 is lab only; <code>show nxapi</code> verifies.</li>
<li>NX-API CLI: POST to <code>/ins</code> with type cli_show, cli_show_ascii or cli_conf.</li>
<li>Responses contain code, msg and body; body holds the TABLE and ROW data.</li>
<li>Each call runs with the authenticated user's role; use least-privilege service accounts.</li>
<li>NX-API REST works on DME objects (DN, class) with aaaLogin, mo and class requests.</li>
</ul></div>
`,hi:`
<p>Ek bank ke baare mein socho. Aap counter par jaa kar cashier se baat kar sakte ho (SSH par CLI), ya ek standard deposit slip bhar kar ek machine mein daal sakte ho jo printed receipt wapas deti hai (API). Machine ko aapke card aur PIN ke alawa kuch farak nahi padta, woh kabhi handwriting galat nahi padhti, aur ghante mein hazaaron slips handle kar sakti hai. <b>NX-API</b> Nexus switches ke liye wahi machine hai: switch par ek web service jo JSON ya XML mein requests leti hai aur structured answers deti hai.</p>

<h3>NX-API on karna</h3>
<pre class="code">LEAF1(config)# feature nxapi
<span class="c">! feature start hote hi TCP 443 par HTTPS default mein enable hota hai</span>
LEAF1(config)# nxapi h&#116;tp port 80
<span class="c">! port 80 par plain HTTP jodta hai: sirf lab, credentials bina encryption ke jaate hain</span>
LEAF1(config)# nxapi use-vrf management
<span class="c">! optional: sirf management VRF mein suno</span>
LEAF1(config)# nxapi sandbox
<span class="c">! optional: Developer Sandbox web page</span></pre>
<pre class="out">LEAF1# show nxapi
nxapi enabled
NXAPI timeout 10
<span class="hl">HTTP Listen on port 80</span>
HTTPS Listen on port 443
Certificate Information: ...</pre>
<p>Port command tab tak reject hota hai jab tak <code>feature nxapi</code> on na ho; yahi bilkul Lab 1, task 2 hai. <b>Sandbox</b> switch par ek browser page hai jahan aap CLI command type karte ho, message format choose karte ho aur request, response aur generated Python code tak dekhte ho. Payload format seekhne ka yeh sabse tez tareeka hai.</p>

<h3>NX-API CLI: JSON ke andar CLI commands bhejna</h3>
<p>Pehla flavour, <b>NX-API CLI</b>, normal CLI commands ko JSON (ya XML, ya JSON-RPC) envelope mein lapet kar switch ke <code>/ins</code> endpoint par POST karta hai. Zaroori fields yeh hain:</p>
<dl class="terms">
<dt>type</dt><dd><code>cli_show</code> structured JSON deta hai (<code>| json</code> jaisa); <code>cli_show_ascii</code> plain text deta hai; <code>cli_conf</code> configuration commands chalata hai; <code>bash</code> Bash command chalata hai (<code>feature bash-shell</code> chahiye).</dd>
<dt>input</dt><dd>Command. Ek request mein kai commands " ;" se alag karke jaate hain, jaise <code>interface Ethernet1/5 ;description WEB-01</code>.</dd>
<dt>output_format</dt><dd><code>json</code> ya <code>xml</code>.</dd>
<dt>chunk aur sid</dt><dd>Bahut bade outputs ke liye; chhoti requests ke liye "0" aur "1" normal hain.</dd>
</dl>
<pre class="code">{
  "ins_api": {
    "version": "1.0",
    "type": "cli_show",
    "chunk": "0",
    "sid": "1",
    "input": "show vlan brief",
    "output_format": "json"
  }
}</pre>
<p>Response wahi TABLE aur ROW data lapet kar deta hai jo aapne pichhle chapter mein dekha:</p>
<pre class="out">{ "ins_api": { "type": "cli_show", "version": "1.0", "sid": "eoc",
  "outputs": { "output": {
      "input": "show vlan brief", <span class="hl">"code": "200", "msg": "Success",</span>
      "body": { "TABLE_vlanbriefxbrief": { "ROW_vlanbriefxbrief": [ ...
          { "vlanshowbr-vlanid": 30, <span class="hl">"vlanshowbr-vlanname": "APP"</span>, ... } ] } } } } } }</pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NX-API request aur response">
<rect x="10" y="60" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="75" y="82" text-anchor="middle" class="svg-ink" font-size="13">DEVBOX</text><text x="75" y="100" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.50</text>
<rect x="250" y="60" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">NX-API /ins</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">auth + RBAC role</text>
<rect x="500" y="60" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="82" text-anchor="middle" class="svg-ink" font-size="13">NX-OS CLI</text><text x="565" y="100" text-anchor="middle" class="svg-muted" font-size="12">LEAF1</text>
<line x1="140" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="140" y1="97" x2="250" y2="97" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="195" y="50" text-anchor="middle" class="svg-accent" font-size="12">POST JSON</text>
<text x="195" y="130" text-anchor="middle" class="svg-accent" font-size="12">JSON reply</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">command caller ke role se chalta hai</text>
</svg><p class="cap">NX-API caller ko authenticate karta hai, command us user ki permissions se chalata hai aur structured data wapas deta hai.</p></div>

<h3>Authentication aur permissions</h3>
<p>NX-API switch ke normal users (local ya AAA) use karta hai. Pehli request username aur password le jaati hai (basic authentication); switch <code>nxapi_auth</code> naam ki session cookie ke saath reply karta hai jise baad ki requests reuse kar sakti hain, isliye har call par password check nahi hota. Har request <b>authenticated user ke role</b> se chalti hai. Network-operator account <code>cli_show</code> use kar sakta hai, lekin <code>cli_conf</code> request permission error ke saath fail hoti hai. Isiliye automation service accounts ko custom role do jismein sirf utna ho jitna chahiye.</p>

<h3>Lab 1 mein yeh karna</h3>
<p>DEVBOX par lab ek chhota command-line client deta hai jiska naam <code>rest</code> hai; task hint poora command deta hai. Yeh upar wali body ko 10.10.10.1 ke <code>/ins</code> endpoint par admin ke roop mein POST karta hai. JSON reply mein woh row dhoondho jahan <code>vlanshowbr-vlanid</code> 30 hai aur uska <code>vlanshowbr-vlanname</code> padho: <b>APP</b>. Aakhir mein <code>copy running-config startup-config</code> chalao taaki NX-API settings reload ke baad bhi rahein.</p>

<h3>Wahi call Python mein</h3>
<p>Scheme aur address variables mein rakhe gaye hain (environment se padhe jaate hain), taaki script kabhi hard-code na kare ki kahan connect karna hai ya kaunse password se.</p>
<pre class="code">import os
import requests

host = '10.10.10.1'
port = 443
scheme = os.environ['NX_SCHEME']          <span class="c"># secure web scheme, script ke bahar set hota hai</span>
url = scheme + '://' + host + ':' + str(port) + '/ins'

payload = {'ins_api': {'version': '1.0', 'type': 'cli_show', 'chunk': '0',
                       'sid': '1', 'input': 'show vlan brief', 'output_format': 'json'}}

r = requests.post(url, json=payload, auth=('admin', os.environ['NX_PASS']),
                  verify='lab-ca.pem', timeout=10)
body = r.json()['ins_api']['outputs']['output']['body']
for row in body['TABLE_vlanbriefxbrief']['ROW_vlanbriefxbrief']:
    print(row['vlanshowbr-vlanid'], row['vlanshowbr-vlanname'])</pre>

<h3>NX-API REST: object model (DME)</h3>
<p>Dusra flavour CLI bhejta hi nahi. Andar se NX-OS apna configuration aur state <b>DME</b> (Data Management Engine) mein <b>managed objects</b> ke tree ki tarah rakhta hai, wahi idea jo ACI use karta hai. Har object ki ek <b>class</b> (uska type) aur ek <b>distinguished name (DN)</b> hota hai, tree mein uska unique path. Jaise interface Ethernet1/5 DN <code>sys/intf/phys-[eth1/5]</code> hai jiski class <code>l1PhysIf</code> hai, aur VLAN 10 <code>sys/bd/bd-[vlan-10]</code> hai jiski class <code>l2BD</code> hai.</p>
<table class="cmp"><tr><th>Action</th><th>Request (switch par path)</th></tr>
<tr><td>Login, token lo</td><td>User name aur password ke saath POST <code>/api/aaaLogin.json</code></td></tr>
<tr><td>Ek object padho</td><td>GET <code>/api/mo/sys/intf/phys-[eth1/5].json</code></td></tr>
<tr><td>Ek class ke saare objects padho</td><td>GET <code>/api/class/l1PhysIf.json</code></td></tr>
<tr><td>Configure karo</td><td>Object ka JSON <code>/api/mo/sys.json</code> par POST karo</td></tr>
</table>
<p>NX-API REST model-driven hai: aap <code>adminSt</code> ya <code>descr</code> jaise attributes seedhe badalte ho, jo CLI text se tez aur zyada precise hai, aur yahi controllers aur Terraform NX-OS provider use karte hain. <b>Visore</b>, switch par object browser, DNs aur classes explore karne mein madad karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Audit ko 60 leaves ke har interface ka MTU chahiye. NX-API CLI ke saath script <code>show interface | json</code> bhejti hai aur <code>TABLE_interface</code> mein ghoomti hai. NX-API REST ke saath woh har switch par class <code>l1PhysIf</code> ke liye ek GET bhejti hai aur har object ka <code>mtu</code> attribute padhti hai. 60 requests, har switch ke liye ek, seconds mein khatam; result 60 x 54 = 3,240 interfaces ki table hai jo spreadsheet mein sort hoti hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Production mein port 80 enabled chhod dena. Scripts mein least-privilege service account ki jagah admin account use karna. Bhool jaana ki <code>cli_show_ascii</code> text deta hai, isliye script usmein index nahi kar sakti. Switch ka certificate trust karne ya sahi certificate install karne ki jagah certificate checks hamesha ke liye band kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> NX-API <code>feature nxapi</code> se enable hota hai, default mein HTTPS 443 par sunta hai, aur CLI endpoint <code>/ins</code> hai. <code>cli_show</code> = structured, <code>cli_show_ascii</code> = text, <code>cli_conf</code> = configuration. NX-API REST DME object model (DN aur class) use karta hai, ACI jaisa.</p></div>

<div class="scn"><h4>Monitoring script ko achanak "permission denied" milne laga</h4><p>Ek NOC script har paanch minute NX-API se 80 leaves ke interface counters padhti thi. Jab security project ne switch logins ko TACACS+ par shift kiya, script sirf raat ko kiye configuration pushes par fail hone lagi. Engineer ne response check kiya aur <code>cli_conf</code> calls ke liye "Success" ki jagah error code dekha. Service account ka TACACS+ profile ab network-operator role return kar raha tha, jo padh sakta hai lekin configure nahi kar sakta. Team ne ek custom role banaya jo sirf woh interface description commands allow karta tha jo script ko chahiye the, service account ko usse map kiya, aur raat ke jobs phir chalne lage.</p><p><b>Seekh:</b> NX-API calls caller ke RBAC role se chalti hain; service accounts ko bilkul utne rights do jitne automation ko chahiye.</p></div>

<div class="iv"><p class="q">"NX-API CLI versus NX-API REST samjhao."</p><p>Strong answer: NX-API CLI CLI commands ko JSON, JSON-RPC ya XML envelope mein <code>/ins</code> par bhejta hai aur structured output deta hai; types cli_show, cli_show_ascii aur cli_conf hain. NX-API REST model-driven hai, DME managed objects par kaam karta hai jo DN aur class se pehchane jaate hain, aaaLogin, mo aur class queries ke saath, bilkul APIC jaisa. <code>feature nxapi</code>, HTTPS 443, sandbox, cookie-based sessions aur yeh ki har call par RBAC lagta hai, zaroor batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>feature nxapi</code> NX-API ko HTTPS 443 par start karta hai; port 80 par plain HTTP sirf lab ke liye; <code>show nxapi</code> verify karta hai.</li>
<li>NX-API CLI: type cli_show, cli_show_ascii ya cli_conf ke saath <code>/ins</code> par POST.</li>
<li>Responses mein code, msg aur body hote hain; body mein TABLE aur ROW data hota hai.</li>
<li>Har call authenticated user ke role se chalti hai; least-privilege service accounts use karo.</li>
<li>NX-API REST DME objects (DN, class) par aaaLogin, mo aur class requests ke saath kaam karta hai.</li>
</ul></div>
`}};export{e as default};