var e={id:`tables`,h:{en:`BGP tables and reading show ip bgp`,hi:`BGP tables aur show ip bgp padhna`},body:{en:`
<p>A newspaper editor receives stories from many reporters (the inbox), chooses which version of each story to print (the edition) and then sends selected stories to partner papers (the outbox). BGP keeps the same three piles for routes, and almost every BGP question at work boils down to "which pile is the route in, and why is it not in the next one?"</p>

<h3>The three conceptual tables</h3>
<dl class="terms">
<dt>Adj-RIB-In</dt><dd>Routes exactly as received from each neighbor, before inbound policy. One logical copy per neighbor.</dd>
<dt>Loc-RIB</dt><dd>The router's own BGP table after inbound policy: all valid paths for each prefix, with <b>one best path</b> chosen. This is what <code>show ip bgp</code> displays.</dd>
<dt>Adj-RIB-Out</dt><dd>What the router sends to each neighbor after outbound policy. Only best paths are advertised (without add-path features).</dd>
</dl>
<p>The best path from the Loc-RIB is then offered to the <b>routing table (RIB)</b>. It is installed as a <code>B</code> route only if no other source offers the same prefix with a lower administrative distance.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="BGP route processing pipeline">
<rect x="5" y="50" width="100" height="56" rx="8" fill="#e2e8f0"/><text x="55" y="74" text-anchor="middle" class="svg-ink" font-size="13">UPDATE</text><text x="55" y="92" text-anchor="middle" class="svg-muted" font-size="12">from peer</text>
<rect x="125" y="50" width="100" height="56" rx="8" fill="#fed7aa"/><text x="175" y="74" text-anchor="middle" class="svg-ink" font-size="13">Adj-RIB-In</text><text x="175" y="92" text-anchor="middle" class="svg-muted" font-size="12">raw</text>
<rect x="245" y="50" width="100" height="56" rx="8" fill="#bae6fd"/><text x="295" y="74" text-anchor="middle" class="svg-ink" font-size="13">Loc-RIB</text><text x="295" y="92" text-anchor="middle" class="svg-muted" font-size="12">best path</text>
<rect x="365" y="50" width="100" height="56" rx="8" fill="#ddd6fe"/><text x="415" y="74" text-anchor="middle" class="svg-ink" font-size="13">Adj-RIB-Out</text><text x="415" y="92" text-anchor="middle" class="svg-muted" font-size="12">to peers</text>
<rect x="485" y="50" width="150" height="56" rx="8" fill="#bbf7d0"/><text x="560" y="74" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text><text x="560" y="92" text-anchor="middle" class="svg-muted" font-size="12">B if lowest AD</text>
<line x1="105" y1="78" x2="125" y2="78" stroke="#64748b" stroke-width="2"/><line x1="225" y1="78" x2="245" y2="78" stroke="#64748b" stroke-width="2"/><line x1="345" y1="78" x2="365" y2="78" stroke="#64748b" stroke-width="2"/>
<path d="M295 106 C 330 150, 520 150, 560 106" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="235" y="40" text-anchor="middle" class="svg-accent" font-size="12">inbound policy</text><text x="355" y="40" text-anchor="middle" class="svg-accent" font-size="12">outbound policy</text>
</svg><p class="cap">Inbound policy sits between Adj-RIB-In and Loc-RIB; outbound policy between Loc-RIB and Adj-RIB-Out.</p></div>

<h3>Reading show ip bgp, column by column</h3>
<p>Imagine Kaveri Textiles later adds a second provider, AS 64510, on 100.64.20.1. CUST-EDGE now has two paths to 203.0.113.0/24:</p>
<pre class="out">CUST-EDGE# show ip bgp
BGP table version is 7, local router ID is 10.10.10.10
Status codes: s suppressed, d damped, h history, * valid, &gt; best, i - internal,
              r RIB-failure, S Stale, m multipath, b backup-path, f RT-Filter,
              x best-external, a additional-path, c RIB-compressed,
Origin codes: i - IGP, e - EGP, ? - incomplete
RPKI validation codes: V valid, I invalid, N Not found

     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;   192.168.50.0     0.0.0.0                  0         32768 i
 *&gt;   198.51.100.0     100.64.10.1              0             0 64500 i
<span class="hl"> *    203.0.113.0      100.64.20.1                            0 64510 64500 i</span>
<span class="hl"> *&gt;                    100.64.10.1              0             0 64500 i</span></pre>
<ul>
<li><b>Status</b>: <code>*</code> valid (the next hop is reachable), <code>&gt;</code> best (the one offered to the RIB and advertised), <code>i</code> in the status column means learned from an <b>iBGP</b> peer, <code>r</code> RIB-failure, <code>s</code> suppressed by an aggregate.</li>
<li><b>Network</b>: the prefix. A blank line under it means another path to the same prefix. The length is hidden when it equals the classful mask.</li>
<li><b>Next Hop</b>: <code>0.0.0.0</code> means locally originated.</li>
<li><b>Metric</b>: the MED. <b>LocPrf</b>: local preference, shown for iBGP-learned and locally changed routes. <b>Weight</b>: 32768 for local routes, 0 for learned routes by default.</li>
<li><b>Path</b>: the AS_PATH, read right to left, then the <b>origin code</b>: <code>i</code> IGP (network statement), <code>e</code> EGP (historic), <code>?</code> incomplete (redistributed).</li>
</ul>
<p>Here the path via 64500 directly wins because its AS_PATH is shorter (1 against 2). The next chapter on best-path selection explains every step.</p>

<h3>The detailed view of one prefix</h3>
<pre class="out">CUST-EDGE# show ip bgp 203.0.113.0
BGP routing table entry for 203.0.113.0/24, version 5
<span class="hl">Paths: (2 available, best #2, table default)</span>
  Advertised to update-groups:
     1
  Refresh Epoch 1
  64510 64500
    100.64.20.1 from 100.64.20.1 (64.51.0.1)
      Origin IGP, localpref 100, valid, external
  Refresh Epoch 1
  64500
    100.64.10.1 from 100.64.10.1 (64.50.0.1)
<span class="hl">      Origin IGP, metric 0, localpref 100, valid, external, best</span></pre>
<p>This shows each path's AS_PATH, next hop, the peer and its router ID in brackets, and every attribute. <b>external</b> means learned from eBGP.</p>

<h3>Per-neighbor views and refreshing policy</h3>
<ul>
<li><code>show ip bgp neighbors 100.64.10.1 routes</code>: routes from that neighbor that passed inbound policy.</li>
<li><code>show ip bgp neighbors 100.64.10.1 advertised-routes</code>: what you are sending (Adj-RIB-Out). Use it to prove the ISP should see your LAN.</li>
<li><code>show ip bgp neighbors 100.64.10.1 received-routes</code>: raw Adj-RIB-In; needs <code>neighbor x soft-reconfiguration inbound</code>, which stores an unmodified copy and costs memory.</li>
<li>After changing a policy, apply it without dropping the session: <code>clear ip bgp 100.64.10.1 soft in</code> (uses route refresh) or <code>soft out</code>. A plain <code>clear ip bgp *</code> resets every session and should be avoided in production.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> An engineer adds a static route <code>ip route 203.0.113.0 255.255.255.0 100.64.10.1</code> on CUST-EDGE "for safety". <code>show ip bgp</code> now shows <code>r&gt;</code> for 203.0.113.0: the BGP path is still best, but the RIB kept the static route (AD 1 beats 20). Nothing breaks, but the static route will not follow a BGP failover. The <code>r</code> is your hint.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming a route with <code>*</code> is in use. Only <code>*&gt;</code> is the best path. And a route without <code>*</code> is not valid at all, typically because its next hop is unreachable.</p></div>

<div class="exam"><p><b>Exam trap.</b> The letter <code>i</code> appears in two places with two meanings: at the <b>start</b> of the line it means "learned from iBGP"; at the <b>end</b> of the path it is the origin code IGP. An eBGP-learned route from a network statement shows only the trailing <code>i</code>.</p></div>

<div class="scn"><h4>"The ISP says they receive nothing from us"</h4><p>After a change window, the ISP reported that the customer's prefix had disappeared. The customer's <code>show ip bgp</code> showed <code>*&gt; 192.168.50.0 0.0.0.0</code>, so the route was in the Loc-RIB. <code>show ip bgp neighbors 100.64.10.1 advertised-routes</code> was empty. The change had added an outbound route-map to the neighbor that referenced a prefix-list with a typo, denying everything. Fixing the list and running <code>clear ip bgp 100.64.10.1 soft out</code> restored the advertisement.</p><p><b>Lesson:</b> follow the route through the tables: Loc-RIB, then Adj-RIB-Out, then the peer's received routes.</p></div>

<div class="iv"><p class="q">"A prefix is in your BGP table but not in your routing table. Why?"</p><p>Strong answer: either it is not the best path or not valid (no <code>*</code>, next hop unreachable), or it is best but another protocol offers the same prefix with a lower AD, shown as RIB-failure <code>r</code> in <code>show ip bgp</code>. Mention <code>show ip bgp x.x.x.x</code> for details and <code>show ip route x.x.x.x</code> to see which source won.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Adj-RIB-In (raw), Loc-RIB (after inbound policy, best path chosen), Adj-RIB-Out (after outbound policy).</li>
<li><code>*</code> valid, <code>&gt;</code> best, leading <code>i</code> iBGP, <code>r</code> RIB-failure, <code>s</code> suppressed.</li>
<li>Origin codes: <code>i</code> IGP, <code>e</code> EGP, <code>?</code> incomplete.</li>
<li><code>advertised-routes</code> shows what you send; <code>received-routes</code> needs soft-reconfiguration inbound.</li>
<li>Use <code>clear ip bgp x soft in|out</code> to apply policy changes without resetting the session.</li>
</ul></div>
`,hi:`
<p>Ek newspaper editor kai reporters se stories paata hai (inbox), har story ka kaunsa version chhapna hai yeh chunta hai (edition) aur phir chuni hui stories partner papers ko bhejta hai (outbox). BGP routes ke liye yahi teen dher rakhta hai, aur kaam par lagbhag har BGP sawaal ka matlab hota hai "route kis dher mein hai, aur agle mein kyun nahi hai?"</p>

<h3>Teen conceptual tables</h3>
<dl class="terms">
<dt>Adj-RIB-In</dt><dd>Har neighbor se bilkul jaise aaye waise routes, inbound policy se pehle. Har neighbor ki ek logical copy.</dd>
<dt>Loc-RIB</dt><dd>Inbound policy ke baad router ki apni BGP table: har prefix ke saare valid paths, aur <b>ek best path</b> chuna hua. <code>show ip bgp</code> yahi dikhata hai.</dd>
<dt>Adj-RIB-Out</dt><dd>Outbound policy ke baad router har neighbor ko kya bhejta hai. Sirf best paths advertise hote hain (add-path features ke bina).</dd>
</dl>
<p>Loc-RIB ka best path phir <b>routing table (RIB)</b> ko offer hota hai. Yeh <code>B</code> route ki tarah tabhi install hota hai jab koi aur source same prefix kam administrative distance ke saath offer na kare.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="BGP route processing pipeline">
<rect x="5" y="50" width="100" height="56" rx="8" fill="#e2e8f0"/><text x="55" y="74" text-anchor="middle" class="svg-ink" font-size="13">UPDATE</text><text x="55" y="92" text-anchor="middle" class="svg-muted" font-size="12">peer se</text>
<rect x="125" y="50" width="100" height="56" rx="8" fill="#fed7aa"/><text x="175" y="74" text-anchor="middle" class="svg-ink" font-size="13">Adj-RIB-In</text><text x="175" y="92" text-anchor="middle" class="svg-muted" font-size="12">raw</text>
<rect x="245" y="50" width="100" height="56" rx="8" fill="#bae6fd"/><text x="295" y="74" text-anchor="middle" class="svg-ink" font-size="13">Loc-RIB</text><text x="295" y="92" text-anchor="middle" class="svg-muted" font-size="12">best path</text>
<rect x="365" y="50" width="100" height="56" rx="8" fill="#ddd6fe"/><text x="415" y="74" text-anchor="middle" class="svg-ink" font-size="13">Adj-RIB-Out</text><text x="415" y="92" text-anchor="middle" class="svg-muted" font-size="12">peers ko</text>
<rect x="485" y="50" width="150" height="56" rx="8" fill="#bbf7d0"/><text x="560" y="74" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text><text x="560" y="92" text-anchor="middle" class="svg-muted" font-size="12">lowest AD ho to B</text>
<line x1="105" y1="78" x2="125" y2="78" stroke="#64748b" stroke-width="2"/><line x1="225" y1="78" x2="245" y2="78" stroke="#64748b" stroke-width="2"/><line x1="345" y1="78" x2="365" y2="78" stroke="#64748b" stroke-width="2"/>
<path d="M295 106 C 330 150, 520 150, 560 106" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="235" y="40" text-anchor="middle" class="svg-accent" font-size="12">inbound policy</text><text x="355" y="40" text-anchor="middle" class="svg-accent" font-size="12">outbound policy</text>
</svg><p class="cap">Inbound policy Adj-RIB-In aur Loc-RIB ke beech baithti hai; outbound policy Loc-RIB aur Adj-RIB-Out ke beech.</p></div>

<h3>show ip bgp column by column padhna</h3>
<p>Socho Kaveri Textiles baad mein doosra provider, AS 64510, 100.64.20.1 par jodti hai. Ab CUST-EDGE ke paas 203.0.113.0/24 ke do paths hain:</p>
<pre class="out">CUST-EDGE# show ip bgp
BGP table version is 7, local router ID is 10.10.10.10
Status codes: s suppressed, d damped, h history, * valid, &gt; best, i - internal,
              r RIB-failure, S Stale, m multipath, b backup-path, f RT-Filter,
              x best-external, a additional-path, c RIB-compressed,
Origin codes: i - IGP, e - EGP, ? - incomplete
RPKI validation codes: V valid, I invalid, N Not found

     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;   192.168.50.0     0.0.0.0                  0         32768 i
 *&gt;   198.51.100.0     100.64.10.1              0             0 64500 i
<span class="hl"> *    203.0.113.0      100.64.20.1                            0 64510 64500 i</span>
<span class="hl"> *&gt;                    100.64.10.1              0             0 64500 i</span></pre>
<ul>
<li><b>Status</b>: <code>*</code> valid (next hop reachable), <code>&gt;</code> best (jo RIB ko offer hota hai aur advertise hota hai), status column mein <code>i</code> matlab <b>iBGP</b> peer se seekha, <code>r</code> RIB-failure, <code>s</code> aggregate ne suppress kiya.</li>
<li><b>Network</b>: prefix. Uske neeche khali line matlab same prefix ka ek aur path. Length tab chhupi rehti hai jab woh classful mask ke barabar ho.</li>
<li><b>Next Hop</b>: <code>0.0.0.0</code> matlab locally originated.</li>
<li><b>Metric</b>: MED. <b>LocPrf</b>: local preference, iBGP se seekhe aur locally badle routes ke liye dikhta hai. <b>Weight</b>: local routes ke liye 32768, seekhe routes ke liye default 0.</li>
<li><b>Path</b>: AS_PATH, right se left padho, phir <b>origin code</b>: <code>i</code> IGP (network statement), <code>e</code> EGP (purana), <code>?</code> incomplete (redistributed).</li>
</ul>
<p>Yahan seedha 64500 wala path jeetta hai kyunki uska AS_PATH chhota hai (1 vs 2). Best-path selection wala agla chapter har step samjhata hai.</p>

<h3>Ek prefix ka detailed view</h3>
<pre class="out">CUST-EDGE# show ip bgp 203.0.113.0
BGP routing table entry for 203.0.113.0/24, version 5
<span class="hl">Paths: (2 available, best #2, table default)</span>
  Advertised to update-groups:
     1
  Refresh Epoch 1
  64510 64500
    100.64.20.1 from 100.64.20.1 (64.51.0.1)
      Origin IGP, localpref 100, valid, external
  Refresh Epoch 1
  64500
    100.64.10.1 from 100.64.10.1 (64.50.0.1)
<span class="hl">      Origin IGP, metric 0, localpref 100, valid, external, best</span></pre>
<p>Yeh har path ka AS_PATH, next hop, peer aur brackets mein uska router ID, aur har attribute dikhata hai. <b>external</b> matlab eBGP se seekha.</p>

<h3>Per-neighbor views aur policy refresh</h3>
<ul>
<li><code>show ip bgp neighbors 100.64.10.1 routes</code>: us neighbor ke woh routes jo inbound policy se paas hue.</li>
<li><code>show ip bgp neighbors 100.64.10.1 advertised-routes</code>: aap kya bhej rahe ho (Adj-RIB-Out). Ise prove karne ke liye use karo ki ISP ko aapka LAN dikhna chahiye.</li>
<li><code>show ip bgp neighbors 100.64.10.1 received-routes</code>: raw Adj-RIB-In; iske liye <code>neighbor x soft-reconfiguration inbound</code> chahiye, jo unmodified copy store karta hai aur memory khaata hai.</li>
<li>Policy badalne ke baad use session giraye bina lagao: <code>clear ip bgp 100.64.10.1 soft in</code> (route refresh use karta hai) ya <code>soft out</code>. Plain <code>clear ip bgp *</code> har session reset karta hai aur production mein isse bachna chahiye.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek engineer CUST-EDGE par "safety ke liye" static route <code>ip route 203.0.113.0 255.255.255.0 100.64.10.1</code> jodta hai. <code>show ip bgp</code> ab 203.0.113.0 ke liye <code>r&gt;</code> dikhata hai: BGP path ab bhi best hai, par RIB ne static route rakha (AD 1, 20 ko harata hai). Kuch nahi tootta, par static route BGP failover ko follow nahi karega. <code>r</code> aapka hint hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Maan lena ki <code>*</code> wala route use ho raha hai. Sirf <code>*&gt;</code> best path hai. Aur bina <code>*</code> wala route valid hi nahi hai, aam taur par kyunki uska next hop unreachable hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Letter <code>i</code> do jagah do matlab ke saath aata hai: line ki <b>shuruaat</b> mein matlab "iBGP se seekha"; path ke <b>end</b> mein yeh origin code IGP hai. Network statement se bana eBGP-learned route sirf aakhri <code>i</code> dikhata hai.</p></div>

<div class="scn"><h4>"ISP kehta hai unhe humse kuch nahi mil raha"</h4><p>Ek change window ke baad ISP ne report kiya ki customer ka prefix gayab ho gaya. Customer ka <code>show ip bgp</code> <code>*&gt; 192.168.50.0 0.0.0.0</code> dikha raha tha, yaani route Loc-RIB mein tha. <code>show ip bgp neighbors 100.64.10.1 advertised-routes</code> khali tha. Change ne neighbor par ek outbound route-map joda tha jo typo wali prefix-list refer karta tha, jo sab kuch deny kar rahi thi. List theek karke <code>clear ip bgp 100.64.10.1 soft out</code> chalane se advertisement wapas aaya.</p><p><b>Seekh:</b> route ko tables ke through follow karo: Loc-RIB, phir Adj-RIB-Out, phir peer ke received routes.</p></div>

<div class="iv"><p class="q">"Ek prefix aapki BGP table mein hai par routing table mein nahi. Kyun?"</p><p>Strong answer: ya to woh best path nahi hai ya valid nahi (koi <code>*</code> nahi, next hop unreachable), ya woh best hai par koi doosra protocol same prefix kam AD ke saath offer karta hai, jo <code>show ip bgp</code> mein RIB-failure <code>r</code> ki tarah dikhta hai. Details ke liye <code>show ip bgp x.x.x.x</code> aur kaunsa source jeeta yeh dekhne ke liye <code>show ip route x.x.x.x</code> batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Adj-RIB-In (raw), Loc-RIB (inbound policy ke baad, best path chuna), Adj-RIB-Out (outbound policy ke baad).</li>
<li><code>*</code> valid, <code>&gt;</code> best, shuruaat ka <code>i</code> iBGP, <code>r</code> RIB-failure, <code>s</code> suppressed.</li>
<li>Origin codes: <code>i</code> IGP, <code>e</code> EGP, <code>?</code> incomplete.</li>
<li><code>advertised-routes</code> dikhata hai aap kya bhejte ho; <code>received-routes</code> ko soft-reconfiguration inbound chahiye.</li>
<li>Session reset kiye bina policy changes lagane ke liye <code>clear ip bgp x soft in|out</code> use karo.</li>
</ul></div>
`}};export{e as default};