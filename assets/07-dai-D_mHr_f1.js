var e={id:`dai`,h:{en:`Dynamic ARP Inspection: stopping ARP spoofing`,hi:`Dynamic ARP Inspection: ARP spoofing rokna`},body:{en:`
<p>Imagine an apartment building where the postman asks loudly in the lobby, "Who lives in flat 101?" and believes whoever shouts back first. A trickster shouts "me!" and from then on receives flat 101's post, reads it, and maybe passes it on so nobody notices. That is ARP. <b>Dynamic ARP Inspection (DAI)</b> gives the postman the official residents' register: an answer is accepted only if it matches the register.</p>

<h3>Why ARP is easy to poison</h3>
<p>Before PC1 (10.30.0.11) can send a packet to its gateway 10.30.0.1, it needs the gateway's MAC. It broadcasts an ARP request, and the gateway replies with its MAC. The problem: ARP has <b>no authentication</b>, and hosts also accept <b>gratuitous</b> (unrequested) ARP replies and update their caches. An attacker (MALLORY, 10.30.0.66) can keep sending "10.30.0.1 is at 0050.7966.1e66" to PC1 and "10.30.0.11 is at 0050.7966.1e66" to the router. Both now send their traffic to MALLORY, who can read or change it and forward it on. This is <b>ARP poisoning</b>, a man-in-the-middle attack, and it works even on a switch with port security, because MALLORY uses only her own MAC.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="ARP poisoning and DAI">
<rect x="240" y="10" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">R1 10.30.0.1</text>
<rect x="240" y="100" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">SW1 DAI VLAN 30</text>
<line x1="320" y1="54" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><text x="330" y="82" class="svg-accent" font-size="12">Gi0/0 trusted</text>
<rect x="20" y="185" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="105" y="212" text-anchor="middle" class="svg-ink" font-size="12">PC1 .11 binding OK</text>
<rect x="450" y="185" width="170" height="44" rx="8" fill="#fed7aa"/><text x="535" y="212" text-anchor="middle" class="svg-ink" font-size="12">MALLORY .66</text>
<line x1="270" y1="144" x2="130" y2="185" stroke="#64748b" stroke-width="2"/><text x="150" y="165" class="svg-muted" font-size="12">Gi0/1 forwarded</text>
<line x1="370" y1="144" x2="510" y2="185" stroke="#64748b" stroke-width="2"/><text x="440" y="160" class="svg-muted" font-size="12">Gi0/6</text>
<text x="535" y="178" text-anchor="middle" class="svg-accent" font-size="12">"I am .1" dropped</text>
</svg><p class="cap">DAI checks every ARP on untrusted ports against the bindings. MALLORY's lie has no matching binding.</p></div>

<h3>How DAI works</h3>
<ol>
<li>You enable DAI per VLAN. In those VLANs the switch <b>intercepts every ARP request and reply</b> arriving on <b>untrusted</b> ports (all ports are untrusted by default).</li>
<li>For each ARP packet it checks the <b>sender MAC and sender IP</b> against the <b>DHCP snooping binding table</b> (dynamic leases plus static <code>ip source binding</code> entries) and any configured ARP ACL.</li>
<li>If the pair matches a binding for that VLAN, the ARP is forwarded. If not, it is <b>dropped and logged</b>.</li>
<li>ARP on <b>trusted</b> ports is not inspected at all. Trust uplinks and ports towards routers and other switches that also run DAI.</li>
</ol>
<p>DAI does not change ARP; it filters it. Legitimate hosts notice nothing, while a poisoning tool's lies never reach the victims.</p>

<h3>Static-IP hosts: the most important detail</h3>
<p>Hosts with manually configured IPs never did DHCP, so they have <b>no binding</b>. The moment DAI is enabled, their ARP packets fail the check and they lose connectivity. You have two options: add a <b>static binding</b> for each one, or permit them with an <b>ARP ACL</b> (next chapter). The gateway router also has a static IP, which is why its port is trusted.</p>

<div class="eg"><p><b>Worked example.</b> Finance VLAN 30 on SW1 uses static IPs. R1 (gateway 10.30.0.1) is on Gi0/0. PC1 is 0050.7966.1e01 / 10.30.0.11 on Gi0/1, PC2 is 0050.7966.1e02 / 10.30.0.12 on Gi0/2. A contractor laptop, MALLORY (0050.7966.1e66 / 10.30.0.66), on Gi0/6 was caught running ARP-poisoning tools. Plan: enable DHCP snooping for VLAN 30 (so the binding database is active for that VLAN) and trust Gi0/0, add static bindings for PC1 and PC2, trust Gi0/0 for DAI, enable DAI with source MAC validation.</p></div>

<h3>Configuration walkthrough</h3>
<pre class="code">SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 30
SW1(config)# interface g0/0
SW1(config-if)# ip dhcp snooping trust
SW1(config-if)# ip arp inspection trust                    <span class="c">! gateway: not inspected</span>
SW1(config-if)# exit
<span class="c">! static-IP hosts need static bindings</span>
SW1(config)# ip source binding 0050.7966.1e01 vlan 30 10.30.0.11 interface g0/1
SW1(config)# ip source binding 0050.7966.1e02 vlan 30 10.30.0.12 interface g0/2
SW1(config)# ip arp inspection vlan 30                      <span class="c">! turn DAI on last</span>
SW1(config)# ip arp inspection validate src-mac
SW1(config)# end</pre>
<p>Notice the order: the trust and the bindings are in place <b>before</b> <code>ip arp inspection vlan 30</code>, so PC1 and PC2 never lose their gateway. Also notice that DHCP snooping trust and DAI trust are <b>two separate commands</b>; one does not imply the other.</p>

<h3>Verification</h3>
<pre class="out">SW1# show ip source binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
<span class="hl">00:50:79:66:1E:01   10.30.0.11       infinite    static          30    GigabitEthernet0/1
00:50:79:66:1E:02   10.30.0.12       infinite    static          30    GigabitEthernet0/2</span>

SW1# show ip arp inspection interfaces
 Interface        Trust State     Rate (pps)    Burst Interval
 ---------------  -----------     ----------    --------------
<span class="hl"> Gi0/0            Trusted               None               N/A</span>
 Gi0/1            Untrusted               15                 1
 Gi0/2            Untrusted               15                 1
 Gi0/6            Untrusted               15                 1

SW1# show ip arp inspection vlan 30
Source Mac Validation      : Enabled
Destination Mac Validation : Disabled
IP Address Validation      : Disabled

 Vlan     Configuration    Operation   ACL Match          Static ACL
 ----     -------------    ---------   ---------          ----------
<span class="hl">   30     Enabled          Active</span>

%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Req) on Gi0/6, vlan 30.([0050.7966.1e66/10.30.0.66/0000.0000.0000/10.30.0.1/01:12:44 UTC Mon Mar 1 1993])</pre>
<p>The log line reads as sender MAC / sender IP / target MAC / target IP / time. MALLORY's ARP request for the gateway was denied because 0050.7966.1e66 / 10.30.0.66 has no binding. PC1 and PC2 still reach 10.30.0.1.</p>
<pre class="out">SW1# show ip arp inspection statistics vlan 30
 Vlan      Forwarded        Dropped     DHCP Drops      ACL Drops
 ----      ---------        -------     ----------      ---------
<span class="hl">   30              8              4              4              0</span></pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling DAI before creating static bindings, which instantly cuts off every static-IP host. (2) Forgetting to trust the router port; the gateway's ARP replies are dropped and the whole VLAN loses its gateway. (3) "Fixing" a dropped user by trusting the user port, which disables the protection exactly where it is needed. (4) Trusting DHCP snooping on the uplink but not DAI, or the reverse.</p></div>

<div class="exam"><p><b>Exam trap.</b> DAI relies on the <b>DHCP snooping binding table</b> (or static bindings / ARP ACLs). All ports are untrusted by default. Only ARP on untrusted ports is inspected. Port security does <b>not</b> stop ARP spoofing, because the attacker uses her own legitimate MAC.</p></div>

<div class="scn"><h4>The whole VLAN lost its gateway</h4><p>An engineer enabled <code>ip arp inspection vlan 20</code> on an access switch during business hours to "tighten security". Within seconds the whole floor lost internet. DHCP clients had bindings and were fine for ARP between themselves, but the gateway's ARP replies arrived on the uplink trunk, which was untrusted for DAI, and the router's static IP had no binding. <code>show ip arp inspection statistics</code> showed drops climbing. Adding <code>ip arp inspection trust</code> on the uplink restored the floor in seconds.</p><p><b>Lesson:</b> before enabling DAI, list every static IP (routers, servers, printers) and every uplink, and handle each one with trust, a static binding or an ARP ACL.</p></div>

<div class="iv"><p class="q">"How does Dynamic ARP Inspection prevent ARP poisoning, and what does it need to work?"</p><p>Strong answer: in DAI-enabled VLANs, the switch intercepts ARP packets on untrusted ports and forwards them only if the sender MAC and IP match the DHCP snooping binding table, a static binding or an ARP ACL; everything else is dropped and logged. It needs DHCP snooping bindings (or static entries), trusted uplinks and router ports, and a plan for static-IP hosts. Mention the order: bindings and trust first, then enable DAI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ARP has no authentication; poisoning makes victims send traffic to the attacker's MAC.</li>
<li>DAI inspects ARP on untrusted ports in enabled VLANs and checks sender MAC/IP against bindings.</li>
<li>Trust uplinks and router ports with ip arp inspection trust; it is separate from DHCP snooping trust.</li>
<li>Static-IP hosts need ip source binding entries or ARP ACLs, created before DAI is enabled.</li>
<li>Verify with show ip arp inspection (interfaces, vlan, statistics) and the SW_DAI syslog.</li>
</ul></div>
`,hi:`
<p>Ek apartment building socho jahan postman lobby mein zor se poochta hai, "Flat 101 mein kaun rehta hai?" aur jo pehle chillata hai us par bharosa kar leta hai. Ek chaalbaaz "main!" chillata hai aur us din se flat 101 ki daak use milti hai, woh padhta hai, aur shaayad aage bhi de deta hai taaki kisi ko pata na chale. Yahi ARP hai. <b>Dynamic ARP Inspection (DAI)</b> postman ko residents ka official register de deta hai: jawab tabhi maana jaata hai jab register se match kare.</p>

<h3>ARP ko poison karna aasaan kyun hai</h3>
<p>PC1 (10.30.0.11) apne gateway 10.30.0.1 ko packet bhejne se pehle gateway ka MAC chahta hai. Woh ARP request broadcast karta hai, aur gateway apne MAC se reply karta hai. Problem: ARP mein <b>koi authentication nahi</b>, aur hosts <b>gratuitous</b> (bina maange) ARP replies bhi accept karke apni cache update kar lete hain. Attacker (MALLORY, 10.30.0.66) PC1 ko baar baar "10.30.0.1 0050.7966.1e66 par hai" aur router ko "10.30.0.11 0050.7966.1e66 par hai" bhej sakti hai. Ab dono apna traffic MALLORY ko bhejte hain, jo use padh ya badal kar aage bhej sakti hai. Yeh <b>ARP poisoning</b> hai, ek man-in-the-middle attack, aur yeh port security wale switch par bhi chalta hai, kyunki MALLORY sirf apna MAC use karti hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="ARP poisoning aur DAI">
<rect x="240" y="10" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">R1 10.30.0.1</text>
<rect x="240" y="100" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">SW1 DAI VLAN 30</text>
<line x1="320" y1="54" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><text x="330" y="82" class="svg-accent" font-size="12">Gi0/0 trusted</text>
<rect x="20" y="185" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="105" y="212" text-anchor="middle" class="svg-ink" font-size="12">PC1 .11 binding OK</text>
<rect x="450" y="185" width="170" height="44" rx="8" fill="#fed7aa"/><text x="535" y="212" text-anchor="middle" class="svg-ink" font-size="12">MALLORY .66</text>
<line x1="270" y1="144" x2="130" y2="185" stroke="#64748b" stroke-width="2"/><text x="150" y="165" class="svg-muted" font-size="12">Gi0/1 forward</text>
<line x1="370" y1="144" x2="510" y2="185" stroke="#64748b" stroke-width="2"/><text x="440" y="160" class="svg-muted" font-size="12">Gi0/6</text>
<text x="535" y="178" text-anchor="middle" class="svg-accent" font-size="12">"main .1 hoon" drop</text>
</svg><p class="cap">DAI untrusted ports par har ARP ko bindings se check karta hai. MALLORY ke jhooth ki koi matching binding nahi hai.</p></div>

<h3>DAI kaise kaam karta hai</h3>
<ol>
<li>Aap DAI per VLAN enable karte ho. Un VLANs mein switch <b>untrusted</b> ports par aane wali <b>har ARP request aur reply ko intercept</b> karta hai (saare ports default mein untrusted hain).</li>
<li>Har ARP packet ke liye woh <b>sender MAC aur sender IP</b> ko <b>DHCP snooping binding table</b> (dynamic leases plus static <code>ip source binding</code> entries) aur kisi configured ARP ACL se check karta hai.</li>
<li>Agar pair us VLAN ki kisi binding se match karta hai, ARP forward hota hai. Agar nahi, to <b>drop aur log</b> hota hai.</li>
<li><b>Trusted</b> ports par ARP bilkul inspect nahi hota. Uplinks aur routers ki taraf ke ports, aur DAI chalane wale dusre switches ki taraf ke ports trust karo.</li>
</ol>
<p>DAI ARP ko badalta nahi; use filter karta hai. Legitimate hosts ko kuch pata nahi chalta, jabki poisoning tool ke jhooth kabhi victims tak nahi pahunchte.</p>

<h3>Static-IP hosts: sabse zaroori detail</h3>
<p>Manually configured IP wale hosts ne kabhi DHCP kiya hi nahi, isliye unki <b>koi binding nahi</b> hoti. Jaise hi DAI enable hota hai, unke ARP packets check fail karte hain aur unki connectivity chali jaati hai. Aapke paas do options hain: har ek ke liye <b>static binding</b> jodo, ya unhe <b>ARP ACL</b> se permit karo (agla chapter). Gateway router ka bhi static IP hai, isiliye uska port trusted hai.</p>

<div class="eg"><p><b>Worked example.</b> SW1 par finance VLAN 30 static IPs use karta hai. R1 (gateway 10.30.0.1) Gi0/0 par hai. PC1 0050.7966.1e01 / 10.30.0.11 Gi0/1 par, PC2 0050.7966.1e02 / 10.30.0.12 Gi0/2 par. Ek contractor laptop, MALLORY (0050.7966.1e66 / 10.30.0.66), Gi0/6 par ARP-poisoning tools chalate pakda gaya. Plan: VLAN 30 ke liye DHCP snooping enable karo (taaki us VLAN ke liye binding database active ho) aur Gi0/0 trust karo, PC1 aur PC2 ke liye static bindings jodo, Gi0/0 ko DAI ke liye trust karo, source MAC validation ke saath DAI enable karo.</p></div>

<h3>Configuration walkthrough</h3>
<pre class="code">SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 30
SW1(config)# interface g0/0
SW1(config-if)# ip dhcp snooping trust
SW1(config-if)# ip arp inspection trust                    <span class="c">! gateway: inspect nahi hota</span>
SW1(config-if)# exit
<span class="c">! static-IP hosts ko static bindings chahiye</span>
SW1(config)# ip source binding 0050.7966.1e01 vlan 30 10.30.0.11 interface g0/1
SW1(config)# ip source binding 0050.7966.1e02 vlan 30 10.30.0.12 interface g0/2
SW1(config)# ip arp inspection vlan 30                      <span class="c">! DAI sabse aakhir mein on</span>
SW1(config)# ip arp inspection validate src-mac
SW1(config)# end</pre>
<p>Order dekho: trust aur bindings <code>ip arp inspection vlan 30</code> se <b>pehle</b> lag jaate hain, isliye PC1 aur PC2 kabhi apna gateway nahi khote. Yeh bhi dekho ki DHCP snooping trust aur DAI trust <b>do alag commands</b> hain; ek se doosra apne aap nahi hota.</p>

<h3>Verification</h3>
<pre class="out">SW1# show ip source binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
<span class="hl">00:50:79:66:1E:01   10.30.0.11       infinite    static          30    GigabitEthernet0/1
00:50:79:66:1E:02   10.30.0.12       infinite    static          30    GigabitEthernet0/2</span>

SW1# show ip arp inspection interfaces
 Interface        Trust State     Rate (pps)    Burst Interval
 ---------------  -----------     ----------    --------------
<span class="hl"> Gi0/0            Trusted               None               N/A</span>
 Gi0/1            Untrusted               15                 1
 Gi0/2            Untrusted               15                 1
 Gi0/6            Untrusted               15                 1

SW1# show ip arp inspection vlan 30
Source Mac Validation      : Enabled
Destination Mac Validation : Disabled
IP Address Validation      : Disabled

 Vlan     Configuration    Operation   ACL Match          Static ACL
 ----     -------------    ---------   ---------          ----------
<span class="hl">   30     Enabled          Active</span>

%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Req) on Gi0/6, vlan 30.([0050.7966.1e66/10.30.0.66/0000.0000.0000/10.30.0.1/01:12:44 UTC Mon Mar 1 1993])</pre>
<p>Log line ko aise padho: sender MAC / sender IP / target MAC / target IP / time. MALLORY ki gateway ke liye ARP request deny hui kyunki 0050.7966.1e66 / 10.30.0.66 ki koi binding nahi hai. PC1 aur PC2 abhi bhi 10.30.0.1 tak pahunchte hain.</p>
<pre class="out">SW1# show ip arp inspection statistics vlan 30
 Vlan      Forwarded        Dropped     DHCP Drops      ACL Drops
 ----      ---------        -------     ----------      ---------
<span class="hl">   30              8              4              4              0</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> (1) Static bindings banane se pehle DAI enable karna, jo har static-IP host ko turant kaat deta hai. (2) Router port trust karna bhool jaana; gateway ke ARP replies drop hote hain aur poora VLAN apna gateway kho deta hai. (3) Drop hue user ko "fix" karne ke liye user port trust karna, jo protection wahi band kar deta hai jahan uski zaroorat hai. (4) Uplink par DHCP snooping trust karna lekin DAI nahi, ya ulta.</p></div>

<div class="exam"><p><b>Exam trap.</b> DAI <b>DHCP snooping binding table</b> (ya static bindings / ARP ACLs) par depend karta hai. Saare ports default mein untrusted hain. Sirf untrusted ports par ARP inspect hota hai. Port security ARP spoofing <b>nahi</b> rokta, kyunki attacker apna hi legitimate MAC use karti hai.</p></div>

<div class="scn"><h4>Poore VLAN ka gateway chala gaya</h4><p>Ek engineer ne business hours mein "security tight karne" ke liye access switch par <code>ip arp inspection vlan 20</code> enable kiya. Seconds mein poore floor ka internet chala gaya. DHCP clients ki bindings thi aur aapas ke ARP ke liye woh theek the, lekin gateway ke ARP replies uplink trunk par aate the, jo DAI ke liye untrusted tha, aur router ke static IP ki koi binding nahi thi. <code>show ip arp inspection statistics</code> mein drops badhte dikhe. Uplink par <code>ip arp inspection trust</code> jodte hi seconds mein floor wapas aa gaya.</p><p><b>Seekh:</b> DAI enable karne se pehle har static IP (routers, servers, printers) aur har uplink ki list banao, aur har ek ko trust, static binding ya ARP ACL se handle karo.</p></div>

<div class="iv"><p class="q">"Dynamic ARP Inspection ARP poisoning kaise rokta hai, aur use kaam karne ke liye kya chahiye?"</p><p>Strong answer: DAI-enabled VLANs mein switch untrusted ports par ARP packets intercept karta hai aur unhe tabhi forward karta hai jab sender MAC aur IP DHCP snooping binding table, static binding ya ARP ACL se match karein; baaki sab drop aur log hota hai. Ise DHCP snooping bindings (ya static entries), trusted uplinks aur router ports, aur static-IP hosts ke liye plan chahiye. Order batao: pehle bindings aur trust, phir DAI enable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ARP mein authentication nahi hai; poisoning se victims attacker ke MAC ko traffic bhejte hain.</li>
<li>DAI enabled VLANs mein untrusted ports par ARP inspect karta hai aur sender MAC/IP ko bindings se check karta hai.</li>
<li>Uplinks aur router ports ko ip arp inspection trust se trust karo; yeh DHCP snooping trust se alag hai.</li>
<li>Static-IP hosts ko ip source binding entries ya ARP ACLs chahiye, DAI enable karne se pehle.</li>
<li>show ip arp inspection (interfaces, vlan, statistics) aur SW_DAI syslog se verify karo.</li>
</ul></div>
`}};export{e as default};