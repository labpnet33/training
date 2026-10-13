var e={id:`speed-duplex-mtu`,h:{en:`Interface settings: speed, duplex, MTU and jumbo frames`,hi:`Interface settings: speed, duplex, MTU aur jumbo frames`},body:{en:`
<h3>The analogy: a road, its lanes and the size of the trucks</h3>
<p>Think of a link as a road between two towns. <b>Speed</b> is the speed limit. <b>Duplex</b> is whether the road has one shared lane (half duplex: traffic takes turns) or two lanes, one each way (full duplex: both directions at once). <b>MTU</b> is the largest truck allowed on the road. If both towns agree on the rules, traffic flows. If one town thinks the road is two-lane and the other thinks it is one-lane, or one town sends trucks too tall for a bridge, you get crashes and stuck loads, even though the road is "open".</p>

<h3>Speed and duplex</h3>
<p><b>Speed</b> is the bit rate of the link: 10, 100, 1000 Mb/s, 2.5, 5, 10, 25 Gb/s and beyond. <b>Half duplex</b> means a device can either send or receive at one moment; it listens before talking and backs off after collisions (CSMA/CD). <b>Full duplex</b> means it sends and receives at the same time on separate pairs or fibers, so collisions cannot happen. Every modern switch port to a single device should run full duplex.</p>
<p>Copper Ethernet ports use <b>auto-negotiation</b>: both ends advertise what they support and pick the best common speed and duplex. Gigabit copper (1000BASE-T) requires auto-negotiation. Most fiber ports run at one fixed speed set by the optic.</p>
<pre class="code"><span class="c">! Default and recommended: let both sides negotiate</span>
interface GigabitEthernet0/1
 speed auto
 duplex auto
<span class="c">! Only if a legacy device cannot negotiate: hard-set BOTH ends</span>
interface GigabitEthernet0/7
 speed 100
 duplex full</pre>

<h3>The duplex mismatch</h3>
<p>The classic fault: one end is hard-set to 100/full, the other is left on auto. Auto-negotiation needs both sides to take part. The auto side can still sense the speed from the signal, but it cannot learn the duplex, so the standard tells it to assume <b>half duplex</b>. Now one side transmits whenever it likes (full) while the other waits and detects "collisions" (half). The link is up and pings work, but large transfers crawl.</p>
<pre class="out">SW1#show interfaces status

Port      Name        Status       Vlan       Duplex  Speed Type
Gi0/1     PC1         connected    10         a-full a-1000 10/100/1000BaseTX
<span class="hl">Gi0/7     NVR-CCTV    connected    40           half    100 10/100/1000BaseTX</span>

SW1#show interfaces GigabitEthernet0/7
GigabitEthernet0/7 is up, line protocol is up (connected)
  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec,
  <span class="hl">Half-duplex, 100Mb/s</span>, media type is 10/100/1000BaseTX
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     0 babbles, <span class="hl">4127 late collision</span>, 0 deferred</pre>
<p>The prefix <code>a-</code> means the value was auto-negotiated. The fingerprint of a duplex mismatch is <b>late collisions</b> on the half-duplex side and <b>CRC and input errors, runts</b> on the full-duplex side. The fix is to make both ends match: both auto (best) or both hard-set to the same speed and duplex.</p>

<h3>MTU: the largest packet an interface will send</h3>
<p>The <b>maximum transmission unit (MTU)</b> is the largest layer 3 packet that fits in one frame on a link. Standard Ethernet MTU is <b>1500 bytes</b>. Add the 14-byte Ethernet header and 4-byte FCS and the frame is 1518 bytes, or 1522 with an 802.1Q tag. A packet larger than the next link's MTU must be <b>fragmented</b> (IPv4, if allowed) or dropped with an ICMP "fragmentation needed" or "packet too big" message so the sender can shrink it. This is Path MTU Discovery.</p>
<p><b>Jumbo frames</b> are Ethernet frames with an MTU larger than 1500, typically 9000 bytes (switches often allow frames up to about 9216). Sending fewer, bigger frames means fewer headers and less CPU per gigabyte, which helps storage traffic (iSCSI, NFS), VM live migration and backups inside a data center. Jumbo frames are almost never used towards the internet, whose path MTU is 1500 or less.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Jumbo frames need end-to-end MTU">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">Host</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">MTU 9000</text>
<rect x="190" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="245" y="92" text-anchor="middle" class="svg-ink" font-size="13">Switch A</text><text x="245" y="110" text-anchor="middle" class="svg-muted" font-size="12">9216</text>
<rect x="360" y="70" width="110" height="50" rx="8" fill="#fed7aa"/><text x="415" y="92" text-anchor="middle" class="svg-ink" font-size="13">Switch B</text><text x="415" y="110" text-anchor="middle" class="svg-accent" font-size="12">1500 !</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="92" text-anchor="middle" class="svg-ink" font-size="13">Storage</text><text x="575" y="110" text-anchor="middle" class="svg-muted" font-size="12">MTU 9000</text>
<line x1="130" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="2"/><line x1="470" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="20" y="160" class="svg-muted" font-size="12">Small packets pass everywhere; 9000-byte frames are dropped at Switch B.</text>
</svg><p class="cap">Jumbo frames only work when every device on the layer 2 path supports the larger MTU.</p></div>
<pre class="code"><span class="c">! Enabling jumbo frames depends on the platform:</span>
<span class="c">! many Catalyst-style switches use a global command</span>
system mtu 9198
<span class="c">! others (and routed ports) use a per-interface command</span>
interface Ethernet1/10
 mtu 9216</pre>
<pre class="out">R1#ping 192.168.10.20 size 9000 df-bit
Type escape sequence to abort.
Sending 5, 9000-byte ICMP Echos to 192.168.10.20, timeout is 2 seconds:
Packet sent with the DF bit set
<span class="hl">.....
Success rate is 0 percent (0/5)</span></pre>

<div class="eg"><p><b>Worked example.</b> A host ping test for a 9000-byte MTU uses a payload of 8972 bytes, because the IPv4 header (20) and ICMP header (8) add 28: 8972 + 28 = 9000. On Windows: <code>ping -f -l 8972 192.168.10.20</code>; on Linux: <code>ping -M do -s 8972 192.168.10.20</code>. If 1472 works but 8972 fails, some device in the path is still at 1500.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Hard-setting only one end of a link and creating a duplex mismatch. (2) Enabling jumbo frames on servers and one switch but not on every switch and trunk in the path. (3) Firewalls blocking ICMP "fragmentation needed", so Path MTU Discovery fails and large transfers hang while small pings work (an MTU black hole).</p></div>

<div class="exam"><p><b>Exam traps.</b> Late collisions point to a <b>duplex mismatch</b>. Standard Ethernet MTU is 1500 bytes; jumbo frames are usually 9000. An MTU mismatch shows as "small packets work, large ones fail". Full duplex has no collisions. Speed and duplex are listed together in objective 2.2 under interface configuration.</p></div>

<div class="scn"><h4>The iSCSI datastore that froze under load</h4><p>A virtualisation team enabled 9000-byte MTU on their hosts and storage array. Mounting the datastore worked, but VMs froze whenever heavy I/O started. Pings between host and array succeeded. The network engineer ran <code>ping 10.20.0.50 size 9000 df-bit</code> from the core, which failed, while size 1500 succeeded. One aggregation switch in the path had never had its system MTU raised. After raising it and reloading in the maintenance window, the large-packet ping and the storage traffic both worked.</p><p><b>Lesson:</b> MTU must be consistent end to end; test with the do-not-fragment bit at the real frame size.</p></div>

<div class="iv"><p class="q">"Users say a link is slow but it shows up/up with no drops. What do you check?"</p><p>Strong answer: check speed and duplex on both ends with <code>show interfaces status</code> and the interface counters. A mismatch shows half duplex on one side, late collisions there and CRC/runts on the other. Fix by setting both ends to auto (or both identical). Also check for errors caused by bad cabling, and for MTU mismatches if only large transfers suffer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Speed is the bit rate; duplex is half (take turns, collisions) or full (both ways at once).</li>
<li>Leave both ends on auto, or hard-set both identically; one hard-set end causes a duplex mismatch.</li>
<li>Late collisions on one side and CRC errors on the other are the duplex mismatch fingerprint.</li>
<li>Standard MTU is 1500 bytes; jumbo frames (about 9000) help storage and DC traffic.</li>
<li>Jumbo frames must be enabled on every hop; test with a do-not-fragment ping at full size.</li>
</ul></div>
`,hi:`
<h3>Analogy: sadak, uski lanes aur trucks ka size</h3>
<p>Link ko do shehron ke beech ki sadak samjho. <b>Speed</b> speed limit hai. <b>Duplex</b> yeh hai ki sadak mein ek shared lane hai (half duplex: traffic baari baari chalta hai) ya do lanes, har direction ki ek (full duplex: dono directions ek saath). <b>MTU</b> sadak par allowed sabse bada truck hai. Agar dono shehar rules par agree karein, traffic chalta hai. Agar ek shehar sochta hai sadak do-lane hai aur doosra sochta hai ek-lane, ya ek shehar pul ke liye bahut unche trucks bhejta hai, to accidents aur atke hue loads milte hain, bhale hi sadak "khuli" ho.</p>

<h3>Speed aur duplex</h3>
<p><b>Speed</b> link ka bit rate hai: 10, 100, 1000 Mb/s, 2.5, 5, 10, 25 Gb/s aur usse aage. <b>Half duplex</b> ka matlab hai device ek pal mein ya to bhej sakta hai ya receive kar sakta hai; woh bolne se pehle sunta hai aur collisions ke baad peeche hat jaata hai (CSMA/CD). <b>Full duplex</b> ka matlab hai woh alag pairs ya fibers par ek saath bhejta aur receive karta hai, isliye collisions ho hi nahi sakte. Kisi single device tak jaane wala har modern switch port full duplex par chalna chahiye.</p>
<p>Copper Ethernet ports <b>auto-negotiation</b> use karte hain: dono ends batate hain ki woh kya support karte hain aur sabse achhi common speed aur duplex chunte hain. Gigabit copper (1000BASE-T) ko auto-negotiation zaroori hai. Zyada tar fiber ports optic ke hisaab se ek fixed speed par chalte hain.</p>
<pre class="code"><span class="c">! Default aur recommended: dono sides ko negotiate karne do</span>
interface GigabitEthernet0/1
 speed auto
 duplex auto
<span class="c">! Sirf jab legacy device negotiate na kar sake: DONO ends hard-set karo</span>
interface GigabitEthernet0/7
 speed 100
 duplex full</pre>

<h3>Duplex mismatch</h3>
<p>Classic fault: ek end 100/full par hard-set hai, doosra auto par chhoda gaya hai. Auto-negotiation ke liye dono sides ka hissa lena zaroori hai. Auto side signal se speed to sense kar leti hai, lekin duplex nahi seekh paati, isliye standard use <b>half duplex</b> maanne ko kehta hai. Ab ek side jab chahe transmit karti hai (full) jabki doosri wait karti hai aur "collisions" detect karti hai (half). Link up hai aur pings chalte hain, lekin bade transfers reng-reng kar chalte hain.</p>
<pre class="out">SW1#show interfaces status

Port      Name        Status       Vlan       Duplex  Speed Type
Gi0/1     PC1         connected    10         a-full a-1000 10/100/1000BaseTX
<span class="hl">Gi0/7     NVR-CCTV    connected    40           half    100 10/100/1000BaseTX</span>

SW1#show interfaces GigabitEthernet0/7
GigabitEthernet0/7 is up, line protocol is up (connected)
  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec,
  <span class="hl">Half-duplex, 100Mb/s</span>, media type is 10/100/1000BaseTX
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     0 babbles, <span class="hl">4127 late collision</span>, 0 deferred</pre>
<p>Prefix <code>a-</code> ka matlab hai value auto-negotiate hui thi. Duplex mismatch ki pehchaan hai half-duplex side par <b>late collisions</b> aur full-duplex side par <b>CRC aur input errors, runts</b>. Fix hai dono ends ko match karna: dono auto (best) ya dono same speed aur duplex par hard-set.</p>

<h3>MTU: sabse bada packet jo interface bhejega</h3>
<p><b>Maximum transmission unit (MTU)</b> sabse bada layer 3 packet hai jo link par ek frame mein fit hota hai. Standard Ethernet MTU <b>1500 bytes</b> hai. 14-byte Ethernet header aur 4-byte FCS jodo to frame 1518 bytes ka hota hai, ya 802.1Q tag ke saath 1522. Agle link ke MTU se bada packet ya to <b>fragment</b> hota hai (IPv4 mein, agar allowed ho) ya ICMP "fragmentation needed" ya "packet too big" message ke saath drop hota hai taaki sender use chhota kar sake. Yahi Path MTU Discovery hai.</p>
<p><b>Jumbo frames</b> woh Ethernet frames hain jinka MTU 1500 se bada hota hai, aam taur par 9000 bytes (switches aksar lagbhag 9216 tak ke frames allow karte hain). Kam, bade frames bhejne ka matlab hai kam headers aur har gigabyte par kam CPU, jo data center ke andar storage traffic (iSCSI, NFS), VM live migration aur backups mein madad karta hai. Internet ki taraf jumbo frames lagbhag kabhi use nahi hote, kyunki uska path MTU 1500 ya usse kam hota hai.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Jumbo frames ko end-to-end MTU chahiye">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">Host</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">MTU 9000</text>
<rect x="190" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="245" y="92" text-anchor="middle" class="svg-ink" font-size="13">Switch A</text><text x="245" y="110" text-anchor="middle" class="svg-muted" font-size="12">9216</text>
<rect x="360" y="70" width="110" height="50" rx="8" fill="#fed7aa"/><text x="415" y="92" text-anchor="middle" class="svg-ink" font-size="13">Switch B</text><text x="415" y="110" text-anchor="middle" class="svg-accent" font-size="12">1500 !</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="92" text-anchor="middle" class="svg-ink" font-size="13">Storage</text><text x="575" y="110" text-anchor="middle" class="svg-muted" font-size="12">MTU 9000</text>
<line x1="130" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="2"/><line x1="470" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="20" y="160" class="svg-muted" font-size="12">Chhote packets har jagah pass; 9000-byte frames Switch B par drop hote hain.</text>
</svg><p class="cap">Jumbo frames tabhi kaam karte hain jab layer 2 path ka har device bada MTU support kare.</p></div>
<pre class="code"><span class="c">! Jumbo frames enable karna platform par depend karta hai:</span>
<span class="c">! kai Catalyst-style switches global command use karte hain</span>
system mtu 9198
<span class="c">! doosre (aur routed ports) per-interface command use karte hain</span>
interface Ethernet1/10
 mtu 9216</pre>
<pre class="out">R1#ping 192.168.10.20 size 9000 df-bit
Type escape sequence to abort.
Sending 5, 9000-byte ICMP Echos to 192.168.10.20, timeout is 2 seconds:
Packet sent with the DF bit set
<span class="hl">.....
Success rate is 0 percent (0/5)</span></pre>

<div class="eg"><p><b>Worked example.</b> 9000-byte MTU ke host ping test mein 8972 bytes ka payload use hota hai, kyunki IPv4 header (20) aur ICMP header (8) 28 jodte hain: 8972 + 28 = 9000. Windows par: <code>ping -f -l 8972 192.168.10.20</code>; Linux par: <code>ping -M do -s 8972 192.168.10.20</code>. Agar 1472 chalta hai lekin 8972 fail hota hai, to path mein koi device abhi bhi 1500 par hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Link ka sirf ek end hard-set karke duplex mismatch bana dena. (2) Servers aur ek switch par jumbo frames enable karna lekin path ke har switch aur trunk par nahi. (3) Firewalls ka ICMP "fragmentation needed" block karna, jisse Path MTU Discovery fail hoti hai aur bade transfers atak jaate hain jabki chhote pings chalte hain (MTU black hole).</p></div>

<div class="exam"><p><b>Exam traps.</b> Late collisions <b>duplex mismatch</b> ki taraf ishara karte hain. Standard Ethernet MTU 1500 bytes hai; jumbo frames aam taur par 9000. MTU mismatch "chhote packets chalte hain, bade fail hote hain" ki tarah dikhta hai. Full duplex mein collisions nahi hote. Objective 2.2 mein speed aur duplex interface configuration ke neeche saath list hain.</p></div>

<div class="scn"><h4>iSCSI datastore jo load par freeze hota tha</h4><p>Ek virtualisation team ne apne hosts aur storage array par 9000-byte MTU enable kiya. Datastore mount ho gaya, lekin jab bhi heavy I/O shuru hota, VMs freeze ho jaate. Host aur array ke beech pings succeed ho rahe the. Network engineer ne core se <code>ping 10.20.0.50 size 9000 df-bit</code> chalaya, jo fail hua, jabki size 1500 succeed hua. Path ke ek aggregation switch ka system MTU kabhi badhaya hi nahi gaya tha. Use badha kar maintenance window mein reload karne ke baad large-packet ping aur storage traffic dono chal pade.</p><p><b>Seekh:</b> MTU end to end consistent hona chahiye; real frame size par do-not-fragment bit ke saath test karo.</p></div>

<div class="iv"><p class="q">"Users kehte hain link slow hai lekin woh up/up dikhta hai aur koi drops nahi. Aap kya check karoge?"</p><p>Strong answer: dono ends par <code>show interfaces status</code> aur interface counters se speed aur duplex check karo. Mismatch mein ek side half duplex dikhti hai, wahan late collisions aur doosri taraf CRC/runts. Dono ends ko auto (ya dono identical) set karke fix karo. Kharab cabling se aane wale errors bhi check karo, aur agar sirf bade transfers suffer kar rahe hain to MTU mismatch bhi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Speed bit rate hai; duplex half (baari baari, collisions) ya full (dono taraf ek saath) hai.</li>
<li>Dono ends auto par chhodo, ya dono ko identical hard-set karo; ek hard-set end duplex mismatch banata hai.</li>
<li>Ek side late collisions aur doosri side CRC errors duplex mismatch ki pehchaan hain.</li>
<li>Standard MTU 1500 bytes hai; jumbo frames (lagbhag 9000) storage aur DC traffic mein madad karte hain.</li>
<li>Jumbo frames har hop par enable hone chahiye; full size par do-not-fragment ping se test karo.</li>
</ul></div>
`}};export{e as default};