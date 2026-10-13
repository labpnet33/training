var e={id:`route-preference`,h:{en:`Route preference, active routes and the two tables`,hi:`Route preference, active routes aur do tables`},body:{en:`
<p><b>Two tables, two jobs.</b> A Junos router keeps two tables for IPv4 unicast. The <b>routing table</b> (<code>inet.0</code>) lives on the Routing Engine and holds <i>every</i> route learned from every source, including routes that lose. The <b>forwarding table</b> lives on the Packet Forwarding Engine and holds only the single best next hop per prefix. The Routing Engine decides; the PFE obeys. When you troubleshoot, always ask first which of the two you are looking at.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Routing table to forwarding table">
<rect x="20" y="30" width="200" height="130" rx="10" fill="#bae6fd"/><text x="120" y="55" text-anchor="middle" class="svg-ink" font-size="14">inet.0 (RE)</text>
<text x="40" y="82" class="svg-ink" font-size="12">172.30.0.0/16 Static/5  nh A</text><text x="40" y="104" class="svg-ink" font-size="12">172.30.0.0/16 Static/20 nh B</text><text x="40" y="126" class="svg-ink" font-size="12">10.0.0.0/8 OSPF/10 nh C</text>
<rect x="420" y="30" width="200" height="130" rx="10" fill="#bbf7d0"/><text x="520" y="55" text-anchor="middle" class="svg-ink" font-size="14">Forwarding table (PFE)</text>
<text x="440" y="82" class="svg-ink" font-size="12">172.30.0.0/16 via A</text><text x="440" y="104" class="svg-ink" font-size="12">10.0.0.0/8 via C</text>
<line x1="220" y1="95" x2="420" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="12">active routes only</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Static/20 stays in inet.0 as a standby</text>
</svg><p class="cap">The standby route stays in the routing table but is not forwarded on.</p></div>

<h3>How the router chooses</h3>
<p>For a packet, two decisions happen in this order:</p>
<ol>
<li><b>Longest prefix match.</b> Among all prefixes that contain the destination, the one with the longest mask wins. A /24 always beats a /16 for an address in both, <i>whatever their preference</i>.</li>
<li><b>Route preference.</b> If several routes exist for the <i>same</i> prefix, the lowest preference is chosen as the <b>active</b> route. If preferences tie, further tie-breakers (metric and protocol rules) apply.</li>
</ol>
<p>Beginners often reverse these. Preference only chooses among routes to the exact same prefix and length.</p>

<h3>Default preference values</h3>
<table class="cmp"><tr><th>Route source</th><th>Default preference</th><th>Shown as</th></tr>
<tr><td>Directly connected and local</td><td>0</td><td>Direct, Local</td></tr>
<tr><td>Static</td><td>5</td><td>Static</td></tr>
<tr><td>OSPF internal</td><td>10</td><td>OSPF</td></tr>
<tr><td>Aggregate and generated</td><td>130</td><td>Aggregate</td></tr>
<tr><td>OSPF external</td><td>150</td><td>OSPF</td></tr>
<tr><td>BGP</td><td>170</td><td>BGP</td></tr></table>
<p>These are Junos defaults. Other vendors use different "administrative distance" numbers (for example static 1, OSPF 110), so never carry the numbers from one vendor to another. Directly connected networks always win because they are the most trustworthy source.</p>

<h3>Reading a route entry</h3>
<p>This real output comes from the branch lab after the primary static route was fixed. Both routes are for 172.30.0.0/16:</p>
<pre class="out">lab@BR1&gt; show route 172.30.0.0/16 exact
inet.0: 8 destinations, 9 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.30.0.0/16      <span class="hl">*[Static/5]</span> 00:00:00
                    &gt;  to 10.60.1.2 via ge-0/0/0.0
                    <span class="hl">[Static/20]</span> 00:00:40
                    &gt;  to 10.60.2.2 via ge-0/0/1.0</pre>
<p>Read it left to right:</p>
<ul>
<li>The header says 8 destinations and 9 routes: one destination has two routes. "8 active" means eight are in use.</li>
<li><code>*</code> marks the active route. <code>[Static/5]</code> is the protocol and its preference. The time is the age of the route.</li>
<li><code>&gt;</code> marks the selected next hop. <code>to 10.60.1.2 via ge-0/0/0.0</code> is the next-hop address and the outgoing logical interface.</li>
<li>The second line without a star is the <b>inactive</b> route. It is a ready backup.</li>
</ul>
<p>Use <code>show route summary</code> to see how many routes each protocol contributes, and <code>show route ... detail</code> for next-hop type, state and age.</p>
<pre class="out">lab@BR1&gt; show route summary
Autonomous system number: not configured
Router ID: 10.60.1.1
inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
              Direct:         3 routes,      3 active
              Local:          3 routes,      3 active
              Static:         2 routes,      2 active</pre>

<h3>Changing preference</h3>
<p>You can change preference per route, or for all routes of a source:</p>
<pre class="code">set routing-options static route 172.32.0.0/16 next-hop 10.60.1.2 preference 7
set routing-options static defaults preference 8      <span class="c">! for static routes without their own value</span></pre>
<p>Lowering a protocol's preference makes its routes more trusted. A common design uses a <b>floating static route</b>: a static with a preference higher than the dynamic protocol (for example 200) that becomes active only when the dynamic route disappears. Remember that static default preference 5 beats OSPF's 10, so a static route for the same prefix overrides OSPF unless you change it.</p>

<div class="eg"><p><b>Worked example.</b> Router EDGE learns 10.0.0.0/8 from OSPF (10) and has a static for 10.0.0.0/8 with default preference (5). Static is active. To let OSPF be the main path and use the static only as a backup you set the static to <code>preference 200</code>. When OSPF goes away, the static becomes active; when OSPF returns, OSPF (10) wins again.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting a /16 with a better preference to beat a /24 with a worse preference. It does not. The router first picks the longest matching prefix, then preference.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Lowest preference wins" appears in every wording. Also: aggregate and generated routes have preference 130, which is <i>worse</i> than OSPF internal (10) and static (5) but <i>better</i> than OSPF external (150) and BGP (170). In the lab output above, OSPF external shows as OSPF/150.</p></div>

<div class="scn"><h4>The route that was there but not used</h4><p>A branch engineer complained that a new link was "never used". <code>show route</code> showed two static routes to HQ. The one through the new link was Static/20 without a star: it was a deliberate floating backup configured earlier by a colleague. Once the engineer understood the notation, he stopped trying to "fix" a working design and tested failover by disabling the primary link instead.</p><p><b>Lesson:</b> an inactive route in <code>show route</code> is usually a standby, not a fault.</p></div>
<div class="iv"><p class="q">"Two routes to the same prefix: how does Junos choose?"</p><p>First longest prefix wins across different masks. For the same prefix, the lowest route preference wins and becomes active (star). Only the active route is copied to the forwarding table. Give examples: static 5, OSPF 10, aggregate 130, BGP 170. Mention that preference differs from metric.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>inet.0 holds every route; the forwarding table holds the active ones only.</li>
<li>Longest prefix match comes first, then lowest preference.</li>
<li>Defaults: direct 0, static 5, OSPF internal 10, aggregate/generated 130, OSPF external 150, BGP 170.</li>
<li><code>*</code> marks the active route; an inactive route is a standby.</li>
<li>Change preference per route or with <code>static defaults</code>.</li>
</ul></div>
`,hi:`
<p><b>Do tables, do kaam.</b> Junos router IPv4 unicast ke liye do tables rakhta hai. <b>Routing table</b> (<code>inet.0</code>) Routing Engine par hota hai aur <i>har</i> source se seekhe <i>har</i> route ko rakhta hai, haarne wale routes bhi. <b>Forwarding table</b> Packet Forwarding Engine par hota hai aur har prefix ke liye sirf ek best next hop rakhta hai. Routing Engine faisla karta hai; PFE maanta hai. Troubleshoot karte waqt hamesha pehle poochho ki aap dono mein se kaunsa dekh rahe ho.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Routing table se forwarding table">
<rect x="20" y="30" width="200" height="130" rx="10" fill="#bae6fd"/><text x="120" y="55" text-anchor="middle" class="svg-ink" font-size="14">inet.0 (RE)</text>
<text x="40" y="82" class="svg-ink" font-size="12">172.30.0.0/16 Static/5  nh A</text><text x="40" y="104" class="svg-ink" font-size="12">172.30.0.0/16 Static/20 nh B</text><text x="40" y="126" class="svg-ink" font-size="12">10.0.0.0/8 OSPF/10 nh C</text>
<rect x="420" y="30" width="200" height="130" rx="10" fill="#bbf7d0"/><text x="520" y="55" text-anchor="middle" class="svg-ink" font-size="14">Forwarding table (PFE)</text>
<text x="440" y="82" class="svg-ink" font-size="12">172.30.0.0/16 via A</text><text x="440" y="104" class="svg-ink" font-size="12">10.0.0.0/8 via C</text>
<line x1="220" y1="95" x2="420" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="12">sirf active routes</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Static/20 inet.0 mein standby ke roop mein rehta hai</text>
</svg><p class="cap">Standby route routing table mein rehta hai lekin aage forward nahi hota.</p></div>

<h3>Router kaise chunta hai</h3>
<p>Ek packet ke liye do faisle is kram mein hote hain:</p>
<ol>
<li><b>Longest prefix match.</b> Jin prefixes mein destination aata hai unme sabse lamba mask jeetta hai. Dono mein aane wale address ke liye /24 hamesha /16 ko harata hai, <i>preference kuch bhi ho</i>.</li>
<li><b>Route preference.</b> Agar <i>ek hi</i> prefix ke liye kai routes hain to sabse kam preference <b>active</b> route chuni jaati hai. Preference barabar ho to aage ke tie-breakers (metric aur protocol rules) lagte hain.</li>
</ol>
<p>Beginners aksar inhe ulta kar dete hain. Preference sirf bilkul same prefix aur length ke routes ke beech chunti hai.</p>

<h3>Default preference values</h3>
<table class="cmp"><tr><th>Route source</th><th>Default preference</th><th>Kaise dikhta hai</th></tr>
<tr><td>Directly connected aur local</td><td>0</td><td>Direct, Local</td></tr>
<tr><td>Static</td><td>5</td><td>Static</td></tr>
<tr><td>OSPF internal</td><td>10</td><td>OSPF</td></tr>
<tr><td>Aggregate aur generated</td><td>130</td><td>Aggregate</td></tr>
<tr><td>OSPF external</td><td>150</td><td>OSPF</td></tr>
<tr><td>BGP</td><td>170</td><td>BGP</td></tr></table>
<p>Yeh Junos ke defaults hain. Doosre vendors alag "administrative distance" numbers use karte hain (jaise static 1, OSPF 110), isliye numbers ek vendor se doosre mein mat le jao. Directly connected networks hamesha jeette hain kyunki woh sabse bharosemand source hain.</p>

<h3>Route entry padhna</h3>
<p>Yeh real output branch lab se hai, primary static route theek karne ke baad. Dono routes 172.30.0.0/16 ke hain:</p>
<pre class="out">lab@BR1&gt; show route 172.30.0.0/16 exact
inet.0: 8 destinations, 9 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.30.0.0/16      <span class="hl">*[Static/5]</span> 00:00:00
                    &gt;  to 10.60.1.2 via ge-0/0/0.0
                    <span class="hl">[Static/20]</span> 00:00:40
                    &gt;  to 10.60.2.2 via ge-0/0/1.0</pre>
<p>Left se right padho:</p>
<ul>
<li>Header 8 destinations aur 9 routes kehta hai: ek destination ke do routes hain. "8 active" matlab aath use ho rahe hain.</li>
<li><code>*</code> active route ko mark karta hai. <code>[Static/5]</code> protocol aur uski preference hai. Time route ki age hai.</li>
<li><code>&gt;</code> selected next hop mark karta hai. <code>to 10.60.1.2 via ge-0/0/0.0</code> next-hop address aur outgoing logical interface hai.</li>
<li>Bina star ki doosri line <b>inactive</b> route hai. Yeh tayyar backup hai.</li>
</ul>
<p>Har protocol kitne routes deta hai dekhne ke liye <code>show route summary</code> use karo, aur next-hop type, state aur age ke liye <code>show route ... detail</code>.</p>
<pre class="out">lab@BR1&gt; show route summary
Autonomous system number: not configured
Router ID: 10.60.1.1
inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
              Direct:         3 routes,      3 active
              Local:          3 routes,      3 active
              Static:         2 routes,      2 active</pre>

<h3>Preference badalna</h3>
<p>Preference har route par ya ek source ke saare routes par badal sakte ho:</p>
<pre class="code">set routing-options static route 172.32.0.0/16 next-hop 10.60.1.2 preference 7
set routing-options static defaults preference 8      <span class="c">! jin static routes ki apni value nahi unke liye</span></pre>
<p>Protocol ki preference kam karne se uske routes zyada trusted ho jaate hain. Ek common design <b>floating static route</b> use karta hai: dynamic protocol se zyada preference (jaise 200) wala static jo tabhi active hota hai jab dynamic route chala jaaye. Yaad rakho static default preference 5 OSPF ke 10 ko harata hai, isliye same prefix ka static route OSPF ko override kar deta hai jab tak aap badlo nahi.</p>

<div class="eg"><p><b>Worked example.</b> Router EDGE 10.0.0.0/8 OSPF (10) se seekhta hai aur uska default preference (5) wala static bhi hai. Static active hai. OSPF ko main path rakhne aur static ko sirf backup banane ke liye static par <code>preference 200</code> lagao. OSPF jaane par static active hota hai; OSPF wapas aane par OSPF (10) phir jeetta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh umeed karna ki behtar preference wala /16 kharab preference wale /24 ko harayega. Nahi harata. Router pehle sabse lamba matching prefix chunta hai, phir preference.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Lowest preference wins" har wording mein aata hai. Yeh bhi: aggregate aur generated routes ki preference 130 hai, jo OSPF internal (10) aur static (5) se <i>kharab</i> hai lekin OSPF external (150) aur BGP (170) se <i>behtar</i>. Upar ke output mein OSPF external OSPF/150 dikhta hai.</p></div>

<div class="scn"><h4>Route jo thi par use nahi hui</h4><p>Ek branch engineer ne shikayat ki ki naya link "kabhi use nahi hota". <code>show route</code> ne HQ ke do static routes dikhaye. Naye link wala Static/20 tha bina star ke: yeh ek colleague ka pehle se configure kiya hua deliberate floating backup tha. Notation samajhne ke baad engineer ne chalte hue design ko "theek" karna chhod diya aur failover primary link disable karke test kiya.</p><p><b>Lesson:</b> <code>show route</code> mein inactive route aksar standby hota hai, fault nahi.</p></div>
<div class="iv"><p class="q">"Same prefix ke do routes: Junos kaise chunta hai?"</p><p>Pehle alag masks ke beech longest prefix jeetta hai. Same prefix ke liye sabse kam route preference jeetti hai aur active ban jaati hai (star). Sirf active route forwarding table mein copy hota hai. Examples do: static 5, OSPF 10, aggregate 130, BGP 170. Yeh batao ki preference metric se alag hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>inet.0 har route rakhta hai; forwarding table sirf active routes.</li>
<li>Pehle longest prefix match, phir sabse kam preference.</li>
<li>Defaults: direct 0, static 5, OSPF internal 10, aggregate/generated 130, OSPF external 150, BGP 170.</li>
<li><code>*</code> active route ko mark karta hai; inactive route standby hai.</li>
<li>Preference har route par ya <code>static defaults</code> se badlo.</li>
</ul></div>
`}};export{e as default};