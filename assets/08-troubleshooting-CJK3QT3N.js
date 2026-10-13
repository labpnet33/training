var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: nobody can log in`,hi:`Troubleshooting workflow: koi login nahi kar pa raha`},body:{en:`
<p>"802.1X is broken" is not a fault; it is a feeling. The method below separates three zones, and each zone has its own command: the <b>host</b>, the <b>switch</b>, and the <b>server path</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three zones">
<rect x="10" y="40" width="190" height="80" rx="12" fill="#bbf7d0"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">Zone 1: host</text><text x="105" y="88" text-anchor="middle" class="svg-muted" font-size="11">supplicant on? right password?</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="11">show dot1x interface</text>
<rect x="225" y="40" width="190" height="80" rx="12" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">Zone 2: switch</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">profile, mode, VLAN exists?</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">show configuration</text>
<rect x="440" y="40" width="190" height="80" rx="12" fill="#ddd6fe"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">Zone 3: server path</text><text x="535" y="88" text-anchor="middle" class="svg-muted" font-size="11">address, secret, client list</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="11">aaa statistics</text>
</svg><p class="cap">Accepts and rejects point to zone 1 or 2; timeouts point to zone 3.</p></div>

<h3>Decision table</h3>
<table class="cmp"><tr><th>aaa statistics show</th><th>Meaning</th><th>Look at</th></tr>
<tr><td>Rejects growing</td><td>server is up and says no</td><td>user name, password, MAC not registered; <code>show dot1x authentication-failed-users</code></td></tr>
<tr><td>Timeouts growing, Requests growing</td><td>no answer</td><td>server address in the profile, route, secret, client list on server</td></tr>
<tr><td>Requests not growing at all</td><td>host never starts, or port not an authenticator</td><td>supplicant on host, interface under protocols dot1x</td></tr>
<tr><td>Accepts but no access</td><td>VLAN problem</td><td>VLAN name returned exists on the switch; gateway</td></tr></table>

<h3>Lab 3: nobody logs in on the support floor</h3>
<p><b>Ticket.</b> After a weekend migration, HELP1 on ge-0/0/1 is held, and trainees TR1 and TR2 behind a desk switch on ge-0/0/4 are locked out. The server team says: NKRAD3 is 10.77.50.10, secret is the one in the vault.</p>
<p><b>Step 1: what does the switch say?</b></p>
<pre class="out">lab@SUPSW&gt; show dot1x interface
Interface     Role           State           MAC address          User
ge-0/0/1.0    Authenticator  Held            00:50:68:99:b4:01    help1
ge-0/0/4.0    Authenticator  Held            00:50:46:58:ed:01    trainee1

lab@SUPSW&gt; show dot1x interface ge-0/0/1 detail
    Supplicant: help1, 00:50:68:99:b4:01
      Operational state:                Held
      Held reason:                      <span class="hl">RADIUS server unreachable (no RADIUS server answered (unreachable))</span>
      802.1X / MAC RADIUS / portal:     Server timeout / Not run / Not run</pre>
<p>The held reason says the server did not answer, not that the user is wrong. That is zone 3.</p>
<p><b>Step 2: which server gets the requests?</b></p>
<pre class="out">lab@SUPSW&gt; show network-access aaa statistics authentication
Requests received: 4
Accepts: 0
Rejects: 0
Timeouts: 4
RADIUS servers
Server           Requests  Accepts  Rejects  Challenges  Timeouts
<span class="hl">10.77.50.100</span>     4         0        0        0           4</pre>
<p>Requests go to <b>10.77.50.100</b>, not 10.77.50.10. The profile has an extra zero: <code>authentication-server 10.77.50.100</code> although the radius-server entry is 10.77.50.10. Fix:</p>
<pre class="code">delete access profile NK-AUTH radius authentication-server 10.77.50.100
set access profile NK-AUTH radius authentication-server 10.77.50.10
commit</pre>
<p><b>Step 3: requests arrive, still held. Why?</b> Ask the server:</p>
<pre class="out">NKRAD3&gt; aaa-server show log
Recent events:
  RADIUS request from 10.77.50.1 ignored: <span class="hl">shared key mismatch</span>
  RADIUS request from 10.77.50.1 ignored: shared key mismatch</pre>
