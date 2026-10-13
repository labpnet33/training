var e={id:`stateful`,h:{en:`Stateful failover: what is replicated and what survives`,hi:`Stateful failover: kya replicate hota hai aur kya bachta hai`},body:{en:`
<p>Imagine a hotel reception that switches to a night receptionist at midnight. If the day receptionist leaves without a handover, the night receptionist has no idea which guests are checked in: a guest coming back from dinner is treated as a stranger and turned away. If they share a live guest register, the night receptionist greets everyone by name. A firewall is the same. An ASA is <b>stateful</b>: it only lets a returning packet in if it belongs to a connection in its <b>connection table</b>. If the new active unit starts with an empty table, it turns every returning packet away.</p>

<h3>Stateless failover: addresses move, sessions die</h3>
<p>Without a state link the standby still receives the configuration, so after a failover it has the same addresses, rules and NAT policy. But its connection table is empty. The next packet of an existing TCP session is an ACK or PSH ACK, not a SYN, so the ASA drops it and logs:</p>
<pre class="out"><span class="hl">%ASA-6-106015: Deny TCP (no connection) from 10.0.1.10/51234 to 8.8.8.1/22 flags PSH ACK  on interface inside</span></pre>
<p>Users see frozen SSH windows, broken downloads, dropped VoIP calls and VPN tunnels that must be rebuilt. The pair "worked", yet the business noticed the failure.</p>

<h3>Stateful failover: the standby keeps a live copy</h3>
<p>With <code>failover link STATELINK GigabitEthernet0/4</code> the active unit streams state updates to the standby continuously: every new connection, every closed connection, every new translation. After a failover the new active unit already knows every session, so the next packet matches an existing entry and passes. The session continues as if nothing happened.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="State replication">
<rect x="20" y="90" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="200" y="30" width="170" height="70" rx="10" fill="#bae6fd"/><text x="285" y="55" text-anchor="middle" class="svg-ink" font-size="13">ASA1 Active</text><text x="285" y="77" text-anchor="middle" class="svg-muted" font-size="12">conn: 10.0.1.10 → 8.8.8.1:22</text>
<rect x="200" y="150" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="285" y="175" text-anchor="middle" class="svg-ink" font-size="13">ASA2 Standby</text><text x="285" y="197" text-anchor="middle" class="svg-muted" font-size="12">same conn (copy)</text>
<line x1="285" y1="100" x2="285" y2="150" stroke="#64748b" stroke-width="3"/><text x="292" y="130" class="svg-accent" font-size="12">STATELINK updates</text>
<rect x="500" y="90" width="120" height="40" rx="8" fill="#fed7aa"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="13">ISP 8.8.8.1</text>
<line x1="110" y1="105" x2="200" y2="65" stroke="#64748b" stroke-width="2"/><line x1="370" y1="65" x2="500" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="115" x2="200" y2="185" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="370" y1="185" x2="500" y2="115" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="440" y="200" text-anchor="middle" class="svg-muted" font-size="12">path after failover</text>
</svg><p class="cap">The standby never saw a packet of the SSH session, yet it holds the connection because the active unit sent it over STATELINK.</p></div>

<h3>What is replicated</h3>
<p>Two kinds of replication run over the pair's links:</p>
<ul>
<li><b>Configuration replication</b> (failover link): the full running configuration when the standby joins (states Sync Config and Sync File System), then every command as it is entered.</li>
<li><b>State replication</b> (state link): first a <b>bulk sync</b> of all current state when the standby joins (state Bulk Sync), then incremental updates.</li>
</ul>
<table class="cmp"><tr><th>Replicated with stateful failover</th><th>Not replicated (or only on request)</th></tr>
<tr><td>TCP and UDP connection table</td><td>HTTP connections: not by default; enable with <code>failover replication h&#116;tp</code></td></tr>
<tr><td>NAT translation table (xlates), so PAT ports stay the same</td><td>Sessions inside plaintext tunnels such as GRE or IP-in-IP</td></tr>
<tr><td>ARP table (and the MAC table in transparent mode)</td><td>DHCP server address leases</td></tr>
<tr><td>Static and dynamic routing tables (routes learned by OSPF, EIGRP, BGP are kept in the standby's RIB)</td><td>Multicast routing state</td></tr>
<tr><td>IKE and IPsec security associations (site-to-site VPN); remote access VPN client sessions</td><td>Some application states that are too short-lived to be worth copying</td></tr>
<tr><td>User identity (identity firewall), SIP signalling, GTP, SCTP state</td><td>ICMP, unless the interface is in an <code>asr-group</code></td></tr></table>
<p>Why is HTTP excluded by default? Classic web requests are short, and a browser simply retries. Replicating thousands of tiny connections costs more CPU and state-link bandwidth than it saves. If your users run long downloads or streaming over plain HTTP, turn it on.</p>

<h3>Proving it in lab 2</h3>
<p>PC1 opens <code>ssh -l noc 8.8.8.1</code> through the pair. The connection is created on ASA1. Now look at the <b>standby</b>:</p>
<pre class="out">NK-ASA# show conn
1 in use, 3 most used

<span class="hl">TCP outside  8.8.8.1:22 inside  10.0.1.10:51234, idle 0:00:04, bytes 5321, flags UIO</span></pre>
<p>ASA2 has not forwarded a single packet of this session, but it lists it, with destination port <b>22</b>, because ASA1 sent the entry over STATELINK. The counters confirm it: on the active unit the <code>TCP conn</code> row of <code>show failover</code> counts <b>xmit</b>, on the standby it counts <b>rcv</b>.</p>
<pre class="out">Stateful Failover Logical Update Statistics
	<span class="hl">Link : STATELINK GigabitEthernet0/4 (up)</span>
	Stateful Obj    xmit       xerr       rcv        rerr
	General         42         0          42         0
	sys cmd         42         0          42         0
	<span class="hl">TCP conn        14         0          0          0</span>
	UDP conn        6          0          0          0
	ARP tbl         3          0          0          0</pre>

<div class="eg"><p><b>Worked example: PAT survives too.</b> PC1's session leaves ASA1 translated to 203.0.113.2 port 51234 (dynamic PAT on the interface address). The xlate is replicated. After failover, ASA2 owns 203.0.113.2 and already holds the xlate, so the ISP router keeps talking to 203.0.113.2:51234 and the session never notices. If the xlate were missing, the reply to 203.0.113.2:51234 would have no translation and be dropped even if the connection entry existed.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring a state link that is too slow or shares a congested switch path. When the state link cannot keep up, updates are dropped (look at <code>xerr</code>/<code>rerr</code> and the Xmit Q in <code>show failover</code>) and the standby's copy is stale, so some sessions still break at failover.</p></div>
<div class="exam"><p><b>Exam trap.</b> The failover link carries hellos and configuration; the <b>stateful</b> link carries connections and xlates. A pair without a state link is stateless, even though configuration still replicates. And HTTP is the classic "not replicated by default" answer.</p></div>

<div class="scn"><h4>Payment terminals and the stateless pair</h4><p>A retailer's pair had been installed years earlier with only a failover link. During a planned failover test every card terminal lost its TLS session to the payment gateway and the tills froze for about 40 seconds while they reconnected. The engineer checked <code>show running-config failover</code>: no <code>failover link</code> line, and <code>show failover</code> said <code>Link : Unconfigured.</code> The logs were full of 106015 "no connection" denies. He added a dedicated state link on a spare port in the next window and repeated the test: no terminal noticed.</p><p><b>Lesson:</b> a failover pair without a state link protects the firewall, not the sessions.</p></div>

<div class="iv"><p class="q">"What exactly does stateful failover replicate, and what does it not?"</p><p>Strong answer: over the state link it replicates the TCP and UDP connection table, NAT xlates, ARP (and the MAC table in transparent mode), routing tables, IKE/IPsec SAs and remote access VPN sessions, plus identity and some inspection state. It does not replicate HTTP connections by default (enable <code>failover replication h&#116;tp</code>), GRE or IP-in-IP inner sessions, DHCP server leases or multicast routing. Add that the new active unit's first packet then matches an existing entry instead of being denied with 106015, and that the state link must be sized for the connection rate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Without a state link the new active unit drops existing sessions with 106015 "no connection".</li>
<li>The state link carries conns, xlates, ARP, routes, VPN SAs and more; bulk sync first, then incremental updates.</li>
<li>HTTP is not replicated by default: <code>failover replication h&#116;tp</code>.</li>
<li>Prove replication with <code>show conn</code> on the standby and the xmit/rcv counters in <code>show failover</code>.</li>
<li>Size the state link for the connection rate and watch the error counters.</li>
</ul></div>
`,hi:`
<p>Ek hotel reception socho jo aadhi raat ko night receptionist par switch hota hai. Agar day receptionist bina handover ke chala jaaye, night receptionist ko pata nahi ki kaunse guests check in hain: dinner se lautta guest ajnabi samjha jaata hai aur lauta diya jaata hai. Agar dono ek live guest register share karte hain, night receptionist sabko naam se greet karta hai. Firewall bhi aisa hi hai. ASA <b>stateful</b> hai: woh lautte packet ko tabhi andar aane deta hai jab woh uski <b>connection table</b> ke kisi connection ka ho. Agar naya active unit khaali table ke saath shuru ho, to woh har lautte packet ko lauta deta hai.</p>

<h3>Stateless failover: addresses move hote hain, sessions marte hain</h3>
<p>State link ke bina bhi standby ko configuration milti hai, isliye failover ke baad uske paas same addresses, rules aur NAT policy hoti hai. Lekin uski connection table khaali hoti hai. Existing TCP session ka agla packet ACK ya PSH ACK hota hai, SYN nahi, isliye ASA use drop karta hai aur log karta hai:</p>
<pre class="out"><span class="hl">%ASA-6-106015: Deny TCP (no connection) from 10.0.1.10/51234 to 8.8.8.1/22 flags PSH ACK  on interface inside</span></pre>
<p>Users ko frozen SSH windows, toote downloads, drop hui VoIP calls aur VPN tunnels dikhte hain jinhe dobara banana padta hai. Pair ne "kaam kiya", phir bhi business ko failure dikh gaya.</p>

<h3>Stateful failover: standby ek live copy rakhta hai</h3>
<p><code>failover link STATELINK GigabitEthernet0/4</code> ke saath active unit lagatar standby ko state updates bhejta hai: har naya connection, har band connection, har nayi translation. Failover ke baad naye active unit ko har session pehle se pata hota hai, isliye agla packet existing entry se match hota hai aur pass ho jaata hai. Session aise chalta hai jaise kuch hua hi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="State replication">
<rect x="20" y="90" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="200" y="30" width="170" height="70" rx="10" fill="#bae6fd"/><text x="285" y="55" text-anchor="middle" class="svg-ink" font-size="13">ASA1 Active</text><text x="285" y="77" text-anchor="middle" class="svg-muted" font-size="12">conn: 10.0.1.10 → 8.8.8.1:22</text>
<rect x="200" y="150" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="285" y="175" text-anchor="middle" class="svg-ink" font-size="13">ASA2 Standby</text><text x="285" y="197" text-anchor="middle" class="svg-muted" font-size="12">wahi conn (copy)</text>
<line x1="285" y1="100" x2="285" y2="150" stroke="#64748b" stroke-width="3"/><text x="292" y="130" class="svg-accent" font-size="12">STATELINK updates</text>
<rect x="500" y="90" width="120" height="40" rx="8" fill="#fed7aa"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="13">ISP 8.8.8.1</text>
<line x1="110" y1="105" x2="200" y2="65" stroke="#64748b" stroke-width="2"/><line x1="370" y1="65" x2="500" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="115" x2="200" y2="185" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="370" y1="185" x2="500" y2="115" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="440" y="200" text-anchor="middle" class="svg-muted" font-size="12">failover ke baad path</text>
</svg><p class="cap">Standby ne SSH session ka ek bhi packet nahi dekha, phir bhi uske paas connection hai kyunki active unit ne use STATELINK par bheja.</p></div>

<h3>Kya replicate hota hai</h3>
<p>Pair ke links par do tarah ka replication chalta hai:</p>
<ul>
<li><b>Configuration replication</b> (failover link): standby judne par poori running configuration (states Sync Config aur Sync File System), phir har command jaise hi daali jaaye.</li>
<li><b>State replication</b> (state link): standby judne par pehle saari current state ka <b>bulk sync</b> (state Bulk Sync), phir incremental updates.</li>
</ul>
<table class="cmp"><tr><th>Stateful failover ke saath replicate hota hai</th><th>Replicate nahi hota (ya sirf request par)</th></tr>
<tr><td>TCP aur UDP connection table</td><td>HTTP connections: default mein nahi; <code>failover replication h&#116;tp</code> se enable karo</td></tr>
<tr><td>NAT translation table (xlates), isliye PAT ports same rehte hain</td><td>GRE ya IP-in-IP jaise plaintext tunnels ke andar ke sessions</td></tr>
<tr><td>ARP table (aur transparent mode mein MAC table)</td><td>DHCP server address leases</td></tr>
<tr><td>Static aur dynamic routing tables (OSPF, EIGRP, BGP se seekhe routes standby ke RIB mein rehte hain)</td><td>Multicast routing state</td></tr>
<tr><td>IKE aur IPsec security associations (site-to-site VPN); remote access VPN client sessions</td><td>Kuch application states jo copy karne layak lambe nahi hote</td></tr>
<tr><td>User identity (identity firewall), SIP signalling, GTP, SCTP state</td><td>ICMP, jab tak interface <code>asr-group</code> mein na ho</td></tr></table>
<p>HTTP default mein kyun bahar hai? Classic web requests chhoti hoti hain, aur browser bas retry kar leta hai. Hazaron chhote connections replicate karne mein jitna CPU aur state-link bandwidth lagta hai, utna bachta nahi. Agar aapke users plain HTTP par lambe downloads ya streaming chalate hain, to ise on karo.</p>

<h3>Lab 2 mein saabit karna</h3>
<p>PC1 pair ke through <code>ssh -l noc 8.8.8.1</code> kholta hai. Connection ASA1 par banta hai. Ab <b>standby</b> ko dekho:</p>
<pre class="out">NK-ASA# show conn
1 in use, 3 most used

<span class="hl">TCP outside  8.8.8.1:22 inside  10.0.1.10:51234, idle 0:00:04, bytes 5321, flags UIO</span></pre>
<p>ASA2 ne is session ka ek bhi packet forward nahi kiya, phir bhi woh ise destination port <b>22</b> ke saath list karta hai, kyunki ASA1 ne entry STATELINK par bheji. Counters isko confirm karte hain: active unit par <code>show failover</code> ki <code>TCP conn</code> row <b>xmit</b> ginti hai, standby par <b>rcv</b>.</p>
<pre class="out">Stateful Failover Logical Update Statistics
	<span class="hl">Link : STATELINK GigabitEthernet0/4 (up)</span>
	Stateful Obj    xmit       xerr       rcv        rerr
	General         42         0          42         0
	sys cmd         42         0          42         0
	<span class="hl">TCP conn        14         0          0          0</span>
	UDP conn        6          0          0          0
	ARP tbl         3          0          0          0</pre>

<div class="eg"><p><b>Worked example: PAT bhi bachta hai.</b> PC1 ka session ASA1 se 203.0.113.2 port 51234 par translate hokar nikalta hai (interface address par dynamic PAT). Xlate replicate hota hai. Failover ke baad ASA2 203.0.113.2 ka maalik hai aur uske paas pehle se xlate hai, isliye ISP router 203.0.113.2:51234 se baat karta rehta hai aur session ko kuch pata nahi chalta. Agar xlate missing hota, to 203.0.113.2:51234 ke reply ki koi translation nahi hoti aur woh drop ho jaata, chahe connection entry exist karti.</p></div>

<div class="warn"><p><b>Common galti.</b> Aisa state link configure karna jo bahut slow ho ya congested switch path share kare. Jab state link saath nahi de pata, updates drop hote hain (<code>show failover</code> mein <code>xerr</code>/<code>rerr</code> aur Xmit Q dekho) aur standby ki copy purani hoti hai, isliye failover par kuch sessions phir bhi toot-te hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Failover link hellos aur configuration le jaata hai; <b>stateful</b> link connections aur xlates. Bina state link ka pair stateless hai, chahe configuration replicate hoti rahe. Aur "default mein replicate nahi hota" ka classic jawab HTTP hai.</p></div>

<div class="scn"><h4>Payment terminals aur stateless pair</h4><p>Ek retailer ka pair saalon pehle sirf failover link ke saath install hua tha. Planned failover test ke dauraan har card terminal ka payment gateway se TLS session toot gaya aur tills lagbhag 40 second freeze rahe jab tak reconnect nahi hue. Engineer ne <code>show running-config failover</code> check kiya: koi <code>failover link</code> line nahi, aur <code>show failover</code> ne kaha <code>Link : Unconfigured.</code> Logs 106015 "no connection" denies se bhare the. Usne agli window mein ek spare port par dedicated state link joda aur test dohraya: kisi terminal ko pata nahi chala.</p><p><b>Seekh:</b> bina state link ka failover pair firewall ko bachata hai, sessions ko nahi.</p></div>

<div class="iv"><p class="q">"Stateful failover exactly kya replicate karta hai, aur kya nahi?"</p><p>Strong answer: state link par yeh TCP aur UDP connection table, NAT xlates, ARP (aur transparent mode mein MAC table), routing tables, IKE/IPsec SAs aur remote access VPN sessions replicate karta hai, plus identity aur kuch inspection state. Yeh default mein HTTP connections replicate nahi karta (<code>failover replication h&#116;tp</code> enable karo), GRE ya IP-in-IP ke andar ke sessions, DHCP server leases ya multicast routing bhi nahi. Jodo ki naye active unit ka pehla packet phir 106015 se deny hone ki jagah existing entry se match karta hai, aur state link connection rate ke hisaab se size hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>State link ke bina naya active unit existing sessions ko 106015 "no connection" ke saath drop karta hai.</li>
<li>State link conns, xlates, ARP, routes, VPN SAs aur bahut kuch le jaata hai; pehle bulk sync, phir incremental updates.</li>
<li>HTTP default mein replicate nahi hota: <code>failover replication h&#116;tp</code>.</li>
<li>Standby par <code>show conn</code> aur <code>show failover</code> ke xmit/rcv counters se replication saabit karo.</li>
<li>State link ko connection rate ke hisaab se size karo aur error counters dekho.</li>
</ul></div>
`}};export{e as default};