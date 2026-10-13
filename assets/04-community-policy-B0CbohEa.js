var e={id:`community-policy`,h:{en:`Community-based policy: customer, upstream and peer`,hi:`Community-based policy: customer, upstream aur peer`},body:{en:`
<p>Real networks sit between three kinds of neighbour with different business rules. <b>Customers</b> pay you, so you carry their routes everywhere and prefer them. <b>Peers</b> exchange traffic with you for free, so you give them only your customer routes. <b>Upstreams</b> are providers you pay, so you send them your customers but never your peers' or other upstreams' routes. Mixing these up turns your network into free transit for someone else. Communities let you write each rule once.</p>

<h3>The tag-at-ingress, filter-at-egress model</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Community policy model">
<rect x="20" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="13">CE customer</text>
<rect x="20" y="85" width="110" height="46" rx="8" fill="#fde68a"/><text x="75" y="113" text-anchor="middle" class="svg-ink" font-size="13">UP upstream</text>
<rect x="20" y="150" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="75" y="178" text-anchor="middle" class="svg-ink" font-size="13">PEER</text>
<rect x="250" y="70" width="130" height="80" rx="10" fill="#bae6fd"/><text x="315" y="100" text-anchor="middle" class="svg-ink" font-size="13">Your AS 65200</text><text x="315" y="120" text-anchor="middle" class="svg-muted" font-size="12">R1 + R2</text>
<line x1="130" y1="43" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><text x="185" y="62" class="svg-accent" font-size="12">tag 65200:100</text>
<line x1="130" y1="108" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><text x="170" y="100" class="svg-accent" font-size="12">tag 65200:300</text>
<line x1="380" y1="125" x2="520" y2="173" stroke="#64748b" stroke-width="2"/>
<text x="470" y="205" text-anchor="middle" class="svg-muted" font-size="12">export to PEER: only routes tagged CUSTOMER</text>
<rect x="520" y="150" width="100" height="46" rx="8" fill="#ddd6fe"/><text x="570" y="178" text-anchor="middle" class="svg-ink" font-size="13">PEER</text>
</svg><p class="cap">Tag routes when they enter; filter on tags when they leave.</p></div>
<p>Typical tags: <code>65200:100</code> customer, <code>65200:200</code> peer, <code>65200:300</code> upstream. Customer routes also get a higher local preference so that you prefer revenue paths over free or paid transit.</p>

<h3>Build it in the lab</h3>
<p>Lab bgp-community-policy has CE (customer AS 64512), UP (upstream AS 64499), PEER (AS 64498) and your routers R1 and R2 in AS 65200.</p>
<pre class="code"><span class="c"># R1 ingress policies</span>
set policy-options community CUSTOMER members 65200:100
set policy-options policy-statement CUST-IN term 1 then community add CUSTOMER
set policy-options policy-statement CUST-IN term 1 then local-preference 200
set protocols bgp group CUST import CUST-IN
set policy-options community UPSTREAM members 65200:300
set policy-options policy-statement UP-IN term 1 then community add UPSTREAM
set protocols bgp group UPSTREAM import UP-IN

<span class="c"># R2 egress policy to the settlement-free peer</span>
set policy-options community CUSTOMER members 65200:100
set policy-options policy-statement PEER-OUT term CUST from community CUSTOMER
set policy-options policy-statement PEER-OUT term CUST then accept
set policy-options policy-statement PEER-OUT term REST then reject
set protocols bgp group PEERING export PEER-OUT</pre>
<p>The <code>REST then reject</code> term is deliberate. The default BGP export behaviour would advertise every active BGP route; once you attach your own export policy, the final term decides what happens to everything you did not match. State it explicitly.</p>
<pre class="out">lab@R2&gt; show route advertising-protocol bgp 100.70.3.1
inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)
  Prefix                  Nexthop              MED     Lclpref    AS path
<span class="hl">* 10.60.1.0/24            Self                                    [65200] 64512 I</span>
<span class="hl">* 10.60.2.0/24            Self                                    [65200] 64512 I</span></pre>
<p>PEER learns the customer prefixes 10.60.1.0/24 and 10.60.2.0/24 only. It does not learn the upstream's 203.0.113.0/24, because that route carries 65200:300, not CUSTOMER. Note also that 10.60.99.0/24 is <b>missing</b> although it carries the CUSTOMER tag: it also carries <code>no-export</code>, and no-export stops a route before it leaves the AS, whatever your export policy says.</p>

<h3>How a Junos policy is evaluated</h3>
<ul>
<li>Terms are tried top to bottom; the first term whose <code>from</code> matches runs its <code>then</code>. <code>accept</code> or <code>reject</code> ends the evaluation.</li>
<li>A term with only <code>then community add ...</code> does not end evaluation; the route continues to the next term or policy in the chain, so a chain <code>import [ TAG LP ]</code> works.</li>
<li>Policy can be applied at global, group or neighbour level. The <b>most specific level wins completely</b>; policies at different levels are not merged.</li>
<li>Test before and after: <code>test policy PEER-OUT 0/0</code> and <code>show route advertising-protocol bgp &lt;peer&gt;</code>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Three prefixes sit in R2: customer 10.60.1.0/24 (tag 65200:100), upstream 203.0.113.0/24 (tag 65200:300) and customer 10.60.99.0/24 (tags 65200:100 and no-export). PEER-OUT term CUST accepts the first and third, REST rejects the second. No-export then removes the third from the advertisement. Result: PEER receives exactly one of the three.</p></div>

<div class="warn"><p><b>Common mistake.</b> Matching communities with the wrong name, or applying <code>PEER-OUT</code> as <i>import</i> instead of export. A second mistake is leaving the policy without a final reject: if no term matches, Junos falls back to the default export action for the protocol, which may advertise more than you intended.</p></div>
<div class="exam"><p><b>Exam trap.</b> A policy attached to a neighbour overrides the group policy; it does not add to it. Also remember that a <code>from</code> clause with several conditions requires all of them.</p></div>

<div class="scn"><h4>Free transit for a competitor</h4><p>A regional ISP peered with another provider and, by default, advertised everything it learned. The peer started sending traffic for the Internet through the ISP's upstream, at the ISP's cost. After the team tagged customer routes and wrote an export policy that accepted only tagged routes, the monthly bill fell and the peer saw only customer prefixes.</p><p><b>Lesson:</b> every peering session should have an explicit export policy that says what you are willing to carry.</p></div>

<div class="iv"><p class="q">"How do you stop a peer from using you as transit?"</p><p>Tag every customer route at ingress with a community, then on the peering group export only routes carrying that community and reject the rest. Mention local preference to prefer customer routes, no-export for routes that must stay inside, and verifying with show route advertising-protocol bgp.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Customers get preferred and advertised everywhere; peers get customers only; upstreams get customers only.</li>
<li>Tag on import, filter on export; one community plan for the whole AS.</li>
<li>End export policies with an explicit reject term.</li>
<li>No-export beats an accepting export policy.</li>
<li>Check results with show route advertising-protocol bgp and show route community.</li>
</ul></div>
`,hi:`
<p>Real networks teen tarah ke neighbours ke beech baithe hote hain jinke business rules alag hain. <b>Customers</b> aapko paise dete hain, isliye unke routes aap har jagah le jaate ho aur prefer karte ho. <b>Peers</b> free mein traffic exchange karte hain, isliye unhe sirf apne customer routes dete ho. <b>Upstreams</b> woh providers hain jinhe aap paise dete ho, isliye unhe apne customers bhejte ho lekin peers ya doosre upstreams ke routes kabhi nahi. Inhe mix karne se aapka network kisi aur ke liye free transit ban jaata hai. Communities se har rule ek baar likhna padta hai.</p>

<h3>Ingress par tag, egress par filter</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Community policy model">
<rect x="20" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="13">CE customer</text>
<rect x="20" y="85" width="110" height="46" rx="8" fill="#fde68a"/><text x="75" y="113" text-anchor="middle" class="svg-ink" font-size="13">UP upstream</text>
<rect x="20" y="150" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="75" y="178" text-anchor="middle" class="svg-ink" font-size="13">PEER</text>
<rect x="250" y="70" width="130" height="80" rx="10" fill="#bae6fd"/><text x="315" y="100" text-anchor="middle" class="svg-ink" font-size="13">Aapka AS 65200</text><text x="315" y="120" text-anchor="middle" class="svg-muted" font-size="12">R1 + R2</text>
<line x1="130" y1="43" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><text x="185" y="62" class="svg-accent" font-size="12">tag 65200:100</text>
<line x1="130" y1="108" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><text x="170" y="100" class="svg-accent" font-size="12">tag 65200:300</text>
<line x1="380" y1="125" x2="520" y2="173" stroke="#64748b" stroke-width="2"/>
<text x="470" y="205" text-anchor="middle" class="svg-muted" font-size="12">PEER ko export: sirf CUSTOMER tag wale routes</text>
<rect x="520" y="150" width="100" height="46" rx="8" fill="#ddd6fe"/><text x="570" y="178" text-anchor="middle" class="svg-ink" font-size="13">PEER</text>
</svg><p class="cap">Routes andar aate waqt tag lagao; bahar jaate waqt tags par filter karo.</p></div>
<p>Typical tags: <code>65200:100</code> customer, <code>65200:200</code> peer, <code>65200:300</code> upstream. Customer routes ko higher local preference bhi milta hai taaki aap revenue paths ko free ya paid transit se prefer karo.</p>

<h3>Lab mein banao</h3>
<p>Lab bgp-community-policy mein CE (customer AS 64512), UP (upstream AS 64499), PEER (AS 64498) aur AS 65200 mein aapke routers R1 aur R2 hain.</p>
<pre class="code"><span class="c"># R1 ingress policies</span>
set policy-options community CUSTOMER members 65200:100
set policy-options policy-statement CUST-IN term 1 then community add CUSTOMER
set policy-options policy-statement CUST-IN term 1 then local-preference 200
set protocols bgp group CUST import CUST-IN
set policy-options community UPSTREAM members 65200:300
set policy-options policy-statement UP-IN term 1 then community add UPSTREAM
set protocols bgp group UPSTREAM import UP-IN

<span class="c"># R2 par settlement-free peer ke liye egress policy</span>
set policy-options community CUSTOMER members 65200:100
set policy-options policy-statement PEER-OUT term CUST from community CUSTOMER
set policy-options policy-statement PEER-OUT term CUST then accept
set policy-options policy-statement PEER-OUT term REST then reject
set protocols bgp group PEERING export PEER-OUT</pre>
<p><code>REST then reject</code> term jaanboojhkar hai. Default BGP export behaviour har active BGP route advertise karta; apni export policy lagane ke baad aakhri term tay karta hai ki jo match nahi hua uska kya hoga. Use explicitly likho.</p>
<pre class="out">lab@R2&gt; show route advertising-protocol bgp 100.70.3.1
inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)
  Prefix                  Nexthop              MED     Lclpref    AS path
<span class="hl">* 10.60.1.0/24            Self                                    [65200] 64512 I</span>
<span class="hl">* 10.60.2.0/24            Self                                    [65200] 64512 I</span></pre>
<p>PEER ko sirf customer prefixes 10.60.1.0/24 aur 10.60.2.0/24 milte hain. Upstream ka 203.0.113.0/24 nahi milta, kyunki us route par 65200:300 hai, CUSTOMER nahi. Yeh bhi dekho ki 10.60.99.0/24 <b>missing</b> hai jabki us par CUSTOMER tag hai: us par <code>no-export</code> bhi hai, aur no-export route ko AS se bahar jaane se pehle hi rok deta hai, chahe export policy kuch bhi kahe.</p>

<h3>Junos policy kaise evaluate hoti hai</h3>
<ul>
<li>Terms upar se neeche try hote hain; jis term ka <code>from</code> pehle match karta hai uska <code>then</code> chalta hai. <code>accept</code> ya <code>reject</code> evaluation khatam karta hai.</li>
<li>Sirf <code>then community add ...</code> wala term evaluation khatam nahi karta; route agle term ya policy mein jaata hai, isliye chain <code>import [ TAG LP ]</code> chalti hai.</li>
<li>Policy global, group ya neighbour level par lag sakti hai. <b>Sabse specific level poori tarah jeetta hai</b>; alag levels ki policies merge nahi hotin.</li>
<li>Pehle aur baad mein test karo: <code>test policy PEER-OUT 0/0</code> aur <code>show route advertising-protocol bgp &lt;peer&gt;</code>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R2 mein teen prefixes hain: customer 10.60.1.0/24 (tag 65200:100), upstream 203.0.113.0/24 (tag 65200:300) aur customer 10.60.99.0/24 (tags 65200:100 aur no-export). PEER-OUT ka term CUST pehle aur teesre ko accept karta hai, REST doosre ko reject. Phir no-export teesre ko advertisement se hata deta hai. Nateeja: PEER ko teen mein se bilkul ek milta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Communities ko galat naam se match karna, ya <code>PEER-OUT</code> ko export ki jagah <i>import</i> lagana. Doosri galti: policy ko aakhri reject ke bina chhodna: koi term match na ho to Junos protocol ka default export action lagata hai, jo aapke irade se zyada advertise kar sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Neighbour se lagi policy group policy ko override karti hai; usme add nahi hoti. Yeh bhi yaad rakho ki kai conditions wala <code>from</code> clause un sabhi ko maangta hai.</p></div>

<div class="scn"><h4>Competitor ke liye free transit</h4><p>Ek regional ISP ne doosre provider se peering ki aur default mein jo bhi seekha sab advertise kiya. Peer Internet ka traffic ISP ke upstream se bhejne laga, ISP ke kharche par. Team ne customer routes tag kiye aur sirf tagged routes accept karne wali export policy likhi, to mahine ka bill gira aur peer ko sirf customer prefixes dikhe.</p><p><b>Lesson:</b> har peering session par explicit export policy honi chahiye jo batae ki aap kya carry karne ko taiyaar ho.</p></div>

<div class="iv"><p class="q">"Peer ko apne network ko transit ki tarah use karne se kaise rokoge?"</p><p>Ingress par har customer route community se tag karo, phir peering group par sirf us community wale routes export karo aur baaki reject. Customer routes prefer karne ke liye local preference, andar rakhne wale routes ke liye no-export, aur show route advertising-protocol bgp se verify karna batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Customers prefer aur har jagah advertise hote hain; peers ko sirf customers; upstreams ko sirf customers.</li>
<li>Import par tag, export par filter; poore AS ke liye ek community plan.</li>
<li>Export policies ko explicit reject term se khatam karo.</li>
<li>No-export, accept karne wali export policy ko bhi haraa deta hai.</li>
<li>Nateeja show route advertising-protocol bgp aur show route community se check karo.</li>
</ul></div>
`}};export{e as default};