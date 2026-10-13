var e={id:`summary`,h:{en:`Summary and exam checklist: advanced BGP`,hi:`Summary aur exam checklist: advanced BGP`},body:{en:`
<p>You have now walked from path attributes to route reflectors, communities and AS-number tricks, and you have read real output from three labs. This chapter is your revision sheet for the JNCIP-ENT (JN0-650) BGP objectives and for interviews.</p>

<h3>Can-do checklist</h3>
<ul>
<li>List the four attribute categories and place ORIGIN, AS_PATH, NEXT_HOP, LOCAL_PREF, COMMUNITY, MED, ORIGINATOR_ID and CLUSTER_LIST in them.</li>
<li>Recite the Junos best-path order and predict the winner for three given paths.</li>
<li>Write a community definition, tag routes with <code>community add</code>, match them in an export policy and prove the result with <code>show route advertising-protocol bgp</code>.</li>
<li>Explain why <code>community set</code> can remove a customer's <code>no-export</code>.</li>
<li>Build a route reflector (cluster, clients) and read ORIGINATOR_ID and CLUSTER_LIST on a client.</li>
<li>Explain why a route reflector needs next-hop self on the edge, and what a hidden route means.</li>
<li>Describe a confederation (member AS, conf-EBGP, confed segments) and compare it to a route reflector.</li>
<li>Configure multipath, with and without <code>multiple-as</code>, and the forwarding-table policy that makes it work.</li>
<li>Choose between <code>local-as</code>, <code>private</code>, <code>remove-private</code>, <code>as-override</code> and <code>loops</code> for a given scenario.</li>
<li>Troubleshoot with the five-step funnel and explain Idle, Connect, Active and Established.</li>
</ul>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Defaults</td><td>BGP route preference 170; local preference 100; hold time 90 s; TCP port 179</td></tr>
<tr><td>Best path</td><td>Local preference, AS path length, origin, MED, EBGP over IBGP, IGP metric, router ID, cluster list, peer address</td></tr>
<tr><td>MED</td><td>Compared only within the same neighbouring AS unless always-compare-med; missing MED counts as 0</td></tr>
<tr><td>Communities</td><td>Optional transitive; add keeps, set replaces, delete removes; no-export, no-advertise, no-export-subconfed</td></tr>
<tr><td>Route reflection</td><td>Reflects only the best route; does not change next hop; ORIGINATOR_ID and CLUSTER_LIST stop loops</td></tr>
<tr><td>Reflection direction</td><td>Client route to all; non-client route to clients only; EBGP route to all</td></tr>
<tr><td>Confederation</td><td>Member ASes with conf-EBGP; local preference preserved; confed segments not counted in path length</td></tr>
<tr><td>Multipath</td><td>Ties on everything before router ID; same neighbouring AS unless multiple-as; needs forwarding-table export policy</td></tr>
<tr><td>Policy levels</td><td>Global, group, neighbour; most specific wins completely</td></tr>
<tr><td>Default policies</td><td>Import accepts all; export advertises active BGP routes only</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="out"><span class="hl">Session</span>     show bgp summary | show bgp neighbor X
<span class="hl">Received</span>    show route receive-protocol bgp X [detail]
<span class="hl">Hidden</span>      show route hidden [detail]
<span class="hl">Prefix</span>      show route PREFIX detail | show route community NAME | show route community-name NAME
<span class="hl">Sent</span>        show route advertising-protocol bgp X
<span class="hl">Policy</span>      test policy NAME PREFIX | show configuration policy-options
<span class="hl">Config</span>      set protocols bgp group G cluster ID | local-as N [private] | multipath [multiple-as]
            set policy-options community NAME members 65200:100
            set routing-options autonomous-system N [loops 2]</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AS path</dt><dd>List of ASes a route has crossed; used for loop detection and path length.</dd>
<dt>Local preference</dt><dd>Attribute inside an AS that selects the preferred exit; higher wins.</dd>
<dt>MED</dt><dd>Hint to a neighbouring AS about which entry to prefer; lower wins.</dd>
<dt>Community</dt><dd>Tag on a route used to apply policy elsewhere.</dd>
<dt>Route reflector</dt><dd>IBGP router that reflects routes to its clients.</dd>
<dt>Cluster ID</dt><dd>Identifier of an RR cluster used in the cluster list for loop prevention.</dd>
<dt>Confederation</dt><dd>An AS split into member ASes that appear as one AS to the outside.</dd>
<dt>Hidden route</dt><dd>A received route that cannot be used, typically because its next hop does not resolve.</dd>
<dt>local-as</dt><dd>Option to present a different AS number to a peer.</dd>
</dl>

<div class="eg"><p><b>Worked example for revision.</b> Prefix P arrives from two peers. Path A has local preference 100, AS-path length 2, MED 50. Path B has local preference 100, AS-path length 2, MED 10, from the same neighbouring AS. All earlier steps tie, so MED decides: B wins. If A and B came from different neighbouring ASes, MED would not be compared and the next steps (EBGP over IBGP, IGP cost, router ID) would decide.</p></div>

<div class="warn"><p><b>Last-minute mistakes.</b> Mixing up import and export direction; assuming Active means working; expecting an RR to change the next hop; using prepend to steer outbound traffic; forgetting that a neighbour-level policy replaces a group-level one.</p></div>
<div class="exam"><p><b>Exam trap.</b> Many questions hide the answer in one detail: "same neighbouring AS", "best route only", "most specific level", or "received routes". Read the sentence twice before you pick the option.</p></div>

<div class="scn"><h4>From lab to production</h4><p>A candidate who had done all three labs was asked in an interview to move an ISP edge from a full mesh to route reflectors with customer, peer and upstream tagging, and to keep an old AS number for a partner during a merger. She named the steps in order: tag at ingress, one RR pair with different cluster IDs, next-hop self at the edge, an export policy that accepts only customer-tagged routes to peers, and local-as with the private option for the partner. She also named the verification command for each.</p><p><b>Lesson:</b> the lab exercises are building blocks. Practise saying the design in one breath, then proving each piece with a show command.</p></div>

<div class="iv"><p class="q">"Summarise how you would design BGP for a growing enterprise with two ISPs."</p><p>IBGP inside with a pair of route reflectors and next-hop self at the edges; local preference to choose the primary ISP and prepend or MED to shape inbound traffic; communities to tag customer, peer and upstream routes with matching export policies; multipath if both links should share load; and a verification routine built on show bgp summary, receive-protocol, hidden routes and advertising-protocol.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the best-path order and what each knob (local preference, MED, prepend) changes.</li>
<li>Communities are for policy; add versus set is the classic trap.</li>
<li>Route reflectors do not change next hops; they reflect only the best route.</li>
<li>Confederations and route reflectors both scale IBGP; choose by migration effort.</li>
<li>Always verify with the five-step funnel and the cheat-sheet commands.</li>
</ul></div>
`,hi:`
<p>Ab aap path attributes se route reflectors, communities aur AS-number tricks tak chale ho, aur teen labs ka real output padha hai. Yeh chapter JNCIP-ENT (JN0-650) BGP objectives aur interviews ke liye aapki revision sheet hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Chaar attribute categories batao aur ORIGIN, AS_PATH, NEXT_HOP, LOCAL_PREF, COMMUNITY, MED, ORIGINATOR_ID aur CLUSTER_LIST ko unmein rakho.</li>
<li>Junos best-path order bolo aur diye gaye teen paths ka winner predict karo.</li>
<li>Community definition likho, <code>community add</code> se routes tag karo, export policy mein match karo aur nateeja <code>show route advertising-protocol bgp</code> se saabit karo.</li>
<li>Samjhao ki <code>community set</code> customer ka <code>no-export</code> kyun hata sakta hai.</li>
<li>Route reflector banao (cluster, clients) aur client par ORIGINATOR_ID aur CLUSTER_LIST padho.</li>
<li>Samjhao ki route reflector ko edge par next-hop self kyun chahiye, aur hidden route ka kya matlab hai.</li>
<li>Confederation (member AS, conf-EBGP, confed segments) batao aur route reflector se compare karo.</li>
<li><code>multiple-as</code> ke saath aur bina multipath configure karo, aur woh forwarding-table policy jo ise kaam karati hai.</li>
<li>Diye gaye scenario ke liye <code>local-as</code>, <code>private</code>, <code>remove-private</code>, <code>as-override</code> aur <code>loops</code> mein se chuno.</li>
<li>Paanch-step funnel se troubleshoot karo aur Idle, Connect, Active aur Established samjhao.</li>
</ul>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Defaults</td><td>BGP route preference 170; local preference 100; hold time 90 s; TCP port 179</td></tr>
<tr><td>Best path</td><td>Local preference, AS path length, origin, MED, IBGP par EBGP, IGP metric, router ID, cluster list, peer address</td></tr>
<tr><td>MED</td><td>Sirf same neighbouring AS ke andar compare hota hai jab tak always-compare-med na ho; missing MED 0 maana jaata hai</td></tr>
<tr><td>Communities</td><td>Optional transitive; add rakhta hai, set badalta hai, delete hataata hai; no-export, no-advertise, no-export-subconfed</td></tr>
<tr><td>Route reflection</td><td>Sirf best route reflect karta hai; next hop nahi badalta; ORIGINATOR_ID aur CLUSTER_LIST loops rokte hain</td></tr>
<tr><td>Reflection direction</td><td>Client route sabko; non-client route sirf clients ko; EBGP route sabko</td></tr>
<tr><td>Confederation</td><td>Member ASes conf-EBGP ke saath; local preference preserved; confed segments path length mein nahi gine jaate</td></tr>
<tr><td>Multipath</td><td>Router ID se pehle sab par tie; same neighbouring AS jab tak multiple-as na ho; forwarding-table export policy chahiye</td></tr>
<tr><td>Policy levels</td><td>Global, group, neighbour; sabse specific poori tarah jeetta hai</td></tr>
<tr><td>Default policies</td><td>Import sab accept karta hai; export sirf active BGP routes advertise karta hai</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="out"><span class="hl">Session</span>     show bgp summary | show bgp neighbor X
<span class="hl">Received</span>    show route receive-protocol bgp X [detail]
<span class="hl">Hidden</span>      show route hidden [detail]
<span class="hl">Prefix</span>      show route PREFIX detail | show route community NAME | show route community-name NAME
<span class="hl">Sent</span>        show route advertising-protocol bgp X
<span class="hl">Policy</span>      test policy NAME PREFIX | show configuration policy-options
<span class="hl">Config</span>      set protocols bgp group G cluster ID | local-as N [private] | multipath [multiple-as]
            set policy-options community NAME members 65200:100
            set routing-options autonomous-system N [loops 2]</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AS path</dt><dd>Route ne jin ASes ko cross kiya unki list; loop detection aur path length ke liye.</dd>
<dt>Local preference</dt><dd>AS ke andar ka attribute jo preferred exit chunta hai; zyada jeetta hai.</dd>
<dt>MED</dt><dd>Padosi AS ko hint ki kaunsa entry prefer kare; kam jeetta hai.</dd>
<dt>Community</dt><dd>Route par tag jo kahin aur policy lagane ke kaam aata hai.</dd>
<dt>Route reflector</dt><dd>IBGP router jo routes apne clients ko reflect karta hai.</dd>
<dt>Cluster ID</dt><dd>RR cluster ka identifier jo cluster list mein loop prevention ke liye use hota hai.</dd>
<dt>Confederation</dt><dd>Member ASes mein bant hua AS jo bahar ek AS dikhta hai.</dd>
<dt>Hidden route</dt><dd>Aisa received route jo use nahi ho sakta, aam taur par next hop resolve na hone se.</dd>
<dt>local-as</dt><dd>Peer ko alag AS number dikhane ka option.</dd>
</dl>

<div class="eg"><p><b>Revision ke liye worked example.</b> Prefix P do peers se aata hai. Path A: local preference 100, AS-path length 2, MED 50. Path B: local preference 100, AS-path length 2, MED 10, same neighbouring AS se. Pehle ke saare steps tie hain, isliye MED decide karta hai: B jeetta hai. Agar A aur B alag neighbouring ASes se aate, to MED compare nahi hota aur agle steps (IBGP par EBGP, IGP cost, router ID) decide karte.</p></div>

<div class="warn"><p><b>Aakhri waqt ki galtiyan.</b> Import aur export direction mix karna; Active ko working samajhna; RR se next hop badalne ki umeed; outbound traffic steer karne ke liye prepend; yeh bhoolna ki neighbour-level policy group-level policy ko replace karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kai sawaalon ka jawab ek detail mein chhupa hota hai: "same neighbouring AS", "best route only", "most specific level", ya "received routes". Option chunne se pehle sentence do baar padho.</p></div>

<div class="scn"><h4>Lab se production tak</h4><p>Teeno labs kar chuki ek candidate se interview mein kaha gaya ki ek ISP edge ko full mesh se route reflectors par le jao, customer, peer aur upstream tagging lagao, aur merger ke dauran partner ke liye purana AS number rakho. Usne steps order mein bataye: ingress par tag, alag cluster IDs ke saath ek RR pair, edge par next-hop self, peers ko sirf customer-tagged routes accept karne wali export policy, aur partner ke liye private option ke saath local-as. Usne har ek ka verification command bhi bataya.</p><p><b>Lesson:</b> lab exercises building blocks hain. Design ek saans mein bolne ki practice karo, phir har hisse ko show command se saabit karo.</p></div>

<div class="iv"><p class="q">"Do ISPs wale badhte enterprise ke liye BGP design ka summary do."</p><p>Andar IBGP, route reflectors ki ek pair aur edges par next-hop self; primary ISP chunne ke liye local preference aur inbound shape karne ke liye prepend ya MED; customer, peer aur upstream routes tag karne ke liye communities aur matching export policies; dono links load share karein to multipath; aur show bgp summary, receive-protocol, hidden routes aur advertising-protocol par bana verification routine.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Best-path order aur har knob (local preference, MED, prepend) kya badalta hai jaano.</li>
<li>Communities policy ke liye hain; add versus set classic trap hai.</li>
<li>Route reflectors next hop nahi badalte; sirf best route reflect karte hain.</li>
<li>Confederations aur route reflectors dono IBGP scale karte hain; migration effort se chuno.</li>
<li>Hamesha paanch-step funnel aur cheat-sheet commands se verify karo.</li>
</ul></div>
`}};export{e as default};