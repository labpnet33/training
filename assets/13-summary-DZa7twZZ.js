var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Go back to the reception desk from chapter 1. At the start of this module it believed everyone. Now it checks badges (port security), knows who the real caterer is (DHCP snooping), compares faces with the staff list (DAI and IP Source Guard), refuses anyone claiming to be the building manager (BPDU and root guard), keeps side doors locked (trunk hardening), limits how many people can crowd the lobby (storm-control) and puts guests in separate rooms on one corridor (private VLANs). This chapter is your revision sheet: what you must be able to do, the vocabulary, the defaults and traps examiners love, and a command cheat-sheet.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain, at recognition level, MAC flooding, MAC spoofing, rogue DHCP, DHCP starvation, ARP spoofing, IP spoofing, VLAN hopping (switch spoofing and double tagging), STP root takeover and broadcast storms.</li>
<li>Build the hardened edge-port baseline: access mode, nonegotiate, PortFast, BPDU guard, port security, storm-control, untrusted for snooping and DAI.</li>
<li>Configure port security with sticky MACs, a maximum and the right violation mode, and recover err-disabled ports (Lab 1).</li>
<li>Configure DHCP snooping with only the server uplink trusted, read the binding table, then add DAI (Lab 2).</li>
<li>Harden trunks (nonegotiate, unused native VLAN, <code>vlan dot1q tag native</code>) and place BPDU guard and root guard correctly (Lab 3).</li>
<li>Configure storm-control and IP Source Guard and read their outputs (Lab 4).</li>
<li>Troubleshoot controls that block legitimate traffic without disabling them (Lab 5).</li>
<li>Explain private VLANs and place each control in the data, control or management plane.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DHCP snooping feeds DAI and IP Source Guard">
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">DHCP snooping</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">binding table</text>
<rect x="60" y="140" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="140" y="162" text-anchor="middle" class="svg-ink" font-size="14">DAI</text><text x="140" y="180" text-anchor="middle" class="svg-muted" font-size="12">checks ARP, per VLAN</text>
<rect x="240" y="140" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="14">IP Source Guard</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">checks IP, per port</text>
<rect x="420" y="140" width="160" height="50" rx="8" fill="#fde68a"/><text x="500" y="162" text-anchor="middle" class="svg-ink" font-size="14">Static bindings</text><text x="500" y="180" text-anchor="middle" class="svg-muted" font-size="12">for static hosts</text>
<line x1="290" y1="70" x2="150" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="420" y1="165" x2="400" y2="165" stroke="#64748b" stroke-width="2"/><line x1="440" y1="140" x2="380" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">The dependency most tested: snooping (plus static bindings) feeds both DAI and IP Source Guard.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CAM table</dt><dd>The switch's MAC address table: which MAC lives on which port and VLAN.</dd>
<dt>Err-disabled</dt><dd>A port shut down by a protection feature; the reason is shown in <code>show interfaces status err-disabled</code>.</dd>
<dt>Sticky MAC</dt><dd>A dynamically learned secure MAC written into the running configuration.</dd>
<dt>Binding table</dt><dd>DHCP snooping's record of MAC, IP, VLAN, port and lease for each client.</dd>
<dt>Trusted port</dt><dd>A port toward real infrastructure where snooping or DAI does not filter.</dd>
<dt>Native VLAN</dt><dd>The VLAN sent untagged on an 802.1Q trunk; VLAN 1 by default.</dd>
<dt>Root-inconsistent</dt><dd>The blocking state root guard puts a port into when a superior BPDU arrives.</dd>
<dt>Promiscuous port</dt><dd>A private VLAN port that talks to every host in the primary and its secondaries.</dd>
<dt>CoPP</dt><dd>Control Plane Policing: rate-limits traffic sent to the device CPU.</dd>
</dl>

