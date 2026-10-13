var e={id:`big-picture`,h:{en:`Why routing policy exists: the big picture`,hi:`Routing policy kyun hoti hai: bada picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to control which routes a Junos router learns and which routes it tells its neighbours. You will write policy-statements with terms, match routes with protocol, route-filter and prefix-list, change metric and tag, chain several policies in the right order, and prove the result with <code>test policy</code> before you trust it. These are core JNCIA-Junos (JN0-106) skills.</p>
<p><b>Prerequisites.</b> You should know what a routing table is, how OSPF neighbours exchange routes, what a static route is, and how to use the Junos CLI (configuration mode, <code>set</code>, <code>commit</code>, <code>show route</code>). Earlier modules cover those. Here we build on them and do not repeat them.</p>

<h3>Start with an analogy: the customs desk</h3>
<p>Imagine an international airport. Passengers arrive from many flights. At the <b>arrival</b> customs desk an officer decides who may enter the country and may stamp a note on the passport. At the <b>departure</b> desk another officer decides which passengers may board an outgoing flight. The airport itself (the routing table) holds everyone who is currently inside.</p>
<p>A Junos router works the same way. Routes arrive from protocols (OSPF, BGP, static configuration). A <b>routing policy</b> is the officer at the desk. It looks at each route and says accept, reject, or accept-with-a-change.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Import and export policy positions">
<rect x="20" y="70" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">Neighbour</text><text x="85" y="113" text-anchor="middle" class="svg-muted" font-size="12">sends routes</text>
<rect x="255" y="55" width="130" height="90" rx="8" fill="#bbf7d0"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text><text x="320" y="113" text-anchor="middle" class="svg-muted" font-size="12">inet.0</text>
<rect x="490" y="70" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="555" y="95" text-anchor="middle" class="svg-ink" font-size="13">Neighbour</text><text x="555" y="113" text-anchor="middle" class="svg-muted" font-size="12">gets routes</text>
<line x1="150" y1="100" x2="255" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="255,100 245,95 245,105" fill="#64748b"/>
<line x1="385" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="490,100 480,95 480,105" fill="#64748b"/>
<rect x="170" y="30" width="70" height="26" rx="6" fill="#fde68a"/><text x="205" y="48" text-anchor="middle" class="svg-ink" font-size="12">IMPORT</text>
<rect x="400" y="30" width="70" height="26" rx="6" fill="#fed7aa"/><text x="435" y="48" text-anchor="middle" class="svg-ink" font-size="12">EXPORT</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Policy sits between the protocol and the routing table</text>
</svg><p class="cap">Import policy works on routes coming in. Export policy works on routes going out.</p></div>

<h3>The two directions, defined</h3>
<dl class="terms">
<dt>Routing policy</dt><dd>A set of rules, written as a <code>policy-statement</code>, that matches routes and takes actions on them.</dd>
<dt>Import policy</dt><dd>Applied to routes <b>learned</b> from a protocol before they are placed in the routing table.</dd>
<dt>Export policy</dt><dd>Applied to <b>active routes</b> in the routing table before a protocol advertises them to neighbours.</dd>
<dt>Active route</dt><dd>The single best route the router chose for a prefix. Only active routes are exported.</dd>
</dl>
<p>Notice the word "export" always means "from the routing table out to a protocol". It does not only mean "send to another router". This matters in our first lab: static routes are exported <b>into</b> OSPF.</p>

<h3>Why this matters in a real network</h3>
<p>Without policy, a protocol follows blind defaults. A router could leak a private management network to a partner, accept a route it should never trust, or fail to advertise static routes at all. Policy is how engineers say "advertise only the partner networks", "give those routes a metric of 20" or "never let the vendor subnet leave this building".</p>
<div class="eg"><p><b>Worked example.</b> Router R1 in Chennai has four static routes towards a logistics partner: 172.20.1.0/24, 172.20.2.0/24, 172.20.8.0/22 and 192.168.99.0/24 (vendor management). The core router R2 needs the first three only. An export policy on R1 accepts static routes inside 172.20.0.0/16 and nothing else. R2 learns three routes. The vendor network never leaves R1. You will build exactly this in the module labs.</p></div>

<h3>The three tools you will use all module</h3>
<pre class="code"><span class="c">! 1. write the policy</span>
set policy-options policy-statement PARTNER-OUT term PARTNERS from protocol static
set policy-options policy-statement PARTNER-OUT term PARTNERS then accept
<span class="c">! 2. prove it before applying</span>
run test policy PARTNER-OUT 172.20.0.0/16
<span class="c">! 3. apply it to a protocol</span>
set protocols ospf export PARTNER-OUT</pre>
<p>Writing a policy changes nothing by itself. A policy only does work when you <b>apply</b> it as an import or export policy of a protocol. This is a classic beginner surprise: you commit a perfect policy and see no effect because nothing references it.</p>

<div class="warn"><p><b>Common mistake.</b> Treating policy as a firewall. A routing policy filters <b>routes</b> (prefixes in the routing table). It never looks at user traffic. Packet filtering is a different tool, the firewall filter, which the next module covers.</p></div>
<div class="exam"><p><b>Exam trap.</b> The policy hierarchy is <code>policy-options</code>, not <code>protocols</code>. You define under <code>policy-options policy-statement</code> and apply under the protocol with <code>import</code> or <code>export</code>.</p></div>

<div class="scn"><h4>The route that leaked to the partner</h4><p>A retail company shared a BGP session with a payment partner. After a new management subnet was added as a static route, an engineer redistributed all statics. Next morning the partner's security team reported they could see the private 192.168.99.0/24 network in their routing table. The fix was an export policy with an explicit accept for only the approved prefixes, and a final reject. They also added a review step: test policy output attached to every change ticket.</p><p><b>Lesson:</b> advertising is a decision. Policy makes the decision explicit and testable.</p></div>

<div class="iv"><p class="q">"What is the difference between an import and an export policy in Junos?"</p><p>Strong answer: import policy filters or modifies routes a protocol learns before they enter the routing table; export policy decides which active routes in the routing table a protocol advertises. Both are written once under policy-options and applied under the protocol. Add that without a policy each protocol uses its own default, and give one real example such as exporting static routes into OSPF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing policy controls which routes are learned (import) and advertised (export).</li>
<li>Export means routing table to protocol; only active routes are exported.</li>
<li>Define under policy-options policy-statement; apply under the protocol.</li>
<li>A policy that is not applied has no effect.</li>
<li>Routing policy filters routes, not user packets.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Junos router kaunse routes learn kare aur kaunse routes apne neighbours ko bataye, yeh kaise control karte hain. Aap terms wale policy-statements likhoge, protocol, route-filter aur prefix-list se routes match karoge, metric aur tag badloge, kai policies ko sahi order mein chain karoge, aur trust karne se pehle <code>test policy</code> se result prove karoge. Yeh JNCIA-Junos (JN0-106) ke core skills hain.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki routing table kya hai, OSPF neighbours routes kaise exchange karte hain, static route kya hota hai, aur Junos CLI kaise chalate hain (configuration mode, <code>set</code>, <code>commit</code>, <code>show route</code>). Pichle modules mein yeh sab hai. Yahan hum usi par aage badhte hain, dohrate nahi.</p>

<h3>Analogy se shuru karo: customs desk</h3>
<p>Ek international airport sochiye. Kai flights se passengers aate hain. <b>Arrival</b> customs desk par officer decide karta hai ki kaun desh mein aa sakta hai aur passport par note laga sakta hai. <b>Departure</b> desk par doosra officer decide karta hai ki kaun outgoing flight mein baith sakta hai. Airport khud (routing table) un sabko rakhta hai jo abhi andar hain.</p>
<p>Junos router bhi aise hi kaam karta hai. Routes protocols (OSPF, BGP, static configuration) se aate hain. <b>Routing policy</b> desk ka officer hai. Woh har route ko dekhkar kehta hai accept, reject, ya badlaav ke saath accept.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Import and export policy positions">
<rect x="20" y="70" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">Neighbour</text><text x="85" y="113" text-anchor="middle" class="svg-muted" font-size="12">routes bhejta hai</text>
<rect x="255" y="55" width="130" height="90" rx="8" fill="#bbf7d0"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text><text x="320" y="113" text-anchor="middle" class="svg-muted" font-size="12">inet.0</text>
<rect x="490" y="70" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="555" y="95" text-anchor="middle" class="svg-ink" font-size="13">Neighbour</text><text x="555" y="113" text-anchor="middle" class="svg-muted" font-size="12">routes paata hai</text>
<line x1="150" y1="100" x2="255" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="255,100 245,95 245,105" fill="#64748b"/>
<line x1="385" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="490,100 480,95 480,105" fill="#64748b"/>
<rect x="170" y="30" width="70" height="26" rx="6" fill="#fde68a"/><text x="205" y="48" text-anchor="middle" class="svg-ink" font-size="12">IMPORT</text>
<rect x="400" y="30" width="70" height="26" rx="6" fill="#fed7aa"/><text x="435" y="48" text-anchor="middle" class="svg-ink" font-size="12">EXPORT</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Policy protocol aur routing table ke beech hoti hai</text>
</svg><p class="cap">Import policy aane wale routes par kaam karti hai. Export policy jaane wale routes par.</p></div>

<h3>Dono directions, define karke</h3>
<dl class="terms">
<dt>Routing policy</dt><dd>Rules ka set, jo <code>policy-statement</code> mein likha jaata hai, routes match karta hai aur un par actions leta hai.</dd>
<dt>Import policy</dt><dd>Protocol se <b>seekhe</b> gaye routes par, routing table mein rakhne se pehle lagti hai.</dd>
<dt>Export policy</dt><dd>Routing table ke <b>active routes</b> par, protocol ke neighbours ko advertise karne se pehle lagti hai.</dd>
<dt>Active route</dt><dd>Router ka ek prefix ke liye chuna hua single best route. Sirf active routes export hote hain.</dd>
</dl>
<p>Dhyan do, "export" ka matlab hamesha "routing table se protocol ke andar/bahar" hai. Yeh sirf "doosre router ko bhejo" nahi hai. Hamari pehli lab mein yeh important hai: static routes OSPF <b>mein</b> export hote hain.</p>

<h3>Real network mein yeh kyun zaroori hai</h3>
<p>Policy ke bina protocol andhe defaults follow karta hai. Router partner ko private management network leak kar sakta hai, aisa route accept kar sakta hai jis par bharosa nahi karna chahiye, ya static routes advertise hi nahi karta. Policy se engineers kehte hain "sirf partner networks advertise karo", "un routes ko metric 20 do" ya "vendor subnet building se bahar kabhi na jaaye".</p>
<div class="eg"><p><b>Worked example.</b> Chennai ke router R1 par logistics partner ki taraf chaar static routes hain: 172.20.1.0/24, 172.20.2.0/24, 172.20.8.0/22 aur 192.168.99.0/24 (vendor management). Core router R2 ko sirf pehle teen chahiye. R1 par export policy 172.20.0.0/16 ke andar ke static routes accept karti hai, aur kuch nahi. R2 teen routes seekhta hai. Vendor network R1 se bahar nahi jaata. Aap module labs mein yahi banaoge.</p></div>

<h3>Poore module mein teen tools</h3>
<pre class="code"><span class="c">! 1. policy likho</span>
set policy-options policy-statement PARTNER-OUT term PARTNERS from protocol static
set policy-options policy-statement PARTNER-OUT term PARTNERS then accept
<span class="c">! 2. apply karne se pehle prove karo</span>
run test policy PARTNER-OUT 172.20.0.0/16
<span class="c">! 3. protocol par apply karo</span>
set protocols ospf export PARTNER-OUT</pre>
<p>Policy likhne se khud kuch nahi badalta. Policy tabhi kaam karti hai jab aap use protocol ki import ya export policy ke roop mein <b>apply</b> karte ho. Yeh beginners ke liye classic surprise hai: perfect policy commit ki, asar nahi dikha, kyunki kisi ne use reference hi nahi kiya.</p>

<div class="warn"><p><b>Common mistake.</b> Policy ko firewall samajhna. Routing policy <b>routes</b> (routing table ke prefixes) filter karti hai. Woh user traffic ko kabhi nahi dekhti. Packet filtering alag tool hai, firewall filter, jo agla module cover karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy ki hierarchy <code>policy-options</code> hai, <code>protocols</code> nahi. Define karte ho <code>policy-options policy-statement</code> ke neeche aur apply karte ho protocol ke neeche <code>import</code> ya <code>export</code> se.</p></div>

<div class="scn"><h4>Partner ko leak hua route</h4><p>Ek retail company ka payment partner ke saath BGP session tha. Naya management subnet static route ke roop mein add hua to ek engineer ne saare statics redistribute kar diye. Agli subah partner ki security team ne bataya ki unhe apni routing table mein private 192.168.99.0/24 network dikh raha hai. Fix yeh tha ki export policy mein sirf approved prefixes ke liye explicit accept aur aakhir mein reject lagaya. Saath hi review step joda: har change ticket ke saath test policy ka output attach hota hai.</p><p><b>Lesson:</b> advertise karna ek decision hai. Policy us decision ko explicit aur testable banati hai.</p></div>

<div class="iv"><p class="q">"Junos mein import aur export policy mein kya farak hai?"</p><p>Strong answer: import policy protocol ke seekhe hue routes ko routing table mein aane se pehle filter ya modify karti hai; export policy decide karti hai ki routing table ke kaunse active routes protocol advertise kare. Dono policy-options ke neeche ek baar likhi jaati hain aur protocol ke neeche apply hoti hain. Yeh bhi jodo ki policy ke bina har protocol apna default use karta hai, aur ek real example do jaise static routes ko OSPF mein export karna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing policy control karti hai ki kaunse routes learn hon (import) aur advertise hon (export).</li>
<li>Export ka matlab routing table se protocol; sirf active routes export hote hain.</li>
<li>Define policy-options policy-statement ke neeche; apply protocol ke neeche.</li>
<li>Jo policy apply nahi hui, uska koi asar nahi.</li>
<li>Routing policy routes filter karti hai, user packets nahi.</li>
</ul></div>
`}};export{e as default};