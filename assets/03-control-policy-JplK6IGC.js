var e={id:`control-policy`,h:{en:`Control policy: match and action on routes and TLOCs`,hi:`Control policy: routes aur TLOCs par match aur action`},body:{en:`
<p>A centralized control policy is a list of sequences that the Controller applies to OMP updates. It works on two kinds of update: <b>route</b> sequences (OMP routes, also called vRoutes) and <b>tloc</b> sequences (TLOC routes). The direction of the policy decides whether the Controller filters what it receives from an edge or what it sends to an edge.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Control policy in and out directions">
<rect x="10" y="80" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="75" y="108" text-anchor="middle" class="svg-ink" font-size="13">Edge A</text><text x="75" y="128" text-anchor="middle" class="svg-muted" font-size="12">advertises</text>
<rect x="255" y="60" width="130" height="110" rx="10" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">in policy</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">out policy</text>
<rect x="500" y="80" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="565" y="108" text-anchor="middle" class="svg-ink" font-size="13">Edge B</text><text x="565" y="128" text-anchor="middle" class="svg-muted" font-size="12">receives</text>
<path d="M140 115 L255 115 M385 115 L500 115" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="198" y="105" text-anchor="middle" class="svg-muted" font-size="12">in</text><text x="442" y="105" text-anchor="middle" class="svg-muted" font-size="12">out</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">in: edge to Controller. out: Controller to edge.</text>
</svg><p class="cap">Direction is relative to the Controller.</p></div>

<h3>Match options</h3>
<p><b>Route</b> sequences can match on: color, community, OMP tag, origin, originator, preference, prefix list, site, TLOC, VPN, region. <b>TLOC</b> sequences can match on: carrier, color, domain ID, originator, preference, site, TLOC list, region. You may combine conditions in one sequence; all of them must be true for a match.</p>

<h3>Action options</h3>
<p>Every sequence ends in <b>accept</b> or <b>reject</b>. With accept you can add <code>set</code> statements that change the update before it is sent on:</p>
<ul>
<li><code>set preference</code>: the OMP preference of a route or TLOC (higher is preferred).</li>
<li><code>set tloc</code> or <code>set tloc-action</code>: replace or steer to a given TLOC (for example a hub TLOC).</li>
<li><code>set service</code>: send the route through a service such as a firewall (next chapters).</li>
<li><code>set omp-tag</code>: attach a tag for later matching.</li>
<li><code>export-to</code>: leak the route into another VPN list (route leaking between VPNs).</li>
</ul>

<h3>Click path: a custom control policy</h3>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Policies</b> &gt; <b>Centralized Policy</b> &gt; <b>Add Policy</b>.</li>
<li>After the lists, at <b>Configure Topology and VPN Membership</b>, click <b>Add Topology</b> and choose <b>Custom Control (Route and TLOC)</b>.</li>
<li>Give it a name and click <b>Sequence Type</b>, then pick <b>Route</b> or <b>TLOC</b>.</li>
<li>Click <b>Sequence Rule</b>, choose the match fields (for example <b>Site</b> or <b>TLOC</b>), then choose the action <b>Accept</b> or <b>Reject</b> and add the set fields.</li>
<li>Set the <b>Default Action</b> and click <b>Save Match and Actions</b>, then <b>Save Control Policy</b>.</li>
</ol>
<p>The wizard shows the same policy later as the CLI below.</p>

<h3>Example: prefer Delhi MPLS for the data-centre prefix</h3>
<pre class="code">policy
 control-policy PREFER-DEL-MPLS
  sequence 10
   match route
    prefix-list DC-NETS
    vpn-list CORP
   !
   action accept
    set
     preference 200
    !
   !
  !
  default-action accept
 !
!</pre>
<p>The default action is accept here on purpose: only the data-centre prefix is changed and everything else passes. If you leave the default as reject, every other route disappears.</p>

<h3>Example: restrict what E-BLR-1 learns</h3>
<pre class="code">policy
 control-policy BLR-LIMIT
  sequence 10
   match tloc
    tloc-list HUB-TLOCS
   !
   action accept
   !
  !
  sequence 20
   match route
    site-id 100
   !
   action accept
   !
  !
  default-action reject
 !
!</pre>
<p>Applied outbound to site 300, this lets Bengaluru learn only the hub TLOCs and routes from site 100. All other sites are invisible to it, so it builds tunnels only to Delhi.</p>

<h3>Reading the result</h3>
<pre class="out">vsmart# show running-config policy control-policy BLR-LIMIT
policy
 control-policy BLR-LIMIT
  sequence 10
   match tloc
    tloc-list HUB-TLOCS
   !
   action accept
   !
  !</pre>
<p>On the edge the effect appears in <code>show sdwan omp tlocs</code> and <code>show sdwan omp routes</code>: fewer entries than before. The policy itself is not on the edge.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving the default action as reject on a policy that should only tweak a few routes; matching only routes and forgetting that tunnels need TLOC updates too (so the TLOCs vanish and BFD cannot form); and wrong direction.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember: route sequences deal with prefixes, tloc sequences deal with TLOCs, set actions include preference, tloc, service and tag. The policy is evaluated on the Controller in sequence order and ends at the default action.</p></div>

<div class="scn"><h4>The branch that lost its tunnels</h4><p>An engineer wrote a control policy for site 300 that accepted the data-centre routes but had no TLOC sequence, and left the default as reject. After activation the routes were present but the next hops pointed at TLOCs the branch had never learned, so the routes were not installed and BFD stayed down. Adding a TLOC sequence that accepted the hub TLOC list fixed it.</p></div>

<div class="iv"><p class="q">"What is the difference between a route sequence and a tloc sequence in a control policy?"</p><p>Strong answer: a route sequence matches OMP routes (prefixes, site, VPN, tag) and can change preference or next hop; a tloc sequence matches TLOC advertisements (TLOC list, color, carrier) and can change TLOC preference. A route is usable only if its TLOC is known, so topology policies usually need both.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sequences are tested in order; first match wins; default action applies last and is reject for control policy.</li>
<li>Route and tloc are separate sequence types; a route needs a reachable TLOC.</li>
<li>Actions: accept or reject plus set preference, tloc, service, omp-tag, export-to.</li>
<li>Direction is relative to the Controller: in from edges, out to edges.</li>
</ul></div>
`,hi:`
<p>Centralized control policy sequences ki list hai jo Controller OMP updates par lagata hai. Yeh do tarah ke updates par kaam karti hai: <b>route</b> sequences (OMP routes, jinhe vRoutes bhi kehte hain) aur <b>tloc</b> sequences (TLOC routes). Policy ki direction tay karti hai ki Controller edge se jo receive karta hai use filter kare ya edge ko jo bhejta hai use.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Control policy in aur out directions">
<rect x="10" y="80" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="75" y="108" text-anchor="middle" class="svg-ink" font-size="13">Edge A</text><text x="75" y="128" text-anchor="middle" class="svg-muted" font-size="12">advertise karta hai</text>
<rect x="255" y="60" width="130" height="110" rx="10" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">in policy</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">out policy</text>
<rect x="500" y="80" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="565" y="108" text-anchor="middle" class="svg-ink" font-size="13">Edge B</text><text x="565" y="128" text-anchor="middle" class="svg-muted" font-size="12">receive karta hai</text>
<path d="M140 115 L255 115 M385 115 L500 115" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="198" y="105" text-anchor="middle" class="svg-muted" font-size="12">in</text><text x="442" y="105" text-anchor="middle" class="svg-muted" font-size="12">out</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">in: edge se Controller. out: Controller se edge.</text>
</svg><p class="cap">Direction Controller ke relative hoti hai.</p></div>

<h3>Match options</h3>
<p><b>Route</b> sequences in par match kar sakti hain: color, community, OMP tag, origin, originator, preference, prefix list, site, TLOC, VPN, region. <b>TLOC</b> sequences in par: carrier, color, domain ID, originator, preference, site, TLOC list, region. Ek sequence mein kai conditions mila sakte ho; match ke liye sab sahi honi chahiye.</p>

<h3>Action options</h3>
<p>Har sequence <b>accept</b> ya <b>reject</b> par khatam hoti hai. Accept ke saath <code>set</code> statements jod sakte ho jo update ko aage bhejne se pehle badalte hain:</p>
<ul>
<li><code>set preference</code>: route ya TLOC ki OMP preference (zyada preferred).</li>
<li><code>set tloc</code> ya <code>set tloc-action</code>: kisi diye gaye TLOC ko replace ya steer karo (jaise hub TLOC).</li>
<li><code>set service</code>: route ko firewall jaisi service se guzaro (agle chapters).</li>
<li><code>set omp-tag</code>: baad mein match ke liye tag lagao.</li>
<li><code>export-to</code>: route ko doosri VPN list mein leak karo (VPNs ke beech route leaking).</li>
</ul>

<h3>Click path: custom control policy</h3>
<ol>
<li><b>Configuration</b> &gt; <b>Policies</b> &gt; <b>Centralized Policy</b> &gt; <b>Add Policy</b> kholo.</li>
<li>Lists ke baad, <b>Configure Topology and VPN Membership</b> par <b>Add Topology</b> click karo aur <b>Custom Control (Route and TLOC)</b> chuno.</li>
<li>Naam do aur <b>Sequence Type</b> click karo, phir <b>Route</b> ya <b>TLOC</b> chuno.</li>
<li><b>Sequence Rule</b> click karo, match fields chuno (jaise <b>Site</b> ya <b>TLOC</b>), phir action <b>Accept</b> ya <b>Reject</b> chuno aur set fields jodo.</li>
<li><b>Default Action</b> set karo aur <b>Save Match and Actions</b> click karo, phir <b>Save Control Policy</b>.</li>
</ol>
<p>Wizard wahi policy baad mein neeche wale CLI ki tarah dikhata hai.</p>

<h3>Example: data-centre prefix ke liye Delhi MPLS prefer karo</h3>
<pre class="code">policy
 control-policy PREFER-DEL-MPLS
  sequence 10
   match route
    prefix-list DC-NETS
    vpn-list CORP
   !
   action accept
    set
     preference 200
    !
   !
  !
  default-action accept
 !
!</pre>
<p>Yahan default action jaan-boojhkar accept hai: sirf data-centre prefix badla jaata hai aur baaki sab nikal jaata hai. Default reject chhod do to baaki har route gayab ho jaata hai.</p>

<h3>Example: E-BLR-1 kya seekhe use restrict karo</h3>
<pre class="code">policy
 control-policy BLR-LIMIT
  sequence 10
   match tloc
    tloc-list HUB-TLOCS
   !
   action accept
   !
  !
  sequence 20
   match route
    site-id 100
   !
   action accept
   !
  !
  default-action reject
 !
!</pre>
<p>Site 300 par outbound apply karne se Bengaluru sirf hub TLOCs aur site 100 ke routes seekhta hai. Baaki sab sites use dikhti nahi, isliye woh sirf Delhi ke saath tunnels banata hai.</p>

<h3>Result padhna</h3>
<pre class="out">vsmart# show running-config policy control-policy BLR-LIMIT
policy
 control-policy BLR-LIMIT
  sequence 10
   match tloc
    tloc-list HUB-TLOCS
   !
   action accept
   !
  !</pre>
<p>Edge par asar <code>show sdwan omp tlocs</code> aur <code>show sdwan omp routes</code> mein dikhta hai: pehle se kam entries. Policy khud edge par nahi hoti.</p>

<div class="warn"><p><b>Common mistakes.</b> Aisi policy par default action reject chhodna jo sirf kuch routes tweak karne ke liye hai; sirf routes match karna aur bhoolna ki tunnels ko TLOC updates bhi chahiye (TLOCs gayab, BFD ban nahi paata); aur galat direction.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho: route sequences prefixes se deal karti hain, tloc sequences TLOCs se, set actions mein preference, tloc, service aur tag hain. Policy Controller par sequence order mein evaluate hoti hai aur default action par khatam hoti hai.</p></div>

<div class="scn"><h4>Branch jisne tunnels kho diye</h4><p>Ek engineer ne site 300 ke liye control policy likhi jo data-centre routes accept karti thi lekin TLOC sequence nahi thi, aur default reject tha. Activation ke baad routes the lekin next hops aise TLOCs ki taraf the jo branch ne kabhi seekhe hi nahi, isliye routes install nahi hue aur BFD down raha. Hub TLOC list accept karne wali TLOC sequence jodne se theek hua.</p></div>

<div class="iv"><p class="q">"Control policy mein route sequence aur tloc sequence mein kya farak hai?"</p><p>Strong answer: route sequence OMP routes match karti hai (prefixes, site, VPN, tag) aur preference ya next hop badal sakti hai; tloc sequence TLOC advertisements match karti hai (TLOC list, color, carrier) aur TLOC preference badal sakti hai. Route tabhi usable hai jab uska TLOC pata ho, isliye topology policies ko aam taur par dono chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sequences order mein test hoti hain; pehla match jeetta hai; default action aakhir mein lagta hai aur control policy ke liye reject hai.</li>
<li>Route aur tloc alag sequence types hain; route ko reachable TLOC chahiye.</li>
<li>Actions: accept ya reject plus set preference, tloc, service, omp-tag, export-to.</li>
<li>Direction Controller ke relative hai: in edges se, out edges ko.</li>
</ul></div>
`}};export{e as default};