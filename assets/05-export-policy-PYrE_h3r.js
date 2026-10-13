var e={id:`export-policy`,h:{en:`Export policy: how outside routes enter OSPF`,hi:`Export policy: bahar ke routes OSPF mein kaise aate hain`},body:{en:`
<p>OSPF only knows about the networks it was told to run on. A static route, a direct LAN not running OSPF, a BGP route or a route from another IGP is <b>outside</b> OSPF. To bring it in, a router becomes an <b>ASBR</b> (autonomous system boundary router) and originates an external LSA. On Junos, the tool is an <b>export policy</b> applied under <code>protocols ospf</code>. Without one, nothing is exported.</p>

<h3>The Chennai lab: publishing partner networks</h3>
<p>R4 owns two static discard routes: 192.0.2.0/24 for a partner and 198.51.100.0/24 for a test network. The job: advertise both with metric 20, tag the partner network 100 and the test network 666, so other routers can recognise them.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="ASBR export flow">
<rect x="20" y="60" width="130" height="60" rx="10" fill="#fde68a"/><text x="85" y="86" text-anchor="middle" class="svg-ink" font-size="13">Static routes</text><text x="85" y="104" text-anchor="middle" class="svg-muted" font-size="11">192.0.2.0/24  198.51.100.0/24</text>
<rect x="190" y="60" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="255" y="86" text-anchor="middle" class="svg-ink" font-size="13">Policy PARTNERS</text><text x="255" y="104" text-anchor="middle" class="svg-muted" font-size="11">metric, tag, type</text>
<rect x="360" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="415" y="86" text-anchor="middle" class="svg-ink" font-size="13">R4 = ASBR</text><text x="415" y="104" text-anchor="middle" class="svg-muted" font-size="11">originates type 5</text>
<rect x="510" y="60" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="13">Whole AS</text><text x="565" y="104" text-anchor="middle" class="svg-muted" font-size="11">Extern LSAs</text>
<line x1="150" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="90" x2="360" y2="90" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="510" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">protocols ospf export PARTNERS</text>
</svg><p class="cap">The export policy turns selected routes into external LSAs.</p></div>
<pre class="code">set policy-options policy-statement PARTNERS term a from route-filter 192.0.2.0/24 exact
set policy-options policy-statement PARTNERS term a then metric 20
set policy-options policy-statement PARTNERS term a then tag 100
set policy-options policy-statement PARTNERS term a then accept
set policy-options policy-statement PARTNERS term b from route-filter 198.51.100.0/24 exact
set policy-options policy-statement PARTNERS term b then metric 20
set policy-options policy-statement PARTNERS term b then tag 666
set policy-options policy-statement PARTNERS term b then accept
set protocols ospf export PARTNERS</pre>

<h3>What R4 shows after the commit</h3>
<p>R4's own Router LSA now carries the <b>bits 0x2</b>, the ASBR flag, and the overview says AS boundary router. The asterisk marks the two external LSAs R4 originated:</p>
<pre class="out">lab@R4-CHENNAI&gt; show ospf database router lsa-id 10.255.4.4 detail
Router  *10.255.4.4       10.255.4.4       0x80000001    77  0x22 0x9099  72
  <span class="hl">bits 0x2</span>, link count 4

lab@R4-CHENNAI&gt; show ospf overview
  <span class="hl">AS boundary router</span>
    Prefix export count: 2

lab@R4-CHENNAI&gt; show ospf database external
Extern  *192.0.2.0        10.255.4.4       0x80000001    13  0x22 0xd376  36
Extern  *198.51.100.0     10.255.4.4       0x80000001    13  0x22 0x98a3  36</pre>

<h3>External type 2 (the default) and external type 1</h3>
<p>Every external route carries a metric and a <b>type</b>:</p>
<table class="cmp"><tr><th>Type</th><th>How receivers compute the metric</th><th>Use when</th></tr>
<tr><td>E2 (default)</td><td>Only the external metric; the internal cost to the ASBR is ignored unless a tie</td><td>One exit, or you want a fixed value</td></tr>
<tr><td>E1</td><td>External metric plus the internal cost to the ASBR</td><td>Several ASBRs, choose the nearest</td></tr></table>
<p>At first the routes are E2 with metric 20, and R1 shows exactly 20 even though R4 is two hops away:</p>
<pre class="out">lab@R1-CHENNAI&gt; show route 192.0.2.0/24 exact
192.0.2.0/24       *[OSPF/150] 00:00:14, <span class="hl">metric 20</span>, tag 100
                    &gt;  to 10.4.12.2 via ge-0/0/0.0
                       to 10.4.13.2 via ge-0/0/1.0

lab@R1-CHENNAI&gt; show ospf database external lsa-id 192.0.2.0 detail
    Type: <span class="hl">2</span>, Metric: 20, Fwd addr: 0.0.0.0, Tag: 0.0.0.100</pre>
<p>Now term a gets <code>then external type 1</code>. R1 adds its cost 2 to reach R4, and R2, which is one hop from R4, adds 1:</p>
<pre class="out">lab@R1-CHENNAI&gt; show route 192.0.2.0/24 exact
192.0.2.0/24       *[OSPF/150] 00:00:12, <span class="hl">metric 22</span>, tag 100

lab@R2-CHENNAI&gt; show route 192.0.2.0/24 exact
192.0.2.0/24       *[OSPF/150] 00:00:14, <span class="hl">metric 21</span>, tag 100</pre>
<p>The LSA now says Type: 1. The preference stays 150 for both types.</p>

<h3>Reading tags and the forwarding address</h3>
<p>The 32-bit route tag is printed in dotted form: tag 100 is 0.0.0.100 and tag 666 is 0.0.2.154 (666 is 2 times 256 plus 154). The <b>forwarding address</b> 0.0.0.0 means "send traffic to the ASBR itself". A non-zero forwarding address names a different next hop on the shared segment.</p>

<h3>Common export patterns</h3>
<ul>
<li><b>Direct and static into OSPF:</b> <code>from protocol [ direct static ]</code>, narrowed with route filters.</li>
<li><b>A default route:</b> <code>from route-filter 0.0.0.0/0 exact</code> with a static or aggregate default, advertised as E2 or E1.</li>
<li><b>NSSA:</b> the same policy produces type 7 LSAs when the ASBR is inside an NSSA.</li>
<li><b>Two ASBRs for one prefix:</b> use E1 so every router picks the closest exit; use different metrics to prefer one.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Two ASBRs R4 and R5 both announce 192.0.2.0/24. With E2 and equal metric 20, a router compares the internal cost to each ASBR only as a tie-breaker, so a far router may still pick the farther exit. If you require "nearest exit wins", configure E1, because the cost to each ASBR is then added into the final metric.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing <code>from protocol static</code> without a route filter. Every static route, including test and management routes, is exported. Always narrow with route-filter or tags.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default external type is 2 and the default external metric is the route's own metric, which is 0 for static and direct routes. Also, E1 is preferred over E2 for the same prefix, regardless of metric.</p></div>

<div class="scn"><h4>The test route in production</h4><p>A policy matched all statics and advertised an internal test prefix to every router in the company. The security team saw the new external LSA with an unknown tag. Operations replaced the broad match with exact route filters, tagged the lab routes 666 and added an import reject on tag 666 at the edges while the fix rolled out.</p><p><b>Lesson:</b> export narrowly, tag generously, and check <code>show ospf database external</code> after any policy change.</p></div>

<div class="iv"><p class="q">"What is the difference between E1 and E2, and when do you choose each?"</p><p>E2 keeps the external metric constant. E1 adds the internal cost to the ASBR on each router. Choose E1 when there are several ASBRs and you want the nearest exit; choose E2 when one fixed value is enough. E1 is preferred over E2 for the same prefix. Both have Junos preference 150.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF exports nothing by default; an export policy under protocols ospf creates external LSAs.</li>
<li>The router originating them is an ASBR, shown by bits 0x2 and AS boundary router.</li>
<li>E2 keeps the metric fixed; E1 adds the internal cost (20 became 22 on R1 and 21 on R2).</li>
<li>Tags are printed in dotted form: 666 is 0.0.2.154.</li>
<li>Narrow route filters and tags prevent accidental leaks.</li>
</ul></div>
`,hi:`
<p>OSPF sirf un networks ko jaanta hai jin par use chalne ko kaha gaya. Static route, OSPF na chalane wali direct LAN, BGP route ya doosre IGP ka route OSPF ke <b>bahar</b> hai. Ise andar laane ke liye router <b>ASBR</b> (autonomous system boundary router) banta hai aur external LSA originate karta hai. Junos par tool hai <code>protocols ospf</code> ke neeche lagayi gayi <b>export policy</b>. Ek ke bina kuch export nahi hota.</p>

<h3>Chennai lab: partner networks publish karna</h3>
<p>R4 ke paas do static discard routes hain: partner ke liye 192.0.2.0/24 aur test network ke liye 198.51.100.0/24. Kaam: dono ko metric 20 ke saath advertise karo, partner network ko tag 100 aur test network ko 666, taaki doosre routers unhe pehchaan sakein.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="ASBR export flow">
<rect x="20" y="60" width="130" height="60" rx="10" fill="#fde68a"/><text x="85" y="86" text-anchor="middle" class="svg-ink" font-size="13">Static routes</text><text x="85" y="104" text-anchor="middle" class="svg-muted" font-size="11">192.0.2.0/24  198.51.100.0/24</text>
<rect x="190" y="60" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="255" y="86" text-anchor="middle" class="svg-ink" font-size="13">Policy PARTNERS</text><text x="255" y="104" text-anchor="middle" class="svg-muted" font-size="11">metric, tag, type</text>
<rect x="360" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="415" y="86" text-anchor="middle" class="svg-ink" font-size="13">R4 = ASBR</text><text x="415" y="104" text-anchor="middle" class="svg-muted" font-size="11">type 5 originate</text>
<rect x="510" y="60" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="13">Poora AS</text><text x="565" y="104" text-anchor="middle" class="svg-muted" font-size="11">Extern LSAs</text>
<line x1="150" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="90" x2="360" y2="90" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="510" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">protocols ospf export PARTNERS</text>
</svg><p class="cap">Export policy chune hue routes ko external LSAs mein badalti hai.</p></div>
<pre class="code">set policy-options policy-statement PARTNERS term a from route-filter 192.0.2.0/24 exact
set policy-options policy-statement PARTNERS term a then metric 20
set policy-options policy-statement PARTNERS term a then tag 100
set policy-options policy-statement PARTNERS term a then accept
set policy-options policy-statement PARTNERS term b from route-filter 198.51.100.0/24 exact
set policy-options policy-statement PARTNERS term b then metric 20
set policy-options policy-statement PARTNERS term b then tag 666
set policy-options policy-statement PARTNERS term b then accept
set protocols ospf export PARTNERS</pre>

<h3>Commit ke baad R4 kya dikhata hai</h3>
<p>R4 ka apna Router LSA ab <b>bits 0x2</b>, yaani ASBR flag, carry karta hai, aur overview kehta hai AS boundary router. Asterisk un do external LSAs ko mark karta hai jo R4 ne originate kiye:</p>
<pre class="out">lab@R4-CHENNAI&gt; show ospf database router lsa-id 10.255.4.4 detail
Router  *10.255.4.4       10.255.4.4       0x80000001    77  0x22 0x9099  72
  <span class="hl">bits 0x2</span>, link count 4

lab@R4-CHENNAI&gt; show ospf overview
  <span class="hl">AS boundary router</span>
    Prefix export count: 2

lab@R4-CHENNAI&gt; show ospf database external
Extern  *192.0.2.0        10.255.4.4       0x80000001    13  0x22 0xd376  36
Extern  *198.51.100.0     10.255.4.4       0x80000001    13  0x22 0x98a3  36</pre>

<h3>External type 2 (default) aur external type 1</h3>
<p>Har external route metric aur <b>type</b> carry karta hai:</p>
<table class="cmp"><tr><th>Type</th><th>Receivers metric kaise nikalte hain</th><th>Kab use karein</th></tr>
<tr><td>E2 (default)</td><td>Sirf external metric; ASBR tak ka internal cost tie ke alawa ignore hota hai</td><td>Ek exit, ya fixed value chahiye</td></tr>
<tr><td>E1</td><td>External metric plus ASBR tak ka internal cost</td><td>Kai ASBRs, sabse nazdeeki chunna ho</td></tr></table>
<p>Pehle routes E2 hain metric 20 ke saath, aur R1 theek 20 dikhata hai bhale R4 do hop door ho:</p>
<pre class="out">lab@R1-CHENNAI&gt; show route 192.0.2.0/24 exact
192.0.2.0/24       *[OSPF/150] 00:00:14, <span class="hl">metric 20</span>, tag 100
                    &gt;  to 10.4.12.2 via ge-0/0/0.0
                       to 10.4.13.2 via ge-0/0/1.0

lab@R1-CHENNAI&gt; show ospf database external lsa-id 192.0.2.0 detail
    Type: <span class="hl">2</span>, Metric: 20, Fwd addr: 0.0.0.0, Tag: 0.0.0.100</pre>
<p>Ab term a mein <code>then external type 1</code> lagao. R1 R4 tak apna cost 2 jodta hai, aur R2, jo R4 se ek hop door hai, 1 jodta hai:</p>
<pre class="out">lab@R1-CHENNAI&gt; show route 192.0.2.0/24 exact
192.0.2.0/24       *[OSPF/150] 00:00:12, <span class="hl">metric 22</span>, tag 100

lab@R2-CHENNAI&gt; show route 192.0.2.0/24 exact
192.0.2.0/24       *[OSPF/150] 00:00:14, <span class="hl">metric 21</span>, tag 100</pre>
<p>LSA ab Type: 1 kehta hai. Dono types ke liye preference 150 rehti hai.</p>

<h3>Tags aur forwarding address padhna</h3>
<p>32-bit route tag dotted form mein print hota hai: tag 100 yaani 0.0.0.100 aur tag 666 yaani 0.0.2.154 (666 = 2 guna 256 plus 154). <b>Forwarding address</b> 0.0.0.0 ka matlab "traffic ASBR ko hi bhejo". Non-zero forwarding address shared segment par doosra next hop batata hai.</p>

<h3>Aam export patterns</h3>
<ul>
<li><b>Direct aur static ko OSPF mein:</b> <code>from protocol [ direct static ]</code>, route filters se narrow.</li>
<li><b>Default route:</b> static ya aggregate default ke saath <code>from route-filter 0.0.0.0/0 exact</code>, E2 ya E1 ke roop mein advertise.</li>
<li><b>NSSA:</b> ASBR NSSA ke andar ho to wahi policy type 7 LSAs banati hai.</li>
<li><b>Ek prefix ke liye do ASBRs:</b> E1 use karo taaki har router sabse nazdeeki exit chune; ek ko prefer karne ke liye alag metrics.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Do ASBRs R4 aur R5 dono 192.0.2.0/24 announce karte hain. E2 aur equal metric 20 ke saath router har ASBR tak internal cost sirf tie-breaker ke roop mein compare karta hai, isliye door ka router phir bhi door wala exit chun sakta hai. "Nearest exit jeete" chahiye to E1 configure karo, kyunki tab har ASBR tak ka cost final metric mein judta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Route filter ke bina <code>from protocol static</code> likhna. Har static route, test aur management routes samet, export ho jaata hai. Hamesha route-filter ya tags se narrow karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default external type 2 hai aur default external metric route ka apna metric hai, jo static aur direct routes ke liye 0 hai. Yeh bhi: same prefix ke liye E1, E2 par preferred hai, metric chahe kuch bhi ho.</p></div>

<div class="scn"><h4>Production mein test route</h4><p>Ek policy saare statics se match hui aur internal test prefix company ke har router ko advertise kar diya. Security team ne anjaan tag ke saath nayi external LSA dekhi. Operations ne broad match ko exact route filters se badla, lab routes ko 666 tag kiya aur fix roll out hone tak edges par tag 666 ka import reject lagaya.</p><p><b>Lesson:</b> narrow export karo, khul ke tag karo, aur kisi bhi policy change ke baad <code>show ospf database external</code> check karo.</p></div>

<div class="iv"><p class="q">"E1 aur E2 mein kya difference hai, aur kab kaunsa chunoge?"</p><p>E2 external metric constant rakhta hai. E1 har router par ASBR tak internal cost jodta hai. Kai ASBRs ho aur sabse nazdeeki exit chahiye to E1 chuno; ek fixed value kaafi ho to E2. Same prefix ke liye E1, E2 par preferred hai. Dono ki Junos preference 150 hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF default mein kuch export nahi karta; protocols ospf ke neeche export policy external LSAs banati hai.</li>
<li>Jo router unhe originate karta hai woh ASBR hai, bits 0x2 aur AS boundary router se dikhta hai.</li>
<li>E2 metric fixed rakhta hai; E1 internal cost jodta hai (20 R1 par 22 aur R2 par 21 ban gaya).</li>
<li>Tags dotted form mein print hote hain: 666 yaani 0.0.2.154.</li>
<li>Narrow route filters aur tags accidental leaks rokte hain.</li>
</ul></div>
`}};export{e as default};