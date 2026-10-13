var e={id:`dhcpv6-guard`,h:{en:`DHCPv6 guard: client and server roles, preference and filters`,hi:`DHCPv6 guard: client aur server roles, preference aur filters`},body:{en:`
<p>In a hospital, patients may ask any nurse for help, but only the pharmacy counter may hand out medicine. If a stranger in a white coat starts handing out tablets in the corridor, security stops him, not because he asked a question, but because he is <b>giving</b> something only the pharmacy may give. <b>DHCPv6 guard</b> applies this rule to DHCPv6: on client ports, clients may send anything a client sends, but any message that only a server or relay should send is dropped.</p>

<h3>What gets dropped</h3>
<table class="cmp"><tr><th>Direction</th><th>Messages</th><th>On a client-role port</th></tr>
<tr><td>Client to server</td><td>SOLICIT, REQUEST, RENEW, REBIND, RELEASE, DECLINE, CONFIRM, INFORMATION-REQUEST</td><td>Allowed</td></tr>
<tr><td>Server to client</td><td><b>ADVERTISE, REPLY, RECONFIGURE</b></td><td><b>Dropped</b></td></tr>
<tr><td>Server to relay</td><td>RELAY-REPL</td><td>Dropped</td></tr>
</table>
<p>The role decides the behaviour:</p>
<ul>
<li><b>device-role client</b> (default): server messages arriving on the port are dropped.</li>
<li><b>device-role server</b>: server messages are allowed, optionally after the checks below. Use it on the port towards the real server or relay, directly or through the uplink.</li>
<li><b>trusted-port</b>: no checks at all.</li>
</ul>

<h3>Configuration from lab 2</h3>
<pre class="code"><span class="c">! SW1: user ports are client ports</span>
ipv6 dhcp guard policy DHCP-CLIENTS
 device-role client
!
interface range GigabitEthernet0/1 - 3
 ipv6 dhcp guard attach-policy DHCP-CLIENTS
!
<span class="c">! SW2: the port towards R1, which runs the DHCPv6 server</span>
ipv6 dhcp guard policy DHCP-SERVER
 device-role server
!
interface GigabitEthernet0/0
 ipv6 dhcp guard attach-policy DHCP-SERVER</pre>
<p>Like RA guard, the policy can be attached per VLAN (<code>vlan configuration 20</code>, then <code>ipv6 dhcp guard attach-policy DHCP-CLIENTS</code>) or per interface with a VLAN list.</p>

<h3>Extra checks on server-role ports</h3>
<pre class="code">ipv6 access-list DHCP-SERVERS
 permit ipv6 host FE80::1 any
 permit ipv6 host 2001:DB8:A20::1 any
ipv6 prefix-list LAN-V6-PFX seq 5 permit 2001:db8:a20::/64 le 128
!
ipv6 dhcp guard policy DHCP-SERVER-STRICT
 device-role server
 match server access-list DHCP-SERVERS   <span class="c">! only these server sources</span>
 match reply prefix-list LAN-V6-PFX      <span class="c">! only addresses from this prefix in REPLY</span>
 preference min 0
 preference max 250                      <span class="c">! drop ADVERTISE with preference above 250</span></pre>
<dl class="terms">
<dt>match server access-list</dt><dd>Only ADVERTISE/REPLY from the listed source addresses pass. Protects against a second, unexpected server behind the same trusted uplink.</dd>
<dt>match reply prefix-list</dt><dd>Addresses handed out in REPLY must fall inside the listed prefixes; a misconfigured server cannot give out a wrong range.</dd>
<dt>preference min / max</dt><dd>Checks the Preference option in ADVERTISE. Capping it below 255 means no server can force clients to pick it immediately.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="DHCPv6 guard lab 2">
<rect x="20" y="20" width="160" height="44" rx="8" fill="#bae6fd"/><text x="100" y="40" text-anchor="middle" class="svg-ink" font-size="13">R1 pool LAN-V6</text><text x="100" y="56" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:a20::/64</text>
<rect x="250" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">SW2</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 server role</text>
<line x1="180" y1="42" x2="250" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="110" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1-3 client role</text>
<line x1="320" y1="64" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="190" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="100" y="213" text-anchor="middle" class="svg-ink" font-size="12">PC1, PC2</text>
<rect x="450" y="190" width="170" height="36" rx="8" fill="#fed7aa"/><text x="535" y="213" text-anchor="middle" class="svg-ink" font-size="12">ROGUE pool FREE-WIFI</text>
<line x1="290" y1="154" x2="100" y2="190" stroke="#64748b" stroke-width="2"/><line x1="350" y1="154" x2="535" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="420" y="176" class="svg-accent" font-size="12">ADVERTISE dropped at Gi0/3</text>
</svg><p class="cap">Lab 2: SOLICITs flood the VLAN, both servers answer, but only R1's ADVERTISE survives the trip to the PCs.</p></div>

<h3>Verification</h3>
<pre class="out">SW1# show ipv6 dhcp guard policy DHCP-CLIENTS
Dhcp guard policy DHCP-CLIENTS configuration: 
  Device Role: dhcp client
Policy DHCP-CLIENTS is applied on the following targets: 
Target               Type  Policy               Feature        Target range
Gi0/1                PORT  DHCP-CLIENTS         DHCP Guard     vlan all
Gi0/2                PORT  DHCP-CLIENTS         DHCP Guard     vlan all
Gi0/3                PORT  DHCP-CLIENTS         DHCP Guard     vlan all
<span class="hl">  Messages dropped by this policy: 2 (Gi0/3: 2)</span>

R1# show ipv6 dhcp binding
Client: FE80::250:79FF:FE66:6801
  DUID: 00030001005079666801
  Username : unassigned
  IA NA: IA ID 0x00000001, T1 43200, T2 69120
<span class="hl">    Address: 2001:DB8:A20::5C1A:3E0F:9B2D:1</span>
            preferred lifetime 86400, valid lifetime 172800</pre>
<p>Confirm on the client side too: after <code>ip dhcp -6</code> the PC must show an address in 2001:db8:a20::/64 and DNS 2001:db8:a20::53. On a real network, compare the <b>server DUID</b> in a client's lease with your server's DUID; a rogue server has a different one.</p>

<h3>DHCPv6 relays and routed access</h3>
<p>When the DHCPv6 server is remote, a relay agent (<code>ipv6 dhcp relay destination 2001:db8:100::10</code> on the gateway interface) forwards SOLICITs in RELAY-FORW and receives RELAY-REPL. The relay then sends ADVERTISE and REPLY to the client from its own interface. On the access switch those server messages arrive from the direction of the gateway, so the <b>uplink towards the relay</b> is the server-role (or trusted) port. If the access switch itself is the Layer 3 gateway and relay, the server messages are generated locally and are not affected by the port policy.</p>

<div class="eg"><p><b>Worked example.</b> Before the fix, PC1 shows <code>GLOBAL SCOPE : 2001:db8:bad:20::...</code> and <code>DNS SERVER : 2001:db8:bad:20::53</code>. The rogue answered first. R1's pool has no DNS yet, so step one is to add <code>dns-server 2001:db8:a20::53</code> and <code>domain-name nwkings.lab</code>. Step two is DHCP-CLIENTS on SW1 Gi0/1 to 3 and DHCP-SERVER on SW2 Gi0/0. After <code>ip dhcp -6</code>, PC1 leases from R1 and the policy counts 2 drops on Gi0/3: the rogue ADVERTISEs.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting that DHCPv6 guard does nothing for the gateway. The rogue box in lab 2 could still send RAs. A complete edge policy set includes RA guard as well, which is why the rollout chapter always pairs them.</p></div>

<div class="exam"><p><b>Exam trap.</b> The default DHCPv6 guard role is <b>client</b>. On a client port, SOLICIT and REQUEST are allowed; ADVERTISE, REPLY and RECONFIGURE are dropped. A distractor might claim DHCPv6 guard "rate-limits SOLICIT"; it does not.</p></div>

<div class="scn"><h4>The relay behind the wrong role</h4><p>After DHCPv6 guard was rolled out, one building could not get leases. Clients sent SOLICIT, and the relay on the core switch forwarded it, but no ADVERTISE reached the PCs. <code>show ipv6 dhcp guard policy</code> on the access switch showed drops on the uplink port Gi1/1/1, which had been put in the client policy by a range command. The engineer attached a server-role policy to Gi1/1/1 with <code>match server access-list</code> listing the core's SVI addresses, and leases returned.</p><p><b>Lesson:</b> with relays, the "server" is whatever device sends the ADVERTISE onto your VLAN, usually the gateway, reached through the uplink.</p></div>

<div class="iv"><p class="q">"How would you stop rogue DHCPv6 servers on an access switch, and how is it different from IPv4 DHCP snooping?"</p><p>Attach an <code>ipv6 dhcp guard</code> policy with <code>device-role client</code> to host ports and a server-role policy to the port towards the real server or relay, optionally with a server ACL, a reply prefix list and preference limits. Unlike IPv4 DHCP snooping it uses role policies rather than a global trust command, and it does not build the binding table on its own; SISF device-tracking does that, gleaning DHCPv6 and NDP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCPv6 guard drops server messages (ADVERTISE, REPLY, RECONFIGURE, RELAY-REPL) on client-role ports.</li>
<li>Default role is client; the port towards the server or relay gets device-role server or trusted-port.</li>
<li>Server-port checks: match server access-list, match reply prefix-list, preference min/max.</li>
<li>Verify with <code>show ipv6 dhcp guard policy</code> and the lease on the real server.</li>
<li>DHCPv6 guard never protects the default gateway; pair it with RA guard.</li>
</ul></div>
`,hi:`
<p>Hospital mein patient kisi bhi nurse se madad maang sakte hain, par dawai sirf pharmacy counter de sakta hai. Agar white coat pehne koi ajnabi corridor mein goliyan baantne lage, to security use rokti hai, isliye nahi ki usne sawaal puchha, balki isliye ki woh kuch aisa <b>de</b> raha hai jo sirf pharmacy de sakti hai. <b>DHCPv6 guard</b> yahi rule DHCPv6 par lagata hai: client ports par clients woh sab bhej sakte hain jo client bhejta hai, par jo message sirf server ya relay ko bhejna chahiye woh drop hota hai.</p>

<h3>Kya drop hota hai</h3>
<table class="cmp"><tr><th>Direction</th><th>Messages</th><th>Client-role port par</th></tr>
<tr><td>Client se server</td><td>SOLICIT, REQUEST, RENEW, REBIND, RELEASE, DECLINE, CONFIRM, INFORMATION-REQUEST</td><td>Allowed</td></tr>
<tr><td>Server se client</td><td><b>ADVERTISE, REPLY, RECONFIGURE</b></td><td><b>Drop</b></td></tr>
<tr><td>Server se relay</td><td>RELAY-REPL</td><td>Drop</td></tr>
</table>
<p>Role behaviour tay karta hai:</p>
<ul>
<li><b>device-role client</b> (default): port par aane wale server messages drop hote hain.</li>
<li><b>device-role server</b>: server messages allowed hain, optionally neeche ke checks ke baad. Ise asli server ya relay ki taraf wale port par use karo, seedha ya uplink ke through.</li>
<li><b>trusted-port</b>: koi check nahi.</li>
</ul>

<h3>Lab 2 ki configuration</h3>
<pre class="code"><span class="c">! SW1: user ports client ports hain</span>
ipv6 dhcp guard policy DHCP-CLIENTS
 device-role client
!
interface range GigabitEthernet0/1 - 3
 ipv6 dhcp guard attach-policy DHCP-CLIENTS
!
<span class="c">! SW2: R1 ki taraf wala port, jo DHCPv6 server chalata hai</span>
ipv6 dhcp guard policy DHCP-SERVER
 device-role server
!
interface GigabitEthernet0/0
 ipv6 dhcp guard attach-policy DHCP-SERVER</pre>
<p>RA guard ki tarah, policy per VLAN (<code>vlan configuration 20</code>, phir <code>ipv6 dhcp guard attach-policy DHCP-CLIENTS</code>) ya VLAN list ke saath per interface attach ho sakti hai.</p>

<h3>Server-role ports par extra checks</h3>
<pre class="code">ipv6 access-list DHCP-SERVERS
 permit ipv6 host FE80::1 any
 permit ipv6 host 2001:DB8:A20::1 any
ipv6 prefix-list LAN-V6-PFX seq 5 permit 2001:db8:a20::/64 le 128
!
ipv6 dhcp guard policy DHCP-SERVER-STRICT
 device-role server
 match server access-list DHCP-SERVERS   <span class="c">! sirf yeh server sources</span>
 match reply prefix-list LAN-V6-PFX      <span class="c">! REPLY mein sirf is prefix ke addresses</span>
 preference min 0
 preference max 250                      <span class="c">! 250 se upar preference wala ADVERTISE drop</span></pre>
<dl class="terms">
<dt>match server access-list</dt><dd>Sirf listed source addresses ke ADVERTISE/REPLY jaate hain. Same trusted uplink ke peeche doosre, unexpected server se bachata hai.</dd>
<dt>match reply prefix-list</dt><dd>REPLY mein diye gaye addresses listed prefixes ke andar hone chahiye; galat configure hua server galat range nahi de sakta.</dd>
<dt>preference min / max</dt><dd>ADVERTISE ka Preference option check karta hai. Ise 255 se neeche cap karne ka matlab koi server clients ko turant khud ko chunne par majboor nahi kar sakta.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="DHCPv6 guard lab 2">
<rect x="20" y="20" width="160" height="44" rx="8" fill="#bae6fd"/><text x="100" y="40" text-anchor="middle" class="svg-ink" font-size="13">R1 pool LAN-V6</text><text x="100" y="56" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:a20::/64</text>
<rect x="250" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">SW2</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 server role</text>
<line x1="180" y1="42" x2="250" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="110" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1-3 client role</text>
<line x1="320" y1="64" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="190" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="100" y="213" text-anchor="middle" class="svg-ink" font-size="12">PC1, PC2</text>
<rect x="450" y="190" width="170" height="36" rx="8" fill="#fed7aa"/><text x="535" y="213" text-anchor="middle" class="svg-ink" font-size="12">ROGUE pool FREE-WIFI</text>
<line x1="290" y1="154" x2="100" y2="190" stroke="#64748b" stroke-width="2"/><line x1="350" y1="154" x2="535" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="420" y="176" class="svg-accent" font-size="12">Gi0/3 par ADVERTISE drop</text>
</svg><p class="cap">Lab 2: SOLICITs VLAN mein flood hote hain, dono servers jawab dete hain, par sirf R1 ka ADVERTISE PCs tak pahunchta hai.</p></div>

<h3>Verification</h3>
<pre class="out">SW1# show ipv6 dhcp guard policy DHCP-CLIENTS
Dhcp guard policy DHCP-CLIENTS configuration: 
  Device Role: dhcp client
Policy DHCP-CLIENTS is applied on the following targets: 
Target               Type  Policy               Feature        Target range
Gi0/1                PORT  DHCP-CLIENTS         DHCP Guard     vlan all
Gi0/2                PORT  DHCP-CLIENTS         DHCP Guard     vlan all
Gi0/3                PORT  DHCP-CLIENTS         DHCP Guard     vlan all
<span class="hl">  Messages dropped by this policy: 2 (Gi0/3: 2)</span>

R1# show ipv6 dhcp binding
Client: FE80::250:79FF:FE66:6801
  DUID: 00030001005079666801
  Username : unassigned
  IA NA: IA ID 0x00000001, T1 43200, T2 69120
<span class="hl">    Address: 2001:DB8:A20::5C1A:3E0F:9B2D:1</span>
            preferred lifetime 86400, valid lifetime 172800</pre>
<p>Client side par bhi confirm karo: <code>ip dhcp -6</code> ke baad PC mein 2001:db8:a20::/64 ka address aur DNS 2001:db8:a20::53 dikhna chahiye. Asli network par client ki lease ka <b>server DUID</b> apne server ke DUID se compare karo; rogue server ka DUID alag hota hai.</p>

<h3>DHCPv6 relays aur routed access</h3>
<p>Jab DHCPv6 server door ho, relay agent (gateway interface par <code>ipv6 dhcp relay destination 2001:db8:100::10</code>) SOLICITs ko RELAY-FORW mein forward karta hai aur RELAY-REPL leta hai. Phir relay apne interface se client ko ADVERTISE aur REPLY bhejta hai. Access switch par yeh server messages gateway ki direction se aate hain, isliye <b>relay ki taraf wala uplink</b> server-role (ya trusted) port hai. Agar access switch khud Layer 3 gateway aur relay hai, to server messages locally bante hain aur port policy unpar asar nahi karti.</p>

<div class="eg"><p><b>Worked example.</b> Fix se pehle PC1 <code>GLOBAL SCOPE : 2001:db8:bad:20::...</code> aur <code>DNS SERVER : 2001:db8:bad:20::53</code> dikhata hai. Rogue ne pehle jawab diya. R1 ke pool mein abhi DNS nahi hai, isliye pehla step hai <code>dns-server 2001:db8:a20::53</code> aur <code>domain-name nwkings.lab</code> jodna. Doosra step hai SW1 Gi0/1 se 3 par DHCP-CLIENTS aur SW2 Gi0/0 par DHCP-SERVER. <code>ip dhcp -6</code> ke baad PC1 R1 se lease leta hai aur policy Gi0/3 par 2 drops ginti hai: rogue ke ADVERTISEs.</p></div>

<div class="warn"><p><b>Common galti.</b> Bhool jaana ki DHCPv6 guard gateway ke liye kuch nahi karta. Lab 2 ka rogue box ab bhi RAs bhej sakta tha. Poore edge policy set mein RA guard bhi hota hai, isiliye rollout chapter hamesha dono ko saath rakhta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default DHCPv6 guard role <b>client</b> hai. Client port par SOLICIT aur REQUEST allowed hain; ADVERTISE, REPLY aur RECONFIGURE drop hote hain. Distractor keh sakta hai ki DHCPv6 guard "SOLICIT ko rate-limit karta hai"; aisa nahi hai.</p></div>

<div class="scn"><h4>Galat role ke peeche relay</h4><p>DHCPv6 guard rollout ke baad ek building ko leases nahi mil rahi thi. Clients SOLICIT bhejte the, core switch ka relay use forward karta tha, par koi ADVERTISE PCs tak nahi pahunchta tha. Access switch par <code>show ipv6 dhcp guard policy</code> ne uplink port Gi1/1/1 par drops dikhaye, jo ek range command se client policy mein daal diya gaya tha. Engineer ne Gi1/1/1 par server-role policy attach ki, <code>match server access-list</code> mein core ke SVI addresses ke saath, aur leases wapas aa gayi.</p><p><b>Seekh:</b> relays ke saath "server" woh device hai jo aapke VLAN par ADVERTISE bhejta hai, aam taur par gateway, jo uplink ke through milta hai.</p></div>

<div class="iv"><p class="q">"Access switch par rogue DHCPv6 servers kaise rokoge, aur yeh IPv4 DHCP snooping se kaise alag hai?"</p><p>Host ports par <code>device-role client</code> wali <code>ipv6 dhcp guard</code> policy aur asli server ya relay ki taraf wale port par server-role policy attach karo, optionally server ACL, reply prefix list aur preference limits ke saath. IPv4 DHCP snooping se alag, yeh global trust command ke bajaye role policies use karta hai, aur khud binding table nahi banata; woh kaam SISF device-tracking karta hai, DHCPv6 aur NDP glean karke.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCPv6 guard client-role ports par server messages (ADVERTISE, REPLY, RECONFIGURE, RELAY-REPL) drop karta hai.</li>
<li>Default role client hai; server ya relay ki taraf wale port ko device-role server ya trusted-port milta hai.</li>
<li>Server-port checks: match server access-list, match reply prefix-list, preference min/max.</li>
<li><code>show ipv6 dhcp guard policy</code> aur asli server ki lease se verify karo.</li>
<li>DHCPv6 guard default gateway ko kabhi protect nahi karta; ise RA guard ke saath jodo.</li>
</ul></div>
`}};export{e as default};