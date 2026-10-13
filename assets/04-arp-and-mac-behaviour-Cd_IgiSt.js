var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(e,t,n,r,i)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" fill="`+i+`" stroke="#64748b" stroke-width="0.8"/>`,n=(n,r,i)=>{let a=600/32,o=``;return[0,8,16,24].forEach(t=>{o+=e(20+t*a+2,12,t,`svg-muted`,10,`start`)}),o+=e(618,12,31,`svg-muted`,10,`end`),n.forEach((n,r)=>{let i=20,s=18+r*34;n.forEach(n=>{let r=n[1]*a;o+=t(i,s,r,32,n[2])+e(i+r/2,s+20,n[0],`svg-ink`,n[3]||11),i+=r})}),`<div class="dia"><svg viewBox="0 0 640 `+(24+n.length*34)+`" role="img" aria-label="`+i+`">`+o+`</svg><p class="cap">`+r+`</p></div>`},r=[[[`Hardware type 0x0001`,16,`#bae6fd`],[`Protocol type 0x0800`,16,`#bae6fd`]],[[`HLEN 6`,8,`#ddd6fe`],[`PLEN 4`,8,`#ddd6fe`],[`Opcode: 1 request, 2 reply`,16,`#fde68a`]],[[`Sender MAC (SHA), bytes 1 to 4`,32,`#bbf7d0`]],[[`SHA, bytes 5 to 6`,16,`#bbf7d0`],[`Sender IP (SPA), bytes 1 to 2`,16,`#fed7aa`]],[[`SPA, bytes 3 to 4`,16,`#fed7aa`],[`Target MAC (THA), bytes 1 to 2`,16,`#e2e8f0`]],[[`Target MAC (THA), bytes 3 to 6`,32,`#e2e8f0`]],[[`Target IP (TPA), 32 bits`,32,`#ddd6fe`]]],i=`<pre class="out">0000  <span class="hl">ff ff ff ff ff ff</span> 52 54 00 a1 00 10 08 06 00 01
0010  08 00 06 04 <span class="hl">00 01</span> 52 54 00 a1 00 10 c0 a8 0a 0a
0020  00 00 00 00 00 00 c0 a8 0a 01 00 00 00 00 00 00
0030  00 00 00 00 00 00 00 00 00 00 00 00</pre>`,a=`<pre class="out">Source             Destination        Protocol Length Info
00:50:7f:06:6d:01  Broadcast          ARP        60 Who has 10.1.1.10? Tell 10.1.1.10
00:50:7f:06:6d:01  Broadcast          ARP        60 Who has 10.1.1.1? Tell 10.1.1.10
NKLabs_04:4b:01    00:50:7f:06:6d:01  ARP        60 10.1.1.1 is at 52:54:0c:04:4b:01</pre>`,o=`<pre class="out">R1# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.1.1.1         -          5254.0c04.4b01  ARPA   GigabitEthernet0/0
<span class="hl">Internet  10.1.1.10        0          0050.7f06.6d01  ARPA   GigabitEthernet0/0</span>
Internet  203.0.113.1      -          5254.0c04.4b02  ARPA   GigabitEthernet0/1
Internet  203.0.113.80     0          0050.0916.e401  ARPA   GigabitEthernet0/1

SW1# show mac address-table
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
 All    0100.0ccc.cccc    STATIC      CPU
   1    0050.7f06.6d01    DYNAMIC     Gi0/1
   1    5254.0c04.4b01    DYNAMIC     Gi0/0</pre>`,s={id:`arp-and-mac-behaviour`,h:{en:`ARP in depth: the 28-byte packet, broadcast, unicast and multicast MACs, gratuitous ARP`,hi:`ARP gehraai se: 28-byte packet, broadcast, unicast aur multicast MACs, gratuitous ARP`},body:{en:`
<p>You know a colleague's name but not which desk they sit at. You stand up and shout "Who is Priya?" to the whole floor. Only Priya answers, directly to you, and you write her desk number on a sticky note for later. That is ARP: a question to everybody, an answer from one, and a short-lived cache. Because ARP sits between Layer 2 and Layer 3 and has no header of its own for security, almost every "I can ping it by IP but it fails" story starts in this tiny packet.</p>

