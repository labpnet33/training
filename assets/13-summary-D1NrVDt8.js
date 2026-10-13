var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive you do a quick walk-around: tyres, lights, fuel, mirrors. This chapter is your walk-around before the ENARSI exam and before touching a production OSPF design. If you can tick every line below, you have covered objective 1.9 completely.</p>

<h3>Choosing an area type in ten seconds</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Area type decision tree">
<rect x="200" y="10" width="240" height="44" rx="8" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">Area 0, or transit for a</text><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="12">virtual link?</text>
<rect x="490" y="10" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="560" y="37" text-anchor="middle" class="svg-ink" font-size="12">Normal / backbone</text>
<line x1="440" y1="32" x2="490" y2="32" stroke="#64748b" stroke-width="2"/><text x="465" y="26" text-anchor="middle" class="svg-muted" font-size="12">yes</text>
<rect x="200" y="90" width="240" height="44" rx="8" fill="#fde68a"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="12">Local redistribution needed?</text>
<line x1="320" y1="54" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><text x="332" y="76" class="svg-muted" font-size="12">no</text>
<rect x="10" y="170" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="197" text-anchor="middle" class="svg-ink" font-size="12">Stub</text>
<rect x="165" y="170" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="235" y="197" text-anchor="middle" class="svg-ink" font-size="12">Totally stubby</text>
<rect x="335" y="170" width="140" height="44" rx="8" fill="#fed7aa"/><text x="405" y="197" text-anchor="middle" class="svg-ink" font-size="12">NSSA</text>
<rect x="490" y="170" width="140" height="44" rx="8" fill="#fed7aa"/><text x="560" y="197" text-anchor="middle" class="svg-ink" font-size="12">Totally NSSA</text>
<line x1="260" y1="134" x2="80" y2="170" stroke="#64748b" stroke-width="1.5"/><line x1="290" y1="134" x2="235" y2="170" stroke="#64748b" stroke-width="1.5"/>
<line x1="350" y1="134" x2="405" y2="170" stroke="#64748b" stroke-width="1.5"/><line x1="380" y1="134" x2="560" y2="170" stroke="#64748b" stroke-width="1.5"/>
<text x="150" y="150" text-anchor="middle" class="svg-muted" font-size="12">no</text><text x="490" y="150" text-anchor="middle" class="svg-muted" font-size="12">yes</text>
<text x="160" y="240" text-anchor="middle" class="svg-ink" font-size="12">keep T3 / default only</text>
<text x="485" y="240" text-anchor="middle" class="svg-ink" font-size="12">keep T3 / default only</text>
</svg><p class="cap">Two questions pick the area type. Then decide whether the area needs inter-area detail or just a default.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the router types (internal, backbone, ABR, ASBR) and the LSA types 1, 2, 3, 4, 5 and 7 with their creators and scopes.</li>
<li>State which LSAs each area type blocks, and which default route (O*IA or O*N2) each receives.</li>
<li>Configure stub (<code>area X stub</code> everywhere) and totally stubby (<code>no-summary</code> on the ABR), and tune <code>default-cost</code>.</li>
<li>Configure NSSA and totally NSSA, redistribute into them, add a default, and verify translation and the P-bit.</li>
<li>Explain E1/E2 and N1/N2, the seed metric and the forward metric.</li>
<li>Build and verify a virtual link, list its restrictions and alternatives.</li>
<li>Configure plain-text, MD5 (area and interface level) and HMAC-SHA key-chain authentication, including on a virtual link, and roll keys over without an outage.</li>
<li>Choose and troubleshoot network types: broadcast, point-to-point, non-broadcast with <code>neighbor</code>, point-to-multipoint.</li>
<li>Configure special areas inside OSPFv3 address families and fix the common address-family faults.</li>
<li>Run the four-level troubleshooting workflow on any of the seven lab scenarios.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Stub area</dt><dd>Blocks type-4 and type-5 LSAs; ABR injects a type-3 default.</dd>
<dt>Totally stubby area</dt><dd>Stub plus no type-3 except the default; <code>no-summary</code> on the ABR.</dd>
<dt>NSSA</dt><dd>Stub-like area that allows a local ASBR using type-7 LSAs.</dd>
<dt>Totally NSSA</dt><dd>NSSA plus no type-3 except an automatic O*IA default.</dd>
<dt>P-bit</dt><dd>Propagate bit in a type-7 LSA; tells the NSSA ABR to translate it to type-5.</dd>
<dt>Forwarding address</dt><dd>Address in an external LSA where traffic should be sent; must be reachable for the route to install.</dd>
<dt>Forward metric</dt><dd>Internal cost to the ASBR or forwarding address; E2 tie-breaker.</dd>
<dt>Transit area</dt><dd>The normal area a virtual link crosses.</dd>
<dt>OSPF_VL0</dt><dd>The area 0 virtual interface created by a virtual link.</dd>
<dt>Key chain</dt><dd>Set of keys with strings, algorithms and lifetimes used for HMAC-SHA authentication.</dd>
<dt>Address family</dt><dd>An OSPFv3 instance carrying IPv4 or IPv6 prefixes under one process.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Stub</td><td>Blocks T4 and T5; default is O*IA; every router needs <code>area X stub</code></td></tr>
<tr><td>Totally stubby / NSSA</td><td><code>no-summary</code> only matters on the ABR</td></tr>
<tr><td>NSSA default</td><td>None automatic; <code>default-information-originate</code> gives O*N2</td></tr>
<tr><td>Totally NSSA default</td><td>Automatic O*IA</td></tr>
<tr><td>Translation</td><td>ABR with highest RID translates T7 to T5; shows "Perform type-7/type-5 LSA translation"</td></tr>
<tr><td>Virtual link</td><td><code>area &lt;transit&gt; virtual-link &lt;RID&gt;</code>; transit must be normal; inherits area 0 auth</td></tr>
<tr><td>Authentication</td><td>Interface beats area; MD5 key ID and key must match; key chain needs ID, string and algorithm</td></tr>
<tr><td>Timers</td><td>10/40 broadcast and P2P; 30/120 NBMA and P2MP</td></tr>
<tr><td>Path preference</td><td>O, O IA, E1/N1, E2/N2; E2 ties on forward metric</td></tr>
<tr><td>OSPFv3 AF</td><td>IPv4 family still needs IPv6 link-local; area types set per family</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Area types (under router ospf 1)</span>
area 51 stub                         <span class="c">! all routers</span>
area 52 stub no-summary              <span class="c">! ABR</span>
area 51 default-cost 50              <span class="c">! ABR</span>
area 30 nssa                         <span class="c">! all routers</span>
area 30 nssa default-information-originate
area 40 nssa no-summary              <span class="c">! ABR</span>
redistribute connected subnets metric-type 1
<span class="c">! Virtual link</span>
area 1 virtual-link 3.3.3.3
area 1 virtual-link 3.3.3.3 message-digest-key 1 md5 N3tK1ngs
<span class="c">! Authentication</span>
area 0 authentication message-digest
 ip ospf message-digest-key 1 md5 N3tK1ngs
 ip ospf authentication message-digest