<h3>Defaults and most-tested facts</h3>
<table class="cmp"><tr><th>Feature</th><th>Fact to remember</th></tr>
<tr><td>Port security</td><td>Off by default; when enabled: maximum 1, violation <b>shutdown</b>, aging off. Needs a static access or trunk port.</td></tr>
<tr><td>Violation modes</td><td>protect = drop silently; restrict = drop + log + counter; shutdown = err-disable.</td></tr>
<tr><td>DHCP snooping</td><td>Off by default; needs global and per-VLAN commands; all ports untrusted once enabled. Drops OFFER/ACK on untrusted ports.</td></tr>
<tr><td>DAI</td><td>Per VLAN; untrusted ports rate-limited to 15 pps by default; uses snooping bindings or ARP ACLs.</td></tr>
<tr><td>IP Source Guard</td><td>Per interface; <code>ip verify source</code> checks IP, <code>port-security</code> option adds MAC; deny-all until a binding exists.</td></tr>
<tr><td>BPDU guard</td><td>Any BPDU err-disables the port; global form <code>spanning-tree portfast bpduguard default</code> applies to PortFast ports.</td></tr>
<tr><td>Root guard</td><td>Superior BPDU = root-inconsistent (blocking), recovers automatically when BPDUs stop.</td></tr>
<tr><td>Storm-control</td><td>Default action drops excess for the interval; <code>action shutdown</code> err-disables; <code>trap</code> sends an SNMP trap.</td></tr>
<tr><td>VLAN hopping</td><td>Switch spoofing needs DTP; double tagging needs the attacker in the trunk's native VLAN and is one-way.</td></tr>
<tr><td>Private VLANs</td><td>Isolated talks to promiscuous only; community talks to its community and promiscuous; one isolated VLAN per primary.</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! edge port baseline</span>
switchport mode access
switchport nonegotiate
spanning-tree portfast
spanning-tree bpduguard enable
switchport port-security
switchport port-security maximum 2
switchport port-security mac-address sticky
switchport port-security violation restrict
storm-control broadcast level 1.00
storm-control action shutdown
ip verify source
<span class="c">! global</span>
ip dhcp snooping
ip dhcp snooping vlan 10
ip arp inspection vlan 10
ip source binding 0050.5555.5050 vlan 10 10.0.10.50 interface g0/2
errdisable recovery cause psecure-violation
errdisable recovery interval 30
vlan dot1q tag native
<span class="c">! uplink / trunk</span>
ip dhcp snooping trust
ip arp inspection trust
switchport trunk native vlan 999
spanning-tree guard root</pre>
<pre class="out"><span class="hl">show port-security interface g0/2</span>        violation count, port status
<span class="hl">show ip dhcp snooping [binding]</span>          trusted ports, leases
<span class="hl">show ip arp inspection [interfaces]</span>      drops, trust state
<span class="hl">show ip verify source</span>                    per-port IPSG filter
<span class="hl">show interfaces status err-disabled</span>      reason per port
<span class="hl">show spanning-tree inconsistentports</span>     root guard blocks
<span class="hl">show storm-control</span>                       filter state
<span class="hl">show vlan private-vlan</span>                   PVLAN mapping</pre>

<div class="eg"><p><b>Worked example: pick the control.</b> Symptom "one port has 8,000 MACs" → port security. "Clients get gateway 10.0.10.66" → DHCP snooping. "Gateway MAC changed in every ARP cache" → DAI. "Packets from an IP never leased on that port" → IP Source Guard. "Root bridge moved to a desk" → BPDU guard / root guard. "Links at 100% broadcast" → storm-control. "Hosts in one subnet must not talk" → private VLANs.</p></div>

<div class="warn"><p><b>Common mistakes to avoid in the exam and in production.</b> Forgetting the trusted uplink; enabling DAI or IPSG without snooping or static bindings; using protect mode when you need evidence; BPDU filter instead of BPDU guard on edge ports; leaving VLAN 1 as native VLAN with users in it.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Default violation mode is shutdown. Root guard does not err-disable. DAI and IPSG need the snooping table. Double tagging only works from the native VLAN. <code>no shutdown</code> alone does not clear a sticky MAC that still causes the violation.</p></div>

<div class="scn"><h4>The audit that took ten minutes</h4><p>An auditor asked a network team to prove that user ports could not host a rogue DHCP server, poison ARP or become a trunk. The engineer ran <code>show ip dhcp snooping</code> (only the uplink trusted), <code>show ip arp inspection</code> (enabled on all user VLANs with drop counters), <code>show interfaces switchport</code> filtered for "Negotiation of Trunking: Off" on edge ports and <code>show running-config | include bpduguard</code>. Every claim was backed by output from the device, and the audit closed the same day.</p><p><b>Lesson:</b> know the verification command for every control; evidence is what makes security real to auditors and interviewers.</p></div>

