var e={id:`rspan-erspan`,h:{en:`RSPAN and ERSPAN: mirroring across the network`,hi:`RSPAN aur ERSPAN: network ke across mirroring`},body:{en:`
<p>Local SPAN assumes the investigator lives next door. When the analyser is in the server room two switches away, you need a delivery van. <b>RSPAN</b> is a private lane on the Layer 2 highway (a special VLAN) reserved for photocopies. <b>ERSPAN</b> puts the photocopies in sealed envelopes (GRE) and sends them by post (IP routing), so they can reach another building or data centre.</p>

<h3>RSPAN: copies in a dedicated VLAN</h3>
<p>The source switch floods copies into an <b>RSPAN VLAN</b>. Trunks carry the VLAN like any other, and the destination switch pulls it out to the analyser port. Three rules:</p>
<ul>
<li>The VLAN must be configured with <code>remote-span</code> on <b>every</b> switch on the path, including transit switches. This disables MAC learning in the VLAN, so the copies are flooded along the path instead of being forwarded by a table.</li>
<li>Every trunk on the path must <b>allow</b> the VLAN.</li>
<li>Sessions exist only on the source and destination switches, and their numbers do not have to match.</li>
</ul>
<p>Do not put access ports in the RSPAN VLAN. VLAN 1 and VLANs 1002 to 1005 cannot be used.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="RSPAN lab topology">
<rect x="20" y="40" width="140" height="56" rx="10" fill="#bae6fd"/><text x="90" y="65" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="90" y="84" text-anchor="middle" class="svg-muted" font-size="12">source session</text>
<rect x="250" y="40" width="140" height="56" rx="10" fill="#e2e8f0"/><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">transit, no session</text>
<rect x="480" y="40" width="140" height="56" rx="10" fill="#bae6fd"/><text x="550" y="65" text-anchor="middle" class="svg-ink" font-size="14">SW3</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="12">destination session</text>
<line x1="160" y1="68" x2="250" y2="68" stroke="#64748b" stroke-width="3"/><line x1="390" y1="68" x2="480" y2="68" stroke="#64748b" stroke-width="3"/>
<text x="205" y="60" text-anchor="middle" class="svg-accent" font-size="12">trunk 10,999</text><text x="435" y="60" text-anchor="middle" class="svg-accent" font-size="12">trunk 10,999</text>
<rect x="20" y="140" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="90" y="167" text-anchor="middle" class="svg-ink" font-size="13">PC1 on Gi0/1</text>
<rect x="480" y="140" width="140" height="44" rx="8" fill="#fed7aa"/><text x="550" y="167" text-anchor="middle" class="svg-ink" font-size="13">ANALYZER Gi0/7</text>
<line x1="90" y1="96" x2="90" y2="140" stroke="#64748b" stroke-width="2"/><line x1="550" y1="96" x2="550" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">VLAN 999 remote-span on all three</text>
</svg><p class="cap">RSPAN lab: copies of PC1 traffic ride VLAN 999 across SW2 to the analyser on SW3.</p></div>

<h3>Lab walkthrough: RSPAN</h3>
<pre class="code"><span class="c">! On SW1, SW2 and SW3</span>
SWx(config)# vlan 999
SWx(config-vlan)# name RSPAN
SWx(config-vlan)# remote-span
<span class="c">! Every trunk on the path (SW1 Gi0/0, SW2 Gi0/0 and Gi0/1, SW3 Gi0/0)</span>
SWx(config)# interface g0/0
SWx(config-if)# switchport trunk allowed vlan add 999    <span class="c">! "add", never replace</span>
<span class="c">! Source switch</span>
SW1(config)# monitor session 1 source interface g0/1
SW1(config)# monitor session 1 destination remote vlan 999
<span class="c">! Destination switch</span>
SW3(config)# monitor session 1 source remote vlan 999
SW3(config)# monitor session 1 destination interface g0/7</pre>
<pre class="out">SW3# show monitor
Session 1
---------
Type                     : <span class="hl">Remote Destination Session</span>
Source RSPAN VLAN        : <span class="hl">999</span>
Destination Ports        : Gi0/7
    Encapsulation        : Native
          Ingress        : Disabled</pre>
<p>On SW1 the type reads "Remote Source Session" with "Dest RSPAN VLAN : 999". PC1 pings PC2 and the ANALYZER receives the copies. If nothing arrives, run <code>show interfaces trunk</code> on each switch and check that 999 appears in "Vlans allowed and active in management domain" and in the forwarding list.</p>

<h3>ERSPAN: copies routed inside GRE</h3>
<p>ERSPAN encapsulates each copy in <b>GRE</b> (IP protocol 47) with an ERSPAN header that carries a <b>session ID</b> (the ERSPAN ID, 1 to 1023). Type II uses GRE protocol type <b>0x88BE</b>; type III, used on newer platforms with richer timestamps, uses 0x22EB. The copies are routed like any IP packet, so the analyser can be anywhere reachable. ERSPAN is supported on Catalyst 9000 switches and many IOS XE routers; not every platform can terminate a session, and often the destination is simply an analyser such as Wireshark that decodes ERSPAN directly.</p>
<pre class="code">SW1(config)# monitor session 10 type erspan-source
SW1(config-mon-erspan-src)# source interface g0/1
SW1(config-mon-erspan-src)# no shutdown                  <span class="c">! sessions start shut down</span>
SW1(config-mon-erspan-src)# destination
SW1(config-mon-erspan-src-dst)# erspan-id 77
SW1(config-mon-erspan-src-dst)# ip address 192.0.2.50    <span class="c">! remote end</span>
SW1(config-mon-erspan-src-dst)# origin ip address 172.16.1.1

R2(config)# monitor session 20 type erspan-destination
R2(config-mon-erspan-dst)# destination interface g0/2
R2(config-mon-erspan-dst)# no shutdown
R2(config-mon-erspan-dst)# source
R2(config-mon-erspan-dst-src)# erspan-id 77              <span class="c">! must match</span>
R2(config-mon-erspan-dst-src)# ip address 192.0.2.50     <span class="c">! its own Loopback0</span></pre>
<p>Walkthrough of the ERSPAN lab: first prove the transport with <code>ping 192.0.2.50 source 172.16.1.1</code> from SW1 (two routed hops via R1). Then build the source session on SW1 and the destination session on R2. PC1 pings PC2; a capture on the R1 to R2 link shows GRE packets from 172.16.1.1 to 192.0.2.50 with ERSPAN ID 77, and the IDS on R2 Gi0/2 receives the decapsulated frames.</p>

<div class="eg"><p><b>Worked example.</b> ERSPAN adds overhead: 20 bytes outer IP, 8 bytes GRE with sequence number and 8 bytes ERSPAN type II header, so a full 1514-byte Ethernet frame becomes a 1550-byte IP packet. On a 1500-byte path the copy must be fragmented or truncated. Plan a larger MTU on the transport or accept truncated copies.</p></div>

<div class="warn"><p><b>Common mistake.</b> In RSPAN, typing <code>switchport trunk allowed vlan 999</code> without <code>add</code>. The trunk now carries only VLAN 999 and every user VLAN on it goes down. In ERSPAN, forgetting <code>no shutdown</code>: <code>show monitor session</code> then shows the session as admin disabled.</p></div>

<div class="exam"><p><b>Exam trap.</b> RSPAN needs the VLAN on transit switches too, but no session there. ERSPAN needs matching ERSPAN IDs, and the destination session's IP must equal the address the source sends to; session numbers are local and need not match. The <code>origin ip address</code> is the source of the GRE packets.</p></div>

<div class="scn"><h4>Mirroring the branch firewall to the SOC</h4><p>A security team in Bengaluru needed full packets from a firewall segment in a Chennai branch for a forensic investigation. RSPAN was impossible across the routed WAN. The engineer configured an ERSPAN source on the branch Catalyst 9300 with the SOC sensor's address as the destination, filtered to one VLAN to protect the WAN, and limited the capture window to two hours. The sensor decoded the ERSPAN packets directly.</p><p><b>Lesson:</b> RSPAN stops at Layer 3 boundaries; ERSPAN crosses them, at the cost of WAN bandwidth.</p></div>

<div class="iv"><p class="q">"When would you choose RSPAN over ERSPAN, and what does each require?"</p><p>RSPAN when source and analyser are in the same switched Layer 2 domain: a remote-span VLAN on every switch in the path, allowed on every trunk, and source and destination sessions on the end switches. ERSPAN when there is a routed hop: IP reachability, a source session with erspan-id, destination IP and origin IP, and either an ERSPAN destination session with the same ID or an analyser that decodes GRE/ERSPAN. Mention MTU overhead and WAN bandwidth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RSPAN carries copies in a <code>remote-span</code> VLAN that every switch on the path must know and every trunk must allow.</li>
<li>RSPAN sessions exist only on the source and destination switches; numbers need not match.</li>
<li>ERSPAN wraps copies in GRE (protocol 47, type II 0x88BE) with an ERSPAN ID, so they can be routed.</li>
<li>ERSPAN sessions start shut down; the IDs and destination IP must match.</li>
<li>Both add load: RSPAN on trunks, ERSPAN on routed links and MTU.</li>
</ul></div>
`,hi:`
<p>Local SPAN maanta hai ki investigator bagal wale ghar mein rehta hai. Jab analyser do switches door server room mein ho, to aapko ek delivery van chahiye. <b>RSPAN</b> Layer 2 highway par ek private lane hai (ek special VLAN) jo photocopies ke liye reserved hai. <b>ERSPAN</b> photocopies ko sealed envelopes (GRE) mein daalkar post (IP routing) se bhejta hai, taaki woh doosri building ya data centre tak pahunch sakein.</p>

<h3>RSPAN: dedicated VLAN mein copies</h3>
<p>Source switch copies ko ek <b>RSPAN VLAN</b> mein flood karta hai. Trunks is VLAN ko kisi aur VLAN ki tarah le jaate hain, aur destination switch use nikaalkar analyser port par de deta hai. Teen rules:</p>
<ul>
<li>Path ke <b>har</b> switch par, transit switches samet, VLAN <code>remote-span</code> ke saath configure hona chahiye. Isse VLAN mein MAC learning band hoti hai, isliye copies table se forward hone ki jagah path par flood hoti hain.</li>
<li>Path ke har trunk ko VLAN <b>allow</b> karna chahiye.</li>
<li>Sessions sirf source aur destination switches par hote hain, aur unke numbers match hona zaroori nahi.</li>
</ul>
<p>RSPAN VLAN mein access ports mat daalo. VLAN 1 aur VLANs 1002 se 1005 use nahi ho sakte.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="RSPAN lab topology">
<rect x="20" y="40" width="140" height="56" rx="10" fill="#bae6fd"/><text x="90" y="65" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="90" y="84" text-anchor="middle" class="svg-muted" font-size="12">source session</text>
<rect x="250" y="40" width="140" height="56" rx="10" fill="#e2e8f0"/><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">transit, session nahi</text>
<rect x="480" y="40" width="140" height="56" rx="10" fill="#bae6fd"/><text x="550" y="65" text-anchor="middle" class="svg-ink" font-size="14">SW3</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="12">destination session</text>
<line x1="160" y1="68" x2="250" y2="68" stroke="#64748b" stroke-width="3"/><line x1="390" y1="68" x2="480" y2="68" stroke="#64748b" stroke-width="3"/>
<text x="205" y="60" text-anchor="middle" class="svg-accent" font-size="12">trunk 10,999</text><text x="435" y="60" text-anchor="middle" class="svg-accent" font-size="12">trunk 10,999</text>
<rect x="20" y="140" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="90" y="167" text-anchor="middle" class="svg-ink" font-size="13">PC1 Gi0/1 par</text>
<rect x="480" y="140" width="140" height="44" rx="8" fill="#fed7aa"/><text x="550" y="167" text-anchor="middle" class="svg-ink" font-size="13">ANALYZER Gi0/7</text>
<line x1="90" y1="96" x2="90" y2="140" stroke="#64748b" stroke-width="2"/><line x1="550" y1="96" x2="550" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Teeno par VLAN 999 remote-span</text>
</svg><p class="cap">RSPAN lab: PC1 traffic ki copies VLAN 999 par SW2 ke across SW3 ke analyser tak jaati hain.</p></div>

<h3>Lab walkthrough: RSPAN</h3>
<pre class="code"><span class="c">! SW1, SW2 aur SW3 par</span>
SWx(config)# vlan 999
SWx(config-vlan)# name RSPAN
SWx(config-vlan)# remote-span
<span class="c">! Path ka har trunk (SW1 Gi0/0, SW2 Gi0/0 aur Gi0/1, SW3 Gi0/0)</span>
SWx(config)# interface g0/0
SWx(config-if)# switchport trunk allowed vlan add 999    <span class="c">! "add", kabhi replace nahi</span>
<span class="c">! Source switch</span>
SW1(config)# monitor session 1 source interface g0/1
SW1(config)# monitor session 1 destination remote vlan 999
<span class="c">! Destination switch</span>
SW3(config)# monitor session 1 source remote vlan 999
SW3(config)# monitor session 1 destination interface g0/7</pre>
<pre class="out">SW3# show monitor
Session 1
---------
Type                     : <span class="hl">Remote Destination Session</span>
Source RSPAN VLAN        : <span class="hl">999</span>
Destination Ports        : Gi0/7
    Encapsulation        : Native
          Ingress        : Disabled</pre>
<p>SW1 par type "Remote Source Session" aur "Dest RSPAN VLAN : 999" dikhta hai. PC1 PC2 ko ping karta hai aur ANALYZER ko copies milti hain. Agar kuch na aaye, har switch par <code>show interfaces trunk</code> chalao aur check karo ki 999 "Vlans allowed and active in management domain" aur forwarding list mein dikhta hai.</p>

<h3>ERSPAN: GRE ke andar route hoti copies</h3>
<p>ERSPAN har copy ko <b>GRE</b> (IP protocol 47) mein encapsulate karta hai, saath mein ek ERSPAN header jo <b>session ID</b> (ERSPAN ID, 1 se 1023) le jaata hai. Type II GRE protocol type <b>0x88BE</b> use karta hai; type III, jo naye platforms par richer timestamps ke saath use hota hai, 0x22EB use karta hai. Copies kisi bhi IP packet ki tarah route hoti hain, isliye analyser kahin bhi ho sakta hai jahan tak reachability ho. ERSPAN Catalyst 9000 switches aur kai IOS XE routers par supported hai; har platform session terminate nahi kar sakta, aur aksar destination bas ek analyser hota hai jaise Wireshark jo ERSPAN ko seedha decode karta hai.</p>
<pre class="code">SW1(config)# monitor session 10 type erspan-source
SW1(config-mon-erspan-src)# source interface g0/1
SW1(config-mon-erspan-src)# no shutdown                  <span class="c">! sessions shutdown state mein shuru hote hain</span>
SW1(config-mon-erspan-src)# destination
SW1(config-mon-erspan-src-dst)# erspan-id 77
SW1(config-mon-erspan-src-dst)# ip address 192.0.2.50    <span class="c">! remote end</span>
SW1(config-mon-erspan-src-dst)# origin ip address 172.16.1.1

R2(config)# monitor session 20 type erspan-destination
R2(config-mon-erspan-dst)# destination interface g0/2
R2(config-mon-erspan-dst)# no shutdown
R2(config-mon-erspan-dst)# source
R2(config-mon-erspan-dst-src)# erspan-id 77              <span class="c">! match hona chahiye</span>
R2(config-mon-erspan-dst-src)# ip address 192.0.2.50     <span class="c">! uska apna Loopback0</span></pre>
<p>ERSPAN lab ka walkthrough: pehle SW1 se <code>ping 192.0.2.50 source 172.16.1.1</code> (R1 ke through do routed hops) se transport prove karo. Phir SW1 par source session aur R2 par destination session banao. PC1 PC2 ko ping karta hai; R1 se R2 link par capture 172.16.1.1 se 192.0.2.50 tak ERSPAN ID 77 wale GRE packets dikhata hai, aur R2 Gi0/2 par IDS ko decapsulated frames milte hain.</p>

<div class="eg"><p><b>Worked example.</b> ERSPAN overhead jodta hai: 20 bytes outer IP, sequence number ke saath 8 bytes GRE aur 8 bytes ERSPAN type II header, isliye poora 1514-byte Ethernet frame 1550-byte IP packet ban jaata hai. 1500-byte path par copy ko fragment ya truncate karna padega. Transport par bada MTU plan karo ya truncated copies accept karo.</p></div>

<div class="warn"><p><b>Common galti.</b> RSPAN mein <code>add</code> ke bina <code>switchport trunk allowed vlan 999</code> type karna. Ab trunk sirf VLAN 999 le jaata hai aur us par ka har user VLAN down ho jaata hai. ERSPAN mein <code>no shutdown</code> bhoolna: tab <code>show monitor session</code> session ko admin disabled dikhata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> RSPAN ko transit switches par bhi VLAN chahiye, par wahan session nahi. ERSPAN ko matching ERSPAN IDs chahiye, aur destination session ka IP wahi hona chahiye jis par source bhejta hai; session numbers local hote hain aur match hona zaroori nahi. <code>origin ip address</code> GRE packets ka source hai.</p></div>

<div class="scn"><h4>Branch firewall ko SOC tak mirror karna</h4><p>Bengaluru ki ek security team ko forensic investigation ke liye Chennai branch ke firewall segment se poore packets chahiye the. Routed WAN ke across RSPAN mumkin nahi tha. Engineer ne branch Catalyst 9300 par ERSPAN source configure kiya jiska destination SOC sensor ka address tha, WAN ko bachane ke liye ek VLAN tak filter kiya, aur capture window do ghante tak simit rakhi. Sensor ne ERSPAN packets seedha decode kiye.</p><p><b>Seekh:</b> RSPAN Layer 3 boundaries par ruk jaata hai; ERSPAN unhe cross karta hai, WAN bandwidth ki keemat par.</p></div>

<div class="iv"><p class="q">"Aap ERSPAN ki jagah RSPAN kab chunoge, aur har ek ko kya chahiye?"</p><p>RSPAN jab source aur analyser same switched Layer 2 domain mein hon: path ke har switch par remote-span VLAN, har trunk par allowed, aur end switches par source aur destination sessions. ERSPAN jab beech mein routed hop ho: IP reachability, erspan-id, destination IP aur origin IP ke saath source session, aur ya to same ID wala ERSPAN destination session ya GRE/ERSPAN decode karne wala analyser. MTU overhead aur WAN bandwidth zaroor batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RSPAN copies ko <code>remote-span</code> VLAN mein le jaata hai jise path ka har switch jaane aur har trunk allow kare.</li>
<li>RSPAN sessions sirf source aur destination switches par hote hain; numbers match hona zaroori nahi.</li>
<li>ERSPAN copies ko ERSPAN ID ke saath GRE (protocol 47, type II 0x88BE) mein wrap karta hai, taaki woh route ho sakein.</li>
<li>ERSPAN sessions shutdown state mein shuru hote hain; IDs aur destination IP match hone chahiye.</li>
<li>Dono load jodte hain: RSPAN trunks par, ERSPAN routed links aur MTU par.</li>
</ul></div>
`}};export{e as default};