key chain OSPF-SHA
 key 1
  key-string Nk-Sha256-Key
  cryptographic-algorithm hmac-sha-256
 ip ospf authentication key-chain OSPF-SHA
<span class="c">! Network types</span>
 ip ospf network non-broadcast | point-to-multipoint [non-broadcast] | point-to-point
 neighbor 10.10.0.2</pre>

<div class="eg"><p><b>Worked example: one exam item, solved with the checklist.</b> Output: BR shows <code>O*N2 0.0.0.0/0 [110/1]</code> and several O IA routes; the ABR shows "It is a NSSA area" and "Perform type-7/type-5 LSA translation". Question: what area type is this and what command created the default? Plain NSSA, because O IA routes are present (not totally NSSA) and the default is type-7 (N2), which only comes from <code>area X nssa default-information-originate</code>.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Mixing up where <code>no-summary</code> goes, forgetting that NSSA has no automatic default, typing an interface IP in a virtual link, forgetting the virtual link key after enabling area 0 MD5, and comparing metrics across different route types.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Type-7 never leaves the NSSA. Stub blocks types 4 and 5, not only 5. A virtual link cannot cross a stub or NSSA. Authentication mismatch means no neighbour at all, not EXSTART. OSPFv3's IPv4 family needs IPv6 on the interface.</p></div>

