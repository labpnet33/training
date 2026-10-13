var e={id:`enable-iosxe`,h:{en:`Enabling NETCONF and RESTCONF on IOS XE`,hi:`IOS XE par NETCONF aur RESTCONF enable karna`},body:{en:`
<p>Before a restaurant can take online orders, three things must be true: the kitchen is open, the delivery counter has a door, and the staff know who is allowed to order on credit. Enabling APIs on a router is the same: the <b>YANG management processes</b> must run (the kitchen), a <b>listener</b> must be open on the right port (the door), and there must be an <b>account with enough privilege</b> (the credit list). Miss any one and the script gets a very specific error, which chapter 11 teaches you to read.</p>

<h3>The minimum configuration</h3>
<p>This is Lab 1 task 1 on R1:</p>
<pre class="code">R1# configure terminal
<span class="c">! 1. An API account. RESTCONF and NETCONF need privilege 15</span>
R1(config)# username devnet privilege 15 secret DevNet123
<span class="c">! 2. NETCONF over SSH, TCP 830 (starts the YANG infrastructure)</span>
R1(config)# netconf-yang
<span class="c">! 3. The HTTPS server on TCP 443, needed by RESTCONF</span>
R1(config)# ip h&#116;tp secure-server
<span class="c">! 4. Authenticate web/API logins against the local user database</span>
R1(config)# ip h&#116;tp authentication local
<span class="c">! 5. The RESTCONF service, reachable under /restconf</span>
R1(config)# restconf
R1(config)# end</pre>
<p>Each line has a job. <code>netconf-yang</code> starts the model-driven infrastructure and the NETCONF SSH subsystem. <code>restconf</code> registers the RESTCONF application with the web server, but it does <b>not</b> start the web server: without <code>ip h&#116;tp secure-server</code> nothing listens on 443 and clients get "connection refused". Without <code>ip h&#116;tp authentication local</code> the web server authenticates with the enable password instead of local users, so correct usernames still get 401.</p>

<div class="note"><p><b>On real hardware.</b> Cisco's IOS XE configuration guides also enable AAA for NETCONF: <code>aaa new-model</code>, <code>aaa authentication login default local</code> and <code>aaa authorization exec default local</code>, so the API user is authorised at privilege 15. It is good practice to disable the clear-text web server with <code>no ip h&#116;tp server</code> and keep only HTTPS. The lab accepts the five lines above.</p></div>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="What each command enables">
<rect x="20" y="20" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="12">netconf-yang</text>
<rect x="20" y="80" width="180" height="40" rx="8" fill="#bae6fd"/><text x="110" y="105" text-anchor="middle" class="svg-ink" font-size="12">HTTPS secure-server</text>
<rect x="20" y="140" width="180" height="40" rx="8" fill="#bae6fd"/><text x="110" y="165" text-anchor="middle" class="svg-ink" font-size="12">restconf</text>
<rect x="250" y="20" width="160" height="40" rx="8" fill="#fde68a"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="12">SSH listener 830</text>
<rect x="250" y="80" width="160" height="40" rx="8" fill="#fde68a"/><text x="330" y="105" text-anchor="middle" class="svg-ink" font-size="12">TLS listener 443</text>
<rect x="250" y="140" width="160" height="40" rx="8" fill="#fde68a"/><text x="330" y="165" text-anchor="middle" class="svg-ink" font-size="12">/restconf handler</text>
<rect x="460" y="70" width="160" height="60" rx="8" fill="#ddd6fe"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="12">YANG datastore</text><text x="540" y="113" text-anchor="middle" class="svg-muted" font-size="12">running-config</text>
<line x1="200" y1="40" x2="250" y2="40" stroke="#64748b"/><line x1="200" y1="100" x2="250" y2="100" stroke="#64748b"/><line x1="200" y1="160" x2="250" y2="160" stroke="#64748b"/>
<line x1="410" y1="40" x2="460" y2="90" stroke="#64748b"/><line x1="410" y1="160" x2="460" y2="110" stroke="#64748b"/><line x1="410" y1="100" x2="410" y2="160" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">RESTCONF needs both the 443 listener and the /restconf handler</text>
</svg><p class="cap">NETCONF brings its own SSH listener; RESTCONF rides on the HTTPS server.</p></div>

<h3>Verification, command by command</h3>
<pre class="out">R1# show netconf-yang status
<span class="hl">netconf-yang: enabled</span>
netconf-yang candidate-datastore: disabled
netconf-yang side-effect-sync: enabled
<span class="hl">netconf-yang ssh port: 830</span>
netconf-yang turbocli: disabled</pre>
<p><code>candidate-datastore: disabled</code> is important: edits go straight to <b>running</b>, and a NETCONF <code>commit</code> will be rejected. It can be enabled with <code>netconf-yang feature candidate-datastore</code> on real IOS XE.</p>
<pre class="out">R1# show platform software yang-management process
yang-db           : Running
yang-sync         : Running
nc-sshd           : Running
api-authd         : Running
<span class="hl">rc-webd           : Running</span>
rc-proxy          : Running
telemetryd        : Running</pre>
<p>These are the lab's process names. On a Catalyst 8000 or 9000 you would see <code>confd</code>, <code>nesd</code>, <code>syncfd</code>, <code>ncsshd</code>, <code>dmiauthd</code>, <code>nginx</code>, <code>ndbmand</code> and <code>pubd</code>. The idea is identical: every process must say Running; nginx (the web front end) runs only when RESTCONF and HTTPS are both on.</p>
<p>The HTTPS side is checked with the IOS web-server status command (<code>show ip h&#116;tp server status</code>):</p>
<pre class="out">HTTP server authentication method: <span class="hl">local</span>
HTTP secure server capability: Present
<span class="hl">HTTP secure server status: Enabled</span>
HTTP secure server port: 443
HTTP server application session modules:
 Session module Name  Handle Status   Secure-status  Description
 <span class="hl">restconf           5      Active   Active         RESTCONF (YANG over HTTPS)</span></pre>
<p>Finally <code>show netconf-yang sessions</code> lists connected clients and any <b>global lock</b> on a datastore, and <code>show running-config | include netconf|restconf|username</code> confirms the lines are saved.</p>

<div class="eg"><p><b>Worked example.</b> A colleague enabled only <code>restconf</code> and <code>username api privilege 15 secret ...</code>. Predict the result: the status command shows <code>HTTP secure server status: Disabled</code> and the restconf module Inactive; a client gets "Failed to connect to 192.168.50.1 port 443: Connection refused". Add <code>ip h&#116;tp secure-server</code>; now the connection works but the login fails with 401 because the method is still <code>enable</code>. Add <code>ip h&#116;tp authentication local</code> and the GET returns 200.</p></div>

<h3>Change tracking</h3>
<p>Every change made through the APIs is logged, for example <code>%DMI-5-CONFIG_I: Configured from NETCONF/RESTCONF by devnet, transaction-id 41</code>, and successful logins appear as <code>%DMI-5-AUTH_PASSED</code>. These syslog lines are how you prove who changed what when several tools share a device.</p>

<div class="warn"><p><b>Common mistake.</b> Creating the API user at the default privilege 1. Authentication succeeds, but RESTCONF answers <b>403 Forbidden</b> and NETCONF closes the session. API users need <code>privilege 15</code> (or AAA authorisation that grants 15).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>restconf</code> alone is not enough; RESTCONF requires the HTTPS server. NETCONF does not need the web server at all; it needs <code>netconf-yang</code> and SSH-capable credentials.</p></div>

<div class="scn"><h4>Works in the lab, fails in production</h4><p>An engineer copied the lab config to a production Catalyst 9300. RESTCONF worked, but NETCONF sessions were dropped right after the hello. The production box ran <code>aaa new-model</code> with TACACS+ for logins and no exec authorisation for the API user, so the user was not authorised at privilege 15. Adding <code>aaa authorization exec default group TACACS local</code> with priv-lvl 15 returned by the server fixed it.</p><p><b>Lesson:</b> API access follows the device's AAA policy; check authorisation, not just the password.</p></div>

<div class="iv"><p class="q">"What do you need on an IOS XE device before a RESTCONF call can work?"</p><p>Strong answer: a privilege 15 user (or AAA authorisation to 15), the HTTPS server with <code>ip h&#116;tp secure-server</code>, local or AAA authentication for the web server, and the <code>restconf</code> command. Verify with the web-server status command, which shows the restconf session module Active, and the yang-management process list. Mention NETCONF separately: <code>netconf-yang</code>, port 830.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five lines: privilege 15 user, <code>netconf-yang</code>, <code>ip h&#116;tp secure-server</code>, <code>ip h&#116;tp authentication local</code>, <code>restconf</code>.</li>
<li><code>restconf</code> does not start the web server; no HTTPS server means connection refused.</li>
<li>Verify with <code>show netconf-yang status</code>, the web-server status, and <code>show platform software yang-management process</code>.</li>
<li>The lab has no candidate datastore: edits go straight to running.</li>
<li><code>%DMI-5-CONFIG_I</code> logs every API change.</li>
</ul></div>
`,hi:`
<p>Ek restaurant online orders le sake, isse pehle teen cheezein sach honi chahiye: kitchen khuli ho, delivery counter ka darwaza ho, aur staff ko pata ho ki kaun credit par order kar sakta hai. Router par APIs enable karna bhi yahi hai: <b>YANG management processes</b> chalne chahiye (kitchen), sahi port par <b>listener</b> khula hona chahiye (darwaza), aur <b>kaafi privilege wala account</b> hona chahiye (credit list). Inme se ek bhi chhoota to script ko ek bahut specific error milta hai, jise padhna chapter 11 sikhata hai.</p>

<h3>Minimum configuration</h3>
<p>Yeh R1 par Lab 1 ka task 1 hai:</p>
<pre class="code">R1# configure terminal
<span class="c">! 1. Ek API account. RESTCONF aur NETCONF ko privilege 15 chahiye</span>
R1(config)# username devnet privilege 15 secret DevNet123
<span class="c">! 2. SSH par NETCONF, TCP 830 (YANG infrastructure start karta hai)</span>
R1(config)# netconf-yang
<span class="c">! 3. TCP 443 par HTTPS server, RESTCONF ko chahiye</span>
R1(config)# ip h&#116;tp secure-server
<span class="c">! 4. Web/API logins ko local user database se authenticate karo</span>
R1(config)# ip h&#116;tp authentication local
<span class="c">! 5. RESTCONF service, /restconf ke neeche milti hai</span>
R1(config)# restconf
R1(config)# end</pre>
<p>Har line ka ek kaam hai. <code>netconf-yang</code> model-driven infrastructure aur NETCONF SSH subsystem start karta hai. <code>restconf</code> RESTCONF application ko web server ke saath register karta hai, par web server start <b>nahi</b> karta: <code>ip h&#116;tp secure-server</code> ke bina 443 par koi nahi sunta aur clients ko "connection refused" milta hai. <code>ip h&#116;tp authentication local</code> ke bina web server local users ki jagah enable password se authenticate karta hai, isliye sahi usernames ko bhi 401 milta hai.</p>

<div class="note"><p><b>Asli hardware par.</b> Cisco ke IOS XE configuration guides NETCONF ke liye AAA bhi enable karte hain: <code>aaa new-model</code>, <code>aaa authentication login default local</code> aur <code>aaa authorization exec default local</code>, taaki API user privilege 15 par authorise ho. Clear-text web server ko <code>no ip h&#116;tp server</code> se band karna aur sirf HTTPS rakhna achhi practice hai. Lab upar ki paanch lines accept karta hai.</p></div>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="What each command enables">
<rect x="20" y="20" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="12">netconf-yang</text>
<rect x="20" y="80" width="180" height="40" rx="8" fill="#bae6fd"/><text x="110" y="105" text-anchor="middle" class="svg-ink" font-size="12">HTTPS secure-server</text>
<rect x="20" y="140" width="180" height="40" rx="8" fill="#bae6fd"/><text x="110" y="165" text-anchor="middle" class="svg-ink" font-size="12">restconf</text>
<rect x="250" y="20" width="160" height="40" rx="8" fill="#fde68a"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="12">SSH listener 830</text>
<rect x="250" y="80" width="160" height="40" rx="8" fill="#fde68a"/><text x="330" y="105" text-anchor="middle" class="svg-ink" font-size="12">TLS listener 443</text>
<rect x="250" y="140" width="160" height="40" rx="8" fill="#fde68a"/><text x="330" y="165" text-anchor="middle" class="svg-ink" font-size="12">/restconf handler</text>
<rect x="460" y="70" width="160" height="60" rx="8" fill="#ddd6fe"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="12">YANG datastore</text><text x="540" y="113" text-anchor="middle" class="svg-muted" font-size="12">running-config</text>
<line x1="200" y1="40" x2="250" y2="40" stroke="#64748b"/><line x1="200" y1="100" x2="250" y2="100" stroke="#64748b"/><line x1="200" y1="160" x2="250" y2="160" stroke="#64748b"/>
<line x1="410" y1="40" x2="460" y2="90" stroke="#64748b"/><line x1="410" y1="160" x2="460" y2="110" stroke="#64748b"/><line x1="410" y1="100" x2="410" y2="160" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">RESTCONF ko 443 listener aur /restconf handler dono chahiye</text>
</svg><p class="cap">NETCONF apna SSH listener laata hai; RESTCONF HTTPS server par chalta hai.</p></div>

<h3>Verification, command by command</h3>
<pre class="out">R1# show netconf-yang status
<span class="hl">netconf-yang: enabled</span>
netconf-yang candidate-datastore: disabled
netconf-yang side-effect-sync: enabled
<span class="hl">netconf-yang ssh port: 830</span>
netconf-yang turbocli: disabled</pre>
<p><code>candidate-datastore: disabled</code> important hai: edits seedha <b>running</b> mein jaate hain, aur NETCONF <code>commit</code> reject hoga. Asli IOS XE par ise <code>netconf-yang feature candidate-datastore</code> se enable kiya ja sakta hai.</p>
<pre class="out">R1# show platform software yang-management process
yang-db           : Running
yang-sync         : Running
nc-sshd           : Running
api-authd         : Running
<span class="hl">rc-webd           : Running</span>
rc-proxy          : Running
telemetryd        : Running</pre>
<p>Yeh lab ke process names hain. Catalyst 8000 ya 9000 par aapko <code>confd</code>, <code>nesd</code>, <code>syncfd</code>, <code>ncsshd</code>, <code>dmiauthd</code>, <code>nginx</code>, <code>ndbmand</code> aur <code>pubd</code> dikhenge. Idea same hai: har process Running bole; nginx (web front end) sirf tab chalta hai jab RESTCONF aur HTTPS dono on hon.</p>
<p>HTTPS side IOS web-server status command (<code>show ip h&#116;tp server status</code>) se check hoti hai:</p>
<pre class="out">HTTP server authentication method: <span class="hl">local</span>
HTTP secure server capability: Present
<span class="hl">HTTP secure server status: Enabled</span>
HTTP secure server port: 443
HTTP server application session modules:
 Session module Name  Handle Status   Secure-status  Description
 <span class="hl">restconf           5      Active   Active         RESTCONF (YANG over HTTPS)</span></pre>
<p>Aakhir mein <code>show netconf-yang sessions</code> connected clients aur datastore par koi <b>global lock</b> list karta hai, aur <code>show running-config | include netconf|restconf|username</code> confirm karta hai ki lines saved hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek colleague ne sirf <code>restconf</code> aur <code>username api privilege 15 secret ...</code> enable kiya. Result predict karo: status command <code>HTTP secure server status: Disabled</code> aur restconf module Inactive dikhata hai; client ko "Failed to connect to 192.168.50.1 port 443: Connection refused" milta hai. <code>ip h&#116;tp secure-server</code> add karo; ab connection chalta hai par login 401 ke saath fail hota hai kyunki method abhi bhi <code>enable</code> hai. <code>ip h&#116;tp authentication local</code> add karo aur GET 200 deta hai.</p></div>

<h3>Change tracking</h3>
<p>APIs se hua har change log hota hai, jaise <code>%DMI-5-CONFIG_I: Configured from NETCONF/RESTCONF by devnet, transaction-id 41</code>, aur successful logins <code>%DMI-5-AUTH_PASSED</code> ki tarah dikhte hain. Jab kai tools ek device share karte hain, to yahi syslog lines prove karti hain ki kisne kab kya badla.</p>

<div class="warn"><p><b>Common galti.</b> API user ko default privilege 1 par banana. Authentication ho jaata hai, par RESTCONF <b>403 Forbidden</b> deta hai aur NETCONF session band kar deta hai. API users ko <code>privilege 15</code> chahiye (ya AAA authorisation jo 15 de).</p></div>
<div class="exam"><p><b>Exam trap.</b> Sirf <code>restconf</code> kaafi nahi; RESTCONF ko HTTPS server chahiye. NETCONF ko web server ki bilkul zaroorat nahi; use <code>netconf-yang</code> aur SSH-capable credentials chahiye.</p></div>

<div class="scn"><h4>Lab mein chalta hai, production mein fail</h4><p>Ek engineer ne lab config production Catalyst 9300 par copy kiya. RESTCONF chal gaya, par NETCONF sessions hello ke turant baad drop ho rahe the. Production box logins ke liye TACACS+ ke saath <code>aaa new-model</code> chala raha tha aur API user ke liye exec authorisation nahi thi, isliye user privilege 15 par authorise nahi hua. <code>aaa authorization exec default group TACACS local</code> add karna, server se priv-lvl 15 lautane ke saath, ne ise theek kiya.</p><p><b>Seekh:</b> API access device ki AAA policy follow karta hai; sirf password nahi, authorisation check karo.</p></div>

<div class="iv"><p class="q">"RESTCONF call kaam kare, isse pehle IOS XE device par kya chahiye?"</p><p>Strong answer: privilege 15 user (ya 15 tak AAA authorisation), <code>ip h&#116;tp secure-server</code> se HTTPS server, web server ke liye local ya AAA authentication, aur <code>restconf</code> command. Web-server status command se verify karo, jo restconf session module Active dikhata hai, aur yang-management process list se. NETCONF alag se batao: <code>netconf-yang</code>, port 830.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch lines: privilege 15 user, <code>netconf-yang</code>, <code>ip h&#116;tp secure-server</code>, <code>ip h&#116;tp authentication local</code>, <code>restconf</code>.</li>
<li><code>restconf</code> web server start nahi karta; HTTPS server nahi to connection refused.</li>
<li><code>show netconf-yang status</code>, web-server status, aur <code>show platform software yang-management process</code> se verify karo.</li>
<li>Lab mein candidate datastore nahi hai: edits seedha running mein jaate hain.</li>
<li><code>%DMI-5-CONFIG_I</code> har API change log karta hai.</li>
</ul></div>
`}};export{e as default};