var e={id:`ebgp`,h:{en:`eBGP underlay: ASN schemes, allowas-in and maximum-paths`,hi:`eBGP underlay: ASN schemes, allowas-in aur maximum-paths`},body:{en:`
<p>OSPF and IS-IS work like one big family sharing a single map. eBGP works like neighbouring countries: each country keeps its own map private and only tells its neighbours "these destinations are reachable through me, and here is the list of countries on the way". The largest data centers in the world run their underlay this way, a design written down in <b>RFC 7938</b> ("Use of BGP for Routing in Large-Scale Data Centers"). In this chapter you will learn why, how the AS numbers are chosen, and the two knobs that trip up almost everyone: <code>allowas-in</code> and <code>maximum-paths</code>.</p>

<h3>Why use BGP as an underlay?</h3>
<ul>
<li><b>One protocol for everything.</b> If the overlay already uses BGP EVPN, running BGP in the underlay too means one set of skills, one set of show commands and one routing process to monitor.</li>
<li><b>No flooding.</b> A link-state IGP floods every change to every switch. BGP sends only best paths to direct neighbours, so a flapping link affects fewer devices.</li>
<li><b>Policy.</b> Route-maps, communities and AS-path filters give fine control over what each switch advertises.</li>
<li><b>Scale.</b> BGP comfortably handles thousands of switches, which is why hyperscalers chose it.</li>
</ul>
<p>The trade-offs: more configuration per device (one neighbour statement per link), slower default timers, and more concepts for a junior engineer to learn.</p>

<h3>ASN schemes</h3>
<p>Private AS numbers are used: 64512 to 65534 (2-byte), or 4200000000 to 4294967294 (4-byte) when you need many.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="RFC 7938 ASN scheme">
<rect x="150" y="15" width="130" height="44" rx="6" fill="#ddd6fe"/><text x="215" y="35" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text><text x="215" y="51" text-anchor="middle" class="svg-accent" font-size="12">AS 65000</text>
<rect x="360" y="15" width="130" height="44" rx="6" fill="#ddd6fe"/><text x="425" y="35" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text><text x="425" y="51" text-anchor="middle" class="svg-accent" font-size="12">AS 65000</text>
<rect x="20" y="160" width="130" height="44" rx="6" fill="#bae6fd"/><text x="85" y="180" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="85" y="196" text-anchor="middle" class="svg-accent" font-size="12">AS 65001</text>
<rect x="175" y="160" width="130" height="44" rx="6" fill="#bae6fd"/><text x="240" y="180" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text><text x="240" y="196" text-anchor="middle" class="svg-accent" font-size="12">AS 65002</text>
<rect x="335" y="160" width="130" height="44" rx="6" fill="#bae6fd"/><text x="400" y="180" text-anchor="middle" class="svg-ink" font-size="13">LEAF3</text><text x="400" y="196" text-anchor="middle" class="svg-accent" font-size="12">AS 65003</text>
<rect x="490" y="160" width="130" height="44" rx="6" fill="#bae6fd"/><text x="555" y="180" text-anchor="middle" class="svg-ink" font-size="13">LEAF4</text><text x="555" y="196" text-anchor="middle" class="svg-accent" font-size="12">AS 65004</text>
<line x1="215" y1="59" x2="85" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="215" y1="59" x2="240" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="215" y1="59" x2="400" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="215" y1="59" x2="555" y2="160" stroke="#64748b" stroke-width="1.5"/>
<line x1="425" y1="59" x2="85" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="425" y1="59" x2="240" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="425" y1="59" x2="400" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="425" y1="59" x2="555" y2="160" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Scheme A: spines share one ASN, every leaf has its own. One eBGP session per physical link.</p></div>

<table class="cmp"><tr><th>Scheme</th><th>How it works</th><th>Extra knobs</th></tr>
<tr><td><b>A: spines share, leaves unique</b> (RFC 7938 style)</td><td>LEAF1 learns LEAF2's loopback via SPINE1 and SPINE2, both with AS path 65000 65002: identical, so standard BGP multipath accepts both. Spine-to-spine detours are blocked because a spine rejects paths containing its own AS 65000.</td><td>Only <code>maximum-paths</code></td></tr>
<tr><td><b>B: all leaves share one ASN</b></td><td>LEAF2 (AS 65100) receives LEAF1's routes with path 65000 65100. Its own AS is in the path, so BGP loop prevention drops them.</td><td><code>allowas-in</code> on leaves; on NX-OS spines also <code>disable-peer-as-check</code> (NX-OS does not send a route to a peer whose AS is already in the path)</td></tr>
<tr><td><b>C: every spine unique too</b></td><td>Paths via different spines have different AS paths (65011 65002 versus 65012 65002).</td><td><code>bestpath as-path multipath-relax</code> plus <code>maximum-paths</code></td></tr>
</table>
<p>Scheme A is the most common because it needs the fewest exceptions to normal BGP behaviour. Scheme B saves AS numbers and simplifies templates, but every <code>allowas-in</code> weakens loop protection, so use it knowingly.</p>

<h3>maximum-paths: the knob everyone forgets</h3>
<p>OSPF on NX-OS installs up to 8 equal paths by default. <b>BGP installs only 1</b> unless told otherwise. Without <code>maximum-paths</code> an eBGP underlay silently uses one spine only. Set it on leaves and spines under the IPv4 unicast address family.</p>

<h3>Configuration (scheme A)</h3>
<pre class="code"><span class="c">! LEAF1, AS 65001</span>
feature bgp
router bgp 65001
  router-id 10.255.0.1
  log-neighbor-changes
  address-family ipv4 unicast
    network 10.255.0.1/32
    network 10.254.0.1/32
    maximum-paths 64
  neighbor 10.1.1.0
    remote-as 65000
    description SPINE1
    address-family ipv4 unicast
  neighbor 10.1.2.0
    remote-as 65000
    description SPINE2
    address-family ipv4 unicast

<span class="c">! SPINE1, AS 65000 (one neighbour per leaf link)</span>
router bgp 65000
  router-id 10.255.0.11
  address-family ipv4 unicast
    network 10.255.0.11/32
    maximum-paths 64
  neighbor 10.1.1.1
    remote-as 65001
    address-family ipv4 unicast
  neighbor 10.2.1.1
    remote-as 65002
    address-family ipv4 unicast</pre>
<p>For scheme B the leaf neighbours would add <code>allowas-in</code> under <code>address-family ipv4 unicast</code>, and each spine neighbour would add <code>disable-peer-as-check</code>. In real fabrics, <code>template peer</code> and <code>inherit peer</code> keep the repeated lines short.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show bgp ipv4 unicast summary
BGP router identifier 10.255.0.1, local AS number 65001
Neighbor        V    AS    MsgRcvd    MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.1.1.0        4 65000         42         40       12    0    0 00:10:02 7
10.1.2.0        4 65000         41         40       12    0    0 00:10:01 7</span>

LEAF1# show ip route 10.255.0.2
10.255.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, [20/0], 00:09:55, bgp-65001, external, tag 65000
    *via 10.1.2.0, [20/0], 00:09:55, bgp-65001, external, tag 65000</span></pre>
<p>A number (not "Idle" or "Active") in the State/PfxRcd column means the session is Established and shows prefixes received. Administrative distance 20 is eBGP. ubest 2 proves multipath is working.</p>

<div class="eg"><p><b>Worked example: session count.</b> With an eBGP underlay every physical link is a BGP session. 4 spines × 32 leaves = 128 links = 128 sessions, 4 per leaf, 32 per spine. With OSPF the same fabric has 128 adjacencies too, but configuration is one interface line instead of a neighbour block. That is the operational cost you accept for BGP's policy and containment.</p></div>

<h3>IGP versus eBGP underlay</h3>
<table class="cmp"><tr><th></th><th>OSPF / IS-IS</th><th>eBGP</th></tr>
<tr><td>Config per link</td><td>Two interface lines</td><td>A neighbour block (templates help)</td></tr>
<tr><td>Default ECMP</td><td>Yes (8 on NX-OS OSPF)</td><td>No, needs maximum-paths</td></tr>
<tr><td>Failure detection</td><td>Hello/dead, plus BFD</td><td>Link-down fallover; keepalive 60/hold 180, so BFD strongly advised</td></tr>
<tr><td>Change propagation</td><td>Flooded to all</td><td>Best paths to neighbours only</td></tr>
<tr><td>Overlay pairing</td><td>iBGP EVPN on spines as RR</td><td>EVPN often eBGP too, multihop between loopbacks</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>maximum-paths</code>. Giving leaves the same ASN without <code>allowas-in</code> (routes silently rejected). Forgetting to advertise loopback1 with a <code>network</code> statement. Relying on 180-second hold time with no BFD.</p></div>
<div class="exam"><p><b>Exam tip.</b> RFC 7938: spines share an ASN, each leaf unique. BGP default maximum-paths = 1. Leaves sharing an ASN need allowas-in (and on NX-OS spines, disable-peer-as-check). Different spine ASNs need bestpath as-path multipath-relax. eBGP AD = 20.</p></div>

<div class="scn"><h4>Half the leaves could not see each other</h4><p>A fabric was built with all leaves in AS 65100 to simplify templates. LEAF1 could reach both spines, but <code>show ip route 10.255.0.2</code> on LEAF1 returned nothing. <code>show bgp ipv4 unicast neighbors 10.1.1.0 advertised-routes</code> on SPINE1 showed that the spine was not even sending LEAF2's loopback to LEAF1. The fix had two halves: <code>disable-peer-as-check</code> for the leaf neighbours on both spines, and <code>allowas-in</code> on every leaf. Loopbacks then appeared with two paths each.</p><p><b>Lesson:</b> when leaves share an ASN you must override loop prevention on both sides. Scheme A avoids the problem entirely.</p></div>

<div class="iv"><p class="q">"Design an eBGP underlay. How do you assign ASNs and get ECMP?"</p><p>Strong answer: follow RFC 7938: one ASN for all spines, a unique private ASN per leaf (4-byte range if needed), one eBGP session per physical link using the /31 addresses, advertise lo0 and lo1 with network statements, and set maximum-paths on all switches because BGP defaults to one path. Identical AS paths through each spine give multipath without multipath-relax. Add BFD for fast detection. Mention the alternative where leaves share an ASN and the allowas-in / disable-peer-as-check consequences.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>eBGP underlays (RFC 7938) trade more configuration for policy, containment and one-protocol operations.</li>
<li>Most common scheme: spines share one ASN, each leaf gets its own.</li>
<li>BGP installs one path by default: always configure maximum-paths.</li>
<li>Shared leaf ASN needs allowas-in (and disable-peer-as-check on NX-OS spines); unique spine ASNs need multipath-relax.</li>
<li>Default BGP timers are slow; pair the underlay with BFD.</li>
</ul></div>
`,hi:`
<p>OSPF aur IS-IS ek bade parivaar ki tarah kaam karte hain jo ek hi map share karta hai. eBGP padosi deshon ki tarah kaam karta hai: har desh apna map private rakhta hai aur apne padosiyon ko sirf batata hai "yeh destinations mere through reachable hain, aur raaste mein aane wale deshon ki list yeh hai". Duniya ke sabse bade data centers apna underlay isi tarah chalate hain, ek design jo <b>RFC 7938</b> ("Use of BGP for Routing in Large-Scale Data Centers") mein likha gaya hai. Is chapter mein aap seekhoge kyun, AS numbers kaise choose hote hain, aur woh do knobs jo lagbhag sabko fansaate hain: <code>allowas-in</code> aur <code>maximum-paths</code>.</p>

<h3>BGP ko underlay ki tarah kyun use karein?</h3>
<ul>
<li><b>Sab kuch ke liye ek protocol.</b> Agar overlay pehle se BGP EVPN use karta hai, to underlay mein bhi BGP chalane ka matlab hai skills ka ek set, show commands ka ek set aur monitor karne ke liye ek routing process.</li>
<li><b>Koi flooding nahi.</b> Link-state IGP har change ko har switch tak flood karta hai. BGP sirf best paths direct neighbours ko bhejta hai, isliye flap hota link kam devices ko affect karta hai.</li>
<li><b>Policy.</b> Route-maps, communities aur AS-path filters is par fine control dete hain ki har switch kya advertise kare.</li>
<li><b>Scale.</b> BGP hazaron switches aaram se handle karta hai, isiliye hyperscalers ne ise chuna.</li>
</ul>
<p>Trade-offs: har device par zyada configuration (har link ke liye ek neighbour statement), slow default timers, aur junior engineer ke liye seekhne ko zyada concepts.</p>

<h3>ASN schemes</h3>
<p>Private AS numbers use hote hain: 64512 se 65534 (2-byte), ya jab bahut chahiye to 4200000000 se 4294967294 (4-byte).</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="RFC 7938 ASN scheme">
<rect x="150" y="15" width="130" height="44" rx="6" fill="#ddd6fe"/><text x="215" y="35" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text><text x="215" y="51" text-anchor="middle" class="svg-accent" font-size="12">AS 65000</text>
<rect x="360" y="15" width="130" height="44" rx="6" fill="#ddd6fe"/><text x="425" y="35" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text><text x="425" y="51" text-anchor="middle" class="svg-accent" font-size="12">AS 65000</text>
<rect x="20" y="160" width="130" height="44" rx="6" fill="#bae6fd"/><text x="85" y="180" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="85" y="196" text-anchor="middle" class="svg-accent" font-size="12">AS 65001</text>
<rect x="175" y="160" width="130" height="44" rx="6" fill="#bae6fd"/><text x="240" y="180" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text><text x="240" y="196" text-anchor="middle" class="svg-accent" font-size="12">AS 65002</text>
<rect x="335" y="160" width="130" height="44" rx="6" fill="#bae6fd"/><text x="400" y="180" text-anchor="middle" class="svg-ink" font-size="13">LEAF3</text><text x="400" y="196" text-anchor="middle" class="svg-accent" font-size="12">AS 65003</text>
<rect x="490" y="160" width="130" height="44" rx="6" fill="#bae6fd"/><text x="555" y="180" text-anchor="middle" class="svg-ink" font-size="13">LEAF4</text><text x="555" y="196" text-anchor="middle" class="svg-accent" font-size="12">AS 65004</text>
<line x1="215" y1="59" x2="85" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="215" y1="59" x2="240" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="215" y1="59" x2="400" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="215" y1="59" x2="555" y2="160" stroke="#64748b" stroke-width="1.5"/>
<line x1="425" y1="59" x2="85" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="425" y1="59" x2="240" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="425" y1="59" x2="400" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="425" y1="59" x2="555" y2="160" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Scheme A: spines ek ASN share karte hain, har leaf ka apna. Har physical link par ek eBGP session.</p></div>

<table class="cmp"><tr><th>Scheme</th><th>Kaise kaam karta hai</th><th>Extra knobs</th></tr>
<tr><td><b>A: spines share, leaves unique</b> (RFC 7938 style)</td><td>LEAF1, LEAF2 ka loopback SPINE1 aur SPINE2 dono se seekhta hai, dono ka AS path 65000 65002: identical, isliye standard BGP multipath dono accept karta hai. Spine-to-spine detours block hote hain kyunki spine apne AS 65000 wale paths reject karta hai.</td><td>Sirf <code>maximum-paths</code></td></tr>
<tr><td><b>B: saare leaves ek ASN share karein</b></td><td>LEAF2 (AS 65100) ko LEAF1 ke routes path 65000 65100 ke saath milte hain. Uska apna AS path mein hai, isliye BGP loop prevention unhe drop kar deta hai.</td><td>Leaves par <code>allowas-in</code>; NX-OS spines par <code>disable-peer-as-check</code> bhi (NX-OS us peer ko route nahi bhejta jiska AS pehle se path mein hai)</td></tr>
<tr><td><b>C: har spine bhi unique</b></td><td>Alag spines ke through paths ke AS paths alag hote hain (65011 65002 versus 65012 65002).</td><td><code>bestpath as-path multipath-relax</code> plus <code>maximum-paths</code></td></tr>
</table>
<p>Scheme A sabse common hai kyunki ise normal BGP behaviour mein sabse kam exceptions chahiye. Scheme B AS numbers bachata hai aur templates simple karta hai, lekin har <code>allowas-in</code> loop protection ko kamzor karta hai, isliye ise soch samajh kar use karo.</p>

<h3>maximum-paths: woh knob jo sab bhoolte hain</h3>
<p>NX-OS par OSPF default mein 8 equal paths tak install karta hai. <b>BGP sirf 1 install karta hai</b> jab tak bataya na jaaye. <code>maximum-paths</code> ke bina eBGP underlay chupchaap sirf ek spine use karta hai. Ise leaves aur spines dono par IPv4 unicast address family ke neeche set karo.</p>

<h3>Configuration (scheme A)</h3>
<pre class="code"><span class="c">! LEAF1, AS 65001</span>
feature bgp
router bgp 65001
  router-id 10.255.0.1
  log-neighbor-changes
  address-family ipv4 unicast
    network 10.255.0.1/32
    network 10.254.0.1/32
    maximum-paths 64
  neighbor 10.1.1.0
    remote-as 65000
    description SPINE1
    address-family ipv4 unicast
  neighbor 10.1.2.0
    remote-as 65000
    description SPINE2
    address-family ipv4 unicast

<span class="c">! SPINE1, AS 65000 (har leaf link par ek neighbour)</span>
router bgp 65000
  router-id 10.255.0.11
  address-family ipv4 unicast
    network 10.255.0.11/32
    maximum-paths 64
  neighbor 10.1.1.1
    remote-as 65001
    address-family ipv4 unicast
  neighbor 10.2.1.1
    remote-as 65002
    address-family ipv4 unicast</pre>
<p>Scheme B ke liye leaf neighbours <code>address-family ipv4 unicast</code> ke neeche <code>allowas-in</code> jodenge, aur har spine neighbour <code>disable-peer-as-check</code> jodega. Real fabrics mein <code>template peer</code> aur <code>inherit peer</code> repeat hone wali lines ko chhota rakhte hain.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show bgp ipv4 unicast summary
BGP router identifier 10.255.0.1, local AS number 65001
Neighbor        V    AS    MsgRcvd    MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.1.1.0        4 65000         42         40       12    0    0 00:10:02 7
10.1.2.0        4 65000         41         40       12    0    0 00:10:01 7</span>

LEAF1# show ip route 10.255.0.2
10.255.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, [20/0], 00:09:55, bgp-65001, external, tag 65000
    *via 10.1.2.0, [20/0], 00:09:55, bgp-65001, external, tag 65000</span></pre>
<p>State/PfxRcd column mein number ("Idle" ya "Active" nahi) ka matlab hai session Established hai aur received prefixes dikha raha hai. Administrative distance 20 eBGP hai. ubest 2 prove karta hai ki multipath kaam kar raha hai.</p>

<div class="eg"><p><b>Worked example: session count.</b> eBGP underlay mein har physical link ek BGP session hai. 4 spines × 32 leaves = 128 links = 128 sessions, har leaf par 4, har spine par 32. OSPF ke saath bhi same fabric mein 128 adjacencies hoti hain, lekin configuration neighbour block ki jagah ek interface line hai. Yahi woh operational cost hai jo aap BGP ki policy aur containment ke liye accept karte ho.</p></div>

<h3>IGP versus eBGP underlay</h3>
<table class="cmp"><tr><th></th><th>OSPF / IS-IS</th><th>eBGP</th></tr>
<tr><td>Har link par config</td><td>Do interface lines</td><td>Ek neighbour block (templates madad karte hain)</td></tr>
<tr><td>Default ECMP</td><td>Haan (NX-OS OSPF par 8)</td><td>Nahi, maximum-paths chahiye</td></tr>
<tr><td>Failure detection</td><td>Hello/dead, plus BFD</td><td>Link-down fallover; keepalive 60/hold 180, isliye BFD strongly advised</td></tr>
<tr><td>Change propagation</td><td>Sabko flood</td><td>Sirf neighbours ko best paths</td></tr>
<tr><td>Overlay pairing</td><td>Spines par RR ke saath iBGP EVPN</td><td>EVPN aksar eBGP bhi, loopbacks ke beech multihop</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> <code>maximum-paths</code> bhool jaana. Leaves ko same ASN dena bina <code>allowas-in</code> ke (routes chupchaap reject). loopback1 ko <code>network</code> statement se advertise karna bhool jaana. BFD ke bina 180-second hold time par bharosa karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> RFC 7938: spines ek ASN share karte hain, har leaf unique. BGP default maximum-paths = 1. Same ASN share karne wale leaves ko allowas-in chahiye (aur NX-OS spines par disable-peer-as-check). Alag spine ASNs ko bestpath as-path multipath-relax chahiye. eBGP AD = 20.</p></div>

<div class="scn"><h4>Aadhe leaves ek dusre ko nahi dekh paa rahe the</h4><p>Templates simple karne ke liye ek fabric ke saare leaves AS 65100 mein banaye gaye. LEAF1 dono spines tak pahunch sakta tha, lekin LEAF1 par <code>show ip route 10.255.0.2</code> kuch return nahi karta tha. SPINE1 par <code>show bgp ipv4 unicast neighbors 10.1.1.0 advertised-routes</code> ne dikhaya ki spine LEAF2 ka loopback LEAF1 ko bhej hi nahi raha tha. Fix ke do hisse the: dono spines par leaf neighbours ke liye <code>disable-peer-as-check</code>, aur har leaf par <code>allowas-in</code>. Uske baad loopbacks do-do paths ke saath dikhne lage.</p><p><b>Seekh:</b> jab leaves ASN share karte hain to aapko dono sides par loop prevention override karna padta hai. Scheme A is problem se poori tarah bachata hai.</p></div>

<div class="iv"><p class="q">"Ek eBGP underlay design karo. ASNs kaise assign karoge aur ECMP kaise paoge?"</p><p>Strong answer: RFC 7938 follow karo: saare spines ke liye ek ASN, har leaf ke liye unique private ASN (zaroorat ho to 4-byte range), /31 addresses use karke har physical link par ek eBGP session, lo0 aur lo1 ko network statements se advertise karo, aur saare switches par maximum-paths set karo kyunki BGP default mein ek path leta hai. Har spine ke through identical AS paths bina multipath-relax ke multipath dete hain. Fast detection ke liye BFD jodo. Us alternative ka zikr karo jahan leaves ASN share karte hain aur allowas-in / disable-peer-as-check ke consequences.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>eBGP underlays (RFC 7938) zyada configuration ke badle policy, containment aur one-protocol operations dete hain.</li>
<li>Sabse common scheme: spines ek ASN share karte hain, har leaf ko apna milta hai.</li>
<li>BGP default mein ek path install karta hai: hamesha maximum-paths configure karo.</li>
<li>Shared leaf ASN ko allowas-in chahiye (aur NX-OS spines par disable-peer-as-check); unique spine ASNs ko multipath-relax chahiye.</li>
<li>Default BGP timers slow hain; underlay ko BFD ke saath pair karo.</li>
</ul></div>
`}};export{e as default};