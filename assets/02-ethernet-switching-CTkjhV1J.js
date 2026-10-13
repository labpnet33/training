var e={id:`ethernet`,h:{en:`Ethernet and switching: MACs, frames and the MAC address table`,hi:`Ethernet aur switching: MACs, frames aur MAC address table`},body:{en:`
<p>Think of a new office receptionist. On day one she does not know where anyone sits, so when a parcel arrives she shouts the name across the whole floor. Each time someone walks past her desk she notes which corridor they came from. After a week she delivers almost every parcel straight to the right corridor, and only shouts for strangers. An Ethernet switch behaves exactly like her: it <b>learns</b> where addresses live, <b>forwards</b> to the known ones, and <b>floods</b> for the unknown ones.</p>

<h3>MAC addresses</h3>
<p>Every Ethernet interface has a 48-bit <b>MAC address</b>, written in hex. Cisco writes it as three groups (<code>0050.56a1.0b11</code>); Linux and VMware as six (<code>00:50:56:a1:0b:11</code>). The first 24 bits are the <b>OUI</b> (organisationally unique identifier) that shows the vendor; <code>00:50:56</code> is VMware, which is why you see it all over a virtualised data center. The lowest bit of the first byte is the <b>I/G bit</b>: 0 means unicast (one NIC), 1 means group (multicast). <code>ffff.ffff.ffff</code> is the <b>broadcast</b> address, received by every host in the VLAN.</p>

<h3>The Ethernet frame, field by field</h3>
<table class="cmp"><tr><th>Field</th><th>Size</th><th>Purpose</th></tr>
<tr><td>Preamble + SFD</td><td>8 bytes</td><td>Clock synchronisation; not counted in frame size</td></tr>
<tr><td>Destination MAC</td><td>6</td><td>Who should receive it (read first so switching can start early)</td></tr>
<tr><td>Source MAC</td><td>6</td><td>Who sent it; this is what the switch learns</td></tr>
<tr><td>EtherType</td><td>2</td><td>What is inside: 0x0800 IPv4, 0x86DD IPv6, 0x0806 ARP, 0x8100 means an 802.1Q tag follows</td></tr>
<tr><td>Payload</td><td>46 to 1500</td><td>The IP packet (padded up to 46 bytes if smaller)</td></tr>
<tr><td>FCS</td><td>4</td><td>CRC checksum; a bad FCS means the frame is dropped and counted as a CRC error</td></tr></table>
<p>So the minimum frame is 64 bytes and the standard maximum is 1518 bytes. Frames shorter than 64 bytes are <b>runts</b>; frames longer than the port MTU allows are <b>giants</b>. Rising CRC errors on a port almost always mean a dirty or faulty optic, fibre or cable.</p>

<h3>How a switch makes decisions</h3>
<ol>
<li><b>Learn.</b> For every frame received, record the <b>source MAC, VLAN and ingress port</b> in the MAC address table (also called the CAM table).</li>
<li><b>Forward.</b> If the destination MAC is in the table for that VLAN, send the frame out of that one port only.</li>
<li><b>Filter.</b> If the destination is on the same port the frame arrived on, drop it; it has already reached its segment.</li>
<li><b>Flood.</b> If the destination is broadcast, multicast without snooping state, or an <b>unknown unicast</b> (not in the table), send it out of every port in the VLAN except the one it came in on.</li>
<li><b>Age.</b> Remove entries not seen for the aging time. On NX-OS the default is <b>1800 seconds</b>; classic IOS switches use 300.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Switch learning and flooding">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">LEAF1 VLAN 10</text>
<rect x="30" y="160" width="120" height="36" rx="6" fill="#bbf7d0"/><text x="90" y="183" text-anchor="middle" class="svg-ink" font-size="12">WEB1 (A)</text>
<rect x="190" y="160" width="120" height="36" rx="6" fill="#bbf7d0"/><text x="250" y="183" text-anchor="middle" class="svg-ink" font-size="12">WEB2 (B)</text>
<rect x="350" y="160" width="120" height="36" rx="6" fill="#bbf7d0"/><text x="410" y="183" text-anchor="middle" class="svg-ink" font-size="12">WEB3 (C)</text>
<rect x="510" y="160" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="570" y="183" text-anchor="middle" class="svg-ink" font-size="12">DB1 (VLAN 20)</text>
<line x1="280" y1="64" x2="90" y2="160" stroke="#64748b" stroke-width="3"/><text x="120" y="110" class="svg-accent" font-size="12">1. A sends to B</text>
<line x1="305" y1="64" x2="250" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<line x1="335" y1="64" x2="410" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="380" y="110" class="svg-muted" font-size="12">2. B unknown: flood</text>
<line x1="360" y1="64" x2="570" y2="160" stroke="#64748b" stroke-width="1"/><text x="500" y="120" class="svg-muted" font-size="12">not flooded</text>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="12">Switch learns A on Eth1/5; floods only inside VLAN 10</text>
</svg><p class="cap">The first frame to an unknown MAC is flooded within its VLAN; the reply teaches the switch where B lives.</p></div>

<h3>Collision domains and broadcast domains</h3>
<p>A <b>collision domain</b> is a segment where two devices sending at once would collide. Old hubs created one big collision domain. Every switch port is its own collision domain, and modern links are full-duplex, so collisions simply do not happen in a data center. A <b>broadcast domain</b> is the set of devices that receive each other's broadcasts; on a switch that means <b>one VLAN</b>. Routers and SVIs stop broadcasts. Keeping broadcast domains small is a core design goal, because ARP, DHCP and unknown unicast flooding reach every host in the domain.</p>

<h3>The MAC address table on NX-OS</h3>
<pre class="code"><span class="c">! whole table, one VLAN, or one MAC</span>
LEAF1# show mac address-table
LEAF1# show mac address-table vlan 10
LEAF1# show mac address-table address 0050.56a1.0b12
<span class="c">! aging time (default 1800 s on NX-OS)</span>
LEAF1# show mac address-table aging-time</pre>
<pre class="out">Legend:
        * - primary entry, G - Gateway MAC, (R) - Routed MAC, O - Overlay MAC
        age - seconds since last seen,+ - primary entry using vPC Peer-Link
   VLAN     MAC Address      Type      age     Secure NTFY Ports
---------+-----------------+--------+---------+------+----+------------------
*   10     0050.56a1.0b11   dynamic  0         F      F    Eth1/5
<span class="hl">*   10     0050.56a1.0b12   dynamic  0         F      F    Eth1/1</span>
G    -     00de.fb12.3401   static   -         F      F    sup-eth1(R)</pre>
<p>Read the highlighted line as: "in VLAN 10, MAC ...0b12 is reachable through Eth1/1". If Eth1/1 is a trunk to another switch, the host sits somewhere behind that switch. The <b>G</b> entry is the switch's own router MAC, used by its SVIs.</p>

<div class="eg"><p><b>Worked example: how big can the table get?</b> A rack has 40 hypervisors, each running 30 VMs with one vNIC, plus 40 host management NICs: 40 × 30 + 40 = 1,240 MACs in that leaf's local VLANs. If ten racks share the same stretched VLANs, every leaf could learn around 12,400 MACs. Leaf switches support tens of thousands of entries, but this is why designers limit how far VLANs stretch, and why EVPN later learns remote MACs through the control plane instead of flooding.</p></div>

<h3>Unknown unicast flooding and MAC moves</h3>
<p>If a server's MAC ages out while its ARP entry on the gateway is still valid, the gateway keeps sending unicast frames to a MAC the switches no longer know, and every one of them is flooded to the whole VLAN. That is why NX-OS pairs a <b>1800-second MAC aging</b> with a <b>1500-second ARP timeout</b>: the ARP refresh re-teaches the MAC before it ages out.</p>
<p>When a VM migrates (vMotion) to a hypervisor on another port or leaf, its MAC must be re-learned in the new place. The hypervisor sends a <b>RARP</b> or <b>gratuitous ARP</b> frame from the VM's MAC, so every switch updates its table immediately. This is a normal <b>MAC move</b>. A MAC that jumps back and forth between two ports many times per second is <b>MAC flapping</b> and nearly always means a Layer-2 loop or a misconfigured server NIC team.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading the port in the MAC table as "the host is here" when it is a trunk or port-channel towards another switch. Ignoring CRC counters. Forgetting the MAC table is per VLAN: the same MAC can appear in two VLANs.</p></div>
<div class="exam"><p><b>Exam tip.</b> A switch learns the <b>source</b> MAC and forwards on the <b>destination</b> MAC. Broadcast, unknown unicast and multicast (without snooping) are flooded within the VLAN. Each VLAN is one broadcast domain; each switch port is one collision domain.</p></div>

<div class="scn"><h4>VM unreachable for five minutes after migration</h4><p>After a planned vMotion, a VM stayed unreachable for several minutes and then recovered by itself. <code>show mac address-table address</code> on the old leaf still pointed at the old port. The virtual switch on the destination host had "notify switches" disabled, so no RARP was sent and the fabric kept the stale entry until traffic from the VM re-taught it. Enabling notify switches on the port group fixed it for good.</p><p><b>Lesson:</b> MAC tables only learn from frames; after a move, the host must speak first.</p></div>

<div class="iv"><p class="q">"How does a switch build its MAC address table, and what happens with an unknown destination?"</p><p>Strong answer: it learns the source MAC, VLAN and ingress port of every frame, forwards known unicast out of one port, filters same-port traffic, floods broadcast and unknown unicast inside the VLAN, and ages entries (1800 s default on NX-OS). Mention MAC moves after VM migration (RARP or GARP) and that flapping indicates a loop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC = 48 bits; first 24 bits are the vendor OUI; <code>ffff.ffff.ffff</code> is broadcast.</li>
<li>Frame: dest MAC, source MAC, EtherType, payload 46 to 1500, FCS; 64 to 1518 bytes.</li>
<li>Switches learn source MACs, forward, filter, flood unknowns and age entries (1800 s on NX-OS).</li>
<li>One VLAN = one broadcast domain; keep them small.</li>
<li>MAC moves are normal after vMotion; rapid flapping means a loop.</li>
</ul></div>
`,hi:`
<p>Office ki ek nayi receptionist socho. Pehle din use nahi pata ki kaun kahan baithta hai, isliye jab parcel aata hai to woh poore floor par naam chillaati hai. Har baar jab koi uski desk ke paas se guzarta hai, woh note karti hai ki woh kis corridor se aaya. Ek hafte baad woh lagbhag har parcel seedha sahi corridor mein deliver karti hai, aur sirf ajnabiyon ke liye chillaati hai. Ethernet switch bilkul usi tarah behave karta hai: yeh <b>seekhta</b> hai ki addresses kahan rehte hain, jaane-pehchaane ko <b>forward</b> karta hai, aur anjaan ke liye <b>flood</b> karta hai.</p>

<h3>MAC addresses</h3>
<p>Har Ethernet interface ka 48-bit <b>MAC address</b> hota hai, hex mein likha hua. Cisco ise teen groups mein likhta hai (<code>0050.56a1.0b11</code>); Linux aur VMware chhe mein (<code>00:50:56:a1:0b:11</code>). Pehle 24 bits <b>OUI</b> (organisationally unique identifier) hain jo vendor batate hain; <code>00:50:56</code> VMware hai, isiliye virtualised data center mein yeh har jagah dikhta hai. Pehle byte ka sabse neeche wala bit <b>I/G bit</b> hai: 0 matlab unicast (ek NIC), 1 matlab group (multicast). <code>ffff.ffff.ffff</code> <b>broadcast</b> address hai, jo VLAN ka har host receive karta hai.</p>

<h3>Ethernet frame, field by field</h3>
<table class="cmp"><tr><th>Field</th><th>Size</th><th>Purpose</th></tr>
<tr><td>Preamble + SFD</td><td>8 bytes</td><td>Clock synchronisation; frame size mein count nahi hota</td></tr>
<tr><td>Destination MAC</td><td>6</td><td>Kise receive karna hai (pehle padha jaata hai taaki switching jaldi shuru ho)</td></tr>
<tr><td>Source MAC</td><td>6</td><td>Kisne bheja; yahi switch seekhta hai</td></tr>
<tr><td>EtherType</td><td>2</td><td>Andar kya hai: 0x0800 IPv4, 0x86DD IPv6, 0x0806 ARP, 0x8100 matlab aage 802.1Q tag hai</td></tr>
<tr><td>Payload</td><td>46 se 1500</td><td>IP packet (chhota ho to 46 bytes tak pad kiya jaata hai)</td></tr>
<tr><td>FCS</td><td>4</td><td>CRC checksum; kharab FCS matlab frame drop aur CRC error count</td></tr></table>
<p>To minimum frame 64 bytes aur standard maximum 1518 bytes hai. 64 bytes se chhote frames <b>runts</b> hain; port MTU se bade frames <b>giants</b> hain. Kisi port par badhte CRC errors ka matlab lagbhag hamesha gandi ya kharab optic, fibre ya cable hota hai.</p>

<h3>Switch decisions kaise leta hai</h3>
<ol>
<li><b>Learn.</b> Har receive hue frame ke liye <b>source MAC, VLAN aur ingress port</b> ko MAC address table (CAM table bhi kehte hain) mein record karo.</li>
<li><b>Forward.</b> Agar destination MAC us VLAN ke table mein hai, frame ko sirf usi ek port se bhejo.</li>
<li><b>Filter.</b> Agar destination usi port par hai jahan se frame aaya, drop karo; woh apne segment tak pahunch chuka hai.</li>
<li><b>Flood.</b> Agar destination broadcast hai, snooping state ke bina multicast hai, ya <b>unknown unicast</b> (table mein nahi) hai, to use VLAN ke har port se bhejo, sivaay us port ke jahan se aaya.</li>
<li><b>Age.</b> Jo entries aging time tak nahi dikhi unhe hatao. NX-OS par default <b>1800 seconds</b> hai; classic IOS switches 300 use karte hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Switch learning aur flooding">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">LEAF1 VLAN 10</text>
<rect x="30" y="160" width="120" height="36" rx="6" fill="#bbf7d0"/><text x="90" y="183" text-anchor="middle" class="svg-ink" font-size="12">WEB1 (A)</text>
<rect x="190" y="160" width="120" height="36" rx="6" fill="#bbf7d0"/><text x="250" y="183" text-anchor="middle" class="svg-ink" font-size="12">WEB2 (B)</text>
<rect x="350" y="160" width="120" height="36" rx="6" fill="#bbf7d0"/><text x="410" y="183" text-anchor="middle" class="svg-ink" font-size="12">WEB3 (C)</text>
<rect x="510" y="160" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="570" y="183" text-anchor="middle" class="svg-ink" font-size="12">DB1 (VLAN 20)</text>
<line x1="280" y1="64" x2="90" y2="160" stroke="#64748b" stroke-width="3"/><text x="120" y="110" class="svg-accent" font-size="12">1. A, B ko bhejta hai</text>
<line x1="305" y1="64" x2="250" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<line x1="335" y1="64" x2="410" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="380" y="110" class="svg-muted" font-size="12">2. B anjaan: flood</text>
<line x1="360" y1="64" x2="570" y2="160" stroke="#64748b" stroke-width="1"/><text x="500" y="120" class="svg-muted" font-size="12">flood nahi</text>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="12">Switch A ko Eth1/5 par seekhta hai; sirf VLAN 10 ke andar flood karta hai</text>
</svg><p class="cap">Anjaan MAC ko pehla frame uske VLAN ke andar flood hota hai; reply switch ko sikhata hai ki B kahan rehta hai.</p></div>

<h3>Collision domains aur broadcast domains</h3>
<p><b>Collision domain</b> woh segment hai jahan do devices ek saath bhejein to collide ho jaayein. Purane hubs ek bada collision domain banate the. Har switch port apna alag collision domain hai, aur modern links full-duplex hain, isliye data center mein collisions hote hi nahi. <b>Broadcast domain</b> un devices ka set hai jo ek dusre ke broadcasts receive karte hain; switch par iska matlab <b>ek VLAN</b>. Routers aur SVIs broadcasts rok dete hain. Broadcast domains chhote rakhna core design goal hai, kyunki ARP, DHCP aur unknown unicast flooding domain ke har host tak pahunchte hain.</p>

<h3>NX-OS par MAC address table</h3>
<pre class="code"><span class="c">! poora table, ek VLAN, ya ek MAC</span>
LEAF1# show mac address-table
LEAF1# show mac address-table vlan 10
LEAF1# show mac address-table address 0050.56a1.0b12
<span class="c">! aging time (NX-OS par default 1800 s)</span>
LEAF1# show mac address-table aging-time</pre>
<pre class="out">Legend:
        * - primary entry, G - Gateway MAC, (R) - Routed MAC, O - Overlay MAC
        age - seconds since last seen,+ - primary entry using vPC Peer-Link
   VLAN     MAC Address      Type      age     Secure NTFY Ports
---------+-----------------+--------+---------+------+----+------------------
*   10     0050.56a1.0b11   dynamic  0         F      F    Eth1/5
<span class="hl">*   10     0050.56a1.0b12   dynamic  0         F      F    Eth1/1</span>
G    -     00de.fb12.3401   static   -         F      F    sup-eth1(R)</pre>
<p>Highlighted line ko aise padho: "VLAN 10 mein MAC ...0b12 Eth1/1 ke through reachable hai". Agar Eth1/1 dusre switch ki taraf trunk hai, to host us switch ke peeche kahin baitha hai. <b>G</b> entry switch ka apna router MAC hai, jo uske SVIs use karte hain.</p>

<div class="eg"><p><b>Worked example: table kitna bada ho sakta hai?</b> Ek rack mein 40 hypervisors hain, har ek par ek vNIC wale 30 VMs, plus 40 host management NICs: 40 × 30 + 40 = us leaf ke local VLANs mein 1,240 MACs. Agar das racks same stretched VLANs share karte hain, to har leaf lagbhag 12,400 MACs seekh sakta hai. Leaf switches das-hazaaron entries support karte hain, lekin isiliye designers VLANs ka stretch limit karte hain, aur isiliye aage EVPN remote MACs ko flooding ki jagah control plane se seekhta hai.</p></div>

<h3>Unknown unicast flooding aur MAC moves</h3>
<p>Agar kisi server ka MAC age out ho jaaye jabki gateway par uski ARP entry abhi valid hai, to gateway us MAC ko unicast frames bhejta rehta hai jise switches ab nahi jaante, aur har frame poore VLAN mein flood hota hai. Isiliye NX-OS <b>1800-second MAC aging</b> ko <b>1500-second ARP timeout</b> ke saath pair karta hai: ARP refresh MAC ke age out hone se pehle use dobara sikha deta hai.</p>
<p>Jab ek VM kisi dusre port ya leaf wale hypervisor par migrate (vMotion) hota hai, uska MAC nayi jagah par dobara learn hona chahiye. Hypervisor VM ke MAC se ek <b>RARP</b> ya <b>gratuitous ARP</b> frame bhejta hai, taaki har switch turant apna table update kare. Yeh normal <b>MAC move</b> hai. Jo MAC do ports ke beech ek second mein kai baar aage-peeche kude woh <b>MAC flapping</b> hai aur lagbhag hamesha Layer-2 loop ya galat configured server NIC team ka matlab hota hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> MAC table ke port ko "host yahan hai" padhna jabki woh dusre switch ki taraf trunk ya port-channel hai. CRC counters ignore karna. Yeh bhoolna ki MAC table per VLAN hai: same MAC do VLANs mein dikh sakta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> Switch <b>source</b> MAC seekhta hai aur <b>destination</b> MAC par forward karta hai. Broadcast, unknown unicast aur multicast (snooping ke bina) VLAN ke andar flood hote hain. Har VLAN ek broadcast domain; har switch port ek collision domain.</p></div>

<div class="scn"><h4>Migration ke baad VM paanch minute unreachable</h4><p>Ek planned vMotion ke baad ek VM kai minute unreachable raha aur phir khud theek ho gaya. Purane leaf par <code>show mac address-table address</code> abhi bhi purane port ko point kar raha tha. Destination host ke virtual switch par "notify switches" disabled tha, isliye koi RARP nahi gaya aur fabric stale entry rakhta raha jab tak VM ke traffic ne use dobara nahi sikhaya. Port group par notify switches enable karne se yeh hamesha ke liye theek ho gaya.</p><p><b>Seekh:</b> MAC tables sirf frames se seekhte hain; move ke baad host ko pehle bolna padta hai.</p></div>

<div class="iv"><p class="q">"Switch apna MAC address table kaise banata hai, aur unknown destination ke saath kya hota hai?"</p><p>Strong answer: yeh har frame ka source MAC, VLAN aur ingress port seekhta hai, known unicast ko ek port se forward karta hai, same-port traffic filter karta hai, broadcast aur unknown unicast ko VLAN ke andar flood karta hai, aur entries age karta hai (NX-OS par default 1800 s). VM migration ke baad MAC moves (RARP ya GARP) ka zikr karo aur bolo ki flapping loop ka sign hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC = 48 bits; pehle 24 bits vendor OUI; <code>ffff.ffff.ffff</code> broadcast hai.</li>
<li>Frame: dest MAC, source MAC, EtherType, payload 46 se 1500, FCS; 64 se 1518 bytes.</li>
<li>Switches source MACs seekhte hain, forward, filter, anjaan ko flood aur entries age karte hain (NX-OS par 1800 s).</li>
<li>Ek VLAN = ek broadcast domain; inhe chhota rakho.</li>
<li>vMotion ke baad MAC moves normal hain; tez flapping matlab loop.</li>
</ul></div>
`}};export{e as default};