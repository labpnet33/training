var e={id:`fallback-vlans`,h:{en:`Guest, server-reject and server-fail: planned failure behaviour`,hi:`Guest, server-reject aur server-fail: planned failure behaviour`},body:{en:`
<p>Not every authentication ends in Accept. A professional design decides, <b>per port and in advance</b>, what happens in each failure case. Junos separates three situations that beginners mix up.</p>

<h3>Three failures, three answers</h3>
<table class="cmp"><tr><th>What happened</th><th>RADIUS said</th><th>Statement</th></tr>
<tr><td>The host never answers EAPOL (and MAC RADIUS or portal do not apply)</td><td>nothing was asked</td><td><code>guest-vlan GUEST</code></td></tr>
<tr><td>The host answers but the credentials are wrong</td><td><b>Access-Reject</b></td><td><code>server-reject-vlan QUARANTINE</code></td></tr>
<tr><td>The server does not answer (down, unreachable, bad secret)</td><td><b>silence</b>, timeout</td><td><code>server-fail ...</code></td></tr></table>
<p>Do not confuse reject with fail. A reject is an answer: the server is up and says no. A server-fail is no answer at all. Different cause, different action.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Decision tree of failure cases">
<rect x="240" y="10" width="160" height="40" rx="10" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Host on the port</text>
<rect x="20" y="90" width="170" height="50" rx="10" fill="#fde68a"/><text x="105" y="112" text-anchor="middle" class="svg-ink" font-size="12">No EAPOL response</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="11">guest-vlan</text>
<rect x="235" y="90" width="170" height="50" rx="10" fill="#fed7aa"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">Access-Reject</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="11">server-reject-vlan</text>
<rect x="450" y="90" width="170" height="50" rx="10" fill="#ddd6fe"/><text x="535" y="112" text-anchor="middle" class="svg-ink" font-size="12">Server timeout</text><text x="535" y="128" text-anchor="middle" class="svg-muted" font-size="11">server-fail action</text>
<line x1="290" y1="50" x2="105" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="350" y1="50" x2="535" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">deny, permit, use-cache, or a named server-fail VLAN</text>
</svg><p class="cap">Decide for each branch before the outage, not during it.</p></div>

<h3>Guest VLAN</h3>
<pre class="code">set protocols dot1x authenticator interface ge-0/0/3 guest-vlan GUEST</pre>
<p>When the EAPOL requests go unanswered and no other method succeeds, the port is authorised in GUEST. That is the lab's guest printer. Real output after about a minute:</p>
<pre class="out">lab@FLOOR3&gt; show dot1x interface ge-0/0/3 detail
ge-0/0/3.0
  Guest VLAN member:                    GUEST
  Server fail action:                   deny
    Supplicant: unknown, 00:1b:a9:44:10:07
      Operational state:                Authenticated
      Authentication method:            Guest VLAN
      Authenticated VLAN:               GUEST
      802.1X / MAC RADIUS / portal:     <span class="hl">No response</span> / Not run / Not run</pre>

<h3>Server-reject VLAN</h3>
<pre class="code">set protocols dot1x authenticator interface ge-0/0/8 server-reject-vlan QUARANTINE</pre>
<p>Instead of leaving a rejected user held and silent, place the host in a <b>remediation VLAN</b>: for example one that only reaches a help page and the password-reset service. In the lab, kabir has an old saved password and is Held; with a reject VLAN he would be authorised into QUARANTINE.</p>

<h3>Server-fail actions</h3>
<table class="cmp"><tr><th>Action</th><th>Result for a host that logs in while RADIUS is down</th><th>Typical use</th></tr>
<tr><td><code>deny</code> (default)</td><td>stays unauthenticated</td><td>secure labs, server rooms</td></tr>
<tr><td><code>permit</code></td><td>authorised in the port's own VLAN</td><td>wards, factory floors: work must go on</td></tr>
<tr><td><code>use-cache</code></td><td>hosts that passed before keep their result; new hosts are denied</td><td>offices with stable staff</td></tr>
<tr><td><code>vlan-name</code> + <code>server-fail-vlan</code></td><td>authorised in a dedicated server-fail VLAN</td><td>limited access during outages</td></tr></table>
<pre class="code">set protocols dot1x authenticator interface ge-0/0/1 server-fail permit</pre>

<h3>Real output: the RADIUS server is stopped</h3>
<p>In Lab 2 the server NKRAD2 is stopped and ANIL on ge-0/0/1 is forced to log in again with <code>clear dot1x interface ge-0/0/1</code>:</p>
<pre class="out">lab@LABSW&gt; show dot1x interface ge-0/0/1 detail
ge-0/0/1.0
  Supplicant mode:                      Single-Secure
  Server fail action:                   <span class="hl">permit</span>
    Supplicant: anil, 00:50:cc:5f:57:01
      Operational state:                Authenticated
      Authentication method:            <span class="hl">Server Fail</span>
      Authenticated VLAN:               STAFF
      802.1X / MAC RADIUS / portal:     <span class="hl">Server timeout</span> / Not run / Not run

lab@LABSW&gt; show network-access aaa statistics authentication
Server           Requests  Accepts  Rejects  Challenges  Timeouts
10.44.50.10      5         4        0        2           1</pre>
<p>Anil is authorised, method "Server Fail", in his port's own VLAN STAFF. The aaa statistics show a timeout against the server.</p>

<h3>Important timing rule</h3>
<p>Server-fail is evaluated only when a host <b>(re)authenticates</b>: a new login, a reauthentication timer expiry (default 3600 s), or a clear command. A laptop already authorised keeps working when RADIUS dies. This is why a RADIUS outage is first noticed an hour later or at 09:00 Monday when everyone logs in.</p>

<div class="warn"><p><b>Common mistakes.</b> Choosing server-fail permit on a port with sensitive resources without a restricted VLAN. Expecting server-fail to trigger on a reject. Putting guest-vlan on a port where all hosts have supplicants and then wondering why hosts with misconfigured supplicants get through.</p></div>
<div class="exam"><p><b>Exam trap.</b> guest-vlan = no EAPOL response; server-reject-vlan = Access-Reject; server-fail = no RADIUS answer. The default server-fail action is deny.</p></div>

<div class="scn"><h4>The Monday morning outage</h4><p>A RADIUS server disk filled up on Sunday night. At 08:45 on Monday 200 users could not log in, and the helpdesk was flooded. The team had server-fail deny on all ports. After the incident they chose server-fail permit with a restricted VLAN on staff ports and use-cache on finance ports, plus a second RADIUS server.</p><p><b>Lesson:</b> decide the outage behaviour during design, and add a second server.</p></div>

<div class="iv"><p class="q">"What is the difference between server-reject and server-fail?"</p><p>Server-reject means RADIUS answered with an Access-Reject; the server is healthy and the credentials are bad, so I can put the host in a remediation VLAN. Server-fail means RADIUS did not answer at all, so I choose deny, permit, use-cache or a fail VLAN depending on the risk of the port.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>guest-vlan: host never speaks 802.1X. server-reject-vlan: Access-Reject. server-fail: no answer.</li>
<li>server-fail options: deny (default), permit, use-cache, a named VLAN.</li>
<li>Fallbacks apply only at (re)authentication; authorised hosts keep running.</li>
<li>Quarantine and guest VLANs must be restricted.</li>
<li>Always run at least two RADIUS servers.</li>
</ul></div>
`,hi:`
<p>Har authentication Accept par khatam nahi hoti. Professional design <b>har port ke liye aur pehle se</b> tay karta hai ki har failure case mein kya hoga. Junos teen situations ko alag karta hai jinhe beginners mix kar dete hain.</p>

<h3>Teen failures, teen jawab</h3>
<table class="cmp"><tr><th>Kya hua</th><th>RADIUS ne kya kaha</th><th>Statement</th></tr>
<tr><td>Host EAPOL ka jawab hi nahi deta (aur MAC RADIUS ya portal lagu nahi)</td><td>kuch poochha hi nahi gaya</td><td><code>guest-vlan GUEST</code></td></tr>
<tr><td>Host jawab deta hai par credentials galat</td><td><b>Access-Reject</b></td><td><code>server-reject-vlan QUARANTINE</code></td></tr>
<tr><td>Server jawab nahi deta (down, unreachable, galat secret)</td><td><b>chuppi</b>, timeout</td><td><code>server-fail ...</code></td></tr></table>
<p>Reject aur fail ko mix mat karo. Reject ek jawab hai: server up hai aur na bolta hai. Server-fail mein jawab hi nahi aata. Alag kaaran, alag action.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Failure cases ka decision tree">
<rect x="240" y="10" width="160" height="40" rx="10" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Port par host</text>
<rect x="20" y="90" width="170" height="50" rx="10" fill="#fde68a"/><text x="105" y="112" text-anchor="middle" class="svg-ink" font-size="12">EAPOL response nahi</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="11">guest-vlan</text>
<rect x="235" y="90" width="170" height="50" rx="10" fill="#fed7aa"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">Access-Reject</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="11">server-reject-vlan</text>
<rect x="450" y="90" width="170" height="50" rx="10" fill="#ddd6fe"/><text x="535" y="112" text-anchor="middle" class="svg-ink" font-size="12">Server timeout</text><text x="535" y="128" text-anchor="middle" class="svg-muted" font-size="11">server-fail action</text>
<line x1="290" y1="50" x2="105" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="350" y1="50" x2="535" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">deny, permit, use-cache, ya named server-fail VLAN</text>
</svg><p class="cap">Har branch ka faisla outage se pehle karo, outage ke dauran nahi.</p></div>

<h3>Guest VLAN</h3>
<pre class="code">set protocols dot1x authenticator interface ge-0/0/3 guest-vlan GUEST</pre>
<p>EAPOL requests unanswered rahein aur koi aur method succeed na ho to port GUEST mein authorised hota hai. Yahi lab ka guest printer hai. Kareeb ek minute baad asli output:</p>
<pre class="out">lab@FLOOR3&gt; show dot1x interface ge-0/0/3 detail
ge-0/0/3.0
  Guest VLAN member:                    GUEST
  Server fail action:                   deny
    Supplicant: unknown, 00:1b:a9:44:10:07
      Operational state:                Authenticated
      Authentication method:            Guest VLAN
      Authenticated VLAN:               GUEST
      802.1X / MAC RADIUS / portal:     <span class="hl">No response</span> / Not run / Not run</pre>

<h3>Server-reject VLAN</h3>
<pre class="code">set protocols dot1x authenticator interface ge-0/0/8 server-reject-vlan QUARANTINE</pre>
<p>Rejected user ko held aur chup chhodne ki jagah host ko <b>remediation VLAN</b> mein daalo: jaise woh jo sirf help page aur password-reset service tak pahunche. Lab mein kabir ka purana saved password hai aur woh Held hai; reject VLAN ke saath woh QUARANTINE mein authorised hota.</p>

<h3>Server-fail actions</h3>
<table class="cmp"><tr><th>Action</th><th>RADIUS down hone par login karne wale host ka result</th><th>Aam use</th></tr>
<tr><td><code>deny</code> (default)</td><td>unauthenticated rehta hai</td><td>secure labs, server rooms</td></tr>
<tr><td><code>permit</code></td><td>port ke apne VLAN mein authorised</td><td>wards, factory floors: kaam chalna chahiye</td></tr>
<tr><td><code>use-cache</code></td><td>jo hosts pehle pass hue unka result chalta hai; naye hosts deny</td><td>stable staff wale offices</td></tr>
<tr><td><code>vlan-name</code> + <code>server-fail-vlan</code></td><td>dedicated server-fail VLAN mein authorised</td><td>outage mein limited access</td></tr></table>
<pre class="code">set protocols dot1x authenticator interface ge-0/0/1 server-fail permit</pre>

<h3>Asli output: RADIUS server stop kiya gaya</h3>
<p>Lab 2 mein server NKRAD2 stop hota hai aur ge-0/0/1 par ANIL ko <code>clear dot1x interface ge-0/0/1</code> se dobara login karwaya jaata hai:</p>
<pre class="out">lab@LABSW&gt; show dot1x interface ge-0/0/1 detail
ge-0/0/1.0
  Supplicant mode:                      Single-Secure
  Server fail action:                   <span class="hl">permit</span>
    Supplicant: anil, 00:50:cc:5f:57:01
      Operational state:                Authenticated
      Authentication method:            <span class="hl">Server Fail</span>
      Authenticated VLAN:               STAFF
      802.1X / MAC RADIUS / portal:     <span class="hl">Server timeout</span> / Not run / Not run

lab@LABSW&gt; show network-access aaa statistics authentication
Server           Requests  Accepts  Rejects  Challenges  Timeouts
10.44.50.10      5         4        0        2           1</pre>
<p>Anil authorised hai, method "Server Fail", apne port ke VLAN STAFF mein. aaa statistics server ke against timeout dikhate hain.</p>

<h3>Zaroori timing rule</h3>
<p>Server-fail sirf tab evaluate hota hai jab host <b>(re)authenticate</b> karta hai: naya login, reauthentication timer expiry (default 3600 s), ya clear command. Pehle se authorised laptop RADIUS marne par bhi chalta rehta hai. Isliye RADIUS outage ka pehla pata ek ghante baad ya Monday 09:00 par chalta hai jab sab login karte hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Sensitive resources wale port par restricted VLAN ke bina server-fail permit chunna. Reject par server-fail trigger hone ki ummeed. Sabhi hosts ke supplicant wale port par guest-vlan lagana aur phir hairan hona ki misconfigured supplicant wale hosts andar aa jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> guest-vlan = EAPOL response nahi; server-reject-vlan = Access-Reject; server-fail = RADIUS ka jawab nahi. Default server-fail action deny hai.</p></div>

<div class="scn"><h4>Monday subah ka outage</h4><p>Ek RADIUS server ki disk Sunday raat bhar gayi. Monday 08:45 par 200 users login nahi kar paaye aur helpdesk bhar gaya. Team ke paas saare ports par server-fail deny tha. Incident ke baad unhone staff ports par restricted VLAN ke saath server-fail permit, finance ports par use-cache, aur doosra RADIUS server rakha.</p><p><b>Lesson:</b> outage behaviour design ke dauran tay karo, aur doosra server lagao.</p></div>

<div class="iv"><p class="q">"Server-reject aur server-fail mein kya difference hai?"</p><p>Server-reject matlab RADIUS ne Access-Reject se jawab diya; server healthy hai aur credentials kharab, to main host ko remediation VLAN mein daal sakta hoon. Server-fail matlab RADIUS ne jawab hi nahi diya, to port ke risk ke hisaab se deny, permit, use-cache ya fail VLAN chunta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>guest-vlan: host 802.1X bolta hi nahi. server-reject-vlan: Access-Reject. server-fail: jawab nahi.</li>
<li>server-fail options: deny (default), permit, use-cache, named VLAN.</li>
<li>Fallbacks sirf (re)authentication par lagu hote hain; authorised hosts chalte rehte hain.</li>
<li>Quarantine aur guest VLANs restricted hone chahiye.</li>
<li>Kam se kam do RADIUS servers chalao.</li>
</ul></div>
`}};export{e as default};