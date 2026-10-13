var e={id:`big-picture`,h:{en:`The access layer: where trust is cheap and attacks start`,hi:`Access layer: jahan trust sasta hai aur attacks shuru hote hain`},body:{en:`
<p>Picture a large office building with a friendly reception desk. Anyone wearing a lanyard is waved through, anyone who says "I am from IT" gets the server-room key, and anyone who shouts "the meeting moved to room 5" is believed. Nothing is wrong with the building itself. The weakness is that the reception desk <b>trusts whatever it hears</b>. A Layer 2 switch is that reception desk. It learns MAC addresses from any frame, believes any DHCP offer, forwards any ARP reply, negotiates trunks with anyone who asks and accepts any spanning-tree message. This module teaches you how attackers abuse that trust and, much more importantly, how you as the defender recognise it and lock it down.</p>

<h3>What you will learn</h3>
<ul>
<li>How each classic Layer 2 attack works at recognition level: MAC flooding, rogue DHCP and DHCP starvation, ARP spoofing (man-in-the-middle), VLAN hopping, STP root takeover, broadcast storms and IP spoofing.</li>
<li>What the defender actually sees: counters, syslog messages, err-disabled ports and odd tables.</li>
<li>The controls in depth: <b>port security</b>, <b>DHCP snooping</b>, <b>Dynamic ARP Inspection (DAI)</b>, <b>IP Source Guard (IPSG)</b>, <b>storm-control</b>, <b>BPDU guard</b>, <b>root guard</b>, trunk hardening and <b>private VLANs</b>.</li>
<li>How to verify each control, read its counters and logs, and troubleshoot when a control blocks legitimate users.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should already know VLANs, access and trunk ports, 802.1Q tagging, the basics of Spanning Tree (root bridge, BPDUs, PortFast), how DHCP hands out an address (Discover, Offer, Request, Ack) and how ARP maps an IP address to a MAC address. The earlier security modules gave you the threat vocabulary (attack surface, defence in depth). Here we apply it to the switch port.</p>

<h3>The big picture: one idea behind every control</h3>
<p>An <b>access port</b> (also called an <b>edge port</b>) connects one end host: a PC, a printer, a phone, a camera. An end host has one or two MAC addresses, gets its address from DHCP, never answers DHCP requests, never sends BPDUs and never wants a trunk. Every control in this module follows the same rule: <b>on an edge port, expect end-host behaviour and drop anything that looks like infrastructure</b>. Only the uplinks toward real infrastructure (the DHCP server, the gateway, other switches) are <b>trusted</b>.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Trust boundary on an access switch">
<rect x="230" y="20" width="180" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">GW 10.0.10.1</text><text x="320" y="57" text-anchor="middle" class="svg-muted" font-size="12">DHCP server + gateway</text>
<line x1="320" y1="66" x2="320" y2="120" stroke="#64748b" stroke-width="3"/><text x="330" y="98" class="svg-accent" font-size="12">Gi0/24 TRUSTED</text>
<rect x="200" y="120" width="240" height="50" rx="8" fill="#bae6fd"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="14">Access switch (VLAN 10)</text>
<line x1="60" y1="185" x2="580" y2="185" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="590" y="182" text-anchor="end" class="svg-muted" font-size="12">trust boundary</text>
<line x1="260" y1="170" x2="140" y2="220" stroke="#64748b" stroke-width="2"/><line x1="380" y1="170" x2="500" y2="220" stroke="#64748b" stroke-width="2"/>
<rect x="70" y="220" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="140" y="240" text-anchor="middle" class="svg-ink" font-size="13">PC1 (Gi0/1)</text><text x="140" y="256" text-anchor="middle" class="svg-muted" font-size="12">untrusted edge</text>
<rect x="430" y="220" width="140" height="44" rx="8" fill="#fed7aa"/><text x="500" y="240" text-anchor="middle" class="svg-ink" font-size="13">ATK (Gi0/2)</text><text x="500" y="256" text-anchor="middle" class="svg-muted" font-size="12">untrusted edge</text>
</svg><p class="cap">Everything below the dashed line is untrusted: expect only end-host behaviour there. Only the uplink to real infrastructure is trusted.</p></div>

<h3>Attack, abused trust, defence</h3>
<table class="cmp"><tr><th>Attack</th><th>Trust it abuses</th><th>What the defender sees</th><th>Control</th></tr>
<tr><td>MAC flooding</td><td>CAM table learns every source MAC</td><td>One port with thousands of MACs, flooding</td><td>Port security</td></tr>
<tr><td>Rogue DHCP / starvation</td><td>Clients accept any offer</td><td>Wrong gateway on clients, pool exhausted</td><td>DHCP snooping</td></tr>
<tr><td>ARP spoofing (MITM)</td><td>Hosts accept any ARP reply</td><td>Gateway MAC changes in ARP caches</td><td>DAI</td></tr>
<tr><td>IP spoofing</td><td>Switch ignores source IP</td><td>Traffic from IPs never leased there</td><td>IP Source Guard</td></tr>
<tr><td>VLAN hopping</td><td>DTP and the native VLAN</td><td>Edge port became a trunk</td><td>Access mode, nonegotiate, native VLAN</td></tr>
<tr><td>STP takeover</td><td>Lowest bridge ID wins</td><td>Root bridge moved to an edge</td><td>BPDU guard, root guard</td></tr>
<tr><td>Storms</td><td>Flooding is unlimited</td><td>Links at 100%, CPU high</td><td>Storm-control</td></tr></table>

<p>Two more tools segregate traffic rather than filter it: <b>VLANs</b> (separate broadcast domains for users, voice, servers and management) and <b>private VLANs</b>, which isolate hosts that share one subnet. Both are covered in this module.</p>

<div class="eg"><p><b>Worked example.</b> A 48-port access switch has 46 user ports, one uplink to the distribution switch and one port to a local DHCP server. Hardened correctly, 46 ports are untrusted edge ports with port security, BPDU guard and storm-control; the uplink and the DHCP server port are the only DHCP-snooping trusted ports; the uplink is also DAI-trusted. That is 2 trusted ports out of 48. If you find yourself trusting 20 ports, the design is wrong.</p></div>

<h3>How the labs work</h3>
<p>The five labs use access switches named ACC1 to ACC4 (plus DSW and ASW for trunks), a real gateway GW at 10.0.10.1 serving DHCP for VLAN 10 (10.0.10.0/24), a user PC1 and a simulated attacker ATK. The attacker's traffic is generated by the simulator's <code>attack</code> command and is marked <code>nk-sim</code>; you never need attack tools. Your job is always the defender's: configure the control, trigger the simulated attack and prove the control stopped it while legitimate users keep working.</p>

<div class="warn"><p><b>Common mistake.</b> Turning features on globally and forgetting the trusted ports. DHCP snooping and DAI with no trusted uplink block the real DHCP server and the gateway's ARP replies: the security change becomes an outage. Chapter 12 is dedicated to this.</p></div>

<div class="exam"><p><b>Exam trap.</b> DAI and IP Source Guard do not learn anything themselves. Both depend on the <b>DHCP snooping binding table</b> (or static bindings). Enabling DAI without snooping on that VLAN drops ARP from every untrusted host that has no static entry.</p></div>

<div class="scn"><h4>The intern's laptop became the DHCP server</h4><p>On Monday morning half of a finance floor could not reach the internet. Affected PCs had addresses in 192.168.137.0/24 with gateway 192.168.137.1 instead of 10.0.10.x. The engineer traced the MAC of the "DHCP server" to one access port: an intern had enabled Internet Connection Sharing on a laptop, which started a small DHCP service. There was no malice, but the effect was identical to a rogue DHCP attack. The port was shut, the laptop fixed and DHCP snooping rolled out with only the uplink trusted.</p><p><b>Lesson:</b> Layer 2 controls stop accidents as often as attacks. A single untrusted port should never be able to become the network's DHCP server.</p></div>

<div class="iv"><p class="q">"How would you harden an access port on a Catalyst switch?"</p><p>Strong answer: force <code>switchport mode access</code> with <code>switchport nonegotiate</code>, assign the right VLAN, enable PortFast with BPDU guard, port security with a sensible maximum, storm-control, and make it untrusted for DHCP snooping and DAI, with IP Source Guard where the design allows. Shut unused ports and park them in an unused VLAN. Then mention verification: <code>show port-security</code>, <code>show ip dhcp snooping binding</code>, <code>show interfaces status err-disabled</code>. Structure the answer as "expect end-host behaviour, trust only the uplinks".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switches fill their tables by trusting what they hear; every Layer 2 attack abuses one of those trusts.</li>
<li>Rule of thumb: edge ports are untrusted and expect end-host behaviour; only infrastructure uplinks are trusted.</li>
<li>Controls: port security, DHCP snooping, DAI, IP Source Guard, storm-control, BPDU/root guard, trunk hardening, private VLANs.</li>
<li>DAI and IPSG rely on the DHCP snooping binding table.</li>
<li>Every control can block legitimate traffic if the trust boundary is drawn wrongly, so verification is part of the job.</li>
</ul></div>
`,hi:`
<p>Ek badi office building socho jiska reception desk bahut friendly hai. Jo bhi lanyard pehne ho use andar jaane diya jaata hai, jo bhi kahe "main IT se hoon" use server-room ki chaabi mil jaati hai, aur jo bhi chillaaye "meeting room 5 mein shift ho gayi" uski baat maan li jaati hai. Building mein khud koi kharaabi nahi hai. Kamzori yeh hai ki reception desk <b>jo bhi sunta hai use trust kar leta hai</b>. Layer 2 switch wahi reception desk hai. Woh kisi bhi frame se MAC addresses seekhta hai, kisi bhi DHCP offer par bharosa karta hai, kisi bhi ARP reply ko forward karta hai, jo bhi maange uske saath trunk negotiate karta hai aur koi bhi spanning-tree message accept karta hai. Yeh module sikhata hai ki attackers is trust ka galat fayda kaise uthate hain aur, usse bhi zaroori, aap defender ki tarah use kaise pehchaante ho aur lock karte ho.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Har classic Layer 2 attack recognition level par kaise kaam karta hai: MAC flooding, rogue DHCP aur DHCP starvation, ARP spoofing (man-in-the-middle), VLAN hopping, STP root takeover, broadcast storms aur IP spoofing.</li>
<li>Defender ko asal mein kya dikhta hai: counters, syslog messages, err-disabled ports aur ajeeb tables.</li>
<li>Controls gehraai se: <b>port security</b>, <b>DHCP snooping</b>, <b>Dynamic ARP Inspection (DAI)</b>, <b>IP Source Guard (IPSG)</b>, <b>storm-control</b>, <b>BPDU guard</b>, <b>root guard</b>, trunk hardening aur <b>private VLANs</b>.</li>
<li>Har control ko verify kaise karein, uske counters aur logs kaise padhein, aur jab control legitimate users ko block kare tab troubleshoot kaise karein.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko pehle se VLANs, access aur trunk ports, 802.1Q tagging, Spanning Tree ke basics (root bridge, BPDUs, PortFast), DHCP address kaise deta hai (Discover, Offer, Request, Ack) aur ARP IP address ko MAC address se kaise map karta hai, yeh sab aana chahiye. Pichhle security modules ne aapko threat vocabulary di (attack surface, defence in depth). Yahan hum use switch port par apply karte hain.</p>

<h3>Big picture: har control ke peeche ek hi idea</h3>
<p>Ek <b>access port</b> (jise <b>edge port</b> bhi kehte hain) ek end host ko jodta hai: PC, printer, phone, camera. End host ke ek ya do MAC addresses hote hain, woh address DHCP se leta hai, kabhi DHCP requests ka jawab nahi deta, kabhi BPDUs nahi bhejta aur kabhi trunk nahi chahta. Is module ka har control ek hi rule follow karta hai: <b>edge port par end-host jaisa behaviour expect karo aur jo bhi infrastructure jaisa dikhe use drop karo</b>. Sirf asli infrastructure (DHCP server, gateway, doosre switches) ki taraf ke uplinks <b>trusted</b> hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Access switch par trust boundary">
<rect x="230" y="20" width="180" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">GW 10.0.10.1</text><text x="320" y="57" text-anchor="middle" class="svg-muted" font-size="12">DHCP server + gateway</text>
<line x1="320" y1="66" x2="320" y2="120" stroke="#64748b" stroke-width="3"/><text x="330" y="98" class="svg-accent" font-size="12">Gi0/24 TRUSTED</text>
<rect x="200" y="120" width="240" height="50" rx="8" fill="#bae6fd"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="14">Access switch (VLAN 10)</text>
<line x1="60" y1="185" x2="580" y2="185" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="590" y="182" text-anchor="end" class="svg-muted" font-size="12">trust boundary</text>
<line x1="260" y1="170" x2="140" y2="220" stroke="#64748b" stroke-width="2"/><line x1="380" y1="170" x2="500" y2="220" stroke="#64748b" stroke-width="2"/>
<rect x="70" y="220" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="140" y="240" text-anchor="middle" class="svg-ink" font-size="13">PC1 (Gi0/1)</text><text x="140" y="256" text-anchor="middle" class="svg-muted" font-size="12">untrusted edge</text>
<rect x="430" y="220" width="140" height="44" rx="8" fill="#fed7aa"/><text x="500" y="240" text-anchor="middle" class="svg-ink" font-size="13">ATK (Gi0/2)</text><text x="500" y="256" text-anchor="middle" class="svg-muted" font-size="12">untrusted edge</text>
</svg><p class="cap">Dashed line ke neeche sab untrusted hai: wahan sirf end-host behaviour expect karo. Sirf asli infrastructure ka uplink trusted hai.</p></div>

<h3>Attack, jis trust ka fayda uthaya, defence</h3>
<table class="cmp"><tr><th>Attack</th><th>Kis trust ka fayda</th><th>Defender ko kya dikhta hai</th><th>Control</th></tr>
<tr><td>MAC flooding</td><td>CAM table har source MAC seekhti hai</td><td>Ek port par hazaaron MACs, flooding</td><td>Port security</td></tr>
<tr><td>Rogue DHCP / starvation</td><td>Clients koi bhi offer accept karte hain</td><td>Clients par galat gateway, pool khatam</td><td>DHCP snooping</td></tr>
<tr><td>ARP spoofing (MITM)</td><td>Hosts koi bhi ARP reply accept karte hain</td><td>ARP caches mein gateway ka MAC badal jaata hai</td><td>DAI</td></tr>
<tr><td>IP spoofing</td><td>Switch source IP ignore karta hai</td><td>Aise IPs se traffic jo wahan kabhi lease nahi hue</td><td>IP Source Guard</td></tr>
<tr><td>VLAN hopping</td><td>DTP aur native VLAN</td><td>Edge port trunk ban gaya</td><td>Access mode, nonegotiate, native VLAN</td></tr>
<tr><td>STP takeover</td><td>Sabse kam bridge ID jeetta hai</td><td>Root bridge edge par chala gaya</td><td>BPDU guard, root guard</td></tr>
<tr><td>Storms</td><td>Flooding ki koi limit nahi</td><td>Links 100% par, CPU high</td><td>Storm-control</td></tr></table>

<p>Do aur tools traffic ko filter nahi karte balki alag karte hain: <b>VLANs</b> (users, voice, servers aur management ke liye alag broadcast domains) aur <b>private VLANs</b>, jo ek hi subnet share karne wale hosts ko isolate karte hain. Dono is module mein cover hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek 48-port access switch par 46 user ports, distribution switch ki taraf ek uplink aur ek local DHCP server ka port hai. Sahi hardening mein 46 ports untrusted edge ports hain jin par port security, BPDU guard aur storm-control hai; uplink aur DHCP server wala port hi sirf DHCP-snooping trusted ports hain; uplink DAI-trusted bhi hai. Yani 48 mein se 2 trusted ports. Agar aap 20 ports trust kar rahe ho, to design galat hai.</p></div>

<h3>Labs kaise kaam karti hain</h3>
<p>Paanch labs mein ACC1 se ACC4 naam ke access switches hain (trunks ke liye DSW aur ASW bhi), ek asli gateway GW 10.0.10.1 par jo VLAN 10 (10.0.10.0/24) ke liye DHCP deta hai, ek user PC1 aur ek simulated attacker ATK. Attacker ka traffic simulator ki <code>attack</code> command se banta hai aur <code>nk-sim</code> se mark hota hai; aapko kabhi attack tools ki zaroorat nahi. Aapka kaam hamesha defender ka hai: control configure karo, simulated attack trigger karo aur prove karo ki control ne use roka jabki legitimate users kaam karte rahe.</p>

<div class="warn"><p><b>Common galti.</b> Features globally on kar dena aur trusted ports bhool jaana. Bina trusted uplink ke DHCP snooping aur DAI asli DHCP server aur gateway ke ARP replies ko block kar dete hain: security change outage ban jaata hai. Chapter 12 poora isi par hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> DAI aur IP Source Guard khud kuch nahi seekhte. Dono <b>DHCP snooping binding table</b> (ya static bindings) par depend karte hain. Us VLAN par snooping ke bina DAI enable karne se har us untrusted host ka ARP drop hota hai jiski static entry nahi hai.</p></div>

<div class="scn"><h4>Intern ka laptop DHCP server ban gaya</h4><p>Monday subah ek finance floor ke aadhe log internet tak nahi pahunch pa rahe the. Affected PCs ke paas 10.0.10.x ki jagah 192.168.137.0/24 ke addresses aur gateway 192.168.137.1 tha. Engineer ne "DHCP server" ka MAC ek access port tak trace kiya: ek intern ne laptop par Internet Connection Sharing on kar diya tha, jisse ek chhoti DHCP service shuru ho gayi. Koi buri niyat nahi thi, par asar bilkul rogue DHCP attack jaisa tha. Port shut kiya gaya, laptop theek kiya gaya aur DHCP snooping roll out kiya gaya jisme sirf uplink trusted tha.</p><p><b>Seekh:</b> Layer 2 controls attacks jitna hi accidents bhi rokte hain. Ek akela untrusted port kabhi network ka DHCP server nahi ban paana chahiye.</p></div>

<div class="iv"><p class="q">"Catalyst switch par access port ko aap kaise harden karoge?"</p><p>Strong answer: <code>switchport nonegotiate</code> ke saath <code>switchport mode access</code> force karo, sahi VLAN do, BPDU guard ke saath PortFast enable karo, sensible maximum ke saath port security, storm-control, aur use DHCP snooping aur DAI ke liye untrusted rakho, jahan design allow kare wahan IP Source Guard ke saath. Unused ports shut karo aur unhe ek unused VLAN mein park karo. Phir verification batao: <code>show port-security</code>, <code>show ip dhcp snooping binding</code>, <code>show interfaces status err-disabled</code>. Jawab ko is tarah structure karo: "end-host behaviour expect karo, sirf uplinks trust karo".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switches jo sunte hain use trust karke apni tables bharte hain; har Layer 2 attack in trusts mein se kisi ek ka fayda uthata hai.</li>
<li>Rule of thumb: edge ports untrusted hain aur end-host behaviour expect karte hain; sirf infrastructure uplinks trusted hain.</li>
<li>Controls: port security, DHCP snooping, DAI, IP Source Guard, storm-control, BPDU/root guard, trunk hardening, private VLANs.</li>
<li>DAI aur IPSG DHCP snooping binding table par nirbhar hain.</li>
<li>Agar trust boundary galat kheenchi gayi to har control legitimate traffic block kar sakta hai, isliye verification kaam ka hissa hai.</li>
</ul></div>
`}};export{e as default};