<div class="iv"><p class="q">"Give me a one-minute overview of Layer 2 security."</p><p>Strong answer: switches trust what they hear, so each attack abuses one trust. Port security limits MACs against flooding; DHCP snooping trusts only the server uplink and builds bindings; DAI and IP Source Guard use those bindings to stop ARP and IP spoofing; nonegotiate, an unused tagged native VLAN and access mode stop VLAN hopping; BPDU guard and root guard protect STP; storm-control limits floods; private VLANs isolate hosts in one subnet. Close with verification and the troubleshooting rule: fix trust and bindings, never disable the control.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One principle: edge ports expect end-host behaviour; only infrastructure uplinks are trusted.</li>
<li>Know each attack, the trust it abuses, what the defender sees and the control that stops it.</li>
<li>Memorise defaults: port security max 1 / shutdown, DAI 15 pps, native VLAN 1, root guard = root-inconsistent.</li>
<li>DHCP snooping bindings (and static bindings) feed DAI and IP Source Guard.</li>
<li>Every control has a show command; verification and correct trust are part of the configuration.</li>
</ul></div>
`,hi:`
<p>Chapter 1 ke reception desk par wapas chalo. Is module ki shuruaat mein woh sab par bharosa karta tha. Ab woh badges check karta hai (port security), jaanta hai ki asli caterer kaun hai (DHCP snooping), chehron ko staff list se milaata hai (DAI aur IP Source Guard), jo bhi khud ko building manager bataye use mana karta hai (BPDU aur root guard), side doors band rakhta hai (trunk hardening), lobby mein kitne log bheed laga sakte hain uski limit rakhta hai (storm-control) aur guests ko ek corridor par alag-alag rooms mein rakhta hai (private VLANs). Yeh chapter aapki revision sheet hai: aapko kya karna aana chahiye, vocabulary, defaults aur woh traps jo examiners ko pasand hain, aur ek command cheat-sheet.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Recognition level par samjhao: MAC flooding, MAC spoofing, rogue DHCP, DHCP starvation, ARP spoofing, IP spoofing, VLAN hopping (switch spoofing aur double tagging), STP root takeover aur broadcast storms.</li>
<li>Hardened edge-port baseline banao: access mode, nonegotiate, PortFast, BPDU guard, port security, storm-control, snooping aur DAI ke liye untrusted.</li>
<li>Sticky MACs, maximum aur sahi violation mode ke saath port security configure karo, aur err-disabled ports recover karo (Lab 1).</li>
<li>Sirf server uplink trusted rakhte hue DHCP snooping configure karo, binding table padho, phir DAI jodo (Lab 2).</li>
<li>Trunks harden karo (nonegotiate, unused native VLAN, <code>vlan dot1q tag native</code>) aur BPDU guard aur root guard sahi jagah lagao (Lab 3).</li>
<li>Storm-control aur IP Source Guard configure karo aur unke outputs padho (Lab 4).</li>
<li>Legitimate traffic block karne wale controls ko bina disable kiye troubleshoot karo (Lab 5).</li>
<li>Private VLANs samjhao aur har control ko data, control ya management plane mein rakho.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DHCP snooping DAI aur IP Source Guard ko feed karta hai">
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">DHCP snooping</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">binding table</text>
<rect x="60" y="140" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="140" y="162" text-anchor="middle" class="svg-ink" font-size="14">DAI</text><text x="140" y="180" text-anchor="middle" class="svg-muted" font-size="12">ARP check, per VLAN</text>
<rect x="240" y="140" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="14">IP Source Guard</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">IP check, per port</text>
<rect x="420" y="140" width="160" height="50" rx="8" fill="#fde68a"/><text x="500" y="162" text-anchor="middle" class="svg-ink" font-size="14">Static bindings</text><text x="500" y="180" text-anchor="middle" class="svg-muted" font-size="12">static hosts ke liye</text>
<line x1="290" y1="70" x2="150" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="420" y1="165" x2="400" y2="165" stroke="#64748b" stroke-width="2"/><line x1="440" y1="140" x2="380" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Sabse zyada test hone wali dependency: snooping (plus static bindings) DAI aur IP Source Guard dono ko feed karta hai.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CAM table</dt><dd>Switch ki MAC address table: kaunsa MAC kaunse port aur VLAN par hai.</dd>
<dt>Err-disabled</dt><dd>Protection feature dwara band kiya gaya port; reason <code>show interfaces status err-disabled</code> mein dikhta hai.</dd>
<dt>Sticky MAC</dt><dd>Dynamically seekha gaya secure MAC jo running configuration mein likh diya jaata hai.</dd>
<dt>Binding table</dt><dd>DHCP snooping ka har client ke liye MAC, IP, VLAN, port aur lease ka record.</dd>
<dt>Trusted port</dt><dd>Asli infrastructure ki taraf ka port jahan snooping ya DAI filter nahi karte.</dd>
<dt>Native VLAN</dt><dd>802.1Q trunk par untagged bheja jaane wala VLAN; default mein VLAN 1.</dd>
<dt>Root-inconsistent</dt><dd>Woh blocking state jisme root guard port ko daalta hai jab superior BPDU aata hai.</dd>
<dt>Promiscuous port</dt><dd>Private VLAN ka port jo primary aur uske secondaries ke har host se baat karta hai.</dd>
<dt>CoPP</dt><dd>Control Plane Policing: device CPU ko bheje jaane wale traffic ko rate-limit karta hai.</dd>
</dl>

