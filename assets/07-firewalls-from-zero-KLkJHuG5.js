var e={id:`firewalls`,h:{en:`Firewalls from zero: packet filter, stateful, NGFW, zones, rules and NAT`,hi:`Firewalls zero se: packet filter, stateful, NGFW, zones, rules aur NAT`},body:{en:`
<p>Picture the security desk of an office tower. A basic guard checks only the badge colour of everyone walking in and out, and has no memory. A better guard writes down every visitor who goes up, so when that visitor comes back down the guard knows they belong. The best guard also knows who the person is, which floor they are allowed on and checks what is inside their bag. These three guards are the three generations of firewall. The ASA and Threat Defense modules go deep; this chapter gives you the model they build on.</p>

<h3>Generation 1: the stateless packet filter</h3>
<p>A router ACL is a <b>stateless packet filter</b>. It looks at each packet alone: source and destination IP, protocol and ports. It has no memory of connections, so for every flow you must permit both directions. That makes rules long and open: to let inside users browse, you must also allow many return packets from the internet to high ports. It is fast and still useful on routers and switches (infrastructure ACLs), but it cannot tell a genuine reply from an unsolicited packet crafted to look like one.</p>

<h3>Generation 2: the stateful firewall</h3>
<p>A <b>stateful firewall</b> keeps a <b>connection table</b> (state table). When an allowed packet starts a connection (for TCP, the SYN), the firewall records the 5-tuple: source IP, source port, destination IP, destination port and protocol. Return packets that match an existing entry are allowed automatically; anything else must match a rule. It also checks that TCP flags and sequence numbers make sense and times out idle connections. Cisco ASA is the classic stateful firewall. Many protocols also need <b>inspection</b> (application awareness) to open secondary channels safely, for example FTP data or SIP media.</p>

<h3>Generation 3: the next-generation firewall (NGFW)</h3>
<p>An <b>NGFW</b> is a stateful firewall plus deep inspection: <b>application identification</b> (it recognises a messaging app on port 443, not just "HTTPS"), <b>user identity</b> (rules by AD group, learned from ISE or other identity sources), <b>URL filtering</b> by category and reputation, <b>IPS</b>, <b>file and malware</b> inspection, <b>Security Intelligence</b> feeds of known bad IPs, URLs and domains, and <b>TLS decryption</b> so it can see inside encrypted traffic. Cisco Secure Firewall Threat Defense (FTD) is Cisco's NGFW, configured through Management Center (FMC) or, for a single device, Device Manager.</p>

<table class="cmp"><tr><th></th><th>Packet filter</th><th>Stateful</th><th>NGFW</th></tr>
<tr><td>Decides on</td><td>IP, protocol, port</td><td>+ connection state</td><td>+ app, user, URL, content, reputation</td></tr>
<tr><td>Return traffic</td><td>Needs its own rule</td><td>Automatic from state table</td><td>Automatic from state table</td></tr>
<tr><td>Sees threats in payload</td><td>No</td><td>Limited (protocol inspection)</td><td>Yes (IPS, file, malware)</td></tr>
<tr><td>Cisco example</td><td>IOS ACL</td><td>ASA</td><td>Threat Defense with FMC</td></tr>
</table>

<h3>Zones and trust</h3>
<p>Firewalls group interfaces into <b>zones</b> of similar trust. Typical design: <b>inside</b> (users, high trust), <b>DMZ</b> (public-facing servers, medium trust), <b>outside</b> (internet, no trust). On the ASA every interface has a <b>nameif</b> and a <b>security level</b> from 0 to 100: by default traffic from a higher level to a lower level is allowed, lower to higher is denied unless an ACL permits it, and traffic between two interfaces of the same level is denied unless explicitly enabled. On Threat Defense you create <b>security zones</b> and write access control rules from zone to zone.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Firewall zones inside DMZ outside">
<rect x="250" y="80" width="140" height="60" rx="10" fill="#fed7aa"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="14">FW1</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">stateful / NGFW</text>
<rect x="10" y="85" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="90" y="106" text-anchor="middle" class="svg-ink" font-size="13">inside (100)</text><text x="90" y="124" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.0/24</text>
<rect x="470" y="85" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="550" y="106" text-anchor="middle" class="svg-ink" font-size="13">outside (0)</text><text x="550" y="124" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.0/28</text>
<rect x="240" y="170" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="189" text-anchor="middle" class="svg-ink" font-size="13">dmz (50)</text><text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">web 10.1.50.10</text>
<line x1="170" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="470" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="140" x2="320" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">Internet users reach 203.0.113.10:443, translated to 10.1.50.10</text>
<text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">inside users leave via PAT on 203.0.113.2</text>
</svg><p class="cap">Three zones with ASA security levels. The same design is used in the ASA and Threat Defense labs of this track.</p></div>

<h3>Rules: top-down, first match, implicit deny</h3>
<p>A firewall rule base is read <b>top to bottom</b>; the <b>first match wins</b> and processing stops. Every ACL ends with an <b>implicit deny</b>. So: specific rules first, broad rules later, and never a "permit any any" to fix a ticket. Good rules name a source, a destination, a service and an owner, and they log.</p>

<h3>NAT in one paragraph</h3>
<p>Internal networks use private addresses, so the firewall translates them. <b>Dynamic PAT</b> lets many inside hosts share one public address (the outside interface) by using different source ports. <b>Static NAT</b> maps one private server to one public address so the internet can reach it. On ASA software 8.3 and later, ACLs are written with the <b>real (untranslated) IP</b> of the server, not the public one: a favourite exam and troubleshooting point.</p>

<pre class="code"><span class="c">! Preview only: the ASA modules build this step by step</span>
interface GigabitEthernet0/0
 nameif outside
 security-level 0
 ip address 203.0.113.2 255.255.255.240
interface GigabitEthernet0/1
 nameif inside
 security-level 100
 ip address 10.1.10.1 255.255.255.0
interface GigabitEthernet0/2
 nameif dmz
 security-level 50
 ip address 10.1.50.1 255.255.255.0
<span class="c">! Inside users share the outside address (dynamic PAT)</span>
object network INSIDE-NET
 subnet 10.1.10.0 255.255.255.0
 nat (inside,outside) dynamic interface
<span class="c">! Publish the DMZ web server (static NAT)</span>
object network WEB-SRV
 host 10.1.50.10
 nat (dmz,outside) static 203.0.113.10
<span class="c">! ACL uses the REAL address (object WEB-SRV = 10.1.50.10)</span>
access-list OUTSIDE_IN extended permit tcp any object WEB-SRV eq 443
access-group OUTSIDE_IN in interface outside
route outside 0.0.0.0 0.0.0.0 203.0.113.1</pre>

<pre class="out">FW1# show conn address 10.1.50.10
1 in use, 118 most used
<span class="hl">TCP outside  198.51.100.7:51000 dmz  10.1.50.10:443, idle 0:00:03, bytes 48213, flags UIO</span>

FW1# show xlate
2 in use, 4 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
NAT from dmz:10.1.50.10 to outside:203.0.113.10
    flags s idle 0:00:03 timeout 0:00:00
TCP PAT from inside:10.1.10.25/53112 to outside:203.0.113.2/53112 flags ri idle 0:00:04 timeout 0:00:30</pre>
<p>The connection entry proves the stateful table: an internet client 198.51.100.7 talks to the real server 10.1.50.10 on 443, flags <code>U</code> (up), <code>I</code> and <code>O</code> (data in both directions). The xlate table shows one static and one PAT translation.</p>

<h3>Deployment modes</h3>
<p>In <b>routed mode</b> the firewall is a Layer 3 hop with an IP on each interface. In <b>transparent mode</b> it acts as a "bump in the wire" bridge, so you can insert it without re-addressing. Threat Defense can also run interfaces as <b>inline sets</b> or <b>passive</b> (IDS) interfaces. SNCF domain 1 tests these modes in detail.</p>

<div class="warn"><p><b>Common mistakes.</b> Writing the ACL with the public IP of a NATed server on ASA 8.3+. Putting a broad rule above a specific deny, so the deny never matches. Forgetting that once an ACL is applied inbound on an interface, the "higher to lower is allowed" default no longer applies there.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stateful = return traffic allowed from the connection table. Same security level interfaces cannot talk unless <code>same-security-traffic permit inter-interface</code> is configured. An NGFW identifies applications regardless of port.</p></div>

<div class="scn"><h4>The rule that was right but never hit</h4><p>A new rule allowed partners to reach 203.0.113.10 on port 443, but partners still failed. The hit count on the rule stayed at zero. The engineer ran packet-tracer and saw the traffic matched the implicit deny: the ACL used the public address, while the ASA compares the real address 10.1.50.10 after un-NAT. Rewriting the rule with the object WEB-SRV fixed it within a minute.</p><p><b>Lesson:</b> on ASA, NAT is resolved before the ACL check; always write rules with real addresses and prove them with packet-tracer and hit counts.</p></div>

<div class="iv"><p class="q">"What is the difference between a stateless ACL, a stateful firewall and an NGFW?"</p><p>Strong answer: a stateless ACL judges each packet alone, so return traffic needs its own permit. A stateful firewall tracks connections in a state table and allows matching return traffic automatically. An NGFW adds application and user awareness, URL filtering, IPS, file and malware inspection, reputation feeds and decryption. Give Cisco examples: IOS ACL, ASA, Threat Defense with FMC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet filter (stateless), stateful firewall (connection table), NGFW (app, user, URL, IPS, files, decryption).</li>
<li>Zones group interfaces by trust; ASA uses security levels 0 to 100, Threat Defense uses security zones.</li>
<li>Rules are top-down, first match, with an implicit deny at the end.</li>
<li>Dynamic PAT for users out, static NAT for servers in; ASA 8.3+ ACLs use real IPs.</li>
<li>Routed vs transparent mode; verify with show conn, show xlate and packet-tracer.</li>
</ul></div>
`,hi:`
<p>Ek office tower ki security desk socho. Ek basic guard andar bahar jaane wale har insaan ka sirf badge colour check karta hai aur use kuch yaad nahi rehta. Ek behtar guard upar jaane wale har visitor ko likh leta hai, taaki jab woh visitor wapas neeche aaye to guard ko pata ho ki woh yahin ka hai. Sabse achha guard yeh bhi jaanta hai ki insaan kaun hai, use kis floor par jaane ki ijaazat hai aur uske bag mein kya hai. Yeh teen guards firewall ki teen generations hain. ASA aur Threat Defense modules gehraai mein jaate hain; yeh chapter aapko woh model deta hai jis par woh banate hain.</p>

<h3>Generation 1: stateless packet filter</h3>
<p>Router ACL ek <b>stateless packet filter</b> hai. Yeh har packet ko akele dekhta hai: source aur destination IP, protocol aur ports. Ise connections yaad nahi rehte, isliye har flow ke liye aapko dono directions permit karni padti hain. Isse rules lambe aur khule ho jaate hain: inside users ko browse karne dene ke liye aapko internet se high ports par bahut saare return packets bhi allow karne padte hain. Yeh fast hai aur routers aur switches par abhi bhi useful hai (infrastructure ACLs), lekin yeh genuine reply aur reply jaisa dikhne ke liye banaye gaye unsolicited packet mein farak nahi kar sakta.</p>

<h3>Generation 2: stateful firewall</h3>
<p><b>Stateful firewall</b> ek <b>connection table</b> (state table) rakhta hai. Jab ek allowed packet connection shuru karta hai (TCP ke liye SYN), firewall 5-tuple record karta hai: source IP, source port, destination IP, destination port aur protocol. Jo return packets existing entry se match karte hain woh automatically allow hote hain; baaki sab ko rule se match karna padta hai. Yeh check bhi karta hai ki TCP flags aur sequence numbers sahi hain aur idle connections ko time out karta hai. Cisco ASA classic stateful firewall hai. Kai protocols ko secondary channels safely kholne ke liye <b>inspection</b> (application awareness) bhi chahiye, jaise FTP data ya SIP media.</p>

<h3>Generation 3: next-generation firewall (NGFW)</h3>
<p><b>NGFW</b> stateful firewall plus deep inspection hai: <b>application identification</b> (yeh port 443 par messaging app pehchaanta hai, sirf "HTTPS" nahi), <b>user identity</b> (AD group se rules, ISE ya doosre identity sources se seekhe hue), category aur reputation se <b>URL filtering</b>, <b>IPS</b>, <b>file aur malware</b> inspection, known bad IPs, URLs aur domains ke <b>Security Intelligence</b> feeds, aur <b>TLS decryption</b> taaki encrypted traffic ke andar dekh sake. Cisco Secure Firewall Threat Defense (FTD) Cisco ka NGFW hai, jo Management Center (FMC) se ya ek device ke liye Device Manager se configure hota hai.</p>

<table class="cmp"><tr><th></th><th>Packet filter</th><th>Stateful</th><th>NGFW</th></tr>
<tr><td>Kis par decide karta hai</td><td>IP, protocol, port</td><td>+ connection state</td><td>+ app, user, URL, content, reputation</td></tr>
<tr><td>Return traffic</td><td>Apna alag rule chahiye</td><td>State table se automatic</td><td>State table se automatic</td></tr>
<tr><td>Payload mein threats dekhta hai</td><td>Nahi</td><td>Limited (protocol inspection)</td><td>Haan (IPS, file, malware)</td></tr>
<tr><td>Cisco example</td><td>IOS ACL</td><td>ASA</td><td>FMC ke saath Threat Defense</td></tr>
</table>

<h3>Zones aur trust</h3>
<p>Firewalls interfaces ko milte-julte trust wale <b>zones</b> mein group karte hain. Typical design: <b>inside</b> (users, high trust), <b>DMZ</b> (public-facing servers, medium trust), <b>outside</b> (internet, koi trust nahi). ASA par har interface ka ek <b>nameif</b> aur 0 se 100 tak ka <b>security level</b> hota hai: default mein higher level se lower level ka traffic allowed hai, lower se higher denied hai jab tak ACL permit na kare, aur same level ke do interfaces ke beech traffic denied hai jab tak explicitly enable na ho. Threat Defense par aap <b>security zones</b> banate ho aur zone se zone tak access control rules likhte ho.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Firewall zones inside DMZ outside">
<rect x="250" y="80" width="140" height="60" rx="10" fill="#fed7aa"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="14">FW1</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">stateful / NGFW</text>
<rect x="10" y="85" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="90" y="106" text-anchor="middle" class="svg-ink" font-size="13">inside (100)</text><text x="90" y="124" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.0/24</text>
<rect x="470" y="85" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="550" y="106" text-anchor="middle" class="svg-ink" font-size="13">outside (0)</text><text x="550" y="124" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.0/28</text>
<rect x="240" y="170" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="189" text-anchor="middle" class="svg-ink" font-size="13">dmz (50)</text><text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">web 10.1.50.10</text>
<line x1="170" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="470" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="140" x2="320" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">Internet users 203.0.113.10:443 tak pahunchte hain, 10.1.50.10 mein translate</text>
<text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">inside users 203.0.113.2 par PAT se bahar jaate hain</text>
</svg><p class="cap">ASA security levels ke saath teen zones. Is track ke ASA aur Threat Defense labs mein yahi design use hota hai.</p></div>

<h3>Rules: top-down, first match, implicit deny</h3>
<p>Firewall rule base <b>upar se neeche</b> padha jaata hai; <b>pehla match jeetta hai</b> aur processing ruk jaati hai. Har ACL <b>implicit deny</b> par khatam hota hai. Isliye: specific rules pehle, broad rules baad mein, aur ticket fix karne ke liye kabhi "permit any any" nahi. Achhe rules source, destination, service aur owner ka naam lete hain, aur log karte hain.</p>

<h3>NAT ek paragraph mein</h3>
<p>Internal networks private addresses use karte hain, isliye firewall unhe translate karta hai. <b>Dynamic PAT</b> bahut saare inside hosts ko alag source ports use karke ek public address (outside interface) share karne deta hai. <b>Static NAT</b> ek private server ko ek public address se map karta hai taaki internet use reach kar sake. ASA software 8.3 aur baad mein, ACLs server ke <b>real (untranslated) IP</b> se likhe jaate hain, public se nahi: exam aur troubleshooting ka favourite point.</p>

<pre class="code"><span class="c">! Sirf preview: ASA modules ise step by step banate hain</span>
interface GigabitEthernet0/0
 nameif outside
 security-level 0
 ip address 203.0.113.2 255.255.255.240
interface GigabitEthernet0/1
 nameif inside
 security-level 100
 ip address 10.1.10.1 255.255.255.0
interface GigabitEthernet0/2
 nameif dmz
 security-level 50
 ip address 10.1.50.1 255.255.255.0
<span class="c">! Inside users outside address share karte hain (dynamic PAT)</span>
object network INSIDE-NET
 subnet 10.1.10.0 255.255.255.0
 nat (inside,outside) dynamic interface
<span class="c">! DMZ web server publish karo (static NAT)</span>
object network WEB-SRV
 host 10.1.50.10
 nat (dmz,outside) static 203.0.113.10
<span class="c">! ACL REAL address use karta hai (object WEB-SRV = 10.1.50.10)</span>
access-list OUTSIDE_IN extended permit tcp any object WEB-SRV eq 443
access-group OUTSIDE_IN in interface outside
route outside 0.0.0.0 0.0.0.0 203.0.113.1</pre>

<pre class="out">FW1# show conn address 10.1.50.10
1 in use, 118 most used
<span class="hl">TCP outside  198.51.100.7:51000 dmz  10.1.50.10:443, idle 0:00:03, bytes 48213, flags UIO</span>

FW1# show xlate
2 in use, 4 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
NAT from dmz:10.1.50.10 to outside:203.0.113.10
    flags s idle 0:00:03 timeout 0:00:00
TCP PAT from inside:10.1.10.25/53112 to outside:203.0.113.2/53112 flags ri idle 0:00:04 timeout 0:00:30</pre>
<p>Connection entry stateful table ko prove karti hai: internet client 198.51.100.7 real server 10.1.50.10 se 443 par baat karta hai, flags <code>U</code> (up), <code>I</code> aur <code>O</code> (dono directions mein data). Xlate table ek static aur ek PAT translation dikhati hai.</p>

<h3>Deployment modes</h3>
<p><b>Routed mode</b> mein firewall ek Layer 3 hop hai jiske har interface par IP hota hai. <b>Transparent mode</b> mein yeh "bump in the wire" bridge ki tarah kaam karta hai, isliye aap ise bina re-addressing ke daal sakte ho. Threat Defense interfaces ko <b>inline sets</b> ya <b>passive</b> (IDS) interfaces ki tarah bhi chala sakta hai. SNCF domain 1 in modes ko detail mein test karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> ASA 8.3+ par NATed server ke public IP se ACL likhna. Specific deny ke upar broad rule rakhna, jisse deny kabhi match nahi hota. Bhoolna ki jab interface par inbound ACL apply ho jaata hai, to wahan "higher to lower allowed" default laagu nahi rehta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stateful = connection table se return traffic allowed. Same security level wale interfaces tab tak baat nahi kar sakte jab tak <code>same-security-traffic permit inter-interface</code> configure na ho. NGFW port se independent applications pehchaanta hai.</p></div>

<div class="scn"><h4>Rule jo sahi tha lekin kabhi hit nahi hua</h4><p>Ek naya rule partners ko 203.0.113.10 par port 443 tak pahunchne deta tha, lekin partners phir bhi fail ho rahe the. Rule ka hit count zero par ruka raha. Engineer ne packet-tracer chalaya aur dekha ki traffic implicit deny se match ho raha tha: ACL public address use kar raha tha, jabki ASA un-NAT ke baad real address 10.1.50.10 compare karta hai. Rule ko object WEB-SRV ke saath dobara likhne se ek minute mein fix ho gaya.</p><p><b>Seekh:</b> ASA par NAT ACL check se pehle resolve hota hai; hamesha real addresses se rules likho aur unhe packet-tracer aur hit counts se prove karo.</p></div>

<div class="iv"><p class="q">"Stateless ACL, stateful firewall aur NGFW mein kya farak hai?"</p><p>Strong answer: stateless ACL har packet ko akele judge karta hai, isliye return traffic ko apna permit chahiye. Stateful firewall connections ko state table mein track karta hai aur matching return traffic automatically allow karta hai. NGFW application aur user awareness, URL filtering, IPS, file aur malware inspection, reputation feeds aur decryption jodta hai. Cisco examples do: IOS ACL, ASA, FMC ke saath Threat Defense.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet filter (stateless), stateful firewall (connection table), NGFW (app, user, URL, IPS, files, decryption).</li>
<li>Zones interfaces ko trust se group karte hain; ASA 0 se 100 security levels use karta hai, Threat Defense security zones.</li>
<li>Rules top-down, first match, end mein implicit deny ke saath.</li>
<li>Users bahar ke liye dynamic PAT, servers andar ke liye static NAT; ASA 8.3+ ACLs real IPs use karte hain.</li>
<li>Routed vs transparent mode; show conn, show xlate aur packet-tracer se verify karo.</li>
</ul></div>
`}};export{e as default};