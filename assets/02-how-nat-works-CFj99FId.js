var e={id:`how-nat-works`,h:{en:`How a NAT gateway translates traffic`,hi:`NAT gateway traffic ko kaise translate karta hai`},body:{en:`
<p>In chapter 1 the NAT gateway was a hotel front desk. Now we open the desk drawer and look at the exact record it keeps. Understanding this table explains every limit, metric and failure you will meet later.</p>

<h3>PAT: many private hosts behind one public address</h3>
<p>A NAT gateway performs <b>source NAT with port translation</b>, often called <b>PAT</b> or "NAT overload". Hundreds of private instances share one public Elastic IP. To tell their conversations apart, the gateway also rewrites the <b>source port</b> and remembers the mapping in a translation table.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NAT translation of source address and port">
<rect x="20" y="50" width="150" height="64" rx="8" fill="#bbf7d0"/><text x="95" y="75" text-anchor="middle" class="svg-ink" font-size="13">app-1</text><text x="95" y="95" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.4 : 41000</text>
<rect x="245" y="50" width="150" height="64" rx="8" fill="#fde68a"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.50 : 1024</text>
<rect x="470" y="50" width="150" height="64" rx="8" fill="#bae6fd"/><text x="545" y="75" text-anchor="middle" class="svg-ink" font-size="13">Mirror</text><text x="545" y="95" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20 : 443</text>
<line x1="170" y1="70" x2="245" y2="70" stroke="#64748b" stroke-width="2"/><line x1="395" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="245" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="470" y1="100" x2="395" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="207" y="42" text-anchor="middle" class="svg-accent" font-size="12">out</text><text x="432" y="42" text-anchor="middle" class="svg-accent" font-size="12">out</text>
<text x="207" y="124" text-anchor="middle" class="svg-muted" font-size="12">reply</text><text x="432" y="124" text-anchor="middle" class="svg-muted" font-size="12">reply</text>
<rect x="150" y="150" width="340" height="80" rx="8" fill="#f1f5f9" stroke="#94a3b8"/>
<text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="12">Translation table (illustrative)</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.4:41000 to 198.51.100.20:443 = 203.0.113.50:1024</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.9:52311 to 198.51.100.20:443 = 203.0.113.50:1025</text>
</svg><p class="cap">Solid arrows are the outbound packet, dashed arrows the reply. The gateway matches the reply to its table entry and un-translates it.</p></div>

<p>The key consequence: an entry in the table exists <b>only because the inside host spoke first</b>. A packet from the internet that matches no entry is dropped. That is why NAT is outbound-only without any firewall rule.</p>

<h3>What the gateway actually is</h3>
<ul>
<li>A <b>managed, highly available-within-one-AZ</b> service. AWS places an elastic network interface (ENI) with a private IP in the subnet you choose. For a <b>public</b> NAT gateway you also attach an <b>Elastic IP</b> (a static public IPv4 address that you allocate to your account).</li>
<li>Supports <b>TCP, UDP and ICMP</b>. It scales automatically with traffic. Published bandwidth limits have been raised more than once (older books say 45 Gbps), so check the current NAT gateway quotas page before you quote a number in an interview.</li>
<li>It has <b>no security group</b>. Control it through the route tables, the network ACL of its subnet, and the security groups of the instances behind it (their outbound rules).</li>
<li>Two <b>connectivity types</b>: <b>public</b> (internet access, needs an Elastic IP, this module) and <b>private</b> (no Elastic IP; reaches other VPCs or on-premises networks through a Transit Gateway or virtual private gateway, never the internet).</li>
</ul>

<h3>Port limits and timeouts you should know</h3>
<ul>
<li>A NAT gateway can hold up to about <b>55,000 simultaneous connections to each unique destination</b> (destination IP, port and protocol). Hit that against one busy API endpoint and new connections fail. The CloudWatch metric <code>ErrorPortAllocation</code> counts those failures; it should be zero. Fix: spread across more destinations, add more NAT gateways (each in its own subnet and with its own Elastic IP), or use endpoints.</li>
<li>An <b>idle TCP connection times out after 350 seconds</b>. After that the gateway forgets the mapping and a late packet gets a reset. Applications with long idle connections should use TCP keepalives shorter than that.</li>
<li>Useful CloudWatch metrics: <code>BytesOutToDestination</code>, <code>BytesInFromSource</code>, <code>ActiveConnectionCount</code>, <code>ConnectionAttemptCount</code>, <code>PacketsDropCount</code>, <code>ErrorPortAllocation</code>.</li>
</ul>

<h3>Life cycle states</h3>
<table class="cmp"><tr><th>State</th><th>Meaning</th></tr>
<tr><td>pending</td><td>being created; wait before adding routes that matter</td></tr>
<tr><td>available</td><td>working, and <b>billing</b></td></tr>
<tr><td>failed</td><td>creation failed (for example no Elastic IP available); delete it</td></tr>
<tr><td>deleting / deleted</td><td>being removed; a deleted gateway stays visible for a short time and then disappears</td></tr></table>

<pre class="out">Illustrative output (aws ec2 describe-nat-gateways, trimmed)
NatGatewayId           State      SubnetId          ConnectivityType
nat-0123456789abcdef0  <span class="hl">available</span>  subnet-0aaa111122  public</pre>

<div class="eg"><b>Worked example.</b> 40 build agents in 10.60.2.0/24 all download from the same artifact server (198.51.100.20:443). Each agent opens 2,000 connections: 80,000 connections to one destination. That exceeds ~55,000, so the NAT gateway starts failing new connections and <code>ErrorPortAllocation</code> rises. Two NAT gateways with two Elastic IPs (each private subnet pointing to its own gateway) halve the load per gateway.</div>

<div class="warn"><b>Common mistake.</b> Putting a security group "on the NAT gateway". There is none. Beginners also forget that the <b>network ACL</b> of the public subnet applies to NAT traffic, including the high ephemeral ports used by return traffic.</div>
<div class="exam"><b>Exam trap.</b> "Which resource does a public NAT gateway require?" An Elastic IP and a public subnet. "Which does a private NAT gateway require?" No Elastic IP, and it can never reach the internet.</div>

<div class="scn"><h4>Intermittent timeouts on a nightly sync</h4><p>A nightly job to one SaaS endpoint failed randomly. CloudWatch showed <code>ErrorPortAllocation</code> spikes exactly at job time: thousands of parallel connections to the same IP and port through a single NAT gateway. The team added a second NAT gateway and connection pooling in the job.</p><p><b>Lesson:</b> PAT has a hard per-destination limit; the metric tells you before users do.</p></div>

<div class="iv"><p class="q">"A NAT gateway shows ErrorPortAllocation. What does it mean?"</p><p>It cannot allocate a source port for a new connection because about 55,000 connections to the same destination IP, port and protocol are already open. Reduce connections to that destination (pooling), add NAT gateways with more Elastic IPs, or bypass NAT with endpoints.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT gateway does PAT: it rewrites source address and port and keeps a translation table.</li>
<li>Inbound packets with no table entry are dropped, so NAT is naturally outbound-only.</li>
<li>No security group on the gateway; the subnet NACL and route tables still apply.</li>
<li>About 55,000 connections per destination and a 350-second idle timeout are the numbers to remember.</li>
<li>Public type needs an Elastic IP; private type never reaches the internet.</li>
</ul></div>
`,hi:`
<p>Chapter 1 mein NAT gateway hotel ka front desk tha. Ab hum desk ki drawer kholkar dekhte hain ki woh exactly kaunsa record rakhta hai. Is table ko samajhne se aage aane wali har limit, metric aur failure samajh aa jaayega.</p>

<h3>PAT: kai private hosts ek public address ke peeche</h3>
<p>NAT gateway <b>source NAT with port translation</b> karta hai, jise aksar <b>PAT</b> ya "NAT overload" kehte hain. Sainkdon private instances ek hi public Elastic IP share karte hain. Unki conversations alag pehchanne ke liye gateway <b>source port</b> bhi rewrite karta hai aur mapping translation table mein yaad rakhta hai.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Source address aur port ka NAT translation">
<rect x="20" y="50" width="150" height="64" rx="8" fill="#bbf7d0"/><text x="95" y="75" text-anchor="middle" class="svg-ink" font-size="13">app-1</text><text x="95" y="95" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.4 : 41000</text>
<rect x="245" y="50" width="150" height="64" rx="8" fill="#fde68a"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.50 : 1024</text>
<rect x="470" y="50" width="150" height="64" rx="8" fill="#bae6fd"/><text x="545" y="75" text-anchor="middle" class="svg-ink" font-size="13">Mirror</text><text x="545" y="95" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20 : 443</text>
<line x1="170" y1="70" x2="245" y2="70" stroke="#64748b" stroke-width="2"/><line x1="395" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="245" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="470" y1="100" x2="395" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="207" y="42" text-anchor="middle" class="svg-accent" font-size="12">out</text><text x="432" y="42" text-anchor="middle" class="svg-accent" font-size="12">out</text>
<text x="207" y="124" text-anchor="middle" class="svg-muted" font-size="12">reply</text><text x="432" y="124" text-anchor="middle" class="svg-muted" font-size="12">reply</text>
<rect x="150" y="150" width="340" height="80" rx="8" fill="#f1f5f9" stroke="#94a3b8"/>
<text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="12">Translation table (illustrative)</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.4:41000 to 198.51.100.20:443 = 203.0.113.50:1024</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.9:52311 to 198.51.100.20:443 = 203.0.113.50:1025</text>
</svg><p class="cap">Solid arrows outbound packet hain, dashed arrows reply. Gateway reply ko apni table entry se match karke un-translate karta hai.</p></div>

<p>Sabse zaroori nateeja: table mein entry <b>sirf isliye hoti hai ki andar ke host ne pehle baat ki</b>. Internet se aaya packet jo kisi entry se match na kare, drop ho jaata hai. Isi liye bina kisi firewall rule ke NAT outbound-only hota hai.</p>

<h3>Gateway asal mein hai kya</h3>
<ul>
<li>Ek <b>managed service jo ek AZ ke andar highly available</b> hai. AWS aapke chune hue subnet mein private IP wala elastic network interface (ENI) rakhta hai. <b>Public</b> NAT gateway ke liye aap ek <b>Elastic IP</b> (static public IPv4 address jo aap apne account mein allocate karte ho) bhi attach karte ho.</li>
<li><b>TCP, UDP aur ICMP</b> support karta hai. Traffic ke saath apne aap scale hota hai. Published bandwidth limits kai baar badh chuki hain (purani books 45 Gbps likhti hain), isliye interview mein number bolne se pehle current NAT gateway quotas page dekho.</li>
<li>Isme <b>koi security group nahi</b> hota. Control route tables, uske subnet ke network ACL, aur peeche ke instances ke security groups (unke outbound rules) se hota hai.</li>
<li>Do <b>connectivity types</b>: <b>public</b> (internet access, Elastic IP chahiye, yeh module) aur <b>private</b> (Elastic IP nahi; Transit Gateway ya virtual private gateway ke through doosre VPCs ya on-premises networks tak jaata hai, internet kabhi nahi).</li>
</ul>

<h3>Port limits aur timeouts jo yaad rakhne hain</h3>
<ul>
<li>NAT gateway lagbhag <b>har unique destination (destination IP, port aur protocol) ke liye 55,000 simultaneous connections</b> tak hold kar sakta hai. Ek busy API endpoint par yeh limit lagi to naye connections fail honge. CloudWatch metric <code>ErrorPortAllocation</code> aise failures gintaa hai; yeh zero hona chahiye. Fix: destinations failao, aur NAT gateways badhao (har ek apne subnet aur apne Elastic IP ke saath), ya endpoints use karo.</li>
<li><b>Idle TCP connection 350 seconds ke baad timeout</b> ho jaata hai. Phir gateway mapping bhool jaata hai aur late packet ko reset milta hai. Lambe idle connections wali applications ko isse chhote TCP keepalives use karne chahiye.</li>
<li>Kaam ke CloudWatch metrics: <code>BytesOutToDestination</code>, <code>BytesInFromSource</code>, <code>ActiveConnectionCount</code>, <code>ConnectionAttemptCount</code>, <code>PacketsDropCount</code>, <code>ErrorPortAllocation</code>.</li>
</ul>

<h3>Life cycle states</h3>
<table class="cmp"><tr><th>State</th><th>Matlab</th></tr>
<tr><td>pending</td><td>ban raha hai; zaroori routes dalne se pehle ruko</td></tr>
<tr><td>available</td><td>kaam kar raha hai, aur <b>billing</b> chalu</td></tr>
<tr><td>failed</td><td>creation fail (jaise Elastic IP available nahi); delete karo</td></tr>
<tr><td>deleting / deleted</td><td>hat raha hai; deleted gateway thodi der dikhta hai phir gayab</td></tr></table>

<pre class="out">Illustrative output (aws ec2 describe-nat-gateways, trimmed)
NatGatewayId           State      SubnetId          ConnectivityType
nat-0123456789abcdef0  <span class="hl">available</span>  subnet-0aaa111122  public</pre>

<div class="eg"><b>Worked example.</b> 10.60.2.0/24 ke 40 build agents sab ek hi artifact server (198.51.100.20:443) se download karte hain. Har agent 2,000 connections kholta hai: ek destination par 80,000 connections. Yeh ~55,000 se zyada hai, isliye NAT gateway naye connections fail karne lagta hai aur <code>ErrorPortAllocation</code> badhta hai. Do NAT gateways aur do Elastic IPs (har private subnet apne gateway ko point kare) se har gateway ka load aadha ho jaata hai.</div>

<div class="warn"><b>Common mistake.</b> "NAT gateway par security group lagana". Koi hai hi nahi. Beginners yeh bhi bhool jaate hain ki public subnet ka <b>network ACL</b> NAT traffic par lagta hai, return traffic ke high ephemeral ports samet.</div>
<div class="exam"><b>Exam trap.</b> "Public NAT gateway ko kya chahiye?" Elastic IP aur public subnet. "Private NAT gateway ko kya chahiye?" Elastic IP nahi, aur woh internet tak kabhi nahi pahunch sakta.</div>

<div class="scn"><h4>Nightly sync mein intermittent timeouts</h4><p>Ek SaaS endpoint ka nightly job random fail hota tha. CloudWatch mein job ke time par hi <code>ErrorPortAllocation</code> spikes the: ek hi NAT gateway se same IP aur port par hazaaron parallel connections. Team ne doosra NAT gateway aur job mein connection pooling jod di.</p><p><b>Lesson:</b> PAT ki per-destination hard limit hoti hai; metric users se pehle bata deta hai.</p></div>

<div class="iv"><p class="q">"NAT gateway ErrorPortAllocation dikha raha hai. Iska matlab?"</p><p>Naye connection ke liye source port allocate nahi ho pa raha kyunki same destination IP, port aur protocol ke lagbhag 55,000 connections pehle se khule hain. Us destination ke connections kam karo (pooling), zyada Elastic IP wale zyada NAT gateways lagao, ya endpoints se NAT bypass karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT gateway PAT karta hai: source address aur port rewrite karta hai aur translation table rakhta hai.</li>
<li>Jis inbound packet ki table entry na ho woh drop hota hai, isliye NAT swabhaavik roop se outbound-only hai.</li>
<li>Gateway par security group nahi; subnet NACL aur route tables phir bhi lagte hain.</li>
<li>Lagbhag 55,000 connections per destination aur 350-second idle timeout yaad rakhne wale numbers hain.</li>
<li>Public type ko Elastic IP chahiye; private type internet tak kabhi nahi pahunchta.</li>
</ul></div>
`}};export{e as default};