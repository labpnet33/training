var e={id:`aaa-servers`,h:{en:`AAA troubleshooting 2: servers, keys, source interface and test aaa`,hi:`AAA troubleshooting 2: servers, keys, source interface aur test aaa`},body:{en:`
<p>Back at reception, the phone to head office can fail in several ways: the line is cut (no route), head office changed its number (wrong port), they do not recognise the caller ID (wrong source address), or they speak a code language and the passwords do not match (wrong key). From the reception desk every one of these sounds like the same thing: no useful answer. In AAA terms, they all produce <b>ERROR</b>. This chapter is about telling them apart.</p>

<h3>What must be right for a server to answer</h3>
<ol>
<li><b>Reachability.</b> A route to the server, no ACL or firewall blocking TCP 49 (TACACS+) or UDP 1812/1813 (RADIUS; some older servers use 1645/1646), and the correct VRF if management lives in one.</li>
<li><b>Source address.</b> The server identifies the router, the <b>NAS</b> (network access server), by the source IP of the request. If the router sends from Gi0/0 today and from a loopback tomorrow, the server may not know it. Pin it with <code>ip tacacs source-interface</code>, <code>ip radius source-interface</code>, or inside the server group.</li>
<li><b>Shared key.</b> Both sides must use the exact same secret, including case and trailing characters.</li>
<li><b>Server-side policy.</b> The user exists, is in the right group and the device group allows this NAS.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="AAA request path">
<rect x="10" y="80" width="130" height="60" rx="8" fill="#bae6fd"/><text x="75" y="105" text-anchor="middle" class="svg-ink" font-size="13">R1 (NAS)</text><text x="75" y="124" text-anchor="middle" class="svg-muted" font-size="12">src Loopback0</text>
<rect x="250" y="80" width="130" height="60" rx="8" fill="#e2e8f0"/><text x="315" y="105" text-anchor="middle" class="svg-ink" font-size="13">Network</text><text x="315" y="124" text-anchor="middle" class="svg-muted" font-size="12">route, ACL, VRF</text>
<rect x="490" y="80" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="105" text-anchor="middle" class="svg-ink" font-size="13">TAC1 10.10.10.50</text><text x="560" y="124" text-anchor="middle" class="svg-muted" font-size="12">NAS list + key</text>
<line x1="140" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="380" y1="110" x2="490" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="195" y="70" text-anchor="middle" class="svg-accent" font-size="12">1 source IP</text>
<text x="435" y="70" text-anchor="middle" class="svg-accent" font-size="12">2 TCP 49 / UDP 1812</text>
<text x="560" y="170" text-anchor="middle" class="svg-accent" font-size="12">3 key 4 policy</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Any failure in 1 to 3 looks like a dead server: ERROR</text>
</svg><p class="cap">Four things must line up before the server gives a real PASS or FAIL.</p></div>

<h3>A typical server configuration</h3>
<pre class="code">tacacs server TAC1
 address ipv4 10.10.10.50
 key NK-tac-26
 timeout 5
radius server RAD1
 address ipv4 10.10.10.100 auth-port 1812 acct-port 1813
 key NK-rad-26
aaa group server tacacs+ NK-TAC
 server name TAC1
 ip tacacs source-interface Loopback0
<span class="c">! if management is in a VRF, the group must know it</span>
<span class="c">!  ip vrf forwarding MGMT</span>
aaa group server radius NK-RAD
 server name RAD1
 ip radius source-interface Loopback0</pre>

<h3>Tool 1: test aaa</h3>
<p><code>test aaa group</code> sends a real request without anyone logging in, so you can test from the CLI while a user waits on the phone.</p>
<pre class="out">R1# test aaa group NK-TAC asha Str0ng-Pass legacy
Sending password
<span class="hl">User successfully authenticated</span>

R1# test aaa group NK-TAC asha wrong-pass legacy
Sending password
<span class="hl">User rejected</span>

R1# test aaa group NK-RAD asha Str0ng-Pass legacy
Attempting authentication test to server-group NK-RAD using radius
<span class="hl">No authoritative response from any server.</span></pre>
<p>Three results map directly to PASS, FAIL and ERROR. "No authoritative response" means reachability, source address or key.</p>

<h3>Tool 2: show aaa servers and show tacacs</h3>
<pre class="out">R1# show aaa servers
RADIUS: id 1, priority 1, host 10.10.10.100, auth-port 1812, acct-port 1813, hostname RAD1
     State: <span class="hl">current DEAD</span>, duration 52s, previous duration 0s
     Dead: total time 52s, count 1
     Authen: <span class="hl">request 4, timeouts 12</span>, failover 0, retransmission 8
             Response: accept 0, reject 0, challenge 0

R1# show tacacs
Tacacs+ Server - public :
               Server name: TAC1
            Server address: 10.10.10.50
               Server port: 49
              Socket opens:         23
             Socket closes:         23
             Socket aborts:          0
             Socket errors:          0
           Socket Timeouts:          0
   Failed Connect Attempts:          0
        Total Packets Sent:         23
        Total Packets Recv:         23</pre>
<p>Patterns to recognise: <b>requests equal timeouts and zero responses</b> on RADIUS means the server never answers, which is typical of a key mismatch or an unknown NAS address, because RADIUS servers silently discard what they cannot validate. On TACACS+, <b>Failed Connect Attempts</b> rising means TCP 49 never opens (routing, ACL, server down). Sockets open and close normally but logins still fall to local points at the key.</p>

<h3>Tool 3: debug tacacs and debug radius</h3>
<pre class="out">R1# debug tacacs
TPLUS: Queuing AAA Authentication request 46 for processing
TPLUS: processing authentication start request id 46
TPLUS: Authentication start packet created for 46(asha)
TPLUS: Using server 10.10.10.50
TPLUS(0000002E)/0/NB_WAIT/2A1B3C4D: Started 5 sec timeout
TPLUS(0000002E)/0/NB_WAIT: socket event 2
TPLUS(0000002E)/0/READ: socket event 1
<span class="hl">TPLUS: received bad AUTHEN packet: length = 40, expected 43974</span>
TPLUS: Invalid AUTHEN packet (check keys).</pre>
<p>The TCP session opened, so reachability is fine, but the reply could not be decrypted: the router computes a nonsense length from garbage. That is the signature of a <b>key mismatch</b> on TACACS+. For RADIUS, <code>debug radius</code> shows repeated <code>Retransmit to (10.10.10.100:1812,1813)</code> lines and then <code>No response from</code>, or, when things work, <code>Received from id ... Access-Accept</code> or <code>Access-Reject</code>.</p>

<h3>Server failover and dead timers</h3>
<p>If a group has two servers, the router tries the next server in the group on ERROR before it moves on to the next method. <code>radius-server dead-criteria time 5 tries 3</code> and <code>radius-server deadtime 10</code> tell IOS when to mark a RADIUS server DEAD and for how many minutes to skip it. A DEAD server is skipped immediately, which speeds up fallback but can hide a recovered server until the deadtime expires.</p>

<div class="eg"><p><b>Worked example.</b> R1 reaches TAC1 through Gi0/1 (10.10.10.1). The TACACS+ server has R1 in its device list as 10.10.10.1. An engineer adds <code>ip tacacs source-interface Loopback0</code> (1.1.1.1) as a "best practice" but does not update the server. Now the server receives requests from 1.1.1.1, an unknown NAS, and resets the connection. Logins drop to the local account. Fix either side: add 1.1.1.1 on the server, or remove the source-interface command.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A trailing space in the key copied from an email. Forgetting that a management VRF needs <code>ip vrf forwarding</code> in the server group. Using the old global <code>tacacs-server host</code> form on one router and the new <code>tacacs server</code> form on another, then comparing the wrong lines. Testing with <code>ping</code> only; ping proves reachability, not the key or the port.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ uses <b>TCP 49</b> and encrypts the whole body; RADIUS uses <b>UDP 1812/1813</b> and hides only the password. A question showing "requests equal timeouts, accept 0, reject 0" is not a wrong user password; a wrong password would show reject greater than 0.</p></div>

<div class="scn"><h4>Everybody is on the emergency account</h4><p>After a migration to RADIUS, only the local "backup" account worked. <code>test aaa</code> returned "No authoritative response" and <code>show aaa servers</code> showed request 2, timeouts 6, the server DEAD. The RADIUS team had the NAS as 10.10.10.1 with key NK-rad-26. The router sent from Loopback0 and its key read NK-rad-62. After setting the source interface to Gi0/1 and correcting the key, test aaa returned success and the accept counter began to rise.</p><p><b>Lesson:</b> ERROR hides behind a working fallback. Check source address and key together.</p></div>

<div class="iv"><p class="q">"Users can only log in with the local account since you added TACACS+. How do you troubleshoot?"</p><p>Strong answer: that symptom means the group returns ERROR. Run <code>test aaa group</code> to reproduce, check <code>show tacacs</code> for failed connects (reachability, ACL, VRF) versus normal socket opens (key), confirm the source interface matches the NAS entry on the server, and use <code>debug tacacs</code>, where "received bad AUTHEN packet" proves a key mismatch. Mention that a wrong user password would give FAIL, not local fallback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A server answers only when route, port, source address and key are all correct.</li>
<li><code>test aaa group NAME user pass legacy</code> reproduces PASS, FAIL or ERROR on demand.</li>
<li>RADIUS with requests equal to timeouts means the server is discarding: key or NAS address.</li>
<li>TACACS+ "received bad AUTHEN packet" in <code>debug tacacs</code> is a key mismatch.</li>
<li>Pin the source interface and keep it in sync with the server's device list.</li>
</ul></div>
`,hi:`
<p>Reception par wapas, head office wala phone kai tarah se fail ho sakta hai: line kati hui hai (route nahi), head office ne number badal diya (galat port), woh caller ID pehchante nahi (galat source address), ya woh code language bolte hain aur passwords match nahi karte (galat key). Reception desk se yeh sab ek jaise lagte hain: koi kaam ka jawab nahi. AAA ki bhasha mein, sab <b>ERROR</b> dete hain. Yeh chapter inhe alag pehchanne ke baare mein hai.</p>

<h3>Server ke jawab dene ke liye kya sahi hona chahiye</h3>
<ol>
<li><b>Reachability.</b> Server tak route, TCP 49 (TACACS+) ya UDP 1812/1813 (RADIUS; kuch purane servers 1645/1646 use karte hain) ko block karta koi ACL ya firewall nahi, aur agar management VRF mein hai to sahi VRF.</li>
<li><b>Source address.</b> Server router ko, yaani <b>NAS</b> (network access server) ko, request ke source IP se pehchanta hai. Agar router aaj Gi0/0 se bhejta hai aur kal loopback se, to server use shayad na pehchane. Ise <code>ip tacacs source-interface</code>, <code>ip radius source-interface</code>, ya server group ke andar pin karo.</li>
<li><b>Shared key.</b> Dono taraf bilkul same secret hona chahiye, case aur aakhri characters samet.</li>
<li><b>Server-side policy.</b> User exist karta hai, sahi group mein hai aur device group is NAS ko allow karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="AAA request ka path">
<rect x="10" y="80" width="130" height="60" rx="8" fill="#bae6fd"/><text x="75" y="105" text-anchor="middle" class="svg-ink" font-size="13">R1 (NAS)</text><text x="75" y="124" text-anchor="middle" class="svg-muted" font-size="12">src Loopback0</text>
<rect x="250" y="80" width="130" height="60" rx="8" fill="#e2e8f0"/><text x="315" y="105" text-anchor="middle" class="svg-ink" font-size="13">Network</text><text x="315" y="124" text-anchor="middle" class="svg-muted" font-size="12">route, ACL, VRF</text>
<rect x="490" y="80" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="105" text-anchor="middle" class="svg-ink" font-size="13">TAC1 10.10.10.50</text><text x="560" y="124" text-anchor="middle" class="svg-muted" font-size="12">NAS list + key</text>
<line x1="140" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="380" y1="110" x2="490" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="195" y="70" text-anchor="middle" class="svg-accent" font-size="12">1 source IP</text>
<text x="435" y="70" text-anchor="middle" class="svg-accent" font-size="12">2 TCP 49 / UDP 1812</text>
<text x="560" y="170" text-anchor="middle" class="svg-accent" font-size="12">3 key 4 policy</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">1 se 3 mein koi bhi failure dead server jaisa: ERROR</text>
</svg><p class="cap">Server asli PASS ya FAIL de, usse pehle chaar cheezein line up honi chahiye.</p></div>

<h3>Ek typical server configuration</h3>
<pre class="code">tacacs server TAC1
 address ipv4 10.10.10.50
 key NK-tac-26
 timeout 5
radius server RAD1
 address ipv4 10.10.10.100 auth-port 1812 acct-port 1813
 key NK-rad-26
aaa group server tacacs+ NK-TAC
 server name TAC1
 ip tacacs source-interface Loopback0
<span class="c">! if management is in a VRF, the group must know it</span>
<span class="c">!  ip vrf forwarding MGMT</span>
aaa group server radius NK-RAD
 server name RAD1
 ip radius source-interface Loopback0</pre>

<h3>Tool 1: test aaa</h3>
<p><code>test aaa group</code> bina kisi ke login kiye asli request bhejta hai, isliye jab user phone par wait kar raha ho tab aap CLI se test kar sakte ho.</p>
<pre class="out">R1# test aaa group NK-TAC asha Str0ng-Pass legacy
Sending password
<span class="hl">User successfully authenticated</span>

R1# test aaa group NK-TAC asha wrong-pass legacy
Sending password
<span class="hl">User rejected</span>

R1# test aaa group NK-RAD asha Str0ng-Pass legacy
Attempting authentication test to server-group NK-RAD using radius
<span class="hl">No authoritative response from any server.</span></pre>
<p>Teen results seedhe PASS, FAIL aur ERROR se map hote hain. "No authoritative response" ka matlab reachability, source address ya key.</p>

<h3>Tool 2: show aaa servers aur show tacacs</h3>
<pre class="out">R1# show aaa servers
RADIUS: id 1, priority 1, host 10.10.10.100, auth-port 1812, acct-port 1813, hostname RAD1
     State: <span class="hl">current DEAD</span>, duration 52s, previous duration 0s
     Dead: total time 52s, count 1
     Authen: <span class="hl">request 4, timeouts 12</span>, failover 0, retransmission 8
             Response: accept 0, reject 0, challenge 0

R1# show tacacs
Tacacs+ Server - public :
               Server name: TAC1
            Server address: 10.10.10.50
               Server port: 49
              Socket opens:         23
             Socket closes:         23
             Socket aborts:          0
             Socket errors:          0
           Socket Timeouts:          0
   Failed Connect Attempts:          0
        Total Packets Sent:         23
        Total Packets Recv:         23</pre>
<p>Pehchanne wale patterns: RADIUS par <b>requests barabar timeouts aur zero responses</b> ka matlab server kabhi jawab nahi deta, jo key mismatch ya anjaan NAS address ka typical lakshan hai, kyunki RADIUS servers jo validate nahi kar paate use chupchaap discard kar dete hain. TACACS+ par <b>Failed Connect Attempts</b> badhna matlab TCP 49 kabhi khulta hi nahi (routing, ACL, server down). Sockets normal khulte aur band hote hain lekin logins phir bhi local par girte hain, to ungli key ki taraf hai.</p>

<h3>Tool 3: debug tacacs aur debug radius</h3>
<pre class="out">R1# debug tacacs
TPLUS: Queuing AAA Authentication request 46 for processing
TPLUS: processing authentication start request id 46
TPLUS: Authentication start packet created for 46(asha)
TPLUS: Using server 10.10.10.50
TPLUS(0000002E)/0/NB_WAIT/2A1B3C4D: Started 5 sec timeout
TPLUS(0000002E)/0/NB_WAIT: socket event 2
TPLUS(0000002E)/0/READ: socket event 1
<span class="hl">TPLUS: received bad AUTHEN packet: length = 40, expected 43974</span>
TPLUS: Invalid AUTHEN packet (check keys).</pre>
<p>TCP session khul gaya, to reachability theek hai, lekin reply decrypt nahi ho paya: router kachre se ek bekaar length nikalta hai. Yeh TACACS+ par <b>key mismatch</b> ki pehchaan hai. RADIUS ke liye, <code>debug radius</code> baar baar <code>Retransmit to (10.10.10.100:1812,1813)</code> lines aur phir <code>No response from</code> dikhata hai, ya sab theek ho to <code>Received from id ... Access-Accept</code> ya <code>Access-Reject</code>.</p>

<h3>Server failover aur dead timers</h3>
<p>Agar group mein do servers hain, to ERROR par router agle method par jaane se pehle group ka agla server try karta hai. <code>radius-server dead-criteria time 5 tries 3</code> aur <code>radius-server deadtime 10</code> IOS ko batate hain ki RADIUS server ko kab DEAD mark karna hai aur kitne minute use skip karna hai. DEAD server turant skip hota hai, jisse fallback tez hota hai lekin deadtime khatam hone tak theek hua server chhup sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> R1 TAC1 tak Gi0/1 (10.10.10.1) se pahunchta hai. TACACS+ server ki device list mein R1 10.10.10.1 ke roop mein hai. Ek engineer "best practice" ke naam par <code>ip tacacs source-interface Loopback0</code> (1.1.1.1) jodta hai lekin server update nahi karta. Ab server ko 1.1.1.1 se requests milti hain, ek anjaan NAS, aur woh connection reset kar deta hai. Logins local account par gir jaate hain. Kisi bhi side ko theek karo: server par 1.1.1.1 jodo, ya source-interface command hatao.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Email se copy ki gayi key mein aakhri space. Bhool jaana ki management VRF ke liye server group mein <code>ip vrf forwarding</code> chahiye. Ek router par purana global <code>tacacs-server host</code> form aur doosre par naya <code>tacacs server</code> form use karna, phir galat lines compare karna. Sirf <code>ping</code> se test karna; ping reachability sabit karta hai, key ya port nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ <b>TCP 49</b> use karta hai aur poori body encrypt karta hai; RADIUS <b>UDP 1812/1813</b> use karta hai aur sirf password chhupata hai. Jo question "requests barabar timeouts, accept 0, reject 0" dikhaye, woh galat user password nahi hai; galat password mein reject 0 se zyada dikhta.</p></div>

<div class="scn"><h4>Sab emergency account par hain</h4><p>RADIUS par migration ke baad sirf local "backup" account chal raha tha. <code>test aaa</code> ne "No authoritative response" diya aur <code>show aaa servers</code> ne request 2, timeouts 6, server DEAD dikhaya. RADIUS team ke paas NAS 10.10.10.1 aur key NK-rad-26 thi. Router Loopback0 se bhej raha tha aur uski key NK-rad-62 thi. Source interface ko Gi0/1 set karne aur key sahi karne ke baad test aaa ne success diya aur accept counter badhne laga.</p><p><b>Seekh:</b> ERROR ek chalte hue fallback ke peeche chhup jaata hai. Source address aur key saath mein check karo.</p></div>

<div class="iv"><p class="q">"TACACS+ jodne ke baad users sirf local account se login kar paa rahe hain. Aap kaise troubleshoot karoge?"</p><p>Strong answer: yeh lakshan batata hai ki group ERROR de raha hai. Reproduce karne ke liye <code>test aaa group</code> chalao, <code>show tacacs</code> mein failed connects (reachability, ACL, VRF) vs normal socket opens (key) dekho, confirm karo ki source interface server ki NAS entry se match karta hai, aur <code>debug tacacs</code> use karo, jahan "received bad AUTHEN packet" key mismatch sabit karta hai. Batao ki galat user password FAIL deta, local fallback nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Server tabhi jawab deta hai jab route, port, source address aur key sab sahi hon.</li>
<li><code>test aaa group NAME user pass legacy</code> PASS, FAIL ya ERROR ko jab chaaho reproduce karta hai.</li>
<li>RADIUS mein requests barabar timeouts matlab server discard kar raha hai: key ya NAS address.</li>
<li><code>debug tacacs</code> mein TACACS+ "received bad AUTHEN packet" key mismatch hai.</li>
<li>Source interface pin karo aur use server ki device list ke saath sync rakho.</li>
</ul></div>
`}};export{e as default};