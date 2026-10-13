var e={id:`snmp-v2c`,h:{en:`SNMPv2c: polling, traps and why the NMS says UNKNOWN`,hi:`SNMPv2c: polling, traps aur NMS UNKNOWN kyun kehta hai`},body:{en:`
<p>Picture a warehouse manager (the <b>NMS</b>, network management station) who phones every shop (the <b>agent</b> on each router) every five minutes and asks "how many items did you sell?" That is <b>polling</b>. Sometimes a shop calls the manager on its own: "my freezer just broke!" That is a <b>trap</b>. The shop only answers callers who know the password (the <b>community string</b>) and, if the owner is careful, only callers from the head office number (an <b>ACL</b>).</p>

<h3>The building blocks</h3>
<dl class="terms">
<dt>MIB and OID</dt><dd>The MIB (Management Information Base) is the catalogue of values a device exposes. Each value has an OID (object identifier), a dotted number such as 1.3.6.1.2.1.1.5.0 for sysName.0.</dd>
<dt>Operations</dt><dd>Get, GetNext, GetBulk (added in v2c) and Set go from manager to agent on <b>UDP 161</b>. Traps and Informs go from agent to manager on <b>UDP 162</b>. An inform is acknowledged and retried; a trap is fire-and-forget.</dd>
<dt>Community</dt><dd>A clear-text password with RO (read-only) or RW (read-write) rights, optionally limited by an ACL and a view. SNMPv1 and v2c have no encryption and no real authentication.</dd>
<dt>View</dt><dd>A subset of the MIB tree (<code>snmp-server view</code>). A poll outside the view returns noSuchObject, not an error counter.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="SNMP polling and traps">
<rect x="30" y="70" width="150" height="54" rx="10" fill="#ddd6fe"/><text x="105" y="94" text-anchor="middle" class="svg-ink" font-size="13">NMS</text><text x="105" y="112" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.50</text>
<rect x="460" y="70" width="150" height="54" rx="10" fill="#bae6fd"/><text x="535" y="94" text-anchor="middle" class="svg-ink" font-size="13">EDGE agent</text><text x="535" y="112" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<line x1="180" y1="82" x2="460" y2="82" stroke="#64748b" stroke-width="2"/><text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="12">Get / GetBulk / Set to UDP 161</text>
<line x1="180" y1="112" x2="460" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">Trap / Inform to UDP 162</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Community + ACL checked on every request</text>
</svg><p class="cap">Polls go to the agent on UDP 161; notifications come back to the manager on UDP 162.</p></div>

<h3>Configuration you must be able to read</h3>
<pre class="code">access-list 20 permit host 10.99.0.50
snmp-server community NOC-RO RO 20              <span class="c">! read-only, only sources permitted by ACL 20</span>
snmp-server location Mumbai-Edge
snmp-server contact noc@nk.example
snmp-server ifindex persist                     <span class="c">! keep ifIndex stable across reloads</span>
snmp-server trap-source Loopback0
snmp-server enable traps snmp linkdown linkup   <span class="c">! WHAT to send</span>
snmp-server host 10.99.0.50 version 2c NOC-TRAP <span class="c">! WHERE to send it</span></pre>

<h3>Reading show snmp</h3>
<pre class="out">EDGE# show snmp
Chassis: FGL2231A0XY
Location: Mumbai-Edge
<span class="hl">37 SNMP packets input</span>
    0 Bad SNMP version errors
<span class="hl">    37 Unknown community name</span>
    0 Illegal operation for community name supplied
    0 Encoding errors
    0 Number of requested variables
    0 Number of altered variables
    0 Get-request PDUs
    0 Get-next PDUs
    0 Set-request PDUs
    0 Input queue packet drops (Maximum queue size 1000)
0 SNMP packets output
    0 Too big errors (Maximum packet size 1500)
    0 No such name errors
    0 Bad values errors
    0 General errors
    0 Response PDUs
    0 Trap PDUs
SNMP Dispatcher:
   queue 0/75 (current/max), 0 dropped
SNMP Engine:
   queue 0/1000 (current/max), 0 dropped

SNMP logging: disabled</pre>
<p>This is the lab 3 fault. Every poll arrives (input grows) but every one is counted as <b>Unknown community name</b> and nothing is answered. The community string is correct, so look at the ACL:</p>
<pre class="out">EDGE# show access-lists 20
Standard IP access list 20
    10 permit <span class="hl">10.99.0.5</span></pre>
<p>The ACL permits 10.99.0.5, not the NMS 10.99.0.50. A source denied by the community ACL is counted and dropped exactly like a wrong community. Adding <code>access-list 20 permit host 10.99.0.50</code> fixes polling while the user LAN 192.168.60.0/24 stays refused.</p>
<table class="cmp"><tr><th>Counter or symptom</th><th>Meaning</th></tr>
<tr><td>Nothing in "SNMP packets input"</td><td>The request never arrives: routing, a firewall or an interface ACL blocks UDP 161, or the NMS polls the wrong IP.</td></tr>
<tr><td>Unknown community name grows</td><td>Wrong community (case-sensitive) or the community ACL denies the source.</td></tr>
<tr><td>Illegal operation for community name supplied</td><td>A Set was sent with an RO community.</td></tr>
<tr><td>Response PDUs grow, NMS still times out</td><td>The reply is lost on the way back (asymmetric routing, firewall) or the NMS expects the reply from a different address.</td></tr>
<tr><td>noSuchObject for some OIDs</td><td>A view restricts the community, or the platform does not support that MIB.</td></tr></table>

<h3>Traps that never arrive</h3>
<p>Traps need two commands. <code>snmp-server enable traps</code> decides <b>what</b> events generate notifications; <code>snmp-server host</code> decides <b>where</b> and with which community. With only the host line, nothing is sent; with only enable traps, notifications are generated but have no destination. Check with <code>show snmp host</code> and the "Trap PDUs" counter in <code>show snmp</code>. The trap community does not need a matching <code>snmp-server community</code> line. In the lab you prove it by bouncing Loopback100 and running <code>show traps</code> on the NMS.</p>

<div class="eg"><p><b>Worked example.</b> The NMS polls 10.99.0.1 with community NOC-RO. Before the fix, 37 polls produced 37 "Unknown community name" and 0 responses. After adding the permit for 10.99.0.50, <code>snmpget -c NOC-RO 10.99.0.1 sysName.0</code> returns <code>SNMPv2-MIB::sysName.0 = STRING: EDGE</code>, the "Get-request PDUs" and "Response PDUs" counters each increase by 1, and "Unknown community name" stays at 37.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using a standard ACL that permits the NMS subnet but then polling from a different server; forgetting <code>snmp-server ifindex persist</code> so graphs jump to the wrong interface after a reload; sourcing traps from a random interface so the NMS does not recognise the device; leaving an RW community with no ACL.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Unknown community name" does <b>not</b> prove the string is wrong; a denying ACL gives the same counter. Also remember the ports: polls UDP 161, traps and informs UDP 162.</p></div>

<div class="scn"><h4>Graphs on the wrong interface</h4><p>After a planned reload, a service provider's NMS showed the customer uplink at 0 bps and a spare port at 400 Mbps. Nothing had moved physically. The interface indexes had been renumbered after a new module was inserted and the NMS kept polling the old ifIndex numbers. The fix was <code>snmp-server ifindex persist</code> on every router and a rediscovery in the NMS.</p><p><b>Lesson:</b> SNMP data is only as good as the OID it is attached to; keep ifIndex persistent.</p></div>

<div class="iv"><p class="q">"The NMS shows a router as UNKNOWN. Walk me through it."</p><p>Check reachability of the agent address from the NMS, then <code>show snmp</code> on the router: if input does not grow, the problem is the path or the polled address; if "Unknown community name" grows, check the community spelling and its ACL; if responses leave but the NMS still fails, check the return path and the source address. Finish by verifying traps with <code>show snmp host</code> and a controlled interface bounce.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Polls use UDP 161, traps and informs use UDP 162; informs are acknowledged, traps are not.</li>
<li>A community can be limited with an ACL and a view; a denied source is counted as "Unknown community name".</li>
<li><code>show snmp</code> counters tell you whether the request arrived, was refused or was answered.</li>
<li>Traps need both <code>snmp-server enable traps</code> and <code>snmp-server host</code>.</li>
<li>Use <code>snmp-server trap-source</code> and <code>snmp-server ifindex persist</code> for stable monitoring.</li>
</ul></div>
`,hi:`
<p>Ek warehouse manager (<b>NMS</b>, network management station) socho jo har paanch minute mein har dukaan (har router par <b>agent</b>) ko phone karke poochta hai "kitne items beche?" Yeh <b>polling</b> hai. Kabhi kabhi dukaan khud manager ko phone karti hai: "mera freezer abhi kharab hua!" Yeh <b>trap</b> hai. Dukaan sirf un callers ko jawab deti hai jo password jaante hain (<b>community string</b>) aur, agar maalik saavdhaan hai, sirf head office ke number se aane wale callers ko (<b>ACL</b>).</p>

<h3>Building blocks</h3>
<dl class="terms">
<dt>MIB aur OID</dt><dd>MIB (Management Information Base) un values ka catalogue hai jo device dikhata hai. Har value ka ek OID (object identifier) hota hai, dotted number jaise sysName.0 ke liye 1.3.6.1.2.1.1.5.0.</dd>
<dt>Operations</dt><dd>Get, GetNext, GetBulk (v2c mein joda gaya) aur Set manager se agent ki taraf <b>UDP 161</b> par jaate hain. Traps aur Informs agent se manager ki taraf <b>UDP 162</b> par jaate hain. Inform acknowledge aur retry hota hai; trap bhejo aur bhool jao.</dd>
<dt>Community</dt><dd>RO (read-only) ya RW (read-write) rights wala clear-text password, jise optionally ACL aur view se seemit kiya ja sakta hai. SNMPv1 aur v2c mein na encryption hai na asli authentication.</dd>
<dt>View</dt><dd>MIB tree ka ek hissa (<code>snmp-server view</code>). View ke bahar ka poll noSuchObject lautata hai, error counter nahi.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="SNMP polling and traps">
<rect x="30" y="70" width="150" height="54" rx="10" fill="#ddd6fe"/><text x="105" y="94" text-anchor="middle" class="svg-ink" font-size="13">NMS</text><text x="105" y="112" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.50</text>
<rect x="460" y="70" width="150" height="54" rx="10" fill="#bae6fd"/><text x="535" y="94" text-anchor="middle" class="svg-ink" font-size="13">EDGE agent</text><text x="535" y="112" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<line x1="180" y1="82" x2="460" y2="82" stroke="#64748b" stroke-width="2"/><text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="12">Get / GetBulk / Set UDP 161 par</text>
<line x1="180" y1="112" x2="460" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">Trap / Inform UDP 162 par</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Har request par community + ACL check</text>
</svg><p class="cap">Polls agent ko UDP 161 par jaate hain; notifications manager ko UDP 162 par wapas aate hain.</p></div>

<h3>Configuration jo aapko padhni aani chahiye</h3>
<pre class="code">access-list 20 permit host 10.99.0.50
snmp-server community NOC-RO RO 20              <span class="c">! read-only, sirf ACL 20 se permitted sources</span>
snmp-server location Mumbai-Edge
snmp-server contact noc@nk.example
snmp-server ifindex persist                     <span class="c">! reload ke baad bhi ifIndex stable</span>
snmp-server trap-source Loopback0
snmp-server enable traps snmp linkdown linkup   <span class="c">! KYA bhejna hai</span>
snmp-server host 10.99.0.50 version 2c NOC-TRAP <span class="c">! KAHAN bhejna hai</span></pre>

<h3>show snmp padhna</h3>
<pre class="out">EDGE# show snmp
Chassis: FGL2231A0XY
Location: Mumbai-Edge
<span class="hl">37 SNMP packets input</span>
    0 Bad SNMP version errors
<span class="hl">    37 Unknown community name</span>
    0 Illegal operation for community name supplied
    0 Encoding errors
    0 Number of requested variables
    0 Number of altered variables
    0 Get-request PDUs
    0 Get-next PDUs
    0 Set-request PDUs
    0 Input queue packet drops (Maximum queue size 1000)
0 SNMP packets output
    0 Too big errors (Maximum packet size 1500)
    0 No such name errors
    0 Bad values errors
    0 General errors
    0 Response PDUs
    0 Trap PDUs
SNMP Dispatcher:
   queue 0/75 (current/max), 0 dropped
SNMP Engine:
   queue 0/1000 (current/max), 0 dropped

SNMP logging: disabled</pre>
<p>Yahi lab 3 ka fault hai. Har poll pahunchta hai (input badhta hai) par har ek <b>Unknown community name</b> mein gina jaata hai aur kisi ka jawab nahi jaata. Community string sahi hai, to ACL dekho:</p>
<pre class="out">EDGE# show access-lists 20
Standard IP access list 20
    10 permit <span class="hl">10.99.0.5</span></pre>
<p>ACL 10.99.0.5 ko permit karta hai, NMS 10.99.0.50 ko nahi. Community ACL se deny hua source bilkul galat community ki tarah gina aur drop kiya jaata hai. <code>access-list 20 permit host 10.99.0.50</code> jodne se polling theek hoti hai jabki user LAN 192.168.60.0/24 abhi bhi refuse rehta hai.</p>
<table class="cmp"><tr><th>Counter ya symptom</th><th>Matlab</th></tr>
<tr><td>"SNMP packets input" mein kuch nahi</td><td>Request pahunchti hi nahi: routing, firewall ya interface ACL UDP 161 block kar raha hai, ya NMS galat IP poll kar raha hai.</td></tr>
<tr><td>Unknown community name badhta hai</td><td>Galat community (case-sensitive) ya community ACL source ko deny karta hai.</td></tr>
<tr><td>Illegal operation for community name supplied</td><td>RO community se Set bheja gaya.</td></tr>
<tr><td>Response PDUs badhte hain, NMS phir bhi timeout</td><td>Reply wapas raaste mein kho jaata hai (asymmetric routing, firewall) ya NMS reply kisi aur address se expect karta hai.</td></tr>
<tr><td>Kuch OIDs ke liye noSuchObject</td><td>View community ko restrict karta hai, ya platform woh MIB support nahi karta.</td></tr></table>

<h3>Traps jo kabhi nahi pahunchte</h3>
<p>Traps ko do commands chahiye. <code>snmp-server enable traps</code> tay karta hai <b>kaunse</b> events notifications banayenge; <code>snmp-server host</code> tay karta hai <b>kahan</b> aur kis community ke saath. Sirf host line ho to kuch nahi jaata; sirf enable traps ho to notifications bante hain par unka koi destination nahi. <code>show snmp host</code> aur <code>show snmp</code> ke "Trap PDUs" counter se check karo. Trap community ke liye matching <code>snmp-server community</code> line zaroori nahi. Lab mein aap Loopback100 ko bounce karke aur NMS par <code>show traps</code> chalakar ise sabit karte ho.</p>

<div class="eg"><p><b>Worked example.</b> NMS 10.99.0.1 ko community NOC-RO se poll karta hai. Fix se pehle, 37 polls ne 37 "Unknown community name" aur 0 responses diye. 10.99.0.50 ka permit jodne ke baad, <code>snmpget -c NOC-RO 10.99.0.1 sysName.0</code> <code>SNMPv2-MIB::sysName.0 = STRING: EDGE</code> lautata hai, "Get-request PDUs" aur "Response PDUs" counters 1-1 badhte hain, aur "Unknown community name" 37 par hi rehta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Standard ACL jo NMS subnet permit karta hai par phir kisi aur server se polling karna; <code>snmp-server ifindex persist</code> bhoolna jisse reload ke baad graphs galat interface par chale jaate hain; traps kisi random interface se source karna jisse NMS device pehchan nahi paata; bina ACL ke RW community chhod dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Unknown community name" yeh sabit <b>nahi</b> karta ki string galat hai; deny karne wala ACL wahi counter deta hai. Ports bhi yaad rakho: polls UDP 161, traps aur informs UDP 162.</p></div>

<div class="scn"><h4>Galat interface par graphs</h4><p>Planned reload ke baad ek service provider ke NMS ne customer uplink ko 0 bps aur ek spare port ko 400 Mbps dikhaya. Physically kuch nahi hila tha. Naya module lagne ke baad interface indexes renumber ho gaye the aur NMS purane ifIndex numbers poll karta raha. Fix tha har router par <code>snmp-server ifindex persist</code> aur NMS mein rediscovery.</p><p><b>Seekh:</b> SNMP data utna hi achha hai jitna uska OID; ifIndex persistent rakho.</p></div>

<div class="iv"><p class="q">"NMS router ko UNKNOWN dikhata hai. Mujhe step by step batao."</p><p>NMS se agent address ki reachability check karo, phir router par <code>show snmp</code>: agar input nahi badhta, problem path ya polled address mein hai; agar "Unknown community name" badhta hai, community spelling aur uska ACL check karo; agar responses jaate hain par NMS phir bhi fail hai, return path aur source address check karo. Aakhir mein <code>show snmp host</code> aur controlled interface bounce se traps verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Polls UDP 161 use karte hain, traps aur informs UDP 162; informs acknowledge hote hain, traps nahi.</li>
<li>Community ko ACL aur view se seemit kiya ja sakta hai; deny hua source "Unknown community name" mein gina jaata hai.</li>
<li><code>show snmp</code> counters batate hain ki request pahunchi, refuse hui ya jawab mila.</li>
<li>Traps ko <code>snmp-server enable traps</code> aur <code>snmp-server host</code> dono chahiye.</li>
<li>Stable monitoring ke liye <code>snmp-server trap-source</code> aur <code>snmp-server ifindex persist</code> use karo.</li>
</ul></div>
`}};export{e as default};