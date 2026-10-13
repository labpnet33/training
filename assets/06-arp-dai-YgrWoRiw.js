var e={id:`arp-dai`,h:{en:`ARP spoofing and Dynamic ARP Inspection`,hi:`ARP spoofing aur Dynamic ARP Inspection`},body:{en:`
<p>In a housing society, the watchman keeps a notebook: "Flat 101 is Mr. Rao, flat 102 is Ms. Iyer". Anyone can walk up and say "I am now flat 101, give his parcels to me", and this watchman simply updates the notebook. From then on, Mr. Rao's parcels go to the stranger, who opens them and passes them on so nobody notices. That is <b>ARP spoofing</b>. <b>Dynamic ARP Inspection (DAI)</b> gives the watchman the society's official resident register and tells him to reject any claim that does not match it.</p>

<h3>ARP recap</h3>
<p>To send a packet to 10.0.10.1 on the local subnet, a host needs the gateway's MAC. It broadcasts an <b>ARP request</b> ("who has 10.0.10.1?") and the owner sends an <b>ARP reply</b> ("10.0.10.1 is at 0011.2233.4401"). The result is stored in the host's <b>ARP cache</b>. ARP has no authentication, and most operating systems accept an unsolicited reply, including a <b>gratuitous ARP</b> (a host announcing its own mapping), and overwrite the cache entry.</p>

<h3>The attack at recognition level</h3>
<p>The attacker sends forged ARP replies to the victim claiming "10.0.10.1 is at <i>my</i> MAC", and to the gateway claiming "the victim's IP is at <i>my</i> MAC". Both caches are <b>poisoned</b>. Traffic in both directions now flows through the attacker, who forwards it to stay invisible: a classic <b>man-in-the-middle (MITM)</b>. The attacker must repeat the forged replies every few seconds to keep the caches poisoned, which is one reason DAI's rate limit also helps.</p>
<p><b>What the defender sees:</b> the gateway's IP maps to a MAC that is not the gateway's (compare with a known-good value), two IPs sharing one MAC in <code>arp -a</code>, a burst of unsolicited ARP replies from one access port, and on a switch running DAI, deny logs pointing at the exact port.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ARP spoofing man in the middle">
<rect x="40" y="30" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.0.10.10</text><text x="120" y="69" text-anchor="middle" class="svg-muted" font-size="12">cache: .1 = ATK MAC</text>
<rect x="440" y="30" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="520" y="52" text-anchor="middle" class="svg-ink" font-size="13">GW 10.0.10.1</text><text x="520" y="69" text-anchor="middle" class="svg-muted" font-size="12">cache: .10 = ATK MAC</text>
<rect x="240" y="170" width="160" height="50" rx="8" fill="#fed7aa"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">ATK</text><text x="320" y="209" text-anchor="middle" class="svg-muted" font-size="12">00de.ad00.00a2</text>
<line x1="120" y1="80" x2="260" y2="170" stroke="#64748b" stroke-width="2"/><line x1="380" y1="170" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="12">intended direct path</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">forged ARP replies poison both caches</text>
</svg><p class="cap">After poisoning, both directions of the conversation pass through the attacker.</p></div>

<h3>How DAI works</h3>
<p>DAI runs on the switch, per VLAN. Every port is <b>untrusted</b> by default; ARP packets arriving on untrusted ports are intercepted and checked, while ARP on <b>trusted</b> ports is forwarded without checks. For each ARP request or reply on an untrusted port, the switch checks the <b>sender MAC and sender IP</b> against:</p>
<ol>
<li>Any <b>ARP ACL</b> applied to the VLAN (checked first), then</li>
<li>The <b>DHCP snooping binding table</b>, including static <code>ip source binding</code> entries.</li>
</ol>
<p>If the pair matches a binding for that VLAN and port, the ARP is forwarded; otherwise it is <b>dropped and logged</b>. DAI also rate-limits ARP on untrusted ports to <b>15 packets per second</b> by default; exceeding it err-disables the port with reason <code>arp-inspection</code>. Trusted ports have no limit.</p>
<p>Optional extra checks, all on one line because each new <code>validate</code> command replaces the previous one: <code>src-mac</code> (Ethernet source equals ARP sender MAC), <code>dst-mac</code> (for replies, Ethernet destination equals ARP target MAC) and <code>ip</code> (drops 0.0.0.0, 255.255.255.255 and multicast addresses).</p>

<h3>Lab 2 walkthrough, part 2</h3>
<p>Snooping is already running on ACC2 with PC1 in the binding table. Now add DAI:</p>
<pre class="code"><span class="c">! task 3: inspect ARP in VLAN 10, trust the GW uplink</span>
ip arp inspection vlan 10
interface g0/24
 ip arp inspection trust
 exit
<span class="c">! optional stronger checks (not graded)</span>
ip arp inspection validate src-mac dst-mac ip</pre>
<p>Run <code>attack arp-spoof 10.0.10.1</code> on ATK. Its forged reply claims 10.0.10.1 is at 00de.ad00.00a2 and arrives on untrusted Gi0/2. No binding exists for 10.0.10.1 on Gi0/2, so DAI drops it:</p>
<pre class="out"><span class="hl">%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Res) on Gi0/2, vlan 10.([00de.ad00.00a2/10.0.10.1/0050.7900.0a11/10.0.10.10/10:14:02 UTC Mon Mar 2 2026])</span>

ACC2# show ip arp inspection vlan 10
Source Mac Validation      : Disabled
Destination Mac Validation : Disabled
IP Address Validation      : Disabled

 Vlan     Configuration    Operation   ACL Match          Static ACL
 ----     -------------    ---------   ---------          ----------
   10     Enabled          Active

 Vlan      Forwarded        Dropped     DHCP Drops      ACL Drops
 ----      ---------        -------     ----------      ---------
<span class="hl">   10             12              1              1              0</span></pre>
<p>The lab asks for the number of invalid ARPs dropped on VLAN 10: read the <b>Dropped</b> (or DHCP Drops) column, here 1. Check the trust state and limits per port:</p>
<pre class="out">ACC2# show ip arp inspection interfaces
 Interface        Trust State     Rate (pps)    Burst Interval
 ---------------  -----------     ----------    --------------
 Gi0/1            Untrusted               15                 1
 Gi0/2            Untrusted               15                 1
<span class="hl"> Gi0/24           Trusted               None               N/A</span></pre>

<div class="eg"><p><b>Worked example: reading the deny log.</b> The bracket holds four fields: sender MAC 00de.ad00.00a2, sender IP 10.0.10.1, target MAC 0050.7900.0a11, target IP 10.0.10.10. Translation: "the device at 00de.ad00.00a2 on Gi0/2 told PC1 that it owns the gateway IP". The binding table says 10.0.10.1 is not bound to Gi0/2, so this is a spoof aimed at PC1. You know the attacker port, the victim and the impersonated address from one line.</p></div>

<h3>Hosts with static addresses</h3>
<p>A server or printer with a static IP never appears in the snooping table, so DAI drops its ARP. Give it a static binding, <code>ip source binding 0050.5555.5050 vlan 10 10.0.10.50 interface g0/2</code>, or an ARP ACL:</p>
<pre class="code">arp access-list STATIC-HOSTS
 permit ip host 10.0.10.50 mac host 0050.5555.5050
ip arp inspection filter STATIC-HOSTS vlan 10</pre>
<p>Adding the keyword <code>static</code> to the filter makes the ACL the only source of truth (an implicit deny, no fallback to bindings).</p>

<div class="warn"><p><b>Common mistake.</b> Enabling DAI without trusting the uplink to the gateway. The gateway has a static IP, so its ARP replies have no binding, arrive on an untrusted port and are dropped. Every host in the VLAN loses its default gateway at once.</p></div>

<div class="exam"><p><b>Exam trap.</b> DAI validates against the <b>DHCP snooping binding table</b> (and ARP ACLs, checked first). It inspects only on <b>untrusted</b> ports; default untrusted rate limit is <b>15 pps</b>. Ports toward other switches running DAI and toward routers are normally trusted.</p></div>

<div class="scn"><h4>The lab bench that saw everyone's logins</h4><p>A university's security team received a complaint that a practical-exam portal "sometimes shows a certificate warning" in one teaching lab. The access switches ran DAI in log-only fashion on a test VLAN, and the logs showed repeated SW_DAI-4-DHCP_SNOOPING_DENY entries from one bench port, each claiming the gateway IP. A student had been running an ARP-spoofing tool against classmates. Because DAI dropped the forged replies on production VLANs, no sessions were intercepted there. The team enabled DAI on the teaching VLAN too and handed the logs to the disciplinary process.</p><p><b>Lesson:</b> DAI both prevents ARP poisoning and produces precise evidence: port, MAC and the impersonated IP.</p></div>

<div class="iv"><p class="q">"Explain Dynamic ARP Inspection. What does it depend on?"</p><p>Strong answer: DAI intercepts ARP on untrusted ports in the VLANs where it is enabled and checks the sender MAC and IP against ARP ACLs and then the DHCP snooping binding table. Mismatches are dropped and logged; trusted ports such as uplinks are not inspected. It rate-limits untrusted ports to 15 ARP packets per second by default and err-disables on excess. It depends on DHCP snooping, so static hosts need static bindings or ARP ACLs, and the uplink to the gateway must be trusted.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ARP has no authentication; forged replies poison caches and create a man-in-the-middle.</li>
<li>DAI inspects ARP on untrusted ports only, checking ARP ACLs first and then the snooping binding table.</li>
<li>Invalid ARPs are dropped and logged as SW_DAI-4-DHCP_SNOOPING_DENY with the offending port and addresses.</li>
<li>Default rate limit 15 pps on untrusted ports; excess err-disables the port (arp-inspection).</li>
<li>Trust the gateway uplink; give static hosts a static binding or an ARP ACL.</li>
</ul></div>
`,hi:`
<p>Ek housing society mein watchman ek notebook rakhta hai: "Flat 101 Mr. Rao ka hai, flat 102 Ms. Iyer ka". Koi bhi aakar keh sakta hai "ab flat 101 main hoon, unke parcels mujhe do", aur yeh watchman bas notebook update kar deta hai. Us pal se Mr. Rao ke parcels ajnabi ke paas jaate hain, jo unhe kholta hai aur aage bhej deta hai taaki kisi ko pata na chale. Yahi <b>ARP spoofing</b> hai. <b>Dynamic ARP Inspection (DAI)</b> watchman ko society ka official resident register deta hai aur kehta hai ki jo bhi daava usse match na kare use reject karo.</p>

<h3>ARP recap</h3>
<p>Local subnet par 10.0.10.1 ko packet bhejne ke liye host ko gateway ka MAC chahiye. Woh <b>ARP request</b> broadcast karta hai ("10.0.10.1 kiske paas hai?") aur maalik <b>ARP reply</b> bhejta hai ("10.0.10.1 0011.2233.4401 par hai"). Result host ke <b>ARP cache</b> mein store hota hai. ARP mein koi authentication nahi, aur zyada tar operating systems bina maange aaya reply bhi accept kar lete hain, <b>gratuitous ARP</b> (host apni mapping announce karta hai) samet, aur cache entry overwrite kar dete hain.</p>

<h3>Attack recognition level par</h3>
<p>Attacker victim ko nakli ARP replies bhejta hai jo kehte hain "10.0.10.1 <i>mere</i> MAC par hai", aur gateway ko "victim ka IP <i>mere</i> MAC par hai". Dono caches <b>poison</b> ho jaate hain. Ab dono directions ka traffic attacker se hokar jaata hai, jo invisible rehne ke liye use aage forward karta hai: classic <b>man-in-the-middle (MITM)</b>. Caches ko poisoned rakhne ke liye attacker ko har kuch seconds mein nakli replies dohraane padte hain, jo ek wajah hai ki DAI ki rate limit bhi madad karti hai.</p>
<p><b>Defender ko kya dikhta hai:</b> gateway ka IP aise MAC par map hai jo gateway ka nahi (known-good value se compare karo), <code>arp -a</code> mein do IPs ek MAC share kar rahe hain, ek access port se bina maange ARP replies ka burst, aur DAI chalane wale switch par deny logs jo exact port bataate hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ARP spoofing man in the middle">
<rect x="40" y="30" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.0.10.10</text><text x="120" y="69" text-anchor="middle" class="svg-muted" font-size="12">cache: .1 = ATK MAC</text>
<rect x="440" y="30" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="520" y="52" text-anchor="middle" class="svg-ink" font-size="13">GW 10.0.10.1</text><text x="520" y="69" text-anchor="middle" class="svg-muted" font-size="12">cache: .10 = ATK MAC</text>
<rect x="240" y="170" width="160" height="50" rx="8" fill="#fed7aa"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">ATK</text><text x="320" y="209" text-anchor="middle" class="svg-muted" font-size="12">00de.ad00.00a2</text>
<line x1="120" y1="80" x2="260" y2="170" stroke="#64748b" stroke-width="2"/><line x1="380" y1="170" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="12">asli seedha raasta</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">nakli ARP replies dono caches poison karte hain</text>
</svg><p class="cap">Poisoning ke baad baatcheet ki dono directions attacker se hokar jaati hain.</p></div>

<h3>DAI kaise kaam karta hai</h3>
<p>DAI switch par per VLAN chalta hai. Har port default mein <b>untrusted</b> hai; untrusted ports par aane wale ARP packets rok kar check kiye jaate hain, jabki <b>trusted</b> ports par ARP bina check forward hota hai. Untrusted port par har ARP request ya reply ke liye switch <b>sender MAC aur sender IP</b> ko check karta hai:</p>
<ol>
<li>VLAN par lagi kisi bhi <b>ARP ACL</b> se (pehle check hoti hai), phir</li>
<li><b>DHCP snooping binding table</b> se, static <code>ip source binding</code> entries samet.</li>
</ol>
<p>Agar pair us VLAN aur port ki kisi binding se match kare, to ARP forward hota hai; warna <b>drop aur log</b> hota hai. DAI untrusted ports par ARP ko default mein <b>15 packets per second</b> tak rate-limit bhi karta hai; ise paar karne par port <code>arp-inspection</code> reason ke saath err-disable hota hai. Trusted ports par koi limit nahi.</p>
<p>Optional extra checks, sab ek hi line par kyunki har nayi <code>validate</code> command pichhli ko replace karti hai: <code>src-mac</code> (Ethernet source ARP sender MAC ke barabar), <code>dst-mac</code> (replies ke liye, Ethernet destination ARP target MAC ke barabar) aur <code>ip</code> (0.0.0.0, 255.255.255.255 aur multicast addresses drop karta hai).</p>

<h3>Lab 2 walkthrough, part 2</h3>
<p>ACC2 par snooping pehle se chal raha hai aur PC1 binding table mein hai. Ab DAI jodo:</p>
<pre class="code"><span class="c">! task 3: VLAN 10 mein ARP inspect karo, GW uplink trust karo</span>
ip arp inspection vlan 10
interface g0/24
 ip arp inspection trust
 exit
<span class="c">! optional strong checks (graded nahi)</span>
ip arp inspection validate src-mac dst-mac ip</pre>
<p>ATK par <code>attack arp-spoof 10.0.10.1</code> chalao. Uska nakli reply daava karta hai ki 10.0.10.1 00de.ad00.00a2 par hai aur untrusted Gi0/2 par aata hai. Gi0/2 par 10.0.10.1 ki koi binding nahi, isliye DAI use drop karta hai:</p>
<pre class="out"><span class="hl">%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Res) on Gi0/2, vlan 10.([00de.ad00.00a2/10.0.10.1/0050.7900.0a11/10.0.10.10/10:14:02 UTC Mon Mar 2 2026])</span>

ACC2# show ip arp inspection vlan 10
Source Mac Validation      : Disabled
Destination Mac Validation : Disabled
IP Address Validation      : Disabled

 Vlan     Configuration    Operation   ACL Match          Static ACL
 ----     -------------    ---------   ---------          ----------
   10     Enabled          Active

 Vlan      Forwarded        Dropped     DHCP Drops      ACL Drops
 ----      ---------        -------     ----------      ---------
<span class="hl">   10             12              1              1              0</span></pre>
<p>Lab VLAN 10 par drop hue invalid ARPs ki ginti maangti hai: <b>Dropped</b> (ya DHCP Drops) column padho, yahan 1. Har port ka trust state aur limits check karo:</p>
<pre class="out">ACC2# show ip arp inspection interfaces
 Interface        Trust State     Rate (pps)    Burst Interval
 ---------------  -----------     ----------    --------------
 Gi0/1            Untrusted               15                 1
 Gi0/2            Untrusted               15                 1
<span class="hl"> Gi0/24           Trusted               None               N/A</span></pre>

<div class="eg"><p><b>Worked example: deny log padhna.</b> Bracket mein chaar fields hain: sender MAC 00de.ad00.00a2, sender IP 10.0.10.1, target MAC 0050.7900.0a11, target IP 10.0.10.10. Matlab: "Gi0/2 par 00de.ad00.00a2 wale device ne PC1 ko bataya ki gateway IP uska hai". Binding table kehti hai 10.0.10.1 Gi0/2 se bound nahi, isliye yeh PC1 par nishana saadhta spoof hai. Ek line se aapko attacker port, victim aur nakal kiya gaya address pata chal jaata hai.</p></div>

<h3>Static addresses wale hosts</h3>
<p>Static IP wala server ya printer snooping table mein kabhi nahi aata, isliye DAI uska ARP drop karta hai. Use static binding do, <code>ip source binding 0050.5555.5050 vlan 10 10.0.10.50 interface g0/2</code>, ya ARP ACL:</p>
<pre class="code">arp access-list STATIC-HOSTS
 permit ip host 10.0.10.50 mac host 0050.5555.5050
ip arp inspection filter STATIC-HOSTS vlan 10</pre>
<p>Filter mein <code>static</code> keyword jodne se ACL hi sach ka ekmaatra source ban jaata hai (implicit deny, bindings par koi fallback nahi).</p>

<div class="warn"><p><b>Common galti.</b> Gateway ki taraf ka uplink trust kiye bina DAI enable karna. Gateway ka IP static hai, isliye uske ARP replies ki koi binding nahi, woh untrusted port par aate hain aur drop hote hain. VLAN ka har host ek saath apna default gateway kho deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> DAI <b>DHCP snooping binding table</b> (aur ARP ACLs, jo pehle check hoti hain) se validate karta hai. Yeh sirf <b>untrusted</b> ports par inspect karta hai; default untrusted rate limit <b>15 pps</b> hai. DAI chalane wale doosre switches aur routers ki taraf ke ports normally trusted hote hain.</p></div>

<div class="scn"><h4>Lab bench jo sabke logins dekh raha tha</h4><p>Ek university ki security team ko shikayat mili ki ek teaching lab mein practical-exam portal "kabhi kabhi certificate warning dikhata hai". Access switches ek test VLAN par DAI sirf log ke tarike se chala rahe the, aur logs mein ek bench port se baar baar SW_DAI-4-DHCP_SNOOPING_DENY entries dikhi, har ek gateway IP ka daava karti hui. Ek student classmates par ARP-spoofing tool chala raha tha. Kyunki production VLANs par DAI ne nakli replies drop kiye, wahan koi session intercept nahi hua. Team ne teaching VLAN par bhi DAI enable kiya aur logs disciplinary process ko saunp diye.</p><p><b>Seekh:</b> DAI ARP poisoning rokta bhi hai aur exact saboot bhi deta hai: port, MAC aur nakal kiya gaya IP.</p></div>

<div class="iv"><p class="q">"Dynamic ARP Inspection samjhao. Yeh kis par depend karta hai?"</p><p>Strong answer: DAI jin VLANs mein enabled hai wahan untrusted ports par ARP rokta hai aur sender MAC aur IP ko ARP ACLs se aur phir DHCP snooping binding table se check karta hai. Mismatches drop aur log hote hain; uplinks jaise trusted ports inspect nahi hote. Yeh untrusted ports ko default mein 15 ARP packets per second tak rate-limit karta hai aur zyada hone par err-disable karta hai. Yeh DHCP snooping par depend karta hai, isliye static hosts ko static bindings ya ARP ACLs chahiye, aur gateway ka uplink trusted hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ARP mein authentication nahi; nakli replies caches poison karke man-in-the-middle banate hain.</li>
<li>DAI sirf untrusted ports par ARP inspect karta hai, pehle ARP ACLs aur phir snooping binding table check karta hai.</li>
<li>Invalid ARPs drop hote hain aur SW_DAI-4-DHCP_SNOOPING_DENY ki tarah offending port aur addresses ke saath log hote hain.</li>
<li>Untrusted ports par default rate limit 15 pps; zyada hone par port err-disable (arp-inspection).</li>
<li>Gateway uplink trust karo; static hosts ko static binding ya ARP ACL do.</li>
</ul></div>
`}};export{e as default};