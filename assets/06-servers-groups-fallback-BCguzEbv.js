var e={id:`servers-groups-fallback`,h:{en:`Servers, groups and the fallback rule`,hi:`Servers, groups aur fallback ka niyam`},body:{en:`
<p>Imagine a building whose badge readers check with a central security office. If the office says "this badge is revoked", the door stays shut, and the guard does not open it with a spare key just because the person asks nicely. Only if the phone line to the office is dead may the guard use the spare key in the sealed envelope. This one rule, <b>fall back only when there is no answer, never when the answer is no</b>, is the heart of AAA fallback.</p>

<h3>Defining servers</h3>
<p>Modern IOS XE uses named server blocks. This is task 1 of the TACACS+ lab:</p>
<pre class="code">aaa new-model
tacacs server ISE1
 address ipv4 10.10.10.100
 key NK-t4c-26                    <span class="c">! must match the key ISE holds for 10.10.10.1</span>
 timeout 5                        <span class="c">! seconds to wait for this server</span>
 single-connection                <span class="c">! optional: reuse one TCP session</span>
radius server RAD1
 address ipv4 10.10.10.100 auth-port 1812 acct-port 1813
 key NK-rad-26</pre>
<p>Test the server before you put it in a method list. The <code>test aaa</code> command sends a real request and prints the verdict:</p>
<pre class="out">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
Sending password
<span class="hl">User successfully authenticated</span>

R1# test aaa group tacacs+ backup Backup#26 legacy
Sending password
<span class="hl">User rejected</span></pre>

<h3>Server groups</h3>
<p><code>group tacacs+</code> means "all TACACS+ servers in configuration order". A <b>named group</b> lets you choose members, order, source interface and VRF, and use different servers for different purposes:</p>
<pre class="code">aaa group server tacacs+ ADMIN-TAC
 server name ISE1
 server name ISE2                         <span class="c">! tried only if ISE1 does not answer</span>
 ip tacacs source-interface GigabitEthernet0/1
 ip vrf forwarding Mgmt-intf               <span class="c">! if the servers live in a management VRF</span>
aaa authentication login default group ADMIN-TAC local</pre>
<p>The <b>source interface</b> matters because the server identifies the NAS by source IP. If R1 sends from Loopback0 (10.255.255.1) but ISE knows it only as 10.10.10.1, the request is ignored. That is one of the two faults in the RADIUS troubleshooting lab. For RADIUS the global form is <code>ip radius source-interface</code>.</p>

<h3>Dead servers</h3>
<p>When a server stops answering, the router marks it DEAD so it does not waste a timeout on every login. For RADIUS you tune this with <code>radius-server dead-criteria time 5 tries 3</code> and <code>radius-server deadtime 15</code> (minutes to skip a dead server). <code>show aaa servers</code> shows the state and counters:</p>
<pre class="out">R1# show aaa servers
TACACS+: id 1, priority 1, host 10.10.10.100, auth-port 49, hostname ISE1
<span class="hl">     State: current UP, duration 1204s, previous duration 0s</span>
     Dead: total time 0s, count 0
     Authen: request 5, timeouts 0, failover 0, retransmission 0
<span class="hl">             Response: accept 4, reject 1, challenge 0</span>
     Author: request 4, timeouts 0, failover 0, retransmission 0
             Response: pass 4, fail 0
     Account: request 6, timeouts 0, failover 0, retransmission 0</pre>

<h3>The fallback rule: ERROR versus FAIL</h3>
<p>With <code>aaa authentication login default group tacacs+ local</code>, three things can happen:</p>
<table class="cmp"><tr><th>Server situation</th><th>Result from the group</th><th>What the router does</th></tr>
<tr><td>Up, user and password correct</td><td>PASS</td><td>Login succeeds, local never checked</td></tr>
<tr><td>Up, unknown user or wrong password</td><td>FAIL</td><td>Login denied, local <b>not</b> tried</td></tr>
<tr><td>Down, unreachable, wrong key, unknown source IP</td><td>ERROR (no answer)</td><td>Next method: local database</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ERROR versus FAIL">
<rect x="230" y="15" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Ask TACACS+ group</text>
<rect x="20" y="130" width="170" height="54" rx="8" fill="#bbf7d0"/><text x="105" y="153" text-anchor="middle" class="svg-ink" font-size="13">PASS</text><text x="105" y="172" text-anchor="middle" class="svg-muted" font-size="12">logged in</text>
<rect x="235" y="130" width="170" height="54" rx="8" fill="#fed7aa"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="13">FAIL</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">denied, stop</text>
<rect x="450" y="130" width="170" height="54" rx="8" fill="#fde68a"/><text x="535" y="153" text-anchor="middle" class="svg-ink" font-size="13">ERROR</text><text x="535" y="172" text-anchor="middle" class="svg-muted" font-size="12">try local next</text>
<line x1="280" y1="59" x2="105" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><line x1="360" y1="59" x2="535" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="150" y="95" class="svg-muted" font-size="12">answer: yes</text><text x="330" y="100" class="svg-muted" font-size="12">answer: no</text><text x="455" y="95" class="svg-muted" font-size="12">no answer</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">A FAIL is an authoritative answer. Only silence triggers fallback.</text>
</svg><p class="cap">Fallback to local happens only on ERROR.</p></div>

<p>Tasks 5 and 6 of the TACACS+ lab prove this. With the AAA service stopped on ISE (<code>aaa-server stop</code>), R1 gets no answer, the group returns ERROR, and <code>backup / Backup#26</code> logs in through <code>local</code>. When ISE is started again, the same backup login is rejected: ISE does not know backup and answers FAIL, so local is never consulted, while netadmin works.</p>

<h3>Emergency (break-glass) accounts done right</h3>
<ul>
<li><b>Exactly one</b> local privileged account per device, with <code>algorithm-type scrypt secret</code>, a long random password stored in a password vault with checkout logging.</li>
<li><b>Not defined on the AAA server.</b> Then the correct method list makes it usable only when every server is unreachable, as the lab shows.</li>
<li><b>Logged and alerted.</b> <code>login on-success log</code> sends syslog; your monitoring should page someone when the break-glass user logs in.</li>
<li><b>Rotated after every use</b>, and reviewed: why were the servers unreachable?</li>
<li><b>Console list</b>: a named list <code>CONSOLE local</code> on the console lets on-site staff in without waiting for timeouts.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Timeout arithmetic. Two TACACS+ servers, each with <code>timeout 5</code>, both unreachable. A login with <code>group tacacs+ local</code> waits about 5 + 5 = 10 seconds before the local database is checked, per attempt, until the servers are marked dead. That is why people report "the fallback is slow". Keep timeouts short and use dead-server detection.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting the local account to work "as a backup" while the server is up. It will not, by design. If the local account also exists on the server with the same password, it works both ways, but then it is not a break-glass account any more.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions describe "the server rejects the user; will the router try local?" The answer is no. Only when the server does not respond (timeout, unreachable, dead) does the router move to the next method.</p></div>

<div class="scn"><h4>The contractor who still got in</h4><p>A contractor's account was disabled on the TACACS+ server, yet an audit showed he logged in the next day. Investigation: his username also existed in the local database of 40 switches with the same password, and those switches had <code>aaa authentication login default local group tacacs+</code>, local first. The local database answered PASS before TACACS+ was ever asked. The team removed personal local accounts, reversed the order to <code>group tacacs+ local</code> and kept only one break-glass user.</p><p><b>Lesson:</b> method order and a single, controlled local account are what make central disabling work.</p></div>

<div class="iv"><p class="q">"With group tacacs+ local, when is the local database used?"</p><p>Only when the TACACS+ group returns an ERROR: no server answered because of an outage, a routing problem, a key mismatch or an unknown source address. If a server answers FAIL, the login is denied and local is not tried. Add how you prove it (<code>test aaa</code>, stopping the service) and how you run the break-glass account safely.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Define servers with <code>tacacs server</code> / <code>radius server</code> blocks and test with <code>test aaa group ... legacy</code>.</li>
<li>Named groups set members, order, source interface and VRF; the server trusts the NAS source IP.</li>
<li>Fallback happens on ERROR (no answer) only, never on FAIL (a reject).</li>
<li>Break-glass: one local user, scrypt secret, vault, not on the server, alert on use, rotate after use.</li>
<li><code>show aaa servers</code> shows UP/DEAD, requests, timeouts, accepts and rejects.</li>
</ul></div>
`,hi:`
<p>Ek building socho jiske badge readers ek central security office se check karte hain. Agar office kehta hai "yeh badge revoke ho chuka hai", to darwaza band rehta hai, aur guard use spare key se sirf isliye nahi kholta ki banda pyaar se kehta hai. Sirf agar office ki phone line dead ho, tab guard sealed envelope wali spare key use kar sakta hai. Yeh ek niyam, <b>fallback sirf tab jab jawab na aaye, kabhi tab nahi jab jawab "na" ho</b>, AAA fallback ka dil hai.</p>

<h3>Servers define karna</h3>
<p>Modern IOS XE named server blocks use karta hai. Yeh TACACS+ lab ka task 1 hai:</p>
<pre class="code">aaa new-model
tacacs server ISE1
 address ipv4 10.10.10.100
 key NK-t4c-26                    <span class="c">! ISE par 10.10.10.1 ke liye rakhi key se match honi chahiye</span>
 timeout 5                        <span class="c">! is server ka intezaar kitne second</span>
 single-connection                <span class="c">! optional: ek TCP session reuse</span>
radius server RAD1
 address ipv4 10.10.10.100 auth-port 1812 acct-port 1813
 key NK-rad-26</pre>
<p>Method list mein daalne se pehle server test karo. <code>test aaa</code> command asli request bhejta hai aur faisla print karta hai:</p>
<pre class="out">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
Sending password
<span class="hl">User successfully authenticated</span>

R1# test aaa group tacacs+ backup Backup#26 legacy
Sending password
<span class="hl">User rejected</span></pre>

<h3>Server groups</h3>
<p><code>group tacacs+</code> ka matlab hai "configuration order mein saare TACACS+ servers". <b>Named group</b> aapko members, order, source interface aur VRF chunne deta hai, aur alag kaamon ke liye alag servers use karne deta hai:</p>
<pre class="code">aaa group server tacacs+ ADMIN-TAC
 server name ISE1
 server name ISE2                         <span class="c">! sirf tab try jab ISE1 jawab na de</span>
 ip tacacs source-interface GigabitEthernet0/1
 ip vrf forwarding Mgmt-intf               <span class="c">! agar servers management VRF mein hain</span>
aaa authentication login default group ADMIN-TAC local</pre>
<p><b>Source interface</b> isliye zaroori hai kyunki server NAS ko source IP se pehchanta hai. Agar R1 Loopback0 (10.255.255.1) se bhejta hai lekin ISE use sirf 10.10.10.1 ke roop mein jaanta hai, to request ignore hoti hai. RADIUS troubleshooting lab ki do galtiyon mein se yeh ek hai. RADIUS ke liye global form <code>ip radius source-interface</code> hai.</p>

<h3>Dead servers</h3>
<p>Jab server jawab dena band karta hai, router use DEAD mark karta hai taaki har login par timeout barbaad na ho. RADIUS ke liye aap ise <code>radius-server dead-criteria time 5 tries 3</code> aur <code>radius-server deadtime 15</code> (dead server ko kitne minute skip karna) se tune karte ho. <code>show aaa servers</code> state aur counters dikhata hai:</p>
<pre class="out">R1# show aaa servers
TACACS+: id 1, priority 1, host 10.10.10.100, auth-port 49, hostname ISE1
<span class="hl">     State: current UP, duration 1204s, previous duration 0s</span>
     Dead: total time 0s, count 0
     Authen: request 5, timeouts 0, failover 0, retransmission 0
<span class="hl">             Response: accept 4, reject 1, challenge 0</span>
     Author: request 4, timeouts 0, failover 0, retransmission 0
             Response: pass 4, fail 0
     Account: request 6, timeouts 0, failover 0, retransmission 0</pre>

<h3>Fallback ka niyam: ERROR vs FAIL</h3>
<p><code>aaa authentication login default group tacacs+ local</code> ke saath teen cheezein ho sakti hain:</p>
<table class="cmp"><tr><th>Server ki haalat</th><th>Group ka nateeja</th><th>Router kya karta hai</th></tr>
<tr><td>Up, user aur password sahi</td><td>PASS</td><td>Login safal, local kabhi check nahi</td></tr>
<tr><td>Up, anjaan user ya galat password</td><td>FAIL</td><td>Login mana, local try <b>nahi</b> hota</td></tr>
<tr><td>Down, unreachable, galat key, anjaan source IP</td><td>ERROR (koi jawab nahi)</td><td>Agla method: local database</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ERROR vs FAIL">
<rect x="230" y="15" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">TACACS+ group se poochho</text>
<rect x="20" y="130" width="170" height="54" rx="8" fill="#bbf7d0"/><text x="105" y="153" text-anchor="middle" class="svg-ink" font-size="13">PASS</text><text x="105" y="172" text-anchor="middle" class="svg-muted" font-size="12">login ho gaya</text>
<rect x="235" y="130" width="170" height="54" rx="8" fill="#fed7aa"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="13">FAIL</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">mana, ruko</text>
<rect x="450" y="130" width="170" height="54" rx="8" fill="#fde68a"/><text x="535" y="153" text-anchor="middle" class="svg-ink" font-size="13">ERROR</text><text x="535" y="172" text-anchor="middle" class="svg-muted" font-size="12">agla local try</text>
<line x1="280" y1="59" x2="105" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><line x1="360" y1="59" x2="535" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="150" y="95" class="svg-muted" font-size="12">jawab: haan</text><text x="330" y="100" class="svg-muted" font-size="12">jawab: na</text><text x="455" y="95" class="svg-muted" font-size="12">koi jawab nahi</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">FAIL ek pakka jawab hai. Sirf khamoshi fallback chalati hai.</text>
</svg><p class="cap">Local par fallback sirf ERROR par hota hai.</p></div>

<p>TACACS+ lab ke tasks 5 aur 6 yeh sabit karte hain. ISE par AAA service band (<code>aaa-server stop</code>) hone par R1 ko koi jawab nahi milta, group ERROR deta hai, aur <code>backup / Backup#26</code> <code>local</code> se login ho jaata hai. ISE phir chalu hone par wahi backup login reject hota hai: ISE backup ko nahi jaanta aur FAIL jawab deta hai, isliye local dekha hi nahi jaata, jabki netadmin chalta hai.</p>

<h3>Emergency (break-glass) accounts, sahi tarike se</h3>
<ul>
<li>Har device par <b>bilkul ek</b> local privileged account, <code>algorithm-type scrypt secret</code> ke saath, lamba random password checkout logging wale password vault mein.</li>
<li><b>AAA server par define nahi.</b> Tab sahi method list ise sirf tab usable banati hai jab har server unreachable ho, jaisa lab dikhati hai.</li>
<li><b>Logged aur alerted.</b> <code>login on-success log</code> syslog bhejta hai; break-glass user login kare to monitoring ko kisi ko page karna chahiye.</li>
<li><b>Har use ke baad rotate</b>, aur review: servers unreachable kyun the?</li>
<li><b>Console list</b>: console par named list <code>CONSOLE local</code> on-site staff ko bina timeouts ke intezaar ke andar aane deti hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Timeout ka hisaab. Do TACACS+ servers, har ek <code>timeout 5</code> ke saath, dono unreachable. <code>group tacacs+ local</code> wala login local database check hone se pehle har attempt par lagbhag 5 + 5 = 10 second wait karta hai, jab tak servers dead mark na ho jaayein. Isiliye log kehte hain "fallback slow hai". Timeouts chhote rakho aur dead-server detection use karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Server up hone par local account ke "backup ki tarah" chalne ki ummeed karna. Design ke hisaab se yeh nahi chalega. Agar local account server par bhi same password ke saath hai, to dono tarah chalta hai, lekin tab woh break-glass account nahi raha.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions poochhte hain "server user ko reject karta hai; kya router local try karega?" Jawab hai nahi. Sirf jab server respond na kare (timeout, unreachable, dead) tab router agle method par jaata hai.</p></div>

<div class="scn"><h4>Contractor jo phir bhi andar aa gaya</h4><p>Ek contractor ka account TACACS+ server par disable kiya gaya, phir bhi audit ne dikhaya ki agle din usne login kiya. Jaanch: uska username 40 switches ke local database mein bhi same password ke saath tha, aur un switches par <code>aaa authentication login default local group tacacs+</code> tha, pehle local. TACACS+ se poochhe jaane se pehle hi local database ne PASS de diya. Team ne personal local accounts hataaye, order ulta karke <code>group tacacs+ local</code> kiya aur sirf ek break-glass user rakha.</p><p><b>Seekh:</b> method order aur ek akela, controlled local account hi central disabling ko kaamyaab banate hain.</p></div>

<div class="iv"><p class="q">"group tacacs+ local ke saath local database kab use hota hai?"</p><p>Sirf jab TACACS+ group ERROR deta hai: outage, routing problem, key mismatch ya anjaan source address ki wajah se kisi server ne jawab nahi diya. Agar server FAIL jawab deta hai, to login mana hota hai aur local try nahi hota. Jodo ki aap ise kaise sabit karte ho (<code>test aaa</code>, service band karke) aur break-glass account ko safely kaise chalate ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Servers <code>tacacs server</code> / <code>radius server</code> blocks se define karo aur <code>test aaa group ... legacy</code> se test karo.</li>
<li>Named groups members, order, source interface aur VRF set karte hain; server NAS source IP par bharosa karta hai.</li>
<li>Fallback sirf ERROR (koi jawab nahi) par hota hai, kabhi FAIL (reject) par nahi.</li>
<li>Break-glass: ek local user, scrypt secret, vault, server par nahi, use par alert, use ke baad rotate.</li>
<li><code>show aaa servers</code> UP/DEAD, requests, timeouts, accepts aur rejects dikhata hai.</li>
</ul></div>
`}};export{e as default};