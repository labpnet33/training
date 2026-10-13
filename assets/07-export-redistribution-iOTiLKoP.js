var e={id:`export-redistribution`,h:{en:`Export policy: redistributing between IS-IS, static and OSPF`,hi:`Export policy: IS-IS, static aur OSPF ke beech redistribution`},body:{en:`
<p>Real networks rarely run only one protocol. A merger leaves you with an OSPF island, a data centre uses static routes, and a branch router speaks only OSPF. IS-IS carries those routes only when you export them with a policy. This chapter shows the pattern, the resulting preferences, and the loop you must avoid.</p>

<h3>The rule of Junos policy for IS-IS</h3>
<p>IS-IS installs what SPF finds in its database into the routing table, and in day-to-day design you do not filter that. What you control is what a router <b>originates</b>, using <code>set protocols isis export POLICY</code>. A route that matches an export policy and is accepted becomes an <b>external</b> prefix in the router's own LSP. At the other end, external routes get a worse preference than internal ones. The overview you saw earlier lists the numbers:</p>
<table class="cmp"><tr><th>Route type</th><th>Level 1</th><th>Level 2</th></tr>
<tr><td>Internal</td><td>15</td><td>18</td></tr>
<tr><td>External</td><td>160</td><td>165</td></tr></table>
<p>So if a prefix is known both through OSPF external (150) and as an IS-IS Level 1 external route (160), OSPF wins. Lower preference wins first, and the metric only matters among routes of the same protocol and preference. That is why you compare preferences whenever a prefix exists in two protocols.</p>

<h3>The Jaipur lab: a two-way boundary on R3</h3>
<p>R3 connects the L2-only ring to R5, a router that runs only OSPF. R5 has a loopback 10.7.255.5/32 and R3 holds a static route to 192.168.96.0/22. Two things must happen: IS-IS routes must reach R5, and the OSPF and static routes must reach the ring. The lab solution adds, on R3:</p>
<pre class="out">lab@R3# set policy-options policy-statement TO-ISIS term static from protocol static
lab@R3# set policy-options policy-statement TO-ISIS term static then accept
lab@R3# set protocols isis export TO-ISIS
lab@R3# set policy-options policy-statement ISIS-TO-OSPF term 1 from protocol isis
lab@R3# set policy-options policy-statement ISIS-TO-OSPF term 1 then accept
lab@R3# set protocols ospf export ISIS-TO-OSPF
lab@R3# set policy-options policy-statement TO-ISIS term ospf from protocol ospf
lab@R3# set policy-options policy-statement TO-ISIS term ospf then accept
lab@R3# commit and-quit
commit complete</pre>
<p>Policy TO-ISIS has two terms, and the policy is evaluated in order. Static and OSPF routes are accepted into IS-IS. Policy ISIS-TO-OSPF is a separate export policy attached to OSPF. The router now has an export policy in both protocols, which is a two-way redistribution point, the exact place where loops can start.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Redistribution at R3">
<rect x="20" y="40" width="250" height="110" rx="14" fill="#ddd6fe" opacity="0.7"/><text x="145" y="62" text-anchor="middle" class="svg-ink" font-size="13">IS-IS Level 2 ring</text>
<rect x="400" y="40" width="220" height="110" rx="14" fill="#bae6fd" opacity="0.7"/><text x="510" y="62" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<circle cx="330" cy="110" r="30" fill="#fde68a" stroke="#64748b"/><text x="330" y="114" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<circle cx="90" cy="110" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="90" y="114" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="520" cy="110" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="520" y="114" text-anchor="middle" class="svg-ink" font-size="13">R5</text>
<line x1="112" y1="110" x2="300" y2="110" stroke="#64748b" stroke-width="2"/><line x1="360" y1="110" x2="498" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="200" y="100" text-anchor="middle" class="svg-muted" font-size="11">export TO-ISIS</text><text x="430" y="100" text-anchor="middle" class="svg-muted" font-size="11">export ISIS-TO-OSPF</text>
</svg><p class="cap">R3 exports into both protocols, so every redistributed route needs a plan against loops.</p></div>

<h3>Checking the result on each side</h3>
<p>R5 now sees R1's loopback as an OSPF external route and its OSPF neighbour with R3 is Full:</p>
<pre class="out">lab@R5&gt; show route 10.7.255.1
10.7.255.1/32      *[OSPF/150] 00:00:30, metric 0
                    &gt;  to 10.7.35.3 via ge-0/0/0.0

lab@R5&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.7.35.3        ge-0/0/0.0             Full            10.7.255.3       128    33</pre>
<p>OSPF external preference 150, as you learned in the OSPF module. On the IS-IS side, R1 now sees R5's loopback and the static range, with the external preference 165:</p>
<pre class="out">lab@R1&gt; show route protocol isis
10.7.255.5/32      *[IS-IS/165] 00:00:31, <span class="hl">metric 61</span>
                    &gt;  to 10.7.14.4 via ge-0/0/1.0
192.168.96.0/22    *[IS-IS/165] 00:00:31, <span class="hl">metric 60</span>
                    &gt;  to 10.7.14.4 via ge-0/0/1.0

lab@R1&gt; ping 10.7.255.5 count 2
64 bytes from 10.7.255.5: icmp_seq=0 ttl=62 time=1.200 ms
64 bytes from 10.7.255.5: icmp_seq=1 ttl=62 time=1.500 ms
--- 10.7.255.5 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss</pre>
<p>Metric 60 is the cost from R1 to R3 (30 plus 30, since R2 is in overload in this scenario) plus the exported metric (0 for the static prefix, 1 for the OSPF loopback). The LSP of R3 shows what it originated and that the prefixes are external:</p>
<pre class="out">lab@R1&gt; show isis database detail
R3.00-00 Sequence: 0x2, Checksum: 0x7421, Lifetime: 1168 secs
   IS neighbor: R2.00                          Metric:       10
   IS neighbor: R4.00                          Metric:       30
   IP prefix: 10.7.23.0/24                     Metric:       10 Internal Up
   IP prefix: 10.7.34.0/24                     Metric:       30 Internal Up
   IP prefix: 10.7.255.3/32                    Metric:        0 Internal Up
   IP prefix: 10.7.255.5/32                    Metric:        1 <span class="hl">External</span> Up
   IP prefix: 192.168.96.0/22                  Metric:        0 <span class="hl">External</span> Up</pre>
<p>The sequence number moved to 0x2 once R3 re-originated its LSP. And the config that makes it work is visible on the border:</p>
<pre class="out">lab@R3&gt; show configuration protocols isis
interface lo0.0 {
    passive;
}
interface ge-0/0/0.0 {
    point-to-point;
}
interface ge-0/0/1.0 {
    point-to-point;
    level 2 {
        metric 30;
    }
}
level 1 {
    disable;
}
level 2 {
    wide-metrics-only;
}
export TO-ISIS;</pre>

<h3>Avoiding loops</h3>
<p>When two routers (or two protocols on one router) redistribute in both directions, a route can leave one protocol, enter the other and come back as a worse copy of itself. Safe designs use one or more of these ideas, shown as configuration practice rather than lab output:</p>
<ul>
<li>Redistribute at one border only, or use different tags on each border.</li>
<li>Tag routes when they cross, for example <code>then tag 100</code>, and reject routes with that tag when they come back: <code>from tag 100</code> in a reject term at the top of the other policy.</li>
<li>Match narrowly. The lab policy accepts all OSPF and all static for brevity. A production policy lists prefixes with route-filter.</li></ul>

<div class="eg"><p><b>Worked example.</b> After the policy, someone reports that R1 can reach 10.7.255.5 but that a trace goes via R4 and not via R2. That is correct: R2 is overloaded, so R3 is reached through R4. The exported prefix follows the same SPF as R3's loopback. External routes take the path to the router that originated them.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing <code>from protocol ospf</code> in a policy and forgetting a terminating <code>then accept</code>, or relying on the implicit default. Without an explicit accept the route may be rejected, because the default action of an export policy is protocol-specific.</p></div>
<div class="exam"><p><b>Exam trap.</b> In IS-IS, external routes have worse preference than internal ones (160 and 165 against 15 and 18), and they carry the External flag in the LSP. In OSPF, external is 150 against 10.</p></div>

<div class="scn"><h4>The route that came back</h4><p>During a migration, two border routers exported OSPF to IS-IS and IS-IS to OSPF with no tags. A branch prefix was learned from OSPF, put into IS-IS, taken back into OSPF by the second border, and then back into IS-IS again with a higher metric. Traffic took odd paths and sometimes looped. The team added a tag on every export and a reject-by-tag term at the top of each policy.</p><p><b>Lesson:</b> every two-way boundary needs a tag plan before the first commit.</p></div>

<div class="iv"><p class="q">"How do you stop a redistribution loop between IS-IS and OSPF?"</p><p>Tag routes in the policy that moves them in one direction and reject that tag in the policy for the other direction. Also limit redistribution to the necessary prefixes and use only one or two well-known boundary routers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS exports are controlled by <code>protocols isis export</code>; accepted routes become External.</li>
<li>External preference is 160 (L1) and 165 (L2); internal is 15 and 18.</li>
<li>show isis database detail shows External or Internal per prefix.</li>
<li>Two-way redistribution points need tags or narrow filters.</li>
<li>Check both sides: show route on R1 and R5, show ospf neighbor.</li>
</ul></div>
`,hi:`
<p>Real networks mein shayad hi kabhi sirf ek protocol chalta hai. Merger ke baad OSPF island bachta hai, data centre static routes use karta hai, aur branch router sirf OSPF bolta hai. IS-IS un routes ko tabhi le jata hai jab aap unhe policy se export karo. Yeh chapter pattern, uske preferences aur us loop ko dikhata hai jisse bachna hai.</p>

<h3>IS-IS ke liye Junos policy ka rule</h3>
<p>SPF ko database mein jo milta hai IS-IS use routing table mein install kar deta hai, aur roz ke design mein aap use filter nahi karte. Aap jo control karte ho woh yeh hai ki router kya <b>originate</b> karta hai, <code>set protocols isis export POLICY</code> se. Jo route export policy se match karke accept ho jata hai woh router ke apne LSP mein <b>external</b> prefix ban jata hai. Doosre ends par external routes ki preference internal se kharab hoti hai. Pehle dekha overview numbers list karta hai:</p>
<table class="cmp"><tr><th>Route type</th><th>Level 1</th><th>Level 2</th></tr>
<tr><td>Internal</td><td>15</td><td>18</td></tr>
<tr><td>External</td><td>160</td><td>165</td></tr></table>
<p>Isliye agar prefix OSPF external (150) aur IS-IS Level 1 external (160) dono se pata ho, to OSPF jeetta hai. Pehle chhoti preference jeetti hai, aur metric sirf same protocol aur same preference ke routes ke beech maayne rakhta hai. Isiliye jab prefix do protocols mein ho to preferences compare karte hain.</p>

<h3>Jaipur lab: R3 par do-tarfa boundary</h3>
<p>R3 L2-only ring ko R5 se jodta hai, jo sirf OSPF chalata hai. R5 ka loopback 10.7.255.5/32 hai aur R3 ke paas 192.168.96.0/22 ka static route hai. Do cheezein honi chahiye: IS-IS routes R5 tak pahunchein, aur OSPF aur static routes ring tak. Lab solution R3 par yeh jodta hai:</p>
<pre class="out">lab@R3# set policy-options policy-statement TO-ISIS term static from protocol static
lab@R3# set policy-options policy-statement TO-ISIS term static then accept
lab@R3# set protocols isis export TO-ISIS
lab@R3# set policy-options policy-statement ISIS-TO-OSPF term 1 from protocol isis
lab@R3# set policy-options policy-statement ISIS-TO-OSPF term 1 then accept
lab@R3# set protocols ospf export ISIS-TO-OSPF
lab@R3# set policy-options policy-statement TO-ISIS term ospf from protocol ospf
lab@R3# set policy-options policy-statement TO-ISIS term ospf then accept
lab@R3# commit and-quit
commit complete</pre>
<p>TO-ISIS policy mein do terms hain, aur policy order mein evaluate hoti hai. Static aur OSPF routes IS-IS mein accept hote hain. ISIS-TO-OSPF alag export policy hai jo OSPF par lagi hai. Router ke paas ab dono protocols mein export policy hai, yani do-tarfa redistribution point, bilkul wahi jagah jahan loops shuru ho sakte hain.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Redistribution at R3">
<rect x="20" y="40" width="250" height="110" rx="14" fill="#ddd6fe" opacity="0.7"/><text x="145" y="62" text-anchor="middle" class="svg-ink" font-size="13">IS-IS Level 2 ring</text>
<rect x="400" y="40" width="220" height="110" rx="14" fill="#bae6fd" opacity="0.7"/><text x="510" y="62" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<circle cx="330" cy="110" r="30" fill="#fde68a" stroke="#64748b"/><text x="330" y="114" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<circle cx="90" cy="110" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="90" y="114" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="520" cy="110" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="520" y="114" text-anchor="middle" class="svg-ink" font-size="13">R5</text>
<line x1="112" y1="110" x2="300" y2="110" stroke="#64748b" stroke-width="2"/><line x1="360" y1="110" x2="498" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="200" y="100" text-anchor="middle" class="svg-muted" font-size="11">export TO-ISIS</text><text x="430" y="100" text-anchor="middle" class="svg-muted" font-size="11">export ISIS-TO-OSPF</text>
</svg><p class="cap">R3 dono protocols mein export karta hai, isliye har redistribute hue route ko loop se bachne ka plan chahiye.</p></div>

<h3>Dono taraf result check karo</h3>
<p>R5 ab R1 ka loopback OSPF external route ke roop mein dekhta hai aur R3 ke saath uska OSPF neighbour Full hai:</p>
<pre class="out">lab@R5&gt; show route 10.7.255.1
10.7.255.1/32      *[OSPF/150] 00:00:30, metric 0
                    &gt;  to 10.7.35.3 via ge-0/0/0.0

lab@R5&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.7.35.3        ge-0/0/0.0             Full            10.7.255.3       128    33</pre>
<p>OSPF external preference 150, jaise OSPF module mein seekha. IS-IS side par R1 ab R5 ka loopback aur static range dekhta hai, external preference 165 ke saath:</p>
<pre class="out">lab@R1&gt; show route protocol isis
10.7.255.5/32      *[IS-IS/165] 00:00:31, <span class="hl">metric 61</span>
                    &gt;  to 10.7.14.4 via ge-0/0/1.0
192.168.96.0/22    *[IS-IS/165] 00:00:31, <span class="hl">metric 60</span>
                    &gt;  to 10.7.14.4 via ge-0/0/1.0

lab@R1&gt; ping 10.7.255.5 count 2
64 bytes from 10.7.255.5: icmp_seq=0 ttl=62 time=1.200 ms
64 bytes from 10.7.255.5: icmp_seq=1 ttl=62 time=1.500 ms
--- 10.7.255.5 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss</pre>
<p>Metric 60 R1 se R3 tak ka cost hai (30 plus 30, kyunki is scenario mein R2 overload mein hai) plus exported metric (static prefix ke liye 0, OSPF loopback ke liye 1). R3 ka LSP dikhata hai ki usne kya originate kiya aur prefixes external hain:</p>
<pre class="out">lab@R1&gt; show isis database detail
R3.00-00 Sequence: 0x2, Checksum: 0x7421, Lifetime: 1168 secs
   IS neighbor: R2.00                          Metric:       10
   IS neighbor: R4.00                          Metric:       30
   IP prefix: 10.7.23.0/24                     Metric:       10 Internal Up
   IP prefix: 10.7.34.0/24                     Metric:       30 Internal Up
   IP prefix: 10.7.255.3/32                    Metric:        0 Internal Up
   IP prefix: 10.7.255.5/32                    Metric:        1 <span class="hl">External</span> Up
   IP prefix: 192.168.96.0/22                  Metric:        0 <span class="hl">External</span> Up</pre>
<p>R3 ke apna LSP dobara banane par sequence number 0x2 ho gaya. Aur jo config yeh sab chalati hai woh border par dikhti hai:</p>
<pre class="out">lab@R3&gt; show configuration protocols isis
interface lo0.0 {
    passive;
}
interface ge-0/0/0.0 {
    point-to-point;
}
interface ge-0/0/1.0 {
    point-to-point;
    level 2 {
        metric 30;
    }
}
level 1 {
    disable;
}
level 2 {
    wide-metrics-only;
}
export TO-ISIS;</pre>

<h3>Loops se bachna</h3>
<p>Jab do routers (ya ek router par do protocols) dono directions mein redistribute karte hain, to route ek protocol se nikalkar doosre mein jaakar apni hi kharab copy ban sakta hai. Safe designs inme se ek ya zyada ideas use karte hain, jo lab output nahi balki configuration practice ke roop mein dikhaye gaye hain:</p>
<ul>
<li>Sirf ek border par redistribute karo, ya har border par alag tags use karo.</li>
<li>Routes ko cross karte waqt tag karo, jaise <code>then tag 100</code>, aur wapas aane par us tag wale routes ko reject karo: doosri policy ke top par reject term mein <code>from tag 100</code>.</li>
<li>Narrow match karo. Lab policy brevity ke liye saare OSPF aur saare static accept karti hai. Production policy route-filter se prefixes list karti hai.</li></ul>

<div class="eg"><p><b>Worked example.</b> Policy ke baad koi batata hai ki R1 10.7.255.5 tak pahunch sakta hai par trace R2 ke bajay R4 se jata hai. Yeh sahi hai: R2 overloaded hai, isliye R3 R4 ke through pahunchta hai. Exported prefix R3 ke loopback wale SPF ko hi follow karta hai. External routes us router tak ke path ko follow karte hain jisne unhe originate kiya.</p></div>

<div class="warn"><p><b>Common mistake.</b> Policy mein <code>from protocol ospf</code> likhna aur terminating <code>then accept</code> bhool jaana, ya implicit default par bharosa karna. Explicit accept ke bina route reject ho sakta hai, kyunki export policy ki default action protocol-specific hoti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS mein external routes ki preference internal se kharab hoti hai (160 aur 165 against 15 aur 18), aur woh LSP mein External flag rakhte hain. OSPF mein external 150 hai against 10.</p></div>

<div class="scn"><h4>Route jo wapas aa gaya</h4><p>Migration ke dauran do border routers ne bina tags ke OSPF ko IS-IS mein aur IS-IS ko OSPF mein export kiya. Ek branch prefix OSPF se seekha gaya, IS-IS mein daala gaya, doosre border ne wapas OSPF mein liya, aur phir ucche metric ke saath dobara IS-IS mein aaya. Traffic ajeeb paths leta tha aur kabhi-kabhi loop karta tha. Team ne har export par tag aur har policy ke top par reject-by-tag term jodha.</p><p><b>Lesson:</b> har do-tarfa boundary ko pehle commit se pehle tag plan chahiye.</p></div>

<div class="iv"><p class="q">"IS-IS aur OSPF ke beech redistribution loop kaise rokte ho?"</p><p>Jis policy se route ek direction mein jata hai usme tag lagao aur doosri direction ki policy mein us tag ko reject karo. Redistribution ko zaroori prefixes tak seemit rakho aur sirf ek ya do jaane-pehchane boundary routers use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS exports <code>protocols isis export</code> se control hote hain; accept hue routes External ban jaate hain.</li>
<li>External preference 160 (L1) aur 165 (L2); internal 15 aur 18.</li>
<li>show isis database detail har prefix par External ya Internal dikhata hai.</li>
<li>Do-tarfa redistribution points ko tags ya narrow filters chahiye.</li>
<li>Dono sides check karo: R1 aur R5 par show route, show ospf neighbor.</li>
</ul></div>
`}};export{e as default};