<h3>The 28-byte ARP message</h3>
`+n(r,`ARP over Ethernet and IPv4: seven 32-bit rows, 28 bytes. The Ethernet EtherType is 0x0806.`,`ARP packet layout`)+`
<dl class="terms">
<dt>Hardware type 1, protocol type 0x0800, HLEN 6, PLEN 4</dt><dd>"Ethernet addresses (6 bytes) are being mapped to IPv4 addresses (4 bytes)". They are constants on every LAN you will meet; a wrong value means a corrupt or unusual packet.</dd>
<dt>Opcode</dt><dd>1 = request, 2 = reply. (Rarely: 3 and 4 for RARP, which is obsolete.)</dd>
<dt>Sender MAC and IP (SHA, SPA)</dt><dd>The asker's own pair. Every receiver can learn from it, which is why PC1's cache entry appears on R1 without R1 asking.</dd>
<dt>Target MAC and IP (THA, TPA)</dt><dd>In a request the target MAC is all zeros, because that is exactly what is unknown. In a reply it carries the asker's MAC.</dd>
</dl>

<h3>Decode a real request</h3>
<p>The Packet Studio <code>arp</code> flow: PC1 (192.168.10.10) asking for the gateway 192.168.10.1. The Ethernet destination is the broadcast address, the EtherType is 0x0806 and the opcode is 00 01.</p>
`+i+`
<p>Count it: 14 bytes Ethernet + 28 bytes ARP + 18 bytes of zero padding = 60. The reply is the same layout with opcode 00 02, Ethernet destination 52:54:00:a1:00:10 (<b>unicast</b>, straight back to the asker), sender MAC 52:54:00:b2:00:01 and sender IP 192.168.10.1.</p>

<h3>Broadcast, unicast, multicast: what the switch does</h3>
<div class="tbl"><table class="cmp">
<tr><th>Destination MAC</th><th>Switch action</th><th>Typical frame</th></tr>
<tr><td>known unicast</td><td>forward out the one port in the MAC table</td><td>ARP reply, any TCP segment</td></tr>
<tr><td>unknown unicast</td><td>flood to every port in the VLAN except the ingress port</td><td>traffic to a MAC that timed out</td></tr>
<tr><td>ff:ff:ff:ff:ff:ff</td><td>flood to the whole VLAN, always</td><td>ARP request, DHCP Discover</td></tr>
<tr><td>01:00:5e:xx:xx:xx</td><td>flood unless IGMP snooping prunes it</td><td>OSPF hello, multicast video</td></tr>
</table></div>
<p>A switch learns from the <b>source</b> MAC of every frame and forwards on the <b>destination</b> MAC. Notice how R1 and SW1 learned PC1 purely from its ARP request:</p>
`+o+`
<p>A VLAN is therefore a <b>broadcast domain</b>: every host processes every ARP request. A /16 with 60,000 hosts means 60,000 CPUs interrupted by each question, which is one reason we subnet.</p>

<h3>Gratuitous ARP and the ARP probe</h3>
<p>When you type <code>ip 10.1.1.10/24 10.1.1.1</code> on PC1 in the ccna-models lab, the capture panel shows PC1 asking about itself:</p>
`+a+`
<p>Frame 1 is a <b>gratuitous ARP</b>: sender IP equals target IP, destination broadcast. It has three jobs: detect a duplicate IP (an unexpected reply means someone else owns the address), refresh every neighbour's cache when a MAC changes (NIC replacement, a failed-over firewall, an HSRP or VRRP router becoming active) and let switches relearn a moved MAC. A related <b>ARP probe</b> sets the sender IP to 0.0.0.0 ("who has 192.168.10.10? Tell 0.0.0.0", seen in the DHCP flow) so the asker does not pollute caches before it owns the address. Frame 2 and 3 are the normal request and the unicast reply for the gateway.</p>

<div class="eg"><p><b>Worked example: why a wrong mask makes ARP fail.</b> PC1 is 10.1.1.10 but someone typed /16. To PC1 the whole of 10.1.0.0 to 10.1.255.255 is "local", so for 10.1.200.5 it sends an ARP request <b>directly</b> instead of going to the gateway. Nobody on the VLAN owns that address, so no reply comes, and the capture shows request after request, one per second, for an IP that is not in your subnet. The cure is not on the router: it is the host mask. The reverse (mask too long) makes a host send local traffic to the gateway, which usually still works through proxy ARP or a redirect.</p></div>

