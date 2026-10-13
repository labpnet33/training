var e={id:`stub-nssa-areas`,h:{en:`Stub, totally stubby and NSSA areas`,hi:`Stub, totally stubby aur NSSA areas`},body:{en:`
<p>A small branch office does not need the full national phone directory. Give it the local extensions and one number, "for anything else call head office", and the branch phones get simpler and cheaper. Special OSPF areas work the same way: they block some LSA types and replace them with a <b>default route</b>. The routers inside need smaller databases and less CPU, which matters for branch routers with little memory.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Area types and the LSAs they allow">
<rect x="20" y="20" width="600" height="28" rx="6" fill="#e2e8f0"/>
<text x="40" y="39" class="svg-ink" font-size="13">Area type</text><text x="190" y="39" class="svg-ink" font-size="13">Type 3</text><text x="290" y="39" class="svg-ink" font-size="13">Type 5</text><text x="390" y="39" class="svg-ink" font-size="13">Type 7</text><text x="490" y="39" class="svg-ink" font-size="13">Default route</text>
<text x="40" y="78" class="svg-ink" font-size="13">Normal</text><text x="190" y="78" class="svg-muted" font-size="13">yes</text><text x="290" y="78" class="svg-muted" font-size="13">yes</text><text x="390" y="78" class="svg-muted" font-size="13">no</text><text x="490" y="78" class="svg-muted" font-size="13">none</text>
<text x="40" y="112" class="svg-ink" font-size="13">Stub</text><text x="190" y="112" class="svg-muted" font-size="13">yes</text><text x="290" y="112" class="svg-muted" font-size="13">blocked</text><text x="390" y="112" class="svg-muted" font-size="13">no</text><text x="490" y="112" class="svg-accent" font-size="13">type 3, if set</text>
<text x="40" y="146" class="svg-ink" font-size="13">Totally stubby</text><text x="190" y="146" class="svg-muted" font-size="13">blocked</text><text x="290" y="146" class="svg-muted" font-size="13">blocked</text><text x="390" y="146" class="svg-muted" font-size="13">no</text><text x="490" y="146" class="svg-accent" font-size="13">type 3, if set</text>
<text x="40" y="180" class="svg-ink" font-size="13">NSSA</text><text x="190" y="180" class="svg-muted" font-size="13">yes</text><text x="290" y="180" class="svg-muted" font-size="13">blocked</text><text x="390" y="180" class="svg-muted" font-size="13">yes</text><text x="490" y="180" class="svg-accent" font-size="13">type 7, if set</text>
<text x="40" y="214" class="svg-ink" font-size="13">Totally NSSA</text><text x="190" y="214" class="svg-muted" font-size="13">blocked</text><text x="290" y="214" class="svg-muted" font-size="13">blocked</text><text x="390" y="214" class="svg-muted" font-size="13">yes</text><text x="490" y="214" class="svg-accent" font-size="13">type 3, if set</text>
<text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="12">Junos ABR sends a default only when you configure default-metric (stub) or default-lsa (NSSA)</text>
</svg><p class="cap">What each area type allows. Totally means "also block type 3".</p></div>

<h3>Stub and totally stubby</h3>
<p>A <b>stub</b> area blocks type 5 LSAs (and so type 4). The ABR keeps sending type 3 summaries. A <b>totally stubby</b> area also blocks type 3, leaving only the router and network LSAs of the area and a default route. A stub area cannot contain an ASBR and cannot be the backbone or a transit area for a virtual link. <b>Every router in the area</b> must be configured as stub, because the stub bit in the hello must match (chapter 4):</p>
<pre class="code"><span class="c">! R2 (ABR) and R3 (internal) - both need the stub statement</span>
set protocols ospf area 0.0.0.30 stub
<span class="c">! ABR only</span>
set protocols ospf area 0.0.0.30 stub default-metric 10
set protocols ospf area 0.0.0.30 stub no-summaries</pre>
<p>The Junos behaviour that surprises engineers: a Junos ABR does <b>not</b> send a default route into a stub area unless you configure <code>default-metric</code>. In the lab we first made area 30 stub on both sides. R3 lost the external routes but was left without any default:</p>
<pre class="out">lab@R3-NASHIK&gt; show ospf overview
  Area: 0.0.0.30
    Stub type: <span class="hl">Stub, no default route injected</span>
lab@R3-NASHIK&gt; show route protocol ospf
10.1.12.0/30       *[OSPF/10] 00:01:00, metric 2
10.255.1.1/32      *[OSPF/10] 00:01:00, metric 2
...</pre>
<p>PC3 behind R3 lost the cloud server 198.51.100.10. After <code>default-metric 10</code> on R2 the ABR injects a type 3 LSA for 0.0.0.0 with metric 10:</p>
<pre class="out">lab@R3-NASHIK&gt; show ospf database netsummary detail
Summary  0.0.0.0          10.255.1.2       0x80000001    30  0x20 0x6ce7  28
  mask 0.0.0.0
  Topology default (ID 0) -&gt; Metric: 10
lab@R3-NASHIK&gt; show route 0.0.0.0/0 exact
0.0.0.0/0          *[OSPF/10] 00:00:30, metric <span class="hl">11</span>
                    &gt;  to 10.30.23.1 via ge-0/0/0.0</pre>
<p>The metric 11 is the default-metric 10 plus the link cost 1. With <code>no-summaries</code> added on R2 (the totally stubby step), R3's table shrinks to the default route only and its database has only the area's own LSAs plus the default:</p>
<pre class="out">lab@R3-NASHIK&gt; show ospf database
Router   10.255.1.2       10.255.1.2       0x80000003   120  0x20 0xfdb3  36
Router  *10.255.1.3       10.255.1.3       0x80000001   165  0x20 0xbff7  60
Network *10.30.23.2       10.255.1.3       0x80000001   165  0x20 0x94a1  32
Summary  0.0.0.0          10.255.1.2       0x80000001    60  0x20 0x6ce7  28</pre>

<h3>NSSA: a stub that can have an ASBR</h3>
<p>The Satara partner edge R4 injects a partner LAN, 203.0.113.0/24, so it is an ASBR. A stub area cannot hold an ASBR, but an <b>NSSA (not-so-stubby area)</b> can. Inside the NSSA the external route travels as a <b>type 7 LSA</b>; the NSSA ABR translates it into a type 5 for the rest of the AS. If several ABRs exist, the one with the highest router ID translates. The type 7 LSA has a <b>P-bit</b> that permits translation.</p>
<pre class="code">set protocols ospf area 0.0.0.40 nssa            <span class="c">! on R2 and R4</span>
set protocols ospf area 0.0.0.40 nssa default-lsa default-metric 20   <span class="c">! ABR: send a default</span></pre>
<pre class="out">lab@R4-SATARA&gt; show ospf database nssa detail
NSSA    *203.0.113.0      10.255.1.4       0x80000001    70  0x28 0x8ffd  36
  mask 255.255.255.0
    Type: 2, Metric: 0, Fwd addr: 10.40.24.2, Tag: 0.0.0.0
  <span class="hl">P-bit set: translated to a type 5 LSA by the NSSA ABR</span>
lab@R1-PUNE&gt; show ospf database extern detail
Extern   203.0.113.0      10.255.1.2       0x80000001    70  0x22 0x239d  36
  Translated from a type 7 LSA of area 0.0.0.40</pre>
<p>Notice that the type 5 seen at R1 is advertised by R2 (the translating ABR), not by R4. The NSSA needs its own default because type 5 LSAs of the rest of the network are blocked. The default originated by the ABR with <code>default-lsa</code> is a type 7 LSA, and R4 sees it as an external route:</p>
<pre class="out">lab@R4-SATARA&gt; show ospf database lsa-id 0.0.0.0 detail
NSSA     0.0.0.0          10.255.1.2       0x80000001    30  0x20 0x5cc1  36
  mask 0.0.0.0
    Type: 1, Metric: 20, Fwd addr: 0.0.0.0, Tag: 0.0.0.0
  <span class="hl">P-bit clear: not translated</span>
lab@R4-SATARA&gt; show route 0.0.0.0/0
0.0.0.0/0          *[OSPF/150] 00:00:30, metric 21</pre>
<p>The default has the P-bit clear so that it is never translated into the backbone. For a <b>totally NSSA</b> use <code>nssa no-summaries</code>; the ABR then sends a type 3 default.</p>

<div class="eg"><p><b>Worked example.</b> In the lab, R3 in Nashik first held 5 inter-area routes plus 2 external routes (198.51.100.0/24 and 203.0.113.0/24). As a plain stub it kept the 5 inter-area routes and lost the externals; as a totally stubby area it keeps only the default. In a real company with thousands of external prefixes the saving is what keeps a small branch router healthy.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>stub</code> on the ABR only. The hellos then mismatch and the adjacency never forms. Also, forgetting <code>default-metric</code> and wondering why the stub routers have no route to anything outside.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stub blocks type 5; totally stubby blocks 3, 4 and 5; NSSA blocks 5 but allows 7. The Junos ABR does not originate a default automatically. <code>no-summaries</code> and <code>default-metric</code> matter only on the ABR. The translating ABR is the one with the highest router ID.</p></div>

<div class="scn"><h4>The partner that lost the cloud</h4><p>After area 40 became an NSSA, the partner's server could reach the backbone but not the cloud server 198.51.100.10. The engineer remembered that type 5 LSAs stay out of an NSSA and that Junos sends no default on its own. One line on R2, <code>nssa default-lsa default-metric 20</code>, gave R4 a default (OSPF/150, metric 21) and the ping worked.</p><p><b>Lesson:</b> every stub or NSSA needs an explicit default plan.</p></div>

<div class="iv"><p class="q">"What is the difference between a stub area and an NSSA?"</p><p>Both block external type 5 LSAs. A stub area cannot contain an ASBR; an NSSA can, because it carries its own externals as type 7 LSAs which the NSSA ABR translates to type 5. Add that totally stubby/NSSA also block type 3, and that Junos requires <code>default-metric</code> or <code>default-lsa</code> on the ABR to send a default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stub blocks type 5; totally stubby blocks 3, 4 and 5 using <code>no-summaries</code>.</li>
<li>All routers in the area need the stub or nssa statement or hellos mismatch.</li>
<li>A Junos ABR needs <code>default-metric</code> or <code>default-lsa</code> to send a default.</li>
<li>NSSA carries externals as type 7; the ABR with the highest router ID translates them to type 5.</li>
<li>Check with <code>show ospf overview</code> and <code>show ospf database nssa detail</code>.</li>
</ul></div>
`,hi:`
<p>Chhote branch office ko poori national phone directory ki zaroorat nahi. Use local extensions aur ek number do, "baaki sab ke liye head office ko call karo", to branch phones simple aur sasti ho jaate hain. Special OSPF areas aise hi kaam karte hain: wo kuch LSA types block karke unki jagah ek <b>default route</b> dete hain. Andar ke routers ko chhote databases aur kam CPU chahiye, jo kam memory wale branch routers ke liye maayne rakhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Area types aur wo kaun se LSAs allow karte hain">
<rect x="20" y="20" width="600" height="28" rx="6" fill="#e2e8f0"/>
<text x="40" y="39" class="svg-ink" font-size="13">Area type</text><text x="190" y="39" class="svg-ink" font-size="13">Type 3</text><text x="290" y="39" class="svg-ink" font-size="13">Type 5</text><text x="390" y="39" class="svg-ink" font-size="13">Type 7</text><text x="490" y="39" class="svg-ink" font-size="13">Default route</text>
<text x="40" y="78" class="svg-ink" font-size="13">Normal</text><text x="190" y="78" class="svg-muted" font-size="13">haan</text><text x="290" y="78" class="svg-muted" font-size="13">haan</text><text x="390" y="78" class="svg-muted" font-size="13">nahi</text><text x="490" y="78" class="svg-muted" font-size="13">koi nahi</text>
<text x="40" y="112" class="svg-ink" font-size="13">Stub</text><text x="190" y="112" class="svg-muted" font-size="13">haan</text><text x="290" y="112" class="svg-muted" font-size="13">block</text><text x="390" y="112" class="svg-muted" font-size="13">nahi</text><text x="490" y="112" class="svg-accent" font-size="13">type 3, set ho to</text>
<text x="40" y="146" class="svg-ink" font-size="13">Totally stubby</text><text x="190" y="146" class="svg-muted" font-size="13">block</text><text x="290" y="146" class="svg-muted" font-size="13">block</text><text x="390" y="146" class="svg-muted" font-size="13">nahi</text><text x="490" y="146" class="svg-accent" font-size="13">type 3, set ho to</text>
<text x="40" y="180" class="svg-ink" font-size="13">NSSA</text><text x="190" y="180" class="svg-muted" font-size="13">haan</text><text x="290" y="180" class="svg-muted" font-size="13">block</text><text x="390" y="180" class="svg-muted" font-size="13">haan</text><text x="490" y="180" class="svg-accent" font-size="13">type 7, set ho to</text>
<text x="40" y="214" class="svg-ink" font-size="13">Totally NSSA</text><text x="190" y="214" class="svg-muted" font-size="13">block</text><text x="290" y="214" class="svg-muted" font-size="13">block</text><text x="390" y="214" class="svg-muted" font-size="13">haan</text><text x="490" y="214" class="svg-accent" font-size="13">type 3, set ho to</text>
<text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="12">Junos ABR default tabhi bhejta hai jab default-metric (stub) ya default-lsa (NSSA) configure ho</text>
</svg><p class="cap">Har area type kya allow karta hai. Totally ka matlab "type 3 bhi block".</p></div>

<h3>Stub aur totally stubby</h3>
<p><b>Stub</b> area type 5 LSAs (aur isliye type 4) block karta hai. ABR type 3 summaries bhejta rehta hai. <b>Totally stubby</b> area type 3 bhi block karta hai, sirf area ke router aur network LSAs aur ek default route bachte hain. Stub area mein ASBR nahi ho sakta aur ye backbone ya virtual link ka transit area nahi ho sakta. <b>Area ke har router</b> par stub configure hona chahiye, kyunki hello mein stub bit match hona chahiye (chapter 4):</p>
<pre class="code"><span class="c">! R2 (ABR) aur R3 (internal) - dono par stub statement chahiye</span>
set protocols ospf area 0.0.0.30 stub
<span class="c">! sirf ABR par</span>
set protocols ospf area 0.0.0.30 stub default-metric 10
set protocols ospf area 0.0.0.30 stub no-summaries</pre>
<p>Junos ka behaviour jo engineers ko chaunka deta hai: Junos ABR stub area mein default route <b>nahi</b> bhejta jab tak aap <code>default-metric</code> configure na karo. Lab mein pehle humne area 30 ko dono taraf stub banaya. R3 ne external routes kho diye par koi default bhi nahi mila:</p>
<pre class="out">lab@R3-NASHIK&gt; show ospf overview
  Area: 0.0.0.30
    Stub type: <span class="hl">Stub, no default route injected</span>
lab@R3-NASHIK&gt; show route protocol ospf
10.1.12.0/30       *[OSPF/10] 00:01:00, metric 2
10.255.1.1/32      *[OSPF/10] 00:01:00, metric 2
...</pre>
<p>R3 ke peeche PC3 ne cloud server 198.51.100.10 kho diya. R2 par <code>default-metric 10</code> ke baad ABR metric 10 ke saath 0.0.0.0 ka type 3 LSA inject karta hai:</p>
<pre class="out">lab@R3-NASHIK&gt; show ospf database netsummary detail
Summary  0.0.0.0          10.255.1.2       0x80000001    30  0x20 0x6ce7  28
  mask 0.0.0.0
  Topology default (ID 0) -&gt; Metric: 10
lab@R3-NASHIK&gt; show route 0.0.0.0/0 exact
0.0.0.0/0          *[OSPF/10] 00:00:30, metric <span class="hl">11</span>
                    &gt;  to 10.30.23.1 via ge-0/0/0.0</pre>
<p>Metric 11 matlab default-metric 10 plus link cost 1. R2 par <code>no-summaries</code> jodne ke baad (totally stubby step), R3 ki table sirf default route tak sikud jaati hai aur database mein area ke apne LSAs plus default bachta hai:</p>
<pre class="out">lab@R3-NASHIK&gt; show ospf database
Router   10.255.1.2       10.255.1.2       0x80000003   120  0x20 0xfdb3  36
Router  *10.255.1.3       10.255.1.3       0x80000001   165  0x20 0xbff7  60
Network *10.30.23.2       10.255.1.3       0x80000001   165  0x20 0x94a1  32
Summary  0.0.0.0          10.255.1.2       0x80000001    60  0x20 0x6ce7  28</pre>

<h3>NSSA: stub jisme ASBR ho sakta hai</h3>
<p>Satara partner edge R4 partner LAN, 203.0.113.0/24, inject karta hai, isliye wo ASBR hai. Stub area mein ASBR nahi ho sakta, par <b>NSSA (not-so-stubby area)</b> mein ho sakta hai. NSSA ke andar external route <b>type 7 LSA</b> ke roop mein chalta hai; NSSA ABR use baaki AS ke liye type 5 mein translate karta hai. Kai ABRs hon to sabse bade router ID wala translate karta hai. Type 7 LSA mein ek <b>P-bit</b> hota hai jo translation allow karta hai.</p>
<pre class="code">set protocols ospf area 0.0.0.40 nssa            <span class="c">! R2 aur R4 par</span>
set protocols ospf area 0.0.0.40 nssa default-lsa default-metric 20   <span class="c">! ABR: default bhejo</span></pre>
<pre class="out">lab@R4-SATARA&gt; show ospf database nssa detail
NSSA    *203.0.113.0      10.255.1.4       0x80000001    70  0x28 0x8ffd  36
  mask 255.255.255.0
    Type: 2, Metric: 0, Fwd addr: 10.40.24.2, Tag: 0.0.0.0
  <span class="hl">P-bit set: translated to a type 5 LSA by the NSSA ABR</span>
lab@R1-PUNE&gt; show ospf database extern detail
Extern   203.0.113.0      10.255.1.2       0x80000001    70  0x22 0x239d  36
  Translated from a type 7 LSA of area 0.0.0.40</pre>
<p>Dhyan do ki R1 par dikhne wala type 5 R2 (translate karne wala ABR) advertise karta hai, R4 nahi. NSSA ko apna default chahiye kyunki baaki network ke type 5 LSAs block hain. ABR <code>default-lsa</code> se jo default banata hai wo type 7 LSA hai, aur R4 use external route ki tarah dekhta hai:</p>
<pre class="out">lab@R4-SATARA&gt; show ospf database lsa-id 0.0.0.0 detail
NSSA     0.0.0.0          10.255.1.2       0x80000001    30  0x20 0x5cc1  36
  mask 0.0.0.0
    Type: 1, Metric: 20, Fwd addr: 0.0.0.0, Tag: 0.0.0.0
  <span class="hl">P-bit clear: not translated</span>
lab@R4-SATARA&gt; show route 0.0.0.0/0
0.0.0.0/0          *[OSPF/150] 00:00:30, metric 21</pre>
<p>Default mein P-bit clear hai taaki wo backbone mein kabhi translate na ho. <b>Totally NSSA</b> ke liye <code>nssa no-summaries</code> use karo; tab ABR type 3 default bhejta hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab mein Nashik ke R3 ke paas pehle 5 inter-area routes plus 2 external routes (198.51.100.0/24 aur 203.0.113.0/24) the. Plain stub mein usne 5 inter-area routes rakhe aur externals kho diye; totally stubby mein sirf default rakhta hai. Asli company mein hazaaron external prefixes hon to yahi bachat chhote branch router ko healthy rakhti hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>stub</code> sirf ABR par configure karna. Tab hellos mismatch hote hain aur adjacency kabhi nahi banti. Saath hi, <code>default-metric</code> bhool jaana aur sochna ki stub routers ke paas bahar ka route kyun nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stub type 5 block karta hai; totally stubby 3, 4 aur 5; NSSA 5 block karta hai par 7 allow. Junos ABR apne aap default originate nahi karta. <code>no-summaries</code> aur <code>default-metric</code> sirf ABR par maayne rakhte hain. Translate karne wala ABR sabse bade router ID wala hota hai.</p></div>

<div class="scn"><h4>Partner jisne cloud kho diya</h4><p>Area 40 ko NSSA banane ke baad partner ka server backbone tak pahunch raha tha par cloud server 198.51.100.10 tak nahi. Engineer ko yaad aaya ki type 5 LSAs NSSA se bahar rehte hain aur Junos apne aap default nahi bhejta. R2 par ek line, <code>nssa default-lsa default-metric 20</code>, ne R4 ko default diya (OSPF/150, metric 21) aur ping chal gaya.</p><p><b>Lesson:</b> har stub ya NSSA ke liye explicit default plan chahiye.</p></div>

<div class="iv"><p class="q">"Stub area aur NSSA mein kya difference hai?"</p><p>Dono external type 5 LSAs block karte hain. Stub area mein ASBR nahi ho sakta; NSSA mein ho sakta hai, kyunki wo apne externals type 7 LSAs mein le jaata hai jinhe NSSA ABR type 5 mein translate karta hai. Jodo ki totally stubby/NSSA type 3 bhi block karte hain, aur Junos ABR par default bhejne ke liye <code>default-metric</code> ya <code>default-lsa</code> chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stub type 5 block karta hai; totally stubby <code>no-summaries</code> se 3, 4 aur 5 block karta hai.</li>
<li>Area ke saare routers par stub ya nssa statement chahiye, warna hellos mismatch.</li>
<li>Junos ABR ko default bhejne ke liye <code>default-metric</code> ya <code>default-lsa</code> chahiye.</li>
<li>NSSA externals type 7 mein le jaata hai; sabse bade router ID wala ABR unhe type 5 mein translate karta hai.</li>
<li><code>show ospf overview</code> aur <code>show ospf database nssa detail</code> se check karo.</li>
</ul></div>
`}};export{e as default};