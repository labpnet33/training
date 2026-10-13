var e={id:`vpn0-underlay`,h:{en:`VPN 0, VPN 512 and the underlay: building the day-0 configuration`,hi:`VPN 0, VPN 512 aur underlay: day-0 configuration banana`},body:{en:`
<p>Picture the head office campus of Bharat Retail. Outside there is a public road that connects the campus to the city. Inside there are corridors that connect departments. And at the back there is a small service door used only by the maintenance staff. In SD-WAN the public road is <b>VPN 0</b> (the transport), the corridors are the <b>service VPNs</b> (the user networks) and the service door is <b>VPN 512</b> (out-of-band management).</p>

<h3>VPN 0: the transport VPN</h3>
<p><b>VPN 0</b> is the VPN that faces the WAN. Its interfaces connect to the internet, MPLS or LTE circuits. The control connections to the Validator, Manager and Controller run in VPN 0, and so do the IPsec tunnels to other edges. It cannot carry user traffic. On an IOS XE edge, VPN 0 is simply the <b>global routing table</b>, so the interface IP addresses and the default route are the same IOS commands you already know.</p>
<h3>VPN 512: the management VPN</h3>
<p><b>VPN 512</b> is reserved for out-of-band management. On an IOS XE edge it maps to the <code>Mgmt-intf</code> VRF and normally uses the dedicated management port (GigabitEthernet0 on many platforms). Its routes are never advertised into OMP, so management addresses never become visible to other sites. <b>Service VPNs</b> are every other VPN number (1 to 511 and 513 and above, up to 65530). In the Bharat Retail lab the LAN is VPN 10, which is <code>vrf definition 10</code>.</p>
<table class="cmp"><tr><th>VPN</th><th>Role</th><th>Learned by OMP?</th></tr>
<tr><td>0</td><td>Transport: WAN circuits, control and data tunnels</td><td>No (it is the underlay)</td></tr>
<tr><td>512</td><td>Out-of-band management</td><td>No</td></tr>
<tr><td>1 to 511, 513 and up</td><td>Service VPNs: user LANs, servers, guests</td><td>Yes</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VPNs on a WAN edge">
<rect x="180" y="10" width="280" height="210" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1 (IOS XE edge)</text>
<rect x="195" y="45" width="250" height="40" rx="6" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">VPN 0 (global): Gi1, Gi2, tunnels</text>
<rect x="195" y="95" width="250" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">VPN 10 (vrf 10): Gi3 LAN 10.1.10.1</text>
<rect x="195" y="145" width="250" height="40" rx="6" fill="#fde68a"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">VPN 512 (Mgmt-intf): Gi0</text>
<text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">VPN 10 prefixes go into OMP</text>
<text x="90" y="70" text-anchor="middle" class="svg-ink" font-size="12">Internet 203.0.113.6</text><text x="90" y="88" text-anchor="middle" class="svg-ink" font-size="12">MPLS 172.16.1.2</text>
<text x="550" y="120" text-anchor="middle" class="svg-ink" font-size="12">LAN 10.1.10.0/24</text><text x="550" y="170" text-anchor="middle" class="svg-ink" font-size="12">NOC network</text>
<line x1="150" y1="65" x2="195" y2="65" stroke="#64748b" stroke-width="2"/><line x1="445" y1="115" x2="495" y2="115" stroke="#64748b" stroke-width="2"/><line x1="445" y1="165" x2="495" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three kinds of VPN on one edge. Only VPN 0 faces the WAN.</p></div>

<h3>Underlay addressing: static or dynamic</h3>
<p>The <b>underlay</b> is the ordinary IP network under the overlay. An edge needs an IP address on each WAN interface and a route to the Controllers. There are three common ways:</p>
<ul>
<li><b>Static</b> address and default route. Typical at data centers, hubs and cloud routers where the provider gives a fixed address. Example: <code>ip address 203.0.113.6 255.255.255.252</code> with <code>ip route 0.0.0.0 0.0.0.0 203.0.113.5</code>.</li>
<li><b>DHCP</b> from the ISP. Typical at small branches and with broadband or LTE. The interface uses <code>ip address dhcp</code> and the DHCP default-router option installs the default route automatically.</li>
<li><b>Routing protocol or PPPoE.</b> A BGP or OSPF session with an MPLS provider, or PPPoE on DSL. The result is the same: a working path to 198.51.100.0/24.</li>
</ul>
<p>If the Validator is given as a name instead of an IP, the edge also needs a DNS server in VPN 0 so it can resolve it. In the lab the Validator is an IP address, so DNS is not needed.</p>

<h3>The day-0 configuration of E-DEL-1</h3>
<p>This is the minimum an edge needs to start. Read it top to bottom: identity, underlay, tunnel interfaces, SD-WAN transport settings, then the service LAN.</p>
<pre class="code"><span class="c">! Enter the SD-WAN configuration mode on an IOS XE edge</span>
E-DEL-1# config-transaction
E-DEL-1(config)# hostname E-DEL-1
<span class="c">! 1. Identity: who am I, which site, which overlay, who is the Validator</span>
E-DEL-1(config)# system
E-DEL-1(config-system)# system-ip 10.255.0.11
E-DEL-1(config-system)# site-id 100
E-DEL-1(config-system)# organization-name BHARAT-RETAIL
E-DEL-1(config-system)# vbond 198.51.100.30
E-DEL-1(config-system)# exit
<span class="c">! 2. Underlay: two WAN circuits in VPN 0 (global table)</span>
E-DEL-1(config)# interface GigabitEthernet1
E-DEL-1(config-if)# ip address 203.0.113.6 255.255.255.252
E-DEL-1(config-if)# no shutdown
E-DEL-1(config-if)# interface GigabitEthernet2
E-DEL-1(config-if)# ip address 172.16.1.2 255.255.255.252
E-DEL-1(config-if)# no shutdown
E-DEL-1(config-if)# exit
E-DEL-1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.5
<span class="c">! 3. Tunnel interfaces bound to each WAN interface</span>
E-DEL-1(config)# interface Tunnel1
E-DEL-1(config-if)# ip unnumbered GigabitEthernet1
E-DEL-1(config-if)# tunnel source GigabitEthernet1
E-DEL-1(config-if)# tunnel mode sdwan
E-DEL-1(config-if)# exit
<span class="c">! 4. SD-WAN transport settings: color and encapsulation</span>
E-DEL-1(config)# sdwan
E-DEL-1(config-sdwan)# interface GigabitEthernet1
E-DEL-1(config-interface-GigabitEthernet1)# tunnel-interface
E-DEL-1(config-tunnel-interface)# encapsulation ipsec
E-DEL-1(config-tunnel-interface)# color biz-internet
E-DEL-1(config-tunnel-interface)# commit</pre>
<p>The commit step applies the transaction. The <b>system</b> block is the four items from the previous chapter: system IP, site ID, organization name and Validator. A second tunnel (Tunnel2 on GigabitEthernet2 with color <code>mpls</code>) follows the same pattern, which we study in the TLOC chapter.</p>
<p>The management port, if you use it, goes into the management VRF:</p>
<pre class="code">interface GigabitEthernet0
 vrf forwarding Mgmt-intf
 ip address 192.0.2.11 255.255.255.0
 no shutdown</pre>

<h3>Verify the underlay before blaming SD-WAN</h3>
<p>Most failed onboardings are plain IP problems. From the edge, check the interface, the route and reachability to the Validator in the global table:</p>
<pre class="out">E-DEL-1# show ip interface brief | include Gigabit
GigabitEthernet1   203.0.113.6    YES manual up    up
GigabitEthernet2   172.16.1.2     YES manual up    up

E-DEL-1# ping 198.51.100.30
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 198.51.100.30, timeout is 2 seconds:
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5)

E-DEL-1# show sdwan control connections
PEER    PEER PEER    SITE DOMAIN PEER          ...  LOCAL COLOR  PROXY STATE UPTIME
TYPE    PROT SYSTEM IP ID   ID     PRIVATE IP
vsmart  dtls 10.255.255.2 1   1     198.51.100.20 ...  biz-internet No    <span class="hl">up</span>    0:00:03:21
vmanage dtls 10.255.255.1 1   0     198.51.100.10 ...  biz-internet No    <span class="hl">up</span>    0:00:03:22</pre>

<div class="warn"><p><b>Common mistakes.</b> No default route in VPN 0; putting the LAN interface in the global table instead of a service VRF; typing the Validator address wrongly; setting two default routes without understanding that both are used; and forgetting that a firewall or ACL in front of the edge must allow UDP 12346 and ICMP to the Controllers.</p></div>
<div class="exam"><p><b>Exam trap.</b> VPN 0 and VPN 512 are special. VPN 0 carries only transport traffic; VPN 512 is not advertised into OMP. User traffic always lives in service VPNs.</p></div>

<div class="scn"><h4>Mumbai edge stuck at "connect"</h4><p>E-MUM-1 was configured with the right system IP, site ID, organization name and Validator, but <code>show sdwan control connections</code> was empty. The engineer pinged 198.51.100.30 from the router and it failed. The underlay interface was up, but the default route pointed to the old ISP gateway 203.0.113.1 instead of 203.0.113.9. After he fixed the route, ping worked and the control connections came up within seconds.</p><p><b>Lesson:</b> prove the underlay with ping first. SD-WAN cannot fix a missing route.</p></div>

<div class="iv"><p class="q">"What is the difference between VPN 0 and VPN 512, and which VPN carries user traffic?"</p><p>Strong answer: VPN 0 is the transport VPN. It holds WAN interfaces and builds the control and data tunnels. VPN 512 is out-of-band management and is never advertised into OMP. User traffic is carried in service VPNs, for example VPN 10. On IOS XE VPN 0 is the global table and 512 is Mgmt-intf.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN 0 is transport, VPN 512 is management, every other VPN is a service VPN.</li>
<li>On IOS XE edges VPN 0 is the global table; VPN 512 is the <code>Mgmt-intf</code> VRF.</li>
<li>Underlay addressing can be static, DHCP or learned by routing; DNS is needed only for hostnames.</li>
<li>Day-0 has four parts: system identity, underlay, tunnel interface, SD-WAN transport settings.</li>
<li>Test the underlay with ping to the Validator before debugging SD-WAN.</li>
</ul></div>
`,hi:`
<p>Bharat Retail ke head office campus ki kalpana karo. Bahar ek public road hai jo campus ko shehar se jodti hai. Andar corridors hain jo departments ko jodte hain. Aur peeche ek chhota service door hai jo sirf maintenance staff use karta hai. SD-WAN mein public road <b>VPN 0</b> (transport) hai, corridors <b>service VPNs</b> (user networks) hain aur service door <b>VPN 512</b> (out-of-band management) hai.</p>

<h3>VPN 0: transport VPN</h3>
<p><b>VPN 0</b> woh VPN hai jo WAN ki taraf dekhta hai. Uske interfaces internet, MPLS ya LTE circuits se jude hote hain. Validator, Manager aur Controller ke control connections VPN 0 mein chalte hain, aur doosre edges ke IPsec tunnels bhi. Yeh user traffic nahi le ja sakta. IOS XE edge par VPN 0 simply <b>global routing table</b> hai, isliye interface IP addresses aur default route wahi IOS commands hain jo aap pehle se jaante ho.</p>
<h3>VPN 512: management VPN</h3>
<p><b>VPN 512</b> out-of-band management ke liye reserved hai. IOS XE edge par yeh <code>Mgmt-intf</code> VRF se map hota hai aur aam taur par dedicated management port use karta hai (kai platforms par GigabitEthernet0). Iske routes kabhi OMP mein advertise nahi hote, isliye management addresses doosri sites ko dikhte hi nahi. <b>Service VPNs</b> baaki saare VPN numbers hain (1 se 511 aur 513 se upar, 65530 tak). Bharat Retail lab mein LAN VPN 10 hai, yaani <code>vrf definition 10</code>.</p>
<table class="cmp"><tr><th>VPN</th><th>Role</th><th>OMP seekhta hai?</th></tr>
<tr><td>0</td><td>Transport: WAN circuits, control aur data tunnels</td><td>Nahi (yeh underlay hai)</td></tr>
<tr><td>512</td><td>Out-of-band management</td><td>Nahi</td></tr>
<tr><td>1 se 511, 513 aur upar</td><td>Service VPNs: user LANs, servers, guests</td><td>Haan</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="WAN edge par VPNs">
<rect x="180" y="10" width="280" height="210" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1 (IOS XE edge)</text>
<rect x="195" y="45" width="250" height="40" rx="6" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">VPN 0 (global): Gi1, Gi2, tunnels</text>
<rect x="195" y="95" width="250" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">VPN 10 (vrf 10): Gi3 LAN 10.1.10.1</text>
<rect x="195" y="145" width="250" height="40" rx="6" fill="#fde68a"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">VPN 512 (Mgmt-intf): Gi0</text>
<text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">VPN 10 ke prefixes OMP mein jaate hain</text>
<text x="90" y="70" text-anchor="middle" class="svg-ink" font-size="12">Internet 203.0.113.6</text><text x="90" y="88" text-anchor="middle" class="svg-ink" font-size="12">MPLS 172.16.1.2</text>
<text x="550" y="120" text-anchor="middle" class="svg-ink" font-size="12">LAN 10.1.10.0/24</text><text x="550" y="170" text-anchor="middle" class="svg-ink" font-size="12">NOC network</text>
<line x1="150" y1="65" x2="195" y2="65" stroke="#64748b" stroke-width="2"/><line x1="445" y1="115" x2="495" y2="115" stroke="#64748b" stroke-width="2"/><line x1="445" y1="165" x2="495" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek edge par teen tarah ke VPN. Sirf VPN 0 WAN ki taraf dekhta hai.</p></div>

<h3>Underlay addressing: static ya dynamic</h3>
<p><b>Underlay</b> overlay ke neeche ka aam IP network hai. Edge ko har WAN interface par IP address aur Controllers tak route chahiye. Teen common tareeke hain:</p>
<ul>
<li><b>Static</b> address aur default route. Data centers, hubs aur cloud routers mein typical, jahan provider fixed address deta hai. Example: <code>ip address 203.0.113.6 255.255.255.252</code> aur <code>ip route 0.0.0.0 0.0.0.0 203.0.113.5</code>.</li>
<li>ISP se <b>DHCP</b>. Chhote branches aur broadband ya LTE ke saath typical. Interface <code>ip address dhcp</code> use karta hai aur DHCP default-router option default route khud install kar deta hai.</li>
<li><b>Routing protocol ya PPPoE.</b> MPLS provider ke saath BGP ya OSPF session, ya DSL par PPPoE. Natija same hai: 198.51.100.0/24 tak working path.</li>
</ul>
<p>Agar Validator IP ki jagah name se diya gaya hai, to edge ko VPN 0 mein DNS server bhi chahiye taaki woh use resolve kar sake. Lab mein Validator IP address hai, isliye DNS ki zaroorat nahi.</p>

<h3>E-DEL-1 ki day-0 configuration</h3>
<p>Yeh woh minimum hai jo edge ko shuru karne ke liye chahiye. Upar se neeche padho: identity, underlay, tunnel interfaces, SD-WAN transport settings, phir service LAN.</p>
<pre class="code"><span class="c">! IOS XE edge par SD-WAN configuration mode mein jao</span>
E-DEL-1# config-transaction
E-DEL-1(config)# hostname E-DEL-1
<span class="c">! 1. Identity: main kaun hoon, kaunsi site, kaunsa overlay, Validator kaun hai</span>
E-DEL-1(config)# system
E-DEL-1(config-system)# system-ip 10.255.0.11
E-DEL-1(config-system)# site-id 100
E-DEL-1(config-system)# organization-name BHARAT-RETAIL
E-DEL-1(config-system)# vbond 198.51.100.30
E-DEL-1(config-system)# exit
<span class="c">! 2. Underlay: VPN 0 (global table) mein do WAN circuits</span>
E-DEL-1(config)# interface GigabitEthernet1
E-DEL-1(config-if)# ip address 203.0.113.6 255.255.255.252
E-DEL-1(config-if)# no shutdown
E-DEL-1(config-if)# interface GigabitEthernet2
E-DEL-1(config-if)# ip address 172.16.1.2 255.255.255.252
E-DEL-1(config-if)# no shutdown
E-DEL-1(config-if)# exit
E-DEL-1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.5
<span class="c">! 3. Har WAN interface se bandhe tunnel interfaces</span>
E-DEL-1(config)# interface Tunnel1
E-DEL-1(config-if)# ip unnumbered GigabitEthernet1
E-DEL-1(config-if)# tunnel source GigabitEthernet1
E-DEL-1(config-if)# tunnel mode sdwan
E-DEL-1(config-if)# exit
<span class="c">! 4. SD-WAN transport settings: color aur encapsulation</span>
E-DEL-1(config)# sdwan
E-DEL-1(config-sdwan)# interface GigabitEthernet1
E-DEL-1(config-interface-GigabitEthernet1)# tunnel-interface
E-DEL-1(config-tunnel-interface)# encapsulation ipsec
E-DEL-1(config-tunnel-interface)# color biz-internet
E-DEL-1(config-tunnel-interface)# commit</pre>
<p>Commit step transaction ko apply karta hai. <b>System</b> block pichhle chapter ke chaar items hain: system IP, site ID, organization name aur Validator. Doosra tunnel (GigabitEthernet2 par Tunnel2, color <code>mpls</code>) usi pattern par chalta hai, jo hum TLOC chapter mein padhenge.</p>
<p>Management port, agar use karte ho, to management VRF mein jaata hai:</p>
<pre class="code">interface GigabitEthernet0
 vrf forwarding Mgmt-intf
 ip address 192.0.2.11 255.255.255.0
 no shutdown</pre>

<h3>SD-WAN ko doshi thehrane se pehle underlay verify karo</h3>
<p>Zyada tar failed onboardings seedhi IP problems hoti hain. Edge se interface, route aur global table mein Validator tak reachability check karo:</p>
<pre class="out">E-DEL-1# show ip interface brief | include Gigabit
GigabitEthernet1   203.0.113.6    YES manual up    up
GigabitEthernet2   172.16.1.2     YES manual up    up

E-DEL-1# ping 198.51.100.30
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 198.51.100.30, timeout is 2 seconds:
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5)

E-DEL-1# show sdwan control connections
PEER    PEER PEER    SITE DOMAIN PEER          ...  LOCAL COLOR  PROXY STATE UPTIME
TYPE    PROT SYSTEM IP ID   ID     PRIVATE IP
vsmart  dtls 10.255.255.2 1   1     198.51.100.20 ...  biz-internet No    <span class="hl">up</span>    0:00:03:21
vmanage dtls 10.255.255.1 1   0     198.51.100.10 ...  biz-internet No    <span class="hl">up</span>    0:00:03:22</pre>

<div class="warn"><p><b>Common mistakes.</b> VPN 0 mein default route na hona; LAN interface ko service VRF ki jagah global table mein rakhna; Validator address galat type karna; do default routes lagana bina samjhe ki dono use hote hain; aur yeh bhool jaana ki edge ke aage firewall ya ACL ko UDP 12346 aur Controllers tak ICMP allow karna chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> VPN 0 aur VPN 512 special hain. VPN 0 sirf transport traffic le jaata hai; VPN 512 OMP mein advertise nahi hota. User traffic hamesha service VPNs mein rehta hai.</p></div>

<div class="scn"><h4>Mumbai edge "connect" par atka hua</h4><p>E-MUM-1 mein system IP, site ID, organization name aur Validator sahi the, lekin <code>show sdwan control connections</code> khaali tha. Engineer ne router se 198.51.100.30 ping kiya aur woh fail hua. Underlay interface up tha, lekin default route purane ISP gateway 203.0.113.1 ki taraf thi, 203.0.113.9 ki jagah. Route theek karne ke baad ping chala aur control connections kuch seconds mein up ho gaye.</p><p><b>Seekh:</b> pehle ping se underlay prove karo. SD-WAN missing route theek nahi kar sakta.</p></div>

<div class="iv"><p class="q">"VPN 0 aur VPN 512 mein kya farak hai, aur user traffic kaunsa VPN le jaata hai?"</p><p>Strong answer: VPN 0 transport VPN hai. Usmein WAN interfaces hote hain aur woh control aur data tunnels banata hai. VPN 512 out-of-band management hai aur kabhi OMP mein advertise nahi hota. User traffic service VPNs mein jaata hai, jaise VPN 10. IOS XE par VPN 0 global table hai aur 512 Mgmt-intf.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN 0 transport hai, VPN 512 management hai, baaki har VPN service VPN hai.</li>
<li>IOS XE edges par VPN 0 global table hai; VPN 512 <code>Mgmt-intf</code> VRF hai.</li>
<li>Underlay addressing static, DHCP ya routing se ho sakti hai; DNS sirf hostnames ke liye chahiye.</li>
<li>Day-0 ke chaar hisse: system identity, underlay, tunnel interface, SD-WAN transport settings.</li>
<li>SD-WAN debug karne se pehle Validator tak ping se underlay test karo.</li>
</ul></div>
`}};export{e as default};