<p>The server sees the switch (10.77.50.1 is a known client) but the secret differs: the switch has the old secret, the server <code>Noida-Rad-10</code>. Fix with <code>set access radius-server 10.77.50.10 secret "&lt;correct secret&gt;"</code> and commit. Note the pattern: switch says timeout, server says mismatch, nobody says "wrong password".</p>
<p><b>Step 4: HELP1 works, but only trainee1 behind the desk switch.</b> The port is <code>single-secure</code>: one host authenticated, the others blocked. Change it:</p>
<pre class="code">set protocols dot1x authenticator interface ge-0/0/4 supplicant multiple</pre>
<pre class="out">lab@SUPSW&gt; show dot1x interface
ge-0/0/1.0    Authenticator  Authenticated   00:50:68:99:b4:01    help1
ge-0/0/4.0    Authenticator  Authenticated   00:50:46:58:ed:01    trainee1
ge-0/0/4.0    Authenticator  Authenticated   00:50:45:58:ec:01    trainee2

lab@SUPSW&gt; show network-access aaa statistics authentication
Server           Requests  Accepts  Rejects  Challenges  Timeouts
10.77.50.100     4         0        0        0           4
10.77.50.10      6         4        0        4           2</pre>
<p>The old server line stays in the counters (history). The new server shows accepts. Three faults in one ticket: wrong server address, wrong secret, wrong supplicant mode.</p>

<h3>Lab 1 follow-up: kabir is Held</h3>
<p>Here the server answers, with a <i>reject</i>: <code>show dot1x authentication-failed-users</code> shows "rejected by RADIUS server" and the server log says "wrong password". The fix is on the laptop, not on the switch.</p>

<h3>Quick checklist</h3>
<ol>
<li>Is the port an authenticator port and an access port?</li>
<li>Held reason in <code>detail</code>: server unreachable or rejected?</li>
<li>Does <code>profile ... authentication-server</code> equal an address under <code>radius-server</code>?</li>
<li>Can the switch route to the server (and does the server know the source address of the switch)?</li>
<li>Does the secret match? Server log: shared key mismatch.</li>
<li>Does the VLAN returned by RADIUS exist?</li>
<li>Right supplicant mode for the number of hosts?</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Changing the user's password when the server is unreachable. Reading "Held" as "bad password". Fixing one fault and stopping: after each fix re-check the held reason and the statistics, because the next fault is often hidden behind the first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeouts are never a user problem. Rejects are never a routing problem. Learn that mapping and many questions answer themselves.</p></div>

<div class="scn"><h4>Three faults in one ticket</h4><p>The contractor had moved the support floor to a new RADIUS server. The first fault (typo in the server address) produced timeouts. Fixing it exposed the second (an old secret). Fixing that let HELP1 in but the trainees behind a desk switch were still locked out, the third fault, caused by single-secure. A helpdesk analyst who stopped after the first fix would have closed the ticket too early.</p><p><b>Lesson:</b> keep testing end to end with every user type before closing.</p></div>

<div class="iv"><p class="q">"Users report they cannot authenticate. What are your first three commands?"</p><p>show dot1x interface detail to see the state and the held reason, show network-access aaa statistics authentication to see accepts, rejects or timeouts per server, and the server log or show configuration access to verify the address and secret. Timeouts point to the path, rejects to the user.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three zones: host, switch, server path.</li>
<li>Timeouts: address, route, secret, client list. Rejects: credentials.</li>
<li>The held reason in detail output usually names the zone.</li>
<li>The server log shows "shared key mismatch" when the secret is wrong.</li>
<li>Re-test after each fix; there may be several faults.</li>
</ul></div>
`,hi:`
<p>"802.1X toota hua hai" fault nahi, ek ehsaas hai. Neeche ka tareeka teen zones alag karta hai, aur har zone ka apna command hai: <b>host</b>, <b>switch</b> aur <b>server path</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Teen zones">
<rect x="10" y="40" width="190" height="80" rx="12" fill="#bbf7d0"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">Zone 1: host</text><text x="105" y="88" text-anchor="middle" class="svg-muted" font-size="11">supplicant on? sahi password?</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="11">show dot1x interface</text>
<rect x="225" y="40" width="190" height="80" rx="12" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">Zone 2: switch</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">profile, mode, VLAN exist?</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">show configuration</text>
<rect x="440" y="40" width="190" height="80" rx="12" fill="#ddd6fe"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">Zone 3: server path</text><text x="535" y="88" text-anchor="middle" class="svg-muted" font-size="11">address, secret, client list</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="11">aaa statistics</text>
</svg><p class="cap">Accepts aur rejects zone 1 ya 2 ki taraf; timeouts zone 3 ki taraf.</p></div>

