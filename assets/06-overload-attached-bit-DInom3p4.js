var e={id:`overload-attached-bit`,h:{en:`The overload bit and the attached bit`,hi:`Overload bit aur attached bit`},body:{en:`
<p>Two single-bit flags in an LSP control a surprising amount of behaviour. The <b>overload bit</b> says "do not send transit traffic through me". The <b>attached bit</b> says "I can reach other areas, so use me as a default". They are the standard tools for draining a router and for steering Level 1 routers.</p>

<h3>The overload bit</h3>
<p>When a router sets the overload bit in its LSP, every other router still has it in the database, can still reach prefixes that belong to it, but removes it as a transit node when running SPF. You use it for maintenance: set it, wait for traffic to move away, work on the router, remove it. Configure it with <code>set protocols isis overload</code>. Contrast this with OSPF's max-metric style, where the router is still a valid but very expensive transit.</p>
<p>The Jaipur lab is a ring of four L2 routers: R1, R2, R3, R4. Before maintenance R1 reaches R3's loopback through R2:</p>
<pre class="out">lab@R1&gt; show route 10.7.255.3
10.7.255.3/32      *[IS-IS/18] 00:01:01, metric 20
                    &gt;  to 10.7.12.2 via ge-0/0/0.0</pre>
<p>Now on R2 you configure overload and commit:</p>
<pre class="out">lab@R2&gt; configure
lab@R2# set protocols isis overload
lab@R2# commit and-quit
commit complete</pre>
<p>The effect appears in the database. R2's LSP has a new sequence number and a new attribute:</p>
<pre class="out">lab@R1&gt; show isis database
IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x1   0x65d1     1131 L1 L2
R2.00-00                         <span class="hl">0x2   0x4c9a     1194 L1 L2 Overload</span>
R3.00-00                         0x1   0xb450     1131 L1 L2
R4.00-00                         0x1   0x1fc3     1131 L1 L2
  4 LSPs</pre>
<p>R1 now routes around R2:</p>
<pre class="out">lab@R1&gt; show route 10.7.255.3
10.7.255.3/32      *[IS-IS/18] 00:00:05, <span class="hl">metric 60</span>
                    &gt;  to 10.7.14.4 via ge-0/0/1.0

lab@R1&gt; ping 10.7.255.2 count 2
64 bytes from 10.7.255.2: icmp_seq=0 ttl=64 time=2.300 ms
64 bytes from 10.7.255.2: icmp_seq=1 ttl=64 time=2.600 ms
--- 10.7.255.2 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss</pre>
<p>The path to R3 changed from metric 20 to metric 60 (30 to R4 plus 30 to R3) and goes through R4. The ping to R2's own loopback still works, because the overloaded router is reachable as a destination. Look at the whole table to see what stayed:</p>
<pre class="out">lab@R1&gt; show route protocol isis
10.7.23.0/24       *[IS-IS/18] 00:01:10, metric 20
                    &gt;  to 10.7.12.2 via ge-0/0/0.0
10.7.34.0/24       *[IS-IS/18] 00:00:07, metric 60
                    &gt;  to 10.7.14.4 via ge-0/0/1.0
10.7.255.2/32      *[IS-IS/18] 00:01:10, metric 10
                    &gt;  to 10.7.12.2 via ge-0/0/0.0
10.7.255.3/32      *[IS-IS/18] 00:00:07, metric 60
                    &gt;  to 10.7.14.4 via ge-0/0/1.0
10.7.255.4/32      *[IS-IS/18] 00:01:10, metric 30
                    &gt;  to 10.7.14.4 via ge-0/0/1.0</pre>
<p>R2's own prefixes (its loopback and the connected R2 to R3 link 10.7.23.0/24) still point through R2, since they are the router's own addresses. Everything that used to pass through R2 now goes the other way.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Overload steers traffic around R2">
<circle cx="120" cy="60" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="120" y="64" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="360" cy="60" r="24" fill="#fecaca" stroke="#dc2626" stroke-width="2"/><text x="360" y="64" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="360" y="30" text-anchor="middle" class="svg-ink" font-size="12">overload</text>
<circle cx="520" cy="150" r="22" fill="#fde68a" stroke="#64748b"/><text x="520" y="154" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<circle cx="240" cy="170" r="22" fill="#fed7aa" stroke="#64748b"/><text x="240" y="174" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="142" y1="60" x2="336" y2="60" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="378" y1="78" x2="504" y2="136" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="136" y1="76" x2="224" y2="154" stroke="#22c55e" stroke-width="3"/>
<line x1="262" y1="170" x2="498" y2="152" stroke="#22c55e" stroke-width="3"/>
</svg><p class="cap">Transit traffic uses the green path through R4; the dashed links to R2 stay up.</p></div>

<h3>The attached bit</h3>
<p>The Attached bit is set in the <b>Level 1 LSP</b> of an L1/L2 router that can reach another area through Level 2. Level 1 routers look for it. In the Nagpur lab:</p>
<pre class="out">lab@R1&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x1   0x3bc9     1140 L1
R2.00-00                         0x1   0xff60     1140 L1 L2 <span class="hl">Attached</span>
R3.00-00                         0x1   0x2f8c     1140 L1 L2 <span class="hl">Attached</span></pre>
<p>R1 therefore holds a default route toward the nearest attached router, as seen in the previous chapter. The overview confirms that the router evaluates the bit: <code>Attached bit evaluation: enabled</code>. A border sets the bit only if it has a Level 2 adjacency to a different area. If R2 loses its link to R4, it stops advertising Attached, and R1 forgets the default via R2. That is a useful automatic failover but also a trap when the L2 adjacency is down for the wrong reason.</p>
<p>Two knobs to know (configuration only, not run in the lab): <code>ignore-attached-bit</code> on a Level 1 router stops it from installing the default, which you use after leaking real routes; <code>suppress-attached-bit</code> on the border stops it from setting the bit at all, for example on a router you do not want to be a default exit.</p>

<div class="eg"><p><b>Worked example.</b> On a Friday you must replace a line card in R2. You set overload at 20:00. In the database R2 is marked Overload, R1 reroutes via R4 with metrics 60 and 30, pings to R2's loopback keep working for management. After the card swap you delete overload and R1 returns to 20.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming overload stops all traffic to the router. It stops only transit. Directly connected prefixes and its loopback stay reachable, and static routes pointing through the router are not affected at all.</p></div>
<div class="exam"><p><b>Exam trap.</b> Overload and the attached bit both live in the LSP. The attached bit is used only by Level 1 routers and is set on L1/L2 borders with a Level 2 adjacency toward another area.</p></div>

<div class="scn"><h4>The router that came back too soon</h4><p>After a reboot an edge router joined the network and attracted traffic before its BGP table and ARP entries were ready, and users saw a minute of drops. The team added <code>overload timeout 300</code> so that it advertises overload for five minutes on start-up and takes transit only when fully ready.</p><p><b>Lesson:</b> set overload automatically on boot for important transit routers.</p></div>

<div class="iv"><p class="q">"How would you take a router out of service in IS-IS with no traffic loss?"</p><p>Set the overload bit, check in the database that neighbours see it and that routes have moved (show isis database, show route), confirm traffic counters have dropped, then perform maintenance. Remove overload afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Overload removes a router as transit but keeps its own prefixes reachable.</li>
<li>The database shows Overload; R1's metric to R3 went from 20 to 60.</li>
<li>Attached is set in the Level 1 LSP of a border with a Level 2 adjacency.</li>
<li>Level 1 routers install a default toward the nearest attached router.</li>
<li>ignore-attached-bit and suppress-attached-bit tune the behaviour.</li>
</ul></div>
`,hi:`
<p>LSP mein do single-bit flags hairaan karne wali maatra mein behaviour control karte hain. <b>Overload bit</b> kehta hai "mere through transit traffic mat bhejo". <b>Attached bit</b> kehta hai "main doosre areas tak pahunch sakta hoon, to mujhe default ke roop mein use karo". Yeh router drain karne aur Level 1 routers ko steer karne ke standard tools hain.</p>

<h3>Overload bit</h3>
<p>Jab router apne LSP mein overload bit set karta hai, to baaki har router ke database mein woh rehta hai, uske apne prefixes tak ab bhi pahunch sakte hain, par SPF chalate waqt use transit node ke roop mein hata dete hain. Maintenance ke liye use karte ho: set karo, traffic hatne ka intezaar karo, router par kaam karo, hata do. <code>set protocols isis overload</code> se configure hota hai. Isse OSPF ke max-metric style se compare karo, jahan router valid par bahut mehnga transit rehta hai.</p>
<p>Jaipur lab chaar L2 routers ki ring hai: R1, R2, R3, R4. Maintenance se pehle R1 R3 ke loopback tak R2 ke through pahunchta hai:</p>
<pre class="out">lab@R1&gt; show route 10.7.255.3
10.7.255.3/32      *[IS-IS/18] 00:01:01, metric 20
                    &gt;  to 10.7.12.2 via ge-0/0/0.0</pre>
<p>Ab R2 par overload configure karke commit karte ho:</p>
<pre class="out">lab@R2&gt; configure
lab@R2# set protocols isis overload
lab@R2# commit and-quit
commit complete</pre>
<p>Asar database mein dikhta hai. R2 ke LSP ka naya sequence number aur naya attribute hai:</p>
<pre class="out">lab@R1&gt; show isis database
IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x1   0x65d1     1131 L1 L2
R2.00-00                         <span class="hl">0x2   0x4c9a     1194 L1 L2 Overload</span>
R3.00-00                         0x1   0xb450     1131 L1 L2
R4.00-00                         0x1   0x1fc3     1131 L1 L2
  4 LSPs</pre>
<p>R1 ab R2 ke bypass se route karta hai:</p>
<pre class="out">lab@R1&gt; show route 10.7.255.3
10.7.255.3/32      *[IS-IS/18] 00:00:05, <span class="hl">metric 60</span>
                    &gt;  to 10.7.14.4 via ge-0/0/1.0

lab@R1&gt; ping 10.7.255.2 count 2
64 bytes from 10.7.255.2: icmp_seq=0 ttl=64 time=2.300 ms
64 bytes from 10.7.255.2: icmp_seq=1 ttl=64 time=2.600 ms
--- 10.7.255.2 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss</pre>
<p>R3 tak path metric 20 se 60 ho gaya (R4 tak 30 aur R3 tak 30) aur R4 ke through jata hai. R2 ke apne loopback ka ping ab bhi chalta hai, kyunki overloaded router destination ke roop mein reachable rehta hai. Poori table dekho ki kya bacha:</p>
<pre class="out">lab@R1&gt; show route protocol isis
10.7.23.0/24       *[IS-IS/18] 00:01:10, metric 20
                    &gt;  to 10.7.12.2 via ge-0/0/0.0
10.7.34.0/24       *[IS-IS/18] 00:00:07, metric 60
                    &gt;  to 10.7.14.4 via ge-0/0/1.0
10.7.255.2/32      *[IS-IS/18] 00:01:10, metric 10
                    &gt;  to 10.7.12.2 via ge-0/0/0.0
10.7.255.3/32      *[IS-IS/18] 00:00:07, metric 60
                    &gt;  to 10.7.14.4 via ge-0/0/1.0
10.7.255.4/32      *[IS-IS/18] 00:01:10, metric 30
                    &gt;  to 10.7.14.4 via ge-0/0/1.0</pre>
<p>R2 ke apne prefixes (uska loopback aur connected R2-R3 link 10.7.23.0/24) ab bhi R2 ke through hain, kyunki woh router ke apne addresses hain. Jo kuch pehle R2 se guzarta tha ab doosri taraf se jata hai.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Overload steers traffic around R2">
<circle cx="120" cy="60" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="120" y="64" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="360" cy="60" r="24" fill="#fecaca" stroke="#dc2626" stroke-width="2"/><text x="360" y="64" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="360" y="30" text-anchor="middle" class="svg-ink" font-size="12">overload</text>
<circle cx="520" cy="150" r="22" fill="#fde68a" stroke="#64748b"/><text x="520" y="154" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<circle cx="240" cy="170" r="22" fill="#fed7aa" stroke="#64748b"/><text x="240" y="174" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="142" y1="60" x2="336" y2="60" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="378" y1="78" x2="504" y2="136" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="136" y1="76" x2="224" y2="154" stroke="#22c55e" stroke-width="3"/>
<line x1="262" y1="170" x2="498" y2="152" stroke="#22c55e" stroke-width="3"/>
</svg><p class="cap">Transit traffic hare path se R4 ke through jata hai; R2 ke dashed links up rehte hain.</p></div>

<h3>Attached bit</h3>
<p>Attached bit us L1/L2 router ke <b>Level 1 LSP</b> mein set hota hai jo Level 2 se doosre area tak pahunch sakta hai. Level 1 routers ise dhoondhte hain. Nagpur lab mein:</p>
<pre class="out">lab@R1&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x1   0x3bc9     1140 L1
R2.00-00                         0x1   0xff60     1140 L1 L2 <span class="hl">Attached</span>
R3.00-00                         0x1   0x2f8c     1140 L1 L2 <span class="hl">Attached</span></pre>
<p>Isliye R1 ke paas sabse nazdeeki attached router ki taraf default route hai, jaisa pichhle chapter mein dekha. Overview confirm karta hai ki router bit ko evaluate karta hai: <code>Attached bit evaluation: enabled</code>. Border bit tabhi set karta hai jab uski kisi doosre area ki taraf Level 2 adjacency ho. Agar R2 apna R4 wala link kho de, to woh Attached advertise karna band kar deta hai, aur R1 R2 wala default bhool jata hai. Yeh upyogi automatic failover hai par jaal bhi hai jab L2 adjacency galat wajah se down ho.</p>
<p>Do knobs jaano (sirf configuration, lab mein nahi chalaye): Level 1 router par <code>ignore-attached-bit</code> use karne se woh default install nahi karta, jo real routes leak karne ke baad use hota hai; border par <code>suppress-attached-bit</code> use bit set karne se rokta hai, jaise us router par jise aap default exit nahi banana chahte.</p>

<div class="eg"><p><b>Worked example.</b> Shukrawar ko R2 ka line card badalna hai. Aap 20:00 baje overload set karte ho. Database mein R2 Overload mark hai, R1 R4 ke through reroute karta hai metrics 60 aur 30 ke saath, R2 ke loopback ka ping management ke liye chalta rehta hai. Card badalne ke baad overload hata dete ho aur R1 wapas 20 par aa jata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki overload router ka saara traffic rok deta hai. Woh sirf transit rokta hai. Directly connected prefixes aur uska loopback reachable rehte hain, aur router ke through jaane wale static routes par koi asar nahi padta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Overload aur attached bit dono LSP mein rehte hain. Attached bit sirf Level 1 routers use karte hain aur woh un L1/L2 borders par set hota hai jinki doosre area ki taraf Level 2 adjacency hai.</p></div>

<div class="scn"><h4>Router jo bahut jaldi wapas aa gaya</h4><p>Reboot ke baad ek edge router network mein shamil hua aur BGP table aur ARP entries ready hone se pehle traffic kheench liya, aur users ne ek minute packet drops dekhe. Team ne <code>overload timeout 300</code> jodha taaki woh start-up par paanch minute overload advertise kare aur poori tarah ready hone par hi transit le.</p><p><b>Lesson:</b> zaroori transit routers par boot par automatic overload set karo.</p></div>

<div class="iv"><p class="q">"IS-IS mein router ko bina traffic loss ke service se kaise nikaloge?"</p><p>Overload bit set karo, database mein check karo ki neighbours ise dekhte hain aur routes shift ho gaye hain (show isis database, show route), confirm karo ki traffic counters gir gaye hain, phir maintenance karo. Baad mein overload hata do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Overload router ko transit se hatata hai par uske apne prefixes reachable rakhta hai.</li>
<li>Database mein Overload dikhta hai; R1 ka R3 tak metric 20 se 60 hua.</li>
<li>Attached Level 2 adjacency wale border ke Level 1 LSP mein set hota hai.</li>
<li>Level 1 routers sabse nazdeeki attached router ki taraf default install karte hain.</li>
<li>ignore-attached-bit aur suppress-attached-bit behaviour tune karte hain.</li>
</ul></div>
`}};export{e as default};