<div class="scn"><h4>The design review that took five minutes</h4><p>A network architect was asked to review a new branch design: 60 sites, each with one uplink, eight of them with a local partner connection. Using the decision tree, she proposed totally stubby areas for the 52 plain branches and totally NSSA for the 8 partner branches, HMAC-SHA key chains with scheduled lifetimes everywhere, point-to-point network type on every two-router Ethernet link, and no virtual links. The review took five minutes because every choice had a one-line justification from this checklist.</p><p><b>Lesson:</b> the concepts in this module turn into a small set of repeatable design rules.</p></div>

<div class="iv"><p class="q">"Summarise OSPF area types in one minute."</p><p>Strong answer: normal areas take all LSAs. Stub blocks externals (types 4 and 5) and gets a type-3 default; totally stubby also blocks type-3 except the default. NSSA is stub plus a local ASBR using type-7, translated to type-5 by the ABR, with an optional O*N2 default; totally NSSA also blocks type-3 and gets an automatic O*IA default. Area 0 is the backbone; only normal areas can be transit for virtual links. Finish with where each command goes: area type on every router, no-summary on the ABR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two questions pick the area type: local redistribution needed, and inter-area detail needed.</li>
<li>Know the defaults: stub and totally variants O*IA automatic; plain NSSA none unless configured (O*N2).</li>
<li>Virtual links, authentication and network types are all neighbour-level contracts: both ends must agree.</li>
<li>Path preference is O, O IA, E1/N1, E2/N2, then metric, then forward metric.</li>
<li>Troubleshoot in four levels and read the exact show lines.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap jaldi se gaadi ke chaaron taraf dekh lete ho: tyres, lights, fuel, mirrors. Yeh chapter ENARSI exam se pehle aur production OSPF design chhoone se pehle aapka walk-around hai. Agar aap neeche ki har line tick kar sakte ho, to aapne objective 1.9 poora cover kar liya hai.</p>

