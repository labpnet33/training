var e={id:`troubleshooting`,h:{en:`Troubleshooting routing policy: a workflow and the lab tickets`,hi:`Routing policy troubleshooting: workflow aur lab tickets`},body:{en:`
<p>Policy problems feel mysterious because the commit succeeds and nothing complains. The route is simply not where you expect it. A fixed workflow removes the mystery. This chapter gives you the workflow, then applies it to the two troubleshooting tickets of the module labs.</p>

<h3>Analogy: tracing a lost parcel</h3>
<p>When a parcel is lost, you do not search the whole country. You check the sender's receipt, then the sorting office, then the delivery van, then the recipient's door. Following the route of the parcel narrows the problem to one stage. A route also travels through stages: the source, the export policy, the protocol, the import policy, the table.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Troubleshooting stages">
<rect x="10" y="60" width="100" height="60" rx="8" fill="#e2e8f0"/><text x="60" y="88" text-anchor="middle" class="svg-ink" font-size="12">1. Does the</text><text x="60" y="104" text-anchor="middle" class="svg-ink" font-size="12">route exist?</text>
<rect x="130" y="60" width="100" height="60" rx="8" fill="#bae6fd"/><text x="180" y="88" text-anchor="middle" class="svg-ink" font-size="12">2. Is it</text><text x="180" y="104" text-anchor="middle" class="svg-ink" font-size="12">active?</text>
<rect x="250" y="60" width="100" height="60" rx="8" fill="#fde68a"/><text x="300" y="88" text-anchor="middle" class="svg-ink" font-size="12">3. Policy</text><text x="300" y="104" text-anchor="middle" class="svg-ink" font-size="12">applied?</text>
<rect x="370" y="60" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="420" y="88" text-anchor="middle" class="svg-ink" font-size="12">4. test policy</text><text x="420" y="104" text-anchor="middle" class="svg-ink" font-size="12">accepts it?</text>
<rect x="490" y="60" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="88" text-anchor="middle" class="svg-ink" font-size="12">5. Neighbour</text><text x="560" y="104" text-anchor="middle" class="svg-ink" font-size="12">sees it?</text>
<line x1="110" y1="90" x2="130" y2="90" stroke="#64748b" stroke-width="2"/><line x1="230" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><line x1="350" y1="90" x2="370" y2="90" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Stop at the first stage that fails. That stage holds the bug.</text>
</svg><p class="cap">Five questions, in order, find almost every policy fault.</p></div>

<h3>The five-question workflow</h3>
<ol>
<li><b>Does the route exist on the originating router?</b> <code>show route 10.60.200.0/24</code>. If it is missing, policy is not your problem.</li>
<li><b>Is it active?</b> Look for the asterisk. A hidden or inactive route is never exported.</li>
<li><b>Is the policy applied, and in which order?</b> <code>show protocols ospf | display set</code>. Check the name is present and the chain order is right.</li>
<li><b>Does the policy accept the route?</b> <code>test policy NAME PREFIX</code>, then <code>show policy NAME</code> to read every term and route-filter.</li>
<li><b>What does the neighbour see?</b> <code>show route PREFIX detail</code> there. Check preference, metric, tag.</li>
</ol>

<h3>Ticket 1: one leak, one black hole (lab pol-route-filter)</h3>
<p>R1-DC exports data-centre prefixes into OSPF with policy DC-OUT. Two tickets are open on campus router R2: the analytics subnet 10.60.200.0/24 is missing, and the lab blocks 10.70.1.0/24 and 10.70.2.0/24 appear although only the 10.70.0.0/16 summary should be advertised.</p>
<p><b>Step 1 and 2.</b> On R1 the statics exist and are active (<code>show route protocol static</code>). <b>Step 3.</b> <code>show protocols ospf | display set</code> shows <code>export DC-OUT</code>. <b>Step 4.</b> Run the dry-run:</p>
<pre class="out">lab@R1-DC&gt; test policy DC-OUT 10.0.0.0/8
...
Policy DC-OUT: 4 prefix accepted, 7 prefix rejected

lab@R1-DC&gt; show policy DC-OUT
Policy DC-OUT:
    Term DC:
        from proto Static
        from     10.60.0.0/16 orlonger
        <span class="hl">from     10.60.128.0/17 exact</span>
        then     accept
    Term LABS:
        from proto Static
        <span class="hl">from     10.70.0.0/16 orlonger</span>
        then     accept
    Term LAST:
        then     reject</pre>
<p><b>Diagnosis A.</b> 10.60.200.0/24 sits inside 10.60.128.0/17 (128 to 255). The longest covering route-filter is the /17 with match type exact, and a /24 is not exactly that /17. The term does not match, and the /16 orlonger is never used. The answer to the lab question "which entry stops it" is <b>10.60.128.0/17</b>.</p>
<p><b>Fix A.</b> Remove the leftover entry:</p>
<pre class="code">lab@R1-DC# delete policy-options policy-statement DC-OUT term DC from route-filter 10.60.128.0/17 exact
lab@R1-DC# commit</pre>
<p><b>Diagnosis B.</b> LABS says <code>10.70.0.0/16 orlonger</code>, which accepts the /16 and both /24 statics. The requirement is the summary only, so the type must be <code>exact</code>.</p>
<pre class="code">lab@R1-DC# delete policy-options policy-statement DC-OUT term LABS from route-filter 10.70.0.0/16 orlonger
lab@R1-DC# set policy-options policy-statement DC-OUT term LABS from route-filter 10.70.0.0/16 exact
lab@R1-DC# commit and-quit</pre>
<p>On R2, wait for OSPF to refresh and confirm: 10.60.5.0/24 and 10.60.200.0/24 present as OSPF/150, 10.70.0.0/16 present, 10.70.1.0/24 and 10.70.2.0/24 gone. The statics on R1 must stay untouched: you fixed the policy, not the routing.</p>

<h3>Ticket 2: the block that does nothing (lab pol-chain)</h3>
<p>R1 exports all statics with policy STATICS, including 192.168.99.0/24. Security wants it hidden, and every exported route tagged 300.</p>
<ol>
<li>Create NO-MGMT: <code>from route-filter 192.168.99.0/24 exact</code>, <code>then reject</code>.</li>
<li>Create SET-TAG: one term, <code>then tag 300</code>, no accept, no reject.</li>
<li>Rebuild the chain: <code>delete protocols ospf export</code> then <code>set protocols ospf export [ NO-MGMT SET-TAG STATICS ]</code>.</li>
</ol>
<p>If you only use <code>set protocols ospf export NO-MGMT</code>, the order becomes [ STATICS NO-MGMT ] and the block never runs. Verify on R2:</p>
<pre class="out">lab@R2&gt; show route protocol ospf | match 172.21
172.21.1.0/24      *[OSPF/150] 00:01:10, metric 0, tag 300
172.21.2.0/24      *[OSPF/150] 00:01:10, metric 0, tag 300

lab@R2&gt; show route 192.168.99.0/24
(no output: the route is not present)</pre>
<p>Finally, <code>test policy SET-TAG 192.168.99.0/24</code> reports <b>1</b> accepted although SET-TAG has no accept. That is the test-policy default-accept behaviour, not evidence that SET-TAG alone would export anything.</p>

<h3>Other classic faults and their signatures</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>No effect after commit</td><td>Policy not applied to the protocol</td><td>show protocols ospf</td></tr>
<tr><td>Everything leaked</td><td>Term without from, or accept before the block</td><td>show policy NAME</td></tr>
<tr><td>Nothing exported</td><td>Only modifying actions, so protocol default reject applies</td><td>add accept, test</td></tr>
<tr><td>Route missing, policy looks right</td><td>Route not active or hidden</td><td>show route PREFIX hidden</td></tr>
<tr><td>Wrong preference or metric</td><td>Another policy earlier in the chain</td><td>read chain left to right</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Fixing the routes instead of the policy. In both tickets the static routes are correct and must stay. Deleting a static route to "hide" it removes reachability for the router itself.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question shows a route-filter set and a missing route, find the longest covering prefix first. If it shows a chain, read left to right and stop at the first terminating action.</p></div>

<div class="scn"><h4>Friday 6 pm: the analytics team cannot connect</h4><p>A new analytics subnet 10.60.200.0/24 went live. The campus could not reach it. The on-call engineer first pinged from the campus router (failed, no route). He ran the five questions on the DC router: route exists, active, policy applied, then test policy told him 10.60.200.0/24 was rejected. <code>show policy</code> showed the leftover /17 exact entry created for an old project. He removed it, committed, and the route appeared on R2 within 30 seconds. Total time: eight minutes. The change record contained the test policy output before and after.</p><p><b>Lesson:</b> a fixed workflow beats guessing.</p></div>

<div class="iv"><p class="q">"A route is not appearing on the neighbour after you applied an export policy. What do you do?"</p><p>Strong answer: confirm the route exists and is active on the source; confirm the policy is applied to the correct protocol and check chain order; run test policy for that prefix and read show policy for route-filter match types and term order; then look at the neighbour with show route detail. Mention longest-match and default reject for OSPF export.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the five questions: exists, active, applied, accepted by test policy, seen by neighbour.</li>
<li>A leftover narrow route-filter (such as /17 exact) blocks routes under it by the longest-match rule.</li>
<li>orlonger leaks specifics; use exact when only a summary is allowed.</li>
<li>Chain order matters: add reject policies first, with delete and re-set.</li>
<li>Fix the policy, not the routes, and verify on the receiving router.</li>
</ul></div>
`,hi:`
<p>Policy ki problems mysterious lagti hain kyunki commit ho jaata hai aur koi shikayat nahi karta. Route bas wahan nahi hota jahan aap umeed karte ho. Ek fixed workflow mystery khatam kar deta hai. Yeh chapter workflow deta hai, phir use module labs ke do troubleshooting tickets par lagata hai.</p>

<h3>Analogy: khoya hua parcel dhoondhna</h3>
<p>Parcel kho jaaye to aap poora desh nahi khangalte. Aap sender ki receipt, phir sorting office, phir delivery van, phir receiver ka darwaza dekhte ho. Parcel ka raasta follow karne se problem ek stage tak simat jaati hai. Route bhi stages se guzarta hai: source, export policy, protocol, import policy, table.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Troubleshooting stages">
<rect x="10" y="60" width="100" height="60" rx="8" fill="#e2e8f0"/><text x="60" y="88" text-anchor="middle" class="svg-ink" font-size="12">1. Route</text><text x="60" y="104" text-anchor="middle" class="svg-ink" font-size="12">hai kya?</text>
<rect x="130" y="60" width="100" height="60" rx="8" fill="#bae6fd"/><text x="180" y="88" text-anchor="middle" class="svg-ink" font-size="12">2. Active</text><text x="180" y="104" text-anchor="middle" class="svg-ink" font-size="12">hai kya?</text>
<rect x="250" y="60" width="100" height="60" rx="8" fill="#fde68a"/><text x="300" y="88" text-anchor="middle" class="svg-ink" font-size="12">3. Policy</text><text x="300" y="104" text-anchor="middle" class="svg-ink" font-size="12">applied?</text>
<rect x="370" y="60" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="420" y="88" text-anchor="middle" class="svg-ink" font-size="12">4. test policy</text><text x="420" y="104" text-anchor="middle" class="svg-ink" font-size="12">accept kare?</text>
<rect x="490" y="60" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="88" text-anchor="middle" class="svg-ink" font-size="12">5. Neighbour</text><text x="560" y="104" text-anchor="middle" class="svg-ink" font-size="12">ko dikha?</text>
<line x1="110" y1="90" x2="130" y2="90" stroke="#64748b" stroke-width="2"/><line x1="230" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><line x1="350" y1="90" x2="370" y2="90" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Pehle fail hone wale stage par ruko. Bug wahin hai.</text>
</svg><p class="cap">Paanch sawal, order mein, lagbhag har policy fault dhoondh dete hain.</p></div>

<h3>Paanch-sawal workflow</h3>
<ol>
<li><b>Kya route originating router par exist karta hai?</b> <code>show route 10.60.200.0/24</code>. Agar missing hai to policy aapki problem nahi.</li>
<li><b>Kya woh active hai?</b> Asterisk dekho. Hidden ya inactive route kabhi export nahi hota.</li>
<li><b>Kya policy applied hai, aur kis order mein?</b> <code>show protocols ospf | display set</code>. Naam maujood hai aur chain order sahi hai, yeh check karo.</li>
<li><b>Kya policy route accept karti hai?</b> <code>test policy NAME PREFIX</code>, phir <code>show policy NAME</code> se har term aur route-filter padho.</li>
<li><b>Neighbour kya dekhta hai?</b> Wahan <code>show route PREFIX detail</code>. Preference, metric, tag check karo.</li>
</ol>

<h3>Ticket 1: ek leak, ek black hole (lab pol-route-filter)</h3>
<p>R1-DC policy DC-OUT se data-centre prefixes OSPF mein export karta hai. Campus router R2 par do tickets khule hain: analytics subnet 10.60.200.0/24 gayab hai, aur lab blocks 10.70.1.0/24 aur 10.70.2.0/24 dikh rahe hain jabki sirf 10.70.0.0/16 summary advertise honi chahiye.</p>
<p><b>Step 1 aur 2.</b> R1 par statics maujood aur active hain (<code>show route protocol static</code>). <b>Step 3.</b> <code>show protocols ospf | display set</code> mein <code>export DC-OUT</code> hai. <b>Step 4.</b> Dry-run chalao:</p>
<pre class="out">lab@R1-DC&gt; test policy DC-OUT 10.0.0.0/8
...
Policy DC-OUT: 4 prefix accepted, 7 prefix rejected

lab@R1-DC&gt; show policy DC-OUT
Policy DC-OUT:
    Term DC:
        from proto Static
        from     10.60.0.0/16 orlonger
        <span class="hl">from     10.60.128.0/17 exact</span>
        then     accept
    Term LABS:
        from proto Static
        <span class="hl">from     10.70.0.0/16 orlonger</span>
        then     accept
    Term LAST:
        then     reject</pre>
<p><b>Diagnosis A.</b> 10.60.200.0/24 10.60.128.0/17 (128 se 255) ke andar hai. Sabse lamba covering route-filter /17 hai jiska match type exact hai, aur /24 exactly woh /17 nahi hai. Term match nahi karta, aur /16 orlonger kabhi use hi nahi hota. Lab ke sawal "kaunsi entry rok rahi hai" ka jawab <b>10.60.128.0/17</b> hai.</p>
<p><b>Fix A.</b> Bacha hua entry hatao:</p>
<pre class="code">lab@R1-DC# delete policy-options policy-statement DC-OUT term DC from route-filter 10.60.128.0/17 exact
lab@R1-DC# commit</pre>
<p><b>Diagnosis B.</b> LABS mein <code>10.70.0.0/16 orlonger</code> hai, jo /16 aur dono /24 statics accept karta hai. Requirement sirf summary hai, isliye type <code>exact</code> hona chahiye.</p>
<pre class="code">lab@R1-DC# delete policy-options policy-statement DC-OUT term LABS from route-filter 10.70.0.0/16 orlonger
lab@R1-DC# set policy-options policy-statement DC-OUT term LABS from route-filter 10.70.0.0/16 exact
lab@R1-DC# commit and-quit</pre>
<p>R2 par OSPF refresh hone ka wait karo aur confirm karo: 10.60.5.0/24 aur 10.60.200.0/24 OSPF/150 ke roop mein present, 10.70.0.0/16 present, 10.70.1.0/24 aur 10.70.2.0/24 gayab. R1 ke statics ko haath nahi lagana: aapne policy theek ki, routing nahi.</p>

<h3>Ticket 2: block jo kuch nahi karta (lab pol-chain)</h3>
<p>R1 policy STATICS se saare statics export karta hai, 192.168.99.0/24 bhi. Security chahti hai ki use chhupaya jaaye, aur har exported route par tag 300 lage.</p>
<ol>
<li>NO-MGMT banao: <code>from route-filter 192.168.99.0/24 exact</code>, <code>then reject</code>.</li>
<li>SET-TAG banao: ek term, <code>then tag 300</code>, na accept na reject.</li>
<li>Chain dobara banao: <code>delete protocols ospf export</code> phir <code>set protocols ospf export [ NO-MGMT SET-TAG STATICS ]</code>.</li>
</ol>
<p>Agar sirf <code>set protocols ospf export NO-MGMT</code> karoge to order [ STATICS NO-MGMT ] ban jaata hai aur block kabhi nahi chalta. R2 par verify karo:</p>
<pre class="out">lab@R2&gt; show route protocol ospf | match 172.21
172.21.1.0/24      *[OSPF/150] 00:01:10, metric 0, tag 300
172.21.2.0/24      *[OSPF/150] 00:01:10, metric 0, tag 300

lab@R2&gt; show route 192.168.99.0/24
(koi output nahi: route present nahi hai)</pre>
<p>Aakhir mein, <code>test policy SET-TAG 192.168.99.0/24</code> <b>1</b> accepted batata hai jabki SET-TAG mein accept nahi hai. Yeh test-policy ka default-accept behaviour hai, yeh saboot nahi ki SET-TAG akela kuch export karega.</p>

<h3>Doosre classic faults aur unki pehchan</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Commit ke baad koi asar nahi</td><td>Policy protocol par apply nahi hui</td><td>show protocols ospf</td></tr>
<tr><td>Sab leak ho gaya</td><td>from ke bina term, ya block se pehle accept</td><td>show policy NAME</td></tr>
<tr><td>Kuch export nahi hua</td><td>Sirf modifying actions, isliye protocol default reject lagta hai</td><td>accept jodo, test karo</td></tr>
<tr><td>Route missing, policy sahi lagti hai</td><td>Route active nahi ya hidden hai</td><td>show route PREFIX hidden</td></tr>
<tr><td>Galat preference ya metric</td><td>Chain mein pehle ki koi aur policy</td><td>chain left se right padho</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Policy ki jagah routes theek karna. Dono tickets mein static routes sahi hain aur rehne chahiye. Static route delete karke use "chhupana" router ki apni reachability hata deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar sawal mein route-filter set aur missing route ho to pehle sabse lamba covering prefix dhoondo. Agar chain ho to left se right padho aur pehle terminating action par ruko.</p></div>

<div class="scn"><h4>Friday 6 baje: analytics team connect nahi kar pa rahi</h4><p>Naya analytics subnet 10.60.200.0/24 live hua. Campus wahan tak nahi pahunch pa raha tha. On-call engineer ne pehle campus router se ping kiya (fail, route nahi). Phir DC router par paanch sawal chalaye: route exist karta hai, active hai, policy applied hai, phir test policy ne bataya ki 10.60.200.0/24 reject ho raha hai. <code>show policy</code> mein purane project ke liye bana /17 exact entry bacha hua mila. Usne use hataya, commit kiya, aur route 30 seconds mein R2 par aa gaya. Kul samay: aath minute. Change record mein test policy ka before aur after output tha.</p><p><b>Lesson:</b> fixed workflow andaaze se behtar hai.</p></div>

<div class="iv"><p class="q">"Export policy apply karne ke baad route neighbour par nahi dikh raha. Kya karoge?"</p><p>Strong answer: confirm karo ki route source par exist karta hai aur active hai; confirm karo ki policy sahi protocol par applied hai aur chain order check karo; us prefix ke liye test policy chalao aur route-filter match types aur term order ke liye show policy padho; phir neighbour par show route detail dekho. Longest-match aur OSPF export ka default reject mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch sawal follow karo: exists, active, applied, test policy se accepted, neighbour ko dikha.</li>
<li>Bacha hua narrow route-filter (jaise /17 exact) longest-match rule se apne neeche ke routes block karta hai.</li>
<li>orlonger specifics leak karta hai; sirf summary allowed ho to exact use karo.</li>
<li>Chain order matter karta hai: reject policies pehle rakho, delete aur re-set se.</li>
<li>Policy theek karo, routes nahi, aur receiving router par verify karo.</li>
</ul></div>
`}};export{e as default};