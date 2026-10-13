var e={id:`transport-domains`,h:{en:`Transport domains and WAN interface mapping on the Controller`,hi:`Transport domains aur Controller par WAN interface mapping`},body:{en:`
<p>Think of a railway network with <b>separate track systems</b>: broad gauge, metro, and a private freight line. A train from one system cannot run on another. A station that connects to several systems needs a platform for each. A <b>transport domain</b> is the name of one track system; the Controller is the station that must have a platform in every system the branches use.</p>

<h3>The concept</h3>
<p>A <b>WAN circuit</b> is a link to a provider. Circuits that can reach each other (for example, all ordinary Internet circuits) form one <b>transport domain</b>, usually named by type: <code>Internet</code>, <code>MPLS</code>, <code>LTE</code>. In real Versa the same idea is called a <b>WAN network</b> or transport domain, and it is used in the SD-WAN configuration of branch WAN interfaces and in the Controller. Tunnels are formed only between locators in the <b>same</b> domain. Traffic engineering policy later chooses among these tunnels (module versa-policy).</p>

<h3>Two things must exist on the Controller</h3>
<ol>
<li><b>A WAN interface bound to the transport:</b> <code>set orgs org Acme sd-wan wan-interfaces vni-0/N transport &lt;T&gt;</code>. This is the address the branch tunnels to.</li>
<li><b>The transport domain itself:</b> <code>set orgs org Acme sd-wan transport-domains &lt;T&gt;</code>. This tells the Controller to accept and distribute this transport for the organization.</li>
</ol>
<p>The branch has the matching piece: <code>set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS</code>.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Transport domain mapping">
<rect x="20" y="40" width="190" height="200" rx="10" fill="#bae6fd"/><text x="115" y="62" text-anchor="middle" class="svg-accent" font-size="13">Branch1 (Delhi)</text>
<rect x="35" y="80" width="160" height="34" rx="6" fill="#fff"/><text x="115" y="102" text-anchor="middle" class="svg-ink" font-size="12">vni-0/0  Internet</text>
<rect x="35" y="130" width="160" height="34" rx="6" fill="#fff"/><text x="115" y="152" text-anchor="middle" class="svg-ink" font-size="12">vni-0/1  MPLS</text>
<rect x="35" y="180" width="160" height="34" rx="6" fill="#fff"/><text x="115" y="202" text-anchor="middle" class="svg-ink" font-size="12">vni-0/2  LTE</text>
<rect x="430" y="40" width="190" height="200" rx="10" fill="#bbf7d0"/><text x="525" y="62" text-anchor="middle" class="svg-accent" font-size="13">Controller-1</text>
<rect x="445" y="80" width="160" height="34" rx="6" fill="#fff"/><text x="525" y="102" text-anchor="middle" class="svg-ink" font-size="12">vni-0/0  Internet .20</text>
<rect x="445" y="130" width="160" height="34" rx="6" fill="#fff"/><text x="525" y="152" text-anchor="middle" class="svg-ink" font-size="12">vni-0/1  MPLS 172.31.100.2</text>
<rect x="445" y="180" width="160" height="34" rx="6" fill="#e2e8f0"/><text x="525" y="202" text-anchor="middle" class="svg-muted" font-size="12">LTE uses Internet side</text>
<line x1="195" y1="97" x2="445" y2="97" stroke="#15803d" stroke-width="3"/><line x1="195" y1="147" x2="445" y2="147" stroke="#15803d" stroke-width="3"/><line x1="195" y1="197" x2="445" y2="100" stroke="#15803d" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="270" text-anchor="middle" class="svg-ink" font-size="12">transport-domains on the Controller: Internet, MPLS, LTE</text>
</svg><p class="cap">Each branch transport must have a partner on the Controller and a transport-domain entry.</p></div>

<h3>Tunnel decision, in the order the model checks it</h3>
<p>For each branch WAN interface the lab (and, in spirit, real Versa) needs all of these:</p>
<ol>
<li>Interface exists and is up (<code>interface down</code>).</li>
<li>Interface has an IP address (<code>no IP address on the WAN interface</code>).</li>
<li>Circuit is not down (<code>circuit down (provider fault)</code>).</li>
<li>Controller has a WAN interface for that transport; LTE uses the Internet one (<code>Controller has no MPLS WAN interface</code>).</li>
<li>Controller has the transport domain (<code>transport domain MPLS is missing on the Controller</code>).</li>
<li>Controller interface is up and the address is reachable (<code>Controller MPLS address 172.31.100.2 is unreachable</code>).</li>
</ol>

<pre class="code"><span class="c">! Controller-1: complete mapping</span>
configure
set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
set orgs org Acme sd-wan transport-domains Internet
set orgs org Acme sd-wan transport-domains MPLS
set orgs org Acme sd-wan transport-domains LTE
commit</pre>
<pre class="out">admin@Controller-1-cli&gt; show orgs org Acme sd-wan transport-domains
Transport domain
Internet
<span class="hl">MPLS</span>
LTE</pre>

<div class="eg"><p><b>Worked example.</b> Add a fourth transport, a private 5G service, to Delhi. On the branch: bind <code>vni-0/4</code> to a transport named <code>5G</code> with address and VR. On the Controller: add a WAN interface in that provider cloud (or decide that it exits through the Internet), then <code>set ... transport-domains 5G</code>. Skipping the Controller side gives <code>transport domain 5G is missing on the Controller</code> even though the branch is perfect.</p></div>

<h3>Ownership rule</h3>
<table class="cmp"><tr><th>Symptom</th><th>Owner</th></tr>
<tr><td>interface down, no IP address</td><td>Branch (or Director bind data)</td></tr>
<tr><td>circuit down (provider fault)</td><td>Provider, raise a ticket</td></tr>
<tr><td>Controller has no WAN interface / transport domain missing</td><td>Controller</td></tr>
<tr><td>Controller address unreachable</td><td>Underlay path (routing, provider, firewall)</td></tr></table>

<div class="note"><p><b>Course model.</b> In real Versa you also configure WAN link characteristics (bandwidth, link type, cost), traffic-engineering and route attributes in the SD-WAN branch settings; the lab uses the transport name only. The idea that a domain must be known on both ends is the same.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using different spelling or case on the two sides (MPLS versus Mpls). Domain names must match exactly or the tunnel is not formed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Overlay Established with one tunnel up is a healthy-looking partial failure. The exam may show that the overlay is Established but ask which transport is missing.</p></div>

<div class="scn"><h4>The LTE backup that never came up</h4><p>For months nobody noticed that the LTE backup at 12 stores was never usable. A drill removed the Internet circuit at one store and the site dropped. The LTE tunnel reason was "transport domain LTE is missing on the Controller". The Controller was updated in one commit and all 12 stores had an active backup.</p><p><b>Lesson:</b> test backup paths regularly; read tunnel tables, not just the overlay state.</p></div>

<div class="iv"><p class="q">"What is a transport domain in Versa?"</p><p>It is the logical grouping of WAN circuits that can reach each other, such as Internet or MPLS. Tunnels are built only between interfaces of the same domain. The Controller must know every domain and have a matching interface or reachable address. Branch config alone cannot create it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Transport domain = label for circuits that can reach each other.</li>
<li>Controller needs both a WAN interface per transport and a transport-domain entry.</li>
<li>LTE reaches the Internet address in the lab.</li>
<li>Per-transport tunnel reasons identify the owner of the fault.</li>
<li>Overlay Established does not mean all tunnels are up.</li>
</ul></div>
`,hi:`
<p>Ek railway network socho jisme <b>alag track systems</b> hain: broad gauge, metro aur private freight line. Ek system ki train doosre par nahi chal sakti. Jo station kai systems se judta hai use har system ke liye platform chahiye. <b>Transport domain</b> ek track system ka naam hai; Controller woh station hai jiska har us system mein platform hona chahiye jo branches use karti hain.</p>

<h3>Concept</h3>
<p><b>WAN circuit</b> provider tak link hai. Jo circuits ek doosre tak pahunch sakte hain (jaise saare normal Internet circuits) ek <b>transport domain</b> banate hain, aam taur par type ke naam se: <code>Internet</code>, <code>MPLS</code>, <code>LTE</code>. Real Versa mein isi idea ko <b>WAN network</b> ya transport domain kehte hain, aur yeh branch WAN interfaces ke SD-WAN configuration mein aur Controller mein use hota hai. Tunnels sirf <b>same</b> domain ke locators ke beech bante hain. Traffic engineering policy baad mein in tunnels mein se chunti hai (module versa-policy).</p>

<h3>Controller par do cheezein honi chahiye</h3>
<ol>
<li><b>Transport se bound WAN interface:</b> <code>set orgs org Acme sd-wan wan-interfaces vni-0/N transport &lt;T&gt;</code>. Yeh woh address hai jis tak branch tunnel banata hai.</li>
<li><b>Transport domain khud:</b> <code>set orgs org Acme sd-wan transport-domains &lt;T&gt;</code>. Yeh Controller ko batata hai ki organization ke liye is transport ko accept aur distribute kare.</li>
</ol>
<p>Branch par matching hissa: <code>set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS</code>.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Transport domain mapping">
<rect x="20" y="40" width="190" height="200" rx="10" fill="#bae6fd"/><text x="115" y="62" text-anchor="middle" class="svg-accent" font-size="13">Branch1 (Delhi)</text>
<rect x="35" y="80" width="160" height="34" rx="6" fill="#fff"/><text x="115" y="102" text-anchor="middle" class="svg-ink" font-size="12">vni-0/0  Internet</text>
<rect x="35" y="130" width="160" height="34" rx="6" fill="#fff"/><text x="115" y="152" text-anchor="middle" class="svg-ink" font-size="12">vni-0/1  MPLS</text>
<rect x="35" y="180" width="160" height="34" rx="6" fill="#fff"/><text x="115" y="202" text-anchor="middle" class="svg-ink" font-size="12">vni-0/2  LTE</text>
<rect x="430" y="40" width="190" height="200" rx="10" fill="#bbf7d0"/><text x="525" y="62" text-anchor="middle" class="svg-accent" font-size="13">Controller-1</text>
<rect x="445" y="80" width="160" height="34" rx="6" fill="#fff"/><text x="525" y="102" text-anchor="middle" class="svg-ink" font-size="12">vni-0/0  Internet .20</text>
<rect x="445" y="130" width="160" height="34" rx="6" fill="#fff"/><text x="525" y="152" text-anchor="middle" class="svg-ink" font-size="12">vni-0/1  MPLS 172.31.100.2</text>
<rect x="445" y="180" width="160" height="34" rx="6" fill="#e2e8f0"/><text x="525" y="202" text-anchor="middle" class="svg-muted" font-size="12">LTE Internet side use karta hai</text>
<line x1="195" y1="97" x2="445" y2="97" stroke="#15803d" stroke-width="3"/><line x1="195" y1="147" x2="445" y2="147" stroke="#15803d" stroke-width="3"/><line x1="195" y1="197" x2="445" y2="100" stroke="#15803d" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="270" text-anchor="middle" class="svg-ink" font-size="12">Controller par transport-domains: Internet, MPLS, LTE</text>
</svg><p class="cap">Har branch transport ka Controller par partner aur transport-domain entry hona chahiye.</p></div>

<h3>Tunnel decision, us order mein jis mein model check karta hai</h3>
<p>Har branch WAN interface ke liye lab (aur real Versa bhi bhaav mein) ko yeh sab chahiye:</p>
<ol>
<li>Interface maujood aur up hai (<code>interface down</code>).</li>
<li>Interface par IP address hai (<code>no IP address on the WAN interface</code>).</li>
<li>Circuit down nahi hai (<code>circuit down (provider fault)</code>).</li>
<li>Controller ke paas us transport ka WAN interface hai; LTE Internet wala use karta hai (<code>Controller has no MPLS WAN interface</code>).</li>
<li>Controller ke paas transport domain hai (<code>transport domain MPLS is missing on the Controller</code>).</li>
<li>Controller interface up hai aur address reachable hai (<code>Controller MPLS address 172.31.100.2 is unreachable</code>).</li>
</ol>

<pre class="code"><span class="c">! Controller-1: poori mapping</span>
configure
set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
set orgs org Acme sd-wan transport-domains Internet
set orgs org Acme sd-wan transport-domains MPLS
set orgs org Acme sd-wan transport-domains LTE
commit</pre>
<pre class="out">admin@Controller-1-cli&gt; show orgs org Acme sd-wan transport-domains
Transport domain
Internet
<span class="hl">MPLS</span>
LTE</pre>

<div class="eg"><p><b>Worked example.</b> Delhi mein chautha transport add karo, private 5G service. Branch par: <code>vni-0/4</code> ko <code>5G</code> naam ke transport se bind karo, address aur VR ke saath. Controller par: us provider cloud mein WAN interface add karo (ya tay karo ki woh Internet se exit karta hai), phir <code>set ... transport-domains 5G</code>. Controller side skip karne par <code>transport domain 5G is missing on the Controller</code> aata hai chahe branch bilkul theek ho.</p></div>

<h3>Ownership rule</h3>
<table class="cmp"><tr><th>Symptom</th><th>Owner</th></tr>
<tr><td>interface down, no IP address</td><td>Branch (ya Director bind data)</td></tr>
<tr><td>circuit down (provider fault)</td><td>Provider, ticket raise karo</td></tr>
<tr><td>Controller has no WAN interface / transport domain missing</td><td>Controller</td></tr>
<tr><td>Controller address unreachable</td><td>Underlay path (routing, provider, firewall)</td></tr></table>

<div class="note"><p><b>Course model.</b> Real Versa mein SD-WAN branch settings mein WAN link characteristics (bandwidth, link type, cost), traffic-engineering aur route attributes bhi configure hote hain; lab sirf transport name use karta hai. Idea ki domain dono ends par pata honi chahiye, wahi hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Dono sides par alag spelling ya case use karna (MPLS versus Mpls). Domain names exactly match hone chahiye warna tunnel nahi banta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ek tunnel up ke saath overlay Established ek healthy dikhne wali partial failure hai. Exam overlay Established dikhake pooch sakta hai ki kaunsa transport missing hai.</p></div>

<div class="scn"><h4>LTE backup jo kabhi up nahi aaya</h4><p>Mahino tak kisi ko pata nahi chala ki 12 stores ka LTE backup kabhi usable nahi tha. Ek drill mein ek store ka Internet circuit hataya gaya aur site gir gayi. LTE tunnel ka reason tha "transport domain LTE is missing on the Controller". Controller ek commit mein update hua aur saare 12 stores ka backup active ho gaya.</p><p><b>Lesson:</b> backup paths ko regularly test karo; sirf overlay state nahi, tunnel tables padho.</p></div>

<div class="iv"><p class="q">"Versa mein transport domain kya hota hai?"</p><p>Yeh un WAN circuits ka logical grouping hai jo ek doosre tak pahunch sakte hain, jaise Internet ya MPLS. Tunnels sirf same domain ke interfaces ke beech bante hain. Controller ko har domain pata honi chahiye aur matching interface ya reachable address hona chahiye. Sirf branch config se yeh nahi ban sakta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Transport domain = un circuits ka label jo ek doosre tak pahunch sakte hain.</li>
<li>Controller ko har transport ke liye WAN interface aur transport-domain entry dono chahiye.</li>
<li>Lab mein LTE Internet address tak pahunchta hai.</li>
<li>Per-transport tunnel reasons fault ka owner batate hain.</li>
<li>Overlay Established ka matlab saare tunnels up nahi.</li>
</ul></div>
`}};export{e as default};