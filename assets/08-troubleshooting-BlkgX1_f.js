var e={id:`isis-troubleshooting`,h:{en:`A troubleshooting workflow for IS-IS`,hi:`IS-IS ke liye troubleshooting workflow`},body:{en:`
<p>A doctor does not guess. She checks symptoms in a fixed order: pulse, temperature, then tests. IS-IS troubleshooting works the same way. Because IS-IS is built in layers (interface, adjacency, database, routes), you move up the layers and stop at the first one that is broken. The commit succeeding tells you nothing: IS-IS accepts almost any configuration and simply does not work.</p>

<h3>The five-step workflow</h3>
<ol>
<li><b>Interface:</b> <code>show isis interface</code>. Is the interface listed, at the right level, with the right metric? If it is missing, check <code>family iso</code> on the unit and the interface under <code>protocols isis</code>.</li>
<li><b>Identity:</b> <code>show isis overview</code>. Is the area correct, is the right level enabled, is the system ID unique?</li>
<li><b>Adjacency:</b> <code>show isis adjacency</code>. Is the neighbour present, at the right level, State Up? If empty, look at authentication, area and level rules, MTU and the link itself.</li>
<li><b>Database:</b> <code>show isis database</code> and <code>detail</code>. Does every router have an LSP? Are the prefixes there?</li>
<li><b>Routes:</b> <code>show isis route</code>, <code>show route protocol isis</code> and a ping. Is the route installed with the expected preference and metric?</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="IS-IS troubleshooting layers">
<rect x="20" y="40" width="108" height="56" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="74" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Interface</text><text x="74" y="84" text-anchor="middle" class="svg-muted" font-size="10">family iso</text>
<rect x="142" y="40" width="108" height="56" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="196" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Identity</text><text x="196" y="84" text-anchor="middle" class="svg-muted" font-size="10">area, level</text>
<rect x="264" y="40" width="108" height="56" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="318" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Adjacency</text><text x="318" y="84" text-anchor="middle" class="svg-muted" font-size="10">auth, MTU</text>
<rect x="386" y="40" width="108" height="56" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="440" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Database</text><text x="440" y="84" text-anchor="middle" class="svg-muted" font-size="10">LSPs</text>
<rect x="508" y="40" width="108" height="56" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="562" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Routes</text><text x="562" y="84" text-anchor="middle" class="svg-muted" font-size="10">metric, pref</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Work left to right, fix the first broken layer</text>
</svg><p class="cap">Never debug the database if the adjacency is missing.</p></div>

<h3>Symptoms and likely causes</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th></tr>
<tr><td>Interface missing in show isis interface</td><td>no family iso on the unit, or not listed under protocols isis</td></tr>
<tr><td>Interface present, adjacency empty</td><td>different area on L1-only links, authentication mismatch, level disabled, no link</td></tr>
<tr><td>Adjacency stuck Initializing</td><td>one-way hellos: auth on one side only, or a unidirectional problem</td></tr>
<tr><td>Adjacency up, routes missing</td><td>prefixes not advertised (loopback not passive/listed), policy, L1 and L2 boundary</td></tr>
<tr><td>Route present, ping fails</td><td>return path, firewall filter, or a missing ISO address on a remote router</td></tr>
<tr><td>Traffic uses a long path</td><td>metrics, reference bandwidth, ATT default instead of a specific route</td></tr></table>

<h3>Worked case: the Pune branch that never came up</h3>
<p>A contractor built IS-IS for three routers: R1 (level 1 only), R2 (L1/L2 border) and R3 (backbone with the server LAN). Every commit succeeded. Nothing worked. Follow the layers.</p>
<p><b>Layers 1 and 2 on R1.</b> The interface is there, but check the identity:</p>
<pre class="out">lab@R1&gt; show isis overview
  Sysid: 0100.3025.5001
  Areaid: <span class="hl">49.0010</span>
  Level 1
    Internal route preference: 15
  Level 2
    <span class="hl">Disabled</span>
lab@R1&gt; show isis adjacency
(empty)</pre>
<p>R1 is in area 49.0010, but the design says 49.0001, which is the area of R2. Two level 1 routers in different areas never form an adjacency. Level 2 is disabled here by design (R1 is L1 only), so it cannot rescue the link. Fix the NET on loopback:</p>
<pre class="code">delete interfaces lo0 unit 0 family iso address 49.0010.0100.3025.5001.00
set interfaces lo0 unit 0 family iso address 49.0001.0100.3025.5001.00</pre>
<p><b>Layer 1 on R2.</b> R2 lists ge-0/0/1.0 under IS-IS but the interface database shows only ge-0/0/0.0 and lo0.0. The missing piece is <code>family iso</code>:</p>
<pre class="code">set interfaces ge-0/0/1 unit 0 family iso</pre>
<p><b>Layer 3 on R2 and R3.</b> R3 uses an MD5 hello key on the level 2 link, spelled in lowercase, but R2's side expects Pune-L2. Re-enter the agreed key on R3:</p>
<pre class="code">set protocols isis interface ge-0/0/0.0 level 2 hello-authentication-key Pune-L2</pre>
<p>After all three fixes, wait for the hello and hold timers, then verify through the layers:</p>
<pre class="out">lab@R2&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             1 Up                   22
ge-0/0/1.0            R3             2 Up                   24
lab@R2&gt; show isis route
Prefix             L Version   Metric Type Interface       NH   Via
10.30.255.1/32     1       2       10 int  ge-0/0/0.0      IPV4 R1
10.30.255.3/32     2       2       10 int  ge-0/0/1.0      IPV4 R3
172.30.3.0/24      2       2       20 int  ge-0/0/1.0      IPV4 R3
lab@R1&gt; ping 172.30.3.10 count 2
2 packets transmitted, 2 packets received, <span class="hl">0% packet loss</span></pre>
<p>R1 reaches the server through the ATT default from R2, as the previous chapter showed. R1 also sits at level 1 with one adjacency, which is the correct picture. Three faults, three different layers, and only the layered method found them without guessing.</p>

<div class="eg"><p><b>Worked example.</b> You see an empty <code>show isis adjacency</code> and R1 shows area 49.0010. Rule: L1 neighbours must share the area; L2 neighbours need not. R1 is L1 only, so the area difference is the cause. Change the NET area on R1 to 49.0001, commit, and wait for the adjacency. You did not touch authentication, because layer 2 already explained the symptom.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing several things at once and not knowing which one fixed it. Another is blaming the other router first. Check your own interface, identity and level before asking the neighbour to change.</p></div>
<div class="exam"><p><b>Exam trap.</b> A successful commit proves nothing. Missing <code>family iso</code> gives no error and no hellos. L1 adjacency needs the same area; L2 adjacency does not. Hello authentication faults hide as an empty adjacency table. Use <code>show isis adjacency detail</code> and the database to confirm.</p></div>

<div class="scn"><h4>Friday evening, empty table</h4><p>A new branch router joined the network and nobody could reach its LAN. The on-call engineer checked the adjacency table first and found it empty, then the interface table, where the uplink was missing. A single line, <code>family iso</code>, was absent from the uplink unit. Five minutes after adding it, the adjacency was Up and the LAN prefix appeared.</p><p><b>Lesson:</b> start at the lowest layer and move up. The cause was in the first table, not the fifth.</p></div>

<div class="iv"><p class="q">"Two IS-IS routers are directly connected and show no adjacency. How do you troubleshoot?"</p><p>I go layer by layer. Interface: is it in show isis interface, with family iso? Identity: area and level in show isis overview, since L1 needs the same area. Adjacency: hello authentication, MTU, and link state. Only after the adjacency is Up do I look at the database and routes. I change one thing at a time and recheck.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: interface, identity, adjacency, database, routes.</li>
<li>Commit success is meaningless; always verify with show commands.</li>
<li>Empty adjacency table: area (L1), authentication, level, family iso.</li>
<li>Fix one fault, verify, then look for the next.</li>
</ul></div>
`,hi:`
<p>Doctor andaza nahi lagati. Wo symptoms ek tay order mein dekhti hai: pulse, temperature, phir tests. IS-IS troubleshooting bhi aise hi chalti hai. IS-IS layers mein bana hai (interface, adjacency, database, routes), isliye aap layers mein upar chadhte ho aur pehli toot hui layer par ruk jaate ho. Commit ka successful hona kuch nahi batata: IS-IS lagbhag har configuration accept kar leta hai aur bas kaam nahi karta.</p>

<h3>Paanch step ka workflow</h3>
<ol>
<li><b>Interface:</b> <code>show isis interface</code>. Kya interface listed hai, sahi level par, sahi metric ke saath? Missing ho to unit par <code>family iso</code> aur <code>protocols isis</code> ke neeche interface check karo.</li>
<li><b>Identity:</b> <code>show isis overview</code>. Area sahi hai, sahi level enabled hai, system ID unique hai?</li>
<li><b>Adjacency:</b> <code>show isis adjacency</code>. Neighbour hai, sahi level par, State Up? Khaali ho to authentication, area aur level rules, MTU aur link dekho.</li>
<li><b>Database:</b> <code>show isis database</code> aur <code>detail</code>. Har router ka LSP hai? Prefixes hain?</li>
<li><b>Routes:</b> <code>show isis route</code>, <code>show route protocol isis</code> aur ping. Route expected preference aur metric ke saath installed hai?</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="IS-IS troubleshooting layers">
<rect x="20" y="40" width="108" height="56" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="74" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Interface</text><text x="74" y="84" text-anchor="middle" class="svg-muted" font-size="10">family iso</text>
<rect x="142" y="40" width="108" height="56" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="196" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Identity</text><text x="196" y="84" text-anchor="middle" class="svg-muted" font-size="10">area, level</text>
<rect x="264" y="40" width="108" height="56" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="318" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Adjacency</text><text x="318" y="84" text-anchor="middle" class="svg-muted" font-size="10">auth, MTU</text>
<rect x="386" y="40" width="108" height="56" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="440" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Database</text><text x="440" y="84" text-anchor="middle" class="svg-muted" font-size="10">LSPs</text>
<rect x="508" y="40" width="108" height="56" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="562" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Routes</text><text x="562" y="84" text-anchor="middle" class="svg-muted" font-size="10">metric, pref</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Baayein se daayein chalo, pehli kharab layer theek karo</text>
</svg><p class="cap">Adjacency missing ho to database debug mat karo.</p></div>

<h3>Symptoms aur sambhavit karan</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Sambhavit karan</th></tr>
<tr><td>show isis interface mein interface missing</td><td>unit par family iso nahi, ya protocols isis ke neeche listed nahi</td></tr>
<tr><td>Interface hai, adjacency khaali</td><td>L1-only links par alag area, authentication mismatch, level disabled, link nahi</td></tr>
<tr><td>Adjacency Initializing mein atki</td><td>one-way hellos: sirf ek taraf auth, ya unidirectional problem</td></tr>
<tr><td>Adjacency up, routes missing</td><td>prefixes advertise nahi (loopback passive/listed nahi), policy, L1 aur L2 boundary</td></tr>
<tr><td>Route hai, ping fail</td><td>return path, firewall filter, ya remote router par ISO address missing</td></tr>
<tr><td>Traffic lambe path se</td><td>metrics, reference bandwidth, specific route ki jagah ATT default</td></tr></table>

<h3>Worked case: Pune branch jo kabhi up nahi hua</h3>
<p>Contractor ne teen routers ke liye IS-IS banaya: R1 (sirf level 1), R2 (L1/L2 border) aur R3 (server LAN wala backbone). Har commit successful tha. Kuch kaam nahi kiya. Layers follow karo.</p>
<p><b>R1 par layers 1 aur 2.</b> Interface maujood hai, par identity check karo:</p>
<pre class="out">lab@R1&gt; show isis overview
  Sysid: 0100.3025.5001
  Areaid: <span class="hl">49.0010</span>
  Level 1
    Internal route preference: 15
  Level 2
    <span class="hl">Disabled</span>
lab@R1&gt; show isis adjacency
(khaali)</pre>
<p>R1 area 49.0010 mein hai, par design mein 49.0001 hai, jo R2 ka area hai. Alag areas ke do level 1 routers kabhi adjacency nahi banate. Yahan level 2 design se disabled hai (R1 sirf L1), isliye wo link ko bacha nahi sakta. Loopback par NET theek karo:</p>
<pre class="code">delete interfaces lo0 unit 0 family iso address 49.0010.0100.3025.5001.00
set interfaces lo0 unit 0 family iso address 49.0001.0100.3025.5001.00</pre>
<p><b>R2 par layer 1.</b> R2 IS-IS ke neeche ge-0/0/1.0 list karta hai par interface database sirf ge-0/0/0.0 aur lo0.0 dikhata hai. Missing cheez <code>family iso</code> hai:</p>
<pre class="code">set interfaces ge-0/0/1 unit 0 family iso</pre>
<p><b>R2 aur R3 par layer 3.</b> R3 level 2 link par MD5 hello key lowercase mein rakhta hai, jabki R2 ki taraf Pune-L2 expected hai. R3 par agreed key dobara enter karo:</p>
<pre class="code">set protocols isis interface ge-0/0/0.0 level 2 hello-authentication-key Pune-L2</pre>
<p>Teeno fixes ke baad hello aur hold timers ka intezaar karo, phir layers mein verify karo:</p>
<pre class="out">lab@R2&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             1 Up                   22
ge-0/0/1.0            R3             2 Up                   24
lab@R2&gt; show isis route
Prefix             L Version   Metric Type Interface       NH   Via
10.30.255.1/32     1       2       10 int  ge-0/0/0.0      IPV4 R1
10.30.255.3/32     2       2       10 int  ge-0/0/1.0      IPV4 R3
172.30.3.0/24      2       2       20 int  ge-0/0/1.0      IPV4 R3
lab@R1&gt; ping 172.30.3.10 count 2
2 packets transmitted, 2 packets received, <span class="hl">0% packet loss</span></pre>
<p>R1 server tak R2 ke ATT default se pahunchta hai, jaise pichhle chapter ne dikhaya. R1 level 1 par ek adjacency ke saath hai, jo sahi picture hai. Teen faults, teen alag layers, aur sirf layered method ne unhe andaza lagaye bina dhoondha.</p>

<div class="eg"><p><b>Worked example.</b> Aapko khaali <code>show isis adjacency</code> dikhta hai aur R1 area 49.0010 dikhata hai. Rule: L1 neighbours ka area same hona chahiye; L2 neighbours ka zaroori nahi. R1 sirf L1 hai, isliye area ka farq hi karan hai. R1 par NET ka area 49.0001 karo, commit karo, adjacency ka intezaar karo. Aapne authentication ko nahi chheda, kyunki layer 2 ne symptom samjha diya.</p></div>

<div class="warn"><p><b>Common mistake.</b> Ek saath kai cheezein badalna aur na jaanna ki kisne fix kiya. Ek aur: pehle doosre router ko doshi maanna. Neighbour se badalne ko kehne se pehle apna interface, identity aur level check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Successful commit kuch saabit nahi karta. <code>family iso</code> missing ho to na error na hellos. L1 adjacency ke liye same area chahiye; L2 ke liye nahi. Hello authentication faults khaali adjacency table ke roop mein chhupte hain. Confirm karne ke liye <code>show isis adjacency detail</code> aur database use karo.</p></div>

<div class="scn"><h4>Friday shaam, khaali table</h4><p>Naya branch router network mein juda aur koi uska LAN reach nahi kar paya. On-call engineer ne pehle adjacency table dekhi, khaali mili, phir interface table, jahan uplink missing tha. Uplink unit par ek line, <code>family iso</code>, nahi thi. Jodne ke paanch minute baad adjacency Up thi aur LAN prefix dikh gaya.</p><p><b>Lesson:</b> sabse neeche ki layer se shuru karo aur upar jao. Karan pehli table mein tha, paanchvi mein nahi.</p></div>

<div class="iv"><p class="q">"Do directly connected IS-IS routers mein adjacency nahi dikhti. Kaise troubleshoot karoge?"</p><p>Main layer by layer jaata hoon. Interface: kya wo show isis interface mein hai, family iso ke saath? Identity: show isis overview mein area aur level, kyunki L1 ko same area chahiye. Adjacency: hello authentication, MTU aur link state. Adjacency Up hone ke baad hi database aur routes dekhta hoon. Ek samay mein ek cheez badalta hoon aur dobara check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: interface, identity, adjacency, database, routes.</li>
<li>Commit success ka matlab kuch nahi; hamesha show commands se verify karo.</li>
<li>Khaali adjacency table: area (L1), authentication, level, family iso.</li>
<li>Ek fault theek karo, verify karo, phir agla dhoondho.</li>
</ul></div>
`}};export{e as default};