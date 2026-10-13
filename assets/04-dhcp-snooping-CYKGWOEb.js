var e={id:`dhcp-snooping`,h:{en:`DHCP snooping: trusted ports and the binding table`,hi:`DHCP snooping: trusted ports aur binding table`},body:{en:`
<p><b>A quick DHCP refresher.</b> When a PC joins the network it broadcasts a <b>DISCOVER</b>. A DHCP server answers with an <b>OFFER</b>. The client sends a <b>REQUEST</b> and the server confirms with an <b>ACK</b> (the DORA exchange). The ACK carries the IP address, mask, default gateway, DNS server and lease time. Notice the trust problem: the client accepts the first OFFER it hears, from whoever sends it.</p>
<p><b>The rogue DHCP server.</b> Somebody plugs a home router into a user port. Its DHCP server is on by default, it answers faster than the real one, and now some PCs get the wrong gateway or DNS. Users lose access, or worse, their traffic passes through a device the attacker controls. This is one of the most common real incidents on campus networks, and it is usually innocent.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DHCP snooping trusted and untrusted ports">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">CORE (trunk)</text>
<rect x="250" y="100" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">ACC</text><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">dhcp-security on STAFF</text>
<rect x="500" y="100" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="125" text-anchor="middle" class="svg-ink" font-size="13">DHCPSRV</text><text x="560" y="145" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/10 trusted</text>
<rect x="500" y="190" width="120" height="50" rx="8" fill="#fed7aa"/><text x="560" y="220" text-anchor="middle" class="svg-ink" font-size="13">HOMERTR</text>
<rect x="30" y="190" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="220" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="170" y="190" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="220" y="220" text-anchor="middle" class="svg-ink" font-size="13">PC2</text>
<line x1="320" y1="70" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="500" y2="130" stroke="#64748b" stroke-width="2"/><line x1="360" y1="160" x2="520" y2="190" stroke="#64748b" stroke-width="2"/><line x1="290" y1="160" x2="220" y2="190" stroke="#64748b" stroke-width="2"/><line x1="280" y1="160" x2="90" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="445" y="122" text-anchor="middle" class="svg-accent" font-size="12">OFFER allowed</text><text x="470" y="182" class="svg-accent" font-size="12">OFFER dropped</text>
</svg><p class="cap">Server messages are accepted only from trusted ports.</p></div>

<h3>How DHCP snooping works</h3>
<p>On ELS-based EX switches DHCP snooping, DAI and IP source guard are all enabled per VLAN under <code>forwarding-options dhcp-security</code>. DHCP snooping does two jobs:</p>
<ol>
<li><b>It filters server messages.</b> OFFER and ACK packets are accepted only from <b>trusted</b> ports. Everywhere else they are dropped, so a rogue server cannot answer. Client messages (DISCOVER, REQUEST) pass.</li>
<li><b>It builds a binding table.</b> From each ACK that it lets through, the switch stores IP address, MAC address, VLAN, port and lease time. Later features (DAI, IP source guard) use this table as the truth about who owns which address.</li>
</ol>
<p><b>Trust defaults.</b> Access ports are untrusted by default; trunk ports are trusted by default. That is correct for most designs, since the real DHCP server is normally reached through the uplink. If the server sits on an access port, as DHCPSRV does in the lab, that port must be explicitly trusted.</p>
<pre class="code"><span class="c">! ACC: enable snooping for VLAN STAFF and trust the real server port</span>
set vlans STAFF forwarding-options dhcp-security
set vlans STAFF forwarding-options dhcp-security group SERVERS overrides trusted
set vlans STAFF forwarding-options dhcp-security group SERVERS interface ge-0/0/10
commit</pre>
<p>The <b>group</b> is a way to give a set of interfaces the same settings. <code>overrides trusted</code> changes the default trust state for the members. The statement <code>set vlans STAFF forwarding-options dhcp-security</code> alone is enough to switch the feature on.</p>

<h3>Verify with the binding table</h3>
<p>After PC1 and PC2 run <code>ip dhcp</code> in the lab, DHCPSRV answers (the HOMERTR offers are dropped) and the table fills:</p>
<pre class="out">lab@ACC&gt; show dhcp-security binding
IP address       MAC address        Vlan         Expires  State   Interface
10.20.30.100     00:50:7f:06:6d:01  STAFF        86400    BOUND   ge-0/0/1.0
10.20.30.101     00:50:80:06:6e:01  STAFF        86400    BOUND   ge-0/0/2.0</pre>
<p>Read each column. <b>State BOUND</b> means a completed DORA exchange. <b>Expires</b> is the remaining lease in seconds. <b>Interface</b> is the port where the client lives, and that is the port that DAI and IP source guard will later bind the address to. If a client is missing from the list, either it never completed DHCP, it has a static address, or the ACK came from an untrusted port and was dropped.</p>

<div class="eg"><p><b>Worked example.</b> HOMERTR (10.20.30.254) is connected to ge-0/0/6 and offers 10.20.30.200 and above. DHCPSRV offers 10.20.30.100 and above. After snooping is on, PC1 receives only offers from ge-0/0/10, gets 10.20.30.100, and the gateway is the real one 10.20.30.1. The home router's OFFERs are discarded at ge-0/0/6.</p></div>

<h3>Real-life design notes</h3>
<ul>
<li>Enable snooping on every user VLAN and trust only uplinks and legitimate server ports.</li>
<li>If DHCP is relayed (a router with <code>helper-address</code> equivalent) the server sits behind the uplink: nothing extra is needed.</li>
<li>Bindings are kept in memory and a database file; they survive a reboot on platforms that keep the snooping database.</li>
<li>Hosts with static addresses do not appear in the table. When you later enable DAI or IP source guard, they will be blocked unless you add a static binding or trust their port.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Enabling snooping when the company DHCP server sits on an access port and forgetting to trust that port. Every client then stops getting addresses, because every OFFER and ACK is dropped as untrusted. Always check where the real server lives first.</p></div>
<div class="exam"><p><b>Exam trap.</b> The switch does not block DHCP <i>clients</i>; it blocks <i>server</i> messages from untrusted ports. Also remember the default: access untrusted, trunk trusted.</p></div>

<div class="scn"><h4>Half the floor with the wrong gateway</h4><p>On the Lucknow staff floor some users could not reach any internal system. <code>ipconfig</code> on an affected PC showed the gateway 10.20.30.254 instead of 10.20.30.1. Someone had connected a home router to a wall socket in a meeting room. After enabling dhcp-security on VLAN STAFF and trusting only the server port, the rogue offers were dropped. The engineer found the port because every dropped OFFER was visible in the logs and the binding table never listed it.</p><p><b>Lesson:</b> DHCP snooping fixes the symptom and also tells you where the rogue device is.</p></div>
<div class="iv"><p class="q">"What is DHCP snooping and what is the binding table used for?"</p><p>DHCP snooping classifies ports as trusted or untrusted, drops server messages from untrusted ports and records IP, MAC, VLAN, port and lease from each ACK. The binding table is then used by dynamic ARP inspection and IP source guard to validate hosts.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enable per VLAN with <code>forwarding-options dhcp-security</code>.</li>
<li>OFFER and ACK are accepted only from trusted ports; access = untrusted, trunk = trusted by default.</li>
<li>Trust an access-port server with a group and <code>overrides trusted</code>.</li>
<li><code>show dhcp-security binding</code> lists IP, MAC, VLAN, lease and port.</li>
<li>Static-IP hosts do not appear in the table.</li>
</ul></div>
`,hi:`
<p><b>DHCP ka quick refresher.</b> Jab PC network join karta hai to woh <b>DISCOVER</b> broadcast karta hai. DHCP server <b>OFFER</b> se jawab deta hai. Client <b>REQUEST</b> bhejta hai aur server <b>ACK</b> se confirm karta hai (DORA exchange). ACK mein IP address, mask, default gateway, DNS server aur lease time hota hai. Trust ki problem dekho: client pehla OFFER jo bhi bheje use maan leta hai.</p>
<p><b>Rogue DHCP server.</b> Koi ghar ka router user port mein laga deta hai. Uska DHCP server default se on hota hai, asli server se pehle jawab deta hai, aur ab kuch PCs ko galat gateway ya DNS milta hai. Users ka access chala jaata hai, ya bura ho to traffic attacker ke device se guzarta hai. Campus networks par yeh sabse common real incidents mein se ek hai, aur aksar masoom hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DHCP snooping trusted aur untrusted ports">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">CORE (trunk)</text>
<rect x="250" y="100" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">ACC</text><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">STAFF par dhcp-security</text>
<rect x="500" y="100" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="125" text-anchor="middle" class="svg-ink" font-size="13">DHCPSRV</text><text x="560" y="145" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/10 trusted</text>
<rect x="500" y="190" width="120" height="50" rx="8" fill="#fed7aa"/><text x="560" y="220" text-anchor="middle" class="svg-ink" font-size="13">HOMERTR</text>
<rect x="30" y="190" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="220" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="170" y="190" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="220" y="220" text-anchor="middle" class="svg-ink" font-size="13">PC2</text>
<line x1="320" y1="70" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="500" y2="130" stroke="#64748b" stroke-width="2"/><line x1="360" y1="160" x2="520" y2="190" stroke="#64748b" stroke-width="2"/><line x1="290" y1="160" x2="220" y2="190" stroke="#64748b" stroke-width="2"/><line x1="280" y1="160" x2="90" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="445" y="122" text-anchor="middle" class="svg-accent" font-size="12">OFFER allowed</text><text x="470" y="182" class="svg-accent" font-size="12">OFFER dropped</text>
</svg><p class="cap">Server messages sirf trusted ports se accept hote hain.</p></div>

<h3>DHCP snooping kaise kaam karti hai</h3>
<p>ELS-based EX switches par DHCP snooping, DAI aur IP source guard teeno VLAN ke hisaab se <code>forwarding-options dhcp-security</code> ke neeche on hote hain. DHCP snooping do kaam karti hai:</p>
<ol>
<li><b>Server messages filter karti hai.</b> OFFER aur ACK packets sirf <b>trusted</b> ports se accept hote hain. Baaki sab jagah drop, isliye rogue server jawab nahi de sakta. Client messages (DISCOVER, REQUEST) guzarte hain.</li>
<li><b>Binding table banati hai.</b> Jo ACK pass hota hai uska IP address, MAC address, VLAN, port aur lease time switch store karta hai. Baad ke features (DAI, IP source guard) is table ko sach maante hain ki kaunsa address kiska hai.</li>
</ol>
<p><b>Trust defaults.</b> Access ports default mein untrusted hain; trunk ports trusted. Zyaadatar designs ke liye yeh sahi hai kyunki asli DHCP server aam taur par uplink ke raaste milta hai. Agar server access port par hai, jaise lab mein DHCPSRV, to us port ko explicitly trust karna padega.</p>
<pre class="code"><span class="c">! ACC: VLAN STAFF ke liye snooping on karo aur asli server port ko trust karo</span>
set vlans STAFF forwarding-options dhcp-security
set vlans STAFF forwarding-options dhcp-security group SERVERS overrides trusted
set vlans STAFF forwarding-options dhcp-security group SERVERS interface ge-0/0/10
commit</pre>
<p><b>Group</b> interfaces ke set ko ek jaisi settings dene ka tareeka hai. <code>overrides trusted</code> members ka default trust state badalta hai. Akela <code>set vlans STAFF forwarding-options dhcp-security</code> feature on karne ke liye kaafi hai.</p>

<h3>Binding table se verify karo</h3>
<p>Lab mein PC1 aur PC2 ke <code>ip dhcp</code> chalane ke baad DHCPSRV jawab deta hai (HOMERTR ke offers drop hote hain) aur table bharta hai:</p>
<pre class="out">lab@ACC&gt; show dhcp-security binding
IP address       MAC address        Vlan         Expires  State   Interface
10.20.30.100     00:50:7f:06:6d:01  STAFF        86400    BOUND   ge-0/0/1.0
10.20.30.101     00:50:80:06:6e:01  STAFF        86400    BOUND   ge-0/0/2.0</pre>
<p>Har column padho. <b>State BOUND</b> matlab DORA exchange poora hua. <b>Expires</b> bachi hui lease seconds mein. <b>Interface</b> woh port hai jahan client rehta hai, aur DAI tatha IP source guard baad mein address ko isi port se bind karenge. Agar koi client list mein nahi hai to ya usne DHCP poora nahi kiya, ya uska static address hai, ya ACK untrusted port se aaya aur drop ho gaya.</p>

<div class="eg"><p><b>Worked example.</b> HOMERTR (10.20.30.254) ge-0/0/6 par laga hai aur 10.20.30.200 se upar offer karta hai. DHCPSRV 10.20.30.100 se upar offer karta hai. Snooping on hone ke baad PC1 ko sirf ge-0/0/10 ke offers milte hain, 10.20.30.100 milta hai, aur gateway asli 10.20.30.1 hota hai. Home router ke OFFERs ge-0/0/6 par discard ho jaate hain.</p></div>

<h3>Real-life design notes</h3>
<ul>
<li>Har user VLAN par snooping on karo aur sirf uplinks aur legitimate server ports ko trust karo.</li>
<li>Agar DHCP relay hota hai (router par <code>helper-address</code> jaisa) to server uplink ke peeche hota hai: kuch extra nahi chahiye.</li>
<li>Bindings memory aur database file mein rehti hain; jo platforms snooping database rakhte hain wahan reboot ke baad bhi bachti hain.</li>
<li>Static address wale hosts table mein nahi aate. Baad mein DAI ya IP source guard on karoge to static binding ya trusted port ke bina woh block ho jaayenge.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Company DHCP server access port par ho aur snooping on karke us port ko trust karna bhool jaana. Phir har client ko address milna band ho jaata hai kyunki har OFFER aur ACK untrusted maan kar drop hota hai. Pehle dekho asli server kahan hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Switch DHCP <i>clients</i> ko block nahi karta; woh untrusted ports se aaye <i>server</i> messages ko block karta hai. Default bhi yaad rakho: access untrusted, trunk trusted.</p></div>

<div class="scn"><h4>Aadhi floor ko galat gateway</h4><p>Lucknow staff floor par kuch users koi internal system nahi pahunch pa rahe the. Affected PC par <code>ipconfig</code> ne gateway 10.20.30.1 ki jagah 10.20.30.254 dikhaya. Kisi ne meeting room ke wall socket mein ghar ka router laga diya tha. VLAN STAFF par dhcp-security on karke sirf server port trust karne ke baad rogue offers drop hone lage. Engineer ne port dhoondh liya kyunki har dropped OFFER logs mein dikha aur binding table mein woh kabhi nahi aaya.</p><p><b>Lesson:</b> DHCP snooping symptom bhi theek karti hai aur batati bhi hai ki rogue device kahan hai.</p></div>
<div class="iv"><p class="q">"DHCP snooping kya hai aur binding table kis kaam aati hai?"</p><p>DHCP snooping ports ko trusted ya untrusted classify karti hai, untrusted ports ke server messages drop karti hai aur har ACK se IP, MAC, VLAN, port aur lease record karti hai. Binding table ko dynamic ARP inspection aur IP source guard hosts validate karne ke liye use karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN ke hisaab se <code>forwarding-options dhcp-security</code> se enable karo.</li>
<li>OFFER aur ACK sirf trusted ports se accept; default mein access = untrusted, trunk = trusted.</li>
<li>Access-port server ko group aur <code>overrides trusted</code> se trust karo.</li>
<li><code>show dhcp-security binding</code> IP, MAC, VLAN, lease aur port dikhata hai.</li>
<li>Static-IP hosts table mein nahi aate.</li>
</ul></div>
`}};export{e as default};