var e={id:`routing`,h:{en:`Routing on the ASA: static, default and a first look at OSPF and BGP`,hi:`ASA par routing: static, default aur OSPF aur BGP ki pehli jhalak`},body:{en:`
<p>A security guard who knows exactly who may pass but not where the corridors lead is useless. In routed mode the ASA is a layer 3 hop, so it must know where every destination is. Most ASAs at the internet edge need only a handful of routes: connected networks, one default route to the ISP and perhaps a few static routes to internal networks behind a core switch. Still, the ASA route syntax is different from IOS, and it is the second most common cause of "nothing works" on a new box.</p>

<h3>The ASA static route</h3>
<pre class="code"><span class="c">! route &lt;nameif&gt; &lt;network&gt; &lt;mask&gt; &lt;next-hop&gt; [distance]</span>
route outside 0.0.0.0 0.0.0.0 203.0.113.1
<span class="c">! an internal network behind a core switch on the inside</span>
route inside 10.20.0.0 255.255.0.0 10.0.1.254</pre>
<p>The ASA route always names the <b>egress interface</b> (by nameif) before the destination. The next hop must be reachable on that interface's connected subnet. The optional last number is the <b>administrative distance</b> (default 1 for static routes). The shortcut <code>route outside 0 0 203.0.113.1</code> is accepted as well.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Routes on the ASA">
<rect x="250" y="60" width="140" height="60" rx="10" fill="#fed7aa"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">NK-ASA</text>
<rect x="470" y="65" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="545" y="87" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="545" y="105" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="20" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="100" y="42" text-anchor="middle" class="svg-ink" font-size="13">10.0.1.0/24</text><text x="100" y="60" text-anchor="middle" class="svg-muted" font-size="12">connected, inside</text>
<rect x="20" y="110" width="160" height="50" rx="8" fill="#bae6fd"/><text x="100" y="132" text-anchor="middle" class="svg-ink" font-size="13">10.20.0.0/16</text><text x="100" y="150" text-anchor="middle" class="svg-muted" font-size="12">via core 10.0.1.254</text>
<line x1="180" y1="45" x2="250" y2="80" stroke="#64748b"/><line x1="180" y1="135" x2="250" y2="100" stroke="#64748b"/>
<line x1="390" y1="90" x2="470" y2="90" stroke="#64748b"/>
<text x="430" y="80" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">route outside 0 0 203.0.113.1</text>
</svg><p class="cap">Connected routes come from the interfaces; everything else is a static or dynamic route that names the egress interface.</p></div>

<h3>Reading the routing table</h3>
<pre class="out">NK-ASA# show route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       * - candidate default, U - per-user static route
<span class="hl">Gateway of last resort is 203.0.113.1 to network 0.0.0.0</span>

<span class="hl">S*       0.0.0.0 0.0.0.0 [1/0] via 203.0.113.1, outside</span>
C        10.0.1.0 255.255.255.0 is directly connected, inside
L        10.0.1.1 255.255.255.255 is directly connected, inside
C        203.0.113.0 255.255.255.248 is directly connected, outside
L        203.0.113.2 255.255.255.255 is directly connected, outside</pre>
<p>Notice that the ASA prints <b>subnet masks</b>, not prefix lengths, and that every route ends with the interface name. C lines appear only when the interface has an address, a nameif and is up. L lines are the ASA's own addresses.</p>

<h3>Floating static routes and tracking (preview)</h3>
<p>A backup default route with a higher distance, here through a second ISP link on an interface named <code>backup</code>, stays out of the table while the primary exists:</p>
<pre class="code">route outside 0.0.0.0 0.0.0.0 203.0.113.1
route backup 0.0.0.0 0.0.0.0 198.51.100.1 254</pre>
<p>But a static route only disappears when its interface goes down. If the ISP router dies while the link stays up, the primary route stays and traffic is black-holed. The fix is <b>SLA monitor route tracking</b>, which you will build in the firewall deployment module.</p>

<h3>Dynamic routing on the ASA, briefly</h3>
<p>The ASA supports OSPFv2, OSPFv3, EIGRP and BGP. Two differences from IOS catch people out:</p>
<pre class="code"><span class="c">! OSPF: network statements use SUBNET masks on the ASA</span>
router ospf 1
 network 10.0.1.0 255.255.255.0 area 0
<span class="c">! BGP: neighbors are configured under the address family</span>
router bgp 65010
 address-family ipv4 unicast
  neighbor 203.0.113.1 remote-as 64500
  neighbor 203.0.113.1 activate
  network 203.0.113.0 mask 255.255.255.248</pre>
<p>Verify with <code>show ospf neighbor</code>, <code>show route ospf</code> and <code>show bgp summary</code>. In most enterprise designs the ASA runs OSPF with the core so internal routes are learned automatically, and either a static default or eBGP toward the ISP. Deep routing belongs to the ENCOR and ENARSI modules; here you only need to recognise the syntax.</p>

<div class="eg"><p><b>Worked example (lab task 2).</b> After the interfaces are up, the ASA knows only 10.0.1.0/24 and 203.0.113.0/29. PC1 tries 8.8.8.8: the ASA has no route and drops the packet. You add <code>route outside 0.0.0.0 0.0.0.0 203.0.113.1</code>. <code>show route</code> now shows the S* line and the gateway of last resort, and <code>ping 8.8.8.8</code> from the ASA itself succeeds, because the ASA sources that ping from its outside address, which the ISP knows.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing the IOS form <code>ip route 0.0.0.0 0.0.0.0 203.0.113.1</code>: the ASA rejects it. Naming the wrong interface (<code>route inside 0 0 203.0.113.1</code>): the next hop is not on that subnet. Using wildcard masks in OSPF network statements. Forgetting the internal routes: the ASA can reach the internet but not the 10.20.0.0/16 users behind the core, so their replies are sent to the ISP.</p></div>

<div class="exam"><p><b>Exam trap.</b> A ping from the ASA to 8.8.8.8 succeeding does <b>not</b> prove users can reach the internet. The ASA's own ping uses the outside address; users' traffic still needs NAT (chapter 9), and ICMP replies for users need inspection (chapter 10).</p></div>

<div class="scn"><h4>Half the company offline after a firewall swap</h4><p>A company replaced an old firewall with an ASA. Users on 10.0.1.0/24 worked, but the finance floor on 10.20.30.0/24 behind the core switch could not reach the internet. <code>show route</code> on the ASA had no route for 10.20.0.0/16, so replies for finance followed the default route out to the ISP. The old firewall had learned it via OSPF, which nobody migrated. Adding <code>route inside 10.20.0.0 255.255.0.0 10.0.1.254</code> (and later OSPF with the core) fixed it.</p><p><b>Lesson:</b> the ASA must know the way back to every internal network, not just the way out.</p></div>

<div class="iv"><p class="q">"How is a static route different on an ASA compared with a router?"</p><p>Strong answer: the ASA syntax is <code>route &lt;nameif&gt; &lt;network&gt; &lt;mask&gt; &lt;next-hop&gt; [distance]</code>, so you always name the egress interface; there is no <code>ip route</code>. Verification is <code>show route</code>, which prints masks and interface names. Mention that the ASA also runs OSPF (with subnet masks in network statements), EIGRP and BGP, and that static routes need SLA tracking for reliable ISP failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA static route: <code>route &lt;nameif&gt; &lt;net&gt; &lt;mask&gt; &lt;next-hop&gt; [AD]</code>.</li>
<li><code>show route</code> prints masks and interface names; look for the gateway of last resort.</li>
<li>Floating statics need tracking to fail over when the ISP router, not the link, fails.</li>
<li>OSPF on the ASA uses subnet masks; BGP neighbors live under the address family.</li>
<li>Always add routes back to internal networks behind other routers.</li>
</ul></div>
`,hi:`
<p>Ek security guard jo exactly jaanta hai ki kaun pass ho sakta hai lekin yeh nahi jaanta ki corridors kahan jaate hain, kisi kaam ka nahi. Routed mode mein ASA ek layer 3 hop hai, isliye use har destination ka pata hona chahiye. Internet edge par zyada tar ASAs ko sirf kuch hi routes chahiye: connected networks, ISP ki taraf ek default route aur shayad core switch ke peeche internal networks ke liye kuch static routes. Phir bhi, ASA route syntax IOS se alag hai, aur naye box par "kuch kaam nahi karta" ki yeh doosri sabse common wajah hai.</p>

<h3>ASA static route</h3>
<pre class="code"><span class="c">! route &lt;nameif&gt; &lt;network&gt; &lt;mask&gt; &lt;next-hop&gt; [distance]</span>
route outside 0.0.0.0 0.0.0.0 203.0.113.1
<span class="c">! inside par core switch ke peeche ek internal network</span>
route inside 10.20.0.0 255.255.0.0 10.0.1.254</pre>
<p>ASA route hamesha destination se pehle <b>egress interface</b> (nameif se) ka naam leta hai. Next hop us interface ke connected subnet par reachable hona chahiye. Optional aakhri number <b>administrative distance</b> hai (static routes ke liye default 1). Shortcut <code>route outside 0 0 203.0.113.1</code> bhi accept hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="ASA par routes">
<rect x="250" y="60" width="140" height="60" rx="10" fill="#fed7aa"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">NK-ASA</text>
<rect x="470" y="65" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="545" y="87" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="545" y="105" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="20" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="100" y="42" text-anchor="middle" class="svg-ink" font-size="13">10.0.1.0/24</text><text x="100" y="60" text-anchor="middle" class="svg-muted" font-size="12">connected, inside</text>
<rect x="20" y="110" width="160" height="50" rx="8" fill="#bae6fd"/><text x="100" y="132" text-anchor="middle" class="svg-ink" font-size="13">10.20.0.0/16</text><text x="100" y="150" text-anchor="middle" class="svg-muted" font-size="12">core 10.0.1.254 se</text>
<line x1="180" y1="45" x2="250" y2="80" stroke="#64748b"/><line x1="180" y1="135" x2="250" y2="100" stroke="#64748b"/>
<line x1="390" y1="90" x2="470" y2="90" stroke="#64748b"/>
<text x="430" y="80" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">route outside 0 0 203.0.113.1</text>
</svg><p class="cap">Connected routes interfaces se aate hain; baaki sab static ya dynamic route hai jo egress interface ka naam leta hai.</p></div>

<h3>Routing table padhna</h3>
<pre class="out">NK-ASA# show route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       * - candidate default, U - per-user static route
<span class="hl">Gateway of last resort is 203.0.113.1 to network 0.0.0.0</span>

<span class="hl">S*       0.0.0.0 0.0.0.0 [1/0] via 203.0.113.1, outside</span>
C        10.0.1.0 255.255.255.0 is directly connected, inside
L        10.0.1.1 255.255.255.255 is directly connected, inside
C        203.0.113.0 255.255.255.248 is directly connected, outside
L        203.0.113.2 255.255.255.255 is directly connected, outside</pre>
<p>Dhyan do ki ASA <b>subnet masks</b> print karta hai, prefix lengths nahi, aur har route interface ke naam par khatam hota hai. C lines tabhi dikhti hain jab interface ka address ho, nameif ho aur woh up ho. L lines ASA ke apne addresses hain.</p>

<h3>Floating static routes aur tracking (preview)</h3>
<p>Zyada distance wala backup default route, yahan <code>backup</code> naam ke interface par doosre ISP link ke through, table se bahar rehta hai jab tak primary maujood hai:</p>
<pre class="code">route outside 0.0.0.0 0.0.0.0 203.0.113.1
route backup 0.0.0.0 0.0.0.0 198.51.100.1 254</pre>
<p>Lekin static route tabhi gayab hota hai jab uska interface down ho. Agar ISP router mar jaaye lekin link up rahe, to primary route bana rehta hai aur traffic black-hole ho jaata hai. Iska fix <b>SLA monitor route tracking</b> hai, jo aap firewall deployment module mein banaoge.</p>

<h3>ASA par dynamic routing, sankshep mein</h3>
<p>ASA OSPFv2, OSPFv3, EIGRP aur BGP support karta hai. IOS se do differences logon ko phasa dete hain:</p>
<pre class="code"><span class="c">! OSPF: ASA par network statements SUBNET masks use karte hain</span>
router ospf 1
 network 10.0.1.0 255.255.255.0 area 0
<span class="c">! BGP: neighbors address family ke neeche configure hote hain</span>
router bgp 65010
 address-family ipv4 unicast
  neighbor 203.0.113.1 remote-as 64500
  neighbor 203.0.113.1 activate
  network 203.0.113.0 mask 255.255.255.248</pre>
<p><code>show ospf neighbor</code>, <code>show route ospf</code> aur <code>show bgp summary</code> se verify karo. Zyada tar enterprise designs mein ASA core ke saath OSPF chalata hai taaki internal routes apne aap seekh le, aur ISP ki taraf ya to static default ya eBGP. Deep routing ENCOR aur ENARSI modules ka kaam hai; yahan aapko sirf syntax pehchaanna hai.</p>

<div class="eg"><p><b>Worked example (lab task 2).</b> Interfaces up hone ke baad ASA sirf 10.0.1.0/24 aur 203.0.113.0/29 jaanta hai. PC1 8.8.8.8 try karta hai: ASA ke paas route nahi hai aur woh packet drop kar deta hai. Aap <code>route outside 0.0.0.0 0.0.0.0 203.0.113.1</code> jodte ho. <code>show route</code> ab S* line aur gateway of last resort dikhata hai, aur ASA se khud <code>ping 8.8.8.8</code> successful hota hai, kyunki ASA woh ping apne outside address se source karta hai, jise ISP jaanta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> IOS form <code>ip route 0.0.0.0 0.0.0.0 203.0.113.1</code> type karna: ASA ise reject karta hai. Galat interface ka naam dena (<code>route inside 0 0 203.0.113.1</code>): next hop us subnet par nahi hai. OSPF network statements mein wildcard masks use karna. Internal routes bhool jaana: ASA internet tak pahunch jaata hai lekin core ke peeche ke 10.20.0.0/16 users tak nahi, isliye unke replies ISP ko bhej diye jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> ASA se 8.8.8.8 ka ping successful hona yeh saabit <b>nahi</b> karta ki users internet tak pahunch sakte hain. ASA ka apna ping outside address use karta hai; users ke traffic ko phir bhi NAT (chapter 9) chahiye, aur users ke ICMP replies ko inspection (chapter 10) chahiye.</p></div>

<div class="scn"><h4>Firewall swap ke baad aadhi company offline</h4><p>Ek company ne purane firewall ki jagah ASA lagaya. 10.0.1.0/24 par users chal rahe the, lekin core switch ke peeche 10.20.30.0/24 wala finance floor internet tak nahi pahunch pa raha tha. ASA par <code>show route</code> mein 10.20.0.0/16 ka koi route nahi tha, isliye finance ke replies default route follow karke ISP ki taraf chale jaate the. Purane firewall ne ise OSPF se seekha tha, jise kisi ne migrate nahi kiya. <code>route inside 10.20.0.0 255.255.0.0 10.0.1.254</code> jodne se (aur baad mein core ke saath OSPF se) theek ho gaya.</p><p><b>Seekh:</b> ASA ko har internal network tak wapas jaane ka raasta pata hona chahiye, sirf bahar jaane ka nahi.</p></div>

<div class="iv"><p class="q">"Router ke comparison mein ASA par static route kaise alag hota hai?"</p><p>Strong answer: ASA syntax <code>route &lt;nameif&gt; &lt;network&gt; &lt;mask&gt; &lt;next-hop&gt; [distance]</code> hai, isliye aap hamesha egress interface ka naam dete ho; <code>ip route</code> nahi hota. Verification <code>show route</code> hai, jo masks aur interface names print karta hai. Batao ki ASA OSPF (network statements mein subnet masks ke saath), EIGRP aur BGP bhi chalata hai, aur reliable ISP failover ke liye static routes ko SLA tracking chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA static route: <code>route &lt;nameif&gt; &lt;net&gt; &lt;mask&gt; &lt;next-hop&gt; [AD]</code>.</li>
<li><code>show route</code> masks aur interface names print karta hai; gateway of last resort dekho.</li>
<li>Floating statics ko tracking chahiye taaki link nahi, ISP router fail hone par failover ho.</li>
<li>ASA par OSPF subnet masks use karta hai; BGP neighbors address family ke neeche rehte hain.</li>
<li>Doosre routers ke peeche ke internal networks ke liye hamesha wapas ke routes jodo.</li>
</ul></div>
`}};export{e as default};