var e={id:`loopback-peering`,h:{en:`Peering between loopbacks: update-source and ebgp-multihop`,hi:`Loopbacks ke beech peering: update-source aur ebgp-multihop`},body:{en:`
<p>If your business partner only has one phone number and that line goes dead, the deal stops even though the partner is fine. Give them your office reception number instead, which is reachable over several lines, and one dead line no longer matters. Peering BGP between <b>loopback</b> interfaces does the same: a loopback never goes down while the router is alive, and it can be reached over any available link.</p>

<h3>Why eBGP expects a directly connected peer</h3>
<p>By default IOS sends eBGP packets with <b>TTL 1</b> and performs a <b>connected check</b>: the neighbor address must sit in a directly connected subnet. Both are safety features. Most eBGP sessions run across one link between two companies, and the TTL of 1 means a packet from further away cannot reach the BGP process. If you point an eBGP neighbor at a loopback, the check fails and the session sits in <b>Idle</b>. It will never even try TCP.</p>

<h3>The three ingredients</h3>
<p>To peer eBGP between loopbacks, you need on <b>both</b> routers:</p>
<ol>
<li><b>A route to the peer's loopback</b>: a static route (as in lab 2) or an IGP. Without it the session stays Idle because there is no path to open TCP.</li>
<li><b><code>neighbor x update-source Loopback0</code></b>: source the TCP connection from your own loopback. The peer has your <b>loopback</b> configured as its neighbor address; a SYN from your physical interface address does not match and is refused.</li>
<li><b><code>neighbor x ebgp-multihop 2</code></b>: raise the TTL and disable the connected check. Two is enough for directly connected routers; use a larger number if the peer is really further away.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 2 loopback peering between R2 and R3">
<rect x="10" y="90" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="112" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="65" y="130" text-anchor="middle" class="svg-muted" font-size="12">AS 65101</text>
<rect x="175" y="90" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="235" y="112" text-anchor="middle" class="svg-ink" font-size="13">R2 AS 65102</text><text x="235" y="130" text-anchor="middle" class="svg-muted" font-size="12">Lo0 2.2.2.2</text>
<rect x="345" y="90" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="112" text-anchor="middle" class="svg-ink" font-size="13">R3 AS 65103</text><text x="405" y="130" text-anchor="middle" class="svg-muted" font-size="12">Lo0 3.3.3.3</text>
<rect x="515" y="90" width="115" height="50" rx="8" fill="#ddd6fe"/><text x="572" y="112" text-anchor="middle" class="svg-ink" font-size="13">R4</text><text x="572" y="130" text-anchor="middle" class="svg-muted" font-size="12">AS 65104</text>
<line x1="120" y1="115" x2="175" y2="115" stroke="#64748b" stroke-width="2"/><text x="147" y="165" text-anchor="middle" class="svg-muted" font-size="12">10.12.0.0/30</text>
<line x1="295" y1="115" x2="345" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">10.23.0.0/30</text>
<line x1="465" y1="115" x2="515" y2="115" stroke="#64748b" stroke-width="2"/><text x="490" y="165" text-anchor="middle" class="svg-muted" font-size="12">10.34.0.0/30</text>
<path d="M235 90 C 270 30, 370 30, 405 90" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">eBGP 2.2.2.2 to 3.3.3.3</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Static routes: R2 to 3.3.3.3 via 10.23.0.2, R3 to 2.2.2.2 via 10.23.0.1</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">R1-R2 and R3-R4 peer on the link addresses</text>
</svg><p class="cap">Lab 2: the carriers R2 and R3 peer between loopbacks; the edge sessions use interface addresses.</p></div>

<h3>Walking lab 2</h3>
<p>R2 and R3 already have their static routes to each other's loopback. R3 also has part of the session:</p>
<pre class="code"><span class="c">! R3 as delivered (half finished)</span>
router bgp 65103
 bgp router-id 3.3.3.3
 neighbor 2.2.2.2 remote-as 65102
 neighbor 2.2.2.2 update-source Loopback0
 neighbor 10.34.0.2 remote-as 65104</pre>
<p><b>Task 1</b> brings up R1 with <code>router bgp 65101</code>, <code>neighbor 10.12.0.2 remote-as 65102</code> and <code>network 172.31.1.0 mask 255.255.255.0</code>. <b>Task 2</b> adds the loopback session on R2:</p>
<pre class="code">R2(config)# router bgp 65102
R2(config-router)# neighbor 3.3.3.3 remote-as 65103
R2(config-router)# neighbor 3.3.3.3 update-source Loopback0
<span class="c">! TCP will be sourced from 2.2.2.2, which R3 expects</span>
R2(config-router)# neighbor 3.3.3.3 ebgp-multihop 2
<span class="c">! TTL 2 and no connected check</span></pre>
<p><b>Task 3</b>: the session still does not come up, because R3 is missing one line. Ask R3 what it thinks:</p>
<pre class="out">R3# show ip bgp neighbors 2.2.2.2
BGP neighbor is 2.2.2.2,  remote AS 65102, external link
  BGP version 4, remote router ID 0.0.0.0
<span class="hl">  BGP state = Idle</span>
  ...
<span class="hl">  External BGP neighbor not directly connected.</span>
  ...
  No active TCP connection</pre>
<p>The fix is <code>neighbor 2.2.2.2 ebgp-multihop 2</code> on R3. Seconds later both routers log <code>%BGP-5-ADJCHANGE: neighbor ... Up</code>.</p>

<h3>What the next hop becomes</h3>
<p>Over the loopback session the next hop is the peer's loopback. On R2:</p>
<pre class="out">R2# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;   172.31.1.0/24    10.12.0.1                0             0 65101 i
<span class="hl"> *&gt;   172.31.4.0/24    3.3.3.3                                0 65103 65104 i</span></pre>
<p>R2 resolves 3.3.3.3 through its static route (a <b>recursive lookup</b>), so the route is valid (<code>*</code>) and best (<code>&gt;</code>). When R2 passes the route to R1, it sets the next hop to its own address on that session, 10.12.0.2, and prepends 65102. <b>Task 4</b> checks exactly that: R1 sees <code>65102 65103 65104</code>, and R4 sees 172.31.1.0/24 as <code>65103 65102 65101</code>. <b>Task 5</b> proves it with a ping from PC1 to PC4.</p>

<div class="eg"><p><b>Worked example.</b> Why does <code>ebgp-multihop 2</code> work between routers that are only one link apart? Strictly, a TTL 1 packet sent to a directly connected router's loopback still arrives, because it is delivered locally and not forwarded. The real blocker is the connected check. That is why <code>neighbor 2.2.2.2 disable-connected-check</code> alone would also work here. <code>ebgp-multihop</code> is more common because it covers both cases: it disables the check and allows peers that are genuinely several hops away.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>update-source</code> on one side only. The session may still come up, but only when the correctly configured side happens to open the TCP connection; attempts from the other side are refused because they arrive from an unexpected address. It flaps or takes minutes after every reset. Configure it on both sides.</p></div>

<div class="exam"><p><b>Exam trap.</b> Without <code>ebgp-multihop</code> the eBGP loopback session is <b>Idle</b> (no attempt). Without <code>update-source</code> it is usually <b>Active</b> (TCP refused). Without a route to the loopback it is <b>Idle</b>. The state tells you which ingredient is missing.</p></div>

<div class="scn"><h4>A dual-link peering that did not survive a link failure</h4><p>Two data centres connected by two parallel 10G links ran eBGP on one link's addresses. When that link failed, the session dropped for 180 seconds until the hold timer expired, although the second link was fine. The team moved the session to loopbacks, added static routes to each loopback over both links, <code>update-source Loopback0</code> and <code>ebgp-multihop 2</code> on both sides. The next link failure caused no BGP event at all.</p><p><b>Lesson:</b> loopback peering decouples the BGP session from any single physical link.</p></div>

<div class="iv"><p class="q">"What do you need for eBGP between loopbacks, and what happens if each piece is missing?"</p><p>Strong answer: a route to the peer loopback, <code>update-source Loopback0</code> and <code>ebgp-multihop</code> (or <code>disable-connected-check</code> when directly connected), on both routers. Missing route or missing multihop leaves the session Idle; missing update-source leaves it Active because TCP arrives from the wrong source. A senior answer mentions that <code>ttl-security hops</code> is the hardened alternative to multihop and cannot be combined with it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>eBGP defaults: TTL 1 and a connected check, so loopback peers need extra commands.</li>
<li>Three ingredients on both sides: route to the loopback, <code>update-source Loopback0</code>, <code>ebgp-multihop 2</code>.</li>
<li><code>show ip bgp neighbors</code> says "External BGP neighbor not directly connected" when multihop is missing.</li>
<li>The next hop is the peer loopback and is resolved recursively through the static or IGP route.</li>
<li>Loopback peering keeps the session up when one of several parallel links fails.</li>
</ul></div>
`,hi:`
<p>Agar aapke business partner ke paas sirf ek phone number hai aur woh line dead ho jaaye, to deal ruk jaati hai bhale hi partner theek ho. Unhe apna office reception number do, jo kai lines par reachable hai, aur ek dead line se farak nahi padta. BGP ko <b>loopback</b> interfaces ke beech peer karna yahi karta hai: jab tak router zinda hai loopback kabhi down nahi hota, aur use kisi bhi available link se pahuncha ja sakta hai.</p>

<h3>eBGP directly connected peer kyun expect karta hai</h3>
<p>Default mein IOS eBGP packets <b>TTL 1</b> ke saath bhejta hai aur ek <b>connected check</b> karta hai: neighbor address directly connected subnet mein hona chahiye. Dono safety features hain. Zyada tar eBGP sessions do companies ke beech ek link par chalte hain, aur TTL 1 ka matlab hai ki door se aaya packet BGP process tak nahi pahunch sakta. Agar aap eBGP neighbor ko loopback par point karo, to check fail hota hai aur session <b>Idle</b> mein baitha rehta hai. Woh TCP try bhi nahi karega.</p>

<h3>Teen ingredients</h3>
<p>Loopbacks ke beech eBGP peer karne ke liye <b>dono</b> routers par chahiye:</p>
<ol>
<li><b>Peer ke loopback tak route</b>: static route (jaise lab 2 mein) ya IGP. Iske bina session Idle rehta hai kyunki TCP kholne ka path nahi hai.</li>
<li><b><code>neighbor x update-source Loopback0</code></b>: TCP connection apne loopback se source karo. Peer ne aapka <b>loopback</b> neighbor address ki tarah configure kiya hai; aapke physical interface address se aaya SYN match nahi karta aur refuse hota hai.</li>
<li><b><code>neighbor x ebgp-multihop 2</code></b>: TTL badhao aur connected check band karo. Directly connected routers ke liye do kaafi hai; peer sach mein door ho to bada number use karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 2 R2 aur R3 ke beech loopback peering">
<rect x="10" y="90" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="112" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="65" y="130" text-anchor="middle" class="svg-muted" font-size="12">AS 65101</text>
<rect x="175" y="90" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="235" y="112" text-anchor="middle" class="svg-ink" font-size="13">R2 AS 65102</text><text x="235" y="130" text-anchor="middle" class="svg-muted" font-size="12">Lo0 2.2.2.2</text>
<rect x="345" y="90" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="112" text-anchor="middle" class="svg-ink" font-size="13">R3 AS 65103</text><text x="405" y="130" text-anchor="middle" class="svg-muted" font-size="12">Lo0 3.3.3.3</text>
<rect x="515" y="90" width="115" height="50" rx="8" fill="#ddd6fe"/><text x="572" y="112" text-anchor="middle" class="svg-ink" font-size="13">R4</text><text x="572" y="130" text-anchor="middle" class="svg-muted" font-size="12">AS 65104</text>
<line x1="120" y1="115" x2="175" y2="115" stroke="#64748b" stroke-width="2"/><text x="147" y="165" text-anchor="middle" class="svg-muted" font-size="12">10.12.0.0/30</text>
<line x1="295" y1="115" x2="345" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">10.23.0.0/30</text>
<line x1="465" y1="115" x2="515" y2="115" stroke="#64748b" stroke-width="2"/><text x="490" y="165" text-anchor="middle" class="svg-muted" font-size="12">10.34.0.0/30</text>
<path d="M235 90 C 270 30, 370 30, 405 90" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">eBGP 2.2.2.2 se 3.3.3.3</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Static routes: R2 se 3.3.3.3 via 10.23.0.2, R3 se 2.2.2.2 via 10.23.0.1</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">R1-R2 aur R3-R4 link addresses par peer karte hain</text>
</svg><p class="cap">Lab 2: carriers R2 aur R3 loopbacks ke beech peer karte hain; edge sessions interface addresses use karte hain.</p></div>

<h3>Lab 2 walk karna</h3>
<p>R2 aur R3 ke paas pehle se ek doosre ke loopback ke static routes hain. R3 ke paas session ka kuch hissa bhi hai:</p>
<pre class="code"><span class="c">! R3 jaisa mila (adhoora)</span>
router bgp 65103
 bgp router-id 3.3.3.3
 neighbor 2.2.2.2 remote-as 65102
 neighbor 2.2.2.2 update-source Loopback0
 neighbor 10.34.0.2 remote-as 65104</pre>
<p><b>Task 1</b> R1 ko <code>router bgp 65101</code>, <code>neighbor 10.12.0.2 remote-as 65102</code> aur <code>network 172.31.1.0 mask 255.255.255.0</code> ke saath up karta hai. <b>Task 2</b> R2 par loopback session jodta hai:</p>
<pre class="code">R2(config)# router bgp 65102
R2(config-router)# neighbor 3.3.3.3 remote-as 65103
R2(config-router)# neighbor 3.3.3.3 update-source Loopback0
<span class="c">! TCP 2.2.2.2 se source hoga, jo R3 expect karta hai</span>
R2(config-router)# neighbor 3.3.3.3 ebgp-multihop 2
<span class="c">! TTL 2 aur koi connected check nahi</span></pre>
<p><b>Task 3</b>: session ab bhi up nahi hota, kyunki R3 mein ek line missing hai. R3 se poocho woh kya sochta hai:</p>
<pre class="out">R3# show ip bgp neighbors 2.2.2.2
BGP neighbor is 2.2.2.2,  remote AS 65102, external link
  BGP version 4, remote router ID 0.0.0.0
<span class="hl">  BGP state = Idle</span>
  ...
<span class="hl">  External BGP neighbor not directly connected.</span>
  ...
  No active TCP connection</pre>
<p>Fix hai R3 par <code>neighbor 2.2.2.2 ebgp-multihop 2</code>. Kuch seconds baad dono routers <code>%BGP-5-ADJCHANGE: neighbor ... Up</code> log karte hain.</p>

<h3>Next hop kya banta hai</h3>
<p>Loopback session par next hop peer ka loopback hota hai. R2 par:</p>
<pre class="out">R2# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;   172.31.1.0/24    10.12.0.1                0             0 65101 i
<span class="hl"> *&gt;   172.31.4.0/24    3.3.3.3                                0 65103 65104 i</span></pre>
<p>R2 3.3.3.3 ko apne static route se resolve karta hai (<b>recursive lookup</b>), isliye route valid (<code>*</code>) aur best (<code>&gt;</code>) hai. Jab R2 route R1 ko deta hai, woh next hop us session par apne address 10.12.0.2 par set karta hai aur 65102 prepend karta hai. <b>Task 4</b> bilkul yahi check karta hai: R1 ko <code>65102 65103 65104</code> dikhta hai, aur R4 ko 172.31.1.0/24 <code>65103 65102 65101</code> ke saath. <b>Task 5</b> PC1 se PC4 tak ping se ise prove karta hai.</p>

<div class="eg"><p><b>Worked example.</b> <code>ebgp-multihop 2</code> un routers ke beech kyun kaam karta hai jo sirf ek link door hain? Strictly, directly connected router ke loopback ko bheja TTL 1 packet phir bhi pahunch jaata hai, kyunki woh locally deliver hota hai, forward nahi. Asli rukawat connected check hai. Isiliye yahan akela <code>neighbor 2.2.2.2 disable-connected-check</code> bhi kaam karega. <code>ebgp-multihop</code> zyada common hai kyunki yeh dono cases cover karta hai: check band karta hai aur un peers ko allow karta hai jo sach mein kai hops door hain.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>update-source</code> sirf ek side par configure karna. Session phir bhi up ho sakta hai, par sirf tab jab sahi configured side TCP connection khole; doosri side ki koshishein refuse hoti hain kyunki woh unexpected address se aati hain. Har reset ke baad yeh flap karta hai ya minutes leta hai. Ise dono sides par configure karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ebgp-multihop</code> ke bina eBGP loopback session <b>Idle</b> hai (koi koshish nahi). <code>update-source</code> ke bina aam taur par <b>Active</b> (TCP refused). Loopback tak route ke bina <b>Idle</b>. State batata hai ki kaunsa ingredient missing hai.</p></div>

<div class="scn"><h4>Dual-link peering jo link failure nahi jhel paayi</h4><p>Do parallel 10G links se jude do data centres ek link ke addresses par eBGP chala rahe the. Jab woh link fail hua, to session 180 seconds tak hold timer expire hone tak gira raha, jabki doosra link theek tha. Team ne session ko loopbacks par shift kiya, dono links par har loopback ke static routes jode, aur dono sides par <code>update-source Loopback0</code> aur <code>ebgp-multihop 2</code> lagaya. Agle link failure par koi BGP event hua hi nahi.</p><p><b>Seekh:</b> loopback peering BGP session ko kisi ek physical link se alag kar deti hai.</p></div>

<div class="iv"><p class="q">"Loopbacks ke beech eBGP ke liye kya chahiye, aur har piece missing ho to kya hota hai?"</p><p>Strong answer: dono routers par peer loopback tak route, <code>update-source Loopback0</code> aur <code>ebgp-multihop</code> (ya directly connected ho to <code>disable-connected-check</code>). Missing route ya missing multihop session ko Idle rakhta hai; missing update-source use Active rakhta hai kyunki TCP galat source se aata hai. Senior answer batata hai ki <code>ttl-security hops</code> multihop ka hardened alternative hai aur uske saath combine nahi ho sakta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>eBGP defaults: TTL 1 aur connected check, isliye loopback peers ko extra commands chahiye.</li>
<li>Dono sides par teen ingredients: loopback tak route, <code>update-source Loopback0</code>, <code>ebgp-multihop 2</code>.</li>
<li>Multihop missing ho to <code>show ip bgp neighbors</code> "External BGP neighbor not directly connected" kehta hai.</li>
<li>Next hop peer loopback hai aur static ya IGP route se recursively resolve hota hai.</li>
<li>Loopback peering kai parallel links mein se ek fail hone par bhi session up rakhti hai.</li>
</ul></div>
`}};export{e as default};