<h3>What abnormal ARP looks like</h3>
<ul>
<li><b>Requests with no replies</b>: host down, wrong VLAN, wrong mask, or a port-security block.</li>
<li><b>Two replies, two different MACs, one IP</b>: a duplicate IP address. The cache flaps between the two.</li>
<li><b>An unsolicited reply (no request before it)</b> from a MAC that is not the owner: misconfiguration, or ARP spoofing. Switch features such as Dynamic ARP Inspection compare ARP against DHCP snooping bindings to stop it.</li>
<li><b>ARP for a remote address</b>: the sender's mask is wrong, as above.</li>
</ul>
<p>Cache lifetimes differ: an IOS router keeps dynamic entries 4 hours by default, while host caches usually hold an entry for minutes. In the lab, <code>show arp</code> on PC1 prints each entry with its remaining lifetime.</p>

<div class="warn"><p><b>Common mistakes.</b> Clearing the router's ARP cache to "fix" a duplicate IP: it returns within seconds, you must find the owners. Assuming ARP crosses a router: a router never forwards ARP broadcasts. Believing the destination MAC of a packet to a remote server is the server's: it is the gateway's (see the ccna-models lab 1).</p></div>

<div class="exam"><p><b>Exam traps.</b> The ARP request is a broadcast (ffff.ffff.ffff) and the reply is unicast. EtherType 0x0806. ARP only resolves addresses on the same subnet; for a remote host the host ARPs for the default gateway. Gratuitous ARP: sender IP equals target IP.</p></div>

<div class="scn"><h4>Two printers, one address</h4><p>A floor printer printed fine in the morning and failed after lunch, then worked again, in cycles. A capture on the access switch showed requests for 192.168.10.50 answered by <b>two different MACs</b>, one belonging to the printer and one to a colleague's new test printer that had been given the same static address. Each reply overwrote the cache entry on the user PCs, so jobs went to whichever printer answered last. Moving the test printer to its reserved address ended the flapping.</p><p><b>Lesson:</b> flapping reachability plus two source MACs for one IP in ARP replies is the signature of a duplicate address.</p></div>

<div class="iv"><p class="q">"PC1 pings a server in another subnet. Walk me through the ARP and the MAC addresses."</p><p>PC1 decides the destination is not local, so it ARPs for the <b>gateway's</b> IP, gets the gateway MAC and sends the frame to that MAC with the server's IP inside. The router then ARPs on the far segment for the server (or next hop) and rewrites the Ethernet header. The IP addresses stay; the MAC addresses change on every hop. Mention the cache and gratuitous ARP for extra credit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ARP is 28 bytes: hardware/protocol type, sizes, opcode, sender pair, target pair; carried in EtherType 0x0806.</li>
<li>Request = broadcast with zero target MAC; reply = unicast. Short frames are padded to 60 bytes in a capture.</li>
<li>Switches learn from source MACs and flood broadcast, unknown unicast and (without snooping) multicast.</li>
<li>Gratuitous ARP (sender IP = target IP) updates caches and detects duplicates; a probe uses sender IP 0.0.0.0.</li>
<li>Unanswered requests, two MACs for one IP, or ARP for a remote IP each point to a specific fault.</li>
</ul></div>
`,hi:`
<p>Aap ek colleague ka naam jaante ho lekin woh kis desk par baithta hai nahi. Aap khade hokar poori floor ko awaaz lagate ho "Priya kaun hai?" Sirf Priya seedha aapko jawab deti hai, aur aap uska desk number sticky note par likh lete ho. Yehi ARP hai: sabse ek sawaal, ek se jawab, aur chhoti umar ka cache. ARP Layer 2 aur Layer 3 ke beech baithta hai aur security ke liye iska koi alag header nahi, isliye "IP se ping ho jaata hai par fail ho raha hai" jaisi lagbhag har kahani is chhote packet se shuru hoti hai.</p>

