var e={id:`flood-learn`,h:{en:`Flood and learn: how VTEPs discover remote MACs`,hi:`Flood and learn: VTEPs remote MACs kaise discover karte hain`},body:{en:`
<p>A new employee joins a large office and needs to hand a file to "Priya from finance". Nobody has given him a directory, so he shouts the question down every corridor. Priya answers, and at the same moment everyone who heard the shout notes where the new employee sits. Next time, both of them walk straight to each other. That is <b>flood and learn</b>: no directory, just shouting once and remembering who answered from where. Classic Ethernet switches have always worked like this. Flood-and-learn VXLAN extends the same idea across the routed fabric.</p>

<h3>The rules a flood-and-learn VTEP follows</h3>
<ol>
<li><b>Local learning</b> is normal Ethernet: when a frame arrives on Eth1/5 in VLAN 10, the source MAC is learned on Eth1/5.</li>
<li><b>Remote learning happens from the data plane</b>: when a VXLAN packet arrives and is decapsulated, the VTEP learns the <b>inner source MAC</b> against the <b>outer source IP</b>. The MAC table entry points to <code>nve1(10.254.0.1)</code>, meaning "send frames for this MAC to that VTEP".</li>
<li><b>Known unicast</b> goes as one VXLAN packet straight to the VTEP that owns the destination MAC.</li>
<li><b>BUM</b> (broadcast, unknown unicast, multicast) goes to every VTEP that has the VNI, by ingress replication or a multicast group (next chapter).</li>
</ol>
<p>There is no protocol between VTEPs announcing MACs. The only way a VTEP learns about a remote host is that the host sent something.</p>

<h3>Packet walk: SRV1 pings SRV2 for the first time</h3>
<p>SRV1 (172.16.10.11, MAC 0050.56aa.0011) is on LEAF1 Eth1/5. SRV2 (172.16.10.12, MAC 0050.56aa.0012) is on LEAF2 Eth1/5. Both are in VLAN 10 = VNI 10010. MAC tables are empty.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="ARP packet walk across VXLAN">
<rect x="20" y="20" width="130" height="36" rx="6" fill="#fed7aa"/><text x="85" y="43" text-anchor="middle" class="svg-ink" font-size="12">SRV1 .11</text>
<rect x="180" y="20" width="120" height="36" rx="6" fill="#bae6fd"/><text x="240" y="43" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 10.254.0.1</text>
<rect x="340" y="20" width="120" height="36" rx="6" fill="#bae6fd"/><text x="400" y="43" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 10.254.0.2</text>
<rect x="490" y="20" width="130" height="36" rx="6" fill="#fed7aa"/><text x="555" y="43" text-anchor="middle" class="svg-ink" font-size="12">SRV2 .12</text>
<line x1="85" y1="56" x2="85" y2="290" stroke="#64748b" stroke-dasharray="3 4"/><line x1="240" y1="56" x2="240" y2="290" stroke="#64748b" stroke-dasharray="3 4"/><line x1="400" y1="56" x2="400" y2="290" stroke="#64748b" stroke-dasharray="3 4"/><line x1="555" y1="56" x2="555" y2="290" stroke="#64748b" stroke-dasharray="3 4"/>
<line x1="85" y1="80" x2="240" y2="80" stroke="#64748b" stroke-width="2"/><text x="162" y="74" text-anchor="middle" class="svg-ink" font-size="12">1 ARP request (bcast)</text>
<line x1="240" y1="115" x2="400" y2="115" stroke="#64748b" stroke-width="3"/><text x="320" y="109" text-anchor="middle" class="svg-accent" font-size="12">2 VXLAN copy to .2</text>
<text x="400" y="140" text-anchor="middle" class="svg-muted" font-size="12">3 learn .0011 on nve1(.1)</text>
<line x1="400" y1="160" x2="555" y2="160" stroke="#64748b" stroke-width="2"/><text x="478" y="154" text-anchor="middle" class="svg-ink" font-size="12">4 flood locally</text>
<line x1="555" y1="195" x2="400" y2="195" stroke="#64748b" stroke-width="2"/><text x="478" y="189" text-anchor="middle" class="svg-ink" font-size="12">5 ARP reply</text>
<line x1="400" y1="230" x2="240" y2="230" stroke="#64748b" stroke-width="3"/><text x="320" y="224" text-anchor="middle" class="svg-accent" font-size="12">6 VXLAN unicast to .1</text>
<text x="240" y="255" text-anchor="middle" class="svg-muted" font-size="12">7 learn .0012 on nve1(.2)</text>
<line x1="240" y1="280" x2="85" y2="280" stroke="#64748b" stroke-width="2"/><text x="162" y="274" text-anchor="middle" class="svg-ink" font-size="12">8 ARP reply</text>
</svg><p class="cap">One broadcast and one reply teach both VTEPs where both servers live.</p></div>

<ol>
<li><b>SRV1 sends an ARP request</b>: "Who has 172.16.10.12?" to ff:ff:ff:ff:ff:ff in VLAN 10. LEAF1 learns 0050.56aa.0011 on Eth1/5.</li>
<li><b>LEAF1 floods it</b>: to every other local port in VLAN 10, and to every remote VTEP for VNI 10010. With static ingress replication the list contains 10.254.0.2, so LEAF1 builds one VXLAN packet: outer 10.254.0.1 → 10.254.0.2, UDP 4789, VNI 10010.</li>
<li><b>LEAF2 decapsulates</b>: VNI 10010 maps to local VLAN 10. It learns the inner source MAC 0050.56aa.0011 against the outer source IP: <code>nve1(10.254.0.1)</code>.</li>
<li><b>LEAF2 floods the ARP</b> out of its local VLAN 10 ports, and SRV2 receives it. (A frame received from the overlay is never sent back into the overlay, which prevents loops.)</li>
<li><b>SRV2 replies</b> with a unicast ARP reply to 0050.56aa.0011. LEAF2 learns 0050.56aa.0012 on Eth1/5.</li>
<li><b>LEAF2 looks up 0050.56aa.0011</b>, finds nve1(10.254.0.1), and sends <b>one unicast VXLAN packet</b> to 10.254.0.1. No flooding needed.</li>
<li><b>LEAF1 decapsulates</b> and learns 0050.56aa.0012 on nve1(10.254.0.2).</li>
<li><b>LEAF1 delivers</b> the reply to SRV1 on Eth1/5. From now on, the ICMP echo and reply are known unicast in both directions.</li>
</ol>

<h3>What the MAC table shows afterwards</h3>
<pre class="out">LEAF1# show mac address-table vlan 10
Legend:
        * - primary entry, G - Gateway MAC, (R) - Routed MAC, O - Overlay MAC
        age - seconds since last seen,+ - primary entry using vPC Peer-Link,
        (T) - True, (F) - False, C - ControlPlane MAC, ~ - vsan
   VLAN     MAC Address      Type      age     Secure NTFY Ports
---------+-----------------+--------+---------+------+----+------------------
*   10     0050.56aa.0011   dynamic  0         F      F    Eth1/5
<span class="hl">*   10     0050.56aa.0012   dynamic  0         F      F    nve1(10.254.0.2)</span></pre>
<p>The remote MAC is <b>dynamic</b> (learned from traffic, not from a control plane) and its port is the NVE interface with the peer VTEP in brackets. It ages out like any dynamic entry (default MAC aging on Nexus is 1800 seconds) if SRV2 stops sending.</p>

<div class="eg"><p><b>Worked example: why the first ping may lose a packet.</b> The very first ICMP echo cannot leave SRV1 until ARP completes. Some hosts drop the packet that triggered ARP, so you see <code>1 packets lost</code> or a single timeout, then success. In the lab the hint says exactly this: ping twice. A second ping that also fails is a real problem, not ARP.</p></div>

<h3>Unknown unicast and aging</h3>
<p>If LEAF1's entry for 0050.56aa.0012 ages out while SRV1 still has SRV2 in its ARP cache, SRV1 sends a unicast frame to a MAC the leaf does not know. The leaf treats it as <b>unknown unicast</b>, part of BUM, and replicates it to every peer VTEP for the VNI. When SRV2 replies, the entry is learned again. This works, but it multiplies traffic across the fabric. That is one reason EVPN (which advertises MACs) is preferred at scale.</p>

<div class="warn"><p><b>Common mistake.</b> Expecting the remote MAC to appear in the table before any traffic. In flood-and-learn, a MAC behind a remote VTEP shows up only after that host has sent a frame that reached you. An empty nve1 entry list right after configuration is normal; generate traffic first.</p></div>

<div class="exam"><p><b>Exam trap.</b> In flood-and-learn the remote MAC is associated with the <b>outer source IP</b> (the remote VTEP), not with the inner source IP (the server). And <code>show nve peers</code> reports LearnType <b>DP</b> (data plane); with EVPN it shows <b>CP</b> (control plane).</p></div>

<div class="scn"><h4>The printer that nobody could reach</h4><p>After a migration to a VXLAN fabric, a label printer on LEAF3 could not be reached from a warehouse server on LEAF1 each morning, though it worked after someone walked over and pressed a button. The printer only ever received traffic and never sent anything until woken, so after MAC aging its entry disappeared everywhere. ARP floods did reach LEAF3, but the printer's network card was in deep sleep and ignored them. The team disabled the printer's power-saving network mode, and it answered ARP immediately.</p><p><b>Lesson:</b> flood-and-learn depends on hosts talking. Silent or sleepy hosts are the first to suffer.</p></div>

<div class="iv"><p class="q">"In flood-and-learn VXLAN, how does a VTEP learn the location of a remote MAC?"</p><p>Strong answer: from the data plane. When the VTEP decapsulates a VXLAN packet, it records the inner source MAC against the outer source IP of the sending VTEP, so the MAC table shows nve1(peer-ip). The first packet towards an unknown MAC (usually an ARP broadcast) is flooded to all VTEPs in the VNI; the reply is unicast and teaches the other direction. Mention that there is no control plane, entries age out, and EVPN replaces this with BGP advertisements.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flood-and-learn VTEPs learn remote MACs from decapsulated traffic: inner source MAC → outer source IP.</li>
<li>Remote MACs appear as nve1(peer VTEP IP) in show mac address-table.</li>
<li>Broadcast and unknown unicast are flooded to every VTEP in the VNI; known unicast goes to one VTEP.</li>
<li>Frames received from the overlay are never flooded back into the overlay.</li>
<li>Silent hosts and aging cause extra flooding; EVPN fixes this with a control plane.</li>
</ul></div>
`,hi:`
<p>Ek naya employee bade office mein join karta hai aur use "finance wali Priya" ko ek file deni hai. Kisi ne use directory nahi di, isliye woh har corridor mein sawaal chilla deta hai. Priya jawab deti hai, aur usi pal jisne bhi chillahat suni, woh note kar leta hai ki naya employee kahan baithta hai. Agli baar dono seedhe ek doosre ke paas chale jaate hain. Yahi <b>flood and learn</b> hai: koi directory nahi, bas ek baar chillao aur yaad rakho ki jawab kahan se aaya. Classic Ethernet switches hamesha aise hi kaam karte aaye hain. Flood-and-learn VXLAN isi idea ko routed fabric ke paar le jaata hai.</p>

<h3>Flood-and-learn VTEP ke rules</h3>
<ol>
<li><b>Local learning</b> normal Ethernet hai: jab VLAN 10 mein Eth1/5 par frame aata hai, source MAC Eth1/5 par learn hota hai.</li>
<li><b>Remote learning data plane se hoti hai</b>: jab VXLAN packet aata hai aur decapsulate hota hai, VTEP <b>inner source MAC</b> ko <b>outer source IP</b> ke against learn karta hai. MAC table entry <code>nve1(10.254.0.1)</code> ko point karti hai, matlab "is MAC ke frames us VTEP ko bhejo".</li>
<li><b>Known unicast</b> ek VXLAN packet ban kar seedha us VTEP ko jaata hai jiske paas destination MAC hai.</li>
<li><b>BUM</b> (broadcast, unknown unicast, multicast) har us VTEP ko jaata hai jiske paas VNI hai, ingress replication ya multicast group se (agla chapter).</li>
</ol>
<p>VTEPs ke beech MACs announce karne wala koi protocol nahi hai. VTEP ko remote host ke baare mein pata chalne ka ek hi tareeka hai: host ne kuch bheja ho.</p>

<h3>Packet walk: SRV1 pehli baar SRV2 ko ping karta hai</h3>
<p>SRV1 (172.16.10.11, MAC 0050.56aa.0011) LEAF1 Eth1/5 par hai. SRV2 (172.16.10.12, MAC 0050.56aa.0012) LEAF2 Eth1/5 par hai. Dono VLAN 10 = VNI 10010 mein hain. MAC tables khaali hain.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="VXLAN ke paar ARP packet walk">
<rect x="20" y="20" width="130" height="36" rx="6" fill="#fed7aa"/><text x="85" y="43" text-anchor="middle" class="svg-ink" font-size="12">SRV1 .11</text>
<rect x="180" y="20" width="120" height="36" rx="6" fill="#bae6fd"/><text x="240" y="43" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 10.254.0.1</text>
<rect x="340" y="20" width="120" height="36" rx="6" fill="#bae6fd"/><text x="400" y="43" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 10.254.0.2</text>
<rect x="490" y="20" width="130" height="36" rx="6" fill="#fed7aa"/><text x="555" y="43" text-anchor="middle" class="svg-ink" font-size="12">SRV2 .12</text>
<line x1="85" y1="56" x2="85" y2="290" stroke="#64748b" stroke-dasharray="3 4"/><line x1="240" y1="56" x2="240" y2="290" stroke="#64748b" stroke-dasharray="3 4"/><line x1="400" y1="56" x2="400" y2="290" stroke="#64748b" stroke-dasharray="3 4"/><line x1="555" y1="56" x2="555" y2="290" stroke="#64748b" stroke-dasharray="3 4"/>
<line x1="85" y1="80" x2="240" y2="80" stroke="#64748b" stroke-width="2"/><text x="162" y="74" text-anchor="middle" class="svg-ink" font-size="12">1 ARP request (bcast)</text>
<line x1="240" y1="115" x2="400" y2="115" stroke="#64748b" stroke-width="3"/><text x="320" y="109" text-anchor="middle" class="svg-accent" font-size="12">2 .2 ko VXLAN copy</text>
<text x="400" y="140" text-anchor="middle" class="svg-muted" font-size="12">3 .0011 nve1(.1) par learn</text>
<line x1="400" y1="160" x2="555" y2="160" stroke="#64748b" stroke-width="2"/><text x="478" y="154" text-anchor="middle" class="svg-ink" font-size="12">4 local flood</text>
<line x1="555" y1="195" x2="400" y2="195" stroke="#64748b" stroke-width="2"/><text x="478" y="189" text-anchor="middle" class="svg-ink" font-size="12">5 ARP reply</text>
<line x1="400" y1="230" x2="240" y2="230" stroke="#64748b" stroke-width="3"/><text x="320" y="224" text-anchor="middle" class="svg-accent" font-size="12">6 .1 ko VXLAN unicast</text>
<text x="240" y="255" text-anchor="middle" class="svg-muted" font-size="12">7 .0012 nve1(.2) par learn</text>
<line x1="240" y1="280" x2="85" y2="280" stroke="#64748b" stroke-width="2"/><text x="162" y="274" text-anchor="middle" class="svg-ink" font-size="12">8 ARP reply</text>
</svg><p class="cap">Ek broadcast aur ek reply dono VTEPs ko sikha dete hain ki dono servers kahan rehte hain.</p></div>

<ol>
<li><b>SRV1 ARP request bhejta hai</b>: "172.16.10.12 kiske paas hai?" VLAN 10 mein ff:ff:ff:ff:ff:ff ko. LEAF1 0050.56aa.0011 ko Eth1/5 par learn karta hai.</li>
<li><b>LEAF1 ise flood karta hai</b>: VLAN 10 ke har doosre local port par, aur VNI 10010 ke har remote VTEP ko. Static ingress replication mein list mein 10.254.0.2 hai, isliye LEAF1 ek VXLAN packet banata hai: outer 10.254.0.1 → 10.254.0.2, UDP 4789, VNI 10010.</li>
<li><b>LEAF2 decapsulate karta hai</b>: VNI 10010 local VLAN 10 par map hota hai. Woh inner source MAC 0050.56aa.0011 ko outer source IP ke against learn karta hai: <code>nve1(10.254.0.1)</code>.</li>
<li><b>LEAF2 ARP ko flood karta hai</b> apne local VLAN 10 ports par, aur SRV2 use receive karta hai. (Overlay se aaya frame kabhi wapas overlay mein nahi bheja jaata, jisse loops rukte hain.)</li>
<li><b>SRV2 reply karta hai</b> 0050.56aa.0011 ko unicast ARP reply se. LEAF2 0050.56aa.0012 ko Eth1/5 par learn karta hai.</li>
<li><b>LEAF2 0050.56aa.0011 lookup karta hai</b>, nve1(10.254.0.1) paata hai, aur 10.254.0.1 ko <b>ek unicast VXLAN packet</b> bhejta hai. Flooding ki zaroorat nahi.</li>
<li><b>LEAF1 decapsulate karta hai</b> aur 0050.56aa.0012 ko nve1(10.254.0.2) par learn karta hai.</li>
<li><b>LEAF1 reply ko</b> Eth1/5 par SRV1 tak deliver karta hai. Ab se ICMP echo aur reply dono directions mein known unicast hain.</li>
</ol>

<h3>Baad mein MAC table kya dikhata hai</h3>
<pre class="out">LEAF1# show mac address-table vlan 10
Legend:
        * - primary entry, G - Gateway MAC, (R) - Routed MAC, O - Overlay MAC
        age - seconds since last seen,+ - primary entry using vPC Peer-Link,
        (T) - True, (F) - False, C - ControlPlane MAC, ~ - vsan
   VLAN     MAC Address      Type      age     Secure NTFY Ports
---------+-----------------+--------+---------+------+----+------------------
*   10     0050.56aa.0011   dynamic  0         F      F    Eth1/5
<span class="hl">*   10     0050.56aa.0012   dynamic  0         F      F    nve1(10.254.0.2)</span></pre>
<p>Remote MAC <b>dynamic</b> hai (traffic se seekha, control plane se nahi) aur uska port NVE interface hai jiske brackets mein peer VTEP hai. Agar SRV2 bhejna band kar de to yeh kisi bhi dynamic entry ki tarah age out hota hai (Nexus par default MAC aging 1800 seconds hai).</p>

<div class="eg"><p><b>Worked example: pehli ping mein ek packet kyun ja sakta hai.</b> Sabse pehla ICMP echo tab tak SRV1 se nahi nikal sakta jab tak ARP complete na ho. Kuch hosts ARP trigger karne wala packet drop kar dete hain, isliye aapko <code>1 packets lost</code> ya ek timeout dikhta hai, phir success. Lab ka hint bhi yahi kehta hai: do baar ping karo. Agar doosri ping bhi fail ho to woh asli problem hai, ARP nahi.</p></div>

<h3>Unknown unicast aur aging</h3>
<p>Agar LEAF1 ki 0050.56aa.0012 wali entry age out ho jaaye jabki SRV1 ke ARP cache mein SRV2 ab bhi hai, to SRV1 ek aise MAC ko unicast frame bhejta hai jise leaf nahi jaanta. Leaf ise <b>unknown unicast</b> maanta hai, jo BUM ka hissa hai, aur VNI ke har peer VTEP ko replicate karta hai. Jab SRV2 reply karta hai, entry phir se learn ho jaati hai. Yeh kaam karta hai, lekin fabric mein traffic kai guna badha deta hai. Scale par EVPN (jo MACs advertise karta hai) prefer karne ki yeh ek wajah hai.</p>

<div class="warn"><p><b>Common galti.</b> Kisi bhi traffic se pehle remote MAC table mein aane ki umeed karna. Flood-and-learn mein remote VTEP ke peeche ka MAC tabhi dikhta hai jab us host ne aisa frame bheja ho jo aap tak pahuncha. Configuration ke turant baad nve1 entries ki khaali list normal hai; pehle traffic generate karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Flood-and-learn mein remote MAC <b>outer source IP</b> (remote VTEP) se associate hota hai, inner source IP (server) se nahi. Aur <code>show nve peers</code> LearnType <b>DP</b> (data plane) report karta hai; EVPN ke saath yeh <b>CP</b> (control plane) dikhata hai.</p></div>

<div class="scn"><h4>Woh printer jis tak koi nahi pahunch pata tha</h4><p>VXLAN fabric par migration ke baad LEAF3 par ek label printer tak LEAF1 ke warehouse server se har subah pahuncha nahi ja sakta tha, jabki koi jaa kar button dabata to kaam karne lagta. Printer sirf traffic receive karta tha aur jagaye jaane tak kabhi kuch nahi bhejta tha, isliye MAC aging ke baad uski entry har jagah se gayab ho jaati thi. ARP floods LEAF3 tak pahunchte the, lekin printer ka network card deep sleep mein tha aur unhe ignore karta tha. Team ne printer ka power-saving network mode disable kiya, aur woh turant ARP ka jawab dene laga.</p><p><b>Seekh:</b> flood-and-learn hosts ke bolne par depend karta hai. Silent ya sote hue hosts sabse pehle suffer karte hain.</p></div>

<div class="iv"><p class="q">"Flood-and-learn VXLAN mein VTEP remote MAC ki location kaise seekhta hai?"</p><p>Strong answer: data plane se. Jab VTEP VXLAN packet decapsulate karta hai, woh inner source MAC ko bhejne wale VTEP ke outer source IP ke against record karta hai, isliye MAC table nve1(peer-ip) dikhata hai. Unknown MAC ki taraf pehla packet (aam taur par ARP broadcast) VNI ke saare VTEPs ko flood hota hai; reply unicast hota hai aur doosri direction sikha deta hai. Bataao ki koi control plane nahi hai, entries age out hoti hain, aur EVPN ise BGP advertisements se replace karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flood-and-learn VTEPs decapsulated traffic se remote MACs seekhte hain: inner source MAC → outer source IP.</li>
<li>Remote MACs show mac address-table mein nve1(peer VTEP IP) ki tarah dikhte hain.</li>
<li>Broadcast aur unknown unicast VNI ke har VTEP ko flood hote hain; known unicast ek VTEP ko jaata hai.</li>
<li>Overlay se aaye frames kabhi wapas overlay mein flood nahi hote.</li>
<li>Silent hosts aur aging extra flooding karwate hain; EVPN control plane se ise theek karta hai.</li>
</ul></div>
`}};export{e as default};