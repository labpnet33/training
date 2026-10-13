var e={id:`sisf-framework`,h:{en:`The SISF framework: device-tracking and IPv6 snooping policies`,hi:`SISF framework: device-tracking aur IPv6 snooping policies`},body:{en:`
<p>A big office tower has one visitor register at reception. The badge printer, the lift access system and the parking gate do not keep their own lists; they all ask the register. Cisco builds IPv6 first-hop security the same way. One engine on the switch, <b>SISF</b> (Switch Integrated Security Features), keeps the register (the <b>binding table</b>), and each security feature is a client of that register.</p>

<h3>What SISF is</h3>
<p>SISF is the framework on Catalyst switches running IOS and IOS XE that:</p>
<ul>
<li>snoops NDP, DHCPv6 (and for IPv4, ARP and DHCP) on the ports where a policy is attached,</li>
<li>builds and maintains the <b>binding table</b> of IP address, MAC, VLAN, port and state,</li>
<li>provides that table to the features built on top: RA guard, DHCPv6 guard, source guard, prefix guard, destination guard, and also other clients such as IP device tracking used by 802.1X and SD-Access.</li>
</ul>
<p>Every SISF feature follows the same pattern: <b>define a policy, then attach it to a target</b>. A target is an interface or a VLAN.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="SISF architecture">
<rect x="160" y="110" width="320" height="56" rx="10" fill="#ddd6fe"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="14">SISF binding table</text><text x="320" y="153" text-anchor="middle" class="svg-muted" font-size="12">IP, MAC, VLAN, port, state</text>
<rect x="20" y="20" width="140" height="36" rx="6" fill="#e2e8f0"/><text x="90" y="43" text-anchor="middle" class="svg-ink" font-size="12">NDP snooping</text>
<rect x="250" y="20" width="140" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="12">DHCPv6 snooping</text>
<rect x="480" y="20" width="140" height="36" rx="6" fill="#e2e8f0"/><text x="550" y="43" text-anchor="middle" class="svg-ink" font-size="12">Static entries</text>
<line x1="90" y1="56" x2="230" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="56" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="550" y1="56" x2="410" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="205" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="80" y="228" text-anchor="middle" class="svg-ink" font-size="12">RA guard</text>
<rect x="170" y="205" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="240" y="228" text-anchor="middle" class="svg-ink" font-size="12">DHCPv6 guard</text>
<rect x="330" y="205" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="400" y="228" text-anchor="middle" class="svg-ink" font-size="12">Source/prefix guard</text>
<rect x="490" y="205" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="560" y="228" text-anchor="middle" class="svg-ink" font-size="12">Destination guard</text>
<line x1="80" y1="205" x2="220" y2="166" stroke="#64748b" stroke-width="2"/><line x1="240" y1="205" x2="290" y2="166" stroke="#64748b" stroke-width="2"/><line x1="400" y1="205" x2="350" y2="166" stroke="#64748b" stroke-width="2"/><line x1="560" y1="205" x2="420" y2="166" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Gleaning sources fill the table (top); features consume it (bottom).</p></div>

<h3>Two generations of CLI</h3>
<p>You will meet two command families, and the exam expects you to recognise both:</p>
<table class="cmp"><tr><th>Older IOS / early IOS XE</th><th>IOS XE 16.x and later (SISF-based)</th></tr>
<tr><td><code>ipv6 snooping policy NAME</code></td><td><code>device-tracking policy NAME</code></td></tr>
<tr><td><code>ipv6 snooping attach-policy NAME</code></td><td><code>device-tracking attach-policy NAME</code></td></tr>
<tr><td><code>show ipv6 neighbors binding</code> / <code>show ipv6 snooping binding</code></td><td><code>show device-tracking database</code></td></tr>
<tr><td><code>show ipv6 snooping counters</code></td><td><code>show device-tracking counters</code></td></tr>
<tr><td><code>ipv6 nd inspection policy NAME</code> (separate feature)</td><td><code>security-level inspect</code> in a device-tracking policy</td></tr>
</table>
<p>On newer IOS XE, typing an <code>ipv6 snooping</code> command is accepted and converted to the <code>device-tracking</code> form, and the command <code>device-tracking upgrade-cli</code> migrates old IPDT and IPv6 snooping configuration. The labs in this module use the <code>ipv6 snooping</code> spelling, and also accept <code>show device-tracking database</code>. RA guard, DHCPv6 guard and source guard keep their own names (<code>ipv6 nd raguard</code>, <code>ipv6 dhcp guard</code>, <code>ipv6 source-guard</code>) in both generations.</p>

<h3>Policy options you must know</h3>
<pre class="code"><span class="c">! Modern syntax</span>
device-tracking policy EDGE-DT
 security-level guard            <span class="c">! glean | guard (default) | inspect</span>
 device-role node                <span class="c">! node (default, a host port) | switch</span>
 tracking enable                 <span class="c">! actively probe entries before they age</span>
 limit address-count 10          <span class="c">! max bindings on the port</span>
 no protocol arp                 <span class="c">! choose which protocols to glean (IPv6-only here)</span>
!
<span class="c">! Same idea, older syntax used in lab 3</span>
ipv6 snooping policy EDGE-SNOOP
 security-level guard
 tracking enable</pre>
<dl class="terms">
<dt>security-level glean</dt><dd>Learn bindings only. Nothing is dropped. Ideal for a first rollout, to see what exists.</dd>
<dt>security-level guard (default)</dt><dd>Learn bindings and enforce them: an NDP or DHCPv6 message that claims an address already bound to another port and MAC is dropped, and RA and DHCPv6 server messages from node-role ports are blocked.</dd>
<dt>security-level inspect</dt><dd>Everything guard does, plus message validation (consistency between the link-layer address option and the source MAC, and other sanity checks). This is the SISF form of ND inspection.</dd>
<dt>device-role node / switch</dt><dd><b>node</b> is a host-facing access port. <b>switch</b> marks a port towards another switch that also runs SISF; entries learned there are treated as coming from a trunk and the ports cooperate instead of fighting over ownership.</dd>
<dt>trusted-port</dt><dd>No enforcement on this port, and bindings learned here get a higher preference. Use it only for ports whose devices you control.</dd>
<dt>tracking enable</dt><dd>When an entry's reachable lifetime ends, the switch sends a probe (NS) to the owner. If it answers, the entry stays REACHABLE; if not, it becomes STALE.</dd>
<dt>limit address-count</dt><dd>Maximum number of IPv6 (or IPv4) bindings on the port; protects the table from a host that invents thousands of addresses.</dd>
</dl>

<h3>Attaching a policy</h3>
<pre class="code"><span class="c">! Per interface (as in lab 3)</span>
interface range GigabitEthernet0/1 - 3
 ipv6 snooping attach-policy EDGE-SNOOP
<span class="c">! Per VLAN on IOS XE</span>
vlan configuration 30
 device-tracking attach-policy EDGE-DT
<span class="c">! Interface, limited to some VLANs on a trunk</span>
interface GigabitEthernet1/0/48
 device-tracking attach-policy UPLINK-DT vlan 30,40</pre>
<p>If both a VLAN policy and an interface policy apply to the same port and VLAN, the <b>interface policy wins</b> because it is more specific. On newer IOS XE you may also see system-created policies such as <code>DT-PROGRAMMATIC</code>, added automatically by features that need device tracking; do not delete them without knowing which feature created them.</p>

<h3>Verification</h3>
<pre class="out">SW1# show ipv6 snooping policies
Target               Type  Policy               Feature        Target range
<span class="hl">Gi0/1                PORT  EDGE-SNOOP           Snooping       vlan all</span>
Gi0/2                PORT  EDGE-SNOOP           Snooping       vlan all
Gi0/3                PORT  EDGE-SNOOP           Snooping       vlan all</pre>
<p>The same list is shown on IOS XE with <code>show device-tracking policies</code>; <code>show device-tracking policy EDGE-DT</code> shows the options and targets of one policy, and <code>show device-tracking features</code> lists which SISF features are active.</p>

<div class="eg"><p><b>Worked example.</b> A 48-port access switch has users on Gi1/0/1 to 46, an AP on Gi1/0/47 and a trunk to the distribution layer on Gi1/0/48. Plan: policy USER-DT (guard, tracking enable, limit address-count 10) on the user ports; policy AP-DT (guard, limit address-count 200) on the AP port because many wireless clients appear behind it; policy UPLINK-DT with <code>device-role switch</code> (or <code>trusted-port</code>) on the trunk. Three policies, each attached where it fits.</p></div>

<div class="warn"><p><b>Common mistake.</b> Attaching a guard-level policy with default role to the uplink trunk. The switch then sees the real router's RAs and DHCPv6 replies arriving on a "node" port and drops them, and every host in the VLAN loses its gateway. Uplinks get <code>device-role switch</code>, <code>trusted-port</code> or no enforcing policy.</p></div>

<div class="exam"><p><b>Exam trap.</b> The default security level is <b>guard</b>, not glean. And <code>ipv6 snooping</code> on older switches equals <code>device-tracking</code> on newer ones: both build the same binding table.</p></div>

<div class="scn"><h4>The upgrade that doubled the policies</h4><p>After an IOS XE upgrade, an engineer found both old <code>ipv6 snooping</code> lines and new <code>device-tracking</code> lines in the saved configuration, and some ports behaved differently from the template. <code>show device-tracking policies</code> showed two policies on several ports, one per VLAN and one per interface. The team ran <code>device-tracking upgrade-cli</code> in a maintenance window, cleaned the template to use only the new syntax, and confirmed with <code>show device-tracking policies</code> that each port had exactly one policy.</p><p><b>Lesson:</b> after an upgrade, check which syntax your templates push and which policy actually wins on each port.</p></div>

<div class="iv"><p class="q">"What are the SISF security levels and when would you use each?"</p><p>Glean only learns bindings, used for visibility during rollout. Guard, the default, learns and enforces: it blocks claims to addresses bound elsewhere and blocks RA and DHCPv6 server messages from host ports. Inspect adds message validation, the equivalent of ND inspection. A strong answer describes a phased rollout: glean first, then guard, then inspect or source guard where needed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SISF is one engine with one binding table; FHS features are its clients.</li>
<li>Pattern: define a policy, attach to an interface or VLAN; interface policy beats VLAN policy.</li>
<li><code>ipv6 snooping</code> (old) and <code>device-tracking</code> (IOS XE 16.x+) do the same job.</li>
<li>Security levels: glean (learn), guard (default, enforce), inspect (enforce plus validate).</li>
<li>device-role node for hosts, switch for inter-switch links; trusted-port disables enforcement.</li>
</ul></div>
`,hi:`
<p>Ek bade office tower mein reception par ek hi visitor register hota hai. Badge printer, lift access system aur parking gate apni alag lists nahi rakhte; sab register se puchhte hain. Cisco IPv6 first-hop security bhi isi tarah banata hai. Switch par ek engine, <b>SISF</b> (Switch Integrated Security Features), register (<b>binding table</b>) rakhta hai, aur har security feature us register ka client hai.</p>

<h3>SISF kya hai</h3>
<p>SISF IOS aur IOS XE chalane wale Catalyst switches par woh framework hai jo:</p>
<ul>
<li>jin ports par policy attach hai wahan NDP, DHCPv6 (aur IPv4 ke liye ARP aur DHCP) snoop karta hai,</li>
<li>IP address, MAC, VLAN, port aur state ki <b>binding table</b> banata aur maintain karta hai,</li>
<li>yeh table upar bane features ko deta hai: RA guard, DHCPv6 guard, source guard, prefix guard, destination guard, aur doosre clients jaise 802.1X aur SD-Access mein use hone wala IP device tracking.</li>
</ul>
<p>Har SISF feature same pattern follow karta hai: <b>policy define karo, phir use target par attach karo</b>. Target ek interface ya VLAN hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="SISF architecture">
<rect x="160" y="110" width="320" height="56" rx="10" fill="#ddd6fe"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="14">SISF binding table</text><text x="320" y="153" text-anchor="middle" class="svg-muted" font-size="12">IP, MAC, VLAN, port, state</text>
<rect x="20" y="20" width="140" height="36" rx="6" fill="#e2e8f0"/><text x="90" y="43" text-anchor="middle" class="svg-ink" font-size="12">NDP snooping</text>
<rect x="250" y="20" width="140" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="12">DHCPv6 snooping</text>
<rect x="480" y="20" width="140" height="36" rx="6" fill="#e2e8f0"/><text x="550" y="43" text-anchor="middle" class="svg-ink" font-size="12">Static entries</text>
<line x1="90" y1="56" x2="230" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="56" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="550" y1="56" x2="410" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="205" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="80" y="228" text-anchor="middle" class="svg-ink" font-size="12">RA guard</text>
<rect x="170" y="205" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="240" y="228" text-anchor="middle" class="svg-ink" font-size="12">DHCPv6 guard</text>
<rect x="330" y="205" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="400" y="228" text-anchor="middle" class="svg-ink" font-size="12">Source/prefix guard</text>
<rect x="490" y="205" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="560" y="228" text-anchor="middle" class="svg-ink" font-size="12">Destination guard</text>
<line x1="80" y1="205" x2="220" y2="166" stroke="#64748b" stroke-width="2"/><line x1="240" y1="205" x2="290" y2="166" stroke="#64748b" stroke-width="2"/><line x1="400" y1="205" x2="350" y2="166" stroke="#64748b" stroke-width="2"/><line x1="560" y1="205" x2="420" y2="166" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Gleaning sources table bharte hain (upar); features use karte hain (neeche).</p></div>

<h3>CLI ki do generations</h3>
<p>Aapko do command families milengi, aur exam chahta hai ki aap dono pehchano:</p>
<table class="cmp"><tr><th>Purana IOS / early IOS XE</th><th>IOS XE 16.x aur baad (SISF-based)</th></tr>
<tr><td><code>ipv6 snooping policy NAME</code></td><td><code>device-tracking policy NAME</code></td></tr>
<tr><td><code>ipv6 snooping attach-policy NAME</code></td><td><code>device-tracking attach-policy NAME</code></td></tr>
<tr><td><code>show ipv6 neighbors binding</code> / <code>show ipv6 snooping binding</code></td><td><code>show device-tracking database</code></td></tr>
<tr><td><code>show ipv6 snooping counters</code></td><td><code>show device-tracking counters</code></td></tr>
<tr><td><code>ipv6 nd inspection policy NAME</code> (alag feature)</td><td>device-tracking policy mein <code>security-level inspect</code></td></tr>
</table>
<p>Naye IOS XE par <code>ipv6 snooping</code> command type karna accept hota hai aur <code>device-tracking</code> form mein convert ho jaata hai, aur <code>device-tracking upgrade-cli</code> command purani IPDT aur IPv6 snooping configuration migrate karta hai. Is module ki labs <code>ipv6 snooping</code> spelling use karti hain, aur <code>show device-tracking database</code> bhi accept karti hain. RA guard, DHCPv6 guard aur source guard dono generations mein apne naam rakhte hain (<code>ipv6 nd raguard</code>, <code>ipv6 dhcp guard</code>, <code>ipv6 source-guard</code>).</p>

<h3>Policy options jo aapko aane chahiye</h3>
<pre class="code"><span class="c">! Modern syntax</span>
device-tracking policy EDGE-DT
 security-level guard            <span class="c">! glean | guard (default) | inspect</span>
 device-role node                <span class="c">! node (default, host port) | switch</span>
 tracking enable                 <span class="c">! age hone se pehle entries ko probe karo</span>
 limit address-count 10          <span class="c">! port par max bindings</span>
 no protocol arp                 <span class="c">! kaunse protocols glean karne hain (yahan sirf IPv6)</span>
!
<span class="c">! Wahi idea, purana syntax jo lab 3 mein use hota hai</span>
ipv6 snooping policy EDGE-SNOOP
 security-level guard
 tracking enable</pre>
<dl class="terms">
<dt>security-level glean</dt><dd>Sirf bindings seekho. Kuch drop nahi hota. Pehle rollout ke liye perfect, yeh dekhne ke liye ki kya maujood hai.</dd>
<dt>security-level guard (default)</dt><dd>Bindings seekho aur enforce karo: jo NDP ya DHCPv6 message kisi doosre port aur MAC par bound address claim kare woh drop hota hai, aur node-role ports se RA aur DHCPv6 server messages block hote hain.</dd>
<dt>security-level inspect</dt><dd>Guard jo karta hai sab, plus message validation (link-layer address option aur source MAC ke beech consistency, aur doosre sanity checks). Yeh ND inspection ka SISF form hai.</dd>
<dt>device-role node / switch</dt><dd><b>node</b> host ki taraf wala access port hai. <b>switch</b> aise port ko mark karta hai jo doosre SISF chalane wale switch ki taraf hai; wahan seekhi entries trunk se aayi maani jaati hain aur ports ownership par ladne ke bajaye cooperate karte hain.</dd>
<dt>trusted-port</dt><dd>Is port par koi enforcement nahi, aur yahan seekhi bindings ko zyada preference milti hai. Sirf un ports par use karo jinke devices aapke control mein hain.</dd>
<dt>tracking enable</dt><dd>Jab entry ka reachable lifetime khatam hota hai, switch owner ko probe (NS) bhejta hai. Jawab aaye to entry REACHABLE rehti hai; na aaye to STALE ho jaati hai.</dd>
<dt>limit address-count</dt><dd>Port par IPv6 (ya IPv4) bindings ki maximum sankhya; table ko us host se bachata hai jo hazaaron addresses bana leta hai.</dd>
</dl>

<h3>Policy attach karna</h3>
<pre class="code"><span class="c">! Per interface (jaisa lab 3 mein)</span>
interface range GigabitEthernet0/1 - 3
 ipv6 snooping attach-policy EDGE-SNOOP
<span class="c">! IOS XE par per VLAN</span>
vlan configuration 30
 device-tracking attach-policy EDGE-DT
<span class="c">! Interface, trunk par kuch VLANs tak seemit</span>
interface GigabitEthernet1/0/48
 device-tracking attach-policy UPLINK-DT vlan 30,40</pre>
<p>Agar same port aur VLAN par VLAN policy aur interface policy dono laagu hon, to <b>interface policy jeetti hai</b> kyunki woh zyada specific hai. Naye IOS XE par aapko <code>DT-PROGRAMMATIC</code> jaisi system-created policies bhi dikh sakti hain, jo device tracking chahne wale features apne aap jodte hain; bina jaane ki kis feature ne banayi, unhe delete mat karo.</p>

<h3>Verification</h3>
<pre class="out">SW1# show ipv6 snooping policies
Target               Type  Policy               Feature        Target range
<span class="hl">Gi0/1                PORT  EDGE-SNOOP           Snooping       vlan all</span>
Gi0/2                PORT  EDGE-SNOOP           Snooping       vlan all
Gi0/3                PORT  EDGE-SNOOP           Snooping       vlan all</pre>
<p>IOS XE par yahi list <code>show device-tracking policies</code> se dikhti hai; <code>show device-tracking policy EDGE-DT</code> ek policy ke options aur targets dikhata hai, aur <code>show device-tracking features</code> batata hai ki kaunse SISF features active hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek 48-port access switch par Gi1/0/1 se 46 par users hain, Gi1/0/47 par AP aur Gi1/0/48 par distribution layer ki taraf trunk. Plan: user ports par policy USER-DT (guard, tracking enable, limit address-count 10); AP port par policy AP-DT (guard, limit address-count 200) kyunki uske peeche bahut saare wireless clients dikhte hain; trunk par <code>device-role switch</code> (ya <code>trusted-port</code>) wali policy UPLINK-DT. Teen policies, har ek wahan attach jahan fit ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Uplink trunk par default role wali guard-level policy attach karna. Tab switch asli router ke RAs aur DHCPv6 replies ko "node" port par aata dekhta hai aur drop kar deta hai, aur VLAN ke har host ka gateway chala jaata hai. Uplinks ko <code>device-role switch</code>, <code>trusted-port</code> ya koi enforcing policy nahi milni chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default security level <b>guard</b> hai, glean nahi. Aur purane switches ka <code>ipv6 snooping</code> naye switches ke <code>device-tracking</code> ke barabar hai: dono same binding table banate hain.</p></div>

<div class="scn"><h4>Upgrade jisne policies double kar di</h4><p>Ek IOS XE upgrade ke baad engineer ko saved configuration mein purani <code>ipv6 snooping</code> lines aur nayi <code>device-tracking</code> lines dono mili, aur kuch ports template se alag behave kar rahe the. <code>show device-tracking policies</code> ne kai ports par do policies dikhayi, ek per VLAN aur ek per interface. Team ne maintenance window mein <code>device-tracking upgrade-cli</code> chalaya, template ko sirf naye syntax par saaf kiya, aur <code>show device-tracking policies</code> se confirm kiya ki har port par bilkul ek policy hai.</p><p><b>Seekh:</b> upgrade ke baad check karo ki aapke templates kaunsa syntax push karte hain aur har port par asal mein kaunsi policy jeet rahi hai.</p></div>

<div class="iv"><p class="q">"SISF security levels kya hain aur har ek kab use karoge?"</p><p>Glean sirf bindings seekhta hai, rollout ke dauran visibility ke liye. Guard, jo default hai, seekhta aur enforce karta hai: kahin aur bound addresses ke claims aur host ports se RA aur DHCPv6 server messages block karta hai. Inspect message validation jodta hai, ND inspection ke barabar. Strong answer phased rollout batata hai: pehle glean, phir guard, phir zaroorat ho wahan inspect ya source guard.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SISF ek engine hai jiski ek binding table hai; FHS features uske clients hain.</li>
<li>Pattern: policy define karo, interface ya VLAN par attach karo; interface policy VLAN policy ko harati hai.</li>
<li><code>ipv6 snooping</code> (purana) aur <code>device-tracking</code> (IOS XE 16.x+) same kaam karte hain.</li>
<li>Security levels: glean (seekho), guard (default, enforce), inspect (enforce plus validate).</li>
<li>Hosts ke liye device-role node, inter-switch links ke liye switch; trusted-port enforcement band karta hai.</li>
</ul></div>
`}};export{e as default};