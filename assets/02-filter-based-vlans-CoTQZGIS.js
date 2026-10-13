var e={id:`filter-based-vlans`,h:{en:`Filter-based VLANs: the frame decides its own VLAN`,hi:`Filter-based VLANs: frame khud apna VLAN tay karta hai`},body:{en:`
<p>Normally the port decides the VLAN. That is fine until a device moves. A network printer plugged into a trainee-room port lands in the STAFF VLAN, gets a staff address and the print server cannot reach it. You could re-patch it, or you could make the network recognise the printer wherever it appears. A <b>filter-based VLAN</b> does exactly that: a firewall filter looks at the frame and assigns a VLAN by what the frame is.</p>

<h3>How it works</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Filter-based VLAN">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">PRN1 (MAC)</text>
<rect x="230" y="55" width="180" height="80" rx="10" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="14">ACC1 ge-0/0/2</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">input filter PRN-ASSIGN</text>
<rect x="510" y="20" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="13">VLAN PRINTERS 30</text>
<rect x="510" y="130" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="570" y="160" text-anchor="middle" class="svg-ink" font-size="13">VLAN STAFF 10</text>
<line x1="130" y1="95" x2="230" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="80" x2="510" y2="45" stroke="#64748b" stroke-width="2"/><text x="470" y="52" text-anchor="middle" class="svg-accent" font-size="11">match printer</text>
<line x1="410" y1="110" x2="510" y2="155" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="470" y="150" text-anchor="middle" class="svg-muted" font-size="11">others</text>
</svg><p class="cap">The filter runs on ingress and its then vlan action overrides the port VLAN for matching frames.</p></div>
<ul>
<li>The filter lives under <code>firewall family ethernet-switching</code>.</li>
<li>A term matches fields such as <code>source-mac-address</code>, <code>destination-mac-address</code>, <code>ether-type</code>, IP addresses and ports.</li>
<li>The action <code>then vlan NAME</code> (or a VLAN ID) places a matching frame in that VLAN.</li>
<li>The filter is applied <b>input</b> on an interface (or a VLAN). A final term with <code>then accept</code> keeps all other traffic working, because a filter ends with an implicit discard.</li>
<li>The target VLAN must exist, and the uplink must carry it.</li>
</ul>

<h3>The lab: printers on ACC1</h3>
<p>In the mvrp-campus-troubleshoot lab, printer PRN1 (MAC 00:50:aa:44:00:31) plugs into ACC1 ge-0/0/2, which is a STAFF access port. The fix configured and committed on ACC1:</p>
<pre class="code">set vlans PRINTERS vlan-id 30
set firewall family ethernet-switching filter PRN-ASSIGN term printer from source-mac-address 00:50:aa:44:00:31/48
set firewall family ethernet-switching filter PRN-ASSIGN term printer then vlan PRINTERS
set firewall family ethernet-switching filter PRN-ASSIGN term others then accept
set interfaces ge-0/0/2 unit 0 family ethernet-switching filter input PRN-ASSIGN</pre>
<pre class="out">lab@ACC1&gt; show configuration firewall
family ethernet-switching {
    filter PRN-ASSIGN {
        term printer {
            from {
                source-mac-address 00:50:aa:44:00:31/48;
            }
            then {
                vlan PRINTERS;
            }
        }
        term others {
            then {
                accept;
            }
        }
    }
}</pre>
<p>After the commit the printer reaches its VLAN 30 gateway while the staff PC still reaches its VLAN 10 gateway:</p>
<pre class="out">lab@PRN1&gt; ping 10.44.30.1
84 bytes from 10.44.30.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.44.30.1 icmp_seq=2 ttl=64 time=0.600 ms
84 bytes from 10.44.30.1 icmp_seq=3 ttl=64 time=0.700 ms
84 bytes from 10.44.30.1 icmp_seq=4 ttl=64 time=0.800 ms
84 bytes from 10.44.30.1 icmp_seq=5 ttl=64 time=0.900 ms

lab@PC1&gt; ping 10.44.10.1
84 bytes from 10.44.10.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.44.10.1 icmp_seq=2 ttl=64 time=0.600 ms
84 bytes from 10.44.10.1 icmp_seq=3 ttl=64 time=0.700 ms
84 bytes from 10.44.10.1 icmp_seq=4 ttl=64 time=0.800 ms
84 bytes from 10.44.10.1 icmp_seq=5 ttl=64 time=0.900 ms</pre>
<p>Now look at what the switch learned. The printer MAC appears under <b>both</b> VLANs on the same port in this simulation:</p>
<pre class="out">lab@ACC1&gt; show ethernet-switching table
   Vlan                MAC                 MAC         Age    Logical
   name                address             flags              interface
   STAFF               00:50:7f:06:6d:01   D           -      ge-0/0/1.0
   STAFF               00:50:aa:44:00:31   D           -      ge-0/0/2.0
   STAFF               52:54:da:b0:30:00   D           -      ge-0/0/0.0
   PRINTERS            00:50:aa:44:00:31   D           -      ge-0/0/2.0
   PRINTERS            52:54:da:b0:30:00   D           -      ge-0/0/0.0
lab@ACC1&gt; show vlans
default-switch          PRINTERS              30           
                                                           ge-0/0/0.0*
                                                           ge-0/0/2.0*
default-switch          STAFF                 10           
                                                           ge-0/0/0.0*
                                                           ge-0/0/1.0*
                                                           ge-0/0/2.0*</pre>
<p>Read it carefully. ge-0/0/2.0 is still a member of STAFF (its configured access VLAN) and now also shows in PRINTERS because of the filter, and the uplink ge-0/0/0.0 carries both. The traffic result is what matters: the printer's frames are forwarded in VLAN 30. On the exam, remember that the filter overrides the VLAN for matching frames, it does not remove the port from its configured VLAN.</p>

<h3>Design notes</h3>
<ul>
<li><b>MAC is spoofable.</b> A filter on source MAC is a convenience, not security. Pair it with port security or 802.1X if the VLAN gives access to sensitive hosts.</li>
<li><b>Scale.</b> A term per device does not scale. Match a MAC prefix (an OUI such as /24) for a device family, or use dynamic assignment (802.1X VLAN attributes) for large sites.</li>
<li><b>Term order.</b> Terms are evaluated top to bottom, so put specific matches before the catch-all accept.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A vendor's printers all share the OUI 00:50:aa. The term <code>from source-mac-address 00:50:aa:00:00:00/24</code> assigns every present and future printer of that vendor to PRINTERS with one term, wherever it is plugged in.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting the final <code>then accept</code> term. Every non-printer frame then hits the implicit discard and the whole port goes silent. The second mistake is pointing the filter at a VLAN that the uplink does not carry, so the printer is in VLAN 30 locally and nowhere else.</p></div>
<div class="exam"><p><b>Exam trap.</b> The filter is a Layer 2 filter, applied with <code>family ethernet-switching filter input</code>. A Layer 3 filter (<code>family inet</code>) on an irb cannot place frames in a VLAN.</p></div>

<div class="scn"><h4>The printer that followed the cleaners</h4><p>A facilities team kept moving a portable label printer between rooms. Each move meant a ticket to change the port VLAN. With a filter matching the printer MAC on every access port, it worked in any room without a ticket, and the ticket queue lost a whole category.</p><p><b>Lesson:</b> use the filter where the device moves, but keep the port VLAN as the safe default for everything else.</p></div>

<div class="iv"><p class="q">"How can you place a specific device in a VLAN regardless of the port it uses?"</p><p>With a filter-based VLAN: an ethernet-switching firewall filter matches the device (source MAC for example), the term action is then vlan NAME, and the filter is applied input on the access ports. I end the filter with an accept term and check the traffic and show ethernet-switching table.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FBV assigns a VLAN with then vlan inside an ethernet-switching filter applied input.</li>
<li>End the filter with a then accept term.</li>
<li>The VLAN must exist and trunks must carry it.</li>
<li>Source MAC filters are convenient but spoofable.</li>
</ul></div>
`,hi:`
<p>Normally port VLAN tay karta hai. Jab tak device move na ho tab tak theek hai. Trainee-room ke port mein lagaya network printer STAFF VLAN mein pahunchta hai, staff address milta hai aur print server use reach nahi kar paata. Aap use re-patch kar sakte ho, ya network ko printer pehchanna sikha sakte ho chahe woh kahin bhi dikhe. <b>Filter-based VLAN</b> yahi karta hai: firewall filter frame ko dekhta hai aur frame kya hai uske hisaab se VLAN assign karta hai.</p>

<h3>Yeh kaise kaam karta hai</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Filter-based VLAN">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">PRN1 (MAC)</text>
<rect x="230" y="55" width="180" height="80" rx="10" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="14">ACC1 ge-0/0/2</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">input filter PRN-ASSIGN</text>
<rect x="510" y="20" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="13">VLAN PRINTERS 30</text>
<rect x="510" y="130" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="570" y="160" text-anchor="middle" class="svg-ink" font-size="13">VLAN STAFF 10</text>
<line x1="130" y1="95" x2="230" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="80" x2="510" y2="45" stroke="#64748b" stroke-width="2"/><text x="470" y="52" text-anchor="middle" class="svg-accent" font-size="11">printer match</text>
<line x1="410" y1="110" x2="510" y2="155" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="470" y="150" text-anchor="middle" class="svg-muted" font-size="11">baaki sab</text>
</svg><p class="cap">Filter ingress par chalta hai aur uska then vlan action matching frames ke liye port VLAN ko override karta hai.</p></div>
<ul>
<li>Filter <code>firewall family ethernet-switching</code> ke neeche rehta hai.</li>
<li>Term <code>source-mac-address</code>, <code>destination-mac-address</code>, <code>ether-type</code>, IP addresses aur ports jaise fields match karta hai.</li>
<li>Action <code>then vlan NAME</code> (ya VLAN ID) matching frame ko us VLAN mein daalta hai.</li>
<li>Filter interface (ya VLAN) par <b>input</b> lagta hai. Aakhri term <code>then accept</code> baaki traffic chalta rakhta hai, kyunki filter implicit discard par khatam hota hai.</li>
<li>Target VLAN maujood hona chahiye, aur uplink use le jaata ho.</li>
</ul>

<h3>Lab: ACC1 par printers</h3>
<p>mvrp-campus-troubleshoot lab mein printer PRN1 (MAC 00:50:aa:44:00:31) ACC1 ge-0/0/2 mein lagta hai, jo STAFF access port hai. ACC1 par configure aur commit kiya gaya fix:</p>
<pre class="code">set vlans PRINTERS vlan-id 30
set firewall family ethernet-switching filter PRN-ASSIGN term printer from source-mac-address 00:50:aa:44:00:31/48
set firewall family ethernet-switching filter PRN-ASSIGN term printer then vlan PRINTERS
set firewall family ethernet-switching filter PRN-ASSIGN term others then accept
set interfaces ge-0/0/2 unit 0 family ethernet-switching filter input PRN-ASSIGN</pre>
<pre class="out">lab@ACC1&gt; show configuration firewall
family ethernet-switching {
    filter PRN-ASSIGN {
        term printer {
            from {
                source-mac-address 00:50:aa:44:00:31/48;
            }
            then {
                vlan PRINTERS;
            }
        }
        term others {
            then {
                accept;
            }
        }
    }
}</pre>
<p>Commit ke baad printer apne VLAN 30 gateway tak pahunchta hai jabki staff PC apne VLAN 10 gateway tak:</p>
<pre class="out">lab@PRN1&gt; ping 10.44.30.1
84 bytes from 10.44.30.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.44.30.1 icmp_seq=2 ttl=64 time=0.600 ms
84 bytes from 10.44.30.1 icmp_seq=3 ttl=64 time=0.700 ms
84 bytes from 10.44.30.1 icmp_seq=4 ttl=64 time=0.800 ms
84 bytes from 10.44.30.1 icmp_seq=5 ttl=64 time=0.900 ms

lab@PC1&gt; ping 10.44.10.1
84 bytes from 10.44.10.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.44.10.1 icmp_seq=2 ttl=64 time=0.600 ms
84 bytes from 10.44.10.1 icmp_seq=3 ttl=64 time=0.700 ms
84 bytes from 10.44.10.1 icmp_seq=4 ttl=64 time=0.800 ms
84 bytes from 10.44.10.1 icmp_seq=5 ttl=64 time=0.900 ms</pre>
<p>Ab dekho switch ne kya seekha. Is simulation mein printer MAC same port par <b>dono</b> VLANs mein dikhta hai:</p>
<pre class="out">lab@ACC1&gt; show ethernet-switching table
   Vlan                MAC                 MAC         Age    Logical
   name                address             flags              interface
   STAFF               00:50:7f:06:6d:01   D           -      ge-0/0/1.0
   STAFF               00:50:aa:44:00:31   D           -      ge-0/0/2.0
   STAFF               52:54:da:b0:30:00   D           -      ge-0/0/0.0
   PRINTERS            00:50:aa:44:00:31   D           -      ge-0/0/2.0
   PRINTERS            52:54:da:b0:30:00   D           -      ge-0/0/0.0
lab@ACC1&gt; show vlans
default-switch          PRINTERS              30           
                                                           ge-0/0/0.0*
                                                           ge-0/0/2.0*
default-switch          STAFF                 10           
                                                           ge-0/0/0.0*
                                                           ge-0/0/1.0*
                                                           ge-0/0/2.0*</pre>
<p>Dhyaan se padho. ge-0/0/2.0 ab bhi STAFF ka member hai (uska configured access VLAN) aur filter ki wajah se PRINTERS mein bhi dikhta hai, aur uplink ge-0/0/0.0 dono le jaata hai. Traffic ka result important hai: printer ke frames VLAN 30 mein forward hote hain. Exam mein yaad rakho ki filter matching frames ke liye VLAN override karta hai, port ko uske configured VLAN se hata nahi deta.</p>

<h3>Design notes</h3>
<ul>
<li><b>MAC spoof ho sakta hai.</b> Source MAC par filter suvidha hai, security nahi. Agar VLAN sensitive hosts tak access deta hai to port security ya 802.1X saath lagao.</li>
<li><b>Scale.</b> Har device ke liye ek term scale nahi karta. Device family ke liye MAC prefix (OUI jaise /24) match karo, ya bade sites ke liye dynamic assignment (802.1X VLAN attributes) use karo.</li>
<li><b>Term order.</b> Terms upar se neeche evaluate hote hain, isliye specific matches catch-all accept se pehle rakho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek vendor ke saare printers OUI 00:50:aa share karte hain. Term <code>from source-mac-address 00:50:aa:00:00:00/24</code> us vendor ke har maujooda aur future printer ko ek term se PRINTERS mein daal deta hai, chahe woh kahin bhi lage.</p></div>

<div class="warn"><p><b>Common mistake.</b> Aakhri <code>then accept</code> term bhool jaana. Phir har non-printer frame implicit discard se takrata hai aur poora port chup ho jaata hai. Doosri galti: filter ko aise VLAN par point karna jo uplink carry nahi karta, to printer locally VLAN 30 mein hai aur kahin nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Filter Layer 2 filter hai, <code>family ethernet-switching filter input</code> se lagta hai. irb par Layer 3 filter (<code>family inet</code>) frames ko VLAN mein nahi daal sakta.</p></div>

<div class="scn"><h4>Printer jo safai walon ke saath ghoomta tha</h4><p>Facilities team ek portable label printer ko rooms ke beech le jaati rehti thi. Har move par port VLAN badalne ka ticket banta tha. Har access port par printer MAC match karne wale filter se woh kisi bhi room mein bina ticket ke chalne laga, aur ticket queue ki ek poori category khatam ho gayi.</p><p><b>Lesson:</b> filter wahan lagao jahan device move karta hai, lekin baaki sab ke liye port VLAN ko safe default rakho.</p></div>

<div class="iv"><p class="q">"Kisi specific device ko uske port se bina matlab VLAN mein kaise daaloge?"</p><p>Filter-based VLAN se: ethernet-switching firewall filter device ko match karta hai (jaise source MAC), term action then vlan NAME hai, aur filter access ports par input lagta hai. Main filter ko accept term se khatam karta hoon aur traffic aur show ethernet-switching table check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FBV ethernet-switching filter ke andar then vlan se VLAN assign karta hai, input lagta hai.</li>
<li>Filter ko then accept term se khatam karo.</li>
<li>VLAN maujood ho aur trunks use carry karein.</li>
<li>Source MAC filters suvidha hain par spoof ho sakte hain.</li>
</ul></div>
`}};export{e as default};