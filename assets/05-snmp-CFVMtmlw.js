var e={id:`snmp`,h:{en:`SNMP: letting the NOC poll and listen, but not the guests`,hi:`SNMP: NOC poll aur sune, guests nahi`},body:{en:`
<p>A hospital nurse checks each patient's pulse every hour (<b>polling</b>), and a monitor beeps by itself if a patient's heart stops (<b>trap</b>). <b>SNMP</b> (Simple Network Management Protocol) gives a network the same two modes. A <b>Network Management System (NMS)</b> asks routers for counters and states on UDP 161, and routers send unsolicited alerts to the NMS on UDP 162.</p>

<h3>Key terms</h3>
<dl class="terms">
<dt>NMS</dt><dd>The monitoring server (here NK-NMS, 10.80.1.20).</dd>
<dt>Agent</dt><dd>The SNMP process on the router that answers requests.</dd>
<dt>MIB / OID</dt><dd>The tree of objects the agent exposes; each object has a number, an Object Identifier.</dd>
<dt>Community</dt><dd>A shared "password" used by SNMP v1 and v2c, sent in clear text.</dd>
<dt>GET / WALK</dt><dd>Read one object / read a whole branch.</dd>
<dt>Trap / Inform</dt><dd>Unsolicited alert from the agent (UDP 162); an inform is acknowledged.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="SNMP polling and traps">
<rect x="20" y="60" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="14">NK-NMS</text><text x="95" y="110" text-anchor="middle" class="svg-muted" font-size="11">10.80.1.20</text>
<rect x="470" y="60" width="150" height="70" rx="10" fill="#fde68a"/><text x="545" y="90" text-anchor="middle" class="svg-ink" font-size="14">R1 (agent)</text><text x="545" y="110" text-anchor="middle" class="svg-muted" font-size="11">10.80.1.1</text>
<line x1="170" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="2"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="12">GET / WALK, UDP 161 (poll)</text>
<line x1="470" y1="112" x2="170" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">TRAP, UDP 162 (linkDown)</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">polling is pulled by the NMS; traps are pushed by the router</text>
</svg><p class="cap">Two directions: the NMS asks on 161, the router tells on 162.</p></div>

<h3>Versions</h3>
<table class="cmp"><tr><th>Version</th><th>Security</th></tr>
<tr><td>v1, v2c</td><td>community string in clear text; v2c adds 64-bit counters and bulk requests</td></tr>
<tr><td>v3</td><td>user names, authentication (MD5/SHA) and encryption (DES/AES): use this on untrusted paths</td></tr></table>

<h3>Configuration</h3>
<pre class="code">set snmp location "NK Mumbai DC row B"
set snmp contact "noc@nk.example"
set snmp community nk-mon authorization read-only
set snmp community nk-mon clients 10.80.1.20/32
set snmp trap-group NK-TRAPS targets 10.80.1.20
set snmp trap-group NK-TRAPS categories link</pre>
<ul>
<li><code>authorization read-only</code> lets the NMS read but not write (read-write would allow changes; avoid it).</li>
<li><code>clients 10.80.1.20/32</code> is an <b>allow-list</b>: once it exists, only listed prefixes can use the community. A prefix added with <code>restrict</code> is explicitly refused.</li>
<li><code>trap-group</code> names a set of trap targets and <code>categories</code> (link, authentication, chassis, routing, configuration, startup...).</li>
<li>Junos replies to an NMS through the interface that reaches it. If the source address matters, use <code>set snmp trap-options source-address</code>.</li>
</ul>

<h3>Verification</h3>
<pre class="code">lab@NK-MUM-EDGE&gt; show snmp statistics
SNMP statistics:
  Input:
    Packets: 14, Bad versions: 0, <span class="hl">Bad community names: 2</span>, Bad community uses: 0,
    Get requests: 3, Get nexts: 9, Set requests: 0
  Output:
    Packets: 12, Too bigs: 0, No such names: 0, <span class="hl">Get responses: 12</span>, Traps: 1
lab@NK-MUM-EDGE&gt; show snmp mib walk system
lab@NK-MUM-EDGE&gt; show system connections | match 161
udp4       0      0  *.161            *.*</pre>
<p>From the NMS side, a walk looks like <code>snmpwalk -v2c -c nk-mon 10.80.1.1 system</code> and prints <code>sysLocation.0 = NK Mumbai DC row B</code>.</p>

<h3>Lab walkthrough: Mumbai NOC</h3>
<p>R1 (NK-MUM-EDGE) has ge-0/0/0 10.80.1.1/24 to NMS, ge-0/0/1 10.80.2.1/24 to the GUEST LAN (host 10.80.2.99), ge-0/0/2 10.80.3.1/24 to the LAB LAN. Requirements: the NOC polls and gets link traps; the guest must not be able to read R1 even with the community.</p>
<ol>
<li>Configure location, community <code>nk-mon</code> read-only with <code>clients 10.80.1.20/32</code>, commit.</li>
<li>From NMS: <code>snmpwalk -v2c -c nk-mon 10.80.1.1 system</code> works; R1 counts <code>Get responses</code>.</li>
<li>From GUEST: <code>snmpget -v2c -c nk-mon 10.80.2.1 sysName.0</code> times out; R1 counts a bad community name, because the source 10.80.2.99 is not on the allow-list.</li>
<li>Add <code>trap-group NK-TRAPS</code> to 10.80.1.20 with <code>categories link</code>; then <code>set interfaces ge-0/0/2 disable</code> and commit. The link goes down and NMS receives a <b>linkDown</b> trap (<code>show traps</code> on NMS).</li>
<li><code>show system connections</code> lists the SNMP agent on <b>UDP 161</b>.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> At 11:00 the lab port ge-0/0/2 is disabled. The router sends one trap to 10.80.1.20 with the interface name and the ifIndex. The NMS marks the port red within a second. Without traps the NMS would notice only at the next poll, perhaps five minutes later.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using the default community <code>public</code> or <code>private</code>; giving <code>read-write</code> to a community; skipping <code>clients</code>, so any host on the network can read the router; forgetting that v2c sends the community in clear text; leaving the trap target unreachable.</p></div>
<div class="exam"><p><b>Exam trap.</b> Polling = UDP 161, traps = UDP 162. SNMPv3 adds authentication and encryption; v1/v2c use communities in clear text. <code>clients</code> limits who can use a community.</p></div>

<div class="scn"><h4>The guest who read the router</h4><p>A hotel's guest Wi-Fi sat on a router where SNMP was enabled with the community "public" and no <code>clients</code> list. A curious guest ran a walk and read the interface names, VLANs and routing neighbours. The fix: a unique community, <code>clients</code> restricted to the NMS host, and a firewall filter on the loopback permitting UDP 161 only from the management subnet.</p><p><b>Lesson:</b> restrict SNMP to the NMS. A leaked community should be useless.</p></div>

<div class="iv"><p class="q">"How do you secure SNMP on a Junos device?"</p><p>Prefer SNMPv3 with authentication and privacy. If v2c is unavoidable, use a long unique community, <code>authorization read-only</code> and <code>clients</code> restricting it to the NMS address, plus a loopback firewall filter. I verify with <code>show snmp statistics</code>: a rise in Bad community names shows probing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NMS polls on UDP 161; the router sends traps to UDP 162.</li>
<li>Communities are shared secrets in v1/v2c; v3 adds authentication and encryption.</li>
<li><code>clients</code> is an allow-list; <code>restrict</code> blocks a prefix.</li>
<li>Trap groups define targets and categories such as <code>link</code>.</li>
<li>Check with <code>show snmp statistics</code> and <code>show system connections</code>.</li>
</ul></div>
`,hi:`
<p>Hospital ki nurse har ghante har patient ki pulse check karti hai (<b>polling</b>), aur patient ka dil ruke to monitor khud beep karta hai (<b>trap</b>). <b>SNMP</b> (Simple Network Management Protocol) network ko wahi do modes deta hai. <b>Network Management System (NMS)</b> UDP 161 par routers se counters aur states poochta hai, aur routers UDP 162 par NMS ko khud se alerts bhejte hain.</p>

<h3>Key terms</h3>
<dl class="terms">
<dt>NMS</dt><dd>Monitoring server (yahan NK-NMS, 10.80.1.20).</dd>
<dt>Agent</dt><dd>Router par SNMP process jo requests ka jawab deta hai.</dd>
<dt>MIB / OID</dt><dd>Agent ke expose kiye objects ka tree; har object ka ek number hota hai, Object Identifier.</dd>
<dt>Community</dt><dd>SNMP v1 aur v2c ka shared "password", clear text mein bheja jaata hai.</dd>
<dt>GET / WALK</dt><dd>Ek object padhna / poori branch padhna.</dd>
<dt>Trap / Inform</dt><dd>Agent ka unsolicited alert (UDP 162); inform acknowledge hota hai.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="SNMP polling aur traps">
<rect x="20" y="60" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="14">NK-NMS</text><text x="95" y="110" text-anchor="middle" class="svg-muted" font-size="11">10.80.1.20</text>
<rect x="470" y="60" width="150" height="70" rx="10" fill="#fde68a"/><text x="545" y="90" text-anchor="middle" class="svg-ink" font-size="14">R1 (agent)</text><text x="545" y="110" text-anchor="middle" class="svg-muted" font-size="11">10.80.1.1</text>
<line x1="170" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="2"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="12">GET / WALK, UDP 161 (poll)</text>
<line x1="470" y1="112" x2="170" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">TRAP, UDP 162 (linkDown)</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">polling NMS khinchta hai; traps router dhakelta hai</text>
</svg><p class="cap">Do directions: NMS 161 par poochta hai, router 162 par batata hai.</p></div>

<h3>Versions</h3>
<table class="cmp"><tr><th>Version</th><th>Security</th></tr>
<tr><td>v1, v2c</td><td>community string clear text mein; v2c 64-bit counters aur bulk requests jodta hai</td></tr>
<tr><td>v3</td><td>user names, authentication (MD5/SHA) aur encryption (DES/AES): untrusted paths par yahi use karo</td></tr></table>

<h3>Configuration</h3>
<pre class="code">set snmp location "NK Mumbai DC row B"
set snmp contact "noc@nk.example"
set snmp community nk-mon authorization read-only
set snmp community nk-mon clients 10.80.1.20/32
set snmp trap-group NK-TRAPS targets 10.80.1.20
set snmp trap-group NK-TRAPS categories link</pre>
<ul>
<li><code>authorization read-only</code> NMS ko padhne deta hai, likhne nahi (read-write changes allow karta hai; avoid karo).</li>
<li><code>clients 10.80.1.20/32</code> ek <b>allow-list</b> hai: ban jaane ke baad sirf listed prefixes community use kar sakte hain. <code>restrict</code> ke saath jodi prefix explicitly refuse hoti hai.</li>
<li><code>trap-group</code> trap targets ka set aur <code>categories</code> (link, authentication, chassis, routing, configuration, startup...) naam deta hai.</li>
<li>Junos NMS ko usi interface se jawab deta hai jo use reach karta hai. Source address matter kare to <code>set snmp trap-options source-address</code> use karo.</li>
</ul>

<h3>Verification</h3>
<pre class="code">lab@NK-MUM-EDGE&gt; show snmp statistics
SNMP statistics:
  Input:
    Packets: 14, Bad versions: 0, <span class="hl">Bad community names: 2</span>, Bad community uses: 0,
    Get requests: 3, Get nexts: 9, Set requests: 0
  Output:
    Packets: 12, Too bigs: 0, No such names: 0, <span class="hl">Get responses: 12</span>, Traps: 1
lab@NK-MUM-EDGE&gt; show snmp mib walk system
lab@NK-MUM-EDGE&gt; show system connections | match 161
udp4       0      0  *.161            *.*</pre>
<p>NMS side se walk aisa dikhta hai <code>snmpwalk -v2c -c nk-mon 10.80.1.1 system</code> aur print karta hai <code>sysLocation.0 = NK Mumbai DC row B</code>.</p>

<h3>Lab walkthrough: Mumbai NOC</h3>
<p>R1 (NK-MUM-EDGE) ke paas ge-0/0/0 10.80.1.1/24 NMS ki taraf, ge-0/0/1 10.80.2.1/24 GUEST LAN (host 10.80.2.99) ki taraf, ge-0/0/2 10.80.3.1/24 LAB LAN ki taraf hai. Zaroorat: NOC poll kare aur link traps pae; guest community ke saath bhi R1 ko padh na sake.</p>
<ol>
<li>Location, community <code>nk-mon</code> read-only <code>clients 10.80.1.20/32</code> ke saath configure karo, commit.</li>
<li>NMS se: <code>snmpwalk -v2c -c nk-mon 10.80.1.1 system</code> chalta hai; R1 <code>Get responses</code> ginta hai.</li>
<li>GUEST se: <code>snmpget -v2c -c nk-mon 10.80.2.1 sysName.0</code> timeout hota hai; R1 bad community name ginta hai, kyunki source 10.80.2.99 allow-list mein nahi hai.</li>
<li><code>categories link</code> ke saath 10.80.1.20 ko <code>trap-group NK-TRAPS</code> jodo; phir <code>set interfaces ge-0/0/2 disable</code> aur commit. Link down hota hai aur NMS ko <b>linkDown</b> trap milta hai (NMS par <code>show traps</code>).</li>
<li><code>show system connections</code> SNMP agent ko <b>UDP 161</b> par list karta hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> 11:00 baje lab port ge-0/0/2 disable hota hai. Router 10.80.1.20 ko interface naam aur ifIndex ke saath ek trap bhejta hai. NMS ek second mein port ko red mark karta hai. Traps ke bina NMS ko agle poll par pata chalta, shayad paanch minute baad.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Default community <code>public</code> ya <code>private</code> use karna; community ko <code>read-write</code> dena; <code>clients</code> chhodna, jisse network ka koi bhi host router padh sakta hai; yeh bhool jaana ki v2c community clear text mein bhejta hai; trap target unreachable chhodna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Polling = UDP 161, traps = UDP 162. SNMPv3 authentication aur encryption jodta hai; v1/v2c clear text communities use karte hain. <code>clients</code> tay karta hai community kaun use kar sakta hai.</p></div>

<div class="scn"><h4>Guest jisne router padh liya</h4><p>Ek hotel ka guest Wi-Fi aise router par tha jahan SNMP community "public" ke saath aur bina <code>clients</code> list ke enabled tha. Ek curious guest ne walk chalaya aur interface names, VLANs aur routing neighbours padh liye. Fix: unique community, NMS host tak restricted <code>clients</code>, aur loopback par firewall filter jo UDP 161 sirf management subnet se permit kare.</p><p><b>Lesson:</b> SNMP ko NMS tak restrict karo. Leak hui community bekaar honi chahiye.</p></div>

<div class="iv"><p class="q">"Junos device par SNMP ko secure kaise karte ho?"</p><p>Authentication aur privacy ke saath SNMPv3 prefer karta hoon. v2c zaroori ho to lambi unique community, <code>authorization read-only</code> aur use NMS address tak restrict karne wali <code>clients</code>, saath mein loopback firewall filter. <code>show snmp statistics</code> se verify karta hoon: Bad community names badhna probing dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NMS UDP 161 par poll karta hai; router traps UDP 162 par bhejta hai.</li>
<li>v1/v2c mein community shared secret hai; v3 authentication aur encryption jodta hai.</li>
<li><code>clients</code> allow-list hai; <code>restrict</code> prefix ko block karta hai.</li>
<li>Trap groups targets aur <code>link</code> jaisi categories define karte hain.</li>
<li><code>show snmp statistics</code> aur <code>show system connections</code> se check karo.</li>
</ul></div>
`}};export{e as default};