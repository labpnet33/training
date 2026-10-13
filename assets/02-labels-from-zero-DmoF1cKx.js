var e={id:`labels-from-zero`,h:{en:`MPLS labels from zero: push, swap, pop`,hi:`MPLS labels zero se: push, swap, pop`},body:{en:`
<p>You do not need to be an MPLS expert for this track, but you must understand three words: <b>push</b>, <b>swap</b> and <b>pop</b>. Everything in segment routing is a clever way of deciding which labels to push.</p>

<h3>What a label is</h3>
<p>A <b>label</b> is a 20-bit number placed between the Ethernet header and the IP header, in a 4-byte <b>MPLS shim</b>. The shim also holds three traffic-class bits, a bottom-of-stack bit (1 on the last label) and a TTL. A packet may carry several labels, called a <b>label stack</b>. Routers look only at the <b>top</b> label.</p>
<table class="cmp"><tr><th>Operation</th><th>What the router does</th><th>Who does it</th></tr>
<tr><td><b>push</b></td><td>Adds a label on top of the stack</td><td>Ingress edge router (PE)</td></tr>
<tr><td><b>swap</b></td><td>Replaces the top label with another</td><td>Transit routers (P)</td></tr>
<tr><td><b>pop</b></td><td>Removes the top label</td><td>The router before the last hop, or the last hop</td></tr></table>

<h3>A walk through the ring</h3>
<p>Our core is a ring of five routers: PE1, P1, P2, P3, PE2. PE means provider edge (faces customers), P means provider core. A packet from PE1 to the loopback of PE2 (10.0.255.5) travels PE1, P1, PE2.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Push swap pop along PE1 P1 PE2">
<rect x="20" y="50" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="65" y="77" text-anchor="middle" class="svg-ink" font-size="14">PE1</text>
<rect x="275" y="50" width="90" height="44" rx="8" fill="#bae6fd"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="14">P1</text>
<rect x="530" y="50" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="575" y="77" text-anchor="middle" class="svg-ink" font-size="14">PE2</text>
<line x1="110" y1="72" x2="275" y2="72" stroke="#64748b" stroke-width="2"/><line x1="365" y1="72" x2="530" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="192" y="45" text-anchor="middle" class="svg-accent" font-size="12">push 16005</text><text x="447" y="45" text-anchor="middle" class="svg-accent" font-size="12">pop (penultimate hop)</text>
<text x="192" y="115" text-anchor="middle" class="svg-muted" font-size="12">packet has label 16005</text><text x="447" y="115" text-anchor="middle" class="svg-muted" font-size="12">plain IP packet</text>
</svg><p class="cap">PE1 pushes the label for PE2. P1 is next to PE2, so it removes the label before delivery.</p></div>
<p>The pop one hop early is called <b>penultimate hop popping (PHP)</b>. It saves the last router a lookup: PE2 receives a packet that it can route directly.</p>

<h3>Forwarding tables, not routing tables</h3>
<p>Inside the core the router uses the <b>LFIB</b> (label forwarding information base). Each row says: if the top label is X, send out of interface Y towards next hop Z and do swap, push or pop. On our routers the command is <code>show mpls forwarding-table</code>.</p>
<pre class="out">PE1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
16002      Pop Label  10.0.255.2/32    0             Gi0/1      10.0.12.2
16003      Pop Label  10.0.255.3/32    0             Gi0/2      10.0.13.3
16004      16004      10.0.255.4/32    0             Gi0/1      10.0.12.2
<span class="hl">16005      16005      10.0.255.5/32    0             Gi0/1      10.0.12.2</span></pre>
<p>Read the highlighted line: a packet that arrives with label 16005 leaves on Gi0/1 to 10.0.12.2 with label 16005 (swap with the same number, because every router uses the same label block). A line with <b>Pop Label</b> means the neighbour is the destination, so the label is removed. A line with <b>No Label</b> means the next router cannot accept labels for that prefix, which breaks labelled traffic. You will see this line again and again in troubleshooting.</p>

<div class="eg"><b>Worked example.</b> PE1 wants to reach 10.0.255.4 (P3). The row says outgoing label 16004 via Gi0/1: PE1 sends the packet to P1 with label 16004. P1 swaps to 16004 and forwards towards PE2, then to P3. The number never changes, because the label means "the router with index 4", the same everywhere.</div>

<div class="warn"><b>Common mistake.</b> Reading the Local Label column as the label the router sends. It is the label the router <b>receives</b> for that prefix. The sent label is in the Outgoing Label column.</div>

<div class="exam"><b>Exam trap.</b> The label is only locally significant in classic MPLS (LDP), so labels differ hop by hop. In SR with a shared label block, the same number is used along the whole path. Both are correct; know which one is which.</div>

<div class="scn"><h4>The label that was not there</h4><p>A trainee sees traffic dropping at a P router. The routing table of the P router is perfect. The LFIB row for the destination says No Label. The next router after P had not been configured for MPLS at all. Fixing the next router, not the P router, solved it.</p><p><b>Lesson:</b> No Label points at the neighbour, not at the router where you see it.</p></div>

<div class="iv"><p class="q">"Explain push, swap and pop."</p><p>The ingress edge pushes a label for the egress router, transit routers swap the top label according to their LFIB, and the penultimate hop pops it so the egress router only does a normal IP lookup. Mention PHP and that the stack can hold several labels, for example a transport label and a VPN label.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A label stack sits between the Ethernet and IP headers; routers act on the top label.</li>
<li>PE pushes, P swaps, the penultimate hop pops.</li>
<li>The LFIB (show mpls forwarding-table) is the table to read.</li>
<li>Pop Label means the neighbour is the destination; No Label means the neighbour cannot take labelled traffic.</li>
</ul></div>
`,hi:`
<p>Is track ke liye aapko MPLS expert hona zaroori nahi, par teen words samajhna zaroori hai: <b>push</b>, <b>swap</b> aur <b>pop</b>. Segment routing mein sab kuch yeh tay karne ka smart tareeka hai ki kaun se labels push karne hain.</p>

<h3>Label kya hota hai</h3>
<p><b>Label</b> 20-bit number hai jo Ethernet header aur IP header ke beech 4-byte <b>MPLS shim</b> mein rakha jaata hai. Shim mein teen traffic-class bits, ek bottom-of-stack bit (aakhri label par 1) aur ek TTL bhi hota hai. Ek packet kai labels le ja sakta hai, jise <b>label stack</b> kehte hain. Routers sirf <b>sabse upar</b> wala label dekhte hain.</p>
<table class="cmp"><tr><th>Operation</th><th>Router kya karta hai</th><th>Kaun karta hai</th></tr>
<tr><td><b>push</b></td><td>Stack ke upar ek label jodta hai</td><td>Ingress edge router (PE)</td></tr>
<tr><td><b>swap</b></td><td>Top label ko doosre se badalta hai</td><td>Transit routers (P)</td></tr>
<tr><td><b>pop</b></td><td>Top label hatata hai</td><td>Aakhri hop se pehle wala router, ya aakhri hop</td></tr></table>

<h3>Ring mein ek walk-through</h3>
<p>Hamara core paanch routers ki ring hai: PE1, P1, P2, P3, PE2. PE matlab provider edge (customers ki taraf), P matlab provider core. PE1 se PE2 ke loopback (10.0.255.5) tak packet PE1, P1, PE2 se guzarta hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Push swap pop along PE1 P1 PE2">
<rect x="20" y="50" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="65" y="77" text-anchor="middle" class="svg-ink" font-size="14">PE1</text>
<rect x="275" y="50" width="90" height="44" rx="8" fill="#bae6fd"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="14">P1</text>
<rect x="530" y="50" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="575" y="77" text-anchor="middle" class="svg-ink" font-size="14">PE2</text>
<line x1="110" y1="72" x2="275" y2="72" stroke="#64748b" stroke-width="2"/><line x1="365" y1="72" x2="530" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="192" y="45" text-anchor="middle" class="svg-accent" font-size="12">push 16005</text><text x="447" y="45" text-anchor="middle" class="svg-accent" font-size="12">pop (penultimate hop)</text>
<text x="192" y="115" text-anchor="middle" class="svg-muted" font-size="12">packet par label 16005</text><text x="447" y="115" text-anchor="middle" class="svg-muted" font-size="12">plain IP packet</text>
</svg><p class="cap">PE1 PE2 ka label push karta hai. P1 PE2 ke bagal mein hai, isliye delivery se pehle label hata deta hai.</p></div>
<p>Ek hop pehle pop karne ko <b>penultimate hop popping (PHP)</b> kehte hain. Isse aakhri router ka ek lookup bachta hai: PE2 ko aisa packet milta hai jo woh seedha route kar sakta hai.</p>

<h3>Forwarding tables, routing tables nahi</h3>
<p>Core ke andar router <b>LFIB</b> (label forwarding information base) use karta hai. Har row kehti hai: agar top label X hai, to interface Y se next hop Z ko bhejo aur swap, push ya pop karo. Hamare routers par command <code>show mpls forwarding-table</code> hai.</p>
<pre class="out">PE1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
16002      Pop Label  10.0.255.2/32    0             Gi0/1      10.0.12.2
16003      Pop Label  10.0.255.3/32    0             Gi0/2      10.0.13.3
16004      16004      10.0.255.4/32    0             Gi0/1      10.0.12.2
<span class="hl">16005      16005      10.0.255.5/32    0             Gi0/1      10.0.12.2</span></pre>
<p>Highlighted line padho: jo packet label 16005 ke saath aata hai woh Gi0/1 se 10.0.12.2 ko label 16005 ke saath jaata hai (same number se swap, kyunki har router same label block use karta hai). <b>Pop Label</b> wali line ka matlab padosi hi destination hai, isliye label hata diya jaata hai. <b>No Label</b> wali line ka matlab agla router us prefix ke labels accept nahi kar sakta, jisse labelled traffic toot jaata hai. Troubleshooting mein yeh line baar baar milegi.</p>

<div class="eg"><b>Worked example.</b> PE1 ko 10.0.255.4 (P3) tak pahunchna hai. Row kehti hai outgoing label 16004 Gi0/1 se: PE1 packet P1 ko label 16004 ke saath bhejta hai. P1 16004 par swap karke PE2 ki taraf, phir P3 ko forward karta hai. Number kabhi nahi badalta, kyunki label ka matlab hai "index 4 wala router", jo har jagah same hai.</div>

<div class="warn"><b>Common mistake.</b> Local Label column ko woh label samajhna jo router bhejta hai. Yeh woh label hai jo router us prefix ke liye <b>receive</b> karta hai. Bheja jaane wala label Outgoing Label column mein hai.</div>

<div class="exam"><b>Exam trap.</b> Classic MPLS (LDP) mein label sirf locally significant hota hai, isliye hop-by-hop badalta hai. Shared label block wale SR mein poore path par same number use hota hai. Dono sahi hain; jaano kaunsa kaunsa hai.</div>

<div class="scn"><h4>Woh label jo tha hi nahi</h4><p>Ek trainee dekhta hai ki ek P router par traffic drop ho raha hai. P router ki routing table perfect hai. Destination ke liye LFIB row No Label kehti hai. P ke baad wale router par MPLS configure hi nahi tha. P router nahi, agla router theek karne se kaam hua.</p><p><b>Lesson:</b> No Label us router ki taraf ishara karta hai jo padosi hai, jahan aap dekh rahe ho wahan nahi.</p></div>

<div class="iv"><p class="q">"Push, swap aur pop samjhao."</p><p>Ingress edge egress router ke liye label push karta hai, transit routers apni LFIB ke hisaab se top label swap karte hain, aur penultimate hop use pop karta hai taaki egress router sirf normal IP lookup kare. PHP ka zikr karo aur yeh ki stack mein kai labels ho sakte hain, jaise transport label aur VPN label.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Label stack Ethernet aur IP headers ke beech hota hai; routers top label par kaam karte hain.</li>
<li>PE push karta hai, P swap karta hai, penultimate hop pop karta hai.</li>
<li>LFIB (show mpls forwarding-table) padhne wali table hai.</li>
<li>Pop Label matlab padosi destination hai; No Label matlab padosi labelled traffic nahi le sakta.</li>
</ul></div>
`}};export{e as default};