var e={id:`troubleshooting`,h:{en:`Verification and the troubleshooting workflow (NOC ticket INC-2207)`,hi:`Verification aur troubleshooting workflow (NOC ticket INC-2207)`},body:{en:`
<p>A good courier who cannot deliver a parcel does not guess. He checks the address label, then whether the building exists, then whether the gate is open, then whether the lift goes to that floor. VLAN troubleshooting is the same: follow the frame from the host, through the access port, across every trunk, to the gateway, and check one thing at a time. This chapter gives you the three core commands, a fixed workflow, and then walks through the module's NOC ticket, INC-2207, step by step.</p>

<h3>The three commands and what each proves</h3>
<table class="cmp"><tr><th>Command</th><th>Answers</th><th>Blind spot</th></tr>
<tr><td><code>show vlan brief</code></td><td>Does the VLAN exist and is it active? Which access ports are in it?</td><td>Never shows trunk ports</td></tr>
<tr><td><code>show interfaces trunk</code></td><td>Which ports are trunking, native VLAN, allowed list, allowed and active, forwarding and not pruned</td><td>Shows nothing for a port that is not trunking</td></tr>
<tr><td><code>show interfaces [int] switchport</code></td><td>Administrative vs operational mode, access VLAN, voice VLAN, native VLAN, negotiation, trunking VLANs enabled</td><td>One port at a time</td></tr>
</table>
<p>Useful helpers: <code>show running-config interface g0/1</code> (exact config), <code>show mac address-table vlan 20</code> (is the host being learned, and where), <code>show logging</code> (CDP native mismatch, PVID blocks), <code>show spanning-tree vlan 20</code> (blocked ports) and, on the gateway, <code>show ip interface brief</code> (is the SVI up).</p>

<h3>The workflow: follow the frame</h3>
<ol>
<li><b>Host.</b> Correct IP, mask and gateway for the VLAN's subnet?</li>
<li><b>Access port.</b> Up/up? Static access? In the right VLAN (<code>show vlan brief</code>)? Not inactive because the VLAN was deleted?</li>
<li><b>VLAN exists on every switch in the path</b>, including transit switches with no users in it.</li>
<li><b>Trunk is really trunking</b> on both ends (<code>show interfaces trunk</code>; if missing, check DTP modes and encapsulation).</li>
<li><b>VLAN allowed, active and forwarding</b> on both ends of every trunk (the four blocks).</li>
<li><b>Native VLAN matches</b> (logs, PVID_Inc).</li>
<li><b>Gateway.</b> Is the SVI or router subinterface up, and does it have the right address?</li>
</ol>
<table class="cmp"><tr><th>Symptom</th><th>Most likely cause</th></tr>
<tr><td>Several VLANs die at once after a change; trunk still up</td><td>Allowed list replaced (<code>allowed vlan</code> without <code>add</code>)</td></tr>
<tr><td>VLAN in "allowed" but missing from "allowed and active"</td><td>VLAN not created on this switch</td></tr>
<tr><td>Port missing from <code>show vlan brief</code>, not a trunk</td><td>Its VLAN was deleted: port inactive</td></tr>
<tr><td>New uplink up/up but no trunk</td><td>Both ends dynamic auto</td></tr>
<tr><td>Only the native/management VLAN fails, CDP log every minute</td><td>Native VLAN mismatch</td></tr>
<tr><td>SVI up/down on the core</td><td>No up, forwarding port carries that VLAN</td></tr>
</table>

<h3>Walkthrough: INC-2207</h3>
<p><b>Ticket.</b> P1, opened 10:42. MON-4471 and MON-4472: SRV1 10.20.0.11 and SRV2 10.20.0.12 ICMP down since 10:31. OPS1 (VLAN 10) reports "no network". The cameras (CAM1, VLAN 30) are not online either. Change CHG-5531 at 10:29: "Add camera VLAN 30 to the ACC1 uplink Gi0/1".</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="INC-2207 topology: CORE1 with SVIs, trunk to ACC1, hosts OPS1, SRV1, SRV2, CAM1">
<rect x="240" y="10" width="160" height="54" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">CORE1 (L3 switch)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">Vlan10/20/30 .1</text>
<rect x="240" y="110" width="160" height="46" rx="8" fill="#bae6fd"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">ACC1</text>
<line x1="320" y1="64" x2="320" y2="110" stroke="#64748b" stroke-width="4"/>
<text x="330" y="84" class="svg-accent" font-size="12">Gi0/1 trunk: allowed 30 only!</text>
<rect x="10" y="196" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="216" text-anchor="middle" class="svg-ink" font-size="12">OPS1 VLAN 10</text><text x="80" y="232" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.50</text>
<rect x="170" y="196" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="240" y="216" text-anchor="middle" class="svg-ink" font-size="12">SRV1 VLAN 20</text><text x="240" y="232" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.11</text>
<rect x="330" y="196" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="400" y="216" text-anchor="middle" class="svg-ink" font-size="12">SRV2 VLAN 20</text><text x="400" y="232" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.12</text>
<rect x="490" y="196" width="140" height="44" rx="8" fill="#fed7aa"/><text x="560" y="216" text-anchor="middle" class="svg-ink" font-size="12">CAM1 VLAN 30</text><text x="560" y="232" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.21</text>
<line x1="280" y1="156" x2="80" y2="196" stroke="#64748b" stroke-width="2"/><line x1="300" y1="156" x2="240" y2="196" stroke="#64748b" stroke-width="2"/>
<line x1="340" y1="156" x2="400" y2="196" stroke="#64748b" stroke-width="2"/><line x1="360" y1="156" x2="560" y2="196" stroke="#64748b" stroke-width="2"/>
<text x="120" y="180" class="svg-muted" font-size="12">Gi0/2</text><text x="235" y="180" class="svg-muted" font-size="12">Gi0/5</text><text x="375" y="180" class="svg-muted" font-size="12">Gi0/6</text><text x="480" y="180" class="svg-muted" font-size="12">Gi0/7</text>
</svg><p class="cap">INC-2207. All gateways live on CORE1, so every VLAN must cross the single trunk to ACC1.</p></div>

<p><b>Step 1: correlate.</b> Alerts started at 10:31, two minutes after a change on ACC1's uplink. Start there. Every host is on ACC1 and every gateway is on CORE1, so the trunk between them is the only path.</p>
<p><b>Step 2: triage on ACC1.</b></p>
<pre class="out">ACC1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      1

Port        Vlans allowed on trunk
<span class="hl">Gi0/1       30</span>

Port        Vlans allowed and active in management domain
Gi0/1       30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       30

ACC1# show running-config interface GigabitEthernet0/1
interface GigabitEthernet0/1
 description UPLINK-CORE1
<span class="hl"> switchport trunk allowed vlan 30</span>
 switchport mode trunk
end</pre>
<p>The trunk is up and trunking, so interface monitoring saw nothing. But the allowed list is only 30: the night shift typed the list without <code>add</code>. VLANs 10 and 20 no longer cross, which explains OPS1 and both servers.</p>
<p><b>Step 3: why are the cameras still down?</b> Check the other end:</p>
<pre class="out">CORE1# show interfaces trunk | begin allowed on
Port        Vlans allowed on trunk
<span class="hl">Gi0/1       10,20</span>

CORE1# show ip interface brief | include Vlan
Vlan10                 10.10.0.1       YES manual up                    up
Vlan20                 10.20.0.1       YES manual up                    up
<span class="hl">Vlan30                 10.30.0.1       YES manual up                    down</span></pre>
<p>CORE1 never received VLAN 30 on its side, so no up port carries VLAN 30 and the Vlan30 SVI stays up/down (an SVI comes up only when at least one port in its VLAN is up and forwarding). Notice the trap: Vlan10 and Vlan20 look perfect on CORE1, because CORE1's side of the trunk still allows them. The core looks healthy while the access side is broken.</p>
<p><b>Step 4: restore and complete the change.</b></p>
<pre class="code"><span class="c">! ACC1: restore the full list (a replacement is correct here)</span>
ACC1(config)# interface GigabitEthernet0/1
ACC1(config-if)# switchport trunk allowed vlan 10,20,30
<span class="c">! CORE1: this time, append</span>
CORE1(config)# interface GigabitEthernet0/1
CORE1(config-if)# switchport trunk allowed vlan add 30</pre>
<p><b>Step 5: verify like the monitoring does.</b> From OPS1 ping 10.20.0.11 and 10.20.0.12 (routed through CORE1), and from CAM1 ping its gateway 10.30.0.1. <code>show ip interface brief</code> on CORE1 now shows Vlan30 up/up, and both trunks list 10,20,30 in every block.</p>
<p><b>Step 6: save and close.</b> <code>write memory</code> on ACC1 and CORE1. In the ticket, record root cause ("allowed list replaced instead of appended during CHG-5531"), impact, fix and prevention: peer review of trunk changes, always <code>show run int</code> before and <code>show interfaces trunk</code> after, and use <code>add</code>/<code>remove</code> only.</p>

<div class="warn"><p><b>Common mistakes.</b> Checking only the switch where users complain and not the far end of the trunk; trusting "up/up" as proof a VLAN crosses; fixing ACC1 and closing the ticket while the cameras are still down; and not saving, so the outage returns after the next reload.</p></div>

<div class="exam"><p><b>Exam trap.</b> Given a <code>show interfaces trunk</code> output, identify which VLANs really cross: only those in the last block on <b>both</b> switches. And an SVI that is up/down means no active port in that VLAN, not a wrong IP address.</p></div>

<div class="scn"><h4>Everything is green, the printer is still gone</h4><p>After moving the design team to new VLAN 40 (10.40.0.0/24), one plotter stayed unreachable. The engineer followed the workflow: the port was static access in VLAN 40, VLAN 40 was active on all switches, allowed and forwarding on every trunk, and the Vlan40 SVI was up. <code>show mac address-table vlan 40</code> showed the plotter's MAC on the correct port, so Layer 2 was fine. But <code>show ip arp vlan 40</code> on the core had no entry for it. The plotter still had a static address from the old subnet, 10.12.0.50, so it never answered ARP for the new range. A DHCP reservation in the new scope fixed it.</p><p><b>Lesson:</b> the workflow starts and ends at the host. When Layer 2 checks are all clean, look at addressing.</p></div>

<div class="iv"><p class="q">"Users in one VLAN on an access switch suddenly lose connectivity after a change. How do you troubleshoot?"</p><p>Strong answer: correlate with the change record, then follow the frame: host addressing, access port VLAN with <code>show vlan brief</code>, VLAN existence on every switch, <code>show interfaces trunk</code> on both ends checking the allowed, active and forwarding blocks, native VLAN, and finally the gateway SVI with <code>show ip interface brief</code>. Name the classic cause: an allowed list replaced without <code>add</code>, invisible to interface monitoring because the trunk stays up. Close with verification, save and a prevention note.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three core commands: <code>show vlan brief</code>, <code>show interfaces trunk</code>, <code>show interfaces switchport</code>.</li>
<li>Follow the frame: host, access port, VLAN existence, trunking, allowed/active/forwarding, native VLAN, gateway.</li>
<li>Always check both ends of every trunk; the healthy-looking side can hide the fault.</li>
<li>An SVI is up only while an up, forwarding port carries its VLAN.</li>
<li>INC-2207: restore the list on ACC1, add VLAN 30 on CORE1, verify with pings, save both switches.</li>
</ul></div>
`,hi:`
<p>Ek achha courier jo parcel deliver nahi kar paata, andaaza nahi lagata. Woh address label check karta hai, phir building exist karti hai ya nahi, phir gate khula hai ya nahi, phir lift us floor tak jaati hai ya nahi. VLAN troubleshooting bhi aisi hi hai: frame ko host se, access port se, har trunk ke across, gateway tak follow karo, aur ek samay mein ek cheez check karo. Yeh chapter aapko teen core commands, ek fixed workflow deta hai, aur phir module ke NOC ticket, INC-2207, ko step by step walk karta hai.</p>

<h3>Teen commands aur har ek kya prove karti hai</h3>
<table class="cmp"><tr><th>Command</th><th>Jawab deti hai</th><th>Blind spot</th></tr>
<tr><td><code>show vlan brief</code></td><td>Kya VLAN exist karta hai aur active hai? Usme kaunse access ports hain?</td><td>Trunk ports kabhi nahi dikhati</td></tr>
<tr><td><code>show interfaces trunk</code></td><td>Kaunse ports trunking kar rahe hain, native VLAN, allowed list, allowed and active, forwarding and not pruned</td><td>Jo port trunking nahi kar raha uske liye kuch nahi dikhati</td></tr>
<tr><td><code>show interfaces [int] switchport</code></td><td>Administrative vs operational mode, access VLAN, voice VLAN, native VLAN, negotiation, trunking VLANs enabled</td><td>Ek samay mein ek port</td></tr>
</table>
<p>Kaam ke helpers: <code>show running-config interface g0/1</code> (exact config), <code>show mac address-table vlan 20</code> (host learn ho raha hai ya nahi, aur kahan), <code>show logging</code> (CDP native mismatch, PVID blocks), <code>show spanning-tree vlan 20</code> (blocked ports) aur gateway par <code>show ip interface brief</code> (SVI up hai ya nahi).</p>

<h3>Workflow: frame ko follow karo</h3>
<ol>
<li><b>Host.</b> VLAN ke subnet ke liye sahi IP, mask aur gateway?</li>
<li><b>Access port.</b> Up/up? Static access? Sahi VLAN mein (<code>show vlan brief</code>)? VLAN delete hone ki wajah se inactive to nahi?</li>
<li><b>Path ke har switch par VLAN exist karta hai</b>, un transit switches par bhi jinme uske users nahi hain.</li>
<li><b>Trunk sach mein trunking kar raha hai</b> dono ends par (<code>show interfaces trunk</code>; agar missing hai to DTP modes aur encapsulation check karo).</li>
<li>Har trunk ke dono ends par <b>VLAN allowed, active aur forwarding</b> hai (chaar blocks).</li>
<li><b>Native VLAN match karta hai</b> (logs, PVID_Inc).</li>
<li><b>Gateway.</b> SVI ya router subinterface up hai, aur uska address sahi hai?</li>
</ol>
<table class="cmp"><tr><th>Symptom</th><th>Sabse likely cause</th></tr>
<tr><td>Change ke baad kai VLANs ek saath band; trunk abhi bhi up</td><td>Allowed list replace ho gayi (<code>add</code> ke bina <code>allowed vlan</code>)</td></tr>
<tr><td>VLAN "allowed" mein hai par "allowed and active" se gayab</td><td>VLAN is switch par bana hi nahi</td></tr>
<tr><td>Port <code>show vlan brief</code> se gayab, trunk bhi nahi</td><td>Uska VLAN delete hua: port inactive</td></tr>
<tr><td>Naya uplink up/up par trunk nahi</td><td>Dono ends dynamic auto</td></tr>
<tr><td>Sirf native/management VLAN fail, har minute CDP log</td><td>Native VLAN mismatch</td></tr>
<tr><td>Core par SVI up/down</td><td>Koi up, forwarding port us VLAN ko carry nahi karta</td></tr>
</table>

<h3>Walkthrough: INC-2207</h3>
<p><b>Ticket.</b> P1, 10:42 par khula. MON-4471 aur MON-4472: SRV1 10.20.0.11 aur SRV2 10.20.0.12 ICMP 10:31 se down. OPS1 (VLAN 10) "network nahi hai" report karta hai. Cameras (CAM1, VLAN 30) bhi online nahi hain. Change CHG-5531, 10:29 par: "ACC1 uplink Gi0/1 par camera VLAN 30 add karo".</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="INC-2207 topology: SVIs wala CORE1, ACC1 tak trunk, hosts OPS1, SRV1, SRV2, CAM1">
<rect x="240" y="10" width="160" height="54" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">CORE1 (L3 switch)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">Vlan10/20/30 .1</text>
<rect x="240" y="110" width="160" height="46" rx="8" fill="#bae6fd"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">ACC1</text>
<line x1="320" y1="64" x2="320" y2="110" stroke="#64748b" stroke-width="4"/>
<text x="330" y="84" class="svg-accent" font-size="12">Gi0/1 trunk: sirf 30 allowed!</text>
<rect x="10" y="196" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="216" text-anchor="middle" class="svg-ink" font-size="12">OPS1 VLAN 10</text><text x="80" y="232" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.50</text>
<rect x="170" y="196" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="240" y="216" text-anchor="middle" class="svg-ink" font-size="12">SRV1 VLAN 20</text><text x="240" y="232" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.11</text>
<rect x="330" y="196" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="400" y="216" text-anchor="middle" class="svg-ink" font-size="12">SRV2 VLAN 20</text><text x="400" y="232" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.12</text>
<rect x="490" y="196" width="140" height="44" rx="8" fill="#fed7aa"/><text x="560" y="216" text-anchor="middle" class="svg-ink" font-size="12">CAM1 VLAN 30</text><text x="560" y="232" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.21</text>
<line x1="280" y1="156" x2="80" y2="196" stroke="#64748b" stroke-width="2"/><line x1="300" y1="156" x2="240" y2="196" stroke="#64748b" stroke-width="2"/>
<line x1="340" y1="156" x2="400" y2="196" stroke="#64748b" stroke-width="2"/><line x1="360" y1="156" x2="560" y2="196" stroke="#64748b" stroke-width="2"/>
<text x="120" y="180" class="svg-muted" font-size="12">Gi0/2</text><text x="235" y="180" class="svg-muted" font-size="12">Gi0/5</text><text x="375" y="180" class="svg-muted" font-size="12">Gi0/6</text><text x="480" y="180" class="svg-muted" font-size="12">Gi0/7</text>
</svg><p class="cap">INC-2207. Saare gateways CORE1 par hain, isliye har VLAN ko ACC1 tak ke ek hi trunk ko cross karna hai.</p></div>

<p><b>Step 1: correlate karo.</b> Alerts 10:31 par shuru hue, ACC1 ke uplink par change ke do minute baad. Wahin se shuru karo. Har host ACC1 par hai aur har gateway CORE1 par, isliye unke beech ka trunk hi akela path hai.</p>
<p><b>Step 2: ACC1 par triage.</b></p>
<pre class="out">ACC1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      1

Port        Vlans allowed on trunk
<span class="hl">Gi0/1       30</span>

Port        Vlans allowed and active in management domain
Gi0/1       30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       30

ACC1# show running-config interface GigabitEthernet0/1
interface GigabitEthernet0/1
 description UPLINK-CORE1
<span class="hl"> switchport trunk allowed vlan 30</span>
 switchport mode trunk
end</pre>
<p>Trunk up hai aur trunking kar raha hai, isliye interface monitoring ko kuch nahi dikha. Par allowed list sirf 30 hai: night shift ne <code>add</code> ke bina list type kar di. VLANs 10 aur 20 ab cross nahi karte, jo OPS1 aur dono servers ko explain karta hai.</p>
<p><b>Step 3: cameras abhi bhi down kyun hain?</b> Doosra end check karo:</p>
<pre class="out">CORE1# show interfaces trunk | begin allowed on
Port        Vlans allowed on trunk
<span class="hl">Gi0/1       10,20</span>

CORE1# show ip interface brief | include Vlan
Vlan10                 10.10.0.1       YES manual up                    up
Vlan20                 10.20.0.1       YES manual up                    up
<span class="hl">Vlan30                 10.30.0.1       YES manual up                    down</span></pre>
<p>CORE1 ko apni side par kabhi VLAN 30 mila hi nahi, isliye koi up port VLAN 30 carry nahi karta aur Vlan30 SVI up/down rehta hai (SVI tabhi up hota hai jab uske VLAN ka kam se kam ek port up aur forwarding ho). Trap dekho: CORE1 par Vlan10 aur Vlan20 perfect dikhte hain, kyunki trunk ki CORE1 side unhe abhi bhi allow karti hai. Core healthy dikhta hai jabki access side tooti hai.</p>
<p><b>Step 4: restore karo aur change complete karo.</b></p>
<pre class="code"><span class="c">! ACC1: poori list restore karo (yahan replacement sahi hai)</span>
ACC1(config)# interface GigabitEthernet0/1
ACC1(config-if)# switchport trunk allowed vlan 10,20,30
<span class="c">! CORE1: is baar append karo</span>
CORE1(config)# interface GigabitEthernet0/1
CORE1(config-if)# switchport trunk allowed vlan add 30</pre>
<p><b>Step 5: monitoring ki tarah verify karo.</b> OPS1 se 10.20.0.11 aur 10.20.0.12 ping karo (CORE1 se routed), aur CAM1 se uska gateway 10.30.0.1 ping karo. CORE1 par <code>show ip interface brief</code> ab Vlan30 up/up dikhata hai, aur dono trunks har block mein 10,20,30 list karte hain.</p>
<p><b>Step 6: save karo aur close karo.</b> ACC1 aur CORE1 par <code>write memory</code>. Ticket mein root cause ("CHG-5531 ke dauran allowed list append hone ki jagah replace ho gayi"), impact, fix aur prevention likho: trunk changes ka peer review, hamesha pehle <code>show run int</code> aur baad mein <code>show interfaces trunk</code>, aur sirf <code>add</code>/<code>remove</code> use karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Sirf us switch ko check karna jahan users complain kar rahe hain aur trunk ka far end nahi; "up/up" ko is baat ka proof maanna ki VLAN cross karta hai; ACC1 fix karke ticket close kar dena jabki cameras abhi bhi down hain; aur save na karna, jisse agle reload ke baad outage wapas aa jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show interfaces trunk</code> output diya ho to pehchano ki asal mein kaunse VLANs cross karte hain: sirf woh jo <b>dono</b> switches par last block mein hain. Aur up/down SVI ka matlab hai us VLAN mein koi active port nahi, galat IP address nahi.</p></div>

<div class="scn"><h4>Sab green hai, printer phir bhi gayab</h4><p>Design team ko naye VLAN 40 (10.40.0.0/24) mein move karne ke baad ek plotter unreachable raha. Engineer ne workflow follow kiya: port VLAN 40 mein static access tha, VLAN 40 saare switches par active tha, har trunk par allowed aur forwarding tha, aur Vlan40 SVI up tha. <code>show mac address-table vlan 40</code> ne plotter ka MAC sahi port par dikhaya, yaani Layer 2 theek tha. Par core par <code>show ip arp vlan 40</code> mein uski koi entry nahi thi. Plotter ke paas abhi bhi purane subnet ka static address, 10.12.0.50, tha, isliye woh naye range ke ARP ka kabhi jawab nahi deta tha. Naye scope mein DHCP reservation se fix ho gaya.</p><p><b>Seekh:</b> workflow host par shuru aur host par hi khatam hota hai. Jab saare Layer 2 checks saaf hon, addressing dekho.</p></div>

<div class="iv"><p class="q">"Change ke baad ek access switch par ek VLAN ke users ki connectivity achanak chali jaati hai. Aap kaise troubleshoot karoge?"</p><p>Strong answer: change record se correlate karo, phir frame follow karo: host addressing, <code>show vlan brief</code> se access port ka VLAN, har switch par VLAN ka existence, dono ends par <code>show interfaces trunk</code> jisme allowed, active aur forwarding blocks check karo, native VLAN, aur end mein <code>show ip interface brief</code> se gateway SVI. Classic cause ka naam lo: <code>add</code> ke bina replace hui allowed list, jo interface monitoring ko nahi dikhti kyunki trunk up rehta hai. Verification, save aur prevention note ke saath close karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen core commands: <code>show vlan brief</code>, <code>show interfaces trunk</code>, <code>show interfaces switchport</code>.</li>
<li>Frame follow karo: host, access port, VLAN existence, trunking, allowed/active/forwarding, native VLAN, gateway.</li>
<li>Har trunk ke dono ends hamesha check karo; healthy dikhne wali side fault chhupa sakti hai.</li>
<li>SVI tabhi up hai jab koi up, forwarding port uska VLAN carry kare.</li>
<li>INC-2207: ACC1 par list restore karo, CORE1 par VLAN 30 add karo, pings se verify karo, dono switches save karo.</li>
</ul></div>
`}};export{e as default};