var e={id:`first-call`,h:{en:`Your first API call: switch RESTCONF on and read the answer`,hi:`Aapki pehli API call: RESTCONF on karo aur jawab padho`},body:{en:`

<p>Before you can call an API, the device must offer one. In this chapter you switch on the RESTCONF API of R1, make the very first call and learn to read the answer. This is Lab 1 of the module.</p>

<h3>Step 0: the door is closed</h3>
<p>R1 starts with no web server. A request from the AUTO host is refused at once, because nothing listens on TCP port 443:</p>
<pre class="out">AUTO&gt; rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces -u apiuser:Api@2026
<span class="hl">rest: (7) Failed to connect to 10.99.0.1 port 443 after 4 ms: Connection refused</span></pre>
<p>"Connection refused" is not a login problem. It means no service answers on that port. Compare with SSH in the previous module: a timeout or refusal always means the service is not there; an authentication message means the service is there but you are not welcome.</p>

<h3>Step 1: switch the API on</h3>
<p>On R1 in configuration mode, type these four lines. Each one is a separate building block:</p>
<pre class="code">username apiuser privilege 15 secret Api@2026
ip h&#116;tp secure-server
ip h&#116;tp authentication local
restconf</pre>
<ul>
<li><code>username apiuser privilege 15 secret Api@2026</code>: a local account for the API. Privilege 15 is required by RESTCONF on IOS XE. In real life, give automation its own account, never share a person's.</li>
<li><code>ip h&#116;tp secure-server</code>: starts the <b>HTTPS</b> server on TCP 443. The plain HTTP server on port 80 stays off, which is what you want for a management API.</li>
<li><code>ip h&#116;tp authentication local</code>: checks logins against the local usernames.</li>
<li><code>restconf</code>: turns the RESTCONF module on inside that web server.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Four lines switch the API on: a user, the HTTPS server, local authentication and RESTCONF."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="50" width="130" height="70" rx="10" fill="#fde68a"/><text x="75" y="82" text-anchor="middle" class="svg-ink" font-size="14">apiuser</text><text x="75" y="100" text-anchor="middle" class="svg-muted" font-size="12">a local user</text><rect x="185" y="50" width="130" height="70" rx="10" fill="#bae6fd"/><text x="250" y="82" text-anchor="middle" class="svg-ink" font-size="14">HTTPS server</text><text x="250" y="100" text-anchor="middle" class="svg-muted" font-size="12">TCP 443</text><rect x="360" y="50" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="425" y="82" text-anchor="middle" class="svg-ink" font-size="14">RESTCONF</text><text x="425" y="100" text-anchor="middle" class="svg-muted" font-size="12">the API module</text><rect x="535" y="50" width="95" height="70" rx="10" fill="#ddd6fe"/><text x="582.5" y="82" text-anchor="middle" class="svg-ink" font-size="14">YANG</text><text x="582.5" y="100" text-anchor="middle" class="svg-muted" font-size="12">the data</text><line x1="140" y1="85" x2="185" y2="85" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="315" y1="85" x2="360" y2="85" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="490" y1="85" x2="535" y2="85" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="75" y="150" text-anchor="middle" class="svg-accent" font-size="12">username ...</text><text x="250" y="150" text-anchor="middle" class="svg-accent" font-size="12">ip h&#116;tp secure-server</text><text x="425" y="150" text-anchor="middle" class="svg-accent" font-size="12">restconf</text></svg><p class="cap">Four lines switch the API on: a user, the HTTPS server, local authentication and RESTCONF.</p></div>
<p>Verify on the router before you go back to the host:</p>
<pre class="out">R1# show ip h&#116;tp server status
HTTP server status: Disabled
HTTP server port: 80
HTTP server active supplementary listener ports:
HTTP server authentication method: local
HTTP secure server capability: Present
<span class="hl">HTTP secure server status: Enabled</span>
HTTP secure server port: 443
HTTP secure server ciphersuite: aes-128-cbc-sha aes-256-cbc-sha ecdhe-rsa-aes-128-gcm-sha256
HTTP secure server trustpoint: TP-self-signed-201608140
HTTP server application session modules:
 Session module Name  Handle Status   Secure-status  Description
<span class="hl"> restconf           5      Active   Active         RESTCONF (YANG over HTTPS)</span></pre>
<p>Read two lines: <code>HTTP secure server status: Enabled</code> and the session module <code>restconf ... Active</code>. If the second is missing, the API is off even though the web server is on. The line <code>HTTP server status: Disabled</code> is good: only HTTPS is open.</p>

<h3>Step 2: the first GET</h3>
<p>Now repeat the call from the host. GET means "give me this data". The <code>-u</code> option sends the username and password:</p>
<pre class="out">AUTO&gt; rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces -u apiuser:Api@2026
<span class="hl">HTTP/1.1 200 OK</span>
<span class="hl">Content-Type: application/yang-data+json</span>
ETag: "1kp2ynt"

{
  "ietf-interfaces:interfaces": {
    "interface": [
      {
<span class="hl">        "name": "GigabitEthernet0/0",</span>
        "description": "MGMT-LAN",
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": true,
        "ietf-ip:ipv4": {
          "address": [
            {
              "ip": "10.99.0.1",
              "netmask": "255.255.255.0"
            }
          ]
        },
        "ietf-ip:ipv6": {},
        "oper-status": "up",
        "phys-address": "52:54:0c:04:4b:01",
        "statistics": {
   ... (the list continues with Gi0/1, Gi0/2, Gi0/3 and Loopback0)</pre>
<p>This is a real response. Read it in three parts:</p>
<ol>
<li><b>The status line</b> <code>HTTP/1.1 200 OK</code>: the protocol version, the status code (200) and its reason phrase (OK). 200 means success and that the data is in the body.</li>
<li><b>The headers</b> up to the empty line, such as <code>Content-Type: application/yang-data+json</code>: "the body is JSON". Other headers (server name, date, caching rules) are left out here to save space.</li>
<li><b>The body</b>, after the empty line: JSON text. The outermost braces hold one key, <code>"ietf-interfaces:interfaces"</code>, which holds a list <code>"interface": [ ... ]</code> of interface objects.</li>
</ol>

<h3>Step 3: read the data</h3>
<p>Each interface in the list is an object between braces with named fields. For GigabitEthernet0/0 you can read <code>"description": "MGMT-LAN"</code>, <code>"enabled": true</code> (the admin setting) and the address under <code>"ietf-ip:ipv4"</code>. Further down in the same reply, the object whose <code>"name"</code> is <code>GigabitEthernet0/1</code> has <code>"description": "OLD-LINK"</code>:</p><pre class="out">...
      {
        "name": "GigabitEthernet0/1",
<span class="hl">        "description": "OLD-LINK",</span>
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": true,
...</pre><p>Notice the difference between <code>"enabled"</code> (what an engineer configured) and <code>"oper-status"</code> (what the interface is really doing). That is the same difference as "administratively down" and "down" in <code>show ip interface brief</code>.</p>

<div class="eg"><p><b>Worked example.</b> Your manager asks: "Which interface carries the old link description?" You send one GET, search the JSON for <code>OLD-LINK</code>, and read the <code>"name"</code> in the same braces: GigabitEthernet0/1. No screen scraping, and a program could do the same search on 500 routers.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Forgetting <code>restconf</code>, so the HTTPS server answers but the API path returns 404. (2) Using a user with privilege lower than 15. (3) Typing <code>h&#116;tp</code> instead of <code>h&#116;tps</code> in the URL; the server listens on 443 only. (4) Treating "Connection refused" as a wrong password.</p></div>
<div class="exam"><p><b>Exam trap.</b> The four pieces for RESTCONF on IOS XE: a privilege-15 user, <code>ip h&#116;tp secure-server</code>, an authentication method for the web server, and <code>restconf</code>. RESTCONF requires HTTPS; its default root is <code>/restconf</code>.</p></div>

<div class="scn"><h4>The API that answered everyone</h4><p>An engineer enabled <code>ip h&#116;tp server</code> and <code>ip h&#116;tp secure-server</code> with <code>ip h&#116;tp authentication local</code> on an edge router, and gave the API user a weak password. A scan from the Internet found port 80 and 443 open on the management address. Nothing was stolen, but the audit failed. The fix: HTTPS only, an access class that allows the management subnet only, a strong secret and a dedicated API user.</p><p><b>Lesson:</b> enabling an API opens a new door. Lock it the moment you open it.</p></div>

<div class="iv"><p class="q">"What do you enable on a Cisco IOS XE router to use RESTCONF?"</p><p>A local user with privilege 15 (or AAA), <code>ip h&#116;tp secure-server</code> for HTTPS, an authentication method such as <code>ip h&#116;tp authentication local</code>, and the <code>restconf</code> command. Then I verify with <code>show ip h&#116;tp server status</code> and one GET. I would restrict access to the management network and use certificates that clients can verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>"Connection refused" means no service is listening, not a bad password.</li>
<li>Four lines enable RESTCONF: user, <code>ip h&#116;tp secure-server</code>, <code>ip h&#116;tp authentication local</code>, <code>restconf</code>.</li>
<li>A response has a status line, headers, an empty line and a body.</li>
<li>200 OK means success; the JSON body holds a list under <code>interface</code>.</li>
<li><code>enabled</code> is configuration; <code>oper-status</code> is reality.</li>
</ul></div>

`,hi:`

<p>API call karne se pehle device ko ek API offer karni padti hai. Is chapter mein aap R1 ki RESTCONF API on karoge, bilkul pehli call karoge aur jawab padhna seekhoge. Yeh module ka Lab 1 hai.</p>

<h3>Step 0: darwaza band hai</h3>
<p>R1 shuru mein bina web server ke hai. AUTO host se request turant refuse ho jaati hai, kyunki TCP port 443 par kuch sun nahi raha:</p>
<pre class="out">AUTO&gt; rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces -u apiuser:Api@2026
<span class="hl">rest: (7) Failed to connect to 10.99.0.1 port 443 after 4 ms: Connection refused</span></pre>
<p>"Connection refused" login ki problem nahi hai. Matlab us port par koi service jawab nahi deti. Pichhle module ke SSH se compare karo: timeout ya refusal ka matlab hamesha service wahan nahi hai; authentication message ka matlab service hai par aapka swagat nahi.</p>

<h3>Step 1: API on karo</h3>
<p>R1 par configuration mode mein yeh chaar lines type karo. Har ek alag building block hai:</p>
<pre class="code">username apiuser privilege 15 secret Api@2026
ip h&#116;tp secure-server
ip h&#116;tp authentication local
restconf</pre>
<ul>
<li><code>username apiuser privilege 15 secret Api@2026</code>: API ke liye local account. IOS XE par RESTCONF ko privilege 15 chahiye. Asli zindagi mein automation ko apna alag account do, kisi insaan ka account share mat karo.</li>
<li><code>ip h&#116;tp secure-server</code>: TCP 443 par <b>HTTPS</b> server start karta hai. Port 80 ka plain HTTP server band rehta hai, jo management API ke liye aap chahte ho.</li>
<li><code>ip h&#116;tp authentication local</code>: logins ko local usernames se check karta hai.</li>
<li><code>restconf</code>: us web server ke andar RESTCONF module on karta hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Chaar lines API on karti hain: ek user, HTTPS server, local authentication aur RESTCONF."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="50" width="130" height="70" rx="10" fill="#fde68a"/><text x="75" y="82" text-anchor="middle" class="svg-ink" font-size="14">apiuser</text><text x="75" y="100" text-anchor="middle" class="svg-muted" font-size="12">ek local user</text><rect x="185" y="50" width="130" height="70" rx="10" fill="#bae6fd"/><text x="250" y="82" text-anchor="middle" class="svg-ink" font-size="14">HTTPS server</text><text x="250" y="100" text-anchor="middle" class="svg-muted" font-size="12">TCP 443</text><rect x="360" y="50" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="425" y="82" text-anchor="middle" class="svg-ink" font-size="14">RESTCONF</text><text x="425" y="100" text-anchor="middle" class="svg-muted" font-size="12">API module</text><rect x="535" y="50" width="95" height="70" rx="10" fill="#ddd6fe"/><text x="582.5" y="82" text-anchor="middle" class="svg-ink" font-size="14">YANG</text><text x="582.5" y="100" text-anchor="middle" class="svg-muted" font-size="12">data</text><line x1="140" y1="85" x2="185" y2="85" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="315" y1="85" x2="360" y2="85" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="490" y1="85" x2="535" y2="85" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="75" y="150" text-anchor="middle" class="svg-accent" font-size="12">username ...</text><text x="250" y="150" text-anchor="middle" class="svg-accent" font-size="12">ip h&#116;tp secure-server</text><text x="425" y="150" text-anchor="middle" class="svg-accent" font-size="12">restconf</text></svg><p class="cap">Chaar lines API on karti hain: ek user, HTTPS server, local authentication aur RESTCONF.</p></div>
<p>Host par wapas jaane se pehle router par verify karo:</p>
<pre class="out">R1# show ip h&#116;tp server status
HTTP server status: Disabled
HTTP server port: 80
HTTP server active supplementary listener ports:
HTTP server authentication method: local
HTTP secure server capability: Present
<span class="hl">HTTP secure server status: Enabled</span>
HTTP secure server port: 443
HTTP secure server ciphersuite: aes-128-cbc-sha aes-256-cbc-sha ecdhe-rsa-aes-128-gcm-sha256
HTTP secure server trustpoint: TP-self-signed-201608140
HTTP server application session modules:
 Session module Name  Handle Status   Secure-status  Description
<span class="hl"> restconf           5      Active   Active         RESTCONF (YANG over HTTPS)</span></pre>
<p>Do lines padho: <code>HTTP secure server status: Enabled</code> aur session module <code>restconf ... Active</code>. Doosri na ho to web server on hone par bhi API off hai. <code>HTTP server status: Disabled</code> achhi baat hai: sirf HTTPS khula hai.</p>

<h3>Step 2: pehla GET</h3>
<p>Ab host se call dohrao. GET ka matlab "yeh data do". <code>-u</code> option username aur password bhejta hai:</p>
<pre class="out">AUTO&gt; rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces -u apiuser:Api@2026
<span class="hl">HTTP/1.1 200 OK</span>
<span class="hl">Content-Type: application/yang-data+json</span>
ETag: "1kp2ynt"

{
  "ietf-interfaces:interfaces": {
    "interface": [
      {
<span class="hl">        "name": "GigabitEthernet0/0",</span>
        "description": "MGMT-LAN",
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": true,
        "ietf-ip:ipv4": {
          "address": [
            {
              "ip": "10.99.0.1",
              "netmask": "255.255.255.0"
            }
          ]
        },
        "ietf-ip:ipv6": {},
        "oper-status": "up",
        "phys-address": "52:54:0c:04:4b:01",
        "statistics": {
   ... (the list continues with Gi0/1, Gi0/2, Gi0/3 and Loopback0)</pre>
<p>Yeh asli response hai. Ise teen hisson mein padho:</p>
<ol>
<li><b>Status line</b> <code>HTTP/1.1 200 OK</code>: protocol version, status code (200) aur uska reason phrase (OK). 200 ka matlab success aur data body mein hai.</li>
<li><b>Headers</b> khaali line tak, jaise <code>Content-Type: application/yang-data+json</code>: "body JSON hai". Baaki headers (server naam, date, caching rules) jagah bachane ke liye yahan chhode gaye hain.</li>
<li><b>Body</b>, khaali line ke baad: JSON text. Sabse bahar ke braces mein ek key hai, <code>"ietf-interfaces:interfaces"</code>, jisme interface objects ki list <code>"interface": [ ... ]</code> hai.</li>
</ol>

<h3>Step 3: data padho</h3>
<p>List ka har interface braces ke beech ek object hai jisme named fields hain. GigabitEthernet0/0 ke liye aap <code>"description": "MGMT-LAN"</code>, <code>"enabled": true</code> (admin setting) aur <code>"ietf-ip:ipv4"</code> ke neeche address padh sakte ho. Isi reply mein aage, jis object ka <code>"name"</code> <code>GigabitEthernet0/1</code> hai uska <code>"description": "OLD-LINK"</code> hai:</p><pre class="out">...
      {
        "name": "GigabitEthernet0/1",
<span class="hl">        "description": "OLD-LINK",</span>
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": true,
...</pre><p><code>"enabled"</code> (jo engineer ne configure kiya) aur <code>"oper-status"</code> (interface asal mein kya kar raha hai) ka farak dhyaan do. Yeh wahi farak hai jo <code>show ip interface brief</code> mein "administratively down" aur "down" ka hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapka manager poochta hai: "Kaunsa interface purana link description rakhta hai?" Aap ek GET bhejte ho, JSON mein <code>OLD-LINK</code> dhoondhte ho, aur usi braces mein <code>"name"</code> padhte ho: GigabitEthernet0/1. Screen scraping nahi, aur ek program wahi search 500 routers par kar sakta hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) <code>restconf</code> bhool jaana, isliye HTTPS server jawab deta hai par API path 404 deta hai. (2) 15 se kam privilege wala user use karna. (3) URL mein <code>h&#116;tps</code> ki jagah <code>h&#116;tp</code> likhna; server sirf 443 par sunta hai. (4) "Connection refused" ko galat password samajhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> IOS XE par RESTCONF ke chaar tukde: privilege-15 user, <code>ip h&#116;tp secure-server</code>, web server ka authentication method, aur <code>restconf</code>. RESTCONF ko HTTPS chahiye; uska default root <code>/restconf</code> hai.</p></div>

<div class="scn"><h4>Woh API jisne sabko jawab diya</h4><p>Ek engineer ne edge router par <code>ip h&#116;tp server</code> aur <code>ip h&#116;tp secure-server</code> ke saath <code>ip h&#116;tp authentication local</code> enable kiya, aur API user ko kamzor password diya. Internet se scan ne management address par port 80 aur 443 khule paaye. Kuch chori nahi hua, par audit fail ho gaya. Fix: sirf HTTPS, ek access class jo sirf management subnet ko allow kare, strong secret aur dedicated API user.</p><p><b>Lesson:</b> API enable karna ek naya darwaza kholna hai. Kholte hi use lock karo.</p></div>

<div class="iv"><p class="q">"Cisco IOS XE router par RESTCONF use karne ke liye kya enable karte ho?"</p><p>Privilege 15 wala local user (ya AAA), HTTPS ke liye <code>ip h&#116;tp secure-server</code>, <code>ip h&#116;tp authentication local</code> jaisa authentication method, aur <code>restconf</code> command. Phir main <code>show ip h&#116;tp server status</code> aur ek GET se verify karta hoon. Main access ko management network tak restrict karta aur aise certificates use karta jinhe clients verify kar sakein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>"Connection refused" matlab koi service sun nahi rahi, galat password nahi.</li>
<li>Chaar lines RESTCONF enable karti hain: user, <code>ip h&#116;tp secure-server</code>, <code>ip h&#116;tp authentication local</code>, <code>restconf</code>.</li>
<li>Response mein status line, headers, khaali line aur body hoti hai.</li>
<li>200 OK matlab success; JSON body <code>interface</code> ke neeche list rakhti hai.</li>
<li><code>enabled</code> configuration hai; <code>oper-status</code> haqeeqat.</li>
</ul></div>

`}};export{e as default};