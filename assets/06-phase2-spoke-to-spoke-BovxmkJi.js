var e={id:`phase2-spoke-to-spoke`,h:{en:`Phase 2 in action: a spoke-to-spoke tunnel is born`,hi:`Phase 2 action mein: spoke-to-spoke tunnel ka janm`},body:{en:`
<p>Picture two branch managers who have each other's phone number written in their notebook, but not each other's street address. The first time Pune ships to Kochi, the parcel goes via Delhi while Pune phones Delhi for Kochi's street address. From then on, parcels go straight. In phase 2 the "phone number" is the next-hop tunnel address in the routing table, and the "street address" is the NBMA address that NHRP resolves.</p>

<h3>Precondition: the right next hop</h3>
<p>Phase 2 only works if SPOKE1's route to Kochi's LAN names <b>SPOKE2's tunnel address</b> as next hop. With OSPF broadcast (chapter 9) that is exactly what happens, because the DR does not change the next hop:</p>
<pre class="out">SPOKE1# show ip route 10.3.3.0
Routing entry for 10.3.3.0/24
  Known via "ospf 1", distance 110, metric 1001, type intra area
  Last update from 172.16.100.3 on Tunnel0, 00:03:12 ago
  Routing Descriptor Blocks:
<span class="hl">  * 172.16.100.3, from 3.3.3.3, 00:03:12 ago, via Tunnel0</span>
      Route metric is 1001, traffic share count is 1</pre>
<p>This is lab 1, task 4. Metric 1001 = tunnel cost 1000 (default 100 kbit/s bandwidth) + Kochi LAN cost 1. If this line said <code>172.16.100.1</code>, phase 2 could never build a direct tunnel.</p>

<h3>The five steps</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Phase 2 resolution sequence">
<defs><marker id="p6e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="40" y="10" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="100" y="30" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1</text>
<rect x="260" y="10" width="120" height="30" rx="6" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">HUB</text>
<rect x="480" y="10" width="120" height="30" rx="6" fill="#fde68a"/><text x="540" y="30" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2</text>
<line x1="100" y1="40" x2="100" y2="260" stroke="#64748b" stroke-dasharray="3 3"/><line x1="320" y1="40" x2="320" y2="260" stroke="#64748b" stroke-dasharray="3 3"/><line x1="540" y1="40" x2="540" y2="260" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="100" y1="65" x2="316" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#p6e)"/><line x1="320" y1="65" x2="536" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#p6e)"/><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">1 first data packets via hub</text>
<line x1="100" y1="105" x2="316" y2="105" stroke="#64748b" stroke-width="1.5" marker-end="url(#p6e)"/><text x="208" y="98" text-anchor="middle" class="svg-ink" font-size="12">2 Resolution Req .3</text>
<line x1="320" y1="140" x2="536" y2="140" stroke="#64748b" stroke-width="1.5" marker-end="url(#p6e)"/><text x="430" y="133" text-anchor="middle" class="svg-ink" font-size="12">3 forwarded</text>
<line x1="540" y1="180" x2="104" y2="180" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#p6e)"/><text x="320" y="173" text-anchor="middle" class="svg-accent" font-size="12">4 Resolution Reply direct (100.64.30.2)</text>
<line x1="100" y1="225" x2="536" y2="225" stroke="#64748b" stroke-width="3" marker-end="url(#p6e)"/><text x="320" y="217" text-anchor="middle" class="svg-accent" font-size="12">5 data spoke to spoke</text>
</svg><p class="cap">The first packets take the hub path while NHRP resolves; after the reply, traffic flows directly.</p></div>
<ol>
<li><b>First packets.</b> PC1 pings 10.3.3.10. SPOKE1 looks up the route (next hop 172.16.100.3) and finds no NHRP mapping for it. Instead of dropping, it forwards the packet to its NHS, the hub, which has SPOKE2's mapping from registration and delivers it. Nothing is lost.</li>
<li><b>Resolution Request.</b> At the same time SPOKE1 sends an NHRP Resolution Request "who is 172.16.100.3?" to the hub. It includes SPOKE1's own tunnel-to-NBMA mapping.</li>
<li><b>Forwarding.</b> The hub knows 172.16.100.3 belongs to a registered client and forwards the request to SPOKE2.</li>
<li><b>Resolution Reply.</b> SPOKE2 learns SPOKE1's mapping from the request and answers <b>directly</b> to SPOKE1's NBMA address 100.64.20.2: "172.16.100.3 is at 100.64.30.2". With IPsec, IKE between the two spokes runs first (chapter 10).</li>
<li><b>Direct traffic.</b> SPOKE1 installs a dynamic entry; later packets are encapsulated straight to 100.64.30.2. The return direction resolves in the same way, so both spokes end up with a <b>D</b> entry for each other.</li>
</ol>

<h3>Verification (lab 1, tasks 5 and 6)</h3>
<pre class="out">SPOKE1# show dmvpn
Interface: Tunnel0, IPv4 NHRP Details
Type:Spoke, NHRP Peers:2,

 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb
 ----- --------------- --------------- ----- -------- -----
     1 100.64.10.2        172.16.100.1    UP 00:20:11     S
<span class="hl">     1 100.64.30.2        172.16.100.3    UP 00:00:09     D</span></pre>
<pre class="out">SPOKE1# show ip nhrp 172.16.100.3
172.16.100.3/32 via 172.16.100.3
   Tunnel0 created 00:00:09, expire 00:04:50
   Type: dynamic, Flags: router used nhop
<span class="hl">   NBMA address: 100.64.30.2</span></pre>
<p>The answer to task 6, "which Peer NBMA address does SPOKE1 use for 172.16.100.3?", is <b>100.64.30.2</b>. The <code>expire</code> timer comes from SPOKE2's holdtime (300 s). While traffic keeps using the entry, NHRP refreshes it before it expires; when the conversation stops, the entry ages out and the tunnel disappears.</p>

<div class="eg"><p><b>Worked example: reading traceroute.</b> Before resolution, a trace from PC1 shows hop 1 = 10.2.2.1 (SPOKE1), hop 2 = <b>172.16.100.1</b> (the hub decrements TTL and answers from its tunnel IP), hop 3 = 172.16.100.3, hop 4 = 10.3.3.10. After resolution: hop 1 = 10.2.2.1, hop 2 = <b>172.16.100.3</b>, hop 3 = 10.3.3.10. One hop fewer and the hub has vanished from the path. The lab checks exactly this: the path from PC1 to 10.3.3.10 must not cross HUB.</p></div>
<pre class="out">PC1&gt; trace 10.3.3.10
trace to 10.3.3.10, 8 hops max, press Ctrl+C to stop
 1   10.2.2.1       1.012 ms
<span class="hl"> 2   172.16.100.3   9.870 ms</span>
 3   10.3.3.10     11.204 ms</pre>

<div class="warn"><p><b>Common mistake.</b> Declaring the lab broken because the very first ping shows higher latency or one lost echo. The first packets always take the hub path while NHRP (and, with IPsec, IKE) finishes. Ping twice, then check <code>show dmvpn</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> In phase 2 the Resolution Request asks for the <b>next-hop tunnel address</b> (172.16.100.3/32). In phase 3 it asks for the <b>destination</b> and the answer is the whole prefix (10.3.3.0/24). And the Resolution Reply always travels directly between the spokes, not back through the hub.</p></div>

<div class="scn"><h4>Direct tunnels never form behind a firewall</h4><p>A company ran phase 2 correctly: routes pointed to the far spoke, resolution requests went out, but <code>show dmvpn</code> on the spokes showed the peer stuck in state NHRP with attribute I (incomplete) and all traffic stayed on the hub path. Capturing on a branch showed the replies from the other spoke were blocked by a new branch firewall that only allowed GRE and ESP to and from the hub's address. Allowing GRE, ESP and UDP 500/4500 from any branch public range fixed it.</p><p><b>Lesson:</b> spoke-to-spoke means the underlay must allow spokes to reach each other's NBMA addresses, not only the hub.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when a phase 2 spoke sends the first packet to another spoke."</p><p>Strong answer: the route's next hop is the far spoke's tunnel IP with no NHRP entry, so the spoke sends data via the hub and a Resolution Request to the NHS. The hub forwards it to the owning spoke, which learns the requester's mapping and replies directly with its NBMA address (after IKE if protected). Both install dynamic entries and later traffic flows spoke to spoke; entries refresh while used and expire after the holdtime.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 2 trigger: route next hop = far spoke tunnel IP without an NHRP entry.</li>
<li>First packets go via the hub; nothing is dropped during resolution.</li>
<li>Resolution Request goes via the NHS; the Reply goes directly between spokes.</li>
<li>Verify with <code>show dmvpn</code> (D entry) and <code>show ip nhrp</code> (NBMA address); traceroute should skip the hub.</li>
<li>The underlay must permit spoke-to-spoke GRE (and IPsec) traffic.</li>
</ul></div>
`,hi:`
<p>Do branch managers socho jinki notebook mein ek doosre ka phone number likha hai, lekin street address nahi. Pehli baar jab Pune Kochi ko parcel bhejta hai, parcel Delhi se jaata hai jabki Pune Delhi ko phone karke Kochi ka street address poochta hai. Uske baad parcels seedhe jaate hain. Phase 2 mein "phone number" routing table ka next-hop tunnel address hai, aur "street address" woh NBMA address hai jo NHRP resolve karta hai.</p>

<h3>Precondition: sahi next hop</h3>
<p>Phase 2 tabhi chalta hai jab Kochi ki LAN ke liye SPOKE1 ka route next hop mein <b>SPOKE2 ka tunnel address</b> likhe. OSPF broadcast ke saath (chapter 9) bilkul yahi hota hai, kyunki DR next hop nahi badalta:</p>
<pre class="out">SPOKE1# show ip route 10.3.3.0
Routing entry for 10.3.3.0/24
  Known via "ospf 1", distance 110, metric 1001, type intra area
  Last update from 172.16.100.3 on Tunnel0, 00:03:12 ago
  Routing Descriptor Blocks:
<span class="hl">  * 172.16.100.3, from 3.3.3.3, 00:03:12 ago, via Tunnel0</span>
      Route metric is 1001, traffic share count is 1</pre>
<p>Yeh lab 1, task 4 hai. Metric 1001 = tunnel cost 1000 (default 100 kbit/s bandwidth) + Kochi LAN cost 1. Agar yeh line <code>172.16.100.1</code> kehti, to phase 2 kabhi direct tunnel nahi bana paata.</p>

<h3>Paanch steps</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Phase 2 resolution sequence">
<defs><marker id="p6h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="40" y="10" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="100" y="30" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1</text>
<rect x="260" y="10" width="120" height="30" rx="6" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">HUB</text>
<rect x="480" y="10" width="120" height="30" rx="6" fill="#fde68a"/><text x="540" y="30" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2</text>
<line x1="100" y1="40" x2="100" y2="260" stroke="#64748b" stroke-dasharray="3 3"/><line x1="320" y1="40" x2="320" y2="260" stroke="#64748b" stroke-dasharray="3 3"/><line x1="540" y1="40" x2="540" y2="260" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="100" y1="65" x2="316" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#p6h)"/><line x1="320" y1="65" x2="536" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#p6h)"/><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">1 pehle data packets hub se</text>
<line x1="100" y1="105" x2="316" y2="105" stroke="#64748b" stroke-width="1.5" marker-end="url(#p6h)"/><text x="208" y="98" text-anchor="middle" class="svg-ink" font-size="12">2 Resolution Req .3</text>
<line x1="320" y1="140" x2="536" y2="140" stroke="#64748b" stroke-width="1.5" marker-end="url(#p6h)"/><text x="430" y="133" text-anchor="middle" class="svg-ink" font-size="12">3 forward</text>
<line x1="540" y1="180" x2="104" y2="180" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#p6h)"/><text x="320" y="173" text-anchor="middle" class="svg-accent" font-size="12">4 Resolution Reply seedha (100.64.30.2)</text>
<line x1="100" y1="225" x2="536" y2="225" stroke="#64748b" stroke-width="3" marker-end="url(#p6h)"/><text x="320" y="217" text-anchor="middle" class="svg-accent" font-size="12">5 data spoke se spoke</text>
</svg><p class="cap">NHRP resolve hone tak pehle packets hub path lete hain; reply ke baad traffic seedha jaata hai.</p></div>
<ol>
<li><b>Pehle packets.</b> PC1 10.3.3.10 ping karta hai. SPOKE1 route dekhta hai (next hop 172.16.100.3) aur uske liye koi NHRP mapping nahi paata. Drop karne ki jagah woh packet apne NHS, yaani hub, ko forward karta hai, jiske paas registration se SPOKE2 ki mapping hai aur woh use deliver kar deta hai. Kuch loss nahi hota.</li>
<li><b>Resolution Request.</b> Saath hi SPOKE1 hub ko NHRP Resolution Request "172.16.100.3 kaun hai?" bhejta hai. Isme SPOKE1 ki apni tunnel-to-NBMA mapping bhi hoti hai.</li>
<li><b>Forwarding.</b> Hub jaanta hai ki 172.16.100.3 ek registered client ka hai aur request SPOKE2 ko forward karta hai.</li>
<li><b>Resolution Reply.</b> SPOKE2 request se SPOKE1 ki mapping seekhta hai aur SPOKE1 ke NBMA address 100.64.20.2 par <b>seedha</b> jawab deta hai: "172.16.100.3 100.64.30.2 par hai". IPsec ho to pehle dono spokes ke beech IKE chalta hai (chapter 10).</li>
<li><b>Direct traffic.</b> SPOKE1 dynamic entry install karta hai; aage ke packets seedhe 100.64.30.2 par encapsulate hote hain. Return direction bhi aise hi resolve hoti hai, isliye dono spokes ke paas ek doosre ki <b>D</b> entry ban jaati hai.</li>
</ol>

<h3>Verification (lab 1, tasks 5 aur 6)</h3>
<pre class="out">SPOKE1# show dmvpn
Interface: Tunnel0, IPv4 NHRP Details
Type:Spoke, NHRP Peers:2,

 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb
 ----- --------------- --------------- ----- -------- -----
     1 100.64.10.2        172.16.100.1    UP 00:20:11     S
<span class="hl">     1 100.64.30.2        172.16.100.3    UP 00:00:09     D</span></pre>
<pre class="out">SPOKE1# show ip nhrp 172.16.100.3
172.16.100.3/32 via 172.16.100.3
   Tunnel0 created 00:00:09, expire 00:04:50
   Type: dynamic, Flags: router used nhop
<span class="hl">   NBMA address: 100.64.30.2</span></pre>
<p>Task 6 ka jawab, "SPOKE1 172.16.100.3 ke liye kaunsa Peer NBMA address use karta hai?", <b>100.64.30.2</b> hai. <code>expire</code> timer SPOKE2 ke holdtime (300 s) se aata hai. Jab tak traffic entry use karta rehta hai, NHRP use expire hone se pehle refresh karta hai; baat-cheet rukne par entry age out hoti hai aur tunnel gayab ho jaata hai.</p>

<div class="eg"><p><b>Worked example: traceroute padhna.</b> Resolution se pehle PC1 ka trace dikhata hai hop 1 = 10.2.2.1 (SPOKE1), hop 2 = <b>172.16.100.1</b> (hub TTL ghatata hai aur apne tunnel IP se jawab deta hai), hop 3 = 172.16.100.3, hop 4 = 10.3.3.10. Resolution ke baad: hop 1 = 10.2.2.1, hop 2 = <b>172.16.100.3</b>, hop 3 = 10.3.3.10. Ek hop kam aur hub path se gayab. Lab bilkul yahi check karti hai: PC1 se 10.3.3.10 ka path HUB se nahi guzarna chahiye.</p></div>
<pre class="out">PC1&gt; trace 10.3.3.10
trace to 10.3.3.10, 8 hops max, press Ctrl+C to stop
 1   10.2.2.1       1.012 ms
<span class="hl"> 2   172.16.100.3   9.870 ms</span>
 3   10.3.3.10     11.204 ms</pre>

<div class="warn"><p><b>Common galti.</b> Lab ko broken declare karna kyunki bilkul pehla ping zyada latency ya ek lost echo dikhata hai. NHRP (aur IPsec ho to IKE) poora hone tak pehle packets hamesha hub path lete hain. Do baar ping karo, phir <code>show dmvpn</code> check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Phase 2 mein Resolution Request <b>next-hop tunnel address</b> (172.16.100.3/32) ke liye poochta hai. Phase 3 mein yeh <b>destination</b> ke liye poochta hai aur jawab poora prefix (10.3.3.0/24) hota hai. Aur Resolution Reply hamesha spokes ke beech seedha jaata hai, hub se wapas nahi.</p></div>

<div class="scn"><h4>Firewall ke peeche direct tunnels kabhi nahi bante</h4><p>Ek company phase 2 sahi chala rahi thi: routes door wale spoke ki taraf the, resolution requests ja rahi thi, lekin spokes par <code>show dmvpn</code> peer ko state NHRP aur attribute I (incomplete) mein atka dikhata tha aur saara traffic hub path par hi rehta tha. Branch par capture karne se pata chala ki doosre spoke ke replies ek naye branch firewall ne block kiye the jo sirf hub ke address se GRE aur ESP allow karta tha. Kisi bhi branch public range se GRE, ESP aur UDP 500/4500 allow karne se theek ho gaya.</p><p><b>Seekh:</b> spoke-to-spoke ka matlab hai underlay ko spokes ko ek doosre ke NBMA addresses tak pahunchne dena hoga, sirf hub tak nahi.</p></div>

<div class="iv"><p class="q">"Jab phase 2 spoke doosre spoke ko pehla packet bhejta hai to kya hota hai, step by step batao."</p><p>Strong answer: route ka next hop door wale spoke ka tunnel IP hai jiski NHRP entry nahi hai, isliye spoke data hub ke through bhejta hai aur NHS ko Resolution Request bhejta hai. Hub use owner spoke tak forward karta hai, jo requester ki mapping seekhta hai aur apne NBMA address ke saath seedha reply karta hai (protected ho to IKE ke baad). Dono dynamic entries install karte hain aur aage ka traffic spoke se spoke jaata hai; use hone tak entries refresh hoti hain aur holdtime ke baad expire hoti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 2 trigger: route ka next hop = door wale spoke ka tunnel IP jiski NHRP entry nahi hai.</li>
<li>Pehle packets hub se jaate hain; resolution ke dauraan kuch drop nahi hota.</li>
<li>Resolution Request NHS se jaati hai; Reply seedha spokes ke beech jaata hai.</li>
<li><code>show dmvpn</code> (D entry) aur <code>show ip nhrp</code> (NBMA address) se verify karo; traceroute mein hub nahi dikhna chahiye.</li>
<li>Underlay ko spoke-to-spoke GRE (aur IPsec) traffic allow karna chahiye.</li>
</ul></div>
`}};export{e as default};