var e={id:`dai-ip-source-guard`,h:{en:`Dynamic ARP inspection and IP source guard`,hi:`Dynamic ARP inspection aur IP source guard`},body:{en:`
<p><b>Why ARP is a problem.</b> ARP maps an IP address to a MAC address. A host asks "who has 10.20.30.1?" and believes any answer it hears, even one it never asked for (a gratuitous ARP). There is no authentication. An attacker can therefore tell the PCs "10.20.30.1 is at my MAC" and the gateway "10.20.30.20 is at my MAC". Both sides now send their traffic to the attacker, who can read it or drop it. This is <b>ARP spoofing</b> (also called ARP poisoning) and it turns a switch into a man-in-the-middle platform without breaking any rule of Ethernet.</p>
<p><b>IP spoofing.</b> A different trick: a host with a static address that was never leased simply starts to use it, or uses another host's address as source to hide or to impersonate it. DHCP snooping alone does not stop this because snooping only watches DHCP.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DAI checks ARP against the binding table">
<rect x="20" y="80" width="110" height="50" rx="8" fill="#fed7aa"/><text x="75" y="110" text-anchor="middle" class="svg-ink" font-size="13">ATTACKER</text>
<rect x="250" y="60" width="150" height="90" rx="10" fill="#ddd6fe"/><text x="325" y="90" text-anchor="middle" class="svg-ink" font-size="13">ACC</text><text x="325" y="110" text-anchor="middle" class="svg-muted" font-size="12">DAI + IPSG</text><text x="325" y="130" text-anchor="middle" class="svg-muted" font-size="12">binding table</text>
<rect x="510" y="80" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="110" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text>
<line x1="130" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="400" y1="105" x2="510" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="190" y="95" text-anchor="middle" class="svg-accent" font-size="12">ARP / IP</text><text x="190" y="125" text-anchor="middle" class="svg-muted" font-size="12">not in table: drop</text>
<text x="325" y="190" text-anchor="middle" class="svg-muted" font-size="12">only IP + MAC + port that match a lease pass</text>
</svg><p class="cap">Untrusted ports are checked against bindings.</p></div>

<h3>Dynamic ARP inspection (DAI)</h3>
<p>DAI validates every ARP packet that enters an <b>untrusted</b> port. The sender IP and sender MAC inside the ARP must match an entry in the DHCP snooping binding table for that VLAN. If they do not, the packet is dropped and counted. ARP from trusted ports is not checked.</p>
<pre class="code"><span class="c">! DAI needs DHCP snooping bindings, so enable snooping first (chapter 4)</span>
set vlans STAFF forwarding-options dhcp-security arp-inspection
commit</pre>
<pre class="out">lab@ACC&gt; show dhcp-security arp inspection statistics
ARP inspection statistics:
Interface          Packets received     ARP inspection pass     ARP inspection failed
---------------    ----------------     -------------------     ---------------------
ge-0/0/1.0         0                    0                       0
ge-0/0/3.0         0                    0                       0
ge-0/0/10.0        0                    0                       0</pre>
<p>The three columns are your detective: received (all ARP from that port), pass (matched a binding) and failed (dropped). A port with a growing failed counter is either a spoofer or a host with a static IP that has no binding. The lab output above is taken right after DAI was switched on, so every counter is still zero.</p>
<p>Notice what DAI does <b>not</b> do. In the lab, ATTACKER already has the gateway's MAC in its ARP cache. DAI only inspects ARP, so ATTACKER can still send IP packets to that MAC and the ping continues to work. DAI stops a host from <i>learning</i> addresses through forged ARP; it does not check IP packets. That gap is closed by IP source guard.</p>

<h3>IP source guard (IPSG)</h3>
<p>IPSG inspects the <b>source IP address and source MAC</b> of every IP packet from an untrusted port and compares them with the binding table. A packet whose pair is not bound to that port is dropped. A host that was never leased an address, or that tries another host's address, can no longer send traffic.</p>
<pre class="code">set vlans STAFF forwarding-options dhcp-security ip-source-guard
commit</pre>
<pre class="out">lab@ACC&gt; show dhcp-security binding ip-source-guard
IP address       MAC address        Vlan         Expires  State   Interface       Source guard
10.20.30.100     00:50:7f:06:6d:01  STAFF        86400    BOUND   ge-0/0/1.0      <span class="hl">enabled</span>
10.20.30.101     00:50:80:06:6e:01  STAFF        86400    BOUND   ge-0/0/2.0      <span class="hl">enabled</span>

lab@ACC&gt; show configuration vlans STAFF
vlan-id 30;
forwarding-options {
    dhcp-security {
        arp-inspection;
        ip-source-guard;
        group SERVERS {
            overrides {
                trusted;
            }
            interface ge-0/0/10;
        }
    }
}</pre>
<p>Now the ATTACKER pings the gateway again and gets timeouts, while PC1 and PC2 still reach 10.20.30.1. The frame from ATTACKER leaves the port with source 10.20.30.66, there is no binding for that port, and the switch drops it.</p>

<h3>The security stack, in order</h3>
<table class="cmp"><tr><th>Step</th><th>Feature</th><th>Stops</th></tr>
<tr><td>1</td><td>DHCP snooping</td><td>rogue DHCP servers; builds bindings</td></tr>
<tr><td>2</td><td>Dynamic ARP inspection</td><td>forged ARP, ARP poisoning</td></tr>
<tr><td>3</td><td>IP source guard</td><td>IP and MAC spoofing, unleased static addresses</td></tr></table>
<p>The features depend on each other: DAI and IPSG trust the binding table. Without snooping there is nothing to compare against and legitimate hosts would be dropped.</p>

<div class="eg"><p><b>Worked example.</b> A server with a static IP 10.20.30.50 on an access port has no DHCP binding. With DAI and IPSG enabled, its ARP and its IP traffic are dropped. Two clean fixes: trust its port (put it in a dhcp-security group with <code>overrides trusted</code>) or give it a DHCP reservation. Never switch the protection off for the whole VLAN.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling DAI or IPSG on a VLAN where hosts use static addresses. All of them fall off the network at once. Inventory static hosts first and trust or bind them before you enable. Also remember that VMs and printers with static IPs are classic victims.</p></div>
<div class="exam"><p><b>Exam trap.</b> DAI checks ARP, IPSG checks IP packets. Both are enabled per VLAN and both rely on the snooping binding table. Trunk ports are trusted by default, so they are not inspected.</p></div>

<div class="scn"><h4>The laptop that knew the gateway</h4><p>A trainee ran a tool that sent ARP replies claiming to be the gateway. Classmates saw a duplicate-address warning and slow connections. With DAI on, the forged replies were dropped and the failed counter on that port climbed quickly, pointing straight at the trainee's seat. The trainee then tried to type a static address with the gateway MAC copied: IPSG dropped those packets as well.</p><p><b>Lesson:</b> DAI stops the poisoning; IPSG stops the impersonation. You need both.</p></div>
<div class="iv"><p class="q">"What is the difference between DAI and IP source guard?"</p><p>Both use the DHCP snooping binding table. DAI validates the sender IP and MAC inside ARP packets on untrusted ports. IP source guard validates the source IP and MAC of ordinary IP packets. DAI prevents cache poisoning; IPSG prevents spoofed traffic. Add that static-IP hosts need a trusted port or a static binding.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ARP and IP have no authentication; spoofing gives man-in-the-middle and impersonation.</li>
<li>DAI: <code>arp-inspection</code>, checks ARP against bindings, drops failures.</li>
<li>IPSG: <code>ip-source-guard</code>, checks source IP + MAC of IP packets.</li>
<li>Both depend on DHCP snooping bindings, per VLAN.</li>
<li>Static hosts need a trusted port or a static binding.</li>
</ul></div>
`,hi:`
<p><b>ARP problem kyun hai.</b> ARP IP address ko MAC address se map karta hai. Host poochta hai "10.20.30.1 kiske paas hai?" aur jo bhi jawab sune use maan leta hai, woh bhi jo usne maanga nahi tha (gratuitous ARP). Koi authentication nahi. Attacker isliye PCs ko keh sakta hai "10.20.30.1 mere MAC par hai" aur gateway ko "10.20.30.20 mere MAC par hai". Dono taraf ka traffic attacker ko jaata hai, jo use padh ya drop kar sakta hai. Yeh <b>ARP spoofing</b> (ARP poisoning bhi kehte hain) hai aur Ethernet ka koi rule tode bina switch ko man-in-the-middle platform bana deta hai.</p>
<p><b>IP spoofing.</b> Alag trick: kisi host ka static address jo kabhi lease nahi hua tha, wo bas use karna shuru kar deta hai, ya chhupne ya impersonate karne ke liye doosre host ka address source bana leta hai. Akeli DHCP snooping ise nahi rokti kyunki snooping sirf DHCP dekhti hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DAI ARP ko binding table se check karta hai">
<rect x="20" y="80" width="110" height="50" rx="8" fill="#fed7aa"/><text x="75" y="110" text-anchor="middle" class="svg-ink" font-size="13">ATTACKER</text>
<rect x="250" y="60" width="150" height="90" rx="10" fill="#ddd6fe"/><text x="325" y="90" text-anchor="middle" class="svg-ink" font-size="13">ACC</text><text x="325" y="110" text-anchor="middle" class="svg-muted" font-size="12">DAI + IPSG</text><text x="325" y="130" text-anchor="middle" class="svg-muted" font-size="12">binding table</text>
<rect x="510" y="80" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="110" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text>
<line x1="130" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="400" y1="105" x2="510" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="190" y="95" text-anchor="middle" class="svg-accent" font-size="12">ARP / IP</text><text x="190" y="125" text-anchor="middle" class="svg-muted" font-size="12">table mein nahi: drop</text>
<text x="325" y="190" text-anchor="middle" class="svg-muted" font-size="12">sirf lease se match karne wale IP + MAC + port pass hote hain</text>
</svg><p class="cap">Untrusted ports ko bindings se check kiya jaata hai.</p></div>

<h3>Dynamic ARP inspection (DAI)</h3>
<p>DAI <b>untrusted</b> port par aane wale har ARP packet ko validate karta hai. ARP ke andar ka sender IP aur sender MAC us VLAN ke DHCP snooping binding table ki kisi entry se match hona chahiye. Nahi hua to packet drop aur count hota hai. Trusted ports ka ARP check nahi hota.</p>
<pre class="code"><span class="c">! DAI ko DHCP snooping bindings chahiye, isliye pehle snooping on karo (chapter 4)</span>
set vlans STAFF forwarding-options dhcp-security arp-inspection
commit</pre>
<pre class="out">lab@ACC&gt; show dhcp-security arp inspection statistics
ARP inspection statistics:
Interface          Packets received     ARP inspection pass     ARP inspection failed
---------------    ----------------     -------------------     ---------------------
ge-0/0/1.0         0                    0                       0
ge-0/0/3.0         0                    0                       0
ge-0/0/10.0        0                    0                       0</pre>
<p>Teen columns aapke detective hain: received (us port ka saara ARP), pass (binding se match) aur failed (drop). Jis port ka failed counter badh raha ho wahan ya spoofer hai ya static IP wala host jiska binding nahi. Upar ka lab output DAI on karne ke turant baad ka hai, isliye saare counters abhi zero hain.</p>
<p>Dhyan do DAI kya <b>nahi</b> karta. Lab mein ATTACKER ke ARP cache mein gateway ka MAC pehle se hai. DAI sirf ARP inspect karta hai, isliye ATTACKER us MAC par IP packets bhejta rehta hai aur ping chalti rehti hai. DAI host ko forged ARP se addresses <i>seekhne</i> se rokta hai; IP packets check nahi karta. Yeh gap IP source guard band karta hai.</p>

<h3>IP source guard (IPSG)</h3>
<p>IPSG untrusted port se aane wale har IP packet ka <b>source IP address aur source MAC</b> inspect karke binding table se milata hai. Jis packet ka pair us port se bound nahi, woh drop hota hai. Jis host ko address lease hi nahi hua, ya jo doosre host ka address try kare, woh ab traffic nahi bhej sakta.</p>
<pre class="code">set vlans STAFF forwarding-options dhcp-security ip-source-guard
commit</pre>
<pre class="out">lab@ACC&gt; show dhcp-security binding ip-source-guard
IP address       MAC address        Vlan         Expires  State   Interface       Source guard
10.20.30.100     00:50:7f:06:6d:01  STAFF        86400    BOUND   ge-0/0/1.0      <span class="hl">enabled</span>
10.20.30.101     00:50:80:06:6e:01  STAFF        86400    BOUND   ge-0/0/2.0      <span class="hl">enabled</span>

lab@ACC&gt; show configuration vlans STAFF
vlan-id 30;
forwarding-options {
    dhcp-security {
        arp-inspection;
        ip-source-guard;
        group SERVERS {
            overrides {
                trusted;
            }
            interface ge-0/0/10;
        }
    }
}</pre>
<p>Ab ATTACKER gateway ko dobara ping karta hai to timeouts milte hain, jabki PC1 aur PC2 ab bhi 10.20.30.1 tak pahunchte hain. ATTACKER ka frame source 10.20.30.66 ke saath port se nikalta hai, us port ke liye koi binding nahi, aur switch use drop kar deta hai.</p>

<h3>Security stack, kram mein</h3>
<table class="cmp"><tr><th>Step</th><th>Feature</th><th>Kya rokta hai</th></tr>
<tr><td>1</td><td>DHCP snooping</td><td>rogue DHCP servers; bindings banata hai</td></tr>
<tr><td>2</td><td>Dynamic ARP inspection</td><td>forged ARP, ARP poisoning</td></tr>
<tr><td>3</td><td>IP source guard</td><td>IP aur MAC spoofing, bina lease ke static addresses</td></tr></table>
<p>Features ek doosre par depend karte hain: DAI aur IPSG binding table par bharosa karte hain. Snooping ke bina compare karne ko kuch nahi hota aur legitimate hosts bhi drop ho jaate.</p>

<div class="eg"><p><b>Worked example.</b> Access port par static IP 10.20.30.50 wale server ka DHCP binding nahi hai. DAI aur IPSG on hone par uska ARP aur IP traffic drop hota hai. Do saaf fix: uska port trust karo (dhcp-security group mein <code>overrides trusted</code>) ya DHCP reservation do. Poore VLAN ki protection kabhi band mat karo.</p></div>

<div class="warn"><p><b>Common mistake.</b> Jis VLAN mein hosts static address use karte hain wahan DAI ya IPSG on kar dena. Sab ek saath network se gir jaate hain. Pehle static hosts ki inventory karo aur enable karne se pehle unhe trust ya bind karo. Static IP wale VMs aur printers classic victims hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> DAI ARP check karta hai, IPSG IP packets. Dono VLAN ke hisaab se on hote hain aur dono snooping binding table par depend karte hain. Trunk ports default mein trusted hain, isliye inspect nahi hote.</p></div>

<div class="scn"><h4>Gateway jaanne wala laptop</h4><p>Ek trainee ne aisa tool chalaya jo gateway hone ka daava karte ARP replies bhejta tha. Classmates ko duplicate-address warning aur slow connections dikhe. DAI on hota to forged replies drop ho jaate aur us port ka failed counter tezi se badhta, jo seedha trainee ki seat batata. Phir trainee ne gateway MAC copy karke static address daalne ki koshish ki: IPSG ne un packets ko bhi drop kar diya.</p><p><b>Lesson:</b> DAI poisoning rokta hai; IPSG impersonation rokta hai. Dono chahiye.</p></div>
<div class="iv"><p class="q">"DAI aur IP source guard mein kya difference hai?"</p><p>Dono DHCP snooping binding table use karte hain. DAI untrusted ports par ARP packets ke andar ka sender IP aur MAC validate karta hai. IP source guard aam IP packets ka source IP aur MAC validate karta hai. DAI cache poisoning rokta hai; IPSG spoofed traffic rokta hai. Yeh bhi jodo ki static-IP hosts ko trusted port ya static binding chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ARP aur IP mein authentication nahi; spoofing se man-in-the-middle aur impersonation hota hai.</li>
<li>DAI: <code>arp-inspection</code>, ARP ko bindings se check karta hai, failures drop.</li>
<li>IPSG: <code>ip-source-guard</code>, IP packets ka source IP + MAC check karta hai.</li>
<li>Dono DHCP snooping bindings par depend karte hain, VLAN ke hisaab se.</li>
<li>Static hosts ko trusted port ya static binding chahiye.</li>
</ul></div>
`}};export{e as default};