<h3>Decision table</h3>
<table class="cmp"><tr><th>aaa statistics kya dikhate hain</th><th>Matlab</th><th>Kahan dekhein</th></tr>
<tr><td>Rejects badh rahe hain</td><td>server up hai aur na bol raha hai</td><td>user name, password, MAC registered nahi; <code>show dot1x authentication-failed-users</code></td></tr>
<tr><td>Timeouts badh rahe, Requests badh rahe</td><td>jawab nahi</td><td>profile mein server address, route, secret, server par client list</td></tr>
<tr><td>Requests bilkul nahi badh rahe</td><td>host shuru hi nahi karta, ya port authenticator nahi</td><td>host par supplicant, protocols dot1x ke neeche interface</td></tr>
<tr><td>Accepts hain par access nahi</td><td>VLAN problem</td><td>return kiya VLAN name switch par exist karta hai; gateway</td></tr></table>

<h3>Lab 3: support floor par koi login nahi kar pa raha</h3>
<p><b>Ticket.</b> Weekend migration ke baad ge-0/0/1 par HELP1 held hai, aur ge-0/0/4 ke desk switch ke peeche trainees TR1 aur TR2 bahar hain. Server team kehti hai: NKRAD3 10.77.50.10 hai, secret vault wala hai.</p>
<p><b>Step 1: switch kya kehta hai?</b></p>
<pre class="out">lab@SUPSW&gt; show dot1x interface
Interface     Role           State           MAC address          User
ge-0/0/1.0    Authenticator  Held            00:50:68:99:b4:01    help1
ge-0/0/4.0    Authenticator  Held            00:50:46:58:ed:01    trainee1

lab@SUPSW&gt; show dot1x interface ge-0/0/1 detail
    Supplicant: help1, 00:50:68:99:b4:01
      Operational state:                Held
      Held reason:                      <span class="hl">RADIUS server unreachable (no RADIUS server answered (unreachable))</span>
      802.1X / MAC RADIUS / portal:     Server timeout / Not run / Not run</pre>
<p>Held reason kehta hai ki server ne jawab nahi diya, yeh nahi ki user galat hai. Yeh zone 3 hai.</p>
<p><b>Step 2: requests kis server ko ja rahi hain?</b></p>
<pre class="out">lab@SUPSW&gt; show network-access aaa statistics authentication
Requests received: 4
Accepts: 0
Rejects: 0
Timeouts: 4
RADIUS servers
Server           Requests  Accepts  Rejects  Challenges  Timeouts
<span class="hl">10.77.50.100</span>     4         0        0        0           4</pre>
<p>Requests <b>10.77.50.100</b> ko ja rahi hain, 10.77.50.10 ko nahi. Profile mein ek extra zero hai: <code>authentication-server 10.77.50.100</code> jabki radius-server entry 10.77.50.10 hai. Fix:</p>
<pre class="code">delete access profile NK-AUTH radius authentication-server 10.77.50.100
set access profile NK-AUTH radius authentication-server 10.77.50.10
commit</pre>
<p><b>Step 3: requests pahunch rahi hain, phir bhi held. Kyun?</b> Server se poochho:</p>
<pre class="out">NKRAD3&gt; aaa-server show log
Recent events:
  RADIUS request from 10.77.50.1 ignored: <span class="hl">shared key mismatch</span>
  RADIUS request from 10.77.50.1 ignored: shared key mismatch</pre>
