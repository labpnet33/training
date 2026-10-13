var e={id:`slaac-dhcpv6`,h:{en:`SLAAC vs DHCPv6, and why both are attack surfaces`,hi:`SLAAC vs DHCPv6, aur dono attack surface kyun hain`},body:{en:`
<p>A new employee can get a desk in two ways. In the first, the floor manager announces "this floor is Floor 5, pick any free desk and put your name on it" and people seat themselves. In the second, the employee goes to the front desk, which hands over a fixed desk number and a phone extension from a register. IPv6 offers both models: <b>SLAAC</b> (Stateless Address Autoconfiguration, RFC 4862), where the host builds its own address from the router's announcement, and <b>DHCPv6</b> (RFC 8415), where a server hands out addresses and options. In both cases the announcement, the RA, comes first and decides what the host does next.</p>

<h3>The Router Advertisement drives everything</h3>
<p>An RA contains a header and options. The fields that matter for addressing and for security are:</p>
<dl class="terms">
<dt>Router lifetime</dt><dd>How long (seconds, up to 9000) the sender may be used as a default router. <b>0 means "do not use me as default gateway"</b>, while the prefixes in the RA are still valid.</dd>
<dt>Cur Hop Limit</dt><dd>The hop limit hosts should put in the packets they originate (for example 64).</dd>
<dt>M flag (Managed address configuration)</dt><dd>1 = get addresses from stateful DHCPv6.</dd>
<dt>O flag (Other configuration)</dt><dd>1 = get other settings such as DNS from DHCPv6 (stateless DHCPv6).</dd>
<dt>Default router preference</dt><dd>High, medium or low (RFC 4191). With two routers, hosts prefer the higher one.</dd>
<dt>Prefix Information option</dt><dd>The prefix (normally a /64), its lifetimes and two flags: <b>L</b> (on-link) and <b>A</b> (autonomous, "you may build a SLAAC address from this prefix").</dd>
<dt>RDNSS option</dt><dd>DNS server addresses carried directly in the RA (RFC 8106), so SLAAC-only hosts can learn DNS without DHCPv6.</dd>
</dl>

<table class="cmp"><tr><th>RA says</th><th>Host gets its address from</th><th>Host gets DNS from</th><th>Default gateway from</th></tr>
<tr><td>A=1, M=0, O=0</td><td>SLAAC</td><td>RDNSS in the RA (if present)</td><td>RA</td></tr>
<tr><td>A=1, M=0, O=1</td><td>SLAAC</td><td>Stateless DHCPv6</td><td>RA</td></tr>
<tr><td>A=0, M=1</td><td>Stateful DHCPv6</td><td>DHCPv6</td><td>RA</td></tr>
</table>
<p>Notice the last column. <b>DHCPv6 has no default gateway option.</b> Whatever you do with DHCPv6, hosts still learn their gateway from an RA. That is why RA guard is required even in a fully DHCPv6-managed network.</p>

<h3>How DHCPv6 works</h3>
<p>Clients listen on <b>UDP 546</b>; servers and relay agents listen on <b>UDP 547</b>. A client does not know any server address, so it sends to the link-scope multicast <code>ff02::1:2</code> (All_DHCP_Relay_Agents_and_Servers). The four-message exchange:</p>
<ol>
<li><b>SOLICIT</b> (client, multicast): "Any server out there?"</li>
<li><b>ADVERTISE</b> (server): "I can serve you." It may include a <b>Preference</b> option (0 to 255). A client that receives preference 255 stops waiting and picks that server at once.</li>
<li><b>REQUEST</b> (client): "I choose you, please assign."</li>
<li><b>REPLY</b> (server): the address (IA_NA), lifetimes, DNS and domain options.</li>
</ol>
<p>Other messages: RENEW, REBIND, RELEASE, DECLINE and CONFIRM from clients; <b>RECONFIGURE</b> from servers; INFORMATION-REQUEST for stateless DHCPv6 (answered by REPLY); RELAY-FORW and RELAY-REPL between relay and server. With <b>rapid commit</b>, SOLICIT is answered directly with REPLY. Clients and servers are identified by a <b>DUID</b>.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DHCPv6 four messages">
<rect x="30" y="16" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="41" text-anchor="middle" class="svg-ink" font-size="13">Client :546</text>
<rect x="490" y="16" width="120" height="40" rx="8" fill="#bae6fd"/><text x="550" y="41" text-anchor="middle" class="svg-ink" font-size="13">Server :547</text>
<line x1="90" y1="56" x2="90" y2="240" stroke="#64748b" stroke-dasharray="4 4"/><line x1="550" y1="56" x2="550" y2="240" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="90" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">SOLICIT to ff02::1:2</text>
<line x1="550" y1="125" x2="90" y2="125" stroke="#64748b" stroke-width="2"/><text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">ADVERTISE (preference)</text>
<line x1="90" y1="165" x2="550" y2="165" stroke="#64748b" stroke-width="2"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">REQUEST</text>
<line x1="550" y1="205" x2="90" y2="205" stroke="#64748b" stroke-width="2"/><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">REPLY (address, DNS)</text>
</svg><p class="cap">Server-to-client messages (orange labels) are the ones a rogue server forges and DHCPv6 guard blocks on client ports.</p></div>

<h3>The IOS side, as used in the labs</h3>
<pre class="code"><span class="c">! R1 in lab 2: stateful DHCPv6 on the user VLAN</span>
ipv6 unicast-routing
ipv6 dhcp pool LAN-V6
 address prefix 2001:db8:a20::/64
 dns-server 2001:db8:a20::53
 domain-name nwkings.lab
interface GigabitEthernet0/0
 ipv6 address 2001:db8:a20::1/64
 ipv6 nd managed-config-flag
 ipv6 dhcp server LAN-V6
<span class="c">! Other RA knobs you should recognise</span>
<span class="c">! ipv6 nd other-config-flag      (O flag)</span>
<span class="c">! ipv6 nd router-preference High (RFC 4191 preference)</span>
<span class="c">! ipv6 nd ra lifetime 0          (not a default router)</span>
<span class="c">! ipv6 nd prefix 2001:db8:a20::/64 no-autoconfig   (A flag off)</span></pre>
<pre class="out">R1# show ipv6 interface GigabitEthernet0/0 | include Hosts|advertis
  ND router advertisements are sent every 200 seconds
  ND router advertisements live for 1800 seconds
  ND advertised default router preference is Medium
<span class="hl">  Hosts use DHCP to obtain routable addresses.</span></pre>

<h3>Why both models are attack surfaces</h3>
<ul>
<li><b>SLAAC trusts the RA completely.</b> Whoever sends an RA can add a prefix, become a default router, raise its preference to High, or send lifetime 0 in the name of the real router to remove it.</li>
<li><b>DHCPv6 trusts the first good ADVERTISE.</b> A rogue server that answers faster, or with preference 255, wins the client and can hand out its own DNS server.</li>
<li><b>The RA controls whether DHCPv6 is used at all.</b> A rogue RA with M=0 can push hosts away from your managed addressing; a rogue RA with O=1 can pull them towards a rogue DHCPv6 server for DNS.</li>
<li><b>No central record.</b> With SLAAC and privacy addresses there is no lease database, so the switch must build its own record by watching NDP. That record is the binding table (chapter 6).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> In lab 2, R1 answers a SOLICIT in about 1 ms with preference 0. The rogue "free Wi-Fi" box answers in 0.3 ms. The client takes the first acceptable ADVERTISE, so it leases 2001:db8:bad:20::/64 and DNS 2001:db8:bad:20::53. Had the rogue sent preference 255, it would have won even if it were slower. DHCPv6 guard removes the rogue ADVERTISE before the client ever sees it.</p></div>

<div class="warn"><p><b>Common mistake.</b> Setting <code>ipv6 nd managed-config-flag</code> and assuming hosts no longer need RAs. They still need an RA with a non-zero router lifetime for their default gateway. Suppressing RAs completely breaks off-link connectivity.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which DHCPv6 option provides the default gateway?" None. The gateway always comes from the RA. Also: client port 546, server port 547, and SOLICIT goes to <code>ff02::1:2</code>.</p></div>

<div class="scn"><h4>DNS hijack in a SLAAC network</h4><p>A campus used SLAAC with the O flag set and a stateless DHCPv6 server for DNS. Users in one building were sent to a phishing copy of the intranet. Addresses and gateways were correct. The engineer compared <code>ipconfig /all</code> on a victim with a healthy PC: the DNS server was 2001:db8:bad:20::53. A test cable into the same switch port showed ADVERTISE messages from a "travel router" that a visitor had left under a desk. DHCPv6 guard with <code>device-role client</code> on all access ports stopped it.</p><p><b>Lesson:</b> even with SLAAC for addresses, stateless DHCPv6 is a trust point; protect it.</p></div>

<div class="iv"><p class="q">"Explain the M and O flags and what a host does with them."</p><p>They live in the RA. M=1 tells the host to get its addresses from stateful DHCPv6; O=1 tells it to get other settings such as DNS from DHCPv6 while still building its address with SLAAC (if the prefix has the A flag). Add that the default gateway always comes from the RA, and that exact host behaviour varies a little by operating system.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The RA decides the addressing model: A flag for SLAAC, M for stateful DHCPv6, O for stateless DHCPv6.</li>
<li>Router lifetime 0 means "not a default router"; preference High/Medium/Low picks between routers.</li>
<li>DHCPv6: client UDP 546, server UDP 547, SOLICIT to ff02::1:2, then ADVERTISE, REQUEST, REPLY.</li>
<li>DHCPv6 never gives a default gateway, so RA protection is always needed.</li>
<li>A rogue RA or a rogue ADVERTISE (especially preference 255) can take over hosts; FHS blocks both at the port.</li>
</ul></div>
`,hi:`
<p>Naye employee ko desk do tarah se mil sakti hai. Pehle tarike mein floor manager announce karta hai "yeh Floor 5 hai, koi bhi khaali desk lo aur us par apna naam lagao" aur log khud baith jaate hain. Doosre tarike mein employee front desk par jaata hai, jo register se ek fixed desk number aur phone extension de deta hai. IPv6 dono models deta hai: <b>SLAAC</b> (Stateless Address Autoconfiguration, RFC 4862), jisme host router ke announcement se apna address khud banata hai, aur <b>DHCPv6</b> (RFC 8415), jisme server addresses aur options deta hai. Dono cases mein announcement, yaani RA, pehle aata hai aur tay karta hai ki host aage kya karega.</p>

<h3>Router Advertisement hi sab kuch chalata hai</h3>
<p>RA mein ek header aur options hote hain. Addressing aur security ke liye jo fields matter karte hain:</p>
<dl class="terms">
<dt>Router lifetime</dt><dd>Sender ko kitni der (seconds, 9000 tak) default router ki tarah use kiya ja sakta hai. <b>0 ka matlab "mujhe default gateway mat banao"</b>, jabki RA ke prefixes abhi bhi valid rehte hain.</dd>
<dt>Cur Hop Limit</dt><dd>Hosts apne banaye packets mein kaunsa hop limit daalein (jaise 64).</dd>
<dt>M flag (Managed address configuration)</dt><dd>1 = addresses stateful DHCPv6 se lo.</dd>
<dt>O flag (Other configuration)</dt><dd>1 = DNS jaisi baaki settings DHCPv6 se lo (stateless DHCPv6).</dd>
<dt>Default router preference</dt><dd>High, medium ya low (RFC 4191). Do routers hon to hosts oonche wale ko prefer karte hain.</dd>
<dt>Prefix Information option</dt><dd>Prefix (normally /64), uske lifetimes aur do flags: <b>L</b> (on-link) aur <b>A</b> (autonomous, "is prefix se SLAAC address bana sakte ho").</dd>
<dt>RDNSS option</dt><dd>DNS server addresses seedhe RA mein (RFC 8106), taaki SLAAC-only hosts bina DHCPv6 ke DNS seekh sakein.</dd>
</dl>

<table class="cmp"><tr><th>RA kehta hai</th><th>Host address kahan se leta hai</th><th>Host DNS kahan se leta hai</th><th>Default gateway kahan se</th></tr>
<tr><td>A=1, M=0, O=0</td><td>SLAAC</td><td>RA ka RDNSS (agar ho)</td><td>RA</td></tr>
<tr><td>A=1, M=0, O=1</td><td>SLAAC</td><td>Stateless DHCPv6</td><td>RA</td></tr>
<tr><td>A=0, M=1</td><td>Stateful DHCPv6</td><td>DHCPv6</td><td>RA</td></tr>
</table>
<p>Aakhri column dekho. <b>DHCPv6 mein koi default gateway option nahi hai.</b> DHCPv6 ke saath aap kuch bhi karo, hosts gateway RA se hi seekhte hain. Isiliye poori tarah DHCPv6-managed network mein bhi RA guard zaroori hai.</p>

<h3>DHCPv6 kaise kaam karta hai</h3>
<p>Clients <b>UDP 546</b> par sunte hain; servers aur relay agents <b>UDP 547</b> par. Client ko kisi server ka address nahi pata, isliye woh link-scope multicast <code>ff02::1:2</code> (All_DHCP_Relay_Agents_and_Servers) par bhejta hai. Chaar-message exchange:</p>
<ol>
<li><b>SOLICIT</b> (client, multicast): "Koi server hai?"</li>
<li><b>ADVERTISE</b> (server): "Main aapko serve kar sakta hoon." Isme <b>Preference</b> option (0 se 255) ho sakta hai. Jis client ko preference 255 milta hai, woh intezaar band karke turant woh server chun leta hai.</li>
<li><b>REQUEST</b> (client): "Main aapko chunta hoon, assign karo."</li>
<li><b>REPLY</b> (server): address (IA_NA), lifetimes, DNS aur domain options.</li>
</ol>
<p>Baaki messages: clients se RENEW, REBIND, RELEASE, DECLINE aur CONFIRM; servers se <b>RECONFIGURE</b>; stateless DHCPv6 ke liye INFORMATION-REQUEST (jawab REPLY se); relay aur server ke beech RELAY-FORW aur RELAY-REPL. <b>Rapid commit</b> mein SOLICIT ka jawab seedha REPLY se aata hai. Clients aur servers ko <b>DUID</b> se pehchana jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DHCPv6 ke chaar messages">
<rect x="30" y="16" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="41" text-anchor="middle" class="svg-ink" font-size="13">Client :546</text>
<rect x="490" y="16" width="120" height="40" rx="8" fill="#bae6fd"/><text x="550" y="41" text-anchor="middle" class="svg-ink" font-size="13">Server :547</text>
<line x1="90" y1="56" x2="90" y2="240" stroke="#64748b" stroke-dasharray="4 4"/><line x1="550" y1="56" x2="550" y2="240" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="90" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">SOLICIT ff02::1:2 ko</text>
<line x1="550" y1="125" x2="90" y2="125" stroke="#64748b" stroke-width="2"/><text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">ADVERTISE (preference)</text>
<line x1="90" y1="165" x2="550" y2="165" stroke="#64748b" stroke-width="2"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">REQUEST</text>
<line x1="550" y1="205" x2="90" y2="205" stroke="#64748b" stroke-width="2"/><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">REPLY (address, DNS)</text>
</svg><p class="cap">Server-se-client messages (orange labels) hi woh hain jo rogue server forge karta hai aur DHCPv6 guard client ports par block karta hai.</p></div>

<h3>IOS side, jaisa labs mein use hota hai</h3>
<pre class="code"><span class="c">! Lab 2 ka R1: user VLAN par stateful DHCPv6</span>
ipv6 unicast-routing
ipv6 dhcp pool LAN-V6
 address prefix 2001:db8:a20::/64
 dns-server 2001:db8:a20::53
 domain-name nwkings.lab
interface GigabitEthernet0/0
 ipv6 address 2001:db8:a20::1/64
 ipv6 nd managed-config-flag
 ipv6 dhcp server LAN-V6
<span class="c">! Baaki RA knobs jo aapko pehchanne chahiye</span>
<span class="c">! ipv6 nd other-config-flag      (O flag)</span>
<span class="c">! ipv6 nd router-preference High (RFC 4191 preference)</span>
<span class="c">! ipv6 nd ra lifetime 0          (default router nahi)</span>
<span class="c">! ipv6 nd prefix 2001:db8:a20::/64 no-autoconfig   (A flag off)</span></pre>
<pre class="out">R1# show ipv6 interface GigabitEthernet0/0 | include Hosts|advertis
  ND router advertisements are sent every 200 seconds
  ND router advertisements live for 1800 seconds
  ND advertised default router preference is Medium
<span class="hl">  Hosts use DHCP to obtain routable addresses.</span></pre>

<h3>Dono models attack surface kyun hain</h3>
<ul>
<li><b>SLAAC RA par poora bharosa karta hai.</b> Jo bhi RA bhejta hai woh prefix jod sakta hai, default router ban sakta hai, apni preference High kar sakta hai, ya asli router ke naam par lifetime 0 bhej kar use hata sakta hai.</li>
<li><b>DHCPv6 pehle achhe ADVERTISE par bharosa karta hai.</b> Jo rogue server tez jawab de, ya preference 255 ke saath, woh client jeet leta hai aur apna DNS server de sakta hai.</li>
<li><b>RA hi tay karta hai ki DHCPv6 use hoga ya nahi.</b> M=0 wala rogue RA hosts ko aapki managed addressing se door dhakel sakta hai; O=1 wala rogue RA unhe DNS ke liye rogue DHCPv6 server ki taraf kheench sakta hai.</li>
<li><b>Koi central record nahi.</b> SLAAC aur privacy addresses ke saath koi lease database nahi hota, isliye switch ko NDP dekh kar apna record khud banana padta hai. Woh record binding table hai (chapter 6).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab 2 mein R1 SOLICIT ka jawab lagbhag 1 ms mein preference 0 ke saath deta hai. Rogue "free Wi-Fi" box 0.3 ms mein jawab deta hai. Client pehla acceptable ADVERTISE leta hai, isliye woh 2001:db8:bad:20::/64 aur DNS 2001:db8:bad:20::53 lease kar leta hai. Agar rogue preference 255 bhejta, to dheema hone par bhi jeet jaata. DHCPv6 guard rogue ADVERTISE ko client tak pahunchne se pehle hi hata deta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>ipv6 nd managed-config-flag</code> set karke maan lena ki ab hosts ko RAs nahi chahiye. Default gateway ke liye unhe ab bhi non-zero router lifetime wala RA chahiye. RAs poori tarah suppress karne se off-link connectivity toot jaati hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa DHCPv6 option default gateway deta hai?" Koi nahi. Gateway hamesha RA se aata hai. Aur: client port 546, server port 547, aur SOLICIT <code>ff02::1:2</code> par jaata hai.</p></div>

<div class="scn"><h4>SLAAC network mein DNS hijack</h4><p>Ek campus O flag set karke SLAAC aur DNS ke liye stateless DHCPv6 server use karta tha. Ek building ke users intranet ki phishing copy par bheje ja rahe the. Addresses aur gateways sahi the. Engineer ne victim par <code>ipconfig /all</code> ko ek healthy PC se compare kiya: DNS server 2001:db8:bad:20::53 tha. Usi switch port mein test cable lagane par ek "travel router" ke ADVERTISE messages dikhe jo ek visitor desk ke neeche chhod gaya tha. Saare access ports par <code>device-role client</code> wale DHCPv6 guard ne ise rok diya.</p><p><b>Seekh:</b> addresses ke liye SLAAC ho tab bhi stateless DHCPv6 ek trust point hai; use bachao.</p></div>

<div class="iv"><p class="q">"M aur O flags samjhao aur host unke saath kya karta hai."</p><p>Yeh RA mein hote hain. M=1 host ko batata hai ki addresses stateful DHCPv6 se le; O=1 batata hai ki DNS jaisi baaki settings DHCPv6 se le, jabki address SLAAC se hi banaye (agar prefix par A flag ho). Jodo ki default gateway hamesha RA se aata hai, aur exact host behaviour operating system ke hisaab se thoda alag hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RA addressing model tay karta hai: SLAAC ke liye A flag, stateful DHCPv6 ke liye M, stateless DHCPv6 ke liye O.</li>
<li>Router lifetime 0 = "default router nahi"; preference High/Medium/Low routers mein se chunti hai.</li>
<li>DHCPv6: client UDP 546, server UDP 547, SOLICIT ff02::1:2 ko, phir ADVERTISE, REQUEST, REPLY.</li>
<li>DHCPv6 kabhi default gateway nahi deta, isliye RA protection hamesha chahiye.</li>
<li>Rogue RA ya rogue ADVERTISE (khaaskar preference 255) hosts par kabza kar sakta hai; FHS dono ko port par block karta hai.</li>
</ul></div>
`}};export{e as default};