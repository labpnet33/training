var e={id:`troubleshooting-mindset`,h:{en:`The troubleshooting mindset: layers, evidence and the first five commands`,hi:`Troubleshooting mindset: layers, evidence aur pehle paanch commands`},body:{en:`
<p>A doctor does not guess; she takes the temperature, listens to the chest, and rules things out in order. Network troubleshooting works the same way. In this track every fault, from a missing VRF to a SID conflict, is found by walking up the layers and letting evidence, not hunches, decide.</p>

<h3>The ladder</h3>
<ol>
<li><b>Links and interfaces</b>: is it up, is it in the right VRF, is the address right?</li>
<li><b>Underlay routing</b>: does IS-IS have an adjacency and a route to every loopback?</li>
<li><b>Transport labels</b>: does each router hold a label for each loopback, and does the path show labels all the way?</li>
<li><b>Overlay control plane</b>: is the BGP session up, are routes exchanged with route targets?</li>
<li><b>Customer edge</b>: does the CE learn the remote prefix, and does the PC reach it?</li>
</ol>
<p>Always stop at the lowest layer that is broken. A perfect VPN configuration cannot work over a missing label.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Troubleshooting ladder">
<rect x="180" y="10" width="280" height="32" rx="6" fill="#fde68a"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">5  Customer edge: CE and PC</text>
<rect x="150" y="48" width="340" height="32" rx="6" fill="#fed7aa"/><text x="320" y="69" text-anchor="middle" class="svg-ink" font-size="13">4  Overlay: BGP VPNv4 / EVPN, RT</text>
<rect x="120" y="86" width="400" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="13">3  Transport labels: SIDs, LFIB</text>
<rect x="90" y="124" width="460" height="32" rx="6" fill="#bae6fd"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">2  Underlay: IS-IS or OSPF, loopbacks</text>
<rect x="60" y="162" width="520" height="32" rx="6" fill="#e2e8f0"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="13">1  Links, interfaces, addressing</text>
</svg><p class="cap">Work from the bottom up. Each layer depends on the one beneath it.</p></div>

<h3>The first five commands</h3>
<pre class="code">show ip interface brief
show isis neighbors
show mpls forwarding-table
show bgp vpnv4 unicast all summary
show ip route vrf CUST_A</pre>
<p>Between them they cover all five layers in under a minute. Run them on both ends before you change anything.</p>
<pre class="out">PE1# show mpls forwarding-table 10.0.255.5
Local  Outgoing  Prefix          Next hop
<span class="hl">16005  No Label  10.0.255.5/32   10.0.12.2</span></pre>
<p>"No Label" in the outgoing column is the signature of a transport problem: the next router does not advertise a label for that prefix. Look at that next hop, not at BGP.</p>

<h3>Rules that save time</h3>
<ul>
<li>Test both directions. A one-way failure usually means one PE is missing something the other has.</li>
<li>Change one thing at a time, and write down what you changed.</li>
<li>Compare a working device with the broken one; the difference is often the answer.</li>
<li>Ping the loopback sourced from your own loopback; a plain ping can use a different source and mislead you.</li>
</ul>

<div class="eg"><b>Worked example.</b> CE1 cannot reach PC2. Layer 1 and 2 are clean. At layer 3 the PE1 table shows "No Label" for 10.0.255.5, and the outgoing next hop is P1. On P1 the command <code>show mpls forwarding-table</code> is empty. The cause is one missing line, <code>segment-routing mpls</code> under <code>router isis</code> on P1. One line, found in four commands.</div>

<div class="warn"><b>Common mistake.</b> Starting at the top. Engineers see "customer cannot ping" and open BGP first, then lose an hour reconfiguring a healthy VPN.</div>

<div class="scn"><h4>The 2 a.m. page</h4><p>A call came in: Chennai cannot reach Mumbai. The on-call engineer ran the five commands. BGP was fine, but the label table on one core router was empty after a reload because its IS-IS segment-routing line had not been saved. She restored the line, confirmed 16005 appeared, and the customer recovered in six minutes.</p><p><b>Lesson:</b> save the configuration, and verify labels after any reload.</p></div>

<div class="iv"><p class="q">"A customer says their VPN is down. Where do you start?"</p><p>Describe the ladder: confirm the symptom, then check the interface and VRF, IS-IS, labels, BGP VPNv4, and finally the CE. Say that you stop at the first broken layer and fix that only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot bottom up through five layers.</li>
<li>"No Label" means a transport-label fault, not a BGP fault.</li>
<li>Five commands cover every layer in a minute.</li>
<li>Change one thing at a time and verify after each change.</li>
</ul></div>
`,hi:`
<p>Doctor andaaza nahi lagaata; woh temperature leta hai, chhati sunta hai, aur ek ek karke cheezein rule out karta hai. Network troubleshooting bhi aise hi kaam karti hai. Is track mein har fault, missing VRF se SID conflict tak, layers ke upar chadhkar mila hai, aur faisla evidence karta hai, andaaza nahi.</p>

<h3>Seedhi (ladder)</h3>
<ol>
<li><b>Links aur interfaces</b>: up hai, sahi VRF mein hai, address sahi hai?</li>
<li><b>Underlay routing</b>: IS-IS adjacency hai aur har loopback ka route hai?</li>
<li><b>Transport labels</b>: har router ke paas har loopback ka label hai, aur path poora labels dikhata hai?</li>
<li><b>Overlay control plane</b>: BGP session up hai, route targets ke saath routes exchange ho rahe hain?</li>
<li><b>Customer edge</b>: CE ko remote prefix mila, aur PC pahunch raha hai?</li>
</ol>
<p>Hamesha sabse neeche wali toot-ti layer par ruko. Missing label ke upar perfect VPN configuration kaam nahi karti.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Troubleshooting ladder">
<rect x="180" y="10" width="280" height="32" rx="6" fill="#fde68a"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">5  Customer edge: CE and PC</text>
<rect x="150" y="48" width="340" height="32" rx="6" fill="#fed7aa"/><text x="320" y="69" text-anchor="middle" class="svg-ink" font-size="13">4  Overlay: BGP VPNv4 / EVPN, RT</text>
<rect x="120" y="86" width="400" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="13">3  Transport labels: SIDs, LFIB</text>
<rect x="90" y="124" width="460" height="32" rx="6" fill="#bae6fd"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">2  Underlay: IS-IS or OSPF, loopbacks</text>
<rect x="60" y="162" width="520" height="32" rx="6" fill="#e2e8f0"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="13">1  Links, interfaces, addressing</text>
</svg><p class="cap">Neeche se upar kaam karo. Har layer apne neeche wali par depend karti hai.</p></div>

<h3>Pehle paanch commands</h3>
<pre class="code">show ip interface brief
show isis neighbors
show mpls forwarding-table
show bgp vpnv4 unicast all summary
show ip route vrf CUST_A</pre>
<p>Yeh paancho milkar ek minute se kam mein saari paanch layers cover karte hain. Kuch badalne se pehle dono ends par chalao.</p>
<pre class="out">PE1# show mpls forwarding-table 10.0.255.5
Local  Outgoing  Prefix          Next hop
<span class="hl">16005  No Label  10.0.255.5/32   10.0.12.2</span></pre>
<p>Outgoing column mein "No Label" transport problem ki pehchaan hai: agla router us prefix ka label advertise nahi kar raha. Us next hop ko dekho, BGP ko nahi.</p>

<h3>Time bachane wale rules</h3>
<ul>
<li>Dono directions test karo. One-way failure ka matlab aam taur par ek PE ke paas woh cheez nahi hai jo doosre ke paas hai.</li>
<li>Ek baar mein ek cheez badlo, aur likho ki kya badla.</li>
<li>Working device ko broken se compare karo; farak aksar jawab hota hai.</li>
<li>Loopback ko apne loopback se source karke ping karo; plain ping alag source use karke bhatka sakta hai.</li>
</ul>

<div class="eg"><b>Worked example.</b> CE1 PC2 tak nahi pahunch raha. Layer 1 aur 2 saaf hain. Layer 3 par PE1 table 10.0.255.5 ke liye "No Label" dikhati hai, aur outgoing next hop P1 hai. P1 par <code>show mpls forwarding-table</code> khaali hai. Wajah ek line ki kami hai: P1 ke <code>router isis</code> ke neeche <code>segment-routing mpls</code>. Ek line, chaar commands mein mili.</div>

<div class="warn"><b>Common mistake.</b> Upar se shuru karna. Engineers "customer ping nahi kar sakta" dekhkar pehle BGP kholte hain, aur healthy VPN ko dobara configure karne mein ghanta kho dete hain.</div>

<div class="scn"><h4>Raat 2 baje ka page</h4><p>Call aaya: Chennai Mumbai tak nahi pahunch raha. On-call engineer ne paancho commands chalaye. BGP theek tha, par reload ke baad ek core router ka label table khaali tha kyunki uski IS-IS segment-routing line save nahi hui thi. Usne line wapas daali, 16005 dikha, aur customer chhe minute mein recover ho gaya.</p><p><b>Lesson:</b> configuration save karo, aur har reload ke baad labels verify karo.</p></div>

<div class="iv"><p class="q">"Customer kehta hai uska VPN down hai. Kahan se shuru karoge?"</p><p>Ladder batao: symptom confirm karo, phir interface aur VRF, IS-IS, labels, BGP VPNv4, aur aakhir mein CE. Kaho ki aap pehli toot-ti layer par ruk kar sirf wahi theek karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch layers mein neeche se upar troubleshoot karo.</li>
<li>"No Label" matlab transport-label fault, BGP fault nahi.</li>
<li>Paanch commands ek minute mein har layer cover karte hain.</li>
<li>Ek baar mein ek change karo aur har change ke baad verify karo.</li>
</ul></div>
`}};export{e as default};