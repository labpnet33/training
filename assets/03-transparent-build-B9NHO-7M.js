var e={id:`transparent-build`,h:{en:`Building a transparent firewall: bridge groups and the BVI`,hi:`Transparent firewall banana: bridge groups aur BVI`},body:{en:`
<p>Imagine a single long meeting room that you divide with a glass wall and a door with a guard. People on both sides are still "in the same room" for the purpose of room numbers and mail delivery, but anybody who crosses must pass the guard. A <b>bridge group</b> is that room: one broadcast domain and one IP subnet, split by the firewall into sides. The <b>BVI</b> is the guard's own desk phone number, so that the guard can call people on either side.</p>

<h3>The pieces</h3>
<dl class="terms">
<dt>Bridge group</dt><dd>A set of firewall interfaces that are bridged together. All members share one IP subnet. Traffic between members is inspected like traffic between any two interfaces. Current ASA and Threat Defense releases support up to 250 bridge groups with up to 64 interfaces each. An interface belongs to one bridge group only, and bridge groups cannot talk to each other directly: traffic between two bridge groups must leave through an outside router and come back.</dd>
<dt>Member interface</dt><dd>A physical interface, subinterface, redundant interface or EtherChannel with <code>nameif</code>, <code>security-level</code> and <code>bridge-group N</code>, but <b>no IP address</b>.</dd>
<dt>BVI (bridge virtual interface)</dt><dd><code>interface BVI N</code>, one per bridge group, with one IPv4 address in the bridged subnet (IPv6 is optional). In transparent mode it has no nameif. The firewall uses it as the <b>source address</b> for traffic it generates on that bridge group: ARP requests, pings it sends to discover MAC addresses, syslog, AAA and management sessions.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 1 transparent topology">
<rect x="20" y="40" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="65" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<rect x="20" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="175" text-anchor="middle" class="svg-ink" font-size="13">SRV .20</text>
<rect x="140" y="95" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="180" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<rect x="260" y="80" width="130" height="70" rx="10" fill="#fed7aa"/><text x="325" y="105" text-anchor="middle" class="svg-ink" font-size="14">ASA1 NK-TFW</text><text x="325" y="123" text-anchor="middle" class="svg-muted" font-size="12">bridge-group 1</text><text x="325" y="140" text-anchor="middle" class="svg-accent" font-size="12">BVI1 10.0.1.5</text>
<rect x="430" y="95" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="470" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW-OUT</text>
<rect x="540" y="95" width="90" height="40" rx="8" fill="#bae6fd"/><text x="585" y="120" text-anchor="middle" class="svg-ink" font-size="13">R-GW .1</text>
<rect x="430" y="185" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="475" y="210" text-anchor="middle" class="svg-ink" font-size="13">MON .250</text>
<line x1="110" y1="60" x2="140" y2="110" stroke="#64748b" stroke-width="2"/><line x1="110" y1="170" x2="140" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="220" y1="115" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="390" y1="115" x2="430" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="115" x2="540" y2="115" stroke="#64748b" stroke-width="2"/><line x1="470" y1="135" x2="475" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="240" y="75" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 inside 100</text><text x="410" y="75" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 outside 0</text>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="13">all hosts in 10.0.1.0/24, gateway 10.0.1.1</text>
</svg><p class="cap">Lab 1: ASA1 bridges the LAN side (inside) and the router side (outside) of one subnet.</p></div>

<h3>Step-by-step configuration (lab 1)</h3>
<p>ASA1 starts from factory default and has been cabled in, so right now the LAN is cut off from its router. The order matters: mode first, then members, then the BVI.</p>
<pre class="code"><span class="c">! 1. mode first: this clears the configuration</span>
ciscoasa&gt; enable
ciscoasa# configure terminal
ciscoasa(config)# firewall transparent
ciscoasa(config)# hostname NK-TFW
<span class="c">! 2. LAN-facing member</span>
NK-TFW(config)# interface GigabitEthernet0/1
NK-TFW(config-if)# nameif inside
NK-TFW(config-if)# security-level 100
NK-TFW(config-if)# bridge-group 1
NK-TFW(config-if)# no shutdown
<span class="c">! 3. router-facing member</span>
NK-TFW(config-if)# interface GigabitEthernet0/0
NK-TFW(config-if)# nameif outside
NK-TFW(config-if)# security-level 0
NK-TFW(config-if)# bridge-group 1
NK-TFW(config-if)# no shutdown
<span class="c">! 4. the management address of bridge group 1</span>
NK-TFW(config-if)# interface BVI1
NK-TFW(config-if)# ip address 10.0.1.5 255.255.255.0
NK-TFW(config-if)# exit</pre>
<p>Notice what is <i>not</i> there: no IP address on Gi0/0 or Gi0/1, no change on R-GW, PC1 or SRV. If you try <code>ip address</code> on a member interface, the ASA rejects it because the interface is in a bridge group.</p>

<h3>Why the BVI address is mandatory</h3>
<p>A transparent firewall does not flood frames for unknown destinations the way a switch does. When a frame arrives for a MAC address that is not yet in its table, the ASA drops that first packet and tries to <b>discover</b> where the destination lives: for a destination in the bridged subnet it sends an <b>ARP request</b>, and for a remote destination it sends a <b>ping</b> towards the IP so that the router's reply reveals which interface it is on. Both of those packets need a source address, and that source is the BVI. With no BVI address the bridge group passes nothing. That is also why you should pick an unused address: a BVI that duplicates a printer's address creates an IP conflict on the LAN.</p>

<h3>Verification</h3>
<pre class="out">NK-TFW# show bridge-group 1
Interfaces:
GigabitEthernet0/0
GigabitEthernet0/1
<span class="hl">Management System IP Address: 10.0.1.5 255.255.255.0</span>
<span class="hl">Management Current IP Address: 10.0.1.5 255.255.255.0</span>
Management IPv6 Global Unicast Address(es):
  N/A
Static mac-address entries: 0
Dynamic mac-address entries: 4

NK-TFW# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
GigabitEthernet0/1       inside                   100</pre>
<p>Then test from PC1: <code>ping 10.0.1.5</code> (the BVI) and browse to INET 8.8.8.8 on port 80. Web works immediately because inside (100) to outside (0) is allowed and replies return through the connection table. Ping to 8.8.8.8 will fail until the next chapter's fix, which is exactly lab task 3.</p>

<h3>Management of the transparent firewall</h3>
<p>You manage the box on the BVI address: <code>ssh 10.0.1.0 255.255.255.0 inside</code> plus a local user and <code>aaa authentication ssh console LOCAL</code>, exactly as in routed mode. Routes in transparent mode are used for traffic the ASA itself originates (or for NAT). If a syslog or AAA server sits in another subnet, add a route through the real gateway, for example <code>route outside 0.0.0.0 0.0.0.0 10.0.1.1</code>.</p>

<div class="eg"><p><b>Worked example.</b> Before tonight's change you check the DHCP scope of 10.0.1.0/24: it hands out .100 to .199, the router is .1, SRV is .20 and MON is .250. You reserve .5 for the firewall and ping it from the router to prove nobody answers. After the change <code>show bridge-group 1</code> reports "Dynamic mac-address entries: 4" (PC1, SRV, R-GW and MON), which tells you the bridge is learning on both sides.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>no shutdown</code> on one member, or putting the two members in different bridge groups (1 and 2). Both produce the same symptom: hosts on one side cannot ARP for the router. <code>show bridge-group</code> lists exactly which interfaces are in each group.</p></div>

<div class="exam"><p><b>Exam trap.</b> The BVI address must be in the same subnet as the hosts it bridges, and it is not the hosts' gateway. An answer that sets the hosts' default gateway to the BVI is wrong.</p></div>

<div class="scn"><h4>The firewall that stole the printer's address</h4><p>An engineer picked 10.0.1.50 for BVI1 without checking. The next morning a floor printer stopped printing intermittently. The switch logs showed the MAC for 10.0.1.50 flapping between the printer's port and the firewall uplink. The fix was to readdress BVI1 to a reserved address and clear the ARP cache on R-GW.</p><p><b>Lesson:</b> the BVI is a real host address in a live subnet; reserve it like any other.</p></div>

<div class="iv"><p class="q">"Why does a transparent firewall need an IP address at all?"</p><p>Because the firewall itself has to talk: it sends ARP requests and discovery pings to learn which interface a destination MAC is on, and it sources management, syslog and AAA traffic. All of that uses the BVI address. Without it the bridge group forwards nothing. Add that the BVI is in the same subnet as the hosts and is not their gateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: <code>firewall transparent</code>, member interfaces with nameif, security level and <code>bridge-group</code>, then <code>interface BVI N</code> with an IP.</li>
<li>Members have no IP; the BVI holds one management address in the bridged subnet.</li>
<li>Without a BVI address nothing passes, because the ASA cannot ARP or discover MAC locations.</li>
<li>Bridge groups are isolated from each other; up to 250 groups with 64 members each.</li>
<li>Verify with <code>show bridge-group</code>, <code>show nameif</code> and a ping to the BVI.</li>
</ul></div>
`,hi:`
<p>Ek lamba meeting room socho jise aap ek glass wall aur guard wale darwaaze se baant dete ho. Room numbers aur mail delivery ke liye dono taraf ke log ab bhi "same room" mein hain, lekin jo bhi paar jaata hai use guard se guzarna padta hai. <b>Bridge group</b> wahi room hai: ek broadcast domain aur ek IP subnet, jise firewall ne hisson mein baanta hai. <b>BVI</b> guard ka apna desk phone number hai, taaki guard dono taraf ke logon ko call kar sake.</p>

<h3>Tukde</h3>
<dl class="terms">
<dt>Bridge group</dt><dd>Firewall interfaces ka ek set jo aapas mein bridged hain. Saare members ek IP subnet share karte hain. Members ke beech ka traffic kisi bhi do interfaces ke beech ke traffic ki tarah inspect hota hai. Current ASA aur Threat Defense releases 250 tak bridge groups support karti hain, har ek mein 64 tak interfaces. Ek interface sirf ek bridge group mein hota hai, aur bridge groups seedhe aapas mein baat nahi kar sakte: do bridge groups ke beech traffic ko bahar ke router se nikalkar wapas aana padta hai.</dd>
<dt>Member interface</dt><dd>Physical interface, subinterface, redundant interface ya EtherChannel jis par <code>nameif</code>, <code>security-level</code> aur <code>bridge-group N</code> ho, lekin <b>koi IP address nahi</b>.</dd>
<dt>BVI (bridge virtual interface)</dt><dd><code>interface BVI N</code>, har bridge group ka ek, bridged subnet mein ek IPv4 address ke saath (IPv6 optional hai). Transparent mode mein iska nameif nahi hota. Firewall ise us bridge group par apne banaye traffic ka <b>source address</b> banata hai: ARP requests, MAC addresses dhoondhne ke liye bheje gaye pings, syslog, AAA aur management sessions.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 1 transparent topology">
<rect x="20" y="40" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="65" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<rect x="20" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="175" text-anchor="middle" class="svg-ink" font-size="13">SRV .20</text>
<rect x="140" y="95" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="180" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<rect x="260" y="80" width="130" height="70" rx="10" fill="#fed7aa"/><text x="325" y="105" text-anchor="middle" class="svg-ink" font-size="14">ASA1 NK-TFW</text><text x="325" y="123" text-anchor="middle" class="svg-muted" font-size="12">bridge-group 1</text><text x="325" y="140" text-anchor="middle" class="svg-accent" font-size="12">BVI1 10.0.1.5</text>
<rect x="430" y="95" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="470" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW-OUT</text>
<rect x="540" y="95" width="90" height="40" rx="8" fill="#bae6fd"/><text x="585" y="120" text-anchor="middle" class="svg-ink" font-size="13">R-GW .1</text>
<rect x="430" y="185" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="475" y="210" text-anchor="middle" class="svg-ink" font-size="13">MON .250</text>
<line x1="110" y1="60" x2="140" y2="110" stroke="#64748b" stroke-width="2"/><line x1="110" y1="170" x2="140" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="220" y1="115" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="390" y1="115" x2="430" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="115" x2="540" y2="115" stroke="#64748b" stroke-width="2"/><line x1="470" y1="135" x2="475" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="240" y="75" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 inside 100</text><text x="410" y="75" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 outside 0</text>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="13">saare hosts 10.0.1.0/24 mein, gateway 10.0.1.1</text>
</svg><p class="cap">Lab 1: ASA1 ek subnet ki LAN side (inside) aur router side (outside) ko bridge karta hai.</p></div>

<h3>Step-by-step configuration (lab 1)</h3>
<p>ASA1 factory default se shuru hota hai aur cable ho chuka hai, isliye abhi LAN apne router se kata hua hai. Order matter karta hai: pehle mode, phir members, phir BVI.</p>
<pre class="code"><span class="c">! 1. pehle mode: yeh configuration clear karta hai</span>
ciscoasa&gt; enable
ciscoasa# configure terminal
ciscoasa(config)# firewall transparent
ciscoasa(config)# hostname NK-TFW
<span class="c">! 2. LAN ki taraf ka member</span>
NK-TFW(config)# interface GigabitEthernet0/1
NK-TFW(config-if)# nameif inside
NK-TFW(config-if)# security-level 100
NK-TFW(config-if)# bridge-group 1
NK-TFW(config-if)# no shutdown
<span class="c">! 3. router ki taraf ka member</span>
NK-TFW(config-if)# interface GigabitEthernet0/0
NK-TFW(config-if)# nameif outside
NK-TFW(config-if)# security-level 0
NK-TFW(config-if)# bridge-group 1
NK-TFW(config-if)# no shutdown
<span class="c">! 4. bridge group 1 ka management address</span>
NK-TFW(config-if)# interface BVI1
NK-TFW(config-if)# ip address 10.0.1.5 255.255.255.0
NK-TFW(config-if)# exit</pre>
<p>Dekho kya <i>nahi</i> hai: Gi0/0 ya Gi0/1 par koi IP address nahi, R-GW, PC1 ya SRV par koi change nahi. Agar aap member interface par <code>ip address</code> try karoge, ASA mana kar dega kyunki interface bridge group mein hai.</p>

<h3>BVI address zaroori kyun hai</h3>
<p>Transparent firewall unknown destinations ke frames switch ki tarah flood nahi karta. Jab aisa frame aata hai jiska MAC address abhi table mein nahi hai, ASA woh pehla packet drop karta hai aur <b>dhoondhne</b> ki koshish karta hai ki destination kahan hai: bridged subnet ke destination ke liye woh <b>ARP request</b> bhejta hai, aur remote destination ke liye IP ki taraf ek <b>ping</b> bhejta hai taaki router ka reply bata de ki woh kis interface par hai. In dono packets ko source address chahiye, aur woh source BVI hai. BVI address ke bina bridge group kuch pass nahi karta. Isiliye unused address chunna chahiye: printer ka address duplicate karne wala BVI LAN par IP conflict bana deta hai.</p>

<h3>Verification</h3>
<pre class="out">NK-TFW# show bridge-group 1
Interfaces:
GigabitEthernet0/0
GigabitEthernet0/1
<span class="hl">Management System IP Address: 10.0.1.5 255.255.255.0</span>
<span class="hl">Management Current IP Address: 10.0.1.5 255.255.255.0</span>
Management IPv6 Global Unicast Address(es):
  N/A
Static mac-address entries: 0
Dynamic mac-address entries: 4

NK-TFW# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
GigabitEthernet0/1       inside                   100</pre>
<p>Phir PC1 se test karo: <code>ping 10.0.1.5</code> (BVI) aur INET 8.8.8.8 par port 80 browse karo. Web turant chalta hai kyunki inside (100) se outside (0) allowed hai aur replies connection table se wapas aate hain. 8.8.8.8 ka ping agle chapter ke fix tak fail hoga, jo bilkul lab task 3 hai.</p>

<h3>Transparent firewall ka management</h3>
<p>Aap box ko BVI address par manage karte ho: <code>ssh 10.0.1.0 255.255.255.0 inside</code> plus ek local user aur <code>aaa authentication ssh console LOCAL</code>, bilkul routed mode jaisa. Transparent mode mein routes us traffic ke liye use hote hain jo ASA khud banata hai (ya NAT ke liye). Agar syslog ya AAA server doosre subnet mein hai, to asli gateway ke through route jodo, jaise <code>route outside 0.0.0.0 0.0.0.0 10.0.1.1</code>.</p>

<div class="eg"><p><b>Worked example.</b> Aaj raat ke change se pehle aap 10.0.1.0/24 ka DHCP scope check karte ho: woh .100 se .199 deta hai, router .1 hai, SRV .20 hai aur MON .250 hai. Aap firewall ke liye .5 reserve karte ho aur router se use ping karke saabit karte ho ki koi jawab nahi deta. Change ke baad <code>show bridge-group 1</code> "Dynamic mac-address entries: 4" (PC1, SRV, R-GW aur MON) report karta hai, jo batata hai ki bridge dono taraf seekh raha hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek member par <code>no shutdown</code> bhool jaana, ya do members ko alag bridge groups (1 aur 2) mein daalna. Dono ka symptom same hai: ek taraf ke hosts router ke liye ARP nahi kar paate. <code>show bridge-group</code> exactly batata hai ki har group mein kaunse interfaces hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> BVI address un hosts ke same subnet mein hona chahiye jinhe woh bridge karta hai, aur yeh hosts ka gateway nahi hai. Jo answer hosts ka default gateway BVI par set karta hai woh galat hai.</p></div>

<div class="scn"><h4>Firewall jisne printer ka address chura liya</h4><p>Ek engineer ne bina check kiye BVI1 ke liye 10.0.1.50 chuna. Agli subah ek floor printer beech beech mein print karna band kar deta tha. Switch logs mein 10.0.1.50 ka MAC printer ke port aur firewall uplink ke beech flap karta dikha. Fix tha BVI1 ko ek reserved address dena aur R-GW par ARP cache clear karna.</p><p><b>Seekh:</b> BVI live subnet mein ek asli host address hai; use kisi bhi doosre address ki tarah reserve karo.</p></div>

<div class="iv"><p class="q">"Transparent firewall ko IP address ki zaroorat hi kyun hai?"</p><p>Kyunki firewall ko khud baat karni padti hai: woh ARP requests aur discovery pings bhejta hai yeh seekhne ke liye ki destination MAC kis interface par hai, aur woh management, syslog aur AAA traffic source karta hai. Yeh sab BVI address use karta hai. Iske bina bridge group kuch forward nahi karta. Jodo ki BVI hosts ke same subnet mein hai aur unka gateway nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: <code>firewall transparent</code>, nameif, security level aur <code>bridge-group</code> ke saath member interfaces, phir IP ke saath <code>interface BVI N</code>.</li>
<li>Members par IP nahi; BVI bridged subnet mein ek management address rakhta hai.</li>
<li>BVI address ke bina kuch pass nahi hota, kyunki ASA ARP ya MAC location discovery nahi kar sakta.</li>
<li>Bridge groups ek doosre se isolated hain; 250 groups tak, har ek mein 64 members.</li>
<li><code>show bridge-group</code>, <code>show nameif</code> aur BVI ko ping se verify karo.</li>
</ul></div>
`}};export{e as default};