var e={id:`dynamic-nat-pat`,h:{en:`Dynamic NAT and dynamic PAT: interface, pool and PAT pool`,hi:`Dynamic NAT aur dynamic PAT: interface, pool aur PAT pool`},body:{en:`
<p>A car rental counter can work two ways. In the first, every customer gets a whole car for as long as they need it, and when the cars run out the next customer waits. In the second, everyone shares a minibus and gets a numbered seat. The first is <b>dynamic NAT</b>: one mapped address per real host while it is active. The second is <b>dynamic PAT</b>: many hosts share one mapped address, told apart by port numbers. Both are dynamic, which means the translation exists only after the real host sends traffic.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Dynamic NAT versus PAT">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">dynamic NAT: 1 to 1</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">dynamic PAT: many to 1</text>
<rect x="20" y="40" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.10</text>
<rect x="20" y="90" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="75" y="112" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.11</text>
<rect x="20" y="140" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="75" y="162" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.12</text>
<rect x="190" y="40" width="120" height="34" rx="6" fill="#bae6fd"/><text x="250" y="62" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.4</text>
<rect x="190" y="90" width="120" height="34" rx="6" fill="#bae6fd"/><text x="250" y="112" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.5</text>
<rect x="190" y="140" width="120" height="34" rx="6" fill="#fde68a"/><text x="250" y="162" text-anchor="middle" class="svg-ink" font-size="12">pool empty</text>
<line x1="130" y1="57" x2="190" y2="57" stroke="#64748b" stroke-width="2"/><line x1="130" y1="107" x2="190" y2="107" stroke="#64748b" stroke-width="2"/><line x1="130" y1="157" x2="190" y2="157" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<rect x="340" y="40" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="395" y="62" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.10</text>
<rect x="340" y="90" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="395" y="112" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.11</text>
<rect x="340" y="140" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="395" y="162" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.12</text>
<rect x="500" y="90" width="130" height="34" rx="6" fill="#bae6fd"/><text x="565" y="112" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2</text>
<line x1="450" y1="57" x2="500" y2="100" stroke="#64748b" stroke-width="2"/><line x1="450" y1="107" x2="500" y2="107" stroke="#64748b" stroke-width="2"/><line x1="450" y1="157" x2="500" y2="114" stroke="#64748b" stroke-width="2"/>
<text x="565" y="148" text-anchor="middle" class="svg-muted" font-size="12">ports 51544, 51545 ...</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">dynamic NAT runs out of addresses; PAT runs out of ports much later</text>
</svg><p class="cap">Dynamic NAT gives each active host its own address; PAT shares one address by port.</p></div>

<h3>Dynamic PAT on the interface</h3>
<p>This is the rule you built in sec-asa-basics and it is on every lab ASA:</p>
<pre class="code"><span class="c">! Users share the outside interface address</span>
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic interface</pre>
<p>The ASA rewrites source address and source port. It tries to keep the host's original source port when that port is free on the mapped address, and picks another one when it is not. Each mapped address offers roughly 64,000 ports per protocol, and a PAT xlate is removed 30 seconds after its last connection closes (<code>timeout pat-xlate 0:00:30</code>).</p>

<h3>Dynamic PAT to another single address</h3>
<p>If the interface address should stay clean (for example it carries a remote-access VPN), PAT users to a spare public address instead. Either an inline IP or a host object works:</p>
<pre class="code"><span class="c">! PAT to 203.0.113.5 instead of the interface</span>
object network INSIDE-NET
 nat (inside,outside) dynamic 203.0.113.5</pre>
<p>When the mapped value is a <b>single address</b>, the ASA does PAT. When it is a <b>range or subnet</b>, the ASA does dynamic NAT. That one detail decides the behaviour.</p>

<h3>Dynamic NAT with a pool, and the interface fallback</h3>
<pre class="code"><span class="c">! One public address per active host</span>
object network NAT-POOL
 range 203.0.113.4 203.0.113.6
object network INSIDE-NET
 nat (inside,outside) dynamic NAT-POOL interface</pre>
<p>Each active host borrows one address from 203.0.113.4 to .6 and keeps it until the xlate times out (<code>timeout xlate</code>, three hours by default). With only three addresses, the fourth host would fail. The trailing <code>interface</code> keyword adds a <b>fallback</b>: when the pool is exhausted, extra hosts are PATed to the outside interface address. Dynamic NAT is used when an application dislikes port translation, or when a partner filters by a stable source address per host.</p>

<h3>PAT pools: spreading ports across several addresses</h3>
<p>A large campus can exhaust ports on one address, or be rate-limited by a website that sees thousands of users behind one IP. A <b>PAT pool</b> spreads users over several addresses:</p>
<pre class="code"><span class="c">! PAT across .4 to .6, spread round-robin</span>
object network PAT-POOL
 range 203.0.113.4 203.0.113.6
object network INSIDE-NET
 nat (inside,outside) dynamic pat-pool PAT-POOL round-robin</pre>
<ul>
<li><b>round-robin</b>: spreads translations across the pool addresses instead of filling the first address before using the next.</li>
<li><b>extended</b>: makes a PAT slot unique per destination address and port, so the same mapped port can be reused toward different destinations. Capacity grows sharply, at the cost of more memory.</li>
<li><b>block-allocation</b>: gives each host a block of ports at once, which cuts the number of syslog messages dramatically in carrier-style deployments.</li>
</ul>

<h3>Verification</h3>
<pre class="out">NK-ASA# show xlate
3 in use, 41 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:04 timeout 0:00:30</span>
UDP PAT from inside:10.0.1.10/60233 to outside:203.0.113.2/60233 flags ri idle 0:00:12 timeout 0:00:30
ICMP PAT from inside:10.0.1.50/1 to outside:203.0.113.2/1 flags ri idle 0:00:01 timeout 0:00:30</pre>
<p>The flags <code>r</code> (portmap, meaning PAT) and <code>i</code> (dynamic) confirm dynamic PAT. A dynamic NAT entry would read <code>NAT from inside:10.0.1.10 to outside:203.0.113.4 flags i</code>, without a port.</p>

<div class="eg"><p><b>Worked example.</b> 900 users behind interface PAT all visit the same video site on TCP 443. Each needs a unique mapped port toward that one destination, so they use 900 of about 64,000 ports: no problem. But one proxy server opening 70,000 simultaneous connections through one address would exhaust ports. Moving that proxy to a three-address PAT pool triples capacity; adding <code>extended</code> lets ports be reused per destination.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using a range object for what was meant to be PAT. <code>dynamic PUBLIC-RANGE</code> with three addresses is dynamic NAT, not PAT; the fourth concurrent user fails with a "no translation" style drop. Use <code>pat-pool</code> or add the <code>interface</code> fallback.</p></div>

<div class="exam"><p><b>Exam trap.</b> Can an outside host start a connection through dynamic PAT? No. With dynamic NAT, an ACL-permitted connection to the mapped address is possible only while that xlate exists, and the mapping is unpredictable, so it is never a way to publish a server. Publishing always means static NAT or static PAT.</p></div>

<div class="scn"><h4>The payment gateway that saw "too many users"</h4><p>A training company routed 1,200 lab users through interface PAT. A payment gateway started rejecting logins because it rate-limited per source IP. The engineer created a PAT pool of three spare addresses with <code>round-robin</code>, and moved only the lab subnet to it. <code>show xlate</code> showed sessions spread across 203.0.113.4 to .6 and the rejections stopped.</p><p><b>Lesson:</b> PAT pools solve port exhaustion and per-IP limits without giving each host its own address.</p></div>

<div class="iv"><p class="q">"What is the difference between dynamic NAT and dynamic PAT on the ASA?"</p><p>Dynamic NAT maps each active real host to its own address from a pool and fails when the pool is empty unless an interface fallback is set. Dynamic PAT maps many hosts to one address using ports. Mention that a single mapped address means PAT and a range means NAT, and mention PAT pool options round-robin, extended and block-allocation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dynamic rules only translate traffic the real host starts.</li>
<li>Single mapped address = PAT; range or subnet = dynamic NAT.</li>
<li><code>dynamic POOL interface</code> falls back to interface PAT when the pool is exhausted.</li>
<li>PAT pools add capacity; round-robin spreads, extended reuses ports per destination, block-allocation cuts logging.</li>
<li><code>show xlate</code> flags: r = portmap (PAT), i = dynamic, s = static.</li>
</ul></div>
`,hi:`
<p>Car rental counter do tarah se kaam kar sakta hai. Pehle mein, har customer ko jab tak zaroorat ho poori car milti hai, aur cars khatam hone par agla customer intezaar karta hai. Doosre mein, sab ek minibus share karte hain aur har kisi ko numbered seat milti hai. Pehla <b>dynamic NAT</b> hai: active rehne tak har real host ko ek mapped address. Doosra <b>dynamic PAT</b> hai: bahut saare hosts ek mapped address share karte hain, port numbers se pehchane jaate hain. Dono dynamic hain, matlab translation tabhi exist karti hai jab real host traffic bhejta hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Dynamic NAT versus PAT">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">dynamic NAT: 1 se 1</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">dynamic PAT: bahut se 1</text>
<rect x="20" y="40" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.10</text>
<rect x="20" y="90" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="75" y="112" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.11</text>
<rect x="20" y="140" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="75" y="162" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.12</text>
<rect x="190" y="40" width="120" height="34" rx="6" fill="#bae6fd"/><text x="250" y="62" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.4</text>
<rect x="190" y="90" width="120" height="34" rx="6" fill="#bae6fd"/><text x="250" y="112" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.5</text>
<rect x="190" y="140" width="120" height="34" rx="6" fill="#fde68a"/><text x="250" y="162" text-anchor="middle" class="svg-ink" font-size="12">pool khaali</text>
<line x1="130" y1="57" x2="190" y2="57" stroke="#64748b" stroke-width="2"/><line x1="130" y1="107" x2="190" y2="107" stroke="#64748b" stroke-width="2"/><line x1="130" y1="157" x2="190" y2="157" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<rect x="340" y="40" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="395" y="62" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.10</text>
<rect x="340" y="90" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="395" y="112" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.11</text>
<rect x="340" y="140" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="395" y="162" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.12</text>
<rect x="500" y="90" width="130" height="34" rx="6" fill="#bae6fd"/><text x="565" y="112" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2</text>
<line x1="450" y1="57" x2="500" y2="100" stroke="#64748b" stroke-width="2"/><line x1="450" y1="107" x2="500" y2="107" stroke="#64748b" stroke-width="2"/><line x1="450" y1="157" x2="500" y2="114" stroke="#64748b" stroke-width="2"/>
<text x="565" y="148" text-anchor="middle" class="svg-muted" font-size="12">ports 51544, 51545 ...</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">dynamic NAT ke addresses khatam hote hain; PAT ke ports bahut baad mein</text>
</svg><p class="cap">Dynamic NAT har active host ko apna address deta hai; PAT ek address ko port se share karta hai.</p></div>

<h3>Interface par dynamic PAT</h3>
<p>Yeh woh rule hai jo aapne sec-asa-basics mein banayi thi aur har lab ASA par hai:</p>
<pre class="code"><span class="c">! Users outside interface address share karte hain</span>
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic interface</pre>
<p>ASA source address aur source port rewrite karta hai. Woh host ka original source port rakhne ki koshish karta hai jab woh port mapped address par free ho, aur free na ho to koi aur choose karta hai. Har mapped address har protocol ke liye lagbhag 64,000 ports deta hai, aur PAT xlate apne aakhri connection ke band hone ke 30 seconds baad hat jaata hai (<code>timeout pat-xlate 0:00:30</code>).</p>

<h3>Kisi aur single address par dynamic PAT</h3>
<p>Agar interface address saaf rakhna ho (jaise us par remote-access VPN chalta ho), to users ko kisi spare public address par PAT karo. Inline IP ya host object dono chalte hain:</p>
<pre class="code"><span class="c">! Interface ki jagah 203.0.113.5 par PAT</span>
object network INSIDE-NET
 nat (inside,outside) dynamic 203.0.113.5</pre>
<p>Jab mapped value <b>single address</b> ho, ASA PAT karta hai. Jab woh <b>range ya subnet</b> ho, ASA dynamic NAT karta hai. Yahi ek detail behaviour decide karti hai.</p>

<h3>Pool ke saath dynamic NAT, aur interface fallback</h3>
<pre class="code"><span class="c">! Har active host ko ek public address</span>
object network NAT-POOL
 range 203.0.113.4 203.0.113.6
object network INSIDE-NET
 nat (inside,outside) dynamic NAT-POOL interface</pre>
<p>Har active host 203.0.113.4 se .6 mein se ek address udhaar leta hai aur xlate timeout hone tak rakhta hai (<code>timeout xlate</code>, default teen ghante). Sirf teen addresses ke saath chautha host fail hoga. Aakhir ka <code>interface</code> keyword <b>fallback</b> jodta hai: pool khatam hone par extra hosts outside interface address par PAT hote hain. Dynamic NAT tab use hota hai jab kisi application ko port translation pasand na ho, ya partner har host ke stable source address se filter karta ho.</p>

<h3>PAT pools: ports ko kai addresses par failana</h3>
<p>Bada campus ek address ke ports khatam kar sakta hai, ya koi website ek IP ke peeche hazaaron users dekhkar rate-limit kar sakti hai. <b>PAT pool</b> users ko kai addresses par failata hai:</p>
<pre class="code"><span class="c">! .4 se .6 tak PAT, round-robin se faila hua</span>
object network PAT-POOL
 range 203.0.113.4 203.0.113.6
object network INSIDE-NET
 nat (inside,outside) dynamic pat-pool PAT-POOL round-robin</pre>
<ul>
<li><b>round-robin</b>: pehla address bharne ke baad agla use karne ki jagah translations ko pool addresses mein failata hai.</li>
<li><b>extended</b>: PAT slot ko har destination address aur port ke liye unique banata hai, taaki same mapped port alag destinations ki taraf dobara use ho sake. Capacity kaafi badhti hai, zyada memory ki keemat par.</li>
<li><b>block-allocation</b>: har host ko ek saath ports ka block deta hai, jisse carrier-style deployments mein syslog messages bahut kam ho jaate hain.</li>
</ul>

<h3>Verification</h3>
<pre class="out">NK-ASA# show xlate
3 in use, 41 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:04 timeout 0:00:30</span>
UDP PAT from inside:10.0.1.10/60233 to outside:203.0.113.2/60233 flags ri idle 0:00:12 timeout 0:00:30
ICMP PAT from inside:10.0.1.50/1 to outside:203.0.113.2/1 flags ri idle 0:00:01 timeout 0:00:30</pre>
<p>Flags <code>r</code> (portmap, matlab PAT) aur <code>i</code> (dynamic) dynamic PAT confirm karte hain. Dynamic NAT entry aisi dikhegi: <code>NAT from inside:10.0.1.10 to outside:203.0.113.4 flags i</code>, bina port ke.</p>

<div class="eg"><p><b>Worked example.</b> Interface PAT ke peeche 900 users sab same video site par TCP 443 visit karte hain. Har ek ko us ek destination ki taraf unique mapped port chahiye, to woh lagbhag 64,000 mein se 900 ports use karte hain: koi problem nahi. Lekin ek proxy server jo ek address se 70,000 simultaneous connections khole, ports khatam kar dega. Us proxy ko teen-address PAT pool par le jaane se capacity teen guna hoti hai; <code>extended</code> jodne se ports har destination ke liye dobara use ho sakte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Jo PAT hona tha uske liye range object use karna. Teen addresses ke saath <code>dynamic PUBLIC-RANGE</code> dynamic NAT hai, PAT nahi; chautha concurrent user "no translation" type drop se fail hota hai. <code>pat-pool</code> use karo ya <code>interface</code> fallback jodo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Kya outside host dynamic PAT ke through connection shuru kar sakta hai? Nahi. Dynamic NAT mein, ACL-permitted connection mapped address par sirf tab possible hai jab tak woh xlate exist kare, aur mapping unpredictable hai, isliye yeh server publish karne ka tarika kabhi nahi hai. Publish karne ka matlab hamesha static NAT ya static PAT hai.</p></div>

<div class="scn"><h4>Payment gateway jise "bahut zyada users" dikhe</h4><p>Ek training company ne 1,200 lab users ko interface PAT se route kiya. Ek payment gateway ne logins reject karna shuru kiya kyunki woh har source IP par rate-limit karta tha. Engineer ne teen spare addresses ka <code>round-robin</code> wala PAT pool banaya, aur sirf lab subnet ko us par shift kiya. <code>show xlate</code> ne sessions ko 203.0.113.4 se .6 par faila hua dikhaya aur rejections ruk gaye.</p><p><b>Seekh:</b> PAT pools har host ko apna address diye bina port exhaustion aur per-IP limits solve karte hain.</p></div>

<div class="iv"><p class="q">"ASA par dynamic NAT aur dynamic PAT mein kya fark hai?"</p><p>Dynamic NAT har active real host ko pool se uska apna address map karta hai aur pool khaali hone par fail hota hai jab tak interface fallback set na ho. Dynamic PAT ports use karke bahut hosts ko ek address par map karta hai. Batao ki single mapped address ka matlab PAT aur range ka matlab NAT hai, aur PAT pool options round-robin, extended aur block-allocation batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dynamic rules sirf woh traffic translate karti hain jo real host shuru kare.</li>
<li>Single mapped address = PAT; range ya subnet = dynamic NAT.</li>
<li><code>dynamic POOL interface</code> pool khatam hone par interface PAT par fallback karta hai.</li>
<li>PAT pools capacity badhate hain; round-robin failata hai, extended har destination ke liye ports dobara use karta hai, block-allocation logging kam karta hai.</li>
<li><code>show xlate</code> flags: r = portmap (PAT), i = dynamic, s = static.</li>
</ul></div>
`}};export{e as default};