<h3>28-byte ARP message</h3>
`+n(r,`Ethernet aur IPv4 par ARP: saat 32-bit rows, 28 bytes. Ethernet EtherType 0x0806 hai.`,`ARP packet layout`)+`
<dl class="terms">
<dt>Hardware type 1, protocol type 0x0800, HLEN 6, PLEN 4</dt><dd>"Ethernet addresses (6 bytes) ko IPv4 addresses (4 bytes) se map kiya ja raha hai". Yeh har LAN par constant hain; galat value ka matlab corrupt ya anokha packet.</dd>
<dt>Opcode</dt><dd>1 = request, 2 = reply. (Kabhi kabhi RARP ke liye 3 aur 4, jo obsolete hai.)</dd>
<dt>Sender MAC aur IP (SHA, SPA)</dt><dd>Poochne wale ki apni jodi. Har receiver isse seekh sakta hai, isliye PC1 ki cache entry R1 par bina R1 ke poochhe aa jaati hai.</dd>
<dt>Target MAC aur IP (THA, TPA)</dt><dd>Request mein target MAC sab zero hota hai, kyunki wahi toh pata nahi. Reply mein poochne wale ka MAC hota hai.</dd>
</dl>

<h3>Real request decode karo</h3>
<p>Packet Studio ka <code>arp</code> flow: PC1 (192.168.10.10) gateway 192.168.10.1 ke baare mein pooch raha hai. Ethernet destination broadcast hai, EtherType 0x0806 hai aur opcode 00 01 hai.</p>
`+i+`
<p>Ginti karo: 14 bytes Ethernet + 28 bytes ARP + 18 bytes zero padding = 60. Reply wahi layout hai, opcode 00 02 ke saath, Ethernet destination 52:54:00:a1:00:10 (<b>unicast</b>, seedha poochne wale ko), sender MAC 52:54:00:b2:00:01 aur sender IP 192.168.10.1.</p>

<h3>Broadcast, unicast, multicast: switch kya karta hai</h3>
<div class="tbl"><table class="cmp">
<tr><th>Destination MAC</th><th>Switch ka action</th><th>Typical frame</th></tr>
<tr><td>known unicast</td><td>MAC table ke ek port se forward</td><td>ARP reply, koi bhi TCP segment</td></tr>
<tr><td>unknown unicast</td><td>ingress port ko chhodkar VLAN ke har port par flood</td><td>aise MAC ka traffic jo timeout ho gaya</td></tr>
<tr><td>ff:ff:ff:ff:ff:ff</td><td>poori VLAN mein hamesha flood</td><td>ARP request, DHCP Discover</td></tr>
<tr><td>01:00:5e:xx:xx:xx</td><td>IGMP snooping prune na kare to flood</td><td>OSPF hello, multicast video</td></tr>
</table></div>
<p>Switch har frame ke <b>source</b> MAC se seekhta hai aur <b>destination</b> MAC par forward karta hai. Dekho R1 aur SW1 ne PC1 ko sirf uske ARP request se kaise seekha:</p>
`+o+`
<p>Isliye VLAN ek <b>broadcast domain</b> hai: har host har ARP request process karta hai. 60,000 hosts wale /16 ka matlab har sawaal par 60,000 CPUs disturb, aur subnetting ki ek wajah yeh bhi hai.</p>

<h3>Gratuitous ARP aur ARP probe</h3>
<p>ccna-models lab mein PC1 par <code>ip 10.1.1.10/24 10.1.1.1</code> type karte hi capture panel mein PC1 apne baare mein poochta dikhta hai:</p>
`+a+`
<p>Frame 1 <b>gratuitous ARP</b> hai: sender IP target IP ke barabar, destination broadcast. Iske teen kaam hain: duplicate IP pakadna (anjaan reply aaye to koi aur us address ka malik hai), MAC badalne par har padosi ka cache refresh karna (NIC replace, failover hua firewall, HSRP ya VRRP router ka active hona) aur switches ko moved MAC dobara seekhne dena. Isi se juda <b>ARP probe</b> sender IP 0.0.0.0 rakhta hai ("who has 192.168.10.10? Tell 0.0.0.0", DHCP flow mein dikhta hai) taaki poochne wala address ka malik banne se pehle caches ko ganda na kare. Frame 2 aur 3 gateway ke liye normal request aur unicast reply hain.</p>

