var e={id:`overlay-identity`,h:{en:`Overlay identity and verification (lab vs-tenant-site)`,hi:`Overlay identity aur verification (lab vs-tenant-site)`},body:{en:`
<p>The underlay is working: Branch1 pings the Controller. Now in lab <b>vs-tenant-site</b> you give Delhi its <b>overlay identity</b> under organization Acme and verify that the overlay session comes up. This chapter explains every statement, what the Controller checks, and exactly what good and bad output look like.</p>

<h3>Analogy: checking in at a hotel</h3>
<p>You have reached the hotel building (underlay). At reception you must say which booking you belong to (organization Acme), give your room number (site-id 101), name the reception desk you are talking to (Controller address) and state which door you used (WAN interface to transport mapping). If every detail matches the register, you get a key (the overlay tunnel and BGP session).</p>

<h3>The three configuration statements</h3>
<pre class="code"><span class="c">! Enter configure mode on Branch1</span>
admin@Branch1-cli&gt; configure
<span class="c">! 1. Site identity inside organization Acme</span>
admin@Branch1-cli% set orgs org Acme sd-wan site-id 101
<span class="c">! 2. Which Controller to register with (WAN-side address)</span>
admin@Branch1-cli% set orgs org Acme sd-wan controllers 198.51.100.20
<span class="c">! 3. Map the Internet port to the Internet transport</span>
admin@Branch1-cli% set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
admin@Branch1-cli% show | compare
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<dl class="terms">
<dt><code>orgs org Acme</code></dt><dd>Names the organization. Writing any statement under it also tells the branch it belongs to Acme.</dd>
<dt><code>sd-wan site-id 101</code></dt><dd>The unique numeric identity of the Delhi site.</dd>
<dt><code>sd-wan controllers 198.51.100.20</code></dt><dd>The Controller to peer with. Must be the Controller's own WAN-side address, reachable through the underlay.</dd>
<dt><code>sd-wan wan-interfaces vni-0/0 transport Internet</code></dt><dd>Declares that port vni-0/0 attaches to the Internet transport domain; the branch builds one tunnel per WAN interface mapped this way.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="What the Controller checks">
<rect x="20" y="95" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="120" text-anchor="middle" class="svg-ink" font-size="13">Branch1</text><text x="85" y="138" text-anchor="middle" class="svg-muted" font-size="11">Acme / 101</text>
<rect x="490" y="20" width="130" height="220" rx="8" fill="#ddd6fe"/><text x="555" y="42" text-anchor="middle" class="svg-ink" font-size="13">Controller checks</text>
<text x="555" y="72" text-anchor="middle" class="svg-ink" font-size="11">1. Address owns a Controller?</text>
<text x="555" y="100" text-anchor="middle" class="svg-ink" font-size="11">2. Same organization?</text>
<text x="555" y="128" text-anchor="middle" class="svg-ink" font-size="11">3. Transport domain known?</text>
<text x="555" y="156" text-anchor="middle" class="svg-ink" font-size="11">4. Has WAN iface for it?</text>
<text x="555" y="184" text-anchor="middle" class="svg-ink" font-size="11">5. Controller reachable?</text>
<text x="555" y="218" text-anchor="middle" class="svg-ink" font-size="11">Pass: tunnel up, BGP up</text>
<line x1="150" y1="125" x2="490" y2="125" stroke="#64748b"/><text x="320" y="117" text-anchor="middle" class="svg-muted" font-size="12">tunnel request over Internet</text>
</svg><p class="cap">Any failed check leaves the overlay Idle and gives a specific reason in the brief output.</p></div>

<h3>What the Controller (and the branch) checks</h3>
<ol>
<li>The configured address <b>belongs to a real Controller</b>. A typo that points to another host fails here.</li>
<li>The Controller knows the same <b>organization</b>; otherwise it refuses the branch.</li>
<li>A <b>site-id</b> exists on the branch and no other site uses it.</li>
<li>The branch interface is up, has an IP address and the circuit is not down.</li>
<li>The Controller has the <b>transport domain</b> (Internet, MPLS or LTE) and a WAN interface for it. LTE uses the Controller's Internet address.</li>
<li>The Controller address is reachable from the branch (underlay proof from the last chapter).</li>
</ol>
<p>When at least one tunnel is up and tenant, site-id and Controller are consistent, the <b>MP-BGP session is Established</b>. That is the course model of what the real product does with IKE, IPsec and BGP.</p>

<h3>Verification</h3>
<pre class="code">show orgs org Acme sd-wan brief
show bgp neighbor brief</pre>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    <span class="hl">up</span>      -

admin@Branch1-cli&gt; show bgp neighbor brief
Neighbor        AS      State
198.51.100.20   64512   <span class="hl">Established</span></pre>
<p>Read it top to bottom: identity (org, site-id, hostname), which Controller was matched, the overlay state, then one row per tunnel with a <b>Reason</b> column that explains any failure. A useful related command is <code>show orgs org Acme sd-wan wan-interfaces</code>, which lists each port, its transport, state, address and the circuit quality (latency / jitter / loss).</p>

<h3>Before and after</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief      <span class="c">! before the change</span>
Org: -   Site-ID: -   Hostname: Branch1
Controller: -   Overlay (MP-BGP): <span class="hl">Idle</span>  [site-id is not configured]
Transport  Interface  Tunnel  Reason</pre>
<p>The bracketed text is the model's reason. In the real product you would look at the device's SD-WAN status, BGP and IPsec views; the habit is the same: find the specific reason.</p>

<h3>The Controller's view</h3>
<p>You can also look from the Controller. On Controller-1:</p>
<pre class="out">admin@Controller-1-cli&gt; show orgs org Acme sd-wan sites
Site        Site-ID  Tunnels up        MP-BGP       LAN prefix
Branch1     101      Internet          Established  -</pre>
<p>The LAN prefix column stays empty until the LAN interface is configured, which comes in a later module. The Controller also lists its own <code>transport-domains</code> (Internet, MPLS, LTE) and uses the <code>wan-interfaces</code> configuration to know which of its own interfaces receives each transport.</p>

<div class="eg"><p><b>Worked example: reading the Reason column.</b> If you forget statement 3, the brief shows the overlay Idle with the text "no WAN interface is bound to a transport". If you spell the organization differently on the Controller side, the text says "Controller organization is Beta, branch uses Acme". If vni-0/0 is shut, the Internet row shows <code>down</code> with reason "interface down". Each message points to one fix.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing a Controller address that differs in the last octet, such as .2 instead of .20 (this is the exact fault in the next chapter's ticket). (2) Mapping the wrong port to a transport, for example vni-0/1 (MPLS port) to Internet. (3) Forgetting the organization name, which makes <code>orgs org Acme ...</code> commands unavailable. (4) Declaring victory after commit without looking at the brief output.</p></div>
<div class="exam"><p><b>Exam trap.</b> The Controller address in the branch configuration is not the Director address and not a LAN address. Also, a tunnel can be up for Internet while MPLS is down; the BGP session depends on <b>at least one</b> tunnel being up.</p></div>

<div class="note"><p><b>Real product versus lab.</b> In production the same identity is usually delivered through Director templates and bind data, and the branch authenticates to the Controller with certificates or keys established during onboarding. The statement names above follow the public documentation style; the engine behind them in this course is a simplified model.</p></div>

<div class="scn"><h4>Everything green except the one row</h4><p>The Delhi branch had Internet, MPLS and LTE tunnels configured. After a maintenance window, the brief showed Internet up and MPLS down with reason "transport domain MPLS is missing on the Controller", while the BGP session was Established over the Internet tunnel. Users noticed nothing, but resilience was lost. The Controller's MPLS domain had been deleted by mistake. Re-adding it restored all three tunnels.</p><p><b>Lesson:</b> Established BGP does not mean every transport is healthy. Always read the per-tunnel rows.</p></div>

<div class="iv"><p class="q">"A branch has a working Internet link but the SD-WAN overlay is Idle. What do you check?"</p><p>Strong answer: confirm underlay ping to the Controller first. Then read the overlay summary for the reason and check organization, site-id, Controller address, and the WAN interface to transport mapping. On the Controller confirm the same organization and the transport domain. After the fix, verify tunnel and BGP state, not just commit success.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Overlay identity = organization Acme + site-id 101 + Controller 198.51.100.20 + WAN interface mapping.</li>
<li>The Controller checks address ownership, organization, transport domain, WAN interface and reachability.</li>
<li>Verify with show orgs org Acme sd-wan brief and show bgp neighbor brief.</li>
<li>The Reason column explains every down tunnel.</li>
<li>BGP Established needs at least one tunnel up, not all of them.</li>
</ul></div>
`,hi:`
<p>Underlay chal raha hai: Branch1 Controller ko ping karti hai. Ab lab <b>vs-tenant-site</b> mein aap Delhi ko organization Acme ke under uski <b>overlay identity</b> doge aur verify karoge ki overlay session up aata hai. Yeh chapter har statement samjhata hai, Controller kya check karta hai, aur achha aur bura output bilkul kaisa dikhta hai.</p>

<h3>Analogy: hotel mein check-in</h3>
<p>Aap hotel building tak pahunch gaye (underlay). Reception par aapko batana hota hai ki kis booking ke ho (organization Acme), room number do (site-id 101), batao kis reception desk se baat kar rahe ho (Controller address) aur kaunsa darwaza use kiya (WAN interface to transport mapping). Agar har detail register se match kare to aapko key milti hai (overlay tunnel aur BGP session).</p>

<h3>Teen configuration statements</h3>
<pre class="code"><span class="c">! Branch1 par configure mode mein jao</span>
admin@Branch1-cli&gt; configure
<span class="c">! 1. Organization Acme ke andar site identity</span>
admin@Branch1-cli% set orgs org Acme sd-wan site-id 101
<span class="c">! 2. Kis Controller ke saath register karna hai (WAN-side address)</span>
admin@Branch1-cli% set orgs org Acme sd-wan controllers 198.51.100.20
<span class="c">! 3. Internet port ko Internet transport se map karo</span>
admin@Branch1-cli% set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
admin@Branch1-cli% show | compare
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<dl class="terms">
<dt><code>orgs org Acme</code></dt><dd>Organization ka naam. Iske neeche koi bhi statement likhne se branch ko pata chalta hai ki woh Acme ki hai.</dd>
<dt><code>sd-wan site-id 101</code></dt><dd>Delhi site ki unique numeric identity.</dd>
<dt><code>sd-wan controllers 198.51.100.20</code></dt><dd>Jis Controller ke saath peer karna hai. Controller ka apna WAN-side address hona chahiye, underlay se reachable.</dd>
<dt><code>sd-wan wan-interfaces vni-0/0 transport Internet</code></dt><dd>Batata hai ki port vni-0/0 Internet transport domain se juda hai; branch is tarah map hue har WAN interface par ek tunnel banati hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Controller kya check karta hai">
<rect x="20" y="95" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="120" text-anchor="middle" class="svg-ink" font-size="13">Branch1</text><text x="85" y="138" text-anchor="middle" class="svg-muted" font-size="11">Acme / 101</text>
<rect x="490" y="20" width="130" height="220" rx="8" fill="#ddd6fe"/><text x="555" y="42" text-anchor="middle" class="svg-ink" font-size="13">Controller checks</text>
<text x="555" y="72" text-anchor="middle" class="svg-ink" font-size="11">1. Address Controller ka?</text>
<text x="555" y="100" text-anchor="middle" class="svg-ink" font-size="11">2. Same organization?</text>
<text x="555" y="128" text-anchor="middle" class="svg-ink" font-size="11">3. Transport domain pata?</text>
<text x="555" y="156" text-anchor="middle" class="svg-ink" font-size="11">4. WAN iface hai?</text>
<text x="555" y="184" text-anchor="middle" class="svg-ink" font-size="11">5. Controller reachable?</text>
<text x="555" y="218" text-anchor="middle" class="svg-ink" font-size="11">Pass: tunnel up, BGP up</text>
<line x1="150" y1="125" x2="490" y2="125" stroke="#64748b"/><text x="320" y="117" text-anchor="middle" class="svg-muted" font-size="12">tunnel request Internet par</text>
</svg><p class="cap">Koi bhi check fail ho to overlay Idle rehta hai aur brief output mein specific reason milta hai.</p></div>

<h3>Controller (aur branch) kya check karte hain</h3>
<ol>
<li>Configured address <b>asli Controller ka hai</b>. Kisi aur host ki taraf point karne wala typo yahin fail hota hai.</li>
<li>Controller wahi <b>organization</b> jaanta hai; warna woh branch ko refuse karta hai.</li>
<li>Branch par <b>site-id</b> hai aur koi aur site wahi site-id use nahi kar rahi.</li>
<li>Branch interface up hai, uska IP address hai aur circuit down nahi hai.</li>
<li>Controller ke paas <b>transport domain</b> (Internet, MPLS ya LTE) aur uske liye WAN interface hai. LTE Controller ka Internet address use karta hai.</li>
<li>Controller address branch se reachable hai (pichle chapter ka underlay proof).</li>
</ol>
<p>Jab kam se kam ek tunnel up ho aur tenant, site-id aur Controller consistent hon, <b>MP-BGP session Established</b> ho jaata hai. Real product IKE, IPsec aur BGP se jo karta hai uska yeh course model hai.</p>

<h3>Verification</h3>
<pre class="code">show orgs org Acme sd-wan brief
show bgp neighbor brief</pre>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    <span class="hl">up</span>      -

admin@Branch1-cli&gt; show bgp neighbor brief
Neighbor        AS      State
198.51.100.20   64512   <span class="hl">Established</span></pre>
<p>Upar se neeche padho: identity (org, site-id, hostname), kaunsa Controller match hua, overlay state, phir har tunnel ki ek row jismein <b>Reason</b> column kisi bhi failure ko explain karta hai. Ek aur useful command <code>show orgs org Acme sd-wan wan-interfaces</code> hai, jo har port, uska transport, state, address aur circuit quality (latency / jitter / loss) list karta hai.</p>

<h3>Pehle aur baad</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief      <span class="c">! change se pehle</span>
Org: -   Site-ID: -   Hostname: Branch1
Controller: -   Overlay (MP-BGP): <span class="hl">Idle</span>  [site-id is not configured]
Transport  Interface  Tunnel  Reason</pre>
<p>Bracket wala text model ka reason hai. Real product mein aap device ke SD-WAN status, BGP aur IPsec views dekhoge; aadat wahi hai: specific reason dhundho.</p>

<h3>Controller ka view</h3>
<p>Aap Controller se bhi dekh sakte ho. Controller-1 par:</p>
<pre class="out">admin@Controller-1-cli&gt; show orgs org Acme sd-wan sites
Site        Site-ID  Tunnels up        MP-BGP       LAN prefix
Branch1     101      Internet          Established  -</pre>
<p>LAN prefix column tab tak khaali rehta hai jab tak LAN interface configure nahi hota, jo aage ke module mein aata hai. Controller apne <code>transport-domains</code> (Internet, MPLS, LTE) bhi list karta hai aur <code>wan-interfaces</code> configuration se jaanta hai ki uska kaunsa interface har transport receive karta hai.</p>

<div class="eg"><p><b>Worked example: Reason column padhna.</b> Agar aap statement 3 bhool jao, to brief overlay Idle dikhata hai text "no WAN interface is bound to a transport" ke saath. Agar Controller side par organization alag spell ho, to text kehta hai "Controller organization is Beta, branch uses Acme". Agar vni-0/0 shut ho, to Internet row <code>down</code> dikhati hai reason "interface down" ke saath. Har message ek fix ki taraf point karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Aisa Controller address type karna jo last octet mein alag ho, jaise .20 ki jagah .2 (agle chapter ke ticket ka exact fault yahi hai). (2) Galat port ko transport se map karna, jaise vni-0/1 (MPLS port) ko Internet se. (3) Organization name bhool jaana, jisse <code>orgs org Acme ...</code> commands unavailable ho jaate hain. (4) Commit ke baad brief output dekhe bina jeet declare kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Branch configuration mein Controller address Director address nahi hai aur LAN address bhi nahi. Saath hi, Internet ke liye tunnel up ho sakta hai jabki MPLS down hai; BGP session <b>kam se kam ek</b> tunnel up hone par depend karta hai.</p></div>

<div class="note"><p><b>Real product versus lab.</b> Production mein wahi identity aam taur par Director templates aur bind data se deliver hoti hai, aur branch Controller ko certificates ya onboarding ke dauraan bani keys se authenticate karti hai. Upar ke statement names public documentation style follow karte hain; unke peeche ka engine is course mein simplified model hai.</p></div>

<div class="scn"><h4>Sab green sirf ek row ko chhodkar</h4><p>Delhi branch par Internet, MPLS aur LTE tunnels configured the. Maintenance window ke baad brief ne Internet up aur MPLS down dikhaya reason "transport domain MPLS is missing on the Controller" ke saath, jabki BGP session Internet tunnel par Established tha. Users ko kuch pata nahi chala, lekin resilience chali gayi thi. Controller ka MPLS domain galti se delete ho gaya tha. Use wapas add karne se teeno tunnels restore ho gaye.</p><p><b>Seekh:</b> Established BGP ka matlab har transport healthy nahi hai. Hamesha per-tunnel rows padho.</p></div>

<div class="iv"><p class="q">"Branch ka Internet link chal raha hai lekin SD-WAN overlay Idle hai. Kya check karoge?"</p><p>Strong answer: pehle Controller tak underlay ping confirm karo. Phir overlay summary mein reason padho aur organization, site-id, Controller address aur WAN interface to transport mapping check karo. Controller par wahi organization aur transport domain confirm karo. Fix ke baad sirf commit success nahi, tunnel aur BGP state verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Overlay identity = organization Acme + site-id 101 + Controller 198.51.100.20 + WAN interface mapping.</li>
<li>Controller address ownership, organization, transport domain, WAN interface aur reachability check karta hai.</li>
<li>show orgs org Acme sd-wan brief aur show bgp neighbor brief se verify karo.</li>
<li>Reason column har down tunnel ko explain karta hai.</li>
<li>BGP Established ko kam se kam ek tunnel up chahiye, sab nahi.</li>
</ul></div>
`}};export{e as default};