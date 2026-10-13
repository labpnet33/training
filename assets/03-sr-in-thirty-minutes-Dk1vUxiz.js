var e={id:`sr-in-thirty-minutes`,h:{en:`Segment routing in thirty minutes: SIDs, SRGB and the ring`,hi:`Segment routing tees minute mein: SIDs, SRGB aur ring`},body:{en:`
<p>This chapter gives you the complete vocabulary of segment routing in one sitting. The later modules (spcor-sr and sre-sr-vpn) go deeper, but after this chapter nothing in them will be a surprise.</p>

<h3>The core idea</h3>
<p>In segment routing the source of a packet decides the path and writes it into the packet as an ordered list of instructions called <b>segments</b>. Each segment is identified by a <b>segment ID (SID)</b>. With the MPLS data plane a SID is simply a label. Transit routers keep no per-path state: they follow the next instruction on top of the stack.</p>
<dl class="terms">
<dt>Prefix SID</dt><dd>Identifies a prefix, usually a router loopback. It means "go to this router by the shortest path". It is global: every router in the domain agrees on it.</dd>
<dt>Adjacency SID</dt><dd>Identifies one link of one router. It means "leave through this link". It is local to the router that owns it.</dd>
<dt>SRGB</dt><dd>Segment Routing Global Block: the range of labels reserved for prefix SIDs. The default here is 16000 to 23999.</dd>
<dt>Index</dt><dd>The number you configure for a prefix SID. The label is <b>SRGB base + index</b>.</dd></dl>

<h3>The numbering plan of our ring</h3>
<p>We give every router a loopback 10.0.255.N/32 and the index N. So PE1 has index 1, P1 index 2, P2 index 3, P3 index 4, PE2 index 5. With the default SRGB the label for PE2 is 16000 + 5 = <b>16005</b>, on every router.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="The five-router SR ring with indexes">
<rect x="30" y="85" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="70" y="108" text-anchor="middle" class="svg-ink" font-size="13">PE1  idx 1</text>
<rect x="280" y="20" width="80" height="40" rx="8" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">P1  idx 2</text>
<rect x="160" y="160" width="80" height="40" rx="8" fill="#bae6fd"/><text x="200" y="183" text-anchor="middle" class="svg-ink" font-size="13">P2  idx 3</text>
<rect x="400" y="160" width="80" height="40" rx="8" fill="#bae6fd"/><text x="440" y="183" text-anchor="middle" class="svg-ink" font-size="13">P3  idx 4</text>
<rect x="530" y="85" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="570" y="108" text-anchor="middle" class="svg-ink" font-size="13">PE2  idx 5</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="95" x2="280" y2="42"/><line x1="360" y1="42" x2="530" y2="95"/><line x1="90" y1="125" x2="180" y2="160"/><line x1="240" y1="180" x2="400" y2="180"/><line x1="480" y1="180" x2="550" y2="125"/></g>
<text x="320" y="196" text-anchor="middle" class="svg-accent" font-size="12">metric 100 (slow link)</text>
</svg><p class="cap">The ring used in every SR lab. The P2 to P3 link has IS-IS metric 100, so traffic prefers the top path.</p></div>

<h3>The configuration, in short</h3>
<pre class="code"><span class="c">! the same on every router, only the index changes</span>
segment-routing mpls
 connected-prefix-sid-map
  address-family ipv4
   10.0.255.1/32 index 1 range 1
  exit-address-family
router isis
 net 49.0100.0000.0000.0001.00
 is-type level-2-only
 metric-style wide
 segment-routing mpls</pre>
<p>Two switches must both be on: the global <code>segment-routing mpls</code> block with the SID map, and <code>segment-routing mpls</code> under <code>router isis</code>. IS-IS also needs <b>wide metrics</b>, because SIDs travel in TLVs that narrow metrics do not have. The lab <code>sre-start-tour</code> makes you do exactly this on one router.</p>

<h3>Fast reroute in one paragraph</h3>
<p>SR can also protect traffic. <b>TI-LFA</b> (topology-independent loop-free alternate) pre-computes, for every destination, a backup path that works after any single link failure, and encodes it as a short label stack (a node SID plus maybe an adjacency SID). When the link fails the router switches to the backup in tens of milliseconds, before IS-IS has reconverged. You will configure it in the spcor-sr module and verify it in a drill.</p>

<div class="eg"><b>Worked example.</b> PE2 has index 5, so its label is 16005. If P1 had chosen the SRGB 20000 to 27999, the label for PE2 on P1 would be 20005. PE1, sending to P1, must therefore push 20005. That is why operators keep one SRGB everywhere: labels stay identical end to end.</div>

<div class="warn"><b>Common mistake.</b> Using the same index on two routers. A SID conflict makes every router discard both SIDs, so traffic to both routers silently loses its labels. IS-IS itself stays healthy, which hides the problem.</div>

<div class="scn"><h4>The SID that was dropped</h4><p>Two engineers each gave a new loopback "index 7". Pings to both stayed fine, because plain IP does not need labels, but VPN traffic towards both stopped. The router that logged "SID conflict" was the clue. One engineer moved to index 107 and the labels came back.</p><p><b>Lesson:</b> keep an index plan, a simple table of router and index.</p></div>

<div class="iv"><p class="q">"What is the difference between a prefix SID and an adjacency SID?"</p><p>A prefix SID is global and means shortest path to a prefix; its label is SRGB base plus index. An adjacency SID is local to a router and means send out of one specific link; it comes from a dynamic range, not the SRGB. Adjacency SIDs are what TI-LFA and SR-TE use to force a path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A segment is an instruction; with MPLS a SID is a label.</li>
<li>Prefix SID label = SRGB base + index; default SRGB 16000 to 23999.</li>
<li>Both global SR and IS-IS SR (with wide metrics) must be enabled.</li>
<li>TI-LFA gives sub-second protection using a short label stack.</li>
</ul></div>
`,hi:`
<p>Yeh chapter segment routing ki poori vocabulary ek baithak mein deta hai. Aage ke modules (spcor-sr aur sre-sr-vpn) gehre jaate hain, par is chapter ke baad unme kuch surprise nahi hoga.</p>

<h3>Core idea</h3>
<p>Segment routing mein packet ka source path tay karta hai aur use packet mein <b>segments</b> naam ke instructions ki ordered list ke roop mein likh deta hai. Har segment ek <b>segment ID (SID)</b> se pehchana jaata hai. MPLS data plane ke saath SID bas ek label hai. Transit routers per-path state nahi rakhte: woh stack ke upar wala agla instruction follow karte hain.</p>
<dl class="terms">
<dt>Prefix SID</dt><dd>Ek prefix, aam taur par router loopback, ko pehchanta hai. Matlab "is router tak shortest path se jao". Yeh global hai: domain ka har router ispar sehmat hai.</dd>
<dt>Adjacency SID</dt><dd>Ek router ke ek link ko pehchanta hai. Matlab "is link se nikalo". Yeh us router ke liye local hai jo isko own karta hai.</dd>
<dt>SRGB</dt><dd>Segment Routing Global Block: prefix SIDs ke liye reserved labels ki range. Yahan default 16000 se 23999 hai.</dd>
<dt>Index</dt><dd>Woh number jo aap prefix SID ke liye configure karte ho. Label = <b>SRGB base + index</b>.</dd></dl>

<h3>Hamari ring ka numbering plan</h3>
<p>Har router ko loopback 10.0.255.N/32 aur index N milta hai. Yaani PE1 ka index 1, P1 ka 2, P2 ka 3, P3 ka 4, PE2 ka 5. Default SRGB ke saath PE2 ka label 16000 + 5 = <b>16005</b> hai, har router par.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="The five-router SR ring with indexes">
<rect x="30" y="85" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="70" y="108" text-anchor="middle" class="svg-ink" font-size="13">PE1  idx 1</text>
<rect x="280" y="20" width="80" height="40" rx="8" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">P1  idx 2</text>
<rect x="160" y="160" width="80" height="40" rx="8" fill="#bae6fd"/><text x="200" y="183" text-anchor="middle" class="svg-ink" font-size="13">P2  idx 3</text>
<rect x="400" y="160" width="80" height="40" rx="8" fill="#bae6fd"/><text x="440" y="183" text-anchor="middle" class="svg-ink" font-size="13">P3  idx 4</text>
<rect x="530" y="85" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="570" y="108" text-anchor="middle" class="svg-ink" font-size="13">PE2  idx 5</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="95" x2="280" y2="42"/><line x1="360" y1="42" x2="530" y2="95"/><line x1="90" y1="125" x2="180" y2="160"/><line x1="240" y1="180" x2="400" y2="180"/><line x1="480" y1="180" x2="550" y2="125"/></g>
<text x="320" y="196" text-anchor="middle" class="svg-accent" font-size="12">metric 100 (slow link)</text>
</svg><p class="cap">Har SR lab mein use hone wali ring. P2 se P3 link ka IS-IS metric 100 hai, isliye traffic upar wala path pasand karta hai.</p></div>

<h3>Configuration, short mein</h3>
<pre class="code"><span class="c">! har router par same, sirf index badalta hai</span>
segment-routing mpls
 connected-prefix-sid-map
  address-family ipv4
   10.0.255.1/32 index 1 range 1
  exit-address-family
router isis
 net 49.0100.0000.0000.0001.00
 is-type level-2-only
 metric-style wide
 segment-routing mpls</pre>
<p>Do switches dono on hone chahiye: SID map wala global <code>segment-routing mpls</code> block, aur <code>router isis</code> ke neeche <code>segment-routing mpls</code>. IS-IS ko <b>wide metrics</b> bhi chahiye, kyunki SIDs aise TLVs mein jaate hain jo narrow metrics mein nahi hote. Lab <code>sre-start-tour</code> aapse ek router par yahi karwata hai.</p>

<h3>Fast reroute ek paragraph mein</h3>
<p>SR traffic ko protect bhi kar sakta hai. <b>TI-LFA</b> (topology-independent loop-free alternate) har destination ke liye pehle se ek backup path compute karta hai jo kisi bhi single link failure ke baad chalta hai, aur use chhote label stack (node SID plus kabhi adjacency SID) mein encode karta hai. Link fail hone par router IS-IS ke reconverge hone se pehle, kuch milliseconds mein backup par switch ho jaata hai. Aap ise spcor-sr module mein configure karoge aur drill mein verify karoge.</p>

<div class="eg"><b>Worked example.</b> PE2 ka index 5 hai, isliye label 16005. Agar P1 ne SRGB 20000 se 27999 chuna hota, to P1 par PE2 ka label 20005 hota. Isliye P1 ko bhejte waqt PE1 ko 20005 push karna padta. Isi wajah se operators har jagah ek hi SRGB rakhte hain: labels end to end identical rehte hain.</div>

<div class="warn"><b>Common mistake.</b> Do routers par same index use karna. SID conflict mein har router dono SIDs discard kar deta hai, isliye dono routers ki taraf traffic ke labels chupchaap chale jaate hain. IS-IS khud healthy rehta hai, jisse problem chhup jaati hai.</div>

<div class="scn"><h4>Woh SID jo drop ho gaya</h4><p>Do engineers ne naye loopback ko "index 7" diya. Dono ke ping theek rahe, kyunki plain IP ko labels nahi chahiye, par dono ki taraf VPN traffic ruk gaya. "SID conflict" log karne wala router clue tha. Ek engineer index 107 par gaya aur labels wapas aa gaye.</p><p><b>Lesson:</b> index plan rakho, router aur index ki simple table.</p></div>

<div class="iv"><p class="q">"Prefix SID aur adjacency SID mein kya fark hai?"</p><p>Prefix SID global hai aur prefix tak shortest path batata hai; uska label SRGB base plus index hai. Adjacency SID router ke liye local hai aur ek specific link se bhejne ko kehta hai; woh dynamic range se aata hai, SRGB se nahi. Adjacency SIDs wahi hain jo TI-LFA aur SR-TE path force karne ke liye use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Segment ek instruction hai; MPLS ke saath SID ek label hai.</li>
<li>Prefix SID label = SRGB base + index; default SRGB 16000 se 23999.</li>
<li>Global SR aur IS-IS SR (wide metrics ke saath) dono enable hone chahiye.</li>
<li>TI-LFA chhote label stack se sub-second protection deta hai.</li>
</ul></div>
`}};export{e as default};