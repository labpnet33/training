var e={id:`objects`,h:{en:`Objects: the building blocks of every policy`,hi:`Objects: har policy ke building blocks`},body:{en:`
<p>A phone's contact list is the simplest example of an object. You do not dial 98-xxxx every time; you tap "Mom". When Mom changes her number, you edit one contact and every shortcut, group and favourite that uses her keeps working. The Management Center works the same way: you name things once (a host, a subnet, a port, a zone) and refer to the name in access control rules, NAT rules and other policies.</p>

<h3>Why objects matter more on Threat Defense</h3>
<p>On the ASA, objects were a good habit. On Threat Defense they are the normal way of working, because one object can be used by many policies across many devices. Change the object, and every policy that uses it is marked out of date; one deploy updates them all. The Management Center also shows where an object is used (<b>Find Usage</b>), which is gold during clean-ups.</p>

<h3>The object types you will use most</h3>
<dl class="terms">
<dt>Network objects</dt><dd>Host (10.0.2.10), Network (10.0.1.0/24), Range (10.0.1.100-10.0.1.150) or FQDN (updates.example). Grouped with <b>network object groups</b>.</dd>
<dt>Port objects</dt><dd>Protocol and port, for example HTTP = TCP 80, DNS over UDP = UDP 53. Many are predefined; you can create your own (TCP 8443) and group them.</dd>
<dt>Interface objects</dt><dd><b>Security zones</b> and <b>interface groups</b>. Zones are what access control rules match; NAT rules can use either.</dd>
<dt>Others for later modules</dt><dd>URL objects and categories, application filters, geolocation, time ranges, Security Intelligence lists and feeds, VLAN tags, SLA monitors, certificates and VPN objects.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="One object used by many policies">
<rect x="250" y="20" width="140" height="56" rx="8" fill="#fde68a"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">object WEB</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">host 10.0.2.10</text>
<rect x="20" y="150" width="170" height="56" rx="8" fill="#bae6fd"/><text x="105" y="174" text-anchor="middle" class="svg-ink" font-size="13">Access rule Web-In</text><text x="105" y="192" text-anchor="middle" class="svg-muted" font-size="12">Dest network WEB</text>
<rect x="235" y="150" width="170" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">NAT rule</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Original source WEB</text>
<rect x="450" y="150" width="170" height="56" rx="8" fill="#bbf7d0"/><text x="535" y="174" text-anchor="middle" class="svg-ink" font-size="13">Other devices</text><text x="535" y="192" text-anchor="middle" class="svg-muted" font-size="12">same object</text>
<line x1="280" y1="76" x2="120" y2="150" stroke="#64748b" stroke-width="2"/><line x1="320" y1="76" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><line x1="360" y1="76" x2="520" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="112" text-anchor="middle" class="svg-accent" font-size="12">edit once, deploy once</text>
</svg><p class="cap">The WEB object feeds both the access rule and the NAT rule in lab 2.</p></div>

<h3>The lab objects</h3>
<p>Lab GUI: <b>Objects → Network Objects</b>. Real Management Center: <b>Objects → Object Management → Network</b>. The lab device already has:</p>
<table class="cmp"><tr><th>Name</th><th>Value</th><th>Used by</th></tr>
<tr><td>INSIDE-NET</td><td>10.0.1.0/24</td><td>dynamic PAT for inside users</td></tr>
<tr><td>DMZ-NET</td><td>10.0.2.0/24</td><td>dynamic PAT for the DMZ</td></tr>
<tr><td>WEB</td><td>10.0.2.10</td><td>lab 2: static NAT and rule Web-In</td></tr>
<tr><td>ADMIN</td><td>10.0.1.50</td><td>lab 3: rule Admin-SSH</td></tr></table>
<p>To add one: <b>Add Network</b>, type a Name and the Network as a.b.c.d (host) or a.b.c.d/len (subnet), Save. The dialog refuses anything that is not a valid address or prefix.</p>

<h3>Ports in the lab rule dialog</h3>
<p>The Destination Ports picker offers the predefined names HTTP, HTTPS, SSH, DNS, SMTP, RDP, FTP, TELNET, NTP and ICMP, and a free field where you can type a custom value such as <code>tcp/8080</code>. Lab 1 needs four of them: HTTP, HTTPS, DNS and ICMP.</p>

<h3>How objects appear on the device</h3>
<pre class="out">&gt; show access-control-config
-----------------[ Rule: Admin-SSH ]-----------------
    Action                : Allow
    Source Zones          : INSIDE
    Destination Zones     : OUTSIDE
<span class="hl">    Source Networks       : ADMIN</span>
    Destination Networks  : any
<span class="hl">    Destination Ports     : SSH (protocol 6, port 22)</span></pre>
<p><code>show access-control-config</code> keeps the object names, which makes it the easiest way to read the deployed policy. In <code>show running-config access-list</code> LINA shows the expanded addresses (<code>host 10.0.1.50</code>); on real devices you will also see object groups generated by the manager, with names such as <code>FMC_INLINE_src_rule_268435459</code>.</p>

<div class="eg"><p><b>Worked example.</b> The web server moves from 10.0.2.10 to 10.0.2.20. With objects: edit WEB to 10.0.2.20, Save, Deploy. Both the NAT rule and the Web-In rule now use the new address, and the public address 203.0.113.3 stays the same. Without objects you would edit the NAT rule, the access rule and any other rule with the literal address, and probably miss one.</p></div>

<div class="warn"><p><b>Common mistake.</b> Typing literal addresses into rules "just this once". Six months later nobody knows what 10.0.2.37 is, and a server move breaks a rule nobody remembered. Name it as an object, and add a description.</p></div>

<div class="exam"><p><b>Exam trap.</b> Changing an object in the Management Center does nothing on the device until you deploy, and it marks every device that uses the object as out of date. <b>Object overrides</b> let one shared object carry a different value on a specific device, useful for branch templates.</p></div>

<div class="scn"><h4>The object everyone used</h4><p>An engineer "tidied" an object called DNS-SERVERS from two addresses to one, because one server was being retired next month. The change was deployed with an unrelated ticket. Forty branch firewalls immediately stopped allowing DNS to the second server, and half the branches had slow name resolution until the change was reverted. Find Usage would have shown that the object was used in 40 devices' policies.</p><p><b>Lesson:</b> before you edit a shared object, check its usage and review the change preview in the deploy dialog.</p></div>

<div class="iv"><p class="q">"Why do you use objects instead of literal IP addresses in Management Center policies?"</p><p>Reuse and consistency: one object feeds access rules, NAT and other policies on many devices, so a change is made once and deployed everywhere. Names make policies readable and auditable, Find Usage shows the blast radius before a change, and object overrides allow per-device values in shared templates.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objects name hosts, networks, ranges, FQDNs, ports, zones and more; groups bundle them.</li>
<li>One object can be used by many policies and devices; edit once, deploy once.</li>
<li>Lab path: Objects → Network Objects → Add Network (Name, a.b.c.d or a.b.c.d/len).</li>
<li><code>show access-control-config</code> shows rules with object names.</li>
<li>Check Find Usage before changing a shared object.</li>
</ul></div>
`,hi:`
<p>Phone ki contact list object ka sabse simple example hai. Aap har baar 98-xxxx dial nahi karte; aap "Mom" par tap karte ho. Jab Mom apna number badalti hain, aap ek contact edit karte ho aur unhe use karne wala har shortcut, group aur favourite chalta rehta hai. Management Center bhi aise hi kaam karta hai: aap cheezon ko ek baar naam dete ho (host, subnet, port, zone) aur access control rules, NAT rules aur doosri policies mein naam refer karte ho.</p>

<h3>Threat Defense par objects zyada matter kyun karte hain</h3>
<p>ASA par objects ek achhi aadat the. Threat Defense par yeh kaam karne ka normal tarika hain, kyunki ek object kai devices par kai policies mein use ho sakta hai. Object badlo, aur use use karne wali har policy out of date mark ho jaati hai; ek deploy sabko update kar deta hai. Management Center yeh bhi dikhata hai ki object kahan use hua hai (<b>Find Usage</b>), jo clean-ups ke dauran sona hai.</p>

<h3>Object types jo aap sabse zyada use karoge</h3>
<dl class="terms">
<dt>Network objects</dt><dd>Host (10.0.2.10), Network (10.0.1.0/24), Range (10.0.1.100-10.0.1.150) ya FQDN (updates.example). <b>Network object groups</b> se group hote hain.</dd>
<dt>Port objects</dt><dd>Protocol aur port, jaise HTTP = TCP 80, DNS over UDP = UDP 53. Kai pehle se bane hain; aap apne bhi bana sakte ho (TCP 8443) aur unhe group kar sakte ho.</dd>
<dt>Interface objects</dt><dd><b>Security zones</b> aur <b>interface groups</b>. Access control rules zones match karti hain; NAT rules dono mein se koi use kar sakti hain.</dd>
<dt>Baad ke modules ke liye doosre</dt><dd>URL objects aur categories, application filters, geolocation, time ranges, Security Intelligence lists aur feeds, VLAN tags, SLA monitors, certificates aur VPN objects.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="One object used by many policies">
<rect x="250" y="20" width="140" height="56" rx="8" fill="#fde68a"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">object WEB</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">host 10.0.2.10</text>
<rect x="20" y="150" width="170" height="56" rx="8" fill="#bae6fd"/><text x="105" y="174" text-anchor="middle" class="svg-ink" font-size="13">Access rule Web-In</text><text x="105" y="192" text-anchor="middle" class="svg-muted" font-size="12">Dest network WEB</text>
<rect x="235" y="150" width="170" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">NAT rule</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Original source WEB</text>
<rect x="450" y="150" width="170" height="56" rx="8" fill="#bbf7d0"/><text x="535" y="174" text-anchor="middle" class="svg-ink" font-size="13">Doosre devices</text><text x="535" y="192" text-anchor="middle" class="svg-muted" font-size="12">same object</text>
<line x1="280" y1="76" x2="120" y2="150" stroke="#64748b" stroke-width="2"/><line x1="320" y1="76" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><line x1="360" y1="76" x2="520" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="112" text-anchor="middle" class="svg-accent" font-size="12">ek baar edit, ek baar deploy</text>
</svg><p class="cap">Lab 2 mein WEB object access rule aur NAT rule dono ko feed karta hai.</p></div>

<h3>Lab objects</h3>
<p>Lab GUI: <b>Objects → Network Objects</b>. Real Management Center: <b>Objects → Object Management → Network</b>. Lab device mein pehle se yeh hain:</p>
<table class="cmp"><tr><th>Naam</th><th>Value</th><th>Kaun use karta hai</th></tr>
<tr><td>INSIDE-NET</td><td>10.0.1.0/24</td><td>inside users ke liye dynamic PAT</td></tr>
<tr><td>DMZ-NET</td><td>10.0.2.0/24</td><td>DMZ ke liye dynamic PAT</td></tr>
<tr><td>WEB</td><td>10.0.2.10</td><td>lab 2: static NAT aur rule Web-In</td></tr>
<tr><td>ADMIN</td><td>10.0.1.50</td><td>lab 3: rule Admin-SSH</td></tr></table>
<p>Naya jodne ke liye: <b>Add Network</b>, Name type karo aur Network a.b.c.d (host) ya a.b.c.d/len (subnet) ke roop mein, Save. Dialog valid address ya prefix ke alawa kuch bhi mana kar deta hai.</p>

<h3>Lab rule dialog mein ports</h3>
<p>Destination Ports picker predefined names HTTP, HTTPS, SSH, DNS, SMTP, RDP, FTP, TELNET, NTP aur ICMP deta hai, aur ek free field jismein aap <code>tcp/8080</code> jaisi custom value type kar sakte ho. Lab 1 ko inmein se chaar chahiye: HTTP, HTTPS, DNS aur ICMP.</p>

<h3>Device par objects kaise dikhte hain</h3>
<pre class="out">&gt; show access-control-config
-----------------[ Rule: Admin-SSH ]-----------------
    Action                : Allow
    Source Zones          : INSIDE
    Destination Zones     : OUTSIDE
<span class="hl">    Source Networks       : ADMIN</span>
    Destination Networks  : any
<span class="hl">    Destination Ports     : SSH (protocol 6, port 22)</span></pre>
<p><code>show access-control-config</code> object names rakhta hai, jisse yeh deployed policy padhne ka sabse aasaan tarika ban jaata hai. <code>show running-config access-list</code> mein LINA expanded addresses (<code>host 10.0.1.50</code>) dikhata hai; real devices par aapko manager ke banaye object groups bhi dikhenge, <code>FMC_INLINE_src_rule_268435459</code> jaise naamon ke saath.</p>

<div class="eg"><p><b>Worked example.</b> Web server 10.0.2.10 se 10.0.2.20 par move hota hai. Objects ke saath: WEB ko 10.0.2.20 par edit karo, Save, Deploy. NAT rule aur Web-In rule dono ab naya address use karti hain, aur public address 203.0.113.3 same rehta hai. Objects ke bina aapko NAT rule, access rule aur literal address wali har doosri rule edit karni padti, aur shayad ek chhoot jaati.</p></div>

<div class="warn"><p><b>Common galti.</b> Rules mein "bas is baar" literal addresses type karna. Chhe mahine baad kisi ko nahi pata 10.0.2.37 kya hai, aur server move ek aisi rule tod deta hai jo kisi ko yaad nahi thi. Use object ka naam do, aur description jodo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Management Center mein object badalne se device par tab tak kuch nahi hota jab tak aap deploy nahi karte, aur yeh object use karne wale har device ko out of date mark kar deta hai. <b>Object overrides</b> ek shared object ko kisi specific device par alag value rakhne dete hain, branch templates ke liye useful.</p></div>

<div class="scn"><h4>Woh object jo sab use karte the</h4><p>Ek engineer ne DNS-SERVERS naam ke object ko do addresses se ek par "saaf" kar diya, kyunki ek server agle mahine retire hone wala tha. Change ek unrelated ticket ke saath deploy hua. Chaalis branch firewalls ne turant doosre server par DNS allow karna band kar diya, aur change revert hone tak aadhi branches mein name resolution slow raha. Find Usage dikha deta ki object 40 devices ki policies mein use ho raha tha.</p><p><b>Seekh:</b> shared object edit karne se pehle uska usage check karo aur deploy dialog mein change preview review karo.</p></div>

<div class="iv"><p class="q">"Management Center policies mein aap literal IP addresses ki jagah objects kyun use karte ho?"</p><p>Reuse aur consistency: ek object kai devices par access rules, NAT aur doosri policies ko feed karta hai, isliye change ek baar hota hai aur har jagah deploy hota hai. Naam policies ko readable aur auditable banate hain, Find Usage change se pehle blast radius dikhata hai, aur object overrides shared templates mein per-device values allow karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objects hosts, networks, ranges, FQDNs, ports, zones aur aur bhi cheezon ko naam dete hain; groups unhe bundle karte hain.</li>
<li>Ek object kai policies aur devices use kar sakte hain; ek baar edit, ek baar deploy.</li>
<li>Lab path: Objects → Network Objects → Add Network (Name, a.b.c.d ya a.b.c.d/len).</li>
<li><code>show access-control-config</code> rules ko object names ke saath dikhata hai.</li>
<li>Shared object badalne se pehle Find Usage check karo.</li>
</ul></div>
`}};export{e as default};