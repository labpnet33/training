var e={id:`ospf`,h:{en:`OSPF underlay on NX-OS: point-to-point, loopbacks and verification`,hi:`NX-OS par OSPF underlay: point-to-point, loopbacks aur verification`},body:{en:`
<p>OSPF is like a group of neighbours who each draw a map of their own street and hand a copy to everyone. After a few seconds every house holds the same complete city map and can work out the shortest way anywhere by itself. In a spine-leaf fabric OSPF is the most common underlay because every network engineer already knows it, NX-OS supports it on every platform, and a single area is enough for hundreds of switches. This chapter configures exactly what the module labs ask for.</p>

<h3>The building blocks on NX-OS</h3>
<p>NX-OS differs from classic IOS in three ways you must remember:</p>
<ul>
<li><b>Features are off until enabled.</b> <code>feature ospf</code> must come first, or the <code>router ospf</code> command does not even exist.</li>
<li><b>The process has a name (a tag)</b>, not only a number. The labs use <code>router ospf UNDERLAY</code>, and routes show as <code>ospf-UNDERLAY</code>.</li>
<li><b>Interfaces join OSPF directly</b> with <code>ip router ospf UNDERLAY area 0.0.0.0</code>. There is no <code>network</code> statement under the process. This is precise: only the interfaces you name are advertised.</li>
</ul>

<h3>Why network type point-to-point</h3>
<p>Ethernet interfaces default to the OSPF <b>broadcast</b> network type. On a broadcast segment OSPF elects a <b>designated router (DR)</b> and backup (BDR) so that many routers on a shared LAN do not all form adjacencies with each other. A fabric link has exactly two routers, so the election is pure overhead:</p>
<ul>
<li>The election waits up to the <b>wait timer</b> (equal to the dead interval, 40 seconds by default) before the adjacency can finish, slowing bring-up.</li>
<li>The DR originates an extra <b>type-2 network LSA</b> for every link, doubling the objects in the database.</li>
<li>The OSPF tree becomes more complex to read.</li>
</ul>
<p><code>ip ospf network point-to-point</code> removes all of that: no DR or BDR, neighbours go straight to FULL, and the link appears as a simple point-to-point connection in the router LSA. In <code>show ip ospf neighbors</code> you will see <code>FULL/ -</code>: FULL, and a dash where the DR role would be. Both ends must use the same type.</p>

<h3>Configuration: the lab task, line by line</h3>
<pre class="code"><span class="c">! LEAF1 (addresses already configured)</span>
feature ospf
router ospf UNDERLAY
  router-id 10.255.0.1
  log-adjacency-changes
<span class="c">! Uplink to SPINE1</span>
interface Ethernet1/1
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
<span class="c">! Uplink to SPINE2</span>
interface Ethernet1/2
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
<span class="c">! Router-ID loopback (and loopback1 for the VTEP when VXLAN is added)</span>
interface loopback0
  ip router ospf UNDERLAY area 0.0.0.0
end
copy running-config startup-config</pre>
<p>Notes on each piece:</p>
<ul>
<li><b>router-id</b>: set it explicitly to loopback0. If you do not, NX-OS picks an address automatically, and a later change can alter it after a restart.</li>
<li><b>area 0.0.0.0</b>: area 0 in dotted form. NX-OS accepts <code>area 0</code> too and shows it as 0.0.0.0. The whole fabric sits in the backbone area.</li>
<li><b>Loopbacks</b>: OSPF always advertises a loopback as a /32 host route and never sends hellos on it, so a loopback needs no network type and never forms a neighbour.</li>
</ul>

<h3>Passive interfaces</h3>
<p>A <b>passive</b> interface is advertised into OSPF but does not send hellos, so no neighbour can form on it. You do not need it on loopbacks, which are inherently passive. You use it on any other routed interface whose subnet must be reachable but where no OSPF neighbour should ever appear, for example a routed link on a border leaf that faces a device not running OSPF:</p>
<pre class="code">interface Ethernet1/48
  ip router ospf UNDERLAY area 0.0.0.0
  ip ospf passive-interface</pre>

<h3>Cost and the numbers in the route table</h3>
<p>OSPF cost = reference bandwidth ÷ interface bandwidth. On NX-OS the default reference bandwidth is <b>40 Gbit/s</b>. A 1G interface therefore costs 40, a 10G interface 4, and 40G, 100G and 400G all cost 1 (the minimum). A loopback costs 1.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OSPF cost from LEAF1 to LEAF2 loopback">
<rect x="20" y="85" width="110" height="40" rx="6" fill="#bae6fd"/><text x="75" y="110" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="265" y="20" width="110" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="265" y="150" width="110" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<rect x="510" y="85" width="110" height="40" rx="6" fill="#bae6fd"/><text x="565" y="110" text-anchor="middle" class="svg-ink" font-size="13">LEAF2 lo0</text>
<line x1="130" y1="95" x2="265" y2="45" stroke="#64748b" stroke-width="2"/><line x1="375" y1="45" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="130" y1="115" x2="265" y2="170" stroke="#64748b" stroke-width="2"/><line x1="375" y1="170" x2="510" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="185" y="60" class="svg-muted" font-size="12">40</text><text x="440" y="60" class="svg-muted" font-size="12">40</text>
<text x="185" y="160" class="svg-muted" font-size="12">40</text><text x="440" y="160" class="svg-muted" font-size="12">40</text>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">40 + 40 + 1 = 81 on both paths</text>
</svg><p class="cap">Two paths with the same total cost: both are installed. That is ECMP.</p></div>

<div class="eg"><p><b>Worked example: where does [110/81] come from?</b> In the lab the virtual links run at 1 Gbit/s. Cost per link = 40,000 Mbit/s ÷ 1,000 Mbit/s = 40. LEAF1 to LEAF2's loopback0: LEAF1 to SPINE1 (40) + SPINE1 to LEAF2 (40) + loopback (1) = <b>81</b>. The same via SPINE2 = 81. Equal, so both are installed. 110 is OSPF's administrative distance. On real 100G links the same route would show [110/3].</p></div>
<div class="tip"><p>If your fabric mixes 100G and 400G links, both cost 1 with the default reference and OSPF cannot prefer the faster one. Set <code>auto-cost reference-bandwidth 400 Gbps</code> under <code>router ospf UNDERLAY</code> on <b>every</b> switch, never on just some of them.</p></div>

<h3>Verification</h3>
<pre class="out">LEAF1# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 2
 Neighbor ID     Pri State            Up Time  Address         Interface
<span class="hl"> 10.255.0.11       1 FULL/ -          00:05:12 10.1.1.0        Eth1/1
 10.255.0.12       1 FULL/ -          00:05:09 10.1.2.0        Eth1/2</span></pre>
<p>Two neighbours, both FULL, dash for DR role: point-to-point is working. Now the routes:</p>
<pre class="out">LEAF1# show ip route ospf
IP Route Table for VRF "default"
10.2.1.0/31, ubest/mbest: 1/0
    *via 10.1.1.0, Eth1/1, [110/80], 00:05:01, ospf-UNDERLAY, intra
10.2.2.0/31, ubest/mbest: 1/0
    *via 10.1.2.0, Eth1/2, [110/80], 00:05:01, ospf-UNDERLAY, intra
<span class="hl">10.255.0.2/32, ubest/mbest: 2/0
    *via 10.1.1.0, Eth1/1, [110/81], 00:05:01, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 00:05:01, ospf-UNDERLAY, intra</span>
10.255.0.11/32, ubest/mbest: 1/0
    *via 10.1.1.0, Eth1/1, [110/41], 00:05:09, ospf-UNDERLAY, intra
10.255.0.12/32, ubest/mbest: 1/0
    *via 10.1.2.0, Eth1/2, [110/41], 00:05:09, ospf-UNDERLAY, intra</pre>
<p>Read it carefully: each spine loopback has one path (only one way to reach a spine directly), each remote link subnet has one path (it hangs off one spine), but the remote <b>leaf</b> loopback has <b>ubest 2</b>. That is the line the lab asks you about.</p>
<pre class="out">LEAF1# show ip ospf interface brief
 OSPF Process ID UNDERLAY VRF default
 Total number of interface: 3
 Interface               ID     Area            Cost   State    Neighbors Status
 Lo0                     1      0.0.0.0         1      LOOPBACK 0         up
<span class="hl"> Eth1/1                  2      0.0.0.0         40     P2P      1         up
 Eth1/2                  3      0.0.0.0         40     P2P      1         up</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>feature ospf</code> (the router command is rejected). Configuring point-to-point on one end only. Putting one uplink in a different area (the ticket lab). Forgetting to add loopback0 or loopback1 to OSPF. Changing the reference bandwidth on some switches but not others, which breaks ECMP.</p></div>
<div class="exam"><p><b>Exam tip.</b> NX-OS: <code>feature ospf</code>, <code>router ospf TAG</code>, interface-level <code>ip router ospf TAG area X</code>. Default reference bandwidth 40 Gbit/s. Point-to-point = no DR/BDR, shown as FULL/ -. Default OSPF maximum-paths on NX-OS is 8.</p></div>

<div class="scn"><h4>The 40-second bring-up</h4><p>A team noticed that after every leaf reload, the leaf took almost a minute before it carried traffic, while the server links were up in seconds. <code>show ip ospf neighbors</code> during the reload showed the uplinks sitting in the two-way state while the interfaces were still waiting for the DR election, then moving to FULL/DR or FULL/BDR. The network type had been left at the broadcast default, so each link waited through the DR election. Adding <code>ip ospf network point-to-point</code> on both ends of every fabric link cut OSPF bring-up to a couple of seconds.</p><p><b>Lesson:</b> on two-router links always use point-to-point. It is faster, simpler and produces a smaller database.</p></div>

<div class="iv"><p class="q">"How do you configure an OSPF underlay on Nexus, and why point-to-point?"</p><p>Strong answer: enable <code>feature ospf</code>, create <code>router ospf UNDERLAY</code> with an explicit router-ID from loopback0, then under each fabric interface set <code>ip ospf network point-to-point</code> and <code>ip router ospf UNDERLAY area 0.0.0.0</code>, and add the loopbacks to the same area. Point-to-point avoids DR/BDR election and its wait timer, removes type-2 LSAs and speeds up adjacency. Verify with <code>show ip ospf neighbors</code> (FULL/ -) and <code>show ip route</code> for a remote loopback showing one next hop per spine.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NX-OS needs <code>feature ospf</code>; interfaces join with <code>ip router ospf TAG area</code>, no network statements.</li>
<li>Point-to-point network type: no DR/BDR, FULL/ -, faster and simpler.</li>
<li>Set router-ID explicitly; add loopback0 and loopback1 to area 0.</li>
<li>Default reference bandwidth is 40 Gbit/s; change it consistently or not at all.</li>
<li>Success = two FULL neighbours and ubest 2 for each remote leaf loopback.</li>
</ul></div>
`,hi:`
<p>OSPF aise padosiyon ke group jaisa hai jo har koi apni gali ka map banata hai aur uski copy sabko deta hai. Kuch seconds baad har ghar ke paas same poora city map hota hai aur woh khud kahin bhi jaane ka sabse chhota raasta nikaal leta hai. Spine-leaf fabric mein OSPF sabse common underlay hai kyunki har network engineer ise pehle se jaanta hai, NX-OS har platform par ise support karta hai, aur sainkdon switches ke liye ek single area kaafi hai. Yeh chapter bilkul wahi configure karta hai jo module labs maangti hain.</p>

<h3>NX-OS par building blocks</h3>
<p>NX-OS classic IOS se teen tarah alag hai jo aapko yaad rakhne hain:</p>
<ul>
<li><b>Features enable karne tak off rehte hain.</b> Sabse pehle <code>feature ospf</code> aana chahiye, warna <code>router ospf</code> command exist hi nahi karta.</li>
<li><b>Process ka naam (tag) hota hai</b>, sirf number nahi. Labs <code>router ospf UNDERLAY</code> use karti hain, aur routes <code>ospf-UNDERLAY</code> ki tarah dikhte hain.</li>
<li><b>Interfaces seedha OSPF join karte hain</b> <code>ip router ospf UNDERLAY area 0.0.0.0</code> se. Process ke neeche koi <code>network</code> statement nahi hota. Yeh precise hai: sirf woh interfaces advertise hote hain jinka aap naam lete ho.</li>
</ul>

<h3>Network type point-to-point kyun</h3>
<p>Ethernet interfaces default mein OSPF <b>broadcast</b> network type par hote hain. Broadcast segment par OSPF ek <b>designated router (DR)</b> aur backup (BDR) elect karta hai taaki shared LAN par bahut saare routers sab ek dusre se adjacency na banayein. Fabric link par exactly do routers hote hain, isliye election sirf overhead hai:</p>
<ul>
<li>Election adjacency poori hone se pehle <b>wait timer</b> (dead interval ke barabar, default 40 seconds) tak ruk sakta hai, jisse bring-up slow hota hai.</li>
<li>DR har link ke liye ek extra <b>type-2 network LSA</b> originate karta hai, jisse database mein objects double ho jaate hain.</li>
<li>OSPF tree padhna zyada complex ho jaata hai.</li>
</ul>
<p><code>ip ospf network point-to-point</code> yeh sab hata deta hai: koi DR ya BDR nahi, neighbours seedha FULL par jaate hain, aur link router LSA mein ek simple point-to-point connection ki tarah dikhta hai. <code>show ip ospf neighbors</code> mein aapko <code>FULL/ -</code> dikhega: FULL, aur jahan DR role hota wahan dash. Dono ends ko same type use karna chahiye.</p>

<h3>Configuration: lab task, line by line</h3>
<pre class="code"><span class="c">! LEAF1 (addresses pehle se configured)</span>
feature ospf
router ospf UNDERLAY
  router-id 10.255.0.1
  log-adjacency-changes
<span class="c">! SPINE1 ki taraf uplink</span>
interface Ethernet1/1
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
<span class="c">! SPINE2 ki taraf uplink</span>
interface Ethernet1/2
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
<span class="c">! Router-ID loopback (aur VXLAN aane par VTEP ke liye loopback1)</span>
interface loopback0
  ip router ospf UNDERLAY area 0.0.0.0
end
copy running-config startup-config</pre>
<p>Har piece par notes:</p>
<ul>
<li><b>router-id</b>: ise explicitly loopback0 par set karo. Agar nahi karoge, NX-OS apne aap ek address choose karta hai, aur baad ka koi change restart ke baad use badal sakta hai.</li>
<li><b>area 0.0.0.0</b>: dotted form mein area 0. NX-OS <code>area 0</code> bhi accept karta hai aur use 0.0.0.0 dikhata hai. Poora fabric backbone area mein baitha hai.</li>
<li><b>Loopbacks</b>: OSPF loopback ko hamesha /32 host route ki tarah advertise karta hai aur us par kabhi hellos nahi bhejta, isliye loopback ko network type nahi chahiye aur us par kabhi neighbour nahi banta.</li>
</ul>

<h3>Passive interfaces</h3>
<p><b>Passive</b> interface OSPF mein advertise hota hai lekin hellos nahi bhejta, isliye us par koi neighbour nahi ban sakta. Loopbacks par iski zaroorat nahi, woh apne aap passive hote hain. Ise aap kisi bhi aise routed interface par use karte ho jiska subnet reachable hona chahiye lekin jahan kabhi OSPF neighbour nahi aana chahiye, jaise border leaf par ek routed link jo aise device ki taraf hai jo OSPF nahi chalata:</p>
<pre class="code">interface Ethernet1/48
  ip router ospf UNDERLAY area 0.0.0.0
  ip ospf passive-interface</pre>

<h3>Cost aur route table ke numbers</h3>
<p>OSPF cost = reference bandwidth ÷ interface bandwidth. NX-OS par default reference bandwidth <b>40 Gbit/s</b> hai. Isliye 1G interface ki cost 40, 10G ki 4, aur 40G, 100G aur 400G sabki cost 1 (minimum) hai. Loopback ki cost 1 hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="LEAF1 se LEAF2 loopback tak OSPF cost">
<rect x="20" y="85" width="110" height="40" rx="6" fill="#bae6fd"/><text x="75" y="110" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="265" y="20" width="110" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="265" y="150" width="110" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<rect x="510" y="85" width="110" height="40" rx="6" fill="#bae6fd"/><text x="565" y="110" text-anchor="middle" class="svg-ink" font-size="13">LEAF2 lo0</text>
<line x1="130" y1="95" x2="265" y2="45" stroke="#64748b" stroke-width="2"/><line x1="375" y1="45" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="130" y1="115" x2="265" y2="170" stroke="#64748b" stroke-width="2"/><line x1="375" y1="170" x2="510" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="185" y="60" class="svg-muted" font-size="12">40</text><text x="440" y="60" class="svg-muted" font-size="12">40</text>
<text x="185" y="160" class="svg-muted" font-size="12">40</text><text x="440" y="160" class="svg-muted" font-size="12">40</text>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">Dono paths par 40 + 40 + 1 = 81</text>
</svg><p class="cap">Same total cost wale do paths: dono install hote hain. Yahi ECMP hai.</p></div>

<div class="eg"><p><b>Worked example: [110/81] kahan se aata hai?</b> Lab mein virtual links 1 Gbit/s par chalte hain. Har link ki cost = 40,000 Mbit/s ÷ 1,000 Mbit/s = 40. LEAF1 se LEAF2 ke loopback0 tak: LEAF1 se SPINE1 (40) + SPINE1 se LEAF2 (40) + loopback (1) = <b>81</b>. SPINE2 ke through bhi = 81. Barabar hai, isliye dono install hote hain. 110 OSPF ka administrative distance hai. Real 100G links par yahi route [110/3] dikhayega.</p></div>
<div class="tip"><p>Agar aapke fabric mein 100G aur 400G links mix hain, to default reference ke saath dono ki cost 1 hai aur OSPF tez wale ko prefer nahi kar sakta. <code>router ospf UNDERLAY</code> ke neeche <code>auto-cost reference-bandwidth 400 Gbps</code> <b>har</b> switch par set karo, kabhi sirf kuch par nahi.</p></div>

<h3>Verification</h3>
<pre class="out">LEAF1# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 2
 Neighbor ID     Pri State            Up Time  Address         Interface
<span class="hl"> 10.255.0.11       1 FULL/ -          00:05:12 10.1.1.0        Eth1/1
 10.255.0.12       1 FULL/ -          00:05:09 10.1.2.0        Eth1/2</span></pre>
<p>Do neighbours, dono FULL, DR role ki jagah dash: point-to-point kaam kar raha hai. Ab routes:</p>
<pre class="out">LEAF1# show ip route ospf
IP Route Table for VRF "default"
10.2.1.0/31, ubest/mbest: 1/0
    *via 10.1.1.0, Eth1/1, [110/80], 00:05:01, ospf-UNDERLAY, intra
10.2.2.0/31, ubest/mbest: 1/0
    *via 10.1.2.0, Eth1/2, [110/80], 00:05:01, ospf-UNDERLAY, intra
<span class="hl">10.255.0.2/32, ubest/mbest: 2/0
    *via 10.1.1.0, Eth1/1, [110/81], 00:05:01, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 00:05:01, ospf-UNDERLAY, intra</span>
10.255.0.11/32, ubest/mbest: 1/0
    *via 10.1.1.0, Eth1/1, [110/41], 00:05:09, ospf-UNDERLAY, intra
10.255.0.12/32, ubest/mbest: 1/0
    *via 10.1.2.0, Eth1/2, [110/41], 00:05:09, ospf-UNDERLAY, intra</pre>
<p>Dhyan se padho: har spine loopback ka ek path hai (spine tak directly pahunchne ka ek hi raasta), har remote link subnet ka ek path hai (woh ek spine se juda hai), lekin remote <b>leaf</b> loopback ka <b>ubest 2</b> hai. Lab isi line ke baare mein poochti hai.</p>
<pre class="out">LEAF1# show ip ospf interface brief
 OSPF Process ID UNDERLAY VRF default
 Total number of interface: 3
 Interface               ID     Area            Cost   State    Neighbors Status
 Lo0                     1      0.0.0.0         1      LOOPBACK 0         up
<span class="hl"> Eth1/1                  2      0.0.0.0         40     P2P      1         up
 Eth1/2                  3      0.0.0.0         40     P2P      1         up</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> <code>feature ospf</code> bhool jaana (router command reject ho jaata hai). Sirf ek end par point-to-point configure karna. Ek uplink ko alag area mein daal dena (ticket lab). loopback0 ya loopback1 ko OSPF mein add karna bhool jaana. Kuch switches par reference bandwidth badalna aur baaki par nahi, jo ECMP tod deta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> NX-OS: <code>feature ospf</code>, <code>router ospf TAG</code>, interface-level <code>ip router ospf TAG area X</code>. Default reference bandwidth 40 Gbit/s. Point-to-point = koi DR/BDR nahi, FULL/ - dikhta hai. NX-OS par default OSPF maximum-paths 8 hai.</p></div>

<div class="scn"><h4>40-second wala bring-up</h4><p>Ek team ne notice kiya ki har leaf reload ke baad leaf ko traffic le jaane mein lagbhag ek minute lagta tha, jabki server links seconds mein up ho jaate the. Reload ke dauraan <code>show ip ospf neighbors</code> mein uplinks two-way state mein baithe dikh rahe the jab tak interfaces DR election ka wait kar rahe the, phir FULL/DR ya FULL/BDR par ja rahe the. Network type broadcast default par chhoda gaya tha, isliye har link DR election se guzar raha tha. Har fabric link ke dono ends par <code>ip ospf network point-to-point</code> jodne se OSPF bring-up do-teen seconds ka ho gaya.</p><p><b>Seekh:</b> do-router links par hamesha point-to-point use karo. Yeh tez hai, simple hai aur chhota database banata hai.</p></div>

<div class="iv"><p class="q">"Nexus par OSPF underlay kaise configure karte ho, aur point-to-point kyun?"</p><p>Strong answer: <code>feature ospf</code> enable karo, loopback0 se explicit router-ID ke saath <code>router ospf UNDERLAY</code> banao, phir har fabric interface ke neeche <code>ip ospf network point-to-point</code> aur <code>ip router ospf UNDERLAY area 0.0.0.0</code> set karo, aur loopbacks ko same area mein add karo. Point-to-point DR/BDR election aur uske wait timer se bachata hai, type-2 LSAs hata deta hai aur adjacency tez karta hai. <code>show ip ospf neighbors</code> (FULL/ -) aur remote loopback ke liye <code>show ip route</code> se verify karo jismein har spine ka ek next hop dikhe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NX-OS ko <code>feature ospf</code> chahiye; interfaces <code>ip router ospf TAG area</code> se join karte hain, network statements nahi.</li>
<li>Point-to-point network type: koi DR/BDR nahi, FULL/ -, tez aur simple.</li>
<li>Router-ID explicitly set karo; loopback0 aur loopback1 ko area 0 mein add karo.</li>
<li>Default reference bandwidth 40 Gbit/s hai; ise consistently badlo ya bilkul mat badlo.</li>
<li>Success = do FULL neighbours aur har remote leaf loopback ke liye ubest 2.</li>
</ul></div>
`}};export{e as default};