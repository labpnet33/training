var e={id:`snooping`,h:{en:`DHCP snooping: trusted ports and the binding table`,hi:`DHCP snooping: trusted ports aur binding table`},body:{en:`
<p>Picture a school where new students go to the office to get their ID card and classroom number. One day a prankster stands in the corridor, stops every new student before they reach the office, and hands out fake ID cards with the wrong classroom. The students trust the first person who answers. <b>DHCP snooping</b> is the guard who makes sure that only the real office, reached through a known door, may hand out ID cards.</p>

<h3>Quick recap: why DHCP is easy to abuse</h3>
<p>A client with no address broadcasts a <b>Discover</b>. Every DHCP server in the VLAN may answer with an <b>Offer</b>. The client usually takes the <b>first</b> Offer, sends a <b>Request</b>, and the server confirms with an <b>Ack</b>. There is no authentication. A rogue server that is closer or faster than the real one wins, and its Offer can contain any gateway and DNS server it wants. That is the rogue DHCP attack. Its partner, <b>DHCP starvation</b>, floods Discovers from thousands of fake MACs until the real pool is empty, so legitimate clients get nothing.</p>

<h3>Trusted and untrusted ports</h3>
<p>DHCP snooping divides the switch ports in the snooped VLANs into two groups:</p>
<ul>
<li><b>Trusted</b> ports face the infrastructure: uplinks to distribution switches, and ports towards the real DHCP server or router. All DHCP messages are allowed.</li>
<li><b>Untrusted</b> ports are everything else, and this is the <b>default</b> for every port once snooping is on. On them the switch drops DHCP <b>server</b> messages: <b>DHCPOFFER, DHCPACK, DHCPNAK</b> (and lease-query replies).</li>
</ul>
<p>Clients on untrusted ports can still send Discover and Request, so normal users are not affected. The switch also runs sanity checks on client messages from untrusted ports: it drops a message whose Ethernet source MAC does not match the client hardware address inside the DHCP packet (the default <code>ip dhcp snooping verify mac-address</code>), and it drops a Release or Decline for a lease that the binding table shows on a different port.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="DHCP snooping trusted and untrusted ports">
<rect x="450" y="20" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">R1 real server</text>
<rect x="250" y="20" width="150" height="44" rx="8" fill="#bae6fd"/><text x="325" y="47" text-anchor="middle" class="svg-ink" font-size="13">SW2</text>
<line x1="400" y1="42" x2="450" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="120" width="150" height="44" rx="8" fill="#bae6fd"/><text x="325" y="147" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="325" y1="64" x2="325" y2="120" stroke="#64748b" stroke-width="2"/><text x="335" y="98" class="svg-accent" font-size="12">Gi0/0 trusted</text>
<rect x="60" y="205" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="135" y="232" text-anchor="middle" class="svg-ink" font-size="13">PC1 client</text>
<line x1="290" y1="164" x2="160" y2="205" stroke="#64748b" stroke-width="2"/><text x="150" y="190" class="svg-muted" font-size="12">Gi0/1 untrusted</text>
<rect x="430" y="205" width="170" height="44" rx="8" fill="#fed7aa"/><text x="515" y="232" text-anchor="middle" class="svg-ink" font-size="13">ROGUE server</text>
<line x1="360" y1="164" x2="480" y2="205" stroke="#64748b" stroke-width="2"/><text x="420" y="185" class="svg-muted" font-size="12">Gi0/5 untrusted</text>
<text x="515" y="196" text-anchor="middle" class="svg-accent" font-size="12">OFFER dropped</text>
</svg><p class="cap">Server messages are accepted only through the trusted uplink. The rogue's Offers die at Gi0/5.</p></div>

<h3>The binding table</h3>
<p>Every time a DHCPACK passes from a trusted port to a client on an untrusted port, the switch records a <b>binding</b>: client MAC, leased IP, lease time, VLAN and the untrusted interface. This table is the foundation for DAI and IP Source Guard later in the module. It answers the question "which IP is this MAC allowed to use, and on which port?"</p>

<div class="eg"><p><b>Worked example.</b> In the lab, users on SW1 VLAN 10 receive 172.31.66.x addresses from ROGUE, a router plugged into the meeting-room port Gi0/5. The real server is R1 (10.10.10.1, pool STAFF 10.10.10.0/24, addresses .1 to .99 excluded), reached through SW1's trunk Gi0/0 to SW2. Plan: enable snooping globally and for VLAN 10, trust Gi0/0 only, disable option 82 insertion (explained in the next chapter), rate-limit Gi0/1 and Gi0/5 to 10 packets per second. PC1 should then get 10.10.10.100, the first free address.</p></div>

<h3>Configuration walkthrough</h3>
<pre class="code">SW1(config)# ip dhcp snooping                         <span class="c">! global switch</span>
SW1(config)# ip dhcp snooping vlan 10                 <span class="c">! and per VLAN: both needed</span>
SW1(config)# no ip dhcp snooping information option   <span class="c">! next chapter</span>
SW1(config)# interface g0/0
SW1(config-if)# ip dhcp snooping trust                <span class="c">! uplink towards R1</span>
SW1(config-if)# exit
SW1(config)# interface range g0/1 , g0/5
SW1(config-if-range)# ip dhcp snooping limit rate 10  <span class="c">! anti-starvation</span>
SW1(config-if-range)# end</pre>
<p>Order matters in production. The moment snooping becomes active on a VLAN, every port is untrusted, including the uplink. If you have not yet trusted the uplink, the real server's Offers are dropped too and new clients get no address. Configure the trust first, or do it all in one change window.</p>

<h3>Verification</h3>
<pre class="out">SW1# show ip dhcp snooping
<span class="hl">Switch DHCP snooping is enabled</span>
DHCP snooping is configured on following VLANs:
10
<span class="hl">DHCP snooping is operational on following VLANs:
10</span>
Insertion of option 82 is disabled
Verification of hwaddr field is enabled
DHCP snooping trust/rate is configured on the following Interfaces:

Interface                  Trusted    Allow option    Rate limit (pps)
-----------------------    -------    ------------    ----------------
<span class="hl">GigabitEthernet0/0         yes        yes             unlimited</span>
GigabitEthernet0/1         no         no              10
GigabitEthernet0/5         no         no              10

SW1# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
<span class="hl">00:50:79:66:68:01   10.10.10.100     86397       dhcp-snooping   10    GigabitEthernet0/1</span>
Total number of bindings: 1

%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 5254.0031.6601</pre>
<p>Three things prove success: VLAN 10 is <b>operational</b> (not just configured), only Gi0/0 is trusted, and the binding shows PC1's MAC with a 10.10.10.x address on Gi0/1. The syslog proves the rogue Offer was dropped at the untrusted port.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Only <code>ip dhcp snooping vlan 10</code> without the global <code>ip dhcp snooping</code>, or the reverse; neither alone does anything. (2) Trusting user ports "to make it work", which lets rogue servers back in. (3) Forgetting that the binding table lives in RAM; after a reload it is empty until clients renew (the fix, a binding database, is in the next chapter).</p></div>

<div class="exam"><p><b>Exam trap.</b> Snooping drops server messages (OFFER, ACK, NAK) on untrusted ports; client messages (Discover, Request) are allowed. All ports are <b>untrusted by default</b>. The binding is built from the DHCPACK, and it contains MAC, IP, lease, type, VLAN and interface.</p></div>

<div class="scn"><h4>Starvation from a broken laptop</h4><p>A university lab reported that new laptops got no address every afternoon. <code>show ip dhcp pool</code> on the server showed the pool almost full, but most leases belonged to MACs nobody recognised. One student's laptop had a faulty driver that sent Discovers from random MACs. The engineer enabled DHCP snooping with <code>ip dhcp snooping limit rate 10</code> on the lab ports. The next afternoon the laptop's port went err-disabled with reason <code>dhcp-rate-limit</code>, the pool stayed healthy and the laptop was sent for repair.</p><p><b>Lesson:</b> the rate limit turns a pool-wide outage into a single disabled port with a clear reason.</p></div>

<div class="iv"><p class="q">"How does DHCP snooping stop a rogue DHCP server?"</p><p>Strong answer: once enabled globally and per VLAN, every port is untrusted by default and the switch drops DHCP server messages (Offer, Ack, Nak) arriving on untrusted ports. Only uplinks towards the real server are trusted. It also builds a binding table (MAC, IP, VLAN, port, lease) from the Acks, which DAI and IP Source Guard use later. Mention the rate limit against starvation and the risk of forgetting to trust the uplink.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP has no authentication; the first Offer usually wins, which makes rogue servers effective.</li>
<li>Enable snooping globally and per VLAN; all ports become untrusted by default.</li>
<li>Untrusted ports drop OFFER, ACK and NAK; trust only uplinks and ports towards real servers.</li>
<li>Every ACK creates a binding (MAC, IP, lease, VLAN, interface) used by DAI and IP Source Guard.</li>
<li>Verify with show ip dhcp snooping and show ip dhcp snooping binding.</li>
</ul></div>
`,hi:`
<p>Ek school socho jahan naye students apna ID card aur classroom number lene office jaate hain. Ek din ek shararti corridor mein khada ho jaata hai, har naye student ko office pahunchne se pehle rok leta hai, aur galat classroom wale fake ID cards baant deta hai. Students jo pehle jawab deta hai us par bharosa kar lete hain. <b>DHCP snooping</b> woh guard hai jo pakka karta hai ki sirf asli office, ek jaane-pehchane darwaze se, ID cards de sake.</p>

<h3>Quick recap: DHCP ko abuse karna aasaan kyun hai</h3>
<p>Bina address wala client ek <b>Discover</b> broadcast karta hai. VLAN ka har DHCP server <b>Offer</b> se jawab de sakta hai. Client aam taur par <b>pehla</b> Offer leta hai, <b>Request</b> bhejta hai, aur server <b>Ack</b> se confirm karta hai. Koi authentication nahi hai. Jo rogue server asli se paas ya tez hai woh jeet jaata hai, aur uske Offer mein koi bhi gateway aur DNS server ho sakta hai. Yahi rogue DHCP attack hai. Iska saathi, <b>DHCP starvation</b>, hazaaron fake MACs se Discovers flood karta hai jab tak asli pool khaali na ho jaaye, taaki legitimate clients ko kuch na mile.</p>

<h3>Trusted aur untrusted ports</h3>
<p>DHCP snooping snooped VLANs ke switch ports ko do groups mein baant-ta hai:</p>
<ul>
<li><b>Trusted</b> ports infrastructure ki taraf hote hain: distribution switches ke uplinks, aur asli DHCP server ya router ki taraf ke ports. Saare DHCP messages allowed hain.</li>
<li><b>Untrusted</b> ports baaki sab hain, aur snooping on hote hi har port ka yahi <b>default</b> hai. Un par switch DHCP <b>server</b> messages drop karta hai: <b>DHCPOFFER, DHCPACK, DHCPNAK</b> (aur lease-query replies).</li>
</ul>
<p>Untrusted ports par clients abhi bhi Discover aur Request bhej sakte hain, isliye normal users par asar nahi padta. Switch untrusted ports se aane wale client messages par sanity checks bhi chalata hai: woh aisa message drop karta hai jiska Ethernet source MAC DHCP packet ke andar ke client hardware address se match nahi karta (default <code>ip dhcp snooping verify mac-address</code>), aur aisi lease ka Release ya Decline drop karta hai jo binding table mein kisi aur port par dikhti hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="DHCP snooping trusted aur untrusted ports">
<rect x="450" y="20" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">R1 asli server</text>
<rect x="250" y="20" width="150" height="44" rx="8" fill="#bae6fd"/><text x="325" y="47" text-anchor="middle" class="svg-ink" font-size="13">SW2</text>
<line x1="400" y1="42" x2="450" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="120" width="150" height="44" rx="8" fill="#bae6fd"/><text x="325" y="147" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="325" y1="64" x2="325" y2="120" stroke="#64748b" stroke-width="2"/><text x="335" y="98" class="svg-accent" font-size="12">Gi0/0 trusted</text>
<rect x="60" y="205" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="135" y="232" text-anchor="middle" class="svg-ink" font-size="13">PC1 client</text>
<line x1="290" y1="164" x2="160" y2="205" stroke="#64748b" stroke-width="2"/><text x="150" y="190" class="svg-muted" font-size="12">Gi0/1 untrusted</text>
<rect x="430" y="205" width="170" height="44" rx="8" fill="#fed7aa"/><text x="515" y="232" text-anchor="middle" class="svg-ink" font-size="13">ROGUE server</text>
<line x1="360" y1="164" x2="480" y2="205" stroke="#64748b" stroke-width="2"/><text x="420" y="185" class="svg-muted" font-size="12">Gi0/5 untrusted</text>
<text x="515" y="196" text-anchor="middle" class="svg-accent" font-size="12">OFFER drop</text>
</svg><p class="cap">Server messages sirf trusted uplink se accept hote hain. Rogue ke Offers Gi0/5 par hi mar jaate hain.</p></div>

<h3>Binding table</h3>
<p>Har baar jab koi DHCPACK trusted port se untrusted port wale client tak jaata hai, switch ek <b>binding</b> record karta hai: client MAC, leased IP, lease time, VLAN aur untrusted interface. Yeh table is module mein aage DAI aur IP Source Guard ki neenv hai. Yeh sawaal ka jawab deti hai "yeh MAC kaunsa IP use kar sakta hai, aur kis port par?"</p>

<div class="eg"><p><b>Worked example.</b> Lab mein SW1 VLAN 10 ke users ko ROGUE se 172.31.66.x addresses milte hain, jo meeting-room port Gi0/5 mein laga router hai. Asli server R1 hai (10.10.10.1, pool STAFF 10.10.10.0/24, addresses .1 se .99 excluded), jo SW1 ke trunk Gi0/0 se SW2 ke through milta hai. Plan: snooping globally aur VLAN 10 ke liye enable karo, sirf Gi0/0 trust karo, option 82 insertion band karo (agle chapter mein samjhaya), Gi0/1 aur Gi0/5 ko 10 packets per second tak rate-limit karo. Uske baad PC1 ko 10.10.10.100 milna chahiye, pehla free address.</p></div>

<h3>Configuration walkthrough</h3>
<pre class="code">SW1(config)# ip dhcp snooping                         <span class="c">! global switch</span>
SW1(config)# ip dhcp snooping vlan 10                 <span class="c">! aur per VLAN: dono chahiye</span>
SW1(config)# no ip dhcp snooping information option   <span class="c">! agla chapter</span>
SW1(config)# interface g0/0
SW1(config-if)# ip dhcp snooping trust                <span class="c">! R1 ki taraf uplink</span>
SW1(config-if)# exit
SW1(config)# interface range g0/1 , g0/5
SW1(config-if-range)# ip dhcp snooping limit rate 10  <span class="c">! anti-starvation</span>
SW1(config-if-range)# end</pre>
<p>Production mein order matter karta hai. Jaise hi kisi VLAN par snooping active hota hai, har port untrusted ho jaata hai, uplink bhi. Agar aapne abhi tak uplink trust nahi kiya, to asli server ke Offers bhi drop hote hain aur naye clients ko address nahi milta. Pehle trust configure karo, ya sab ek hi change window mein karo.</p>

<h3>Verification</h3>
<pre class="out">SW1# show ip dhcp snooping
<span class="hl">Switch DHCP snooping is enabled</span>
DHCP snooping is configured on following VLANs:
10
<span class="hl">DHCP snooping is operational on following VLANs:
10</span>
Insertion of option 82 is disabled
Verification of hwaddr field is enabled
DHCP snooping trust/rate is configured on the following Interfaces:

Interface                  Trusted    Allow option    Rate limit (pps)
-----------------------    -------    ------------    ----------------
<span class="hl">GigabitEthernet0/0         yes        yes             unlimited</span>
GigabitEthernet0/1         no         no              10
GigabitEthernet0/5         no         no              10

SW1# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
<span class="hl">00:50:79:66:68:01   10.10.10.100     86397       dhcp-snooping   10    GigabitEthernet0/1</span>
Total number of bindings: 1

%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 5254.0031.6601</pre>
<p>Teen cheezein success prove karti hain: VLAN 10 <b>operational</b> hai (sirf configured nahi), sirf Gi0/0 trusted hai, aur binding PC1 ka MAC 10.10.10.x address ke saath Gi0/1 par dikhati hai. Syslog prove karta hai ki rogue Offer untrusted port par drop hua.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Global <code>ip dhcp snooping</code> ke bina sirf <code>ip dhcp snooping vlan 10</code>, ya ulta; akela koi bhi kuch nahi karta. (2) "Chalane ke liye" user ports ko trust karna, jisse rogue servers wapas aa jaate hain. (3) Bhoolna ki binding table RAM mein rehti hai; reload ke baad clients renew hone tak khaali rehti hai (fix, binding database, agle chapter mein hai).</p></div>

<div class="exam"><p><b>Exam trap.</b> Snooping untrusted ports par server messages (OFFER, ACK, NAK) drop karta hai; client messages (Discover, Request) allowed hain. Saare ports <b>default mein untrusted</b> hain. Binding DHCPACK se banti hai, aur usmein MAC, IP, lease, type, VLAN aur interface hota hai.</p></div>

<div class="scn"><h4>Kharaab laptop se starvation</h4><p>Ek university lab ne report kiya ki har dopahar naye laptops ko address nahi milta. Server par <code>show ip dhcp pool</code> ne pool lagbhag bhara hua dikhaya, lekin zyada tar leases aise MACs ki thi jinhe koi nahi pehchanta tha. Ek student ke laptop mein faulty driver tha jo random MACs se Discovers bhejta tha. Engineer ne lab ports par <code>ip dhcp snooping limit rate 10</code> ke saath DHCP snooping enable kiya. Agli dopahar us laptop ka port reason <code>dhcp-rate-limit</code> ke saath err-disabled ho gaya, pool healthy raha aur laptop repair ke liye bhej diya gaya.</p><p><b>Seekh:</b> rate limit poore pool ke outage ko ek disabled port mein badal deta hai jiska reason saaf hota hai.</p></div>

<div class="iv"><p class="q">"DHCP snooping rogue DHCP server ko kaise rokta hai?"</p><p>Strong answer: globally aur per VLAN enable hone par har port default mein untrusted hota hai aur switch untrusted ports par aane wale DHCP server messages (Offer, Ack, Nak) drop karta hai. Sirf asli server ki taraf ke uplinks trusted hote hain. Yeh Acks se ek binding table (MAC, IP, VLAN, port, lease) bhi banata hai, jo baad mein DAI aur IP Source Guard use karte hain. Starvation ke khilaaf rate limit aur uplink trust karna bhoolne ka risk bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP mein authentication nahi hai; pehla Offer aam taur par jeet-ta hai, isliye rogue servers asardaar hote hain.</li>
<li>Snooping globally aur per VLAN enable karo; saare ports default mein untrusted ho jaate hain.</li>
<li>Untrusted ports OFFER, ACK aur NAK drop karte hain; sirf uplinks aur asli servers ki taraf ke ports trust karo.</li>
<li>Har ACK ek binding (MAC, IP, lease, VLAN, interface) banata hai jo DAI aur IP Source Guard use karte hain.</li>
<li>show ip dhcp snooping aur show ip dhcp snooping binding se verify karo.</li>
</ul></div>
`}};export{e as default};