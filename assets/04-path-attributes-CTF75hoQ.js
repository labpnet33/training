var e={id:`bgp-path-attributes`,h:{en:`Path attributes: the labels on every BGP route`,hi:`Path attributes: har BGP route par lage labels`},body:{en:`
<p>A courier parcel has labels: sender, route list, priority, special handling. A BGP route is the same. The prefix is the address, and the <b>path attributes</b> are the labels that tell every router how the route should be treated. Almost every BGP decision, from best path to filtering, reads these labels. If you can read them in the output, you can explain any BGP behaviour.</p>

<h3>The six attributes you must know</h3>
<table class="cmp"><tr><th>Attribute</th><th>Category</th><th>What it does</th></tr>
<tr><td>AS path</td><td>Well-known mandatory</td><td>ASes the route crossed, newest first. A router rejects a route that already contains its own AS</td></tr>
<tr><td>Next hop</td><td>Well-known mandatory</td><td>Where to send traffic. EBGP sets it to self, IBGP keeps it</td></tr>
<tr><td>Origin</td><td>Well-known mandatory</td><td>I (IGP), E (EGP) or ? (incomplete). Lower is better: I, then E, then ?</td></tr>
<tr><td>Local preference</td><td>Well-known discretionary</td><td>Inside one AS only. Higher wins. Default 100</td></tr>
<tr><td>MED</td><td>Optional non-transitive</td><td>A hint to a neighbour AS about which entry to use. Lower wins</td></tr>
<tr><td>Community</td><td>Optional transitive</td><td>A tag such as 65010:100 that policies match on</td></tr></table>
<p>The categories mean: <b>well-known</b> attributes must be understood by every BGP router; <b>mandatory</b> ones must be present in every UPDATE; <b>transitive</b> optional ones are passed on even if a router does not understand them; <b>non-transitive</b> ones are not passed on beyond the neighbouring AS.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Attributes of a BGP route">
<rect x="20" y="20" width="600" height="150" rx="10" fill="#f1f5f9" stroke="#64748b"/>
<text x="40" y="48" class="svg-ink" font-size="14">203.0.113.0/24</text>
<text x="40" y="76" class="svg-muted" font-size="12">AS path: 64500 I          where it came from</text>
<text x="40" y="98" class="svg-muted" font-size="12">Next hop: 100.65.1.1      where to send traffic</text>
<text x="40" y="120" class="svg-muted" font-size="12">Local preference: 100     our AS preference, higher wins</text>
<text x="40" y="142" class="svg-muted" font-size="12">MED, Community           optional hints and tags</text>
<text x="440" y="48" class="svg-accent" font-size="12">One prefix, many labels</text>
</svg><p class="cap">The prefix is the address; the attributes drive every decision.</p></div>

<h3>Reading attributes in the output</h3>
<p>The detailed route view shows them all. This is R2 in the first lab, looking at the ISP prefix it learned over IBGP from R1:</p>
<pre class="out">lab@NGP-R2&gt; show route 203.0.113.0/24 detail
203.0.113.0/24 (1 entry, 1 announced)
        *BGP    Preference: 170/-101
                Next hop type: Indirect
                Source: 10.20.255.1
                Next hop: 10.20.12.1 via ge-0/0/1.0, selected
                Protocol next hop: 100.65.1.1
                State: &lt;Active Int Ext&gt;
                Local AS: 65010 Peer AS: 65010
                Age: 0:25 	Metric2: 2
                AS path: 64500 I
                Localpref: 100
                Router ID: 10.20.255.1</pre>
<ul>
<li><b>Preference 170/-101</b>: 170 is the route preference. The second number is derived from the local preference (here 100 and the value is -(100+1)); a higher local preference gives a smaller (more negative) number, which then wins the comparison.</li>
<li><b>Protocol next hop: 100.65.1.1</b>: the BGP next hop is the ISP address, unchanged by IBGP. <b>Next hop: 10.20.12.1</b> is the forwarding next hop found by resolving it in the routing table, here through OSPF. <b>Metric2: 2</b> is the IGP metric to the protocol next hop.</li>
<li><b>Source</b> and <b>Router ID</b>: the IBGP peer that sent it.</li>
<li><b>AS path 64500 I</b>: the route crossed AS 64500, origin I. Inside our AS nothing was added.</li>
<li><b>Localpref 100</b>: the default.</li>
</ul>
<p>The receive view is a compact table with the most common attributes. At R1, the ISP routes show an empty local preference (EBGP does not carry it), and from the IBGP peer a local preference of 100:</p>
<pre class="out">lab@NGP-R1&gt; show route receive-protocol bgp 100.65.1.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 198.51.100.0/24         100.65.1.1                              64500 I
* 203.0.113.0/24          100.65.1.1                              64500 I
lab@NGP-R1&gt; show route receive-protocol bgp 10.20.255.2
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.20.2.0/24            10.20.255.2                  100        I</pre>

<h3>What each attribute is used for</h3>
<ul>
<li><b>AS path length</b>: shorter wins. Operators lengthen it deliberately with <b>prepending</b> to make a path less attractive.</li>
<li><b>Local preference</b>: your choice of exit. It never leaves your AS.</li>
<li><b>MED</b>: compared only between paths from the same neighbouring AS (by default). Lower is better. It crosses one AS boundary and then is dropped.</li>
<li><b>Community</b>: a label for policy. A common design has the ISP tag routes by region and your policy sets local preference based on the tag. A typical Junos match looks like <code>from community CUSTOMER</code> after defining <code>set policy-options community CUSTOMER members 65010:100</code>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Two paths to 192.0.2.0/24: path A has AS path 64501 and local preference 100, path B has AS path 64502 64503 and local preference 100. They tie on local preference, so the shorter AS path wins: A (length 1) over B (length 2). If someone gave B a local preference of 200, B would win despite its longer AS path, because local preference is checked first.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting to change the local preference towards another AS. It is not sent over EBGP. To influence how other ASes reach you, use AS-path prepending or MED, which have only advisory power over their decision.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the category of each attribute: AS path, next hop and origin are well-known mandatory; local preference is well-known discretionary; MED is optional non-transitive; community is optional transitive. Origin order is I, then E, then incomplete. Local preference default is 100 and higher is better; MED lower is better.</p></div>

<div class="scn"><h4>The route that came back</h4><p>A branch router received its own prefix from the provider with its own AS number in the path and ignored it. The administrator thought this was a bug. It was the loop prevention in action: the route had gone out and come back through a second provider that did not filter.</p><p><b>Lesson:</b> the AS path is how BGP protects itself from loops. Read it before blaming the router.</p></div>

<div class="iv"><p class="q">"Name the main BGP attributes and which ones are mandatory."</p><p>The well-known mandatory attributes are AS path, next hop and origin. Local preference is well-known discretionary and stays inside one AS. MED is optional non-transitive, and the community is optional transitive. I use local preference for outbound policy, and prepending or MED to influence inbound traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Attributes are labels on every route and drive all decisions.</li>
<li>show route detail shows the protocol next hop, resolved next hop, AS path, local preference and router ID.</li>
<li>Local preference is IBGP only; MED goes one AS across; community is a tag for policy.</li>
<li>AS path is also the loop prevention mechanism.</li>
</ul></div>
`,hi:`
<p>Courier parcel par labels hote hain: bhejne wala, route list, priority, special handling. BGP route bhi waisa hi hai. Prefix address hai, aur <b>path attributes</b> wo labels hain jo har router ko batate hain ki route ke saath kya karna hai. Best path se filtering tak lagbhag har BGP decision in labels ko padhta hai. Agar aap output mein unhe padh sakte ho, to kisi bhi BGP behaviour ko samjha sakte ho.</p>

<h3>Chhe attributes jo aapko aane chahiye</h3>
<table class="cmp"><tr><th>Attribute</th><th>Category</th><th>Kya karta hai</th></tr>
<tr><td>AS path</td><td>Well-known mandatory</td><td>Route jin ASes se guzra, naya pehle. Router apna AS jisme ho wo route reject karta hai</td></tr>
<tr><td>Next hop</td><td>Well-known mandatory</td><td>Traffic kahan bhejna hai. EBGP self set karta hai, IBGP rakhta hai</td></tr>
<tr><td>Origin</td><td>Well-known mandatory</td><td>I (IGP), E (EGP) ya ? (incomplete). Kam behtar: I, phir E, phir ?</td></tr>
<tr><td>Local preference</td><td>Well-known discretionary</td><td>Sirf ek AS ke andar. Zyada jeetta hai. Default 100</td></tr>
<tr><td>MED</td><td>Optional non-transitive</td><td>Padosi AS ko hint ki kaun sa entry use kare. Kam jeetta hai</td></tr>
<tr><td>Community</td><td>Optional transitive</td><td>65010:100 jaisa tag jis par policies match karti hain</td></tr></table>
<p>Categories ka matlab: <b>well-known</b> attributes har BGP router ko samajhne chahiye; <b>mandatory</b> har UPDATE mein hone chahiye; <b>transitive</b> optional wale aage bheje jaate hain chahe router unhe na samjhe; <b>non-transitive</b> padosi AS ke aage nahi jaate.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="BGP route ke attributes">
<rect x="20" y="20" width="600" height="150" rx="10" fill="#f1f5f9" stroke="#64748b"/>
<text x="40" y="48" class="svg-ink" font-size="14">203.0.113.0/24</text>
<text x="40" y="76" class="svg-muted" font-size="12">AS path: 64500 I          kahan se aaya</text>
<text x="40" y="98" class="svg-muted" font-size="12">Next hop: 100.65.1.1      traffic kahan bhejna</text>
<text x="40" y="120" class="svg-muted" font-size="12">Local preference: 100     hamare AS ki pasand, zyada jeetta</text>
<text x="40" y="142" class="svg-muted" font-size="12">MED, Community           optional hints aur tags</text>
<text x="440" y="48" class="svg-accent" font-size="12">Ek prefix, kai labels</text>
</svg><p class="cap">Prefix address hai; attributes har decision chalate hain.</p></div>

<h3>Output mein attributes padhna</h3>
<p>Detailed route view sab dikhata hai. Ye pehle lab ka R2 hai, jo ISP prefix ko R1 se IBGP par seekhta hua dekh raha hai:</p>
<pre class="out">lab@NGP-R2&gt; show route 203.0.113.0/24 detail
203.0.113.0/24 (1 entry, 1 announced)
        *BGP    Preference: 170/-101
                Next hop type: Indirect
                Source: 10.20.255.1
                Next hop: 10.20.12.1 via ge-0/0/1.0, selected
                Protocol next hop: 100.65.1.1
                State: &lt;Active Int Ext&gt;
                Local AS: 65010 Peer AS: 65010
                Age: 0:25 	Metric2: 2
                AS path: 64500 I
                Localpref: 100
                Router ID: 10.20.255.1</pre>
<ul>
<li><b>Preference 170/-101</b>: 170 route preference hai. Doosra number local preference se nikalta hai (yahan 100 aur value -(100+1)); zyada local preference chhota (zyada negative) number deti hai, jo comparison jeetta hai.</li>
<li><b>Protocol next hop: 100.65.1.1</b>: BGP next hop ISP address hai, IBGP ne nahi badla. <b>Next hop: 10.20.12.1</b> forwarding next hop hai jo routing table mein resolve karke mila, yahan OSPF ke through. <b>Metric2: 2</b> protocol next hop tak IGP metric hai.</li>
<li><b>Source</b> aur <b>Router ID</b>: wo IBGP peer jisne bheja.</li>
<li><b>AS path 64500 I</b>: route AS 64500 se guzra, origin I. Hamare AS ke andar kuch nahi jodha gaya.</li>
<li><b>Localpref 100</b>: default.</li>
</ul>
<p>Receive view ek compact table hai jismein sabse aam attributes hote hain. R1 par ISP routes ka local preference khaali dikhta hai (EBGP use carry nahi karta), aur IBGP peer se local preference 100:</p>
<pre class="out">lab@NGP-R1&gt; show route receive-protocol bgp 100.65.1.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 198.51.100.0/24         100.65.1.1                              64500 I
* 203.0.113.0/24          100.65.1.1                              64500 I
lab@NGP-R1&gt; show route receive-protocol bgp 10.20.255.2
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.20.2.0/24            10.20.255.2                  100        I</pre>

<h3>Har attribute kis kaam aata hai</h3>
<ul>
<li><b>AS path length</b>: chhota jeetta hai. Operators use jaanbujhkar <b>prepending</b> se lamba karte hain taaki path kam attractive ho.</li>
<li><b>Local preference</b>: aapka exit ka chunav. Ye aapke AS se bahar nahi jaata.</li>
<li><b>MED</b>: default mein sirf same padosi AS ke paths ke beech compare hota hai. Kam behtar. Ek AS ki seema paar karke phir hata diya jaata hai.</li>
<li><b>Community</b>: policy ke liye label. Aam design mein ISP routes ko region se tag karta hai aur aapki policy tag ke hisaab se local preference set karti hai. Typical Junos match <code>from community CUSTOMER</code> hota hai, <code>set policy-options community CUSTOMER members 65010:100</code> define karne ke baad.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> 192.0.2.0/24 ke do paths: path A ka AS path 64501 aur local preference 100, path B ka AS path 64502 64503 aur local preference 100. Local preference par barabari hai, isliye chhota AS path jeetta hai: A (length 1) B (length 2) se. Agar kisi ne B ko local preference 200 de di, to B lambe AS path ke bawajood jeet jaata, kyunki local preference pehle check hoti hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Doosre AS ki taraf local preference badalne ki ummeed. Wo EBGP par nahi bheji jaati. Doosre ASes aap tak kaise pahunchein ye prabhavit karne ke liye AS-path prepending ya MED use karo, jinka unke decision par sirf salaah dene jitna zor hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Har attribute ki category yaad rakho: AS path, next hop aur origin well-known mandatory; local preference well-known discretionary; MED optional non-transitive; community optional transitive. Origin order I, phir E, phir incomplete. Local preference default 100 aur zyada behtar; MED kam behtar.</p></div>

<div class="scn"><h4>Route jo laut aaya</h4><p>Branch router ko provider se apna hi prefix apne hi AS number ke saath path mein mila aur usne ignore kar diya. Administrator ne ise bug samjha. Ye loop prevention kaam kar raha tha: route bahar gaya aur doosre provider se laut aaya jisne filter nahi kiya.</p><p><b>Lesson:</b> AS path BGP ko loops se bachane ka tareeka hai. Router ko doshi thehrane se pehle ise padho.</p></div>

<div class="iv"><p class="q">"Mukhya BGP attributes batao aur kaun se mandatory hain."</p><p>Well-known mandatory attributes AS path, next hop aur origin hain. Local preference well-known discretionary hai aur ek AS ke andar rehti hai. MED optional non-transitive hai, aur community optional transitive. Main outbound policy ke liye local preference, aur inbound traffic ko prabhavit karne ke liye prepending ya MED use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Attributes har route par labels hain aur saare decisions chalate hain.</li>
<li>show route detail protocol next hop, resolved next hop, AS path, local preference aur router ID dikhata hai.</li>
<li>Local preference sirf IBGP; MED ek AS paar jaata hai; community policy ka tag hai.</li>
<li>AS path loop prevention ka tareeka bhi hai.</li>
</ul></div>
`}};export{e as default};