<div class="eg"><p><b>Worked example: galat mask se ARP fail kyun hota hai.</b> PC1 10.1.1.10 hai lekin kisi ne /16 type kar diya. PC1 ke liye poora 10.1.0.0 se 10.1.255.255 "local" hai, isliye 10.1.200.5 ke liye woh gateway ke bajay <b>seedha</b> ARP request bhejta hai. VLAN par us address ka koi malik nahi, isliye reply nahi aata, aur capture mein request par request dikhti hai, har second ek, aise IP ke liye jo aapke subnet mein hai hi nahi. Ilaaj router par nahi: host ka mask hai. Ulta (mask zyada lamba) host ko local traffic gateway ko bhejne par majboor karta hai, jo aam taur par proxy ARP ya redirect se phir bhi chal jaata hai.</p></div>

<h3>Abnormal ARP kaisa dikhta hai</h3>
<ul>
<li><b>Requests bina replies ke</b>: host down, galat VLAN, galat mask, ya port-security block.</li>
<li><b>Do replies, do alag MACs, ek IP</b>: duplicate IP address. Cache dono ke beech flap karta hai.</li>
<li><b>Unsolicited reply (pehle koi request nahi)</b> aise MAC se jo owner nahi: misconfiguration, ya ARP spoofing. Dynamic ARP Inspection jaise switch features ARP ko DHCP snooping bindings se compare karke ise rokte hain.</li>
<li><b>Remote address ke liye ARP</b>: sender ka mask galat hai, jaisa upar dekha.</li>
</ul>
<p>Cache lifetimes alag hoti hain: IOS router dynamic entries ko default 4 ghante rakhta hai, jabki host caches aam taur par entry minutes tak rakhte hain. Lab mein PC1 par <code>show arp</code> har entry ke saath uski bachi hui lifetime print karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Duplicate IP "theek karne" ke liye router ka ARP cache clear karna: woh kuch seconds mein wapas aa jaata hai, aapko owners dhoondhne honge. Maanna ki ARP router paar karta hai: router ARP broadcasts kabhi forward nahi karta. Remote server ke packet ka destination MAC server ka samajhna: woh gateway ka hota hai (ccna-models lab 1 dekho).</p></div>

<div class="exam"><p><b>Exam traps.</b> ARP request broadcast (ffff.ffff.ffff) hai aur reply unicast. EtherType 0x0806. ARP sirf same subnet ke addresses resolve karta hai; remote host ke liye host default gateway ka ARP karta hai. Gratuitous ARP: sender IP target IP ke barabar.</p></div>

<div class="scn"><h4>Do printers, ek address</h4><p>Floor ka ek printer subah theek chalta tha, lunch ke baad fail hua, phir wapas chala, cycles mein. Access switch par capture mein 192.168.10.50 ke requests ka jawab <b>do alag MACs</b> ne diya, ek printer ka aur ek colleague ke naye test printer ka jise wahi static address mil gaya tha. Har reply user PCs ke cache entry ko overwrite karta tha, isliye jobs us printer ko jaate jo aakhri baar jawab deta. Test printer ko uske reserved address par le jaane se flapping khatam hui.</p><p><b>Seekh:</b> flapping reachability plus ARP replies mein ek IP ke do source MACs duplicate address ki pehchaan hai.</p></div>

<div class="iv"><p class="q">"PC1 dusre subnet ke server ko ping karta hai. ARP aur MAC addresses ka walkthrough do."</p><p>PC1 decide karta hai ki destination local nahi, isliye <b>gateway</b> ke IP ka ARP karta hai, gateway ka MAC pata karta hai aur frame us MAC par bhejta hai, andar server ka IP rehta hai. Phir router far segment par server (ya next hop) ka ARP karta hai aur Ethernet header dobara likhta hai. IP addresses wahi rehte hain; MAC addresses har hop par badalte hain. Extra credit ke liye cache aur gratuitous ARP bhi mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ARP 28 bytes ka hai: hardware/protocol type, sizes, opcode, sender pair, target pair; EtherType 0x0806 mein.</li>
<li>Request = broadcast, target MAC zero; reply = unicast. Capture mein chhote frames 60 bytes tak pad hote hain.</li>
<li>Switches source MAC se seekhte hain aur broadcast, unknown unicast aur (snooping ke bina) multicast flood karte hain.</li>
<li>Gratuitous ARP (sender IP = target IP) caches update karta hai aur duplicates pakadta hai; probe sender IP 0.0.0.0 use karta hai.</li>
<li>Unanswered requests, ek IP ke do MACs, ya remote IP ka ARP, har ek ek khaas fault batata hai.</li>
</ul></div>
`}};export{s as default};