<h3>Defaults aur sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Feature</th><th>Yaad rakhne wala fact</th></tr>
<tr><td>Port security</td><td>Default mein off; enable hone par: maximum 1, violation <b>shutdown</b>, aging off. Static access ya trunk port chahiye.</td></tr>
<tr><td>Violation modes</td><td>protect = chupchaap drop; restrict = drop + log + counter; shutdown = err-disable.</td></tr>
<tr><td>DHCP snooping</td><td>Default mein off; global aur per-VLAN commands chahiye; enable hone ke baad saare ports untrusted. Untrusted ports par OFFER/ACK drop.</td></tr>
<tr><td>DAI</td><td>Per VLAN; untrusted ports default mein 15 pps par rate-limited; snooping bindings ya ARP ACLs use karta hai.</td></tr>
<tr><td>IP Source Guard</td><td>Per interface; <code>ip verify source</code> IP check karta hai, <code>port-security</code> option MAC jodta hai; binding banne tak deny-all.</td></tr>
<tr><td>BPDU guard</td><td>Koi bhi BPDU port ko err-disable karta hai; global form <code>spanning-tree portfast bpduguard default</code> PortFast ports par lagta hai.</td></tr>
<tr><td>Root guard</td><td>Superior BPDU = root-inconsistent (blocking), BPDUs rukne par apne aap recover.</td></tr>
<tr><td>Storm-control</td><td>Default action interval ke liye extra traffic drop karta hai; <code>action shutdown</code> err-disable karta hai; <code>trap</code> SNMP trap bhejta hai.</td></tr>
<tr><td>VLAN hopping</td><td>Switch spoofing ke liye DTP chahiye; double tagging ke liye attacker ka trunk ke native VLAN mein hona zaroori hai aur yeh one-way hai.</td></tr>
<tr><td>Private VLANs</td><td>Isolated sirf promiscuous se baat karta hai; community apni community aur promiscuous se; har primary ke liye ek isolated VLAN.</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! edge port baseline</span>
switchport mode access
switchport nonegotiate
spanning-tree portfast
spanning-tree bpduguard enable
switchport port-security
switchport port-security maximum 2
switchport port-security mac-address sticky
switchport port-security violation restrict
storm-control broadcast level 1.00
storm-control action shutdown
ip verify source
<span class="c">! global</span>
ip dhcp snooping
ip dhcp snooping vlan 10
ip arp inspection vlan 10
ip source binding 0050.5555.5050 vlan 10 10.0.10.50 interface g0/2
errdisable recovery cause psecure-violation
errdisable recovery interval 30
vlan dot1q tag native
<span class="c">! uplink / trunk</span>
ip dhcp snooping trust
ip arp inspection trust
switchport trunk native vlan 999
spanning-tree guard root</pre>
<pre class="out"><span class="hl">show port-security interface g0/2</span>        violation count, port status
<span class="hl">show ip dhcp snooping [binding]</span>          trusted ports, leases
<span class="hl">show ip arp inspection [interfaces]</span>      drops, trust state
<span class="hl">show ip verify source</span>                    per-port IPSG filter
<span class="hl">show interfaces status err-disabled</span>      har port ka reason
<span class="hl">show spanning-tree inconsistentports</span>     root guard blocks
<span class="hl">show storm-control</span>                       filter state
<span class="hl">show vlan private-vlan</span>                   PVLAN mapping</pre>

