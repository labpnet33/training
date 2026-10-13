var e={id:`snmp-concepts`,h:{en:`SNMP: managers, agents, MIBs and messages`,hi:`SNMP: managers, agents, MIBs aur messages`},body:{en:`
<p>Picture a warehouse with a thousand shelves. Every shelf has a numbered label, and on every shelf sits a small clerk who knows what is on it. The manager in the office can phone any clerk and ask "what is on shelf 1.3.6.1.2.1.1.5?" and get an answer. With the right permission the manager can also say "change the label on that shelf". And if a shelf collapses, the clerk does not wait to be asked; he calls the office at once. That is <b>SNMP</b>, the Simple Network Management Protocol: numbered shelves (OIDs), clerks (agents), the office (the manager), questions (Get), changes (Set) and alarm calls (traps).</p>

<h3>The three building blocks</h3>
<dl class="terms">
<dt>SNMP manager (NMS)</dt><dd>The monitoring software on a server, such as the lab NMS at 10.1.1.100. It polls devices, draws graphs of interface usage and CPU, and raises alarms.</dd>
<dt>SNMP agent</dt><dd>Software running on the router, switch, firewall or server being monitored. It answers the manager's requests and sends notifications.</dd>
<dt>MIB (Management Information Base)</dt><dd>The structured "catalogue" of everything the agent can report or change. Each item is an <b>object</b> with a unique <b>OID</b> (object identifier), a dotted number path in a global tree.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="SNMP manager and agent">
<rect x="20" y="90" width="180" height="70" rx="8" fill="#ddd6fe"/><text x="110" y="118" text-anchor="middle" class="svg-ink" font-size="14">Manager (NMS)</text><text x="110" y="138" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.100</text>
<rect x="440" y="90" width="180" height="70" rx="8" fill="#bae6fd"/><text x="530" y="112" text-anchor="middle" class="svg-ink" font-size="14">Agent on R1</text><text x="530" y="130" text-anchor="middle" class="svg-muted" font-size="12">MIB: sysName, ifTable</text><text x="530" y="148" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.1</text>
<line x1="200" y1="105" x2="440" y2="105" stroke="#64748b" stroke-width="2"/><text x="320" y="97" text-anchor="middle" class="svg-accent" font-size="12">Get / GetNext / GetBulk / Set to UDP 161</text>
<line x1="440" y1="128" x2="200" y2="128" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">Response from UDP 161</text>
<line x1="440" y1="155" x2="200" y2="155" stroke="#64748b" stroke-width="2"/><text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Trap / Inform to UDP 162</text>
<text x="20" y="230" class="svg-ink" font-size="12">OID tree: iso(1).org(3).dod(6).internet(1)</text>
<text x="20" y="250" class="svg-muted" font-size="12">.mgmt(2).mib-2(1).system(1).sysName(5).0 = 1.3.6.1.2.1.1.5.0</text>
<text x="20" y="270" class="svg-muted" font-size="12">.private(4).enterprises(1).cisco(9) = 1.3.6.1.4.1.9 (vendor MIBs)</text>
</svg><p class="cap">Polls go to the agent on UDP 161; notifications go to the manager on UDP 162.</p></div>

<h3>Useful OIDs to recognise</h3>
<table class="cmp"><tr><th>Name</th><th>OID</th><th>Content</th></tr>
<tr><td>sysDescr.0</td><td>1.3.6.1.2.1.1.1.0</td><td>Platform and software version text</td></tr>
<tr><td>sysUpTime.0</td><td>1.3.6.1.2.1.1.3.0</td><td>Time since the agent started, in hundredths of a second</td></tr>
<tr><td>sysName.0</td><td>1.3.6.1.2.1.1.5.0</td><td>Hostname</td></tr>
<tr><td>sysLocation.0</td><td>1.3.6.1.2.1.1.6.0</td><td>Set with <code>snmp-server location</code></td></tr>
<tr><td>ifOperStatus.N</td><td>1.3.6.1.2.1.2.2.1.8.N</td><td>Interface N up(1) / down(2)</td></tr>
<tr><td>ifHCInOctets.N</td><td>1.3.6.1.2.1.31.1.1.1.6.N</td><td>64-bit byte counter, used for bandwidth graphs</td></tr></table>
<p>The <code>.0</code> at the end means "the single instance" of a scalar object. Table objects end in an index, usually the interface's <b>ifIndex</b>.</p>

<h3>The message types</h3>
<table class="cmp"><tr><th>Message</th><th>Direction</th><th>Purpose</th><th>Version</th></tr>
<tr><td>Get</td><td>Manager → agent</td><td>Read one or more specific OIDs</td><td>v1+</td></tr>
<tr><td>GetNext</td><td>Manager → agent</td><td>Read the next OID in the tree; repeated, it "walks" a table</td><td>v1+</td></tr>
<tr><td>GetBulk</td><td>Manager → agent</td><td>Read many next OIDs in one request, efficient for big tables</td><td>v2c+</td></tr>
<tr><td>Set</td><td>Manager → agent</td><td>Change a value (needs write access)</td><td>v1+</td></tr>
<tr><td>Response</td><td>Agent → manager</td><td>The answer to Get/GetNext/GetBulk/Set (and the ack for an Inform)</td><td>v1+</td></tr>
<tr><td>Trap</td><td>Agent → manager</td><td>Unsolicited event notification, <b>not acknowledged</b></td><td>v1+</td></tr>
<tr><td>Inform</td><td>Agent → manager</td><td>Like a trap but the manager <b>acknowledges</b> it; resent if lost</td><td>v2c+</td></tr></table>
<p>Polling (Get) gives you regular measurements, such as interface counters every five minutes. Notifications (traps and informs) give you instant alerts, such as linkDown. A good monitoring design uses both.</p>

<h3>The three versions</h3>
<table class="cmp"><tr><th></th><th>SNMPv1</th><th>SNMPv2c</th><th>SNMPv3</th></tr>
<tr><td>Security</td><td>Community string, clear text</td><td>Community string, clear text</td><td>Users with authentication and encryption</td></tr>
<tr><td>New features</td><td>Original</td><td>GetBulk, Inform, 64-bit counters</td><td>USM security, views, message integrity</td></tr>
<tr><td>Use today</td><td>Legacy only</td><td>Common in internal networks</td><td>Recommended</td></tr></table>
<p>A <b>community string</b> is a shared password sent in every packet in clear text. Anyone who can capture traffic can read it. SNMPv3 replaces it with <b>users</b> and three security levels:</p>
<ul>
<li><b>noAuthNoPriv</b>: username only, no authentication, no encryption.</li>
<li><b>authNoPriv</b>: packets authenticated with a hash (MD5 or SHA), not encrypted.</li>
<li><b>authPriv</b>: authenticated <b>and</b> encrypted (DES, 3DES or AES). This is the one to use.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The NMS polls ifHCInOctets on R1 Gi0/0 every 300 seconds. First poll: 81,204,000,000. Second: 84,954,000,000. Difference 3,750,000,000 bytes. Rate = 3,750,000,000 × 8 / 300 = <b>100,000,000 bit/s = 100 Mbit/s</b>. On a 1 Gbit/s link that is 10 % utilisation. This simple subtraction is exactly how every bandwidth graph in a NOC is drawn. It is also why 64-bit (HC) counters matter: a 32-bit counter wraps at about 4.29 GB, which at 1 Gbit/s happens every 34 seconds.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking SNMP only "reads". With a read-write community or v3 write access, a manager (or an attacker who learns the string) can change configuration items and even trigger a config copy. Give write access only if a tool truly needs it.</p></div>

<div class="exam"><p><b>Exam trap.</b> The agent listens on UDP 161; the manager receives traps and informs on UDP 162. Informs are acknowledged, traps are not. GetBulk and Inform appeared in v2c. Only v3 provides authentication and encryption.</p></div>

<div class="scn"><h4>Silent link, no alarm</h4><p>An ISP customer complained that their backup link had been down for three days without anyone noticing. The monitoring system polled the router every 10 minutes but only for CPU and memory, and no traps were configured. The fix was two-fold: add interface status and counters to the polling template, and configure <code>snmp-server enable traps snmp linkdown linkup</code> with the NMS as trap receiver, so a failure raised an alarm within seconds.</p><p><b>Lesson:</b> polling shows trends; traps or informs catch events the moment they happen. Use both.</p></div>

<div class="iv"><p class="q">"Explain SNMP components and the difference between a trap and an inform."</p><p>Strong answer: the manager (NMS) polls agents on network devices over UDP 161 using Get, GetNext, GetBulk and Set; data is organised in MIBs and addressed by OIDs. Agents send notifications to the manager on UDP 162. A trap is fire-and-forget; an inform, introduced in v2c, must be acknowledged by the manager and is retransmitted if not, so it is reliable but costs more resources. Finish with v1/v2c communities vs v3 users.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Manager (NMS) + agent (on the device) + MIB (catalogue of OIDs).</li>
<li>Get, GetNext, GetBulk, Set go to UDP 161; Trap and Inform go to UDP 162.</li>
<li>Informs are acknowledged; traps are not.</li>
<li>v1/v2c use clear-text community strings; v3 uses users with noAuthNoPriv, authNoPriv or authPriv.</li>
<li>Interface utilisation = delta of octet counters × 8 / seconds.</li>
</ul></div>
`,hi:`
<p>Ek warehouse socho jismein hazaar shelves hain. Har shelf par ek numbered label hai, aur har shelf par ek chhota clerk baitha hai jo jaanta hai ki us par kya hai. Office ka manager kisi bhi clerk ko phone karke pooch sakta hai "shelf 1.3.6.1.2.1.1.5 par kya hai?" aur jawab paata hai. Sahi permission ke saath manager yeh bhi keh sakta hai "us shelf ka label badal do". Aur agar koi shelf gir jaaye, to clerk poochhe jaane ka intezaar nahi karta; woh turant office ko call karta hai. Yahi <b>SNMP</b> hai, Simple Network Management Protocol: numbered shelves (OIDs), clerks (agents), office (manager), sawaal (Get), badlaav (Set) aur alarm calls (traps).</p>

<h3>Teen building blocks</h3>
<dl class="terms">
<dt>SNMP manager (NMS)</dt><dd>Server par monitoring software, jaise lab ka NMS 10.1.1.100 par. Yeh devices ko poll karta hai, interface usage aur CPU ke graphs banata hai, aur alarms uthata hai.</dd>
<dt>SNMP agent</dt><dd>Monitor ho rahe router, switch, firewall ya server par chalne wala software. Yeh manager ki requests ka jawab deta hai aur notifications bhejta hai.</dd>
<dt>MIB (Management Information Base)</dt><dd>Har us cheez ka structured "catalogue" jo agent report ya change kar sakta hai. Har item ek <b>object</b> hai jiska ek unique <b>OID</b> (object identifier) hota hai, ek global tree mein dotted number path.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="SNMP manager aur agent">
<rect x="20" y="90" width="180" height="70" rx="8" fill="#ddd6fe"/><text x="110" y="118" text-anchor="middle" class="svg-ink" font-size="14">Manager (NMS)</text><text x="110" y="138" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.100</text>
<rect x="440" y="90" width="180" height="70" rx="8" fill="#bae6fd"/><text x="530" y="112" text-anchor="middle" class="svg-ink" font-size="14">R1 par agent</text><text x="530" y="130" text-anchor="middle" class="svg-muted" font-size="12">MIB: sysName, ifTable</text><text x="530" y="148" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.1</text>
<line x1="200" y1="105" x2="440" y2="105" stroke="#64748b" stroke-width="2"/><text x="320" y="97" text-anchor="middle" class="svg-accent" font-size="12">Get / GetNext / GetBulk / Set UDP 161 par</text>
<line x1="440" y1="128" x2="200" y2="128" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">UDP 161 se Response</text>
<line x1="440" y1="155" x2="200" y2="155" stroke="#64748b" stroke-width="2"/><text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Trap / Inform UDP 162 par</text>
<text x="20" y="230" class="svg-ink" font-size="12">OID tree: iso(1).org(3).dod(6).internet(1)</text>
<text x="20" y="250" class="svg-muted" font-size="12">.mgmt(2).mib-2(1).system(1).sysName(5).0 = 1.3.6.1.2.1.1.5.0</text>
<text x="20" y="270" class="svg-muted" font-size="12">.private(4).enterprises(1).cisco(9) = 1.3.6.1.4.1.9 (vendor MIBs)</text>
</svg><p class="cap">Polls agent ke paas UDP 161 par jaate hain; notifications manager ke paas UDP 162 par jaati hain.</p></div>

<h3>Pehchanne layak useful OIDs</h3>
<table class="cmp"><tr><th>Naam</th><th>OID</th><th>Content</th></tr>
<tr><td>sysDescr.0</td><td>1.3.6.1.2.1.1.1.0</td><td>Platform aur software version text</td></tr>
<tr><td>sysUpTime.0</td><td>1.3.6.1.2.1.1.3.0</td><td>Agent start hone ke baad ka time, second ke sauvein hisse mein</td></tr>
<tr><td>sysName.0</td><td>1.3.6.1.2.1.1.5.0</td><td>Hostname</td></tr>
<tr><td>sysLocation.0</td><td>1.3.6.1.2.1.1.6.0</td><td><code>snmp-server location</code> se set hota hai</td></tr>
<tr><td>ifOperStatus.N</td><td>1.3.6.1.2.1.2.2.1.8.N</td><td>Interface N up(1) / down(2)</td></tr>
<tr><td>ifHCInOctets.N</td><td>1.3.6.1.2.1.31.1.1.1.6.N</td><td>64-bit byte counter, bandwidth graphs ke liye</td></tr></table>
<p>Aakhir ka <code>.0</code> matlab scalar object ka "ek hi instance". Table objects ek index par khatam hote hain, aam taur par interface ka <b>ifIndex</b>.</p>

<h3>Message types</h3>
<table class="cmp"><tr><th>Message</th><th>Direction</th><th>Kaam</th><th>Version</th></tr>
<tr><td>Get</td><td>Manager → agent</td><td>Ek ya zyada specific OIDs padhna</td><td>v1+</td></tr>
<tr><td>GetNext</td><td>Manager → agent</td><td>Tree ka agla OID padhna; baar baar karke table "walk" karta hai</td><td>v1+</td></tr>
<tr><td>GetBulk</td><td>Manager → agent</td><td>Ek request mein kai agle OIDs padhna, bade tables ke liye efficient</td><td>v2c+</td></tr>
<tr><td>Set</td><td>Manager → agent</td><td>Value badalna (write access chahiye)</td><td>v1+</td></tr>
<tr><td>Response</td><td>Agent → manager</td><td>Get/GetNext/GetBulk/Set ka jawab (aur Inform ka ack)</td><td>v1+</td></tr>
<tr><td>Trap</td><td>Agent → manager</td><td>Bina maange event notification, <b>acknowledge nahi hota</b></td><td>v1+</td></tr>
<tr><td>Inform</td><td>Agent → manager</td><td>Trap jaisa lekin manager ise <b>acknowledge</b> karta hai; kho jaaye to dobara bheja jaata hai</td><td>v2c+</td></tr></table>
<p>Polling (Get) regular measurements deta hai, jaise har paanch minute interface counters. Notifications (traps aur informs) turant alerts dete hain, jaise linkDown. Achha monitoring design dono use karta hai.</p>

<h3>Teen versions</h3>
<table class="cmp"><tr><th></th><th>SNMPv1</th><th>SNMPv2c</th><th>SNMPv3</th></tr>
<tr><td>Security</td><td>Community string, clear text</td><td>Community string, clear text</td><td>Authentication aur encryption wale users</td></tr>
<tr><td>Naye features</td><td>Original</td><td>GetBulk, Inform, 64-bit counters</td><td>USM security, views, message integrity</td></tr>
<tr><td>Aaj use</td><td>Sirf legacy</td><td>Internal networks mein common</td><td>Recommended</td></tr></table>
<p><b>Community string</b> ek shared password hai jo har packet mein clear text mein jaata hai. Jo bhi traffic capture kar sakta hai woh ise padh sakta hai. SNMPv3 iski jagah <b>users</b> aur teen security levels laata hai:</p>
<ul>
<li><b>noAuthNoPriv</b>: sirf username, na authentication na encryption.</li>
<li><b>authNoPriv</b>: packets hash (MD5 ya SHA) se authenticated, encrypted nahi.</li>
<li><b>authPriv</b>: authenticated <b>aur</b> encrypted (DES, 3DES ya AES). Yahi use karna chahiye.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> NMS har 300 seconds mein R1 Gi0/0 ka ifHCInOctets poll karta hai. Pehla poll: 81,204,000,000. Doosra: 84,954,000,000. Fark 3,750,000,000 bytes. Rate = 3,750,000,000 × 8 / 300 = <b>100,000,000 bit/s = 100 Mbit/s</b>. 1 Gbit/s link par yeh 10 % utilisation hai. NOC ka har bandwidth graph exactly isi simple subtraction se banta hai. Isi wajah se 64-bit (HC) counters matter karte hain: 32-bit counter lagbhag 4.29 GB par wrap hota hai, jo 1 Gbit/s par har 34 seconds mein ho jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Sochna ki SNMP sirf "padhta" hai. Read-write community ya v3 write access ke saath manager (ya woh attacker jise string pata chal jaaye) configuration items badal sakta hai aur config copy bhi trigger kar sakta hai. Write access tabhi do jab kisi tool ko sach mein chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Agent UDP 161 par sunta hai; manager traps aur informs UDP 162 par receive karta hai. Informs acknowledge hote hain, traps nahi. GetBulk aur Inform v2c mein aaye. Sirf v3 authentication aur encryption deta hai.</p></div>

<div class="scn"><h4>Khamosh link, koi alarm nahi</h4><p>Ek ISP customer ne complain kiya ki unka backup link teen din se down tha aur kisi ko pata nahi chala. Monitoring system router ko har 10 minute poll karta tha lekin sirf CPU aur memory ke liye, aur koi traps configured nahi the. Fix do hisson mein tha: polling template mein interface status aur counters jodo, aur NMS ko trap receiver banakar <code>snmp-server enable traps snmp linkdown linkup</code> configure karo, taaki failure hote hi seconds mein alarm aaye.</p><p><b>Seekh:</b> polling trends dikhata hai; traps ya informs events ko usi pal pakadte hain. Dono use karo.</p></div>

<div class="iv"><p class="q">"SNMP components samjhao aur trap aur inform mein fark batao."</p><p>Strong answer: manager (NMS) network devices par agents ko UDP 161 par Get, GetNext, GetBulk aur Set se poll karta hai; data MIBs mein organised hai aur OIDs se address hota hai. Agents manager ko UDP 162 par notifications bhejte hain. Trap fire-and-forget hai; inform, jo v2c mein aaya, manager ko acknowledge karna padta hai aur na ho to dobara bheja jaata hai, isliye reliable hai par zyada resources leta hai. v1/v2c communities vs v3 users se khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Manager (NMS) + agent (device par) + MIB (OIDs ka catalogue).</li>
<li>Get, GetNext, GetBulk, Set UDP 161 par jaate hain; Trap aur Inform UDP 162 par.</li>
<li>Informs acknowledge hote hain; traps nahi.</li>
<li>v1/v2c clear-text community strings use karte hain; v3 noAuthNoPriv, authNoPriv ya authPriv wale users.</li>
<li>Interface utilisation = octet counters ka delta × 8 / seconds.</li>
</ul></div>
`}};export{e as default};