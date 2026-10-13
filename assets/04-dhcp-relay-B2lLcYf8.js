var e={id:`relay`,h:{en:`DHCP relay (IP helper) and server redundancy`,hi:`DHCP relay (IP helper) aur server redundancy`},body:{en:`
<p>A company has twenty floors and one HR office on the ground floor. New joiners on the 14th floor cannot shout loud enough to reach HR. So every floor has a <b>floor warden</b> who hears the shout, walks the request down to HR, writes "this came from floor 14" on it, and carries the answer back. That warden is a <b>DHCP relay agent</b>.</p>

<h3>The problem: broadcasts stop at the router</h3>
<p>You learned in chapter 2 that Discover is a broadcast to <code>255.255.255.255</code>. Routers never forward limited broadcasts, because that would flood every network. In a small office the router itself is the DHCP server, so this is not an issue. In a real enterprise there are dozens of VLANs and one or two central DHCP servers in the data center. Without help, clients in every VLAN except the server's own would get APIPA addresses.</p>
<p>Running a separate DHCP server in every VLAN would work but is expensive and hard to manage. The standard answer is a <b>DHCP relay</b>: the router interface that faces the clients listens for DHCP broadcasts and forwards them as unicast to the central server.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DHCP relay">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">PC in VLAN 30</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="12">no address</text>
<rect x="250" y="80" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">BR (relay)</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 192.168.30.1</text>
<rect x="510" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="102" text-anchor="middle" class="svg-ink" font-size="13">DHCP server</text><text x="570" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.0.20.10</text>
<line x1="120" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="390" y1="105" x2="510" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="185" y="70" text-anchor="middle" class="svg-accent" font-size="12">broadcast</text>
<text x="450" y="70" text-anchor="middle" class="svg-accent" font-size="12">unicast</text>
<text x="450" y="160" text-anchor="middle" class="svg-ink" font-size="12">giaddr = 192.168.30.1</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">ip helper-address goes on the client-facing interface</text>
</svg><p class="cap">The relay turns the client's broadcast into a unicast to the server and stamps it with its own interface address (giaddr).</p></div>

<h3>How the relay works, step by step</h3>
<ol>
<li>The PC in VLAN 30 broadcasts a Discover.</li>
<li>Router BR receives it on Gi0/0, which is configured with <code>ip helper-address 10.0.20.10</code>.</li>
<li>BR writes its own interface address <code>192.168.30.1</code> into the <b>giaddr</b> (gateway IP address) field of the DHCP packet and sends it by unicast to 10.0.20.10.</li>
<li>The server looks at giaddr to decide which scope to use: 192.168.30.1 belongs to 192.168.30.0/24, so it offers an address from that scope.</li>
<li>The server sends the Offer back to 192.168.30.1; BR delivers it to the client. Request and Acknowledge follow the same path.</li>
</ol>

<h3>Configuration</h3>
<pre class="code"><span class="c">! On the router interface that faces the clients (the default gateway of VLAN 30)</span>
interface GigabitEthernet0/0
 ip address 192.168.30.1 255.255.255.0
 ip helper-address 10.0.20.10
<span class="c">! Optional second server for redundancy</span>
 ip helper-address 10.0.20.11</pre>
<p>On a Layer 3 switch, the helper goes on the SVI, for example <code>interface Vlan30</code>. On the DHCP server you still need a scope for 192.168.30.0/24 with default gateway 192.168.30.1, and the server must have a route back to that subnet.</p>
<pre class="out">BR# show ip interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 192.168.30.1/24
  Broadcast address is 255.255.255.255
  <span class="hl">Helper addresses are 10.0.20.10</span>
                      10.0.20.11</pre>

<div class="note"><p><b>Good to know.</b> On Cisco IOS, <code>ip helper-address</code> forwards more than DHCP. By default it relays eight UDP services, including DHCP/BOOTP (67), TFTP (69), DNS (53), Time (37), TACACS (49) and NetBIOS (137, 138). You can trim the list with <code>no ip forward-protocol udp</code> for services you do not want relayed. For IPv6 the equivalent is <code>ipv6 dhcp relay destination</code> on the interface.</p></div>

<h3>Redundancy: never one DHCP server</h3>
<p>If a single central DHCP server fails, new clients get nothing and existing clients lose their addresses when leases expire. Two common designs:</p>
<ul>
<li><b>Failover pair.</b> Two servers share the same scope and synchronise the lease database (Windows DHCP failover, ISC Kea high availability). Either can answer.</li>
<li><b>Split scope.</b> Each server owns a different part of the range, often 80/20: server A leases .21 to .200, server B leases .201 to .254. Both are listed as helpers; the client takes the first offer.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A hospital has 40 VLANs and two DHCP servers, 10.0.20.10 and 10.0.20.11, running in failover. Each VLAN gateway has two <code>ip helper-address</code> lines. During a patching window server .10 reboots. Discovers still reach .11, which answers from the shared database. Nobody on the wards notices.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Putting the helper on the uplink towards the server instead of the <b>client-facing</b> interface. The broadcast arrives on the client side, so the helper must be there. (2) Forgetting to create the matching scope on the server: the relay works, but the server has no pool for that giaddr and stays silent. (3) An ACL or firewall between relay and server blocking UDP 67.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Clients in one remote VLAN get 169.254 addresses; clients in the server's VLAN are fine." The answer is a missing or wrong DHCP relay (IP helper) on that VLAN's gateway interface, not a problem with the server itself.</p></div>

<div class="scn"><h4>New router, no addresses</h4><p>A branch router was replaced overnight. In the morning every branch PC had a 169.254 address, while HQ was fine. The engineer ran <code>show ip interface GigabitEthernet0/0</code> on the new router and saw "Helper address is not set". The old router's configuration had not been copied completely. Adding <code>ip helper-address 10.0.20.10</code> to the client-facing interface fixed the whole branch in seconds, because clients retry DHCP automatically.</p><p><b>Lesson:</b> when one site or VLAN has no DHCP and the others do, check the relay on that site's gateway first.</p></div>

<div class="iv"><p class="q">"Why do we need a DHCP relay, and how does the server know which scope to use for a relayed request?"</p><p>Strong answer: DHCP Discover is a limited broadcast and routers do not forward broadcasts, so a central server cannot hear clients on other subnets. The relay (ip helper-address on the client-facing interface) converts the broadcast into a unicast to the server and fills in giaddr with its own interface address. The server matches giaddr against its scopes to pick the right subnet, and replies to the relay. Mention two helpers for redundancy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routers do not forward DHCP broadcasts; a relay agent does it for them.</li>
<li><code>ip helper-address</code> goes on the client-facing interface or SVI.</li>
<li>The relay fills in giaddr; the server uses it to pick the right scope.</li>
<li>The server needs a scope for the remote subnet and a route back to it.</li>
<li>Use two servers (failover or split scope 80/20) so DHCP is never a single point of failure.</li>
</ul></div>
`,hi:`
<p>Ek company ke bees floors hain aur ground floor par ek HR office hai. 14th floor ke naye joiners itni zor se nahi chilla sakte ki HR tak awaaz pahunche. Isliye har floor par ek <b>floor warden</b> hai jo chilla kar maangi gayi cheez sunta hai, request neeche HR tak le jaata hai, us par likhta hai "yeh floor 14 se aaya hai", aur jawab wapas laata hai. Woh warden ek <b>DHCP relay agent</b> hai.</p>

<h3>Problem: broadcasts router par ruk jaate hain</h3>
<p>Aapne chapter 2 mein seekha ki Discover <code>255.255.255.255</code> par broadcast hai. Routers limited broadcasts kabhi forward nahi karte, kyunki isse har network flood ho jaata. Chhote office mein router khud DHCP server hota hai, to yeh issue nahi hai. Real enterprise mein darjanon VLANs hote hain aur data center mein ek ya do central DHCP servers. Madad ke bina, server ke apne VLAN ke alawa har VLAN ke clients ko APIPA addresses milte.</p>
<p>Har VLAN mein alag DHCP server chalana kaam karta lekin mehenga aur manage karna mushkil hai. Standard jawab hai <b>DHCP relay</b>: clients ki taraf wala router interface DHCP broadcasts sunta hai aur unhe central server ko unicast ke roop mein forward karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DHCP relay">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">VLAN 30 ka PC</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="12">address nahi</text>
<rect x="250" y="80" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">BR (relay)</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 192.168.30.1</text>
<rect x="510" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="102" text-anchor="middle" class="svg-ink" font-size="13">DHCP server</text><text x="570" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.0.20.10</text>
<line x1="120" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="390" y1="105" x2="510" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="185" y="70" text-anchor="middle" class="svg-accent" font-size="12">broadcast</text>
<text x="450" y="70" text-anchor="middle" class="svg-accent" font-size="12">unicast</text>
<text x="450" y="160" text-anchor="middle" class="svg-ink" font-size="12">giaddr = 192.168.30.1</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">ip helper-address client wale interface par lagta hai</text>
</svg><p class="cap">Relay client ke broadcast ko server ke liye unicast mein badalta hai aur us par apna interface address (giaddr) lagata hai.</p></div>

<h3>Relay kaise kaam karta hai, step by step</h3>
<ol>
<li>VLAN 30 ka PC Discover broadcast karta hai.</li>
<li>Router BR use Gi0/0 par receive karta hai, jis par <code>ip helper-address 10.0.20.10</code> configured hai.</li>
<li>BR DHCP packet ke <b>giaddr</b> (gateway IP address) field mein apna interface address <code>192.168.30.1</code> likhta hai aur use 10.0.20.10 ko unicast bhejta hai.</li>
<li>Server giaddr dekh kar decide karta hai kaunsa scope use karna hai: 192.168.30.1, 192.168.30.0/24 ka hai, to woh us scope se address offer karta hai.</li>
<li>Server Offer wapas 192.168.30.1 ko bhejta hai; BR use client tak pahunchata hai. Request aur Acknowledge bhi isi raaste chalte hain.</li>
</ol>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Clients ki taraf wale router interface par (VLAN 30 ka default gateway)</span>
interface GigabitEthernet0/0
 ip address 192.168.30.1 255.255.255.0
 ip helper-address 10.0.20.10
<span class="c">! Redundancy ke liye optional doosra server</span>
 ip helper-address 10.0.20.11</pre>
<p>Layer 3 switch par helper SVI par lagta hai, jaise <code>interface Vlan30</code>. DHCP server par aapko abhi bhi 192.168.30.0/24 ka scope chahiye jiska default gateway 192.168.30.1 ho, aur server ke paas us subnet tak wapas jaane ka route hona chahiye.</p>
<pre class="out">BR# show ip interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 192.168.30.1/24
  Broadcast address is 255.255.255.255
  <span class="hl">Helper addresses are 10.0.20.10</span>
                      10.0.20.11</pre>

<div class="note"><p><b>Jaanne layak.</b> Cisco IOS par <code>ip helper-address</code> DHCP se zyada forward karta hai. Default mein yeh aath UDP services relay karta hai, jinmein DHCP/BOOTP (67), TFTP (69), DNS (53), Time (37), TACACS (49) aur NetBIOS (137, 138) shaamil hain. Jo services aap relay nahi karna chahte unke liye <code>no ip forward-protocol udp</code> se list chhoti kar sakte ho. IPv6 ke liye iska equivalent interface par <code>ipv6 dhcp relay destination</code> hai.</p></div>

<h3>Redundancy: kabhi ek DHCP server nahi</h3>
<p>Agar ek hi central DHCP server fail ho jaaye, to naye clients ko kuch nahi milta aur existing clients leases expire hone par apne addresses kho dete hain. Do common designs:</p>
<ul>
<li><b>Failover pair.</b> Do servers same scope share karte hain aur lease database synchronise karte hain (Windows DHCP failover, ISC Kea high availability). Koi bhi jawab de sakta hai.</li>
<li><b>Split scope.</b> Har server range ka alag hissa rakhta hai, aksar 80/20: server A .21 se .200 lease karta hai, server B .201 se .254. Dono helpers ke roop mein listed hain; client pehla offer le leta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek hospital mein 40 VLANs aur do DHCP servers hain, 10.0.20.10 aur 10.0.20.11, failover mein chal rahe. Har VLAN gateway par do <code>ip helper-address</code> lines hain. Patching window ke dauraan server .10 reboot hota hai. Discovers phir bhi .11 tak pahunchte hain, jo shared database se jawab deta hai. Wards mein kisi ko pata bhi nahi chalta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Helper ko <b>client-facing</b> interface ki jagah server ki taraf wale uplink par lagana. Broadcast client side par aata hai, to helper wahin hona chahiye. (2) Server par matching scope banana bhool jaana: relay kaam karta hai, lekin server ke paas us giaddr ke liye pool nahi hota aur woh chup rehta hai. (3) Relay aur server ke beech ACL ya firewall UDP 67 block kar raha ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Ek remote VLAN ke clients ko 169.254 addresses milte hain; server ke VLAN ke clients theek hain." Jawab hai us VLAN ke gateway interface par missing ya galat DHCP relay (IP helper), server mein problem nahi.</p></div>

<div class="scn"><h4>Naya router, koi address nahi</h4><p>Raat mein ek branch router badla gaya. Subah har branch PC ke paas 169.254 address tha, jabki HQ theek tha. Engineer ne naye router par <code>show ip interface GigabitEthernet0/0</code> chalaya aur dekha "Helper address is not set". Purane router ki configuration poori copy nahi hui thi. Client-facing interface par <code>ip helper-address 10.0.20.10</code> add karne se poori branch seconds mein theek ho gayi, kyunki clients DHCP apne aap retry karte hain.</p><p><b>Seekh:</b> jab ek site ya VLAN mein DHCP na ho aur baakiyon mein ho, to pehle us site ke gateway par relay check karo.</p></div>

<div class="iv"><p class="q">"Humein DHCP relay kyun chahiye, aur server ko kaise pata chalta hai ki relayed request ke liye kaunsa scope use karna hai?"</p><p>Strong answer: DHCP Discover ek limited broadcast hai aur routers broadcasts forward nahi karte, to central server doosre subnets ke clients ko sun nahi sakta. Relay (client-facing interface par ip helper-address) broadcast ko server ke liye unicast mein badalta hai aur giaddr mein apna interface address bharta hai. Server giaddr ko apne scopes se match karke sahi subnet chunta hai, aur relay ko reply karta hai. Redundancy ke liye do helpers ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routers DHCP broadcasts forward nahi karte; relay agent unke liye yeh karta hai.</li>
<li><code>ip helper-address</code> client-facing interface ya SVI par lagta hai.</li>
<li>Relay giaddr bharta hai; server isse sahi scope chunta hai.</li>
<li>Server ko remote subnet ka scope aur wahan tak wapas route chahiye.</li>
<li>Do servers use karo (failover ya split scope 80/20) taaki DHCP kabhi single point of failure na bane.</li>
</ul></div>
`}};export{e as default};