var e={id:`big-picture`,h:{en:`The big picture: who, what and how much reaches the router`,hi:`Big picture: router tak kaun, kya aur kitna pahunchta hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to lock down how people and packets reach a Cisco IOS XE router or switch. You will harden the console and VTY lines, create local users with strong secret types, turn on <code>aaa new-model</code>, build method lists for login, enable and exec, connect the device to a TACACS+ or RADIUS server, authorize commands, record every session, keep an emergency account that is safe, write ACLs at CCNP depth, protect the CPU with Control Plane Policing (CoPP) and explain how REST APIs are secured. This covers CCNP ENCOR 350-401 v1.2 blueprint items <b>5.1</b> (device access control with lines, local users and AAA), <b>5.2</b> (infrastructure security: ACLs and CoPP) and <b>5.3</b> (REST API security).</p>

<p><b>Prerequisites.</b> CCNA-level IOS CLI, SSH, IP addressing and wildcard masks, and basic ACLs. For CoPP you should know MQC (class-map, policy-map, service-policy) and policers from the <b>QoS essentials</b> module; we reuse them here instead of teaching them again. The next module, <b>Threat defense, 802.1X and TrustSec</b>, uses RADIUS for network access; this module focuses on RADIUS and TACACS+ for <b>device administration</b>. Later, the <b>YANG, NETCONF and RESTCONF</b> module uses the API security ideas from chapter 10.</p>

<h3>An analogy: a bank branch after closing time</h3>
<p>Think of a bank branch. The <b>vault</b> holds the money; that is the router's forwarding job. The <b>manager's office</b> holds the keys and the rules; that is the control plane, where routing protocols decide where money moves. The <b>staff entrance</b> is how employees get in; that is the management plane. A good bank protects all three in different ways:</p>
<ul>
<li>At the staff entrance, every employee has a <b>personal badge</b>, the badge decides which rooms they can open, and the door logs every entry. That is <b>AAA</b>: authentication, authorization and accounting.</li>
<li>On the doors between rooms there are <b>locks with lists</b> of who may pass. Those are <b>ACLs</b>.</li>
<li>At the manager's office there is a <b>receptionist</b> who only lets a few visitors per minute in, so a crowd cannot stop the manager working. That is <b>CoPP</b>.</li>
<li>For a fire at 3 a.m. there is a <b>sealed envelope with a master key</b>. Anyone who opens it must sign, and the key is changed afterwards. That is a <b>break-glass account</b> done right.</li>
</ul>

<h3>Three planes, three kinds of protection</h3>
<p>A router does three jobs. The <b>data plane</b> forwards transit packets in hardware or CEF; these packets pass <i>through</i> the router. The <b>control plane</b> runs OSPF, BGP, ARP, HSRP and builds the tables. The <b>management plane</b> is SSH, SNMP, NTP, syslog, RESTCONF: how people and tools operate the box. Control and management packets are addressed <i>to</i> the router, so they are <b>punted</b> (handed) to the route processor CPU. The CPU is far slower than the forwarding hardware, which makes it the easiest target for an attack.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Three planes and their protections">
<rect x="20" y="20" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="115" y="45" text-anchor="middle" class="svg-ink" font-size="14">Management plane</text><text x="115" y="64" text-anchor="middle" class="svg-muted" font-size="12">SSH, SNMP, RESTCONF</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Control plane</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">OSPF, BGP, ARP</text>
<rect x="430" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="525" y="45" text-anchor="middle" class="svg-ink" font-size="14">Data plane</text><text x="525" y="64" text-anchor="middle" class="svg-muted" font-size="12">transit packets</text>
<rect x="20" y="110" width="395" height="44" rx="8" fill="#fde68a"/><text x="217" y="137" text-anchor="middle" class="svg-ink" font-size="13">Route processor CPU (slow, shared)</text>
<line x1="115" y1="80" x2="115" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="110" width="190" height="44" rx="8" fill="#e2e8f0"/><text x="525" y="137" text-anchor="middle" class="svg-ink" font-size="13">Forwarding ASIC / CEF</text>
<line x1="525" y1="80" x2="525" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="115" y="185" text-anchor="middle" class="svg-accent" font-size="12">AAA, SSH, VTY ACL</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">CoPP in front of CPU</text>
<text x="525" y="185" text-anchor="middle" class="svg-accent" font-size="12">Interface ACLs, uRPF</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Packets TO the router are punted to the CPU;</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">packets THROUGH the router stay in hardware.</text>
</svg><p class="cap">Each plane needs its own protection. AAA answers "who", ACLs answer "what", CoPP answers "how much".</p></div>

<h3>Management plane threats</h3>
<p>What do we actually defend against? The most common real problems are simple:</p>
<ul>
<li><b>Shared passwords.</b> One <code>enable</code> password known by twenty people, never changed when someone leaves, and no way to tell who made a change.</li>
<li><b>Clear-text protocols.</b> Telnet, SNMPv1/v2c and plain web management send credentials readable by anyone who captures traffic.</li>
<li><b>Open VTY lines.</b> SSH reachable from the whole internet or user LAN, so password guessing can run all day.</li>
<li><b>Weak stored passwords.</b> Type 7 passwords in configs that are pasted into tickets and reversed in seconds.</li>
<li><b>CPU exhaustion.</b> A flood of pings, telnet attempts or malformed packets aimed at the router, so routing adjacencies flap and admins cannot log in.</li>
<li><b>Unaudited changes.</b> No accounting, so after an outage nobody knows which command caused it.</li>
</ul>
<p>Each chapter removes one of these weaknesses.</p>

<h3>The labs you will build</h3>
<p>The module has three hands-on labs, and the chapters use the same device names and addresses:</p>
<ul>
<li><b>Lab · Central logins with TACACS+ and a local fallback.</b> R1 (10.10.10.1 on Gi0/1), PC-ADMIN (10.10.10.50) and the ISE server (10.10.10.100) with users netadmin (privilege 15) and helpdesk (privilege 1). The local account <code>backup</code> is only a fallback.</li>
<li><b>Troubleshoot · Everybody is using the emergency account.</b> Same topology, RADIUS instead of TACACS+, and two mistakes that make every personal login fail over to the local account.</li>
<li><b>Lab · Protect the router CPU with CoPP.</b> R1 with OSPF to R2 (10.0.12.0/30), a user LAN 10.1.1.0/24 with PC-USER, and a management LAN 10.99.0.0/24 with the MGMT host.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A branch router has 40 admins across three teams. Without AAA: one enable secret, 40 people, zero audit trail. With AAA and TACACS+: 40 personal accounts on one server, helpdesk limited to privilege 1, network engineers at 15, every command logged with the username, and a leaver disabled in one place in under a minute. The only local account is one break-glass user whose secret is stored in a vault and used only when the servers are unreachable.</p></div>

<div class="warn"><p><b>Common mistake.</b> Hardening only the data plane (interface ACLs) and leaving the router itself open. Transit ACLs do not protect SSH on the router's own addresses unless you design them as infrastructure ACLs, and they never limit how fast legitimate-looking packets hit the CPU.</p></div>

<div class="exam"><p><b>Exam trap.</b> The blueprint says "configure and verify" for lines, AAA, ACLs and CoPP, but only "describe" for REST API security. Expect CLI output questions on the first group and concept questions (tokens, HTTPS, basic authentication risk) on the second.</p></div>

<div class="scn"><h4>The laptop that took down routing</h4><p>An infected laptop on a user VLAN started sending thousands of pings and telnet attempts per second at the default gateway. The router CPU reached 100 %, OSPF hellos to the core were delayed past the dead interval, and the adjacency flapped every few minutes. Admins could not SSH in to investigate because the VTY lines were busy with the attack. The team finally used the console, found the source with <code>show processes cpu sorted</code> and interface counters, and shut the port.</p><p><b>Lesson:</b> routing and management share one CPU. Without CoPP and VTY restrictions, a single host can disrupt the whole site. Chapter 9 builds the fix.</p></div>

<div class="iv"><p class="q">"What are the three planes of a router, and how do you protect each one?"</p><p>A strong answer names the data plane (transit forwarding, protected by interface ACLs and uRPF), the control plane (routing protocols and ARP, protected by CoPP, routing authentication and TTL security) and the management plane (SSH, SNMP, APIs, protected by SSH only, VTY ACLs, AAA, SNMPv3 and HTTPS). Mention that packets to the router are punted to a slow CPU, which is why CoPP exists.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers ENCOR 5.1 (lines, local users, AAA), 5.2 (ACLs, CoPP) and 5.3 (REST API security).</li>
<li>Data plane traffic passes through; control and management traffic is punted to the CPU.</li>
<li>AAA controls who logs in and what they do, ACLs control what may pass, CoPP controls how much reaches the CPU.</li>
<li>Shared passwords, clear-text protocols, open VTYs, weak password types and CPU floods are the classic threats.</li>
<li>The labs use R1, PC-ADMIN, ISE (10.10.10.0/24) and R1, R2, PC-USER, MGMT for CoPP.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap yeh control kar paoge ki log aur packets Cisco IOS XE router ya switch tak kaise pahunchte hain. Aap console aur VTY lines harden karoge, strong secret types ke saath local users banaoge, <code>aaa new-model</code> chalu karoge, login, enable aur exec ke liye method lists banaoge, device ko TACACS+ ya RADIUS server se jodoge, commands authorize karoge, har session record karoge, ek safe emergency account rakhoge, CCNP depth par ACLs likhoge, Control Plane Policing (CoPP) se CPU bachaoge aur samjhaoge ki REST APIs kaise secure hoti hain. Yeh CCNP ENCOR 350-401 v1.2 blueprint ke items <b>5.1</b> (lines, local users aur AAA se device access control), <b>5.2</b> (infrastructure security: ACLs aur CoPP) aur <b>5.3</b> (REST API security) cover karta hai.</p>

<p><b>Prerequisites.</b> CCNA level ka IOS CLI, SSH, IP addressing aur wildcard masks, aur basic ACLs. CoPP ke liye aapko <b>QoS essentials</b> module se MQC (class-map, policy-map, service-policy) aur policers aane chahiye; hum unhe dobara padhane ki jagah yahan reuse karenge. Agla module, <b>Threat defense, 802.1X aur TrustSec</b>, network access ke liye RADIUS use karta hai; yeh module RADIUS aur TACACS+ ko <b>device administration</b> ke liye dekhta hai. Baad mein <b>YANG, NETCONF aur RESTCONF</b> module chapter 10 ke API security ideas use karta hai.</p>

<h3>Ek analogy: band hone ke baad bank branch</h3>
<p>Ek bank branch socho. <b>Vault</b> mein paisa hai; yeh router ka forwarding kaam hai. <b>Manager ke office</b> mein chaabiyan aur niyam hain; yeh control plane hai, jahan routing protocols tay karte hain ki paisa kahan jaaye. <b>Staff entrance</b> se employees andar aate hain; yeh management plane hai. Achha bank teeno ko alag tarike se bachata hai:</p>
<ul>
<li>Staff entrance par har employee ka <b>personal badge</b> hai, badge tay karta hai ki woh kaunse kamre khol sakta hai, aur darwaza har entry log karta hai. Yahi <b>AAA</b> hai: authentication, authorization aur accounting.</li>
<li>Kamron ke beech ke darwazon par <b>list wale taale</b> hain ki kaun jaa sakta hai. Yeh <b>ACLs</b> hain.</li>
<li>Manager ke office par ek <b>receptionist</b> hai jo har minute sirf kuch visitors andar jaane deta hai, taaki bheed manager ka kaam na rok sake. Yeh <b>CoPP</b> hai.</li>
<li>Raat 3 baje aag lagne ke liye ek <b>sealed envelope mein master key</b> hai. Jo bhi use khole use sign karna padta hai, aur baad mein key badli jaati hai. Yeh sahi tarike se bana <b>break-glass account</b> hai.</li>
</ul>

<h3>Teen planes, teen tarah ki suraksha</h3>
<p>Router teen kaam karta hai. <b>Data plane</b> transit packets ko hardware ya CEF mein forward karta hai; yeh packets router ke <i>aar-paar</i> jaate hain. <b>Control plane</b> OSPF, BGP, ARP, HSRP chalata hai aur tables banata hai. <b>Management plane</b> SSH, SNMP, NTP, syslog, RESTCONF hai: log aur tools box ko kaise chalate hain. Control aur management packets router <i>ko</i> address kiye jaate hain, isliye woh route processor CPU ko <b>punt</b> (saunp) diye jaate hain. CPU forwarding hardware se bahut dheema hai, isliye woh attack ka sabse aasaan target hai.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Teen planes aur unki suraksha">
<rect x="20" y="20" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="115" y="45" text-anchor="middle" class="svg-ink" font-size="14">Management plane</text><text x="115" y="64" text-anchor="middle" class="svg-muted" font-size="12">SSH, SNMP, RESTCONF</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Control plane</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">OSPF, BGP, ARP</text>
<rect x="430" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="525" y="45" text-anchor="middle" class="svg-ink" font-size="14">Data plane</text><text x="525" y="64" text-anchor="middle" class="svg-muted" font-size="12">transit packets</text>
<rect x="20" y="110" width="395" height="44" rx="8" fill="#fde68a"/><text x="217" y="137" text-anchor="middle" class="svg-ink" font-size="13">Route processor CPU (dheema, shared)</text>
<line x1="115" y1="80" x2="115" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="110" width="190" height="44" rx="8" fill="#e2e8f0"/><text x="525" y="137" text-anchor="middle" class="svg-ink" font-size="13">Forwarding ASIC / CEF</text>
<line x1="525" y1="80" x2="525" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="115" y="185" text-anchor="middle" class="svg-accent" font-size="12">AAA, SSH, VTY ACL</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">CPU ke aage CoPP</text>
<text x="525" y="185" text-anchor="middle" class="svg-accent" font-size="12">Interface ACLs, uRPF</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Router KO aane wale packets CPU ko punt hote hain;</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">router ke AAR-PAAR jaane wale hardware mein rehte hain.</text>
</svg><p class="cap">Har plane ko apni suraksha chahiye. AAA "kaun" ka jawab deta hai, ACLs "kya" ka, CoPP "kitna" ka.</p></div>

<h3>Management plane ke khatre</h3>
<p>Hum asal mein kis cheez se bachate hain? Sabse aam real problems simple hain:</p>
<ul>
<li><b>Shared passwords.</b> Ek <code>enable</code> password jo bees log jaante hain, kisi ke jaane par kabhi nahi badla, aur yeh pata karne ka koi tareeka nahi ki change kisne kiya.</li>
<li><b>Clear-text protocols.</b> Telnet, SNMPv1/v2c aur plain web management credentials aise bhejte hain ki traffic capture karne wala koi bhi padh le.</li>
<li><b>Khuli VTY lines.</b> SSH poore internet ya user LAN se reachable, isliye password guessing din bhar chal sakti hai.</li>
<li><b>Kamzor stored passwords.</b> Configs mein type 7 passwords jo tickets mein paste hote hain aur seconds mein ulte kar diye jaate hain.</li>
<li><b>CPU exhaustion.</b> Router par pings, telnet attempts ya kharab packets ki baadh, jisse routing adjacencies flap hoti hain aur admins login nahi kar paate.</li>
<li><b>Bina audit ke changes.</b> Koi accounting nahi, isliye outage ke baad kisi ko nahi pata ki kaunse command ne gadbad ki.</li>
</ul>
<p>Har chapter in kamzoriyon mein se ek ko hatata hai.</p>

<h3>Aap kaunsi labs banaoge</h3>
<p>Module mein teen hands-on labs hain, aur chapters wahi device names aur addresses use karte hain:</p>
<ul>
<li><b>Lab · TACACS+ se central login aur local fallback.</b> R1 (Gi0/1 par 10.10.10.1), PC-ADMIN (10.10.10.50) aur ISE server (10.10.10.100) jisme users netadmin (privilege 15) aur helpdesk (privilege 1) hain. Local account <code>backup</code> sirf fallback hai.</li>
<li><b>Troubleshoot · Sab emergency account se login kar rahe hain.</b> Same topology, TACACS+ ki jagah RADIUS, aur do galtiyan jinki wajah se har personal login local account par fail over ho jaata hai.</li>
<li><b>Lab · CoPP se router CPU bachao.</b> R1 jiska OSPF R2 ke saath hai (10.0.12.0/30), PC-USER wala user LAN 10.1.1.0/24, aur MGMT host wala management LAN 10.99.0.0/24.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek branch router ke teen teams mein 40 admins hain. AAA ke bina: ek enable secret, 40 log, zero audit trail. AAA aur TACACS+ ke saath: ek server par 40 personal accounts, helpdesk privilege 1 tak seemit, network engineers 15 par, har command username ke saath log, aur jaane wala ek minute se kam mein ek hi jagah band. Sirf ek local account bachta hai, break-glass user, jiska secret vault mein rakha hai aur jo sirf tab use hota hai jab servers unreachable hon.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf data plane (interface ACLs) harden karna aur router ko khud khula chhod dena. Transit ACLs router ke apne addresses par SSH ko tab tak nahi bachate jab tak aap unhe infrastructure ACLs ki tarah design na karo, aur woh kabhi limit nahi karte ki sahi dikhne wale packets CPU par kitni tezi se aate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint lines, AAA, ACLs aur CoPP ke liye "configure and verify" kehta hai, lekin REST API security ke liye sirf "describe". Pehle group par CLI output questions aur doosre par concept questions (tokens, HTTPS, basic authentication ka risk) expect karo.</p></div>

<div class="scn"><h4>Woh laptop jisne routing gira di</h4><p>User VLAN par ek infected laptop ne default gateway par har second hazaaron pings aur telnet attempts bhejne shuru kar diye. Router CPU 100 % par pahuncha, core ki taraf OSPF hellos dead interval se zyada late hue, aur adjacency har kuch minute mein flap hui. Admins jaanch ke liye SSH nahi kar paaye kyunki VTY lines attack mein busy thi. Aakhir mein team ne console use kiya, <code>show processes cpu sorted</code> aur interface counters se source dhoonda, aur port band kiya.</p><p><b>Seekh:</b> routing aur management ek hi CPU share karte hain. CoPP aur VTY restrictions ke bina ek akela host poori site bigaad sakta hai. Chapter 9 iska fix banata hai.</p></div>

<div class="iv"><p class="q">"Router ke teen planes kaunse hain, aur har ek ko kaise protect karte ho?"</p><p>Strong answer data plane (transit forwarding, interface ACLs aur uRPF se protected), control plane (routing protocols aur ARP, CoPP, routing authentication aur TTL security se protected) aur management plane (SSH, SNMP, APIs, sirf-SSH, VTY ACLs, AAA, SNMPv3 aur HTTPS se protected) ka naam leta hai. Batao ki router ko aane wale packets dheeme CPU ko punt hote hain, isiliye CoPP exist karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module ENCOR 5.1 (lines, local users, AAA), 5.2 (ACLs, CoPP) aur 5.3 (REST API security) cover karta hai.</li>
<li>Data plane traffic aar-paar jaata hai; control aur management traffic CPU ko punt hota hai.</li>
<li>AAA control karta hai kaun login kare aur kya kare, ACLs control karte hain kya guzre, CoPP control karta hai CPU tak kitna pahunche.</li>
<li>Shared passwords, clear-text protocols, khuli VTYs, kamzor password types aur CPU floods classic khatre hain.</li>
<li>Labs R1, PC-ADMIN, ISE (10.10.10.0/24) aur CoPP ke liye R1, R2, PC-USER, MGMT use karti hain.</li>
</ul></div>
`}};export{e as default};