<p>Server switch ko dekhta hai (10.77.50.1 known client hai) par secret alag hai: switch ke paas purana secret hai, server par <code>Noida-Rad-10</code>. <code>set access radius-server 10.77.50.10 secret "&lt;sahi secret&gt;"</code> se fix karo aur commit. Pattern dekho: switch timeout kehta hai, server mismatch kehta hai, koi "wrong password" nahi kehta.</p>
<p><b>Step 4: HELP1 chalta hai, par desk switch ke peeche sirf trainee1.</b> Port <code>single-secure</code> hai: ek host authenticated, baaki blocked. Badlo:</p>
<pre class="code">set protocols dot1x authenticator interface ge-0/0/4 supplicant multiple</pre>
<pre class="out">lab@SUPSW&gt; show dot1x interface
ge-0/0/1.0    Authenticator  Authenticated   00:50:68:99:b4:01    help1
ge-0/0/4.0    Authenticator  Authenticated   00:50:46:58:ed:01    trainee1
ge-0/0/4.0    Authenticator  Authenticated   00:50:45:58:ec:01    trainee2

lab@SUPSW&gt; show network-access aaa statistics authentication
Server           Requests  Accepts  Rejects  Challenges  Timeouts
10.77.50.100     4         0        0        0           4
10.77.50.10      6         4        0        4           2</pre>
<p>Purane server ki line counters mein (history) rehti hai. Naya server accepts dikhata hai. Ek ticket mein teen faults: galat server address, galat secret, galat supplicant mode.</p>

<h3>Lab 1 follow-up: kabir Held hai</h3>
<p>Yahan server jawab deta hai, <i>reject</i> ke saath: <code>show dot1x authentication-failed-users</code> "rejected by RADIUS server" dikhata hai aur server log "wrong password" kehta hai. Fix laptop par hai, switch par nahi.</p>

<h3>Quick checklist</h3>
<ol>
<li>Kya port authenticator port aur access port hai?</li>
<li><code>detail</code> mein held reason: server unreachable ya rejected?</li>
<li>Kya <code>profile ... authentication-server</code> <code>radius-server</code> ke neeche ke address ke barabar hai?</li>
<li>Kya switch server tak route kar sakta hai (aur server ko switch ka source address pata hai)?</li>
<li>Kya secret match karta hai? Server log: shared key mismatch.</li>
<li>Kya RADIUS ka return kiya VLAN exist karta hai?</li>
<li>Hosts ki sankhya ke liye sahi supplicant mode?</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Server unreachable ho tab user ka password badalna. "Held" ko "bad password" padhna. Ek fault theek karke ruk jaana: har fix ke baad held reason aur statistics dobara check karo, kyunki agla fault aksar pehle ke peeche chhupa hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeouts kabhi user problem nahi hote. Rejects kabhi routing problem nahi hote. Yeh mapping seekh lo to kai sawaal khud hal ho jaate hain.</p></div>

<div class="scn"><h4>Ek ticket mein teen faults</h4><p>Contractor ne support floor ko naye RADIUS server par move kiya tha. Pehle fault (server address mein typo) se timeouts aaye. Use theek karne par doosra (purana secret) saamne aaya. Use theek karne par HELP1 andar aaya par desk switch ke peeche trainees phir bhi bahar the, teesra fault, single-secure se. Jo helpdesk analyst pehle fix ke baad ruk jaata woh ticket jaldi band kar deta.</p><p><b>Lesson:</b> ticket band karne se pehle har user type ke saath end to end test karte raho.</p></div>

<div class="iv"><p class="q">"Users kehte hain authenticate nahi ho paa rahe. Tumhare pehle teen commands kaunse?"</p><p>State aur held reason ke liye show dot1x interface detail, har server ke accepts, rejects ya timeouts ke liye show network-access aaa statistics authentication, aur address aur secret verify karne ke liye server log ya show configuration access. Timeouts path ki taraf, rejects user ki taraf ishaara karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen zones: host, switch, server path.</li>
<li>Timeouts: address, route, secret, client list. Rejects: credentials.</li>
<li>Detail output ka held reason aksar zone batata hai.</li>
<li>Secret galat ho to server log "shared key mismatch" dikhata hai.</li>
<li>Har fix ke baad dobara test karo; kai faults ho sakte hain.</li>
</ul></div>
`}};export{e as default};