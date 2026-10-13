var e={id:`contracts`,h:{en:`Contracts: subjects, filters, provider and consumer, and zoning rules`,hi:`Contracts: subjects, filters, provider aur consumer, aur zoning rules`},body:{en:`
<p>Think of a bank branch. The bank <b>provides</b> services at specific counters: cash at counter 1, loans at counter 4. Customers <b>consume</b> those services. A security guard at the door holds a list: "customers may approach counters 1 and 4; nobody may enter the vault". Nobody wrote a rule for every person; the rule is written once, between the group "customers" and the service "bank counters". In ACI that written rule is a <b>contract</b>, the groups are EPGs, and the guard is the leaf switch.</p>

<h3>The whitelist model</h3>
<p>Inside an EPG, endpoints talk freely. Between two EPGs in an <b>enforced</b> VRF, nothing is allowed until a contract permits it. So the first question in every "A cannot reach B" ticket is: are A and B in different EPGs, and is there a contract between them?</p>

<h3>Anatomy of a contract</h3>
<ul>
<li><b>Contract</b> (vzBrCP): the named agreement, for example WEB-TO-APP. It has a <b>scope</b>: <i>VRF</i> (default), <i>application profile</i>, <i>tenant</i> or <i>global</i> (for use between tenants, usually via an exported contract or a contract in tenant common).</li>
<li><b>Subject</b> (vzSubj): a section of the contract that groups filters and options such as <b>Apply Both Directions</b> and <b>Reverse Filter Ports</b>, a QoS class, or an L4-L7 service graph.</li>
<li><b>Filter</b> (vzFilter): a reusable list of <b>entries</b> (vzEntry). Each entry matches EtherType, IP protocol, destination and source port ranges, and optionally TCP flags or the <i>stateful</i> option.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Provider and consumer of a contract">
<rect x="20" y="80" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="102" text-anchor="middle" class="svg-ink" font-size="13">EPG WEB</text><text x="95" y="120" text-anchor="middle" class="svg-muted" font-size="12">consumer, pcTag 32770</text>
<rect x="470" y="80" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="102" text-anchor="middle" class="svg-ink" font-size="13">EPG APP</text><text x="545" y="120" text-anchor="middle" class="svg-muted" font-size="12">provider, pcTag 32771</text>
<rect x="215" y="20" width="210" height="170" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Contract WEB-TO-APP</text>
<rect x="235" y="55" width="170" height="60" rx="6" fill="#fde68a"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="12">Subject HTTP-SUBJ</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">both directions</text><text x="320" y="107" text-anchor="middle" class="svg-muted" font-size="12">reverse filter ports</text>
<rect x="235" y="125" width="170" height="50" rx="6" fill="#bae6fd"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="12">Filter HTTP-FLT</text><text x="320" y="163" text-anchor="middle" class="svg-muted" font-size="12">IP, TCP, dst 80</text>
<line x1="170" y1="105" x2="215" y2="105" stroke="#64748b" stroke-width="2"/><text x="192" y="98" text-anchor="middle" class="svg-accent" font-size="12">C</text>
<line x1="425" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="2"/><text x="448" y="98" text-anchor="middle" class="svg-accent" font-size="12">P</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">Consumer opens the session; provider offers the service</text>
</svg><p class="cap">The provider is the server side; the consumer is the client side.</p></div>

<h3>Direction and ports</h3>
<p>A filter written as "TCP destination port 80" describes the consumer-to-provider direction. <b>Apply Both Directions</b> (default on) also installs rules for provider-to-consumer traffic. <b>Reverse Filter Ports</b> (default on) swaps the ports for that return direction, so the reply <i>from</i> source port 80 is allowed. Turn Reverse Filter Ports off and the SYN reaches the server, but the SYN-ACK is dropped: the session never establishes.</p>

<h3>How leaves enforce contracts: zoning rules</h3>
<p>The APIC compiles contracts into <b>zoning rules</b> on each leaf where the EPGs are deployed. Rules match the source and destination <b>pcTag</b> (EPG class ID), the VRF scope (its VNID) and a filter ID. Enforcement normally happens on the <b>ingress leaf</b> when it knows the destination's EPG; otherwise the egress leaf enforces, using the source pcTag carried in the iVXLAN header.</p>
<pre class="out">LEAF101# show zoning-rule scope 2555904
+---------+--------+--------+----------+----------------+---------+---------+------------------+----------+----------------------+
| Rule ID | SrcEPG | DstEPG | FilterID |      Dir       |  operSt |  Scope  |       Name       |  Action  |       Priority       |
+---------+--------+--------+----------+----------------+---------+---------+------------------+----------+----------------------+
<span class="hl">|   4102  | 32770  | 32771  |    25    |     bi-dir     | enabled | 2555904 |    WEB-TO-APP    |  permit  |   fully_qual(7)      |</span>
|   4103  | 32771  | 32770  |    26    | uni-dir-ignore | enabled | 2555904 |    WEB-TO-APP    |  permit  |   fully_qual(7)      |
|   4096  |   0    |   0    | implarp  |    uni-dir     | enabled | 2555904 |                  |  permit  | any_any_filter(17)   |
|   4097  |   0    |   0    | implicit |    uni-dir     | enabled | 2555904 |                  | deny,log | any_any_any(21)      |
+---------+--------+--------+----------+----------------+---------+---------+------------------+----------+----------------------+</pre>
<p>Read it as: 32770 (WEB) to 32771 (APP) with filter 25 (TCP dst 80) is permitted; the return rule 32771 to 32770 uses filter 26 (TCP src 80); ARP is implicitly allowed; everything else is denied and logged. Dropped packets appear in:</p>
<pre class="out">LEAF101# show logging ip access-list internal packet-loss
[ Tue Sep 29 10:14:02 2026 412233 usecs]: CName: NK-PROD:PROD(VXLAN: 2555904), VlanType: FD_VLAN, Vlan-Id: 14,
SMac: 0x005056010011, DMac:0x0022bdf819ff, <span class="hl">SIP: 10.1.1.11, DIP: 10.1.2.21, SPort: 0, DPort: 0, Src Intf: Ethernet1/1, Proto: 1</span>, PktLen: 98</pre>
<p>Protocol 1 is ICMP: the ping from WEB1 to APP1 is denied, exactly as the design requires.</p>

<h3>Lab 3 walkthrough: allow only HTTP</h3>
<pre class="code"><span class="c">! Tenant NK-PROD &gt; Contracts</span>
Filters &gt; Create Filter: HTTP-FLT
    Entry: EtherType IP, IP Protocol tcp, Destination Port From 80 To 80
Standard &gt; Create Contract: WEB-TO-APP, Scope VRF
    Subject: HTTP-SUBJ, Filter HTTP-FLT, Apply Both Directions + Reverse Filter Ports
<span class="c">! who offers and who uses</span>
EPG APP &gt; Contracts &gt; Add Provided Contract: WEB-TO-APP
EPG WEB &gt; Contracts &gt; Add Consumed Contract: WEB-TO-APP
<span class="c">! verify: curl 10.1.2.21 works from WEB1 and WEB2; ping and SSH stay blocked</span></pre>

<h3>Shortcuts, and when to use them</h3>
<table class="cmp"><tr><th>Feature</th><th>Effect</th><th>Use with care because</th></tr>
<tr><td>VRF <b>Unenforced</b></td><td>No contracts needed inside the VRF</td><td>Every EPG reaches every EPG; no segmentation</td></tr>
<tr><td><b>Preferred group</b></td><td>Enable it on the VRF, include EPGs: members talk freely, non-members still need contracts</td><td>Good for migrating a flat network step by step</td></tr>
<tr><td><b>vzAny</b></td><td>"All EPGs of this VRF" as one consumer or provider</td><td>Saves TCAM for shared services such as DNS and NTP</td></tr>
<tr><td><b>Taboo contract</b> / deny filter</td><td>Explicitly denies matching traffic, evaluated before permits</td><td>Deny actions in normal contract subjects are the modern way</td></tr>
<tr><td>common / default contract</td><td>Filter <i>default</i> matches everything</td><td>Fine in a lab; far too wide for production</td></tr>
</table>

<div class="eg"><p><b>Worked example: TCAM with vzAny.</b> A VRF has 50 EPGs that all need DNS from EPG DNS-SRV. With one contract consumed by each EPG, the leaves need about 50 x 2 = 100 rules. With vzAny consuming the contract and DNS-SRV providing it, the leaves need 2 rules. Same security, 98 fewer TCAM entries per leaf.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Adding the contract as provided on both EPGs (nobody consumes it, so no rules). Turning off Reverse Filter Ports without writing a return filter. Expecting ping to work because TCP works: ICMP needs its own filter entry. "Fixing" a ticket with the default filter and leaving it there.</p></div>

<div class="exam"><p><b>Exam trap.</b> The consumer initiates, the provider serves. Default subject options are Apply Both Directions and Reverse Filter Ports, both on. Default contract scope is VRF. Contracts match pcTags, not IP addresses, and <code>show zoning-rule</code> is the command that proves what the hardware enforces.</p></div>

<div class="scn"><h4>The contract that allowed everything</h4><p>During a go-live, an engineer could not find which ports a new payment app used, so he attached the <i>common/default</i> contract between WEB and APP to "make it work". Six months later a security audit flagged it: any port from any web server into the payment tier. The team enabled logging, ran the app for a week and read <code>show logging ip access-list internal packet-loss</code> after temporarily applying a strict contract in a test EPG pair. The real flows were TCP 8443 and TCP 5671. They built a filter with those two entries, replaced the default contract during a window, and verified with <code>show zoning-rule</code>.</p><p><b>Lesson:</b> ACI makes least privilege easy to express; do not throw that away with a permit-any shortcut.</p></div>

<div class="iv"><p class="q">"Explain provider and consumer in an ACI contract, and how the leaf enforces it."</p><p>Strong answer: the provider EPG offers a service (the server side, for example APP on TCP 80); the consumer EPG uses it (the client side). The contract holds subjects, subjects hold filters, filters hold entries. With Apply Both Directions and Reverse Filter Ports, the return traffic is allowed. The APIC renders the contract into zoning rules keyed by source and destination pcTag and VRF scope, usually enforced on the ingress leaf; the rest is dropped by the implicit deny, visible in the packet-loss log. Bonus: vzAny, preferred groups and unenforced VRFs as trade-offs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Between EPGs in an enforced VRF, traffic needs a contract; inside an EPG it is allowed.</li>
<li>Contract → subject → filter → entry; provider = server, consumer = client; default scope VRF.</li>
<li>Apply Both Directions and Reverse Filter Ports (both on by default) allow the return traffic.</li>
<li>Leaves enforce zoning rules by pcTag; verify with show zoning-rule and the packet-loss log.</li>
<li>vzAny, preferred group and unenforced VRF simplify policy but reduce segmentation if misused.</li>
</ul></div>
`,hi:`
<p>Ek bank branch ke baare mein socho. Bank specific counters par services <b>provide</b> karta hai: counter 1 par cash, counter 4 par loans. Customers un services ko <b>consume</b> karte hain. Darwaze par security guard ke paas ek list hai: "customers counters 1 aur 4 tak ja sakte hain; vault mein koi nahi ja sakta". Kisi ne har insaan ke liye rule nahi likha; rule ek baar likha gaya hai, group "customers" aur service "bank counters" ke beech. ACI mein woh likha hua rule <b>contract</b> hai, groups EPGs hain, aur guard leaf switch hai.</p>

<h3>Whitelist model</h3>
<p>EPG ke andar endpoints free baat karte hain. <b>Enforced</b> VRF mein do EPGs ke beech kuch allowed nahi jab tak contract permit na kare. Isliye har "A, B tak nahi pahunchta" ticket ka pehla sawaal hai: kya A aur B alag EPGs mein hain, aur kya unke beech contract hai?</p>

<h3>Contract ki anatomy</h3>
<ul>
<li><b>Contract</b> (vzBrCP): naam wala agreement, jaise WEB-TO-APP. Iska ek <b>scope</b> hota hai: <i>VRF</i> (default), <i>application profile</i>, <i>tenant</i> ya <i>global</i> (tenants ke beech use ke liye, aam taur par exported contract ya tenant common ke contract se).</li>
<li><b>Subject</b> (vzSubj): contract ka ek section jo filters aur options jaise <b>Apply Both Directions</b> aur <b>Reverse Filter Ports</b>, QoS class, ya L4-L7 service graph ko group karta hai.</li>
<li><b>Filter</b> (vzFilter): <b>entries</b> (vzEntry) ki reusable list. Har entry EtherType, IP protocol, destination aur source port ranges, aur optionally TCP flags ya <i>stateful</i> option match karti hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Contract ka provider aur consumer">
<rect x="20" y="80" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="102" text-anchor="middle" class="svg-ink" font-size="13">EPG WEB</text><text x="95" y="120" text-anchor="middle" class="svg-muted" font-size="12">consumer, pcTag 32770</text>
<rect x="470" y="80" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="102" text-anchor="middle" class="svg-ink" font-size="13">EPG APP</text><text x="545" y="120" text-anchor="middle" class="svg-muted" font-size="12">provider, pcTag 32771</text>
<rect x="215" y="20" width="210" height="170" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Contract WEB-TO-APP</text>
<rect x="235" y="55" width="170" height="60" rx="6" fill="#fde68a"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="12">Subject HTTP-SUBJ</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">both directions</text><text x="320" y="107" text-anchor="middle" class="svg-muted" font-size="12">reverse filter ports</text>
<rect x="235" y="125" width="170" height="50" rx="6" fill="#bae6fd"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="12">Filter HTTP-FLT</text><text x="320" y="163" text-anchor="middle" class="svg-muted" font-size="12">IP, TCP, dst 80</text>
<line x1="170" y1="105" x2="215" y2="105" stroke="#64748b" stroke-width="2"/><text x="192" y="98" text-anchor="middle" class="svg-accent" font-size="12">C</text>
<line x1="425" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="2"/><text x="448" y="98" text-anchor="middle" class="svg-accent" font-size="12">P</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">Consumer session kholta hai; provider service deta hai</text>
</svg><p class="cap">Provider server side hai; consumer client side hai.</p></div>

<h3>Direction aur ports</h3>
<p>"TCP destination port 80" likha filter consumer se provider direction describe karta hai. <b>Apply Both Directions</b> (default on) provider se consumer traffic ke liye bhi rules install karta hai. <b>Reverse Filter Ports</b> (default on) us return direction ke liye ports swap karta hai, taaki source port 80 <i>se</i> aane wala reply allowed ho. Reverse Filter Ports off karo to SYN server tak pahunchta hai, lekin SYN-ACK drop hota hai: session kabhi establish nahi hota.</p>

<h3>Leaves contracts kaise enforce karte hain: zoning rules</h3>
<p>APIC contracts ko har us leaf par <b>zoning rules</b> mein compile karta hai jahan EPGs deployed hain. Rules source aur destination <b>pcTag</b> (EPG class ID), VRF scope (uska VNID) aur ek filter ID match karte hain. Enforcement normally <b>ingress leaf</b> par hota hai jab use destination ka EPG pata ho; warna egress leaf enforce karta hai, iVXLAN header mein aaye source pcTag ko use karke.</p>
<pre class="out">LEAF101# show zoning-rule scope 2555904
+---------+--------+--------+----------+----------------+---------+---------+------------------+----------+----------------------+
| Rule ID | SrcEPG | DstEPG | FilterID |      Dir       |  operSt |  Scope  |       Name       |  Action  |       Priority       |
+---------+--------+--------+----------+----------------+---------+---------+------------------+----------+----------------------+
<span class="hl">|   4102  | 32770  | 32771  |    25    |     bi-dir     | enabled | 2555904 |    WEB-TO-APP    |  permit  |   fully_qual(7)      |</span>
|   4103  | 32771  | 32770  |    26    | uni-dir-ignore | enabled | 2555904 |    WEB-TO-APP    |  permit  |   fully_qual(7)      |
|   4096  |   0    |   0    | implarp  |    uni-dir     | enabled | 2555904 |                  |  permit  | any_any_filter(17)   |
|   4097  |   0    |   0    | implicit |    uni-dir     | enabled | 2555904 |                  | deny,log | any_any_any(21)      |
+---------+--------+--------+----------+----------------+---------+---------+------------------+----------+----------------------+</pre>
<p>Aise padho: 32770 (WEB) se 32771 (APP) filter 25 (TCP dst 80) ke saath permitted hai; return rule 32771 se 32770 filter 26 (TCP src 80) use karta hai; ARP implicitly allowed hai; baaki sab deny aur log hota hai. Drop hue packets yahan dikhte hain:</p>
<pre class="out">LEAF101# show logging ip access-list internal packet-loss
[ Tue Sep 29 10:14:02 2026 412233 usecs]: CName: NK-PROD:PROD(VXLAN: 2555904), VlanType: FD_VLAN, Vlan-Id: 14,
SMac: 0x005056010011, DMac:0x0022bdf819ff, <span class="hl">SIP: 10.1.1.11, DIP: 10.1.2.21, SPort: 0, DPort: 0, Src Intf: Ethernet1/1, Proto: 1</span>, PktLen: 98</pre>
<p>Protocol 1 ICMP hai: WEB1 se APP1 ka ping denied hai, bilkul jaisa design chahta hai.</p>

<h3>Lab 3 walkthrough: sirf HTTP allow karo</h3>
<pre class="code"><span class="c">! Tenant NK-PROD &gt; Contracts</span>
Filters &gt; Create Filter: HTTP-FLT
    Entry: EtherType IP, IP Protocol tcp, Destination Port From 80 To 80
Standard &gt; Create Contract: WEB-TO-APP, Scope VRF
    Subject: HTTP-SUBJ, Filter HTTP-FLT, Apply Both Directions + Reverse Filter Ports
<span class="c">! kaun offer karta hai aur kaun use karta hai</span>
EPG APP &gt; Contracts &gt; Add Provided Contract: WEB-TO-APP
EPG WEB &gt; Contracts &gt; Add Consumed Contract: WEB-TO-APP
<span class="c">! verify: WEB1 aur WEB2 se curl 10.1.2.21 chalta hai; ping aur SSH blocked rehte hain</span></pre>

<h3>Shortcuts, aur unhe kab use karein</h3>
<table class="cmp"><tr><th>Feature</th><th>Effect</th><th>Dhyan se kyun</th></tr>
<tr><td>VRF <b>Unenforced</b></td><td>VRF ke andar contracts ki zaroorat nahi</td><td>Har EPG har EPG tak pahunchta hai; segmentation nahi</td></tr>
<tr><td><b>Preferred group</b></td><td>VRF par enable karo, EPGs include karo: members free baat karte hain, non-members ko abhi bhi contracts chahiye</td><td>Flat network ko step by step migrate karne ke liye achha</td></tr>
<tr><td><b>vzAny</b></td><td>"Is VRF ke saare EPGs" ek consumer ya provider ki tarah</td><td>DNS aur NTP jaisi shared services ke liye TCAM bachata hai</td></tr>
<tr><td><b>Taboo contract</b> / deny filter</td><td>Matching traffic ko explicitly deny karta hai, permits se pehle evaluate hota hai</td><td>Normal contract subjects mein deny actions modern tareeka hain</td></tr>
<tr><td>common / default contract</td><td>Filter <i>default</i> sab match karta hai</td><td>Lab mein theek; production ke liye bahut zyada wide</td></tr>
</table>

<div class="eg"><p><b>Worked example: vzAny ke saath TCAM.</b> Ek VRF mein 50 EPGs hain jinhe EPG DNS-SRV se DNS chahiye. Har EPG ek contract consume kare to leaves ko lagbhag 50 x 2 = 100 rules chahiye. vzAny contract consume kare aur DNS-SRV provide kare to leaves ko 2 rules chahiye. Same security, har leaf par 98 kam TCAM entries.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Contract ko dono EPGs par provided ki tarah jodna (koi consume nahi karta, isliye koi rules nahi). Return filter likhe bina Reverse Filter Ports off karna. TCP chalne ki wajah se ping chalne ki umeed rakhna: ICMP ko apni filter entry chahiye. Ticket ko default filter se "fix" karke waise hi chhod dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> Consumer initiate karta hai, provider serve karta hai. Default subject options Apply Both Directions aur Reverse Filter Ports hain, dono on. Default contract scope VRF hai. Contracts pcTags match karte hain, IP addresses nahi, aur <code>show zoning-rule</code> woh command hai jo saabit karti hai ki hardware kya enforce karta hai.</p></div>

<div class="scn"><h4>Woh contract jo sab allow karta tha</h4><p>Ek go-live ke dauraan, engineer ko pata nahi chal raha tha ki naya payment app kaunse ports use karta hai, isliye usne WEB aur APP ke beech <i>common/default</i> contract laga diya "chalane ke liye". Chhe mahine baad security audit ne ise flag kiya: kisi bhi web server se payment tier mein koi bhi port. Team ne test EPG pair par temporarily strict contract lagaya, logging enable karke app ko ek hafte chalaya aur <code>show logging ip access-list internal packet-loss</code> padha. Asli flows TCP 8443 aur TCP 5671 the. Unhone in do entries ka filter banaya, window mein default contract replace kiya, aur <code>show zoning-rule</code> se verify kiya.</p><p><b>Seekh:</b> ACI least privilege ko express karna aasaan banata hai; ise permit-any shortcut se barbaad mat karo.</p></div>

<div class="iv"><p class="q">"ACI contract mein provider aur consumer samjhao, aur leaf use kaise enforce karta hai."</p><p>Strong answer: provider EPG service offer karta hai (server side, jaise TCP 80 par APP); consumer EPG use use karta hai (client side). Contract mein subjects hote hain, subjects mein filters, filters mein entries. Apply Both Directions aur Reverse Filter Ports se return traffic allowed hota hai. APIC contract ko source aur destination pcTag aur VRF scope par based zoning rules mein render karta hai, aam taur par ingress leaf par enforce; baaki implicit deny se drop hota hai, jo packet-loss log mein dikhta hai. Bonus: trade-offs ki tarah vzAny, preferred groups aur unenforced VRFs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enforced VRF mein EPGs ke beech traffic ko contract chahiye; EPG ke andar allowed hai.</li>
<li>Contract → subject → filter → entry; provider = server, consumer = client; default scope VRF.</li>
<li>Apply Both Directions aur Reverse Filter Ports (dono default on) return traffic allow karte hain.</li>
<li>Leaves pcTag se zoning rules enforce karte hain; show zoning-rule aur packet-loss log se verify karo.</li>
<li>vzAny, preferred group aur unenforced VRF policy ko simple karte hain lekin galat use se segmentation kam hoti hai.</li>
</ul></div>
`}};export{e as default};