<div class="eg"><p><b>Worked example: sahi control chuno.</b> Symptom "ek port par 8,000 MACs" → port security. "Clients ko gateway 10.0.10.66 mil raha hai" → DHCP snooping. "Har ARP cache mein gateway ka MAC badal gaya" → DAI. "Us port par kabhi lease na hue IP se packets" → IP Source Guard. "Root bridge ek desk par chala gaya" → BPDU guard / root guard. "Links 100% broadcast par" → storm-control. "Ek subnet ke hosts aapas mein baat na karein" → private VLANs.</p></div>

<div class="warn"><p><b>Exam aur production mein bachne wali common galtiyan.</b> Trusted uplink bhool jaana; bina snooping ya static bindings ke DAI ya IPSG enable karna; jab evidence chahiye tab protect mode use karna; edge ports par BPDU guard ki jagah BPDU filter; users wale VLAN 1 ko native VLAN chhod dena.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Default violation mode shutdown hai. Root guard err-disable nahi karta. DAI aur IPSG ko snooping table chahiye. Double tagging sirf native VLAN se kaam karta hai. Sirf <code>no shutdown</code> us sticky MAC ko clear nahi karta jo abhi bhi violation ka kaaran hai.</p></div>

<div class="scn"><h4>Das minute ka audit</h4><p>Ek auditor ne network team se prove karne ko kaha ki user ports rogue DHCP server host nahi kar sakte, ARP poison nahi kar sakte aur trunk nahi ban sakte. Engineer ne <code>show ip dhcp snooping</code> (sirf uplink trusted), <code>show ip arp inspection</code> (saare user VLANs par drop counters ke saath enabled), edge ports par "Negotiation of Trunking: Off" ke liye filter karke <code>show interfaces switchport</code> aur <code>show running-config | include bpduguard</code> chalaaye. Har claim device ke output se backed tha, aur audit usi din band ho gaya.</p><p><b>Seekh:</b> har control ki verification command jaano; evidence hi security ko auditors aur interviewers ke liye asli banata hai.</p></div>

<div class="iv"><p class="q">"Mujhe Layer 2 security ka ek minute ka overview do."</p><p>Strong answer: switches jo sunte hain use trust karte hain, isliye har attack ek trust ka fayda uthata hai. Port security flooding ke khilaaf MACs limit karta hai; DHCP snooping sirf server uplink trust karta hai aur bindings banata hai; DAI aur IP Source Guard un bindings se ARP aur IP spoofing rokte hain; nonegotiate, ek unused tagged native VLAN aur access mode VLAN hopping rokte hain; BPDU guard aur root guard STP ko protect karte hain; storm-control floods limit karta hai; private VLANs ek subnet ke hosts ko isolate karte hain. Verification aur troubleshooting rule ke saath khatam karo: trust aur bindings fix karo, control kabhi disable mat karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek principle: edge ports end-host behaviour expect karte hain; sirf infrastructure uplinks trusted hain.</li>
<li>Har attack, jis trust ka woh fayda uthata hai, defender ko kya dikhta hai aur use rokne wala control jaano.</li>
<li>Defaults yaad karo: port security max 1 / shutdown, DAI 15 pps, native VLAN 1, root guard = root-inconsistent.</li>
<li>DHCP snooping bindings (aur static bindings) DAI aur IP Source Guard ko feed karti hain.</li>
<li>Har control ki ek show command hai; verification aur sahi trust configuration ka hissa hain.</li>
</ul></div>
`}};export{e as default};