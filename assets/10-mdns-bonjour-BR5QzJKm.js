var e={id:`mdns-bonjour`,h:{en:`The mDNS gateway and Bonjour across VLANs`,hi:`VLANs ke paar mDNS gateway aur Bonjour`},body:{en:`
<p>In a small house you shout "who wants tea?" and everyone in the house hears you. In a large office with many floors the shout stays on your floor. That is the problem of <b>Bonjour</b> and <b>mDNS</b>: devices find printers and screens by shouting on their own local network, and that shout does not leave the VLAN. The <b>mDNS gateway</b> is a receptionist who listens on each floor and passes the right messages to the right floors, only the ones you allow.</p>

<h3>What mDNS and Bonjour are</h3>
<p><b>Multicast DNS (mDNS)</b> lets devices resolve names and find services without a DNS server. A device asks the multicast address 224.0.0.251 (IPv6 ff02::fb) on UDP port 5353: "who offers an AirPrint printer?" and the printer answers. <b>Bonjour</b> is Apple's name for mDNS plus DNS-SD (service discovery); it is used for AirPrint, AirPlay and Apple TV. Google Cast and some other products use the same mDNS mechanism.</p>
<p>The key fact: these packets are <b>link-local</b>. They have a TTL of 1 and are never routed. So a student on the Wi-Fi VLAN cannot find the printer on the staff VLAN, even if routing and firewalls allow normal traffic between them. And simply bridging the VLANs would flood broadcast and multicast everywhere, which is a bad idea.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="mDNS gateway">
<rect x="20" y="30" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">VLAN 20 staff</text><text x="105" y="76" text-anchor="middle" class="svg-muted" font-size="12">laptop looks for printer</text>
<rect x="450" y="30" width="170" height="60" rx="10" fill="#fed7aa"/><text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="13">VLAN 40 devices</text><text x="535" y="76" text-anchor="middle" class="svg-muted" font-size="12">printer, Apple TV</text>
<rect x="240" y="20" width="160" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">WLC1 mDNS gateway</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">cache + filter</text>
<line x1="190" y1="60" x2="240" y2="60" stroke="#64748b" stroke-width="2"/><line x1="400" y1="60" x2="450" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="215" y="50" text-anchor="middle" class="svg-accent" font-size="11">query</text><text x="425" y="50" text-anchor="middle" class="svg-accent" font-size="11">answer</text>
<rect x="60" y="140" width="520" height="70" rx="10" fill="#e2e8f0"/>
<text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">Without the gateway the query dies at the VLAN edge (TTL 1).</text>
<text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">With it, the controller answers from its cache or relays the query.</text>
</svg><p class="cap">The gateway makes service discovery work between VLANs without bridging them.</p></div>

<h3>How the gateway works</h3>
<ol>
<li>The controller <b>listens</b> for mDNS advertisements on the VLANs of its clients and caches them (printer name, service type, IP).</li>
<li>When a client queries, the controller answers from the cache or relays the query, filtered by policy.</li>
<li>A <b>service list</b> says which service types are allowed, and in which direction (<b>in</b> = learned from clients, <b>out</b> = told to clients).</li>
<li>A <b>service policy</b> groups service lists, and you attach the service policy to a <b>policy profile</b>. Clients of that profile then follow it.</li>
</ol>
<div class="note"><p><b>Concept only.</b> The lab stores, shows and round-trips the mDNS gateway configuration, but the <b>data plane is concept only</b>: no query is cached, relayed or answered in the simulation. Treat the lab as practice for the configuration objects, not as proof that a printer is discoverable. The real 9800 also offers location-based filtering and service definitions, which the lab does not model.</p></div>

<h3>Configure</h3>
<pre class="code"><span class="c">! turn the gateway on</span>
mdns-sd gateway
<span class="c">! which services, and in which direction</span>
mdns-sd service-list SL-PRINT in
 match airprint
 exit
mdns-sd service-list SL-SCREEN out
 match airplay
 match apple-tv
 exit
<span class="c">! group them</span>
mdns-sd service-policy SP-OFFICE
 service-list SL-PRINT in
 service-list SL-SCREEN out
 exit
<span class="c">! attach to the policy profile (shut first)</span>
wireless profile policy PP-STAFF
 shutdown
 mdns-sd service-policy SP-OFFICE
 no shutdown
 exit</pre>
<p>Service types known to the lab include airplay, airprint, apple-tv, google-cast, spotify-connect and printer-ipp. A list used by a policy cannot be deleted, and a policy used by a profile cannot be deleted; the lab tells you which object still uses it. Remove the attachment with <code>no mdns-sd service-policy</code> under the policy profile. Web UI: the lab web UI has no mDNS page, so use the CLI; <b>Configuration &gt; Wireless &gt; Multicast</b> covers multicast and IGMP snooping only.</p>
<pre class="out">WLC1# show mdns-sd summary

mDNS gateway (configuration only, the data plane is concept only): Enabled

Service list SL-PRINT (in): airprint
Service list SL-SCREEN (out): airplay, apple-tv
Service policy SP-OFFICE: SL-PRINT in, SL-SCREEN out

WLC1# show wireless profile policy detailed PP-STAFF
...
mDNS
  <span class="hl">Service Policy                 : SP-OFFICE</span></pre>

<h3>Design points that matter in real networks</h3>
<ul>
<li><b>Least privilege:</b> allow only the services you need (printers yes, every device no). An open list exposes devices.</li>
<li>Choose the direction deliberately: a printer VLAN usually advertises <b>in</b> to the gateway, user VLANs receive <b>out</b>.</li>
<li>Keep multicast itself under control: the gateway replaces bridging, so do not also stretch the VLANs.</li>
<li>Remember the wired side: a wired switch can also act as a gateway in some designs.</li>
<li>Discovery is not authorisation. Printing still has to be permitted by firewalls and the printer's own security.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A school has printers in VLAN 40 and teachers on Wi-Fi VLAN 20. Teachers cannot see the printers. The engineer enables the gateway, creates SL-PRINT with airprint, builds SP-OFFICE and attaches it to PP-STAFF. Now teacher laptops get printer answers; student devices on another policy profile (without the service policy) still do not see them, which is the intended filtering.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Expecting discovery to work across VLANs without a gateway or a relay.</li>
<li>Creating a service list and forgetting to put it into a service policy and attach the policy to the policy profile.</li>
<li>Allowing every service type.</li>
<li>Treating the lab's accepted configuration as proof of discovery: the data plane is concept only.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> mDNS is multicast to 224.0.0.251 on UDP 5353 with TTL 1: it never crosses a router. The gateway <b>does not bridge</b>; it learns, caches and filters. The service-list direction is <b>in</b> or <b>out</b>.</p></div>

<div class="scn"><h4>The printer nobody could find</h4><p>Staff on the new Wi-Fi VLAN report that AirPrint printers vanished after a VLAN redesign. Wired users still print. The mDNS queries die at the VLAN boundary. The engineer enables the gateway, restricts the list to airprint and attaches the service policy to the staff profile. Printers reappear for staff only.</p><p><b>Lesson:</b> when a discovery protocol is link-local, plan a gateway, not a bridge.</p></div>

<div class="iv"><p class="q">"Why does Bonjour not work across VLANs and how do you fix it on a WLC?"</p><p>mDNS uses link-local multicast (224.0.0.251, UDP 5353, TTL 1) so it is not routed. The fix is an mDNS gateway: it caches service advertisements and answers queries across VLANs, filtered by service lists and service policies attached to the policy profile. Mention least privilege and that the lab models the config only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>mDNS and Bonjour are link-local multicast: 224.0.0.251, UDP 5353, TTL 1.</li>
<li>The gateway caches and filters services between VLANs instead of bridging.</li>
<li>Objects: mdns-sd gateway, service-list (in or out), service-policy, policy profile attachment.</li>
<li>The lab stores and shows the configuration; the data plane is concept only.</li>
<li>Allow only the services you need.</li>
</ul></div>
`,hi:`
<p>Chhote ghar mein aap chillate ho "chai kaun peega?" aur ghar mein sab sunte hain. Bade office mein kai floors par woh awaaz sirf aapke floor par rehti hai. Yahi <b>Bonjour</b> aur <b>mDNS</b> ki problem hai: devices apne local network par chillakar printers aur screens dhundte hain, aur woh awaaz VLAN se bahar nahi jaati. <b>mDNS gateway</b> ek receptionist hai jo har floor par sunta hai aur sahi messages sahi floors tak pahunchata hai, sirf wahi jo aap allow karo.</p>

<h3>mDNS aur Bonjour kya hain</h3>
<p><b>Multicast DNS (mDNS)</b> devices ko DNS server ke bina names resolve karne aur services dhundne deta hai. Device multicast address 224.0.0.251 (IPv6 ff02::fb) par UDP port 5353 se poochta hai: "AirPrint printer kaun offer karta hai?" aur printer jawab deta hai. <b>Bonjour</b> Apple ka naam hai mDNS plus DNS-SD (service discovery) ke liye; AirPrint, AirPlay aur Apple TV mein use hota hai. Google Cast aur kuch aur products wahi mDNS mechanism use karte hain.</p>
<p>Mukhya baat: yeh packets <b>link-local</b> hain. Inka TTL 1 hota hai aur yeh kabhi route nahi hote. Isliye Wi-Fi VLAN ka student staff VLAN ka printer nahi dhundh sakta, chahe routing aur firewalls normal traffic allow karte hon. Aur VLANs ko bridge karna broadcast aur multicast ko har jagah flood karta hai, jo bura idea hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="mDNS gateway">
<rect x="20" y="30" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">VLAN 20 staff</text><text x="105" y="76" text-anchor="middle" class="svg-muted" font-size="12">laptop printer dhundta hai</text>
<rect x="450" y="30" width="170" height="60" rx="10" fill="#fed7aa"/><text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="13">VLAN 40 devices</text><text x="535" y="76" text-anchor="middle" class="svg-muted" font-size="12">printer, Apple TV</text>
<rect x="240" y="20" width="160" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">WLC1 mDNS gateway</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">cache + filter</text>
<line x1="190" y1="60" x2="240" y2="60" stroke="#64748b" stroke-width="2"/><line x1="400" y1="60" x2="450" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="215" y="50" text-anchor="middle" class="svg-accent" font-size="11">query</text><text x="425" y="50" text-anchor="middle" class="svg-accent" font-size="11">jawab</text>
<rect x="60" y="140" width="520" height="70" rx="10" fill="#e2e8f0"/>
<text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">Gateway ke bina query VLAN ki seema par mar jaati hai (TTL 1).</text>
<text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">Gateway ke saath controller cache se jawab deta hai ya query relay karta hai.</text>
</svg><p class="cap">Gateway VLANs ko bridge kiye bina service discovery ko unke beech chalata hai.</p></div>

<h3>Gateway kaise kaam karta hai</h3>
<ol>
<li>Controller apne clients ke VLANs par mDNS advertisements <b>sunta</b> hai aur unhe cache karta hai (printer name, service type, IP).</li>
<li>Client query kare to controller cache se jawab deta hai ya policy se filter karke query relay karta hai.</li>
<li><b>Service list</b> batati hai ki kaun se service types allowed hain, aur kis direction mein (<b>in</b> = clients se seekha, <b>out</b> = clients ko bataya).</li>
<li><b>Service policy</b> service lists ko group karti hai, aur aap service policy ko <b>policy profile</b> par attach karte ho. Us profile ke clients phir use follow karte hain.</li>
</ol>
<div class="note"><p><b>Concept only.</b> Lab mDNS gateway configuration ko store karta, dikhata aur round-trip karta hai, lekin <b>data plane concept only</b> hai: simulation mein koi query cache, relay ya answer nahi hoti. Lab ko configuration objects ki practice samjho, is saboot ki tarah nahi ki printer discoverable hai. Real 9800 location-based filtering aur service definitions bhi deta hai, jo lab model nahi karta.</p></div>

<h3>Configure</h3>
<pre class="code"><span class="c">! gateway on karo</span>
mdns-sd gateway
<span class="c">! kaun si services, aur kis direction mein</span>
mdns-sd service-list SL-PRINT in
 match airprint
 exit
mdns-sd service-list SL-SCREEN out
 match airplay
 match apple-tv
 exit
<span class="c">! unhe group karo</span>
mdns-sd service-policy SP-OFFICE
 service-list SL-PRINT in
 service-list SL-SCREEN out
 exit
<span class="c">! policy profile par attach karo (pehle shut)</span>
wireless profile policy PP-STAFF
 shutdown
 mdns-sd service-policy SP-OFFICE
 no shutdown
 exit</pre>
<p>Lab ko jo service types maloom hain unme airplay, airprint, apple-tv, google-cast, spotify-connect aur printer-ipp shamil hain. Policy jo list use karti hai use delete nahi kar sakte, aur profile jo policy use karta hai use delete nahi kar sakte; lab batata hai ki kaun si object abhi use kar rahi hai. Attachment hatane ke liye policy profile ke andar <code>no mdns-sd service-policy</code>. Web UI: lab web UI mein mDNS page nahi hai, isliye CLI use karo; <b>Configuration &gt; Wireless &gt; Multicast</b> sirf multicast aur IGMP snooping cover karta hai.</p>
<pre class="out">WLC1# show mdns-sd summary

mDNS gateway (configuration only, the data plane is concept only): Enabled

Service list SL-PRINT (in): airprint
Service list SL-SCREEN (out): airplay, apple-tv
Service policy SP-OFFICE: SL-PRINT in, SL-SCREEN out

WLC1# show wireless profile policy detailed PP-STAFF
...
mDNS
  <span class="hl">Service Policy                 : SP-OFFICE</span></pre>

<h3>Real networks mein design points jo matter karte hain</h3>
<ul>
<li><b>Least privilege:</b> sirf zaroori services allow karo (printers haan, har device nahi). Khuli list devices ko expose karti hai.</li>
<li>Direction soch samajh kar chuno: printer VLAN aam taur par gateway ko <b>in</b> advertise karta hai, user VLANs <b>out</b> receive karte hain.</li>
<li>Multicast ko control mein rakho: gateway bridging ki jagah leta hai, isliye VLANs ko saath mein stretch mat karo.</li>
<li>Wired side yaad rakho: kuch designs mein wired switch bhi gateway ban sakta hai.</li>
<li>Discovery authorisation nahi hai. Printing ko phir bhi firewalls aur printer ki apni security se permit hona padta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek school ke printers VLAN 40 mein hain aur teachers Wi-Fi VLAN 20 par. Teachers printers nahi dekh paate. Engineer gateway enable karta hai, airprint ke saath SL-PRINT banata hai, SP-OFFICE banata hai aur use PP-STAFF par attach karta hai. Ab teacher laptops ko printer ke jawab milte hain; doosre policy profile (bina service policy) ke student devices ko phir bhi nahi dikhte, jo intended filtering hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Gateway ya relay ke bina VLANs ke paar discovery ki umeed karna.</li>
<li>Service list banana aur use service policy mein daalna aur policy ko policy profile par attach karna bhool jaana.</li>
<li>Har service type allow karna.</li>
<li>Lab ke accepted configuration ko discovery ka saboot maan lena: data plane concept only hai.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> mDNS 224.0.0.251 par UDP 5353 ka multicast hai jiska TTL 1 hai: woh kabhi router paar nahi karta. Gateway <b>bridge nahi karta</b>; woh seekhta, cache karta aur filter karta hai. Service-list ki direction <b>in</b> ya <b>out</b> hoti hai.</p></div>

<div class="scn"><h4>Woh printer jo koi nahi dhundh paya</h4><p>Naye Wi-Fi VLAN ke staff report karte hain ki VLAN redesign ke baad AirPrint printers gayab ho gaye. Wired users phir bhi print karte hain. mDNS queries VLAN ki seema par mar jaati hain. Engineer gateway enable karta hai, list ko airprint tak limit karta hai aur service policy staff profile par attach karta hai. Printers sirf staff ko wapas dikhte hain.</p><p><b>Lesson:</b> jab discovery protocol link-local ho, to gateway plan karo, bridge nahi.</p></div>

<div class="iv"><p class="q">"Bonjour VLANs ke paar kyun nahi chalta aur WLC par ise kaise fix karte ho?"</p><p>mDNS link-local multicast use karta hai (224.0.0.251, UDP 5353, TTL 1) isliye woh route nahi hota. Fix mDNS gateway hai: woh service advertisements cache karta hai aur VLANs ke paar queries ka jawab deta hai, policy profile par attach service lists aur service policies se filter hokar. Least privilege batao aur yeh ki lab sirf config model karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>mDNS aur Bonjour link-local multicast hain: 224.0.0.251, UDP 5353, TTL 1.</li>
<li>Gateway bridging ki jagah VLANs ke beech services cache aur filter karta hai.</li>
<li>Objects: mdns-sd gateway, service-list (in ya out), service-policy, policy profile attachment.</li>
<li>Lab configuration store aur show karta hai; data plane concept only hai.</li>
<li>Sirf zaroori services allow karo.</li>
</ul></div>
`}};export{e as default};