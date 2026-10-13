var e={id:`aaa-config`,h:{en:`Configuring AAA: aaa new-model, method lists and local fallback`,hi:`AAA configure karna: aaa new-model, method lists aur local fallback`},body:{en:`
<p>A method list is like the instructions you give a receptionist: "For anyone who arrives, first phone head office security to check their badge. If the phone line is dead, check the printed staff list in the drawer." The order matters, and so does the rule that if head office says <i>no</i>, the receptionist does not look in the drawer. In IOS, that instruction sheet is an <b>AAA method list</b>.</p>

<h3>Step 0: a safety net before you start</h3>
<p>AAA changes how every line authenticates the moment you enable it. A typo can lock you out. Senior engineers always prepare three things first:</p>
<ul>
<li>A <b>local emergency user</b> with a secret: <code>username netadmin privilege 15 secret N0c!Admin26</code>.</li>
<li>A <b>second open session</b>, ideally the console, that stays logged in while you test.</li>
<li>A <b>scheduled reload</b> as an undo button: <code>reload in 10</code>. If you lock yourself out, the router reboots into the saved startup-config in 10 minutes. When everything works, <code>reload cancel</code> and save.</li>
</ul>

<h3>Step 1: turn on AAA</h3>
<pre class="code">EDGE(config)# aaa new-model</pre>
<p><code>aaa new-model</code> switches the device from the old line-based model to AAA. From now on the line commands <code>login</code>, <code>login local</code> and line passwords are no longer used for authentication. If no default list exists yet, logins use the local user database, which is exactly why the emergency user must exist first.</p>

<h3>Step 2: define the servers</h3>
<pre class="code">EDGE(config)# tacacs server NK-TAC1
EDGE(config-server-tacacs)# address ipv4 10.99.99.20
EDGE(config-server-tacacs)# key T@cK3y2026              <span class="c">! must match the server</span>
EDGE(config-server-tacacs)# exit
EDGE(config)# aaa group server tacacs+ NK-TACS
EDGE(config-sg-tacacs+)# server name NK-TAC1
EDGE(config-sg-tacacs+)# exit
EDGE(config)# ip tacacs source-interface GigabitEthernet0/1</pre>
<p>The RADIUS version looks almost the same:</p>
<pre class="code">EDGE(config)# radius server NK-RAD1
EDGE(config-radius-server)# address ipv4 10.99.99.21 auth-port 1812 acct-port 1813
EDGE(config-radius-server)# key R@dK3y2026
EDGE(config-radius-server)# exit
EDGE(config)# aaa group server radius NK-RADS
EDGE(config-sg-radius)# server name NK-RAD1</pre>
<p>The <b>shared key</b> must be identical on the router and on the server, where the router is registered as a network device with this same key and its source IP.</p>

<h3>Step 3: build the method lists</h3>
<pre class="code">EDGE(config)# aaa authentication login default group NK-TACS local
EDGE(config)# aaa authentication login CONSOLE local
EDGE(config)# aaa authorization exec default group NK-TACS local
EDGE(config)# aaa accounting exec default start-stop group NK-TACS
EDGE(config)# aaa accounting commands 15 default start-stop group NK-TACS
EDGE(config)# line con 0
EDGE(config-line)# login authentication CONSOLE</pre>
<ul>
<li><b>aaa authentication login default</b> applies automatically to every line that has no named list, including all VTY lines.</li>
<li><b>group NK-TACS local</b> is the ordered list of methods: TACACS+ first, local database if the servers do not answer.</li>
<li>A <b>named list</b> (CONSOLE) applies only where you assign it with <code>login authentication CONSOLE</code>. Here the console uses local users only, so a broken AAA server can never block the console.</li>
<li><b>aaa authorization exec</b> lets the server decide the privilege level at login.</li>
<li><b>aaa accounting exec</b> records session start and stop; <b>accounting commands 15</b> records every level-15 command.</li>
</ul>

<table class="cmp"><tr><th>Method keyword</th><th>Meaning</th></tr>
<tr><td><code>group tacacs+</code> / <code>group radius</code></td><td>All configured servers of that type</td></tr>
<tr><td><code>group NAME</code></td><td>Only the servers in that named group</td></tr>
<tr><td><code>local</code></td><td>Local username database</td></tr>
<tr><td><code>enable</code></td><td>The enable secret (used in enable authentication lists)</td></tr>
<tr><td><code>none</code></td><td>No authentication: everyone gets in. Never on VTY lines</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Method list decision">
<rect x="10" y="80" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="102" text-anchor="middle" class="svg-ink" font-size="13">Login attempt</text><text x="70" y="119" text-anchor="middle" class="svg-muted" font-size="12">netadmin</text>
<rect x="180" y="80" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="250" y="102" text-anchor="middle" class="svg-ink" font-size="13">1. group NK-TACS</text><text x="250" y="119" text-anchor="middle" class="svg-muted" font-size="12">ask TACACS+</text>
<rect x="400" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="455" y="48" text-anchor="middle" class="svg-ink" font-size="13">PASS: login</text>
<rect x="400" y="87" width="110" height="46" rx="8" fill="#fed7aa"/><text x="455" y="115" text-anchor="middle" class="svg-ink" font-size="13">FAIL: denied</text>
<rect x="400" y="154" width="110" height="46" rx="8" fill="#fde68a"/><text x="455" y="176" text-anchor="middle" class="svg-ink" font-size="13">ERROR: no reply</text>
<rect x="540" y="154" width="90" height="46" rx="8" fill="#bae6fd"/><text x="585" y="176" text-anchor="middle" class="svg-ink" font-size="13">2. local</text>
<line x1="130" y1="105" x2="180" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="100" x2="400" y2="43" stroke="#64748b" stroke-width="2"/><line x1="320" y1="105" x2="400" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="112" x2="400" y2="177" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="177" x2="540" y2="177" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Only an ERROR (server unreachable) moves to the next method. A FAIL from the server is final.</p></div>

<h3>Verification</h3>
<pre class="out">EDGE# show aaa servers

TACACS+: id 1, priority 1, host 10.99.99.20, auth-port 49
     <span class="hl">State: current UP, duration 5132s, previous duration 0s</span>
     Dead: total time 0s, count 0
     Authen: request 14, timeouts 0, failover 0, retransmission 0
             Response: accept 12, reject 2, challenge 0

EDGE# test aaa group NK-TACS netadmin N0c!Admin26 legacy
Attempting authentication test to server-group NK-TACS using tacacs+
<span class="hl">User was successfully authenticated.</span>

EDGE# show running-config | section aaa
aaa new-model
aaa group server tacacs+ NK-TACS
 server name NK-TAC1
aaa authentication login default group NK-TACS local
aaa authentication login CONSOLE local
aaa authorization exec default group NK-TACS local
aaa accounting exec default start-stop group NK-TACS
aaa accounting commands 15 default start-stop group NK-TACS</pre>
<p>For step-by-step detail during a test, <code>debug aaa authentication</code> shows which method list was picked and which method answered; turn it off with <code>undebug all</code> afterwards.</p>

<div class="eg"><p><b>Worked example.</b> The TACACS+ server 10.99.99.20 is shut down for maintenance. <code>show aaa servers</code> now shows <code>State: current DEAD</code>. netadmin SSHes in from PC-ADMIN: the router tries NK-TACS, gets no answer after the timeout, falls back to <code>local</code> and accepts the local secret, so the login succeeds after a short delay. When the server is back, a user whose AD account is disabled tries to log in; the server replies reject, and even though the same name exists locally the login is denied.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>aaa new-model</code> with no local user and no console session. Writing <code>aaa authentication login default group NK-TACS</code> with no <code>local</code>, so a server outage locks everyone out. Using <code>none</code> as the last method. Mismatched shared keys (the server logs "invalid shared secret" and the router shows rejects or timeouts). Forgetting that the server must list the router's source IP.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>aaa new-model</code> must come first; without it the <code>aaa authentication</code> commands are not available. The <code>default</code> list applies to all lines automatically; named lists must be assigned with <code>login authentication NAME</code>. Methods are tried in order, and the next one is used only on ERROR. <code>local</code> after the group is the fallback.</p></div>

<div class="scn"><h4>Locked out by one missing word</h4><p>An engineer enabled AAA on a remote branch router with <code>aaa authentication login default group tacacs+</code>, saved and logged off. That evening the WAN link to the data center, where the TACACS+ servers live, went down. The branch had a working local internet connection, but nobody could log in: the only method was unreachable and there was no fallback. A technician drove to the site with a console cable, but the console used the same default list. They had to perform password recovery. The corrected list was <code>group tacacs+ local</code>, plus a named console list using local only.</p><p><b>Lesson:</b> every AAA list ends with a method that works when the network does not. Test the outage case before you walk away.</p></div>

<div class="iv"><p class="q">"You are enabling TACACS+ on 200 routers. How do you avoid locking yourself out?"</p><p>Strong answer: create a local break-glass user with a scrypt secret first; keep a console or second session open; schedule <code>reload in 10</code> before the change; use <code>aaa authentication login default group TACS local</code> so an unreachable server falls back to local; give the console its own local-only named list; test with <code>test aaa group</code> and a fresh SSH login, then <code>reload cancel</code> and save. Explain that fallback happens on ERROR, not on FAIL, and roll out to a pilot group first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Safety first: local emergency user, open console session, <code>reload in</code> as undo.</li>
<li><code>aaa new-model</code>, then servers and a server group, then method lists.</li>
<li><code>aaa authentication login default group NK-TACS local</code>: server first, local only if the server does not reply.</li>
<li>Named lists apply only where assigned with <code>login authentication NAME</code>; use one for the console.</li>
<li>Verify with <code>show aaa servers</code>, <code>test aaa group</code>, <code>debug aaa authentication</code> and a real login.</li>
</ul></div>
`,hi:`
<p>Method list waisa hi hai jaise aap receptionist ko instructions dete ho: "Jo bhi aaye, pehle head office security ko phone karke uska badge check karo. Agar phone line dead hai, to drawer mein rakhi printed staff list check karo." Order matter karta hai, aur yeh rule bhi ki agar head office <i>na</i> bole, to receptionist drawer mein nahi dekhta. IOS mein woh instruction sheet <b>AAA method list</b> hai.</p>

<h3>Step 0: shuru karne se pehle safety net</h3>
<p>AAA enable karte hi har line ke authenticate karne ka tareeka badal deta hai. Ek typo aapko lock out kar sakta hai. Senior engineers hamesha pehle teen cheezein taiyaar karte hain:</p>
<ul>
<li>Secret ke saath ek <b>local emergency user</b>: <code>username netadmin privilege 15 secret N0c!Admin26</code>.</li>
<li>Ek <b>doosra khula session</b>, ideally console, jo test karte waqt logged in rahe.</li>
<li>Undo button ke roop mein <b>scheduled reload</b>: <code>reload in 10</code>. Agar aap lock out ho gaye, router 10 minute mein saved startup-config ke saath reboot ho jaayega. Jab sab chal jaaye, <code>reload cancel</code> karo aur save karo.</li>
</ul>

<h3>Step 1: AAA on karo</h3>
<pre class="code">EDGE(config)# aaa new-model</pre>
<p><code>aaa new-model</code> device ko purane line-based model se AAA par switch karta hai. Ab se line commands <code>login</code>, <code>login local</code> aur line passwords authentication ke liye use nahi hote. Agar abhi tak koi default list nahi hai, to logins local user database use karte hain, aur isi wajah se emergency user pehle se hona chahiye.</p>

<h3>Step 2: servers define karo</h3>
<pre class="code">EDGE(config)# tacacs server NK-TAC1
EDGE(config-server-tacacs)# address ipv4 10.99.99.20
EDGE(config-server-tacacs)# key T@cK3y2026              <span class="c">! server se match hona chahiye</span>
EDGE(config-server-tacacs)# exit
EDGE(config)# aaa group server tacacs+ NK-TACS
EDGE(config-sg-tacacs+)# server name NK-TAC1
EDGE(config-sg-tacacs+)# exit
EDGE(config)# ip tacacs source-interface GigabitEthernet0/1</pre>
<p>RADIUS version lagbhag same dikhta hai:</p>
<pre class="code">EDGE(config)# radius server NK-RAD1
EDGE(config-radius-server)# address ipv4 10.99.99.21 auth-port 1812 acct-port 1813
EDGE(config-radius-server)# key R@dK3y2026
EDGE(config-radius-server)# exit
EDGE(config)# aaa group server radius NK-RADS
EDGE(config-sg-radius)# server name NK-RAD1</pre>
<p><b>Shared key</b> router aur server par bilkul same honi chahiye, jahan router isi key aur apne source IP ke saath network device ke roop mein registered hota hai.</p>

<h3>Step 3: method lists banao</h3>
<pre class="code">EDGE(config)# aaa authentication login default group NK-TACS local
EDGE(config)# aaa authentication login CONSOLE local
EDGE(config)# aaa authorization exec default group NK-TACS local
EDGE(config)# aaa accounting exec default start-stop group NK-TACS
EDGE(config)# aaa accounting commands 15 default start-stop group NK-TACS
EDGE(config)# line con 0
EDGE(config-line)# login authentication CONSOLE</pre>
<ul>
<li><b>aaa authentication login default</b> apne aap har us line par lagta hai jiski koi named list nahi, saari VTY lines samet.</li>
<li><b>group NK-TACS local</b> methods ki ordered list hai: pehle TACACS+, agar servers jawab na dein to local database.</li>
<li><b>Named list</b> (CONSOLE) sirf wahan lagti hai jahan aap use <code>login authentication CONSOLE</code> se assign karte ho. Yahan console sirf local users use karta hai, isliye toota hua AAA server console ko kabhi block nahi kar sakta.</li>
<li><b>aaa authorization exec</b> server ko login par privilege level decide karne deta hai.</li>
<li><b>aaa accounting exec</b> session start aur stop record karta hai; <b>accounting commands 15</b> har level-15 command record karta hai.</li>
</ul>

<table class="cmp"><tr><th>Method keyword</th><th>Matlab</th></tr>
<tr><td><code>group tacacs+</code> / <code>group radius</code></td><td>Us type ke saare configured servers</td></tr>
<tr><td><code>group NAME</code></td><td>Sirf us named group ke servers</td></tr>
<tr><td><code>local</code></td><td>Local username database</td></tr>
<tr><td><code>enable</code></td><td>Enable secret (enable authentication lists mein use hota hai)</td></tr>
<tr><td><code>none</code></td><td>Koi authentication nahi: sab andar aa jaate hain. VTY lines par kabhi nahi</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Method list ka faisla">
<rect x="10" y="80" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="102" text-anchor="middle" class="svg-ink" font-size="13">Login attempt</text><text x="70" y="119" text-anchor="middle" class="svg-muted" font-size="12">netadmin</text>
<rect x="180" y="80" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="250" y="102" text-anchor="middle" class="svg-ink" font-size="13">1. group NK-TACS</text><text x="250" y="119" text-anchor="middle" class="svg-muted" font-size="12">TACACS+ se poocho</text>
<rect x="400" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="455" y="48" text-anchor="middle" class="svg-ink" font-size="13">PASS: login</text>
<rect x="400" y="87" width="110" height="46" rx="8" fill="#fed7aa"/><text x="455" y="115" text-anchor="middle" class="svg-ink" font-size="13">FAIL: denied</text>
<rect x="400" y="154" width="110" height="46" rx="8" fill="#fde68a"/><text x="455" y="176" text-anchor="middle" class="svg-ink" font-size="13">ERROR: jawab nahi</text>
<rect x="540" y="154" width="90" height="46" rx="8" fill="#bae6fd"/><text x="585" y="176" text-anchor="middle" class="svg-ink" font-size="13">2. local</text>
<line x1="130" y1="105" x2="180" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="100" x2="400" y2="43" stroke="#64748b" stroke-width="2"/><line x1="320" y1="105" x2="400" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="112" x2="400" y2="177" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="177" x2="540" y2="177" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Sirf ERROR (server unreachable) agle method par jaata hai. Server ka FAIL final hai.</p></div>

<h3>Verification</h3>
<pre class="out">EDGE# show aaa servers

TACACS+: id 1, priority 1, host 10.99.99.20, auth-port 49
     <span class="hl">State: current UP, duration 5132s, previous duration 0s</span>
     Dead: total time 0s, count 0
     Authen: request 14, timeouts 0, failover 0, retransmission 0
             Response: accept 12, reject 2, challenge 0

EDGE# test aaa group NK-TACS netadmin N0c!Admin26 legacy
Attempting authentication test to server-group NK-TACS using tacacs+
<span class="hl">User was successfully authenticated.</span>

EDGE# show running-config | section aaa
aaa new-model
aaa group server tacacs+ NK-TACS
 server name NK-TAC1
aaa authentication login default group NK-TACS local
aaa authentication login CONSOLE local
aaa authorization exec default group NK-TACS local
aaa accounting exec default start-stop group NK-TACS
aaa accounting commands 15 default start-stop group NK-TACS</pre>
<p>Test ke dauraan step-by-step detail ke liye <code>debug aaa authentication</code> dikhata hai ki kaunsi method list chuni gayi aur kis method ne jawab diya; baad mein <code>undebug all</code> se band karo.</p>

<div class="eg"><p><b>Worked example.</b> TACACS+ server 10.99.99.20 maintenance ke liye band hai. <code>show aaa servers</code> ab <code>State: current DEAD</code> dikhata hai. netadmin PC-ADMIN se SSH karta hai: router NK-TACS try karta hai, timeout ke baad jawab nahi milta, <code>local</code> par fallback karta hai aur local secret accept karta hai, isliye thodi der ke baad login succeed hota hai. Jab server wapas aata hai, ek user jiska AD account disabled hai login try karta hai; server reject jawab deta hai, aur bhale hi wahi naam locally exist karta ho, login deny hota hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Bina local user aur bina console session ke <code>aaa new-model</code> type karna. <code>local</code> ke bina <code>aaa authentication login default group NK-TACS</code> likhna, jisse server outage sabko lock out kar deta hai. Aakhri method ke roop mein <code>none</code> use karna. Shared keys mismatch (server "invalid shared secret" log karta hai aur router rejects ya timeouts dikhata hai). Yeh bhool jaana ki server par router ka source IP listed hona chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>aaa new-model</code> pehle aana chahiye; iske bina <code>aaa authentication</code> commands available nahi hoti. <code>default</code> list apne aap saari lines par lagti hai; named lists ko <code>login authentication NAME</code> se assign karna padta hai. Methods order mein try hote hain, aur agla sirf ERROR par use hota hai. Group ke baad <code>local</code> fallback hai.</p></div>

<div class="scn"><h4>Ek chhoote hue shabd se lockout</h4><p>Ek engineer ne remote branch router par <code>aaa authentication login default group tacacs+</code> ke saath AAA enable kiya, save kiya aur log off kar gaya. Us shaam data center ka WAN link, jahan TACACS+ servers the, down ho gaya. Branch ka local internet connection chal raha tha, lekin koi login nahi kar saka: akela method unreachable tha aur koi fallback nahi tha. Ek technician console cable lekar site gaya, lekin console bhi wahi default list use kar raha tha. Unhe password recovery karni padi. Sahi list thi <code>group tacacs+ local</code>, plus sirf local use karne wali named console list.</p><p><b>Seekh:</b> har AAA list aise method par khatam honi chahiye jo network na chalne par bhi kaam kare. Chhod kar jaane se pehle outage wala case test karo.</p></div>

<div class="iv"><p class="q">"Aap 200 routers par TACACS+ enable kar rahe ho. Khud ko lock out hone se kaise bachaoge?"</p><p>Strong answer: pehle scrypt secret ke saath local break-glass user banao; console ya doosra session khula rakho; change se pehle <code>reload in 10</code> schedule karo; <code>aaa authentication login default group TACS local</code> use karo taaki unreachable server local par fallback kare; console ko apni local-only named list do; <code>test aaa group</code> aur fresh SSH login se test karo, phir <code>reload cancel</code> aur save. Samjhao ki fallback ERROR par hota hai, FAIL par nahi, aur pehle pilot group par roll out karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle safety: local emergency user, khula console session, undo ke liye <code>reload in</code>.</li>
<li><code>aaa new-model</code>, phir servers aur server group, phir method lists.</li>
<li><code>aaa authentication login default group NK-TACS local</code>: pehle server, local sirf tab jab server jawab na de.</li>
<li>Named lists sirf wahan lagti hain jahan <code>login authentication NAME</code> se assign ho; console ke liye ek use karo.</li>
<li><code>show aaa servers</code>, <code>test aaa group</code>, <code>debug aaa authentication</code> aur asli login se verify karo.</li>
</ul></div>
`}};export{e as default};