<h3>Das seconds mein area type chunna</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Area type decision tree">
<rect x="200" y="10" width="240" height="44" rx="8" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">Area 0, ya virtual link ke</text><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="12">liye transit?</text>
<rect x="490" y="10" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="560" y="37" text-anchor="middle" class="svg-ink" font-size="12">Normal / backbone</text>
<line x1="440" y1="32" x2="490" y2="32" stroke="#64748b" stroke-width="2"/><text x="465" y="26" text-anchor="middle" class="svg-muted" font-size="12">haan</text>
<rect x="200" y="90" width="240" height="44" rx="8" fill="#fde68a"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="12">Local redistribution chahiye?</text>
<line x1="320" y1="54" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><text x="332" y="76" class="svg-muted" font-size="12">nahi</text>
<rect x="10" y="170" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="197" text-anchor="middle" class="svg-ink" font-size="12">Stub</text>
<rect x="165" y="170" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="235" y="197" text-anchor="middle" class="svg-ink" font-size="12">Totally stubby</text>
<rect x="335" y="170" width="140" height="44" rx="8" fill="#fed7aa"/><text x="405" y="197" text-anchor="middle" class="svg-ink" font-size="12">NSSA</text>
<rect x="490" y="170" width="140" height="44" rx="8" fill="#fed7aa"/><text x="560" y="197" text-anchor="middle" class="svg-ink" font-size="12">Totally NSSA</text>
<line x1="260" y1="134" x2="80" y2="170" stroke="#64748b" stroke-width="1.5"/><line x1="290" y1="134" x2="235" y2="170" stroke="#64748b" stroke-width="1.5"/>
<line x1="350" y1="134" x2="405" y2="170" stroke="#64748b" stroke-width="1.5"/><line x1="380" y1="134" x2="560" y2="170" stroke="#64748b" stroke-width="1.5"/>
<text x="150" y="150" text-anchor="middle" class="svg-muted" font-size="12">nahi</text><text x="490" y="150" text-anchor="middle" class="svg-muted" font-size="12">haan</text>
<text x="160" y="240" text-anchor="middle" class="svg-ink" font-size="12">T3 rakho / sirf default</text>
<text x="485" y="240" text-anchor="middle" class="svg-ink" font-size="12">T3 rakho / sirf default</text>
</svg><p class="cap">Do sawaal area type chunte hain. Phir decide karo ki area ko inter-area detail chahiye ya bas default.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Router types (internal, backbone, ABR, ASBR) aur LSA types 1, 2, 3, 4, 5 aur 7 ke naam unke creators aur scopes ke saath batao.</li>
<li>Batao ki har area type kaunse LSAs rokta hai, aur har ek ko kaunsa default route (O*IA ya O*N2) milta hai.</li>
<li>Stub (<code>area X stub</code> har jagah) aur totally stubby (ABR par <code>no-summary</code>) configure karo, aur <code>default-cost</code> tune karo.</li>
<li>NSSA aur totally NSSA configure karo, unmein redistribute karo, default jodo, aur translation aur P-bit verify karo.</li>
<li>E1/E2 aur N1/N2, seed metric aur forward metric samjhao.</li>
<li>Virtual link banao aur verify karo, uski restrictions aur alternatives list karo.</li>
<li>Plain-text, MD5 (area aur interface level) aur HMAC-SHA key-chain authentication configure karo, virtual link par bhi, aur bina outage ke keys roll over karo.</li>
<li>Network types chuno aur troubleshoot karo: broadcast, point-to-point, <code>neighbor</code> ke saath non-broadcast, point-to-multipoint.</li>
<li>OSPFv3 address families ke andar special areas configure karo aur common address-family faults theek karo.</li>
<li>Saat lab scenarios mein se kisi par bhi chaar-level troubleshooting workflow chalao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Stub area</dt><dd>Type-4 aur type-5 LSAs rokta hai; ABR type-3 default inject karta hai.</dd>
<dt>Totally stubby area</dt><dd>Stub plus default ke alawa koi type-3 nahi; ABR par <code>no-summary</code>.</dd>
<dt>NSSA</dt><dd>Stub jaisa area jo type-7 LSAs ke through local ASBR allow karta hai.</dd>
<dt>Totally NSSA</dt><dd>NSSA plus automatic O*IA default ke alawa koi type-3 nahi.</dd>
<dt>P-bit</dt><dd>Type-7 LSA ka propagate bit; NSSA ABR ko use type-5 mein translate karne ko kehta hai.</dd>
<dt>Forwarding address</dt><dd>External LSA ka woh address jahan traffic bhejna chahiye; route install hone ke liye reachable hona chahiye.</dd>
<dt>Forward metric</dt><dd>ASBR ya forwarding address tak ki internal cost; E2 tie-breaker.</dd>
<dt>Transit area</dt><dd>Woh normal area jise virtual link paar karta hai.</dd>
<dt>OSPF_VL0</dt><dd>Virtual link se bana area 0 virtual interface.</dd>
<dt>Key chain</dt><dd>Strings, algorithms aur lifetimes wali keys ka set jo HMAC-SHA authentication ke liye use hota hai.</dd>
<dt>Address family</dt><dd>Ek process ke andar IPv4 ya IPv6 prefixes le jaane wala OSPFv3 instance.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Stub</td><td>T4 aur T5 rokta hai; default O*IA hai; har router ko <code>area X stub</code> chahiye</td></tr>
<tr><td>Totally stubby / NSSA</td><td><code>no-summary</code> sirf ABR par matter karta hai</td></tr>
<tr><td>NSSA default</td><td>Automatic nahi; <code>default-information-originate</code> O*N2 deta hai</td></tr>
<tr><td>Totally NSSA default</td><td>Automatic O*IA</td></tr>
<tr><td>Translation</td><td>Highest RID wala ABR T7 ko T5 mein translate karta hai; "Perform type-7/type-5 LSA translation" dikhta hai</td></tr>
<tr><td>Virtual link</td><td><code>area &lt;transit&gt; virtual-link &lt;RID&gt;</code>; transit normal hona chahiye; area 0 auth inherit karta hai</td></tr>
<tr><td>Authentication</td><td>Interface area ko harata hai; MD5 key ID aur key match honi chahiye; key chain ko ID, string aur algorithm chahiye</td></tr>
<tr><td>Timers</td><td>Broadcast aur P2P 10/40; NBMA aur P2MP 30/120</td></tr>
<tr><td>Path preference</td><td>O, O IA, E1/N1, E2/N2; E2 ties forward metric par</td></tr>
<tr><td>OSPFv3 AF</td><td>IPv4 family ko ab bhi IPv6 link-local chahiye; area types har family mein set</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Area types (router ospf 1 ke andar)</span>
area 51 stub                         <span class="c">! saare routers</span>
area 52 stub no-summary              <span class="c">! ABR</span>
area 51 default-cost 50              <span class="c">! ABR</span>
area 30 nssa                         <span class="c">! saare routers</span>
area 30 nssa default-information-originate
area 40 nssa no-summary              <span class="c">! ABR</span>
redistribute connected subnets metric-type 1
<span class="c">! Virtual link</span>
area 1 virtual-link 3.3.3.3
area 1 virtual-link 3.3.3.3 message-digest-key 1 md5 N3tK1ngs
<span class="c">! Authentication</span>
area 0 authentication message-digest
 ip ospf message-digest-key 1 md5 N3tK1ngs
 ip ospf authentication message-digest
