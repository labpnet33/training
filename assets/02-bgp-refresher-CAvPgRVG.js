var e={id:`bgp`,h:{en:`Just enough BGP: sessions, iBGP, loopbacks and route reflectors`,hi:`Zaroorat bhar BGP: sessions, iBGP, loopbacks aur route reflectors`},body:{en:`
<p>BGP has a reputation for being huge, and for internet routing it is. For an EVPN fabric you need only a small, well-defined slice of it. Think of BGP as a <b>postal service between trusted offices</b>: two offices agree to exchange letters (a session), every letter carries an address and some stamps (a route with attributes), and a head post office can forward letters between branch offices that never talk directly (a route reflector). This chapter gives you that slice, using the exact addresses of the labs.</p>

<h3>1. A BGP session is a TCP connection on port 179</h3>
<p>Unlike OSPF, BGP does not discover neighbors automatically. You configure each <b>neighbor</b> by IP address on both sides. The routers open a TCP connection to port 179, exchange OPEN messages (AS number, router ID, capabilities), and then send UPDATE messages carrying routes. KEEPALIVE messages every 60 seconds keep the session alive; if nothing arrives within the hold time (180 seconds by default), the session is torn down.</p>
<p>The session moves through states you will see in show commands: <b>Idle</b> (not trying, often because something is missing locally), <b>Connect</b> and <b>Active</b> (trying to open TCP, but it is not succeeding), <b>OpenSent/OpenConfirm</b> (TCP is up, parameters being agreed), and <b>Established</b> (routes flow). In <code>show bgp l2vpn evpn summary</code> an Established session shows a <b>number</b> (prefixes received) instead of a state name.</p>

<h3>2. iBGP and eBGP</h3>
<p>Each BGP router belongs to an <b>autonomous system</b> (AS). If both neighbors are in the same AS, the session is <b>iBGP</b>; if they are in different ASes, it is <b>eBGP</b>. The labs use one private AS, <b>65001</b>, on all four switches, so every session is iBGP. Many real fabrics use eBGP instead (a different AS per leaf or per rack), and both are supported by Cisco; iBGP with spine route reflectors is the most common Nexus design and the one the exam expects you to configure first.</p>
<table class="cmp"><tr><th>Behaviour</th><th>iBGP (same AS)</th><th>eBGP (different AS)</th></tr>
<tr><td>Loop prevention</td><td>never re-advertise iBGP routes to other iBGP peers (split horizon)</td><td>AS-path: reject routes that contain your own AS</td></tr>
<tr><td>Next hop when advertising</td><td>left unchanged by default</td><td>set to self by default</td></tr>
<tr><td>Default TTL</td><td>255, any distance</td><td>1, directly connected (unless multihop)</td></tr>
<tr><td>Typical DC use</td><td>leaves to spine route reflectors</td><td>leaf AS per rack; external routers and firewalls</td></tr>
</table>

<h3>3. Peer between loopbacks: update-source</h3>
<p>Each leaf has two uplinks (to SPINE1 and SPINE2). If you peered using a physical link address, losing that link would drop the session. Instead, peer between <b>loopback0</b> addresses. The OSPF underlay advertises every loopback, so a loopback stays reachable as long as any path exists.</p>
<p>There is a catch. When LEAF1 opens the TCP connection, the source address is normally the outgoing interface address (for example 10.1.1.1 on Ethernet1/1). SPINE1 expects the connection to come from 10.255.0.1, the address configured as its neighbor, and rejects anything else. The command <code>update-source loopback0</code> tells LEAF1 to source the session from loopback0. Missing update-source is one of the classic reasons a session sits in <b>Active</b>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Loopback peering to two spines">
<rect x="120" y="20" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="195" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE1 (RR)</text><text x="195" y="54" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.11</text>
<rect x="370" y="20" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="445" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE2 (RR)</text><text x="445" y="54" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.12</text>
<rect x="120" y="150" width="150" height="40" rx="8" fill="#bae6fd"/><text x="195" y="168" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="195" y="184" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.1</text>
<rect x="370" y="150" width="150" height="40" rx="8" fill="#bae6fd"/><text x="445" y="168" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text><text x="445" y="184" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.2</text>
<line x1="195" y1="60" x2="195" y2="150" stroke="#64748b" stroke-width="2"/><line x1="445" y1="60" x2="445" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="195" y1="60" x2="445" y2="150" stroke="#64748b" stroke-width="2"/><line x1="445" y1="60" x2="195" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">4 iBGP sessions, AS 65001, loopback0 to loopback0</text>
</svg><p class="cap">Each leaf peers with both spines. No leaf-to-leaf sessions are needed because the spines reflect routes.</p></div>

<h3>4. Next-hop behaviour</h3>
<p>Every BGP route has a <b>next hop</b>: the address to send traffic to. iBGP does not change the next hop when passing a route on, and a route reflector does not change it either. That is exactly what EVPN wants: when LEAF2 advertises a MAC, the next hop is LEAF2's <b>VTEP address (loopback1, 10.254.0.2)</b>, and it must stay that way all the way to LEAF1 so LEAF1 builds the VXLAN tunnel straight to LEAF2. On NX-OS the EVPN next hop is taken from the NVE <code>source-interface</code>, not from the BGP update-source, which is why BGP runs on loopback0 while EVPN routes point to loopback1.</p>

<h3>5. Route reflectors on the spines</h3>
<p>iBGP split horizon says: a route learned from one iBGP peer is not sent to another iBGP peer. Without help, every leaf would need a session to every other leaf (a full mesh: n × (n−1) / 2 sessions, which is 780 sessions for 40 leaves). A <b>route reflector</b> (RR) is allowed to break that rule for its <b>clients</b>. The spines are configured as RRs and mark each leaf as <code>route-reflector-client</code>. To prevent loops the RR adds two attributes: <b>ORIGINATOR_ID</b> (the router ID of the leaf that created the route) and <b>CLUSTER_LIST</b> (the RR's cluster ID). Two spines give RR redundancy; each leaf therefore receives two copies of every route, one from each spine.</p>
<p>Only the spine needs the <code>route-reflector-client</code> command. The leaves configure the spines as ordinary neighbors.</p>

<h3>6. Address families (MP-BGP)</h3>
<p>Original BGP carried only IPv4 unicast prefixes. <b>Multiprotocol BGP</b> (MP-BGP) lets one session carry several <b>address families</b>: IPv4 unicast, IPv6 unicast, VPNv4, and <b>L2VPN EVPN</b>. On NX-OS a neighbor carries nothing until you activate at least one address family under it, and both sides must activate the same family for routes of that type to be exchanged. Chapter 3 activates <code>address-family l2vpn evpn</code>.</p>

<pre class="code"><span class="c">! LEAF1: minimum BGP skeleton (EVPN family added in chapter 3)</span>
feature bgp
router bgp 65001
  router-id 10.255.0.1
  neighbor 10.255.0.11
    remote-as 65001
    update-source loopback0
  neighbor 10.255.0.12
    remote-as 65001
    update-source loopback0</pre>

<pre class="out">LEAF1# show bgp l2vpn evpn summary
BGP summary information for VRF default, address family L2VPN EVPN
BGP router identifier 10.255.0.1, local AS number 65001
BGP table version is 12, L2VPN EVPN config peers 2, capable peers 2
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.255.0.11     4 65001      96      91       12    0    0 00:40:02 4</span>
10.255.0.12     4 65001      95      90       12    0    0 00:39:58 4</pre>
<p>The highlighted line is healthy: a number in the last column means Established with 4 EVPN prefixes received.</p>

<div class="eg"><p><b>Worked example.</b> A fabric with 2 spines and 24 leaves needs 2 × 24 = 48 iBGP sessions with route reflectors. A full mesh of 26 routers would need 26 × 25 / 2 = 325 sessions, and every new leaf would add 25 more.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring <code>route-reflector-client</code> on the leaf instead of the spine; peering to the spine's link address instead of its loopback0; forgetting <code>update-source loopback0</code> on one side only (session stuck in Active); using different AS numbers by mistake so the "iBGP" session becomes eBGP with TTL 1 and never comes up between loopbacks.</p></div>
<div class="exam"><p><b>Exam trap.</b> A route reflector does not change the next hop of reflected routes. If a question claims the spine becomes the next hop for EVPN routes, it is wrong: the next hop remains the originating leaf's VTEP address.</p></div>

<div class="scn"><h4>One leaf, one spine, one missing line</h4><p>After a hardware swap, LEAF7 came up with its session to SPINE1 Established but SPINE2 permanently in Active. Ping between the loopbacks worked, so the underlay was fine. The engineer compared the two neighbor blocks in <code>show running-config bgp</code> and saw that the SPINE2 block had no <code>update-source loopback0</code>. LEAF7 was opening TCP from its Ethernet1/2 address, which SPINE2 did not know as a neighbor, so SPINE2 reset every attempt. Adding the line brought the session up within seconds.</p><p><b>Lesson:</b> Active means "I keep trying and failing". Check the source address, the neighbor address and the AS number before blaming the network.</p></div>

<div class="iv"><p class="q">"Why do we need route reflectors in an iBGP EVPN fabric, and do they change the next hop?"</p><p>Strong answer: iBGP split horizon stops a router from passing iBGP-learned routes to other iBGP peers, so without RRs you need a full mesh of leaf sessions. The spines act as RRs, the leaves are clients, and the RR adds ORIGINATOR_ID and CLUSTER_LIST to prevent loops. The RR does not change the next hop, so EVPN routes keep the originating VTEP's loopback1 as next hop and tunnels go leaf to leaf. Mention two spines for redundancy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP sessions are configured, not discovered: TCP port 179, both sides name each other.</li>
<li>The lab fabric is iBGP in AS 65001, loopback0 to loopback0 with update-source loopback0.</li>
<li>iBGP keeps the next hop; the EVPN next hop is the VTEP (loopback1), never the spine.</li>
<li>Spines are route reflectors; only the spine configures route-reflector-client.</li>
<li>MP-BGP carries address families; EVPN uses L2VPN EVPN, activated on both ends.</li>
</ul></div>
`,hi:`
<p>BGP ki image bahut badi hai, aur internet routing ke liye woh sach mein bada hai. EVPN fabric ke liye aapko uska sirf ek chhota, saaf define kiya hua hissa chahiye. BGP ko <b>bharosemand offices ke beech postal service</b> ki tarah socho: do offices chitthiyan badalne par agree karte hain (session), har chitthi par address aur kuch stamps hote hain (attributes wala route), aur ek head post office un branch offices ke beech chitthiyan aage bhej sakta hai jo seedhe baat nahi karte (route reflector). Yeh chapter labs ke exact addresses ke saath aapko wahi hissa deta hai.</p>

<h3>1. BGP session port 179 par ek TCP connection hai</h3>
<p>OSPF ki tarah BGP neighbors apne aap discover nahi karta. Aap har <b>neighbor</b> ko dono sides par IP address se configure karte ho. Routers port 179 par TCP connection kholte hain, OPEN messages badalte hain (AS number, router ID, capabilities), aur phir routes wale UPDATE messages bhejte hain. Har 60 second mein KEEPALIVE messages session ko zinda rakhte hain; agar hold time (default 180 second) mein kuch nahi aata to session gira diya jaata hai.</p>
<p>Session un states se guzarta hai jo aap show commands mein dekhoge: <b>Idle</b> (try nahi kar raha, aksar kyunki local kuch missing hai), <b>Connect</b> aur <b>Active</b> (TCP kholne ki koshish, par ho nahi raha), <b>OpenSent/OpenConfirm</b> (TCP up hai, parameters par agreement ho raha hai), aur <b>Established</b> (routes chal rahe hain). <code>show bgp l2vpn evpn summary</code> mein Established session state ke naam ki jagah ek <b>number</b> (received prefixes) dikhata hai.</p>

<h3>2. iBGP aur eBGP</h3>
<p>Har BGP router ek <b>autonomous system</b> (AS) ka hissa hota hai. Agar dono neighbors same AS mein hain to session <b>iBGP</b> hai; alag AS mein hain to <b>eBGP</b>. Labs chaaron switches par ek private AS, <b>65001</b>, use karte hain, isliye har session iBGP hai. Kai real fabrics iski jagah eBGP use karte hain (har leaf ya har rack ka alag AS), aur Cisco dono support karta hai; spine route reflectors ke saath iBGP sabse common Nexus design hai aur wahi exam aapse pehle configure karwata hai.</p>
<table class="cmp"><tr><th>Behaviour</th><th>iBGP (same AS)</th><th>eBGP (alag AS)</th></tr>
<tr><td>Loop prevention</td><td>iBGP routes doosre iBGP peers ko kabhi re-advertise nahi (split horizon)</td><td>AS-path: jis route mein apna AS ho use reject</td></tr>
<tr><td>Advertise karte waqt next hop</td><td>default mein unchanged</td><td>default mein self</td></tr>
<tr><td>Default TTL</td><td>255, kitni bhi doori</td><td>1, directly connected (multihop ke bina)</td></tr>
<tr><td>Typical DC use</td><td>leaves se spine route reflectors</td><td>har rack ka leaf AS; external routers aur firewalls</td></tr>
</table>

<h3>3. Loopbacks ke beech peer karo: update-source</h3>
<p>Har leaf ke do uplinks hain (SPINE1 aur SPINE2 tak). Agar aap physical link address se peer karo, to woh link girne par session gir jaayega. Iski jagah <b>loopback0</b> addresses ke beech peer karo. OSPF underlay har loopback advertise karta hai, isliye jab tak koi bhi path hai, loopback reachable rehta hai.</p>
<p>Ek pech hai. Jab LEAF1 TCP connection kholta hai, source address normally outgoing interface ka address hota hai (jaise Ethernet1/1 par 10.1.1.1). SPINE1 ummeed karta hai ki connection 10.255.0.1 se aaye, jo uske neighbor ki tarah configured hai, aur baaki sab reject karta hai. Command <code>update-source loopback0</code> LEAF1 ko batata hai ki session loopback0 se source kare. Missing update-source un classic wajahon mein se ek hai jinse session <b>Active</b> mein atka rehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Do spines tak loopback peering">
<rect x="120" y="20" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="195" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE1 (RR)</text><text x="195" y="54" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.11</text>
<rect x="370" y="20" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="445" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE2 (RR)</text><text x="445" y="54" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.12</text>
<rect x="120" y="150" width="150" height="40" rx="8" fill="#bae6fd"/><text x="195" y="168" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="195" y="184" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.1</text>
<rect x="370" y="150" width="150" height="40" rx="8" fill="#bae6fd"/><text x="445" y="168" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text><text x="445" y="184" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.2</text>
<line x1="195" y1="60" x2="195" y2="150" stroke="#64748b" stroke-width="2"/><line x1="445" y1="60" x2="445" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="195" y1="60" x2="445" y2="150" stroke="#64748b" stroke-width="2"/><line x1="445" y1="60" x2="195" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">4 iBGP sessions, AS 65001, loopback0 se loopback0</text>
</svg><p class="cap">Har leaf dono spines se peer karta hai. Leaf-to-leaf sessions ki zaroorat nahi kyunki spines routes reflect karte hain.</p></div>

<h3>4. Next-hop behaviour</h3>
<p>Har BGP route ka ek <b>next hop</b> hota hai: woh address jahan traffic bhejna hai. iBGP route aage dete waqt next hop nahi badalta, aur route reflector bhi nahi badalta. EVPN ko bilkul yahi chahiye: jab LEAF2 ek MAC advertise karta hai, to next hop LEAF2 ka <b>VTEP address (loopback1, 10.254.0.2)</b> hota hai, aur LEAF1 tak aisa hi rehna chahiye taaki LEAF1 VXLAN tunnel seedha LEAF2 tak banaye. NX-OS par EVPN next hop NVE <code>source-interface</code> se liya jaata hai, BGP update-source se nahi, isiliye BGP loopback0 par chalta hai jabki EVPN routes loopback1 ki taraf point karte hain.</p>

<h3>5. Spines par route reflectors</h3>
<p>iBGP split horizon kehta hai: ek iBGP peer se seekha route doosre iBGP peer ko nahi bheja jaata. Madad ke bina har leaf ko har doosre leaf se session chahiye hota (full mesh: n × (n−1) / 2 sessions, yaani 40 leaves ke liye 780 sessions). <b>Route reflector</b> (RR) ko apne <b>clients</b> ke liye yeh rule todne ki ijaazat hai. Spines RR ki tarah configure hote hain aur har leaf ko <code>route-reflector-client</code> mark karte hain. Loops rokne ke liye RR do attributes jodta hai: <b>ORIGINATOR_ID</b> (us leaf ka router ID jisne route banaya) aur <b>CLUSTER_LIST</b> (RR ka cluster ID). Do spines RR redundancy dete hain; isliye har leaf ko har route ki do copies milti hain, har spine se ek.</p>
<p>Sirf spine ko <code>route-reflector-client</code> command chahiye. Leaves spines ko normal neighbors ki tarah configure karte hain.</p>

<h3>6. Address families (MP-BGP)</h3>
<p>Original BGP sirf IPv4 unicast prefixes le jaata tha. <b>Multiprotocol BGP</b> (MP-BGP) ek session ko kai <b>address families</b> le jaane deta hai: IPv4 unicast, IPv6 unicast, VPNv4, aur <b>L2VPN EVPN</b>. NX-OS par neighbor tab tak kuch nahi le jaata jab tak aap uske neeche kam se kam ek address family activate na karo, aur us type ke routes exchange hone ke liye dono sides ko same family activate karni chahiye. Chapter 3 <code>address-family l2vpn evpn</code> activate karta hai.</p>

<pre class="code"><span class="c">! LEAF1: minimum BGP skeleton (EVPN family chapter 3 mein judegi)</span>
feature bgp
router bgp 65001
  router-id 10.255.0.1
  neighbor 10.255.0.11
    remote-as 65001
    update-source loopback0
  neighbor 10.255.0.12
    remote-as 65001
    update-source loopback0</pre>

<pre class="out">LEAF1# show bgp l2vpn evpn summary
BGP summary information for VRF default, address family L2VPN EVPN
BGP router identifier 10.255.0.1, local AS number 65001
BGP table version is 12, L2VPN EVPN config peers 2, capable peers 2
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.255.0.11     4 65001      96      91       12    0    0 00:40:02 4</span>
10.255.0.12     4 65001      95      90       12    0    0 00:39:58 4</pre>
<p>Highlighted line healthy hai: aakhri column mein number matlab Established aur 4 EVPN prefixes receive hue.</p>

<div class="eg"><p><b>Worked example.</b> 2 spines aur 24 leaves wale fabric ko route reflectors ke saath 2 × 24 = 48 iBGP sessions chahiye. 26 routers ke full mesh ko 26 × 25 / 2 = 325 sessions chahiye hote, aur har naya leaf 25 aur jodta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>route-reflector-client</code> spine ki jagah leaf par configure karna; spine ke loopback0 ki jagah uske link address se peer karna; <code>update-source loopback0</code> sirf ek side par bhoolna (session Active mein atka); galti se alag AS numbers use karna jisse "iBGP" session TTL 1 wala eBGP ban jaata hai aur loopbacks ke beech kabhi up nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> Route reflector reflected routes ka next hop nahi badalta. Agar sawaal kahe ki EVPN routes ke liye spine next hop ban jaata hai, to woh galat hai: next hop originating leaf ka VTEP address hi rehta hai.</p></div>

<div class="scn"><h4>Ek leaf, ek spine, ek missing line</h4><p>Hardware swap ke baad LEAF7 up hua jiska SPINE1 wala session Established tha par SPINE2 hamesha Active mein. Loopbacks ke beech ping chal rahi thi, to underlay theek tha. Engineer ne <code>show running-config bgp</code> mein dono neighbor blocks milaye aur dekha ki SPINE2 wale block mein <code>update-source loopback0</code> nahi tha. LEAF7 apne Ethernet1/2 address se TCP khol raha tha, jise SPINE2 neighbor ki tarah nahi jaanta tha, isliye SPINE2 har attempt reset kar deta. Line jodte hi session kuch second mein up ho gaya.</p><p><b>Seekh:</b> Active ka matlab hai "main try karta rehta hoon aur fail hota hoon". Network ko blame karne se pehle source address, neighbor address aur AS number check karo.</p></div>

<div class="iv"><p class="q">"iBGP EVPN fabric mein route reflectors kyun chahiye, aur kya woh next hop badalte hain?"</p><p>Strong answer: iBGP split horizon router ko iBGP se seekhe routes doosre iBGP peers ko dene se rokta hai, isliye RRs ke bina leaf sessions ka full mesh chahiye. Spines RR ka kaam karte hain, leaves clients hain, aur RR loops rokne ke liye ORIGINATOR_ID aur CLUSTER_LIST jodta hai. RR next hop nahi badalta, isliye EVPN routes originating VTEP ka loopback1 next hop ki tarah rakhte hain aur tunnels leaf se leaf jaate hain. Redundancy ke liye do spines ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP sessions configure hote hain, discover nahi: TCP port 179, dono sides ek doosre ka naam lete hain.</li>
<li>Lab fabric AS 65001 mein iBGP hai, update-source loopback0 ke saath loopback0 se loopback0.</li>
<li>iBGP next hop rakhta hai; EVPN next hop VTEP (loopback1) hai, spine kabhi nahi.</li>
<li>Spines route reflectors hain; sirf spine route-reflector-client configure karta hai.</li>
<li>MP-BGP address families le jaata hai; EVPN L2VPN EVPN use karta hai, jo dono ends par activate hoti hai.</li>
</ul></div>
`}};export{e as default};