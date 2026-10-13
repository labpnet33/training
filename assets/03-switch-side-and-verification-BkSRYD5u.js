var e={id:`switch-side-and-verification`,h:{en:`The switch side and verifying the trunk`,hi:`Switch side aur trunk verify karna`},body:{en:`
<p>A VLAN interface on the FortiGate is only half of a working design. The switch must <b>tag</b> the VLANs toward the firewall on a trunk and keep user ports in the right access VLAN. Most "VLAN does not work" tickets are a mismatch between the two sides, so you must be able to read both.</p>
<h3>The switch configuration</h3>
<p>These are the lab switch's startup lines, as used in the simulator. Gi0/1 is the trunk to the firewall; Gi0/2 is PC1's access port in VLAN 10; Gi0/3 is SRV1's in VLAN 20:</p>
<pre class="code">hostname SW1
vlan 10
 name STAFF
vlan 20
 name SERVERS
interface g0/1
 switchport mode trunk
interface g0/2
 switchport mode access
 switchport access vlan 10
interface g0/3
 switchport mode access
 switchport access vlan 20</pre>
<h3>Verifying the switch</h3>
<p>Real output from the lab switch. The trunk allows all VLANs and the two VLANs are active, with PC1 and SRV1 in their access VLANs:</p>
<pre class="code">SW1# show interfaces trunk
SW1# show vlan brief</pre>
<pre class="out">Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        <span class="hl">trunking</span>      1
Port        Vlans allowed on trunk
Gi0/1       <span class="hl">1-4094</span>
Port        Vlans allowed and active in management domain
Gi0/1       <span class="hl">1,10,20</span>

VLAN Name                             Status    Ports
10   STAFF                            active    <span class="hl">Gi0/2</span>
20   SERVERS                          active    <span class="hl">Gi0/3</span></pre>
<p>(Trimmed to the relevant lines.) Now the proof at the firewall. PC1 pings its gateway on the VLAN interface, and the firewall learns the PC's MAC address on VLAN10 only:</p>
<pre class="code">PC1> ping 10.10.10.1
NK-PUNE-FGT # get system arp</pre>
<pre class="out">84 bytes from 10.10.10.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.10.10.1 icmp_seq=2 ttl=64 time=0.600 ms

Address           Age(min)   Hardware Addr      Interface
10.10.10.10       0          00:50:7f:06:6d:01  <span class="hl">VLAN10</span></pre>
<h3>When the trunk is restricted</h3>
<p>Now the classic fault. If the trunk is limited to VLAN 10 with <code>switchport trunk allowed vlan 10</code>, VLAN 20 never reaches the firewall. The firewall interface VLAN20 still shows its address and connected route, so the firewall side looks fine. Real output:</p>
<pre class="out">SW1# show interfaces trunk
Gi0/1       on               802.1q        trunking      1
Port        Vlans allowed on trunk
Gi0/1       <span class="hl">10</span>
Port        Vlans allowed and active in management domain
Gi0/1       <span class="hl">10</span>

SRV1&gt; ping 10.10.20.1
host (10.10.20.1) not reachable
host (10.10.20.1) not reachable</pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="VLAN 20 is blocked at the trunk, not at the firewall"><rect x="10" y="40" width="130" height="60" rx="9" fill="#bbf7d0"/><text x="75" y="67" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="84" text-anchor="middle" class="svg-muted" font-size="11">VLAN 10</text><rect x="10" y="105" width="130" height="40" rx="9" fill="#ddd6fe"/><text x="75" y="122" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="75" y="139" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20</text><rect x="215" y="40" width="120" height="80" rx="9" fill="#e2e8f0"/><text x="275" y="77" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="275" y="94" text-anchor="middle" class="svg-muted" font-size="11">trunk allowed 10</text><rect x="440" y="40" width="190" height="80" rx="9" fill="#fde68a"/><text x="535" y="77" text-anchor="middle" class="svg-ink" font-size="13">FGT1</text><text x="535" y="94" text-anchor="middle" class="svg-muted" font-size="11">VLAN10 ok | VLAN20 silent</text><line x1="140" y1="70" x2="215" y2="70" stroke="#64748b" stroke-width="2"/><line x1="140" y1="125" x2="215" y2="105" stroke="#64748b" stroke-width="2"/><line x1="335" y1="80" x2="440" y2="80" stroke="#64748b" stroke-width="2"/><text x="388" y="72" text-anchor="middle" class="svg-accent" font-size="11">VLAN 10 only</text></svg><p class="cap">VLAN 20 is blocked at the trunk, not at the firewall</p></div>
<div class="eg"><p><b>Worked example.</b> Servers cannot reach their gateway. The firewall shows VLAN20 up with 10.10.20.1. The switch's trunk shows "allowed 10". Adding VLAN 20 with <code>switchport trunk allowed vlan add 20</code> repairs it; the firewall configuration never changed. When one VLAN works and another does not, compare the two sides before touching the firewall.</p></div>
<div class="warn"><p><b>Common mistake.</b> Judging the firewall by its own interface status. A VLAN interface can show up and have a connected route while its VLAN never arrives from the switch. Use the ARP table: no neighbours on the VLAN interface means no frames are arriving.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the native VLAN: untagged traffic on a trunk belongs to the native VLAN (1 by default on Cisco-style switches). A FortiGate VLAN interface with a vlanid expects tagged frames.</p></div>
<div class="scn"><h4>The Servers VLAN that went silent</h4><p>After a switch clean-up script ran, only VLAN 10 stayed on the trunk and the Servers VLAN lost its gateway. The firewall had not changed and its VLAN20 interface looked healthy. The engineer saw an empty ARP table on VLAN20, checked the trunk, found allowed vlan 10, and added 20 back.</p><p><b>Lesson:</b> an empty ARP table on a VLAN interface points to the switch, not the firewall.</p></div>
<div class="iv"><p class="q">"One VLAN works through the firewall and another does not. How do you troubleshoot?"</p><p>I compare both sides. On the firewall I check the VLAN interface address, vlanid and connected route and look at the ARP table for neighbours on that interface. On the switch I check the trunk allowed list and the access ports in the VLAN. A missing VLAN on the trunk or a vlanid mismatch is the usual cause.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The switch must tag the VLAN toward the firewall on a trunk.</li>
<li>Verify with show interfaces trunk, show vlan brief and the FortiGate ARP table.</li>
<li>A healthy VLAN interface proves nothing about the trunk.</li>
<li>Compare both sides before changing the firewall.</li>
</ul></div>
`,hi:`
<p>FortiGate par VLAN interface aadha hi working design hai. Switch ko firewall ki taraf trunk par VLANs ko <b>tag</b> karna hai aur user ports ko sahi access VLAN mein rakhna hai. Zyadatar "VLAN kaam nahi karta" tickets dono sides ke mismatch hote hain, isliye aapko dono padhna aana chahiye.</p>
<h3>Switch configuration</h3>
<p>Yeh lab switch ki startup lines hain, jaise simulator mein use hui. Gi0/1 firewall ki taraf trunk hai; Gi0/2 PC1 ka VLAN 10 mein access port hai; Gi0/3 SRV1 ka VLAN 20 mein:</p>
<pre class="code">hostname SW1
vlan 10
 name STAFF
vlan 20
 name SERVERS
interface g0/1
 switchport mode trunk
interface g0/2
 switchport mode access
 switchport access vlan 10
interface g0/3
 switchport mode access
 switchport access vlan 20</pre>
<h3>Switch verify karna</h3>
<p>Lab switch ka asli output. Trunk saare VLANs allow karta hai aur dono VLANs active hain, PC1 aur SRV1 apne access VLANs mein:</p>
<pre class="code">SW1# show interfaces trunk
SW1# show vlan brief</pre>
<pre class="out">Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        <span class="hl">trunking</span>      1
Port        Vlans allowed on trunk
Gi0/1       <span class="hl">1-4094</span>
Port        Vlans allowed and active in management domain
Gi0/1       <span class="hl">1,10,20</span>

VLAN Name                             Status    Ports
10   STAFF                            active    <span class="hl">Gi0/2</span>
20   SERVERS                          active    <span class="hl">Gi0/3</span></pre>
<p>(Relevant lines tak trimmed.) Ab firewall par saboot. PC1 VLAN interface par apne gateway ko ping karta hai, aur firewall PC ka MAC address sirf VLAN10 par seekhta hai:</p>
<pre class="code">PC1> ping 10.10.10.1
NK-PUNE-FGT # get system arp</pre>
<pre class="out">84 bytes from 10.10.10.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.10.10.1 icmp_seq=2 ttl=64 time=0.600 ms

Address           Age(min)   Hardware Addr      Interface
10.10.10.10       0          00:50:7f:06:6d:01  <span class="hl">VLAN10</span></pre>
<h3>Jab trunk restricted ho</h3>
<p>Ab classic fault. Agar trunk <code>switchport trunk allowed vlan 10</code> se sirf VLAN 10 tak limited ho to VLAN 20 firewall tak kabhi nahi pahunchta. Firewall interface VLAN20 phir bhi apna address aur connected route dikhata hai, isliye firewall side theek lagti hai. Asli output:</p>
<pre class="out">SW1# show interfaces trunk
Gi0/1       on               802.1q        trunking      1
Port        Vlans allowed on trunk
Gi0/1       <span class="hl">10</span>
Port        Vlans allowed and active in management domain
Gi0/1       <span class="hl">10</span>

SRV1&gt; ping 10.10.20.1
host (10.10.20.1) not reachable
host (10.10.20.1) not reachable</pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="VLAN 20 trunk par block hai, firewall par nahi"><rect x="10" y="40" width="130" height="60" rx="9" fill="#bbf7d0"/><text x="75" y="67" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="84" text-anchor="middle" class="svg-muted" font-size="11">VLAN 10</text><rect x="10" y="105" width="130" height="40" rx="9" fill="#ddd6fe"/><text x="75" y="122" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="75" y="139" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20</text><rect x="215" y="40" width="120" height="80" rx="9" fill="#e2e8f0"/><text x="275" y="77" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="275" y="94" text-anchor="middle" class="svg-muted" font-size="11">trunk allowed 10</text><rect x="440" y="40" width="190" height="80" rx="9" fill="#fde68a"/><text x="535" y="77" text-anchor="middle" class="svg-ink" font-size="13">FGT1</text><text x="535" y="94" text-anchor="middle" class="svg-muted" font-size="11">VLAN10 ok | VLAN20 silent</text><line x1="140" y1="70" x2="215" y2="70" stroke="#64748b" stroke-width="2"/><line x1="140" y1="125" x2="215" y2="105" stroke="#64748b" stroke-width="2"/><line x1="335" y1="80" x2="440" y2="80" stroke="#64748b" stroke-width="2"/><text x="388" y="72" text-anchor="middle" class="svg-accent" font-size="11">VLAN 10 only</text></svg><p class="cap">VLAN 20 trunk par block hai, firewall par nahi</p></div>
<div class="eg"><p><b>Worked example.</b> Servers apne gateway tak nahi pahunch paate. Firewall VLAN20 ko 10.10.20.1 ke saath up dikhata hai. Switch ka trunk "allowed 10" dikhata hai. <code>switchport trunk allowed vlan add 20</code> se VLAN 20 jodna repair karta hai; firewall configuration kabhi nahi badli. Ek VLAN chale aur doosra nahi, to firewall chhune se pehle dono sides compare karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> Firewall ko uske apne interface status se judge karna. VLAN interface up dikhe aur connected route ho tab bhi uska VLAN switch se kabhi na aaye. ARP table use karo: VLAN interface par neighbours nahi matlab frames nahi aa rahe.</p></div>
<div class="exam"><p><b>Exam trap.</b> Native VLAN yaad rakho: trunk par untagged traffic native VLAN (Cisco-style switches par default 1) ka hota hai. vlanid wala FortiGate VLAN interface tagged frames expect karta hai.</p></div>
<div class="scn"><h4>Servers VLAN jo chup ho gaya</h4><p>Switch clean-up script chalne ke baad trunk par sirf VLAN 10 raha aur Servers VLAN ka gateway chala gaya. Firewall nahi badla tha aur uska VLAN20 interface healthy dikhta tha. Engineer ne VLAN20 par khali ARP table dekha, trunk check kiya, allowed vlan 10 mila, aur 20 wapas jod diya.</p><p><b>Lesson:</b> VLAN interface par khali ARP table switch ki taraf ishara karta hai, firewall ki nahi.</p></div>
<div class="iv"><p class="q">"Ek VLAN firewall ke through chalta hai aur doosra nahi. Troubleshoot kaise karte ho?"</p><p>Main dono sides compare karta hoon. Firewall par VLAN interface address, vlanid aur connected route check karta hoon aur us interface par neighbours ke liye ARP table dekhta hoon. Switch par trunk allowed list aur VLAN ke access ports check karta hoon. Trunk par VLAN missing hona ya vlanid mismatch aam cause hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch ko VLAN ko firewall ki taraf trunk par tag karna hota hai.</li>
<li>show interfaces trunk, show vlan brief aur FortiGate ARP table se verify karo.</li>
<li>Healthy VLAN interface trunk ke baare mein kuch saabit nahi karta.</li>
<li>Firewall badalne se pehle dono sides compare karo.</li>
</ul></div>
`}};export{e as default};