key chain OSPF-SHA
 key 1
  key-string Nk-Sha256-Key
  cryptographic-algorithm hmac-sha-256
 ip ospf authentication key-chain OSPF-SHA
<span class="c">! Network types</span>
 ip ospf network non-broadcast | point-to-multipoint [non-broadcast] | point-to-point
 neighbor 10.10.0.2</pre>

<div class="eg"><p><b>Worked example: checklist se hal hua ek exam item.</b> Output: BR <code>O*N2 0.0.0.0/0 [110/1]</code> aur kai O IA routes dikhata hai; ABR "It is a NSSA area" aur "Perform type-7/type-5 LSA translation" dikhata hai. Sawaal: yeh kaunsa area type hai aur kaunsi command ne default banaya? Plain NSSA, kyunki O IA routes maujood hain (totally NSSA nahi) aur default type-7 (N2) hai, jo sirf <code>area X nssa default-information-originate</code> se aata hai.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> <code>no-summary</code> kahan jaata hai usmein confuse hona, yeh bhoolna ki NSSA ka automatic default nahi hota, virtual link mein interface IP type karna, area 0 MD5 enable karne ke baad virtual link ki key bhoolna, aur alag route types ke beech metrics compare karna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Type-7 kabhi NSSA nahi chhodta. Stub types 4 aur 5 rokta hai, sirf 5 nahi. Virtual link stub ya NSSA paar nahi kar sakta. Authentication mismatch ka matlab hai koi neighbour hi nahi, EXSTART nahi. OSPFv3 ki IPv4 family ko interface par IPv6 chahiye.</p></div>

<div class="scn"><h4>Paanch minute ka design review</h4><p>Ek network architect se naye branch design ka review karne ko kaha gaya: 60 sites, har ek ka ek uplink, unmein se aath ke paas local partner connection. Decision tree use karke usne 52 plain branches ke liye totally stubby areas aur 8 partner branches ke liye totally NSSA propose kiya, har jagah scheduled lifetimes wali HMAC-SHA key chains, har do-router Ethernet link par point-to-point network type, aur koi virtual link nahi. Review paanch minute mein ho gaya kyunki har choice ka is checklist se ek line ka justification tha.</p><p><b>Lesson:</b> is module ke concepts kuch repeatable design rules mein badal jaate hain.</p></div>

<div class="iv"><p class="q">"OSPF area types ek minute mein summarise karo."</p><p>Strong answer: normal areas saare LSAs lete hain. Stub externals (types 4 aur 5) rokta hai aur type-3 default paata hai; totally stubby default ke alawa type-3 bhi rokta hai. NSSA stub plus type-7 use karne wala local ASBR hai, jise ABR type-5 mein translate karta hai, optional O*N2 default ke saath; totally NSSA type-3 bhi rokta hai aur automatic O*IA default paata hai. Area 0 backbone hai; sirf normal areas virtual links ke liye transit ban sakte hain. Aakhir mein batao ki har command kahan jaati hai: area type har router par, no-summary ABR par.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do sawaal area type chunte hain: local redistribution chahiye, aur inter-area detail chahiye.</li>
<li>Defaults yaad rakho: stub aur totally variants mein O*IA automatic; plain NSSA mein configure kiye bina koi nahi (O*N2).</li>
<li>Virtual links, authentication aur network types sab neighbour-level contracts hain: dono ends agree karne chahiye.</li>
<li>Path preference O, O IA, E1/N1, E2/N2, phir metric, phir forward metric hai.</li>
<li>Chaar levels mein troubleshoot karo aur exact show lines padho.</li>
</ul></div>
`}};export{e as default};