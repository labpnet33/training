var e={id:`path-policy`,h:{en:`Path policy: active, backup and failure paths, SLA-based selection`,hi:`Path policy: active, backup aur failure paths, SLA-based selection`},body:{en:`
<p><b>Path policy</b> is the heart of SD-WAN: it chooses the circuit and the overlay for each flow. This chapter covers the rule fields, how paths are chosen (SLA compliant or best path), what active, backup and Layer 3 failure paths mean, how load sharing and failover behave, and how rule order works. These are exam topics under <b>policy design: path</b>.</p>
<h3>Analogy: a taxi dispatcher with three plans</h3>
<p>For each customer the dispatcher has Plan A (the roads to use normally), Plan B (what to use if Plan A roads are slow or closed) and Plan C (the emergency route when even the maps are down). Path policy writes those plans per application.</p>
<h3>The three path lists in a rule</h3>
<table class="cmp"><tr><th>List</th><th>When it is used</th><th>Notes from the documentation</th></tr>
<tr><td><b>Active paths</b></td><td>Normal operation; flows are placed here while the paths meet the policy</td><td>Mandatory in a rule</td></tr>
<tr><td><b>Backup paths</b></td><td>When active paths fail or no longer meet the SLA</td><td>Optional</td></tr>
<tr><td><b>Layer 3 failure paths</b></td><td>Last resort when the active and backup paths are unavailable; the documented example uses a Prisma SD-WAN VPN on a metered 5G circuit</td><td>Optional</td></tr></table>
<p>Each path is defined by an <b>overlay</b> and a <b>circuit category</b>. The overlay options are <b>Direct</b>, <b>Prisma SD-WAN VPN</b> and <b>Standard VPN</b> (see chapter 6 of the design module). The circuit category chooses the circuits, for example "all public" or "private WAN". In the documented performance example for a web point-of-sale application, the active path is Prisma SD-WAN VPN on the primary internet, there is no backup path and the Layer 3 failure path is Prisma SD-WAN VPN on a metered 5G circuit.</p>
<h3>How the path is chosen</h3>
<p>The rule offers two selection styles:</p>
<ul>
<li><b>SLA compliant path.</b> The ION picks a path that meets a performance SLA built from link quality metrics (latency, loss, jitter and MOS), probes (ICMP, DNS, HTTP or HTTPS) and application metrics. This is the dynamic path selection behaviour: flows follow the paths that currently qualify.</li>
<li><b>Best path selection.</b> The ION picks the single best path by one metric, either link-quality-monitoring based or probe based.</li>
</ul>
<p>The fabric measures every path continuously. When a path stops qualifying, new flows move to a qualifying path and, depending on policy, flows in progress can be steered too (the performance policy in the next chapter decides that). The documentation recommends enabling link quality monitoring on non-hub paths for all circuit categories used, so that performance-based selection has data.</p>
<h3>Load sharing</h3>
<p>The documentation describes policies that enable "active-active load balancing". When a rule lists more than one active path, the ION can spread flows across them, so you use both internet circuits at once instead of leaving one idle. For an application that breaks when its flows jump between circuits, the Layer 7 app-def has a <b>path affinity</b> setting (Strict or None); Strict keeps a user's sessions on one path.</p>
<h3>Rule fields</h3>
<p>The documented path rule fields are:</p>
<ul>
<li><b>Name, description, tags</b>, <b>Order</b> (1 to 65535, lower is higher priority, default 1024) and <b>Disable rule</b>.</li>
<li><b>Match:</b> network contexts, source and destination prefixes, source and destination device profiles, users and groups, applications (up to 256 applications per rule).</li>
<li><b>Paths:</b> active, backup, Layer 3 failure, each with overlay and circuit category.</li>
<li><b>Service and DC groups:</b> active and backup service or data center groups, with a Required checkbox (not available if direct paths are selected).</li>
</ul>
<h3>Default rules</h3>
<p>A default path policy set contains two rules: a <b>Default rule</b> for unknown or external traffic and an <b>Enterprise Default rule</b> for traffic to enterprise subnets. Anything your own rules do not match falls to them. Make sure they do what you want: a default rule that sends all unknown traffic over a metered 5G circuit is an expensive surprise.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Path selection flow">
<rect x="10" y="20" width="150" height="60" rx="10" fill="#bae6fd"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="13">Flow classified</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="11">app + context + prefix</text>
<rect x="190" y="20" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="265" y="46" text-anchor="middle" class="svg-ink" font-size="13">First matching rule</text><text x="265" y="64" text-anchor="middle" class="svg-muted" font-size="11">by order number</text>
<rect x="370" y="20" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="435" y="46" text-anchor="middle" class="svg-ink" font-size="13">Active paths</text><text x="435" y="64" text-anchor="middle" class="svg-muted" font-size="11">meet the SLA?</text>
<rect x="530" y="20" width="100" height="60" rx="10" fill="#fde68a"/><text x="580" y="46" text-anchor="middle" class="svg-ink" font-size="13">Backup</text><text x="580" y="64" text-anchor="middle" class="svg-muted" font-size="11">if not</text>
<line x1="160" y1="50" x2="190" y2="50" stroke="#64748b" stroke-width="2"/><line x1="340" y1="50" x2="370" y2="50" stroke="#64748b" stroke-width="2"/><line x1="500" y1="50" x2="530" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="530" y="120" width="100" height="60" rx="10" fill="#fed7aa"/><text x="580" y="146" text-anchor="middle" class="svg-ink" font-size="13">L3 failure</text><text x="580" y="164" text-anchor="middle" class="svg-muted" font-size="11">last resort</text>
<line x1="580" y1="80" x2="580" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="200" width="620" height="50" rx="10" fill="#e2e8f0"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="13">No match: Default rule or Enterprise Default rule</text>
</svg><p class="cap">Rule order picks the rule; the rule then lists active, backup and Layer 3 failure paths.</p></div>
<h3>Rule order and the hierarchy of sets</h3>
<p>Rules are evaluated by order number, lowest first, and the first match decides. Put specific rules (one application, one data center) above general ones, as the performance best practices also recommend. In an advanced stack the sets themselves are ordered, so a global set can sit above a regional one. Keep the hierarchy shallow: simple stacks unless you need layers.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>The documented route to create a path policy set is Configuration, Prisma SD-WAN, Policies, Paths, Advanced, Path Sets, Add Set. Enter a name (required), optional description and tags, optionally clone from an existing or original policy set, then click Done. Then add rules to the set (fields above), place the set in a simple or advanced path stack, and bind the stack to sites. Sets can only be created in the Advanced view.</p>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Design table for the Harbor Foods path set. Not device commands;</span>
<span class="c">! field wording follows the documentation.</span>
Order  Name            Match                         Active              Backup              L3 failure
 100   Payments        context PAYMENT, app Gateway  VPN on private WAN  VPN on public       VPN on 5G
 200   Voice           app Voice                     VPN on private WAN  VPN on public       none
 300   ERP             app ERP, dest DC-EAST range   VPN on public+priv  none                none
 400   SaaS-direct     app category SaaS (trusted)   Direct on public    VPN on public       none
1024   Default (system) any                          per default rule    per default rule    per default rule</pre>
<div class="eg"><p><b>Worked example: load sharing numbers.</b> STORE-007 has Internet-A 500 Mbps and Internet-B 300 Mbps. The ERP rule lists both as active paths. With 200 Mbps of ERP and web traffic, both circuits carry flows and each stays far below its limit, and if Internet-A degrades, flows move to Internet-B (up to 300 Mbps capacity) without the user seeing it. Without load sharing, one circuit would carry everything and the other would idle.</p></div>
<div class="warn"><p><b>Common mistakes.</b> A broad rule at order 100 that catches traffic meant for a later specific rule. Backup paths on a metered circuit that also appear as active in another rule, so the data plan is eaten. Omitting a Layer 3 failure path for payments. Forgetting that a rule needs an active path.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active is mandatory; backup and Layer 3 failure are optional. Rule order 1 to 65535 with default 1024, lower wins, first match wins. SLA compliant path uses link quality, probes and application metrics; best path uses a single metric. The three overlays: Direct, Prisma SD-WAN VPN, Standard VPN.</p></div>
<div class="scn"><h4>The 5G bill</h4><p>A chain used a 5G circuit as the Layer 3 failure path for payments, but its default rule also listed 5G as a backup for all unknown traffic. During a three-hour fibre outage at one store, staff video streaming and software updates (unknown to specific rules) went over 5G and consumed the monthly data plan. The fix was a specific bulk-block rule before the default rule and a default rule limited to the stable circuits.</p><p><b>Lesson:</b> check what the default rules do on your most expensive circuit.</p></div>
<div class="iv"><p class="q">"Explain active, backup and Layer 3 failure paths in a Prisma SD-WAN path policy."</p><p>Active paths carry flows in normal operation and are mandatory. Backup paths are used when active paths fail or stop meeting the SLA. Layer 3 failure paths are the last resort when the active and backup paths are unavailable, for example a VPN over a metered cellular circuit. I pick them per application, using SLA compliant selection so that flows follow paths that currently qualify.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A path rule picks overlay and circuit category for active, backup and Layer 3 failure paths.</li>
<li>Selection is SLA compliant (several metrics) or best path (one metric).</li>
<li>Rule order 1 to 65535, default 1024, lower first, first match wins; default rules catch the rest.</li>
<li>Several active paths allow load sharing; path affinity keeps sessions on one path when needed.</li>
<li>Check default rules and metered circuits so that backup choices do not cost money.</li>
</ul></div>
`,hi:`
<p><b>Path policy</b> SD-WAN ka dil hai: yeh har flow ke liye circuit aur overlay chunti hai. Yeh chapter rule fields, paths kaise chune jaate hain (SLA compliant ya best path), active, backup aur Layer 3 failure paths ka matlab, load sharing aur failover ka behaviour, aur rule order kaise kaam karta hai batata hai. Yeh <b>policy design: path</b> ke under exam topics hain.</p>
<h3>Analogy: teen plans wala taxi dispatcher</h3>
<p>Har customer ke liye dispatcher ke paas Plan A (normal mein kaunsi sadkein), Plan B (Plan A ki sadkein slow ya band hon to kya) aur Plan C (emergency route jab maps bhi down hon) hota hai. Path policy yeh plans har application ke liye likhti hai.</p>
<h3>Rule mein teen path lists</h3>
<table class="cmp"><tr><th>List</th><th>Kab use hoti hai</th><th>Documentation ke notes</th></tr>
<tr><td><b>Active paths</b></td><td>Normal operation; jab tak paths policy meet karte hain flows yahan rakhe jaate hain</td><td>Rule mein mandatory</td></tr>
<tr><td><b>Backup paths</b></td><td>Jab active paths fail hon ya SLA meet na karein</td><td>Optional</td></tr>
<tr><td><b>Layer 3 failure paths</b></td><td>Last resort jab active aur backup paths available na hon; documented example metered 5G circuit par Prisma SD-WAN VPN use karta hai</td><td>Optional</td></tr></table>
<p>Har path ek <b>overlay</b> aur ek <b>circuit category</b> se define hota hai. Overlay options hain <b>Direct</b>, <b>Prisma SD-WAN VPN</b> aur <b>Standard VPN</b> (design module ka chapter 6 dekho). Circuit category circuits chunti hai, jaise "all public" ya "private WAN". Web point-of-sale application ke documented performance example mein active path primary internet par Prisma SD-WAN VPN hai, backup path nahi hai aur Layer 3 failure path metered 5G circuit par Prisma SD-WAN VPN hai.</p>
<h3>Path kaise chuna jaata hai</h3>
<p>Rule do selection styles deta hai:</p>
<ul>
<li><b>SLA compliant path.</b> ION woh path chunta hai jo link quality metrics (latency, loss, jitter aur MOS), probes (ICMP, DNS, HTTP ya HTTPS) aur application metrics se bane performance SLA ko meet kare. Yeh dynamic path selection behaviour hai: flows un paths ko follow karte hain jo abhi qualify karte hain.</li>
<li><b>Best path selection.</b> ION ek metric se single best path chunta hai, link-quality-monitoring based ya probe based.</li>
</ul>
<p>Fabric har path ko lagataar naapta hai. Jab koi path qualify karna band karta hai, naye flows qualifying path par move hote hain aur policy ke hisaab se chal rahe flows ko bhi steer kiya ja sakta hai (yeh agle chapter ki performance policy tay karti hai). Documentation recommend karti hai ki use hone wali sabhi circuit categories ke non-hub paths par link quality monitoring enable karo, taaki performance-based selection ke paas data ho.</p>
<h3>Load sharing</h3>
<p>Documentation un policies ko describe karti hai jo "active-active load balancing" enable karti hain. Jab rule mein ek se zyada active path ho to ION flows ko unmein baant sakta hai, isliye aap dono internet circuits ek saath use karte ho, ek ko idle chhodne ki jagah. Jis application ke flows circuits ke beech koodne par toot jaate hain, uske liye Layer 7 app-def mein <b>path affinity</b> setting hai (Strict ya None); Strict user ke sessions ko ek path par rakhta hai.</p>
<h3>Rule fields</h3>
<p>Documented path rule fields hain:</p>
<ul>
<li><b>Name, description, tags</b>, <b>Order</b> (1 se 65535, lower matlab higher priority, default 1024) aur <b>Disable rule</b>.</li>
<li><b>Match:</b> network contexts, source aur destination prefixes, source aur destination device profiles, users aur groups, applications (har rule mein 256 applications tak).</li>
<li><b>Paths:</b> active, backup, Layer 3 failure, har ek overlay aur circuit category ke saath.</li>
<li><b>Service aur DC groups:</b> active aur backup service ya data center groups, Required checkbox ke saath (direct paths select hon to available nahi).</li>
</ul>
<h3>Default rules</h3>
<p>Default path policy set mein do rules hote hain: unknown ya external traffic ke liye <b>Default rule</b> aur enterprise subnets ke traffic ke liye <b>Enterprise Default rule</b>. Jo aapke apne rules match nahi karte woh inpar girta hai. Pakka karo ki yeh wahi karein jo aap chahte ho: aisa default rule jo saara unknown traffic metered 5G circuit par bhejta hai mehnga surprise hai.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Path selection flow">
<rect x="10" y="20" width="150" height="60" rx="10" fill="#bae6fd"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="13">Flow classified</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="11">app + context + prefix</text>
<rect x="190" y="20" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="265" y="46" text-anchor="middle" class="svg-ink" font-size="13">Pehla matching rule</text><text x="265" y="64" text-anchor="middle" class="svg-muted" font-size="11">order number se</text>
<rect x="370" y="20" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="435" y="46" text-anchor="middle" class="svg-ink" font-size="13">Active paths</text><text x="435" y="64" text-anchor="middle" class="svg-muted" font-size="11">SLA meet karte hain?</text>
<rect x="530" y="20" width="100" height="60" rx="10" fill="#fde68a"/><text x="580" y="46" text-anchor="middle" class="svg-ink" font-size="13">Backup</text><text x="580" y="64" text-anchor="middle" class="svg-muted" font-size="11">nahi to</text>
<line x1="160" y1="50" x2="190" y2="50" stroke="#64748b" stroke-width="2"/><line x1="340" y1="50" x2="370" y2="50" stroke="#64748b" stroke-width="2"/><line x1="500" y1="50" x2="530" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="530" y="120" width="100" height="60" rx="10" fill="#fed7aa"/><text x="580" y="146" text-anchor="middle" class="svg-ink" font-size="13">L3 failure</text><text x="580" y="164" text-anchor="middle" class="svg-muted" font-size="11">last resort</text>
<line x1="580" y1="80" x2="580" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="200" width="620" height="50" rx="10" fill="#e2e8f0"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="13">Match nahi: Default rule ya Enterprise Default rule</text>
</svg><p class="cap">Rule order rule chunta hai; phir rule active, backup aur Layer 3 failure paths list karta hai.</p></div>
<h3>Rule order aur sets ka hierarchy</h3>
<p>Rules order number se evaluate hote hain, sabse kam pehle, aur pehla match decide karta hai. Specific rules (ek application, ek data center) general rules ke upar rakho, jaisa performance best practices bhi recommend karti hain. Advanced stack mein sets khud ordered hote hain, isliye global set regional set ke upar baith sakta hai. Hierarchy ko shallow rakho: jab tak layers na chahiye, simple stacks.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>Path policy set banane ka documented route hai Configuration, Prisma SD-WAN, Policies, Paths, Advanced, Path Sets, Add Set. Name (required), optional description aur tags daalo, chaho to existing ya original policy set se clone karo, phir Done click karo. Phir set mein rules add karo (upar ke fields), set ko simple ya advanced path stack mein rakho, aur stack ko sites se bind karo. Sets sirf Advanced view mein ban sakte hain.</p>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Harbor Foods path set ki design table. Device commands nahi;</span>
<span class="c">! field wording documentation ke hisaab se.</span>
Order  Name            Match                         Active              Backup              L3 failure
 100   Payments        context PAYMENT, app Gateway  VPN on private WAN  VPN on public       VPN on 5G
 200   Voice           app Voice                     VPN on private WAN  VPN on public       none
 300   ERP             app ERP, dest DC-EAST range   VPN on public+priv  none                none
 400   SaaS-direct     app category SaaS (trusted)   Direct on public    VPN on public       none
1024   Default (system) any                          per default rule    per default rule    per default rule</pre>
<div class="eg"><p><b>Worked example: load sharing ke numbers.</b> STORE-007 ke paas Internet-A 500 Mbps aur Internet-B 300 Mbps hain. ERP rule dono ko active paths ki tarah list karta hai. 200 Mbps ERP aur web traffic ke saath dono circuits flows uthate hain aur har ek apni limit se bahut neeche rehta hai, aur agar Internet-A degrade ho to flows Internet-B par (300 Mbps capacity tak) move ho jaate hain bina user ko pata chale. Load sharing ke bina ek circuit sab kuch uthata aur doosra idle rehta.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Order 100 par broad rule jo baad ke specific rule ka traffic pakad leta hai. Metered circuit par backup paths jo doosre rule mein active bhi hain, jisse data plan khatam hota hai. Payments ke liye Layer 3 failure path chhodna. Yeh bhoolna ki rule ko active path chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active mandatory hai; backup aur Layer 3 failure optional. Rule order 1 se 65535, default 1024, lower jeetta hai, pehla match jeetta hai. SLA compliant path link quality, probes aur application metrics use karta hai; best path ek metric. Teen overlays: Direct, Prisma SD-WAN VPN, Standard VPN.</p></div>
<div class="scn"><h4>5G ka bill</h4><p>Ek chain ne payments ke liye 5G circuit ko Layer 3 failure path banaya, par uske default rule mein bhi saare unknown traffic ke backup ke roop mein 5G list tha. Ek store par teen ghante ke fibre outage mein staff video streaming aur software updates (specific rules ke liye unknown) 5G par gaye aur monthly data plan kha gaye. Fix tha default rule se pehle specific bulk-block rule aur default rule ko stable circuits tak limit karna.</p><p><b>Seekh:</b> check karo ki default rules aapke sabse mehnge circuit par kya karte hain.</p></div>
<div class="iv"><p class="q">"Prisma SD-WAN path policy mein active, backup aur Layer 3 failure paths samjhao."</p><p>Active paths normal operation mein flows uthate hain aur mandatory hain. Backup paths tab use hote hain jab active paths fail hon ya SLA meet karna band karein. Layer 3 failure paths last resort hain jab active aur backup paths available na hon, jaise metered cellular circuit par VPN. Main unhe application ke hisaab se chunta hoon, SLA compliant selection ke saath taaki flows un paths ko follow karein jo abhi qualify karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Path rule active, backup aur Layer 3 failure paths ke liye overlay aur circuit category chunta hai.</li>
<li>Selection SLA compliant (kai metrics) ya best path (ek metric) hota hai.</li>
<li>Rule order 1 se 65535, default 1024, lower pehle, pehla match jeetta hai; default rules baaki pakadte hain.</li>
<li>Kai active paths load sharing dete hain; path affinity zaroorat par sessions ko ek path par rakhti hai.</li>
<li>Default rules aur metered circuits check karo taaki backup choices paise na khayein.</li>
</ul></div>
`}};export{e as default};