var e={id:`changing-ad`,h:{en:`Changing AD per protocol, per source and per prefix`,hi:`AD badalna: per protocol, per source aur per prefix`},body:{en:`
<p>Back to our newspaper editor. Usually the staff reporter is trusted more than the agency. But for one topic, say cricket, the agency has a specialist on the ground, so she decides: "for cricket stories from that agency, trust them more than usual." Routers allow exactly this. You can change the trust score for a whole protocol, for one route type, for routes from one source, or for one prefix from one source. The <code>distance</code> command is your tool, and every form of it is exam material.</p>

<h3>Rule zero: AD is local</h3>
<p>Changing AD on BR1 changes only which route BR1 installs. Neighbours never learn the new value. That is powerful (you can fix one router without touching others) and dangerous (two routers can now disagree about the best path and forward traffic to each other).</p>

<h3>EIGRP</h3>
<pre class="code"><span class="c">! classic mode: internal and external separately</span>
router eigrp 100
 distance eigrp 90 175
<span class="c">! per source: internal routes learned from neighbour 10.1.1.1 get AD 95</span>
 distance 95 10.1.1.1 0.0.0.0
<span class="c">! named mode: the same idea under the topology</span>
router eigrp NK
 address-family ipv4 unicast autonomous-system 100
  topology base
   distance eigrp 90 175</pre>
<p>In EIGRP the source address in the per-source form is the <b>neighbour's interface address</b>, and that form applies to <b>internal</b> routes. To change external routes, use <code>distance eigrp</code>.</p>

<h3>OSPF</h3>
<pre class="code">router ospf 1
<span class="c">! by route type</span>
 distance ospf intra-area 110 inter-area 110 external 171
<span class="c">! everything from this process</span>
 distance 115
<span class="c">! per source: routes whose LSA was originated by router ID 2.2.2.2</span>
 distance 171 2.2.2.2 0.0.0.0</pre>
<p>This is the classic trap: in OSPF the per-source address is the <b>router ID of the router that originated the LSA</b> (the Advertising Router), not the neighbour's interface address. OSPF routes are computed from the LSDB, so the "source" of an external route is the ASBR that created the type-5 LSA.</p>

<h3>BGP, RIP and static</h3>
<pre class="code">router bgp 65001
 distance bgp 20 200 200        <span class="c">! external internal local</span>
router rip
 distance 120
ip route 10.200.10.0 255.255.255.0 192.0.2.1 250   <span class="c">! per static route</span></pre>

<h3>Per prefix: add an ACL</h3>
<p>Every per-source form accepts an optional standard ACL that selects <b>which prefixes</b> get the new AD. A wildcard of 255.255.255.255 on the source means "from any source".</p>
<pre class="code">access-list 50 permit 192.168.50.0 0.0.0.255
router ospf 1
<span class="c">! only 192.168.50.0/24 from the two boundary routers gets AD 171</span>
 distance 171 1.1.1.1 0.0.0.0 50
 distance 171 2.2.2.2 0.0.0.0 50</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="AD tuning on BR1">
<rect x="20" y="30" width="270" height="150" rx="10" fill="#fed7aa"/>
<text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="14">BR1 before</text>
<text x="40" y="90" class="svg-ink" font-size="13">D EX 192.168.50.0/24  AD 170</text>
<text x="40" y="115" class="svg-accent" font-size="13">O E2 192.168.50.0/24  AD 110 (wins)</text>
<text x="40" y="150" class="svg-muted" font-size="12">path: O1, BR2, E1 (3 hops)</text>
<rect x="350" y="30" width="270" height="150" rx="10" fill="#bbf7d0"/>
<text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="14">BR1 after external 171</text>
<text x="370" y="90" class="svg-accent" font-size="13">D EX 192.168.50.0/24  AD 170 (wins)</text>
<text x="370" y="115" class="svg-ink" font-size="13">O E2 192.168.50.0/24  AD 171</text>
<text x="370" y="150" class="svg-muted" font-size="12">path: E1 directly (1 hop)</text>
<line x1="290" y1="105" x2="350" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">one command flips which copy is installed</text>
</svg><p class="cap">Raising OSPF external AD to 171 on the boundary router makes the EIGRP external copy (170) win.</p></div>

<div class="eg"><p><b>Worked example: which knob in lab 2?</b> BR1 prefers the O E2 copy (110) of the Delhi route over the D EX original (170). Three candidate fixes:</p>
<ul>
<li><b>A.</b> <code>distance ospf external 171</code> on BR1 and BR2. D EX 170 now beats O E2 171. OSPF intra-area routes (O, 110) still beat any D EX copy of them. Clean and simple for this lab.</li>
<li><b>B.</b> <code>distance eigrp 90 105</code> on BR1 and BR2. D EX 105 beats O E2 110, which fixes 192.168.50.0/24. But BR2 redistributes the Bengaluru LAN 10.200.10.0/24 into EIGRP, and BR1 can hear it back through E1 as D EX 105 (for example whenever E1's best path points only at BR2), which beats BR1's own OSPF intra-area route (110). Tags stop it being redistributed again, but they do not stop BR1 installing it. New suboptimal routing: rejected.</li>
<li><b>C.</b> Per-source OSPF distance for the boundary routers' router IDs with an ACL. Most precise; useful when the OSPF domain also has its own genuine external routes that must keep AD 110.</li>
</ul>
<p>The lab expects option A: <code>distance ospf external</code> with any value from 171 upward.</p></div>

<h3>Verification</h3>
<pre class="out">BR1#show ip protocols | section ospf
Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 1.1.1.1
  It is an autonomous system boundary router
 Redistributing External Routes from,
    eigrp 100, includes subnets in redistribution, route-map EIGRP-TO-OSPF
  ...
  <span class="hl">Distance: intra-area 110 inter-area 110 external 171</span>

BR1#show ip route 192.168.50.0
Routing entry for 192.168.50.0/24
  <span class="hl">Known via "eigrp 100", distance 170, metric 130816, type external</span>
  Redistributing via ospf 1
  Advertised by ospf 1 subnets route-map EIGRP-TO-OSPF</pre>
<p>If the table does not change straight away, <code>clear ip route 192.168.50.0</code> (or <code>clear ip route *</code>) re-installs routes from the protocol databases without resetting any neighbours.</p>

<div class="warn"><p><b>Common mistake.</b> Using the neighbour's interface IP in an OSPF per-source distance, for example <code>distance 171 10.2.1.1 0.0.0.0</code> on BR1. Nothing matches, because OSPF compares against originating router IDs such as 2.2.2.2. The command is accepted silently and does nothing.</p></div>

<div class="exam"><p><b>Exam trap.</b> Changing AD on only one of two boundary routers. The other router keeps the old preference, so the problem moves instead of disappearing. When a question shows two redistribution points, the fix almost always goes on both.</p></div>

<div class="scn"><h4>The per-source distance that did nothing</h4><p>An engineer wanted to distrust OSPF externals injected by a lab router and typed <code>distance 200 172.31.0.2 0.0.0.0</code> under OSPF, using the lab router's link address. Nothing changed in <code>show ip route</code>. <code>show ip ospf database external</code> showed "Advertising Router: 3.3.3.3" for those LSAs. Re-entering the command as <code>distance 200 3.3.3.3 0.0.0.0</code> immediately gave the lab routes AD 200.</p><p><b>Lesson:</b> OSPF per-source distance matches the LSA's advertising router ID; EIGRP matches the neighbour's IP.</p></div>

<div class="iv"><p class="q">"How would you fix suboptimal routing caused by AD at a mutual redistribution point, and what would you avoid?"</p><p>Strong answer: raise the AD of the redistributed copies rather than lowering the AD of externals in general, for example <code>distance ospf external 171</code> on every boundary router so EIGRP externals (170) win over their OSPF copies, while OSPF internal routes (110) still beat EIGRP copies of them. Mention per-source or per-prefix distance with an ACL when the domain has genuine externals, remember that OSPF per-source uses the originating router ID, and verify with <code>show ip protocols</code> and <code>show ip route</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>distance eigrp int ext</code>, <code>distance ospf intra-area/inter-area/external</code>, <code>distance bgp ebgp ibgp local</code> change AD per route type.</li>
<li>Per-source form: <code>distance AD source wildcard [acl]</code>; EIGRP uses the neighbour IP, OSPF the originating router ID.</li>
<li>Add a standard ACL to limit the change to certain prefixes.</li>
<li>AD changes are local, so apply them on every redistribution point.</li>
<li>Prefer raising OSPF external AD to lowering EIGRP external AD at an EIGRP/OSPF boundary.</li>
</ul></div>
`,hi:`
<p>Wapas apni newspaper editor par. Aam taur par staff reporter par agency se zyada bharosa hota hai. Lekin ek topic par, maan lo cricket, agency ka specialist maidan par hai, to woh tay karti hai: "us agency ki cricket stories par normal se zyada bharosa karo." Routers bilkul yahi allow karte hain. Aap poore protocol ke liye, ek route type ke liye, ek source ke routes ke liye, ya ek source ke ek prefix ke liye trust score badal sakte ho. <code>distance</code> command aapka tool hai, aur iska har form exam material hai.</p>

<h3>Rule zero: AD local hai</h3>
<p>BR1 par AD badalne se sirf yeh badalta hai ki BR1 kaunsa route install karta hai. Neighbours ko nayi value kabhi pata nahi chalti. Yeh powerful hai (aap doosron ko chhue bina ek router theek kar sakte ho) aur khatarnaak bhi (ab do routers best path par asahmat ho sakte hain aur ek doosre ki taraf traffic forward kar sakte hain).</p>

<h3>EIGRP</h3>
<pre class="code"><span class="c">! classic mode: internal aur external alag alag</span>
router eigrp 100
 distance eigrp 90 175
<span class="c">! per source: neighbour 10.1.1.1 se seekhe internal routes ko AD 95</span>
 distance 95 10.1.1.1 0.0.0.0
<span class="c">! named mode: wahi idea topology ke neeche</span>
router eigrp NK
 address-family ipv4 unicast autonomous-system 100
  topology base
   distance eigrp 90 175</pre>
<p>EIGRP mein per-source form ka source address <b>neighbour ka interface address</b> hota hai, aur yeh form <b>internal</b> routes par lagta hai. External routes badalne ke liye <code>distance eigrp</code> use karo.</p>

<h3>OSPF</h3>
<pre class="code">router ospf 1
<span class="c">! route type ke hisaab se</span>
 distance ospf intra-area 110 inter-area 110 external 171
<span class="c">! is process ka sab kuch</span>
 distance 115
<span class="c">! per source: woh routes jinka LSA router ID 2.2.2.2 ne originate kiya</span>
 distance 171 2.2.2.2 0.0.0.0</pre>
<p>Yeh classic trap hai: OSPF mein per-source address <b>LSA originate karne wale router ka router ID</b> (Advertising Router) hota hai, neighbour ka interface address nahi. OSPF routes LSDB se calculate hote hain, isliye external route ka "source" woh ASBR hai jisne type-5 LSA banaya.</p>

<h3>BGP, RIP aur static</h3>
<pre class="code">router bgp 65001
 distance bgp 20 200 200        <span class="c">! external internal local</span>
router rip
 distance 120
ip route 10.200.10.0 255.255.255.0 192.0.2.1 250   <span class="c">! har static route par</span></pre>

<h3>Per prefix: ek ACL jodo</h3>
<p>Har per-source form ek optional standard ACL leta hai jo chunta hai ki <b>kaunse prefixes</b> ko naya AD mile. Source par 255.255.255.255 wildcard ka matlab hai "kisi bhi source se".</p>
<pre class="code">access-list 50 permit 192.168.50.0 0.0.0.255
router ospf 1
<span class="c">! sirf do boundary routers se aaye 192.168.50.0/24 ko AD 171</span>
 distance 171 1.1.1.1 0.0.0.0 50
 distance 171 2.2.2.2 0.0.0.0 50</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="AD tuning on BR1">
<rect x="20" y="30" width="270" height="150" rx="10" fill="#fed7aa"/>
<text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="14">BR1 pehle</text>
<text x="40" y="90" class="svg-ink" font-size="13">D EX 192.168.50.0/24  AD 170</text>
<text x="40" y="115" class="svg-accent" font-size="13">O E2 192.168.50.0/24  AD 110 (jeet)</text>
<text x="40" y="150" class="svg-muted" font-size="12">path: O1, BR2, E1 (3 hops)</text>
<rect x="350" y="30" width="270" height="150" rx="10" fill="#bbf7d0"/>
<text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="14">BR1 external 171 ke baad</text>
<text x="370" y="90" class="svg-accent" font-size="13">D EX 192.168.50.0/24  AD 170 (jeet)</text>
<text x="370" y="115" class="svg-ink" font-size="13">O E2 192.168.50.0/24  AD 171</text>
<text x="370" y="150" class="svg-muted" font-size="12">path: seedha E1 (1 hop)</text>
<line x1="290" y1="105" x2="350" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">ek command se installed copy palat jaati hai</text>
</svg><p class="cap">Boundary router par OSPF external AD ko 171 karne se EIGRP external copy (170) jeet jaati hai.</p></div>

<div class="eg"><p><b>Worked example: lab 2 mein kaunsa knob?</b> BR1 Delhi route ki O E2 copy (110) ko D EX original (170) se prefer karta hai. Teen possible fixes:</p>
<ul>
<li><b>A.</b> BR1 aur BR2 par <code>distance ospf external 171</code>. Ab D EX 170, O E2 171 ko harata hai. OSPF intra-area routes (O, 110) ab bhi apni kisi bhi D EX copy ko harate hain. Is lab ke liye saaf aur simple.</li>
<li><b>B.</b> BR1 aur BR2 par <code>distance eigrp 90 105</code>. D EX 105, O E2 110 ko harata hai, jisse 192.168.50.0/24 theek ho jaata hai. Lekin BR2 Bengaluru LAN 10.200.10.0/24 ko EIGRP mein redistribute karta hai, aur BR1 use E1 ke through wapas D EX 105 ke roop mein sun sakta hai (jaise jab bhi E1 ka best path sirf BR2 ki taraf ho), jo BR1 ke apne OSPF intra-area route (110) ko hara deta hai. Tags ise dobara redistribute hone se rokte hain, lekin BR1 ko ise install karne se nahi rokte. Nayi suboptimal routing: rejected.</li>
<li><b>C.</b> Boundary routers ke router IDs ke liye ACL ke saath per-source OSPF distance. Sabse precise; tab kaam ka jab OSPF domain ke apne asli external routes bhi hon jinhe AD 110 rakhna ho.</li>
</ul>
<p>Lab option A expect karti hai: 171 ya usse upar ki kisi bhi value ke saath <code>distance ospf external</code>.</p></div>

<h3>Verification</h3>
<pre class="out">BR1#show ip protocols | section ospf
Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 1.1.1.1
  It is an autonomous system boundary router
 Redistributing External Routes from,
    eigrp 100, includes subnets in redistribution, route-map EIGRP-TO-OSPF
  ...
  <span class="hl">Distance: intra-area 110 inter-area 110 external 171</span>

BR1#show ip route 192.168.50.0
Routing entry for 192.168.50.0/24
  <span class="hl">Known via "eigrp 100", distance 170, metric 130816, type external</span>
  Redistributing via ospf 1
  Advertised by ospf 1 subnets route-map EIGRP-TO-OSPF</pre>
<p>Agar table turant na badle, to <code>clear ip route 192.168.50.0</code> (ya <code>clear ip route *</code>) protocol databases se routes dobara install karta hai, kisi neighbour ko reset kiye bina.</p>

<div class="warn"><p><b>Common galti.</b> OSPF per-source distance mein neighbour ka interface IP use karna, jaise BR1 par <code>distance 171 10.2.1.1 0.0.0.0</code>. Kuch match nahi hota, kyunki OSPF 2.2.2.2 jaise originating router IDs se compare karta hai. Command chupchaap accept ho jaata hai aur kuch nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Do boundary routers mein se sirf ek par AD badalna. Doosra router purani preference rakhta hai, isliye problem gayab hone ki jagah khisak jaati hai. Jab question do redistribution points dikhaye, to fix lagbhag hamesha dono par jaata hai.</p></div>

<div class="scn"><h4>Woh per-source distance jisne kuch nahi kiya</h4><p>Ek engineer ek lab router ke inject kiye OSPF externals par bharosa kam karna chahta tha aur usne OSPF ke neeche lab router ka link address use karke <code>distance 200 172.31.0.2 0.0.0.0</code> type kiya. <code>show ip route</code> mein kuch nahi badla. <code>show ip ospf database external</code> un LSAs ke liye "Advertising Router: 3.3.3.3" dikha raha tha. Command ko <code>distance 200 3.3.3.3 0.0.0.0</code> ke roop mein dobara daalte hi lab routes ko AD 200 mil gaya.</p><p><b>Seekh:</b> OSPF per-source distance LSA ke advertising router ID se match karta hai; EIGRP neighbour ke IP se.</p></div>

<div class="iv"><p class="q">"Mutual redistribution point par AD ki wajah se hui suboptimal routing aap kaise theek karoge, aur kis cheez se bachoge?"</p><p>Strong answer: externals ka AD general mein ghatane ki jagah redistributed copies ka AD badhao, jaise har boundary router par <code>distance ospf external 171</code> taaki EIGRP externals (170) apni OSPF copies se jeetein, jabki OSPF internal routes (110) ab bhi apni EIGRP copies ko harayein. Jab domain mein asli externals hon to ACL ke saath per-source ya per-prefix distance ka zikr karo, yaad rakho ki OSPF per-source originating router ID use karta hai, aur <code>show ip protocols</code> aur <code>show ip route</code> se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>distance eigrp int ext</code>, <code>distance ospf intra-area/inter-area/external</code>, <code>distance bgp ebgp ibgp local</code> route type ke hisaab se AD badalte hain.</li>
<li>Per-source form: <code>distance AD source wildcard [acl]</code>; EIGRP neighbour IP use karta hai, OSPF originating router ID.</li>
<li>Change ko kuch prefixes tak seemit karne ke liye standard ACL jodo.</li>
<li>AD changes local hain, isliye har redistribution point par lagao.</li>
<li>EIGRP/OSPF boundary par EIGRP external AD ghatane se behtar hai OSPF external AD badhana.</li>
</ul></div>
`}};export{e as default};