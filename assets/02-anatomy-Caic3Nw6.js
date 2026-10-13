var e={id:`anatomy`,h:{en:`Anatomy of a filter: terms, order and the implicit discard`,hi:`Filter ki banawat: terms, order aur implicit discard`},body:{en:`
<p>Every Junos firewall filter has the same shape. Learn the shape once and every filter becomes readable. This chapter covers terms, the order of evaluation, how conditions combine, and the rule that causes most lock-outs: the implicit discard.</p>

<h3>Analogy: a sieve with several screens</h3>
<p>Picture a stack of screens. A packet falls through from the top. The first screen it fits decides its fate: caught and thrown away, or let through. If it fits no screen, it falls into a bin at the bottom marked "discard". The screens are terms, and the bin is the implicit discard.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Filter evaluation order">
<rect x="20" y="105" width="100" height="40" rx="6" fill="#e2e8f0"/><text x="70" y="130" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<rect x="170" y="15" width="260" height="50" rx="6" fill="#bae6fd"/><text x="300" y="38" text-anchor="middle" class="svg-ink" font-size="13">Term 1: from matches?</text><text x="300" y="55" text-anchor="middle" class="svg-muted" font-size="12">yes: run then, stop</text>
<rect x="170" y="85" width="260" height="50" rx="6" fill="#ddd6fe"/><text x="300" y="108" text-anchor="middle" class="svg-ink" font-size="13">Term 2: from matches?</text><text x="300" y="125" text-anchor="middle" class="svg-muted" font-size="12">yes: run then, stop</text>
<rect x="170" y="155" width="260" height="50" rx="6" fill="#fde68a"/><text x="300" y="178" text-anchor="middle" class="svg-ink" font-size="13">Term 3: from matches?</text><text x="300" y="195" text-anchor="middle" class="svg-muted" font-size="12">yes: run then, stop</text>
<rect x="470" y="105" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="545" y="130" text-anchor="middle" class="svg-ink" font-size="13">accept / discard</text>
<rect x="170" y="220" width="260" height="32" rx="6" fill="#fecaca"/><text x="300" y="241" text-anchor="middle" class="svg-ink" font-size="13">No match: implicit discard</text>
<line x1="120" y1="125" x2="170" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="430" y1="110" x2="470" y2="125" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">First matching term decides. A packet that matches nothing is dropped.</p></div>

<h3>The shape of a filter</h3>
<pre class="code">firewall {
    family inet {
        filter LAN-EDGE {
            term BLOCK-TFTP {
                from {
                    protocol udp;
                    destination-port tftp;
                }
                then {
                    count tftp-hits;
                    discard;
                }
            }
            term EVERYTHING-ELSE {
                then accept;
            }
        }
    }
}</pre>
<p>The set commands that produce this are one line per statement:</p>
<pre class="code">set firewall family inet filter LAN-EDGE term BLOCK-TFTP from protocol udp
set firewall family inet filter LAN-EDGE term BLOCK-TFTP from destination-port tftp
set firewall family inet filter LAN-EDGE term BLOCK-TFTP then count tftp-hits
set firewall family inet filter LAN-EDGE term BLOCK-TFTP then discard
set firewall family inet filter LAN-EDGE term EVERYTHING-ELSE then accept</pre>
<p>Notice <code>family inet</code>. The same filter name can exist in <code>family inet6</code> for IPv6, as a separate filter. A term without <code>from</code> matches every packet, which is what makes <code>EVERYTHING-ELSE</code> a catch-all.</p>

<h3>How conditions combine</h3>
<ul>
<li>Different condition types in one <code>from</code> are <b>ANDed</b>: <code>protocol udp</code> AND <code>destination-port tftp</code>.</li>
<li>Several values of the same condition are <b>ORed</b>: <code>source-address [ 10.1.0.0/16 10.2.0.0/16 ]</code> means either network.</li>
<li>Terms are evaluated in order; the first term that matches decides.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> A packet arrives: UDP, source 10.40.1.10, destination port 69 (TFTP). Term BLOCK-TFTP: protocol udp matches, destination-port tftp matches, so both conditions are true. The term counts and discards the packet. EVERYTHING-ELSE is never consulted. A TCP packet to port 80 fails the first term (wrong protocol), falls to EVERYTHING-ELSE, and is accepted.</p></div>

<h3>The implicit discard</h3>
<p>If a packet matches no term, Junos discards it. You do not write this rule; it is built in at the end of every filter. This is the opposite of a "default allow" and surprises people who come from other platforms.</p>
<table class="cmp"><tr><th>Your filter</th><th>What happens to a packet that matches nothing</th></tr>
<tr><td>Ends with <code>term ALLOW-REST then accept</code></td><td>Accepted by that term, so the implicit discard is never reached</td></tr>
<tr><td>Has only terms that accept SSH and ICMP</td><td>Discarded by the implicit discard (OSPF, BGP, everything else)</td></tr>
<tr><td>Ends with an explicit <code>then discard</code> term with <code>count</code></td><td>Discarded and counted, which is better because you can see it</td></tr></table>
<p>The implicit discard cannot be counted, because it is not a term. That is why good filters end with an explicit last term such as <code>term DENY then count denied; then discard</code>. You then see numbers in <code>show firewall</code>.</p>

<h3>Term order is policy</h3>
<p>Specific terms go first, general terms last. If you place <code>then accept</code> for all traffic above a block, the block never runs. Junos lets you reorder with <code>insert</code>:</p>
<pre class="code">[edit firewall family inet filter LAN-EDGE]
lab@R1# insert term BLOCK-TFTP before term EVERYTHING-ELSE
lab@R1# show
term BLOCK-TFTP { ... }
term EVERYTHING-ELSE { ... }</pre>
<p>Without <code>insert</code>, new terms added with <code>set</code> go to the end.</p>

<div class="warn"><p><b>Common mistake.</b> Building a filter with only deny terms and no final accept, then applying it to a transit interface. Every other packet is dropped and users lose connectivity. On a routing-protocol-facing interface this also kills OSPF.</p></div>
<div class="exam"><p><b>Exam trap.</b> The question "what happens to a packet that matches no term?" has one answer: it is silently discarded. Also, <code>count</code> alone does not stop evaluation; see the next chapters on actions.</p></div>

<div class="scn"><h4>Everything stopped at 2 am</h4><p>An engineer added a filter to an office router to block one game server port. He wrote one term for the port with a discard and attached it to the LAN interface. At 2 am the overnight backup failed, the VoIP phones went dead and users reported "no internet". The cause was the missing last term: every packet that was not the game port matched nothing and hit the implicit discard. He added <code>term ALLOW-REST then accept</code>, and service returned. The change template now has a line: "Does the filter end with an explicit last term?"</p><p><b>Lesson:</b> the implicit discard is the most common outage cause with filters.</p></div>

<div class="iv"><p class="q">"How are the conditions inside a term combined, and what happens if nothing matches?"</p><p>Strong answer: different match types in a term are ANDed, several values of the same type are ORed; terms are tried top to bottom and the first match decides. A packet matching no term is silently dropped by the implicit discard, so I end filters with an explicit last term, either accept for traffic filters or count and discard for protective filters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A filter is a list of terms under firewall family inet filter NAME.</li>
<li>First match decides; order specific before general.</li>
<li>Different conditions are ANDed; multiple values of one condition are ORed.</li>
<li>The implicit discard drops anything that matches no term and cannot be counted.</li>
<li>End filters with an explicit last term and use insert to reorder terms.</li>
</ul></div>
`,hi:`
<p>Har Junos firewall filter ki shape ek jaisi hoti hai. Shape ek baar seekh lo to har filter padhna aasaan ho jaata hai. Yeh chapter terms, evaluation order, conditions kaise combine hoti hain, aur woh rule cover karta hai jo zyadatar lock-outs ki wajah hai: implicit discard.</p>

<h3>Analogy: kai screens wali chhalni</h3>
<p>Screens ka stack sochiye. Packet upar se girta hai. Jis pehli screen mein woh fit ho, wahi uska fate decide karti hai: pakda gaya aur phenka gaya, ya jaane diya gaya. Agar kisi screen mein fit na ho to neeche "discard" likhe dabbe mein gir jaata hai. Screens terms hain, aur dabba implicit discard.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Filter evaluation order">
<rect x="20" y="105" width="100" height="40" rx="6" fill="#e2e8f0"/><text x="70" y="130" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<rect x="170" y="15" width="260" height="50" rx="6" fill="#bae6fd"/><text x="300" y="38" text-anchor="middle" class="svg-ink" font-size="13">Term 1: from match?</text><text x="300" y="55" text-anchor="middle" class="svg-muted" font-size="12">haan: then chalao, ruko</text>
<rect x="170" y="85" width="260" height="50" rx="6" fill="#ddd6fe"/><text x="300" y="108" text-anchor="middle" class="svg-ink" font-size="13">Term 2: from match?</text><text x="300" y="125" text-anchor="middle" class="svg-muted" font-size="12">haan: then chalao, ruko</text>
<rect x="170" y="155" width="260" height="50" rx="6" fill="#fde68a"/><text x="300" y="178" text-anchor="middle" class="svg-ink" font-size="13">Term 3: from match?</text><text x="300" y="195" text-anchor="middle" class="svg-muted" font-size="12">haan: then chalao, ruko</text>
<rect x="470" y="105" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="545" y="130" text-anchor="middle" class="svg-ink" font-size="13">accept / discard</text>
<rect x="170" y="220" width="260" height="32" rx="6" fill="#fecaca"/><text x="300" y="241" text-anchor="middle" class="svg-ink" font-size="13">Match nahi: implicit discard</text>
<line x1="120" y1="125" x2="170" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="430" y1="110" x2="470" y2="125" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Pehla matching term decide karta hai. Jo packet kuch match na kare woh drop hota hai.</p></div>

<h3>Filter ki shape</h3>
<pre class="code">firewall {
    family inet {
        filter LAN-EDGE {
            term BLOCK-TFTP {
                from {
                    protocol udp;
                    destination-port tftp;
                }
                then {
                    count tftp-hits;
                    discard;
                }
            }
            term EVERYTHING-ELSE {
                then accept;
            }
        }
    }
}</pre>
<p>Isse banane wale set commands ek statement per line hote hain:</p>
<pre class="code">set firewall family inet filter LAN-EDGE term BLOCK-TFTP from protocol udp
set firewall family inet filter LAN-EDGE term BLOCK-TFTP from destination-port tftp
set firewall family inet filter LAN-EDGE term BLOCK-TFTP then count tftp-hits
set firewall family inet filter LAN-EDGE term BLOCK-TFTP then discard
set firewall family inet filter LAN-EDGE term EVERYTHING-ELSE then accept</pre>
<p><code>family inet</code> dhyan se dekho. Wahi filter naam IPv6 ke liye <code>family inet6</code> mein alag filter ke roop mein ho sakta hai. Bina <code>from</code> wala term har packet match karta hai, isi se <code>EVERYTHING-ELSE</code> catch-all banta hai.</p>

<h3>Conditions kaise combine hoti hain</h3>
<ul>
<li>Ek <code>from</code> mein alag condition types <b>AND</b> hote hain: <code>protocol udp</code> AND <code>destination-port tftp</code>.</li>
<li>Ek hi condition ki kai values <b>OR</b> hoti hain: <code>source-address [ 10.1.0.0/16 10.2.0.0/16 ]</code> matlab dono mein se koi bhi network.</li>
<li>Terms order mein evaluate hote hain; pehla matching term decide karta hai.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Packet aaya: UDP, source 10.40.1.10, destination port 69 (TFTP). Term BLOCK-TFTP: protocol udp match, destination-port tftp match, dono conditions true. Term count karke packet discard karta hai. EVERYTHING-ELSE se poocha hi nahi jaata. Port 80 ka TCP packet pehla term fail karta hai (galat protocol), EVERYTHING-ELSE par girta hai, aur accept hota hai.</p></div>

<h3>Implicit discard</h3>
<p>Agar packet kisi term se match na kare to Junos use discard kar deta hai. Yeh rule aap nahi likhte; yeh har filter ke end mein built-in hai. Yeh "default allow" ka ulta hai aur doosre platforms se aane walon ko surprise karta hai.</p>
<table class="cmp"><tr><th>Aapka filter</th><th>Jo packet kuch match na kare uska kya hota hai</th></tr>
<tr><td><code>term ALLOW-REST then accept</code> par khatam</td><td>Us term se accept hota hai, isliye implicit discard tak pahunchta hi nahi</td></tr>
<tr><td>Sirf SSH aur ICMP accept karne wale terms</td><td>Implicit discard se drop (OSPF, BGP, sab kuch)</td></tr>
<tr><td>End mein <code>count</code> ke saath explicit <code>then discard</code> term</td><td>Discard aur count, jo behtar hai kyunki aap dekh sakte ho</td></tr></table>
<p>Implicit discard count nahi ho sakta, kyunki woh term nahi hai. Isliye achhe filters explicit last term se khatam hote hain jaise <code>term DENY then count denied; then discard</code>. Phir <code>show firewall</code> mein numbers dikhte hain.</p>

<h3>Term order hi policy hai</h3>
<p>Specific terms pehle, general terms baad mein. Agar block ke upar sab traffic ke liye <code>then accept</code> rakh diya to block kabhi nahi chalega. Junos <code>insert</code> se reorder karne deta hai:</p>
<pre class="code">[edit firewall family inet filter LAN-EDGE]
lab@R1# insert term BLOCK-TFTP before term EVERYTHING-ELSE
lab@R1# show
term BLOCK-TFTP { ... }
term EVERYTHING-ELSE { ... }</pre>
<p><code>insert</code> ke bina <code>set</code> se jode naye terms end mein jaate hain.</p>

<div class="warn"><p><b>Common mistake.</b> Sirf deny terms wala filter banana, final accept ke bina, aur use transit interface par lagana. Baaki har packet drop hota hai aur users ki connectivity chali jaati hai. Routing-protocol wale interface par yeh OSPF bhi maar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Jo packet kisi term se match na kare uska kya hota hai?" ka ek hi jawab hai: chupchap discard. Yeh bhi: <code>count</code> akela evaluation nahi rokta; actions wale agle chapter dekho.</p></div>

<div class="scn"><h4>Raat 2 baje sab ruk gaya</h4><p>Ek engineer ne office router par ek game server port block karne ke liye filter joda. Usne port ke liye ek term discard ke saath likha aur LAN interface par attach kar diya. Raat 2 baje overnight backup fail hua, VoIP phones band ho gaye aur users ne "internet nahi" bataya. Wajah missing last term thi: game port ke alawa har packet kisi term se match nahi hua aur implicit discard mein gaya. Usne <code>term ALLOW-REST then accept</code> joda, aur service wapas aayi. Ab change template mein ek line hai: "Kya filter explicit last term se khatam hota hai?"</p><p><b>Lesson:</b> filters ke saath outage ka sabse aam kaaran implicit discard hai.</p></div>

<div class="iv"><p class="q">"Term ke andar conditions kaise combine hoti hain, aur kuch match na ho to kya hota hai?"</p><p>Strong answer: term mein alag match types AND hote hain, ek type ki kai values OR; terms upar se neeche try hote hain aur pehla match decide karta hai. Jo packet kisi term se match na kare use implicit discard chupchap drop karta hai, isliye main filters ko explicit last term se khatam karta hoon, traffic filters ke liye accept, protective filters ke liye count aur discard.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filter firewall family inet filter NAME ke neeche terms ki list hai.</li>
<li>Pehla match decide karta hai; specific pehle, general baad mein.</li>
<li>Alag conditions AND hoti hain; ek condition ki kai values OR.</li>
<li>Implicit discard jo kuch match na kare use drop karta hai aur count nahi ho sakta.</li>
<li>Filters ko explicit last term se khatam karo aur terms reorder karne ke liye insert use karo.</li>
</ul></div>
`}};export{e as default};