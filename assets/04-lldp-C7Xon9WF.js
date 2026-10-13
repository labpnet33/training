var e={id:`lldp`,h:{en:`LLDP: how neighbours introduce themselves`,hi:`LLDP: neighbours apna parichay kaise dete hain`},body:{en:`
<p>Before a phone can be told anything, the switch and the phone must hear each other. <b>LLDP</b> (Link Layer Discovery Protocol, IEEE 802.1AB) is the vendor-neutral way for a device to announce itself to the device on the other end of a link. It replaces proprietary protocols (CDP and similar) in multi-vendor networks. LLDP is the foundation; <b>LLDP-MED</b> (next chapter) adds the telephone extras.</p>

<h3>What LLDP sends</h3>
<p>Every LLDP-enabled port sends a small frame to the reserved multicast address 01-80-C2-00-00-0E, at Layer 2, every 30 seconds by default. Bridges never forward it; it travels exactly one hop. It contains <b>TLVs</b> (type-length-value records):</p>
<table class="cmp"><tr><th>TLV</th><th>Mandatory?</th><th>Content</th></tr>
<tr><td>Chassis ID</td><td>yes</td><td>who I am (often the MAC address)</td></tr>
<tr><td>Port ID</td><td>yes</td><td>which port I am speaking from</td></tr>
<tr><td>Time to live</td><td>yes</td><td>seconds the receiver keeps this information</td></tr>
<tr><td>Port description, system name, system description</td><td>no</td><td>human-readable names</td></tr>
<tr><td>System capabilities</td><td>no</td><td>bridge, router, telephone...</td></tr>
<tr><td>Management address</td><td>no</td><td>IP address for management</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="LLDP announcements">
<rect x="30" y="50" width="150" height="60" rx="10" fill="#bae6fd"/><text x="105" y="76" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="105" y="94" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1</text>
<rect x="460" y="50" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="535" y="76" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="535" y="94" text-anchor="middle" class="svg-muted" font-size="11">eth0</text>
<line x1="180" y1="70" x2="460" y2="70" stroke="#2563eb" stroke-width="2"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">LLDPDU every 30 s: chassis, port, TTL</text>
<line x1="460" y1="92" x2="180" y2="92" stroke="#16a34a" stroke-width="2"/><text x="320" y="112" text-anchor="middle" class="svg-accent" font-size="12">LLDPDU: chassis, port, name, capabilities</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="11">neighbour kept for TTL = interval x hold multiplier = 120 s</text>
</svg><p class="cap">LLDP is local: one hop, both directions, no replies.</p></div>

<h3>Timers</h3>
<table class="cmp"><tr><th>Setting</th><th>Default</th><th>Notes</th></tr>
<tr><td><code>advertisement-interval</code></td><td>30 s</td><td>how often LLDPDUs are sent</td></tr>
<tr><td><code>hold-multiplier</code></td><td>4</td><td>TTL = interval x multiplier = 120 s</td></tr>
<tr><td><code>transmit-delay</code></td><td>2 s</td><td>minimum gap between triggered updates</td></tr></table>
<p>The lab output shows <b>Time to live: 120</b>, which is exactly 30 x 4. If a neighbour goes silent, its entry disappears after that TTL.</p>

<h3>Configuration</h3>
<pre class="code">set protocols lldp interface all
set protocols lldp interface ge-0/0/20 disable        <span class="c">! no LLDP toward a router or untrusted port</span>
set protocols lldp advertisement-interval 30
set protocols lldp hold-multiplier 4</pre>

<h3>Real output: the neighbour table</h3>
<pre class="out">lab@ACC1&gt; show lldp neighbors
Local Interface    Parent Interface    Chassis Id          Port info          System Name
ge-0/0/1           -                   00:50:df:3b:4b:00   eth0               PHONE1
ge-0/0/2           -                   00:50:de:3b:49:00   eth0               PHONE2</pre>
<p>This one-line-per-neighbour view answers three questions: who is on which port, what is its MAC, and what does it call itself. It is the fastest way to find which jack a phone is plugged into, and to prove that LLDP works in both directions: if a phone is missing here, the phone did not speak LLDP or LLDP is disabled on that port.</p>
<pre class="out">lab@ACC1&gt; show lldp neighbors interface ge-0/0/1
LLDP Neighbor Information:
Local Information:
Local Interface    : ge-0/0/1
Local Port ID      : 501
Neighbour Information:
Chassis type       : Mac address
Chassis ID         : 00:50:df:3b:4b:00
Port description   : eth0
System name        : PHONE1
System Description : NK-OS IP phone (simulated endpoint)
System capabilities
        Supported: Bridge Telephone
        Enabled  : Bridge Telephone</pre>
<p>The system capabilities line says <b>Telephone</b>: the neighbour is an IP phone. The Time mark and age lines are not shown here because they change on every run.</p>

<h3>Why LLDP matters beyond phones</h3>
<ul>
<li>Documentation and troubleshooting: discover who is connected to which port without visiting the closet.</li>
<li>Multi-vendor interoperability: many vendors do not run each other's proprietary protocols.</li>
<li>Foundation for LLDP-MED, PoE power negotiation and location services.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Enabling LLDP only on the switch and not on the phone (many phones have it enabled by default; check). Disabling LLDP on an access port for "security" and then wondering why the phone loses its VLAN. Expecting LLDP to cross a switch or a router: it never does.</p></div>
<div class="exam"><p><b>Exam trap.</b> LLDP is IEEE 802.1AB, vendor-neutral, sent every 30 s with a hold multiplier of 4. The three mandatory TLVs are chassis ID, port ID and TTL. LLDP is not routed or forwarded.</p></div>

<div class="scn"><h4>Finding the jack in 10 seconds</h4><p>A user phoned that his phone had no dial tone. The cabling record was wrong. The engineer ran <code>show lldp neighbors</code> on the closet switch and found the phone's name on ge-0/0/17, while the label said ge-0/0/7. A patch had been swapped. Fixed in a minute without opening the closet.</p><p><b>Lesson:</b> LLDP gives you a live port map; trust it more than a spreadsheet.</p></div>

<div class="iv"><p class="q">"What is LLDP and how is it different from CDP?"</p><p>LLDP is the IEEE 802.1AB standard for neighbour discovery, vendor-neutral, sending chassis ID, port ID, TTL and optional TLVs to a reserved multicast address every 30 seconds, one hop only. CDP is Cisco-proprietary. In a multi-vendor network LLDP is the common language, and LLDP-MED extends it for IP phones.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LLDP (802.1AB) announces identity to the neighbour; one hop; vendor-neutral.</li>
<li>Defaults: 30 s interval, hold multiplier 4, TTL 120 s.</li>
<li>Mandatory TLVs: chassis ID, port ID, TTL.</li>
<li><code>show lldp neighbors</code> maps phones to ports.</li>
<li>LLDP must run on the port for LLDP-MED to work.</li>
</ul></div>
`,hi:`
<p>Phone ko kuch batane se pehle switch aur phone ko ek doosre ko sunna padta hai. <b>LLDP</b> (Link Layer Discovery Protocol, IEEE 802.1AB) vendor-neutral tareeka hai jisse device link ke doosre sire wale device ko apna parichay deta hai. Multi-vendor networks mein yeh proprietary protocols (CDP jaise) ki jagah leta hai. LLDP buniyaad hai; <b>LLDP-MED</b> (agla chapter) telephone ke extras jodta hai.</p>

<h3>LLDP kya bhejta hai</h3>
<p>Har LLDP-enabled port reserved multicast address 01-80-C2-00-00-0E par Layer 2 par chhota frame bhejta hai, default mein har 30 second. Bridges use kabhi forward nahi karte; yeh sirf ek hop jaata hai. Isme <b>TLVs</b> (type-length-value records) hote hain:</p>
<table class="cmp"><tr><th>TLV</th><th>Mandatory?</th><th>Content</th></tr>
<tr><td>Chassis ID</td><td>haan</td><td>main kaun hoon (aksar MAC address)</td></tr>
<tr><td>Port ID</td><td>haan</td><td>main kaunse port se bol raha hoon</td></tr>
<tr><td>Time to live</td><td>haan</td><td>receiver yeh information kitne second rakhe</td></tr>
<tr><td>Port description, system name, system description</td><td>nahi</td><td>insaan ke padhne wale naam</td></tr>
<tr><td>System capabilities</td><td>nahi</td><td>bridge, router, telephone...</td></tr>
<tr><td>Management address</td><td>nahi</td><td>management ke liye IP address</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="LLDP announcements">
<rect x="30" y="50" width="150" height="60" rx="10" fill="#bae6fd"/><text x="105" y="76" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="105" y="94" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1</text>
<rect x="460" y="50" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="535" y="76" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="535" y="94" text-anchor="middle" class="svg-muted" font-size="11">eth0</text>
<line x1="180" y1="70" x2="460" y2="70" stroke="#2563eb" stroke-width="2"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">LLDPDU har 30 s: chassis, port, TTL</text>
<line x1="460" y1="92" x2="180" y2="92" stroke="#16a34a" stroke-width="2"/><text x="320" y="112" text-anchor="middle" class="svg-accent" font-size="12">LLDPDU: chassis, port, name, capabilities</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="11">neighbour TTL tak rehta hai = interval x hold multiplier = 120 s</text>
</svg><p class="cap">LLDP local hai: ek hop, dono directions, koi reply nahi.</p></div>

<h3>Timers</h3>
<table class="cmp"><tr><th>Setting</th><th>Default</th><th>Notes</th></tr>
<tr><td><code>advertisement-interval</code></td><td>30 s</td><td>LLDPDUs kitni baar bheje jaate hain</td></tr>
<tr><td><code>hold-multiplier</code></td><td>4</td><td>TTL = interval x multiplier = 120 s</td></tr>
<tr><td><code>transmit-delay</code></td><td>2 s</td><td>triggered updates ke beech minimum gap</td></tr></table>
<p>Lab output mein <b>Time to live: 120</b> dikhta hai, jo bilkul 30 x 4 hai. Neighbour chup ho jaaye to uski entry us TTL ke baad gaayab ho jaati hai.</p>

<h3>Configuration</h3>
<pre class="code">set protocols lldp interface all
set protocols lldp interface ge-0/0/20 disable        <span class="c">! router ya untrusted port ki taraf LLDP nahi</span>
set protocols lldp advertisement-interval 30
set protocols lldp hold-multiplier 4</pre>

<h3>Asli output: neighbour table</h3>
<pre class="out">lab@ACC1&gt; show lldp neighbors
Local Interface    Parent Interface    Chassis Id          Port info          System Name
ge-0/0/1           -                   00:50:df:3b:4b:00   eth0               PHONE1
ge-0/0/2           -                   00:50:de:3b:49:00   eth0               PHONE2</pre>
<p>Har neighbour ki ek line teen sawaalon ka jawab deti hai: kaunsa port par kaun hai, uska MAC kya hai, aur woh apne ko kya kehta hai. Phone kis jack mein laga hai yeh pata karne ka sabse tez tareeka hai, aur LLDP dono directions mein chalta hai yeh sabit karne ka bhi: phone yahan na ho to phone ne LLDP nahi bola ya us port par LLDP disabled hai.</p>
<pre class="out">lab@ACC1&gt; show lldp neighbors interface ge-0/0/1
LLDP Neighbor Information:
Local Information:
Local Interface    : ge-0/0/1
Local Port ID      : 501
Neighbour Information:
Chassis type       : Mac address
Chassis ID         : 00:50:df:3b:4b:00
Port description   : eth0
System name        : PHONE1
System Description : NK-OS IP phone (simulated endpoint)
System capabilities
        Supported: Bridge Telephone
        Enabled  : Bridge Telephone</pre>
<p>System capabilities line <b>Telephone</b> kehti hai: neighbour IP phone hai. Time mark aur age lines yahan nahi dikhayi kyunki woh har run mein badalti hain.</p>

<h3>Phones se aage LLDP kyun zaroori hai</h3>
<ul>
<li>Documentation aur troubleshooting: closet gaye bina pata karo kaun kis port par juda hai.</li>
<li>Multi-vendor interoperability: kai vendors ek doosre ke proprietary protocols nahi chalate.</li>
<li>LLDP-MED, PoE power negotiation aur location services ki buniyaad.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> LLDP sirf switch par enable karna aur phone par nahi (kai phones mein default enabled hota hai; check karo). "Security" ke naam par access port par LLDP disable karna aur phir hairan hona ki phone VLAN kyun kho deta hai. LLDP se switch ya router paar karne ki ummeed: woh kabhi nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> LLDP IEEE 802.1AB hai, vendor-neutral, har 30 s hold multiplier 4 ke saath. Teen mandatory TLVs chassis ID, port ID aur TTL hain. LLDP route ya forward nahi hota.</p></div>

<div class="scn"><h4>10 second mein jack dhoondhna</h4><p>Ek user ne phone kiya ki uske phone par dial tone nahi hai. Cabling record galat tha. Engineer ne closet switch par <code>show lldp neighbors</code> chalaya aur phone ka naam ge-0/0/17 par mila, jabki label ge-0/0/7 kehta tha. Ek patch badal gaya tha. Closet khole bina ek minute mein theek.</p><p><b>Lesson:</b> LLDP live port map deta hai; spreadsheet se zyada us par bharosa karo.</p></div>

<div class="iv"><p class="q">"LLDP kya hai aur CDP se kaise alag hai?"</p><p>LLDP neighbour discovery ka IEEE 802.1AB standard hai, vendor-neutral, jo chassis ID, port ID, TTL aur optional TLVs reserved multicast address par har 30 second mein, sirf ek hop, bhejta hai. CDP Cisco-proprietary hai. Multi-vendor network mein LLDP common bhasha hai, aur LLDP-MED use IP phones ke liye extend karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LLDP (802.1AB) neighbour ko pehchaan batata hai; ek hop; vendor-neutral.</li>
<li>Defaults: 30 s interval, hold multiplier 4, TTL 120 s.</li>
<li>Mandatory TLVs: chassis ID, port ID, TTL.</li>
<li><code>show lldp neighbors</code> phones ko ports se map karta hai.</li>
<li>LLDP-MED ke liye port par LLDP chalna zaroori hai.</li>
</ul></div>
`}};export{e as default};