var e={id:`multivendor-security`,h:{en:`Multi-vendor networks and discovery security`,hi:`Multi-vendor networks aur discovery security`},body:{en:`
<p>A shop's name board helps customers find it, but the shopkeeper does not paint the safe's combination on it. Discovery protocols are the name board of your network: essential for the people who run it, and dangerous if they tell strangers too much. This chapter covers both sides: how to make discovery work when devices come from many vendors, and where to switch it off so it does not help an attacker.</p>

<h3>Interoperability: who can talk to whom</h3>
<p>Two devices only become neighbours if they run the <b>same</b> protocol on that link. A Cisco switch running only CDP next to a Juniper switch running only LLDP sees nothing, and neither does the Juniper. The fix is always the same: make sure LLDP runs on both ends.</p>
<table class="cmp"><tr><th>Platform</th><th>Typical default</th><th>How you enable or check it</th></tr>
<tr><td>Cisco IOS / IOS XE</td><td>CDP on, LLDP off</td><td><code>lldp run</code>; <code>show lldp neighbors</code></td></tr>
<tr><td>Cisco NX-OS</td><td>CDP on, LLDP as a feature</td><td><code>feature lldp</code>; <code>show lldp neighbors</code></td></tr>
<tr><td>Juniper Junos</td><td>LLDP on for most switches</td><td><code>set protocols lldp interface all</code>; <code>show lldp neighbors</code></td></tr>
<tr><td>Linux servers</td><td>None until an agent runs</td><td>An LLDP daemon such as lldpd; <code>lldpcli show neighbors</code></td></tr>
<tr><td>IP phones and access points</td><td>Vendor-dependent</td><td>Cisco models speak CDP and LLDP; most others LLDP and LLDP-MED</td></tr>
</table>
<p>Some virtual switches can also speak discovery: for example, hypervisor distributed switches can often be set to send CDP or LLDP towards the physical switch, which helps server and network teams agree on cabling.</p>

<h3>Reading a non-Cisco neighbour</h3>
<p>LLDP carries what the sender chooses to put in it, so fields look different per vendor. The Port ID may be an interface name (<code>ge-0/0/12</code> on Junos), a MAC address, or a locally assigned number. The Device ID is the system name if one was sent, otherwise the chassis MAC. The system description tells you the vendor and software.</p>
<pre class="out">SW1# show lldp neighbors
Device ID           Local Intf     Hold-time  Capability      Port ID
<span class="hl">EX-CORE-01          Gi0/24         120        B,R             ge-0/0/12</span>
srv-db-01.example   Gi0/15         120        S               ens192
R1                  Gi0/2          120        R               Gi0/0</pre>
<p>Here SW1 sees a Juniper core switch (bridge and router), a Linux database server (station) and a Cisco router, all through one standard protocol.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Where discovery should be on or off">
<rect x="20" y="20" width="600" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Trusted infrastructure: switch, router, AP, phone links</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">CDP and/or LLDP on</text>
<rect x="20" y="95" width="290" height="60" rx="10" fill="#fed7aa"/><text x="165" y="120" text-anchor="middle" class="svg-ink" font-size="14">User, guest, kiosk ports</text><text x="165" y="140" text-anchor="middle" class="svg-muted" font-size="12">off per interface</text>
<rect x="330" y="95" width="290" height="60" rx="10" fill="#fed7aa"/><text x="475" y="120" text-anchor="middle" class="svg-ink" font-size="14">ISP, partner, internet edge</text><text x="475" y="140" text-anchor="middle" class="svg-muted" font-size="12">off (globally if possible)</text>
<rect x="20" y="170" width="600" height="56" rx="10" fill="#e2e8f0"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="14">Always: patched software, port security / 802.1X</text><text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">never treat discovery data as proof of identity</text>
</svg><p class="cap">A simple discovery policy: on where you control both ends, off where you do not.</p></div>

<h3>The security risks</h3>
<dl class="terms">
<dt>Reconnaissance</dt><dd>One frame reveals hostname, model, exact software version, management IP, native VLAN and VTP domain. An attacker uses the version to look up known vulnerabilities and the address to aim at the management plane.</dd>
<dt>Spoofing</dt><dd>Discovery frames are not authenticated. A laptop can pretend to be an IP phone and receive the voice VLAN, or send fake neighbour information that confuses operators and inventory tools.</dd>
<dt>Resource exhaustion</dt><dd>Flooding a device with thousands of fake neighbours can fill its neighbour table and use CPU and memory, especially on older software.</dd>
<dt>Implementation bugs</dt><dd>Parsers for discovery frames run on the device's CPU. In 2020 a group of CDP vulnerabilities (published as "CDPwn") affected many Cisco switches, routers, phones and cameras until they were patched.</dd>
</dl>

<h3>Best practice</h3>
<ul>
<li>Keep discovery <b>on</b> links between devices you own and on phone and access point ports that need it.</li>
<li>Turn it <b>off per interface</b> on user access ports, guest and kiosk ports and anything facing another organisation: <code>no cdp enable</code>, <code>no lldp transmit</code>, <code>no lldp receive</code>.</li>
<li>Turn it <b>off globally</b> on devices that only face untrusted networks, such as an internet edge router: <code>no cdp run</code>, <code>no lldp run</code>.</li>
<li>Keep software patched, and pair discovery policy with port security, 802.1X and a voice VLAN policy so a spoofed phone cannot simply walk into the voice VLAN.</li>
</ul>
<pre class="code"><span class="c">! access-port template, applied to desks and guest ports</span>
SW1(config)# interface range g0/3 - 6
SW1(config-if-range)# no cdp enable
SW1(config-if-range)# no lldp transmit
SW1(config-if-range)# no lldp receive
<span class="c">! internet edge router: no discovery anywhere</span>
R2(config)# no cdp run
R2(config)# no lldp run</pre>

<div class="eg"><p><b>Worked example.</b> A branch switch has 2 uplinks (Gi0/1 to 2), 4 phone ports (Gi0/7 to 10), a kiosk (Gi0/5) and 5 desks (Gi0/3, 4, 6, 11, 12), plus an internet router behind SW2. The policy: CDP and LLDP stay on for the uplinks and phones (6 ports); both are disabled on the kiosk and 5 desk ports (6 ports); the internet router gets <code>no cdp run</code> and <code>no lldp run</code>. Result: engineers can still map the infrastructure, phones still receive voice VLANs, and none of the 6 untrusted ports hears a single discovery frame.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Disabling CDP on user ports but leaving LLDP enabled there after turning it on globally for phones. Check both protocols. (2) Turning discovery off globally on an access switch "for security" and breaking every phone. (3) Trusting a CDP entry as proof that a device is what it claims to be.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which is a security best practice for CDP?" The answer is to disable it on ports facing untrusted or end-user devices, not to disable it everywhere and not to change its timers. Timers do not reduce what is revealed.</p></div>

<div class="scn"><h4>The fake phone</h4><p>During an internal red-team test, a tester's laptop sent CDP frames claiming to be a phone on a desk port. The switch replied with voice VLAN 110, and the laptop joined the voice VLAN, where the call servers lived with lighter filtering. The fix combined three controls: 802.1X with a separate policy for phones, <code>no cdp enable</code> and no LLDP on ports without phones, and an ACL on the voice VLAN that only allowed signalling and media to the call servers.</p><p><b>Lesson:</b> discovery information is unauthenticated; never let it be the only gate.</p></div>

<div class="iv"><p class="q">"Is CDP a security risk? What would you do about it?"</p><p>Say yes: it leaks hostname, model, version, management IP and VLAN information, can be spoofed and has had implementation bugs. Then give a balanced policy: keep it on trusted infrastructure and phone links, disable per interface on user and untrusted ports, disable globally on internet edge devices, prefer LLDP in multi-vendor sites, patch, and combine with 802.1X and port security.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neighbours form only when both ends run the same protocol; use LLDP for multi-vendor links.</li>
<li>Non-Cisco neighbours may show MACs or vendor port names in Device ID and Port ID.</li>
<li>Risks: reconnaissance, spoofing, resource exhaustion and implementation bugs.</li>
<li>Policy: on for infrastructure and phones, off per interface on untrusted ports, off globally on internet edge devices.</li>
<li>Discovery data is not authenticated; combine with 802.1X and port security.</li>
</ul></div>
`,hi:`
<p>Dukaan ka name board customers ko dukaan dhoondhne mein madad karta hai, lekin dukaandaar us par tijori ka combination nahi likhta. Discovery protocols aapke network ka name board hain: chalane walon ke liye zaroori, aur khatarnak agar ajnabiyon ko bahut kuch bata dein. Yeh chapter dono sides cover karta hai: jab devices kai vendors ke hon to discovery kaise chalayein, aur ise kahan band karein taaki attacker ki madad na ho.</p>

<h3>Interoperability: kaun kisse baat kar sakta hai</h3>
<p>Do devices tabhi neighbours bante hain jab us link par <b>same</b> protocol chala rahe hon. Sirf CDP chalane wala Cisco switch sirf LLDP chalane wale Juniper switch ke bagal mein kuch nahi dekhta, aur Juniper bhi nahi. Fix hamesha same hai: pakka karo ki dono ends par LLDP chal raha hai.</p>
<table class="cmp"><tr><th>Platform</th><th>Typical default</th><th>Kaise enable ya check karte hain</th></tr>
<tr><td>Cisco IOS / IOS XE</td><td>CDP on, LLDP off</td><td><code>lldp run</code>; <code>show lldp neighbors</code></td></tr>
<tr><td>Cisco NX-OS</td><td>CDP on, LLDP ek feature ke roop mein</td><td><code>feature lldp</code>; <code>show lldp neighbors</code></td></tr>
<tr><td>Juniper Junos</td><td>Zyada tar switches par LLDP on</td><td><code>set protocols lldp interface all</code>; <code>show lldp neighbors</code></td></tr>
<tr><td>Linux servers</td><td>Jab tak agent na chale, kuch nahi</td><td>lldpd jaisa LLDP daemon; <code>lldpcli show neighbors</code></td></tr>
<tr><td>IP phones aur access points</td><td>Vendor par depend</td><td>Cisco models CDP aur LLDP bolte hain; zyada tar doosre LLDP aur LLDP-MED</td></tr>
</table>
<p>Kuch virtual switches bhi discovery bol sakte hain: jaise hypervisor distributed switches ko aksar physical switch ki taraf CDP ya LLDP bhejne ke liye set kiya ja sakta hai, jisse server aur network teams cabling par agree kar paati hain.</p>

<h3>Non-Cisco neighbour ko padhna</h3>
<p>LLDP wahi carry karta hai jo sender usme daalna chahe, isliye fields har vendor mein alag dikhte hain. Port ID interface name (Junos par <code>ge-0/0/12</code>), MAC address, ya locally assigned number ho sakta hai. Device ID system name hota hai agar bheja gaya, warna chassis MAC. System description vendor aur software batata hai.</p>
<pre class="out">SW1# show lldp neighbors
Device ID           Local Intf     Hold-time  Capability      Port ID
<span class="hl">EX-CORE-01          Gi0/24         120        B,R             ge-0/0/12</span>
srv-db-01.example   Gi0/15         120        S               ens192
R1                  Gi0/2          120        R               Gi0/0</pre>
<p>Yahan SW1 ek Juniper core switch (bridge aur router), ek Linux database server (station) aur ek Cisco router dekhta hai, sab ek standard protocol se.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Discovery kahan on ya off">
<rect x="20" y="20" width="600" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Trusted infrastructure: switch, router, AP, phone links</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">CDP aur/ya LLDP on</text>
<rect x="20" y="95" width="290" height="60" rx="10" fill="#fed7aa"/><text x="165" y="120" text-anchor="middle" class="svg-ink" font-size="14">User, guest, kiosk ports</text><text x="165" y="140" text-anchor="middle" class="svg-muted" font-size="12">per interface off</text>
<rect x="330" y="95" width="290" height="60" rx="10" fill="#fed7aa"/><text x="475" y="120" text-anchor="middle" class="svg-ink" font-size="14">ISP, partner, internet edge</text><text x="475" y="140" text-anchor="middle" class="svg-muted" font-size="12">off (ho sake to globally)</text>
<rect x="20" y="170" width="600" height="56" rx="10" fill="#e2e8f0"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="14">Hamesha: patched software, port security / 802.1X</text><text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">discovery data ko kabhi identity ka saboot mat maano</text>
</svg><p class="cap">Ek simple discovery policy: jahan dono ends aapke control mein hon wahan on, jahan nahi wahan off.</p></div>

<h3>Security risks</h3>
<dl class="terms">
<dt>Reconnaissance</dt><dd>Ek frame hostname, model, exact software version, management IP, native VLAN aur VTP domain bata deta hai. Attacker version se known vulnerabilities dhoondhta hai aur address se management plane par nishana lagata hai.</dd>
<dt>Spoofing</dt><dd>Discovery frames authenticated nahi hote. Laptop IP phone hone ka naatak karke voice VLAN le sakta hai, ya fake neighbour information bhej sakta hai jo operators aur inventory tools ko confuse kare.</dd>
<dt>Resource exhaustion</dt><dd>Device par hazaaron fake neighbours ki barsaat uski neighbour table bhar sakti hai aur CPU aur memory kha sakti hai, khaas kar purane software par.</dd>
<dt>Implementation bugs</dt><dd>Discovery frames ke parsers device ke CPU par chalte hain. 2020 mein CDP vulnerabilities ke ek group ("CDPwn" naam se publish) ne kai Cisco switches, routers, phones aur cameras ko affect kiya jab tak patch nahi hue.</dd>
</dl>

<h3>Best practice</h3>
<ul>
<li>Apne devices ke beech ke links par aur jin phone aur access point ports ko zaroorat hai un par discovery <b>on</b> rakho.</li>
<li>User access ports, guest aur kiosk ports aur doosri organisation ki taraf wali har cheez par <b>per interface off</b> karo: <code>no cdp enable</code>, <code>no lldp transmit</code>, <code>no lldp receive</code>.</li>
<li>Jo devices sirf untrusted networks ki taraf hain, jaise internet edge router, un par <b>globally off</b> karo: <code>no cdp run</code>, <code>no lldp run</code>.</li>
<li>Software patched rakho, aur discovery policy ko port security, 802.1X aur voice VLAN policy ke saath jodo taaki spoofed phone aaram se voice VLAN mein na ghus sake.</li>
</ul>
<pre class="code"><span class="c">! access-port template, desks aur guest ports par</span>
SW1(config)# interface range g0/3 - 6
SW1(config-if-range)# no cdp enable
SW1(config-if-range)# no lldp transmit
SW1(config-if-range)# no lldp receive
<span class="c">! internet edge router: kahin bhi discovery nahi</span>
R2(config)# no cdp run
R2(config)# no lldp run</pre>

<div class="eg"><p><b>Worked example.</b> Ek branch switch par 2 uplinks (Gi0/1 se 2), 4 phone ports (Gi0/7 se 10), ek kiosk (Gi0/5) aur 5 desks (Gi0/3, 4, 6, 11, 12) hain, aur SW2 ke peeche ek internet router. Policy: uplinks aur phones (6 ports) par CDP aur LLDP on rehte hain; kiosk aur 5 desk ports (6 ports) par dono disabled; internet router ko <code>no cdp run</code> aur <code>no lldp run</code> milta hai. Result: engineers ab bhi infrastructure map kar sakte hain, phones ko ab bhi voice VLANs milte hain, aur 6 untrusted ports mein se koi ek bhi discovery frame nahi sunta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) User ports par CDP band karna lekin phones ke liye LLDP globally on karne ke baad wahan LLDP enabled chhod dena. Dono protocols check karo. (2) Access switch par "security ke liye" discovery globally band karna aur har phone tod dena. (3) CDP entry ko is baat ka saboot maanna ki device wahi hai jo woh claim karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "CDP ke liye security best practice kya hai?" Jawab hai untrusted ya end-user devices ki taraf wale ports par ise disable karna, har jagah disable karna nahi aur iske timers badalna nahi. Timers badalne se jo reveal hota hai woh kam nahi hota.</p></div>

<div class="scn"><h4>Nakli phone</h4><p>Ek internal red-team test mein tester ke laptop ne desk port par phone hone ka claim karte hue CDP frames bheje. Switch ne voice VLAN 110 ke saath jawab diya, aur laptop voice VLAN mein aa gaya, jahan call servers halki filtering ke saath rehte the. Fix mein teen controls jode gaye: phones ke liye alag policy ke saath 802.1X, bina phone wale ports par <code>no cdp enable</code> aur LLDP band, aur voice VLAN par ek ACL jo call servers tak sirf signalling aur media allow karta tha.</p><p><b>Seekh:</b> discovery information authenticated nahi hoti; ise kabhi akela darwaaza mat banne do.</p></div>

<div class="iv"><p class="q">"Kya CDP security risk hai? Aap iske baare mein kya karoge?"</p><p>Haan kaho: yeh hostname, model, version, management IP aur VLAN information leak karta hai, spoof ho sakta hai aur isme implementation bugs rahe hain. Phir balanced policy do: trusted infrastructure aur phone links par on rakho, user aur untrusted ports par per interface disable karo, internet edge devices par globally disable karo, multi-vendor sites mein LLDP prefer karo, patch karo, aur 802.1X aur port security ke saath jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neighbours tabhi bante hain jab dono ends same protocol chalayein; multi-vendor links ke liye LLDP use karo.</li>
<li>Non-Cisco neighbours Device ID aur Port ID mein MACs ya vendor port names dikha sakte hain.</li>
<li>Risks: reconnaissance, spoofing, resource exhaustion aur implementation bugs.</li>
<li>Policy: infrastructure aur phones ke liye on, untrusted ports par per interface off, internet edge devices par globally off.</li>
<li>Discovery data authenticated nahi hota; 802.1X aur port security ke saath jodo.</li>
</ul></div>
`}};export{e as default};