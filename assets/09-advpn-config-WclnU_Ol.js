var e={id:`advpn-config`,h:{en:`ADVPN in practice: configure, verify, clean up`,hi:`ADVPN practice mein: configure, verify, clean up`},body:{en:`
<p>Chapter 8 explained why ADVPN exists. Now we build it on the Kaveri Retail network. Think of the hub HQ-FGT in Chennai as a railway junction. Today a parcel from Madurai to Trichy goes up to the junction and back down. ADVPN lets the junction say: "You two are talking a lot, here is the address of the other station, build your own road." That road is the <b>shortcut tunnel</b>. Configuration is only four settings, but each one has a job, and each one fails in its own way.</p>

<h3>The four settings</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="ADVPN settings on hub and spokes">
<rect x="250" y="12" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT (hub)</text><text x="320" y="51" text-anchor="middle" class="svg-muted" font-size="11">KR-ADVPN: sender</text>
<rect x="30" y="120" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="105" y="142" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="11">TO-HQ: receiver</text>
<rect x="460" y="120" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="535" y="142" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="160" text-anchor="middle" class="svg-muted" font-size="11">TO-HQ: receiver</text>
<line x1="270" y1="62" x2="120" y2="120" stroke="#64748b" stroke-width="2"/><line x1="370" y1="62" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="180" y1="148" x2="460" y2="148" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">shortcut TO-HQ_0</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">hairpin policy KR-ADVPN to KR-ADVPN</text>
</svg><p class="cap">The hub offers, both spokes accept, and the hub must allow the first packets to turn around.</p></div>
<ol>
<li><b>Hairpin policy on the hub.</b> Traffic enters instance KR-ADVPN_0 and leaves through KR-ADVPN_1. A firewall policy with incoming and outgoing interface both KR-ADVPN must exist, or the hub drops the packet.</li>
<li><b>auto-discovery-sender enable</b> on the hub phase 1 KR-ADVPN. Only the hub offers shortcuts.</li>
<li><b>auto-discovery-receiver enable</b> on the phase 1 TO-HQ of <b>both</b> spokes. The spoke that sent the traffic and the spoke that received it must both be willing.</li>
<li><b>BGP next hop left unchanged.</b> The hub is a route reflector, so MDU learns 10.30.0.0/24 with next hop 10.255.1.3 (TRY). Do not set <code>next-hop-self-rr</code>.</li>
</ol>

<h3>Configuration</h3>
<pre class="code"><span class="c">! HQ-FGT: hairpin policy and sender</span>
config firewall policy
    edit 3
        set name "SPOKE-TO-SPOKE"
        set srcintf "KR-ADVPN"
        set dstintf "KR-ADVPN"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end
config vpn ipsec phase1-interface
    edit "KR-ADVPN"
        set auto-discovery-sender enable
    next
end

<span class="c">! MDU-FGT and TRY-FGT</span>
config vpn ipsec phase1-interface
    edit "TO-HQ"
        set auto-discovery-receiver enable
    next
end</pre>
<div class="warn"><p><b>Common mistake.</b> Enabling the receiver on only one spoke. The hub then offers the shortcut, the debug shows "received shortcut-offer", and the next line is "shortcut negotiation failed: peer does not accept shortcuts". Traffic keeps working through the hub, so nobody complains, and nothing is saved.</p></div>

<h3>Verification: see it happen</h3>
<p>Start a ping from PC-MDU (10.20.0.10) to PC-TRY (10.30.0.10). The first run goes through the hub. The hub notices the traffic entering one instance and leaving through another of the same template, and after about 600 ms of simulated time it sends the offer. Run the ping again.</p>
<pre class="out">PC-MDU&gt; ping 10.30.0.10
84 bytes from 10.30.0.10 ttl=<span class="hl">61</span> time=...   <span class="c">(first run, via HQ-FGT)</span>
PC-MDU&gt; ping 10.30.0.10
84 bytes from 10.30.0.10 ttl=<span class="hl">62</span> time=...   <span class="c">(second run, shortcut)</span>

MDU-FGT # get router info routing-table all
B       10.30.0.0/24 [200/0] via 10.255.1.3 (recursive is directly connected, <span class="hl">TO-HQ_0</span>)
C       10.255.1.3/32 is directly connected, TO-HQ_0
S       10.255.1.2/32 [15/0] via KR-ADVPN tunnel 203.0.113.11</pre>
<p>Read it like a detective. The shortcut is named <code>&lt;phase1&gt;_&lt;n&gt;</code>, so on a spoke it is <code>TO-HQ_0</code> (on the hub, instances are KR-ADVPN_0, _1). The shortcut installs a /32 connected route to the other spoke's tunnel IP 10.255.1.3. The BGP route is unchanged, but its next hop 10.255.1.3 now resolves through the shortcut. That is why the hub must not rewrite the next hop. A traceroute from PC-MDU shows 2 hops: MDU-FGT and then PC-TRY's gateway, no 10.255.1.1 in between.</p>
<p>Also check <code>get vpn ipsec tunnel summary</code>: the shortcut is its own line with its own packet counters.</p>

<h3>Cleaning up: idle-timeout and dependent</h3>
<p>A shortcut that nobody uses should not live forever. Two options on the spoke phase 1 control its life:</p>
<table class="cmp"><tr><th>Option</th><th>Effect</th></tr>
<tr><td><code>idle-timeout enable</code> + <code>idle-timeoutinterval 10</code></td><td>Tears the shortcut down after 10 idle minutes. The minimum is 10 (minutes).</td></tr>
<tr><td><code>auto-discovery-shortcuts dependent</code></td><td>Shortcut is removed when its parent tunnel TO-HQ goes down.</td></tr>
<tr><td><code>auto-discovery-shortcuts independent</code> (default)</td><td>Shortcut survives a parent failure and stays up until it idles out.</td></tr></table>
<pre class="code">config vpn ipsec phase1-interface
    edit "TO-HQ"
        set idle-timeout enable
        set idle-timeoutinterval 10
        set auto-discovery-shortcuts dependent
    next
end</pre>
<div class="exam"><p><b>Exam trap.</b> Idle-timeout is in minutes and the lowest value is 10, not 1. "Dependent" does not mean the shortcut needs the hub for traffic, only that it is deleted together with its parent. Also: after changing BGP options on the hub, run <code>execute router clear bgp all</code>, or the old next hop stays in the tables.</p></div>
<div class="note"><p>Exam theory, not modelled in this lab: shortcut-aware routing tricks such as SD-WAN steering and NPU offload of shortcuts.</p></div>

<div class="scn"><h4>Kaveri file transfers saturate Chennai</h4><p>Madurai and Trichy exchange stock files every night, and the Chennai link runs at 100 percent. ADVPN was configured, yet the traceroute still showed 10.255.1.1. The engineer found two causes: TRY-FGT had no auto-discovery-receiver, and the hub neighbor-group had next-hop-self-rr. After fixing both and running <code>execute router clear bgp all</code>, the second ping showed TTL 62 and the hub link calmed down.</p><p><b>Lesson:</b> a shortcut needs willing spokes and a BGP next hop that points at the other spoke.</p></div>
<div class="iv"><p class="q">"How does a shortcut tunnel get created in ADVPN, and what must be configured?"</p><p>The hub sees traffic hairpin between two instances and, as sender, offers a shortcut to both spokes. The spokes, with receiver enabled, negotiate a direct tunnel TO-HQ_0. You need the hairpin policy, sender on the hub, receiver on spokes, and an unchanged BGP next hop.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sender on the hub, receiver on both spokes, hairpin policy on the hub.</li>
<li>First ping goes via the hub (TTL 61), the next via the shortcut (TTL 62).</li>
<li>The shortcut is named TO-HQ_0 and adds a /32 route to the other spoke's tunnel IP.</li>
<li>Idle-timeout minimum is 10 minutes; dependent removes the shortcut with its parent.</li>
<li>Never next-hop-self-rr on the reflector if you want shortcuts to carry traffic.</li>
</ul></div>
`,hi:`
<p>Chapter 8 mein humne samjha ki ADVPN kyun hai. Ab hum ise Kaveri Retail network par build karte hain. Chennai ke hub HQ-FGT ko railway junction samjho. Abhi Madurai se Trichy ka parcel junction tak upar jaata hai aur phir neeche aata hai. ADVPN junction ko kehne deta hai: "Tum dono bahut baat karte ho, yeh doosre station ka address hai, apni road khud banao." Wahi road <b>shortcut tunnel</b> hai. Configuration sirf chaar settings hain, lekin har ek ka kaam hai, aur har ek apne tareeke se fail hoti hai.</p>

<h3>Chaar settings</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Hub aur spokes par ADVPN settings">
<rect x="250" y="12" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT (hub)</text><text x="320" y="51" text-anchor="middle" class="svg-muted" font-size="11">KR-ADVPN: sender</text>
<rect x="30" y="120" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="105" y="142" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="11">TO-HQ: receiver</text>
<rect x="460" y="120" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="535" y="142" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="160" text-anchor="middle" class="svg-muted" font-size="11">TO-HQ: receiver</text>
<line x1="270" y1="62" x2="120" y2="120" stroke="#64748b" stroke-width="2"/><line x1="370" y1="62" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="180" y1="148" x2="460" y2="148" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">shortcut TO-HQ_0</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">hairpin policy KR-ADVPN to KR-ADVPN</text>
</svg><p class="cap">Hub offer deta hai, dono spokes accept karte hain, aur hub ko pehle packets turn karne dene chahiye.</p></div>
<ol>
<li><b>Hub par hairpin policy.</b> Traffic instance KR-ADVPN_0 mein aata hai aur KR-ADVPN_1 se nikalta hai. Aisi firewall policy chahiye jisme incoming aur outgoing interface dono KR-ADVPN hon, warna hub packet drop kar deta hai.</li>
<li>Hub phase 1 KR-ADVPN par <b>auto-discovery-sender enable</b>. Sirf hub shortcut offer karta hai.</li>
<li><b>Dono</b> spokes ke phase 1 TO-HQ par <b>auto-discovery-receiver enable</b>. Jis spoke ne traffic bheja aur jis spoke ne receive kiya, dono tayyar hone chahiye.</li>
<li><b>BGP next hop unchanged.</b> Hub route reflector hai, isliye MDU ko 10.30.0.0/24 next hop 10.255.1.3 (TRY) ke saath milta hai. <code>next-hop-self-rr</code> mat lagao.</li>
</ol>

<h3>Configuration</h3>
<pre class="code"><span class="c">! HQ-FGT: hairpin policy aur sender</span>
config firewall policy
    edit 3
        set name "SPOKE-TO-SPOKE"
        set srcintf "KR-ADVPN"
        set dstintf "KR-ADVPN"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end
config vpn ipsec phase1-interface
    edit "KR-ADVPN"
        set auto-discovery-sender enable
    next
end

<span class="c">! MDU-FGT aur TRY-FGT</span>
config vpn ipsec phase1-interface
    edit "TO-HQ"
        set auto-discovery-receiver enable
    next
end</pre>
<div class="warn"><p><b>Common mistake.</b> Receiver sirf ek spoke par enable karna. Tab hub shortcut offer karta hai, debug mein "received shortcut-offer" dikhta hai, aur agli line hoti hai "shortcut negotiation failed: peer does not accept shortcuts". Traffic hub se chalta rehta hai, isliye koi complain nahi karta, aur bandwidth ki bachat nahi hoti.</p></div>

<h3>Verification: hote hue dekho</h3>
<p>PC-MDU (10.20.0.10) se PC-TRY (10.30.0.10) ko ping shuru karo. Pehla run hub se jaata hai. Hub dekhta hai ki traffic ek instance mein aaya aur usi template ke doosre instance se nikla, aur lagbhag 600 ms simulated time ke baad offer bhejta hai. Ping dobara chalao.</p>
<pre class="out">PC-MDU&gt; ping 10.30.0.10
84 bytes from 10.30.0.10 ttl=<span class="hl">61</span> time=...   <span class="c">(pehla run, HQ-FGT ke through)</span>
PC-MDU&gt; ping 10.30.0.10
84 bytes from 10.30.0.10 ttl=<span class="hl">62</span> time=...   <span class="c">(doosra run, shortcut)</span>

MDU-FGT # get router info routing-table all
B       10.30.0.0/24 [200/0] via 10.255.1.3 (recursive is directly connected, <span class="hl">TO-HQ_0</span>)
C       10.255.1.3/32 is directly connected, TO-HQ_0
S       10.255.1.2/32 [15/0] via KR-ADVPN tunnel 203.0.113.11</pre>
<p>Ise detective ki tarah padho. Shortcut ka naam <code>&lt;phase1&gt;_&lt;n&gt;</code> hota hai, isliye spoke par woh <code>TO-HQ_0</code> hai (hub par instances KR-ADVPN_0, _1 hain). Shortcut doosre spoke ke tunnel IP 10.255.1.3 ka /32 connected route install karta hai. BGP route wahi rehta hai, lekin uska next hop 10.255.1.3 ab shortcut se resolve hota hai. Isiliye hub ko next hop rewrite nahi karna chahiye. PC-MDU se traceroute 2 hops dikhata hai: MDU-FGT aur phir PC-TRY ka gateway, beech mein 10.255.1.1 nahi.</p>
<p><code>get vpn ipsec tunnel summary</code> bhi check karo: shortcut ki apni line aur apne packet counters hote hain.</p>

<h3>Clean up: idle-timeout aur dependent</h3>
<p>Jis shortcut ko koi use nahi kar raha woh hamesha zinda nahi rehna chahiye. Spoke phase 1 ke do options uski life control karte hain:</p>
<table class="cmp"><tr><th>Option</th><th>Effect</th></tr>
<tr><td><code>idle-timeout enable</code> + <code>idle-timeoutinterval 10</code></td><td>10 idle minutes ke baad shortcut gira deta hai. Minimum 10 (minutes) hai.</td></tr>
<tr><td><code>auto-discovery-shortcuts dependent</code></td><td>Parent tunnel TO-HQ down hote hi shortcut hata diya jaata hai.</td></tr>
<tr><td><code>auto-discovery-shortcuts independent</code> (default)</td><td>Parent fail hone par bhi shortcut zinda rehta hai, jab tak idle out na ho.</td></tr></table>
<pre class="code">config vpn ipsec phase1-interface
    edit "TO-HQ"
        set idle-timeout enable
        set idle-timeoutinterval 10
        set auto-discovery-shortcuts dependent
    next
end</pre>
<div class="exam"><p><b>Exam trap.</b> Idle-timeout minutes mein hai aur sabse chhoti value 10 hai, 1 nahi. "Dependent" ka matlab yeh nahi ki shortcut ko traffic ke liye hub chahiye, sirf yeh ki woh parent ke saath delete hota hai. Aur: hub par BGP options badalne ke baad <code>execute router clear bgp all</code> chalao, warna purana next hop tables mein rehta hai.</p></div>
<div class="note"><p>Exam theory, is lab mein modelled nahi: SD-WAN steering aur shortcuts ka NPU offload jaisi cheezein.</p></div>

<div class="scn"><h4>Kaveri ki file transfers Chennai ko saturate karti hain</h4><p>Madurai aur Trichy roz raat stock files exchange karte hain aur Chennai link 100 percent chalta hai. ADVPN configure tha, phir bhi traceroute mein 10.255.1.1 dikh raha tha. Engineer ko do wajah mili: TRY-FGT par auto-discovery-receiver nahi tha, aur hub neighbor-group mein next-hop-self-rr tha. Dono fix karke <code>execute router clear bgp all</code> chalaya, to doosre ping mein TTL 62 aaya aur hub link shant ho gaya.</p><p><b>Lesson:</b> shortcut ke liye willing spokes aur aisa BGP next hop chahiye jo doosre spoke ko point kare.</p></div>
<div class="iv"><p class="q">"ADVPN mein shortcut tunnel kaise banta hai, aur kya configure karna padta hai?"</p><p>Hub dekhta hai ki traffic do instances ke beech hairpin ho raha hai aur sender ki tarah dono spokes ko shortcut offer karta hai. Receiver wale spokes direct tunnel TO-HQ_0 negotiate karte hain. Chahiye: hairpin policy, hub par sender, spokes par receiver, aur unchanged BGP next hop.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub par sender, dono spokes par receiver, hub par hairpin policy.</li>
<li>Pehla ping hub se (TTL 61), agla shortcut se (TTL 62).</li>
<li>Shortcut ka naam TO-HQ_0 hai aur woh doosre spoke ke tunnel IP ka /32 route add karta hai.</li>
<li>Idle-timeout minimum 10 minutes; dependent shortcut ko parent ke saath hata deta hai.</li>
<li>Agar shortcuts se traffic chalana hai to reflector par next-hop-self-rr kabhi nahi.</li>
</ul></div>
`}};export{e as default};