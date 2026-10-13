var e={id:`ethernet-mac-arp`,h:{en:`Ethernet, MAC addresses and ARP`,hi:`Ethernet, MAC addresses aur ARP`},body:{en:`
<p>Every packet in your lab travels inside an Ethernet frame for each hop. To troubleshoot, you must know what is in that frame and how a device finds the MAC address of its next hop. This chapter covers the frame, the MAC address, the MAC table and ARP.</p>

<h3>The Ethernet frame</h3>
<p>Think of a courier envelope: it has a receiver, a sender, a label for what is inside, the contents, and a seal that shows if it was damaged. An Ethernet frame has the same parts.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Ethernet frame fields">
<rect x="10" y="30" width="110" height="50" rx="6" fill="#bae6fd"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="12">Destination</text><text x="65" y="68" text-anchor="middle" class="svg-ink" font-size="12">MAC (6 B)</text>
<rect x="125" y="30" width="110" height="50" rx="6" fill="#bae6fd"/><text x="180" y="52" text-anchor="middle" class="svg-ink" font-size="12">Source</text><text x="180" y="68" text-anchor="middle" class="svg-ink" font-size="12">MAC (6 B)</text>
<rect x="240" y="30" width="100" height="50" rx="6" fill="#ddd6fe"/><text x="290" y="52" text-anchor="middle" class="svg-ink" font-size="12">EtherType</text><text x="290" y="68" text-anchor="middle" class="svg-ink" font-size="12">(2 B)</text>
<rect x="345" y="30" width="170" height="50" rx="6" fill="#fde68a"/><text x="430" y="60" text-anchor="middle" class="svg-ink" font-size="12">Payload (IP packet)</text>
<rect x="520" y="30" width="110" height="50" rx="6" fill="#bbf7d0"/><text x="575" y="52" text-anchor="middle" class="svg-ink" font-size="12">FCS (4 B)</text><text x="575" y="68" text-anchor="middle" class="svg-ink" font-size="12">CRC check</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">EtherType: 0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP</text>
</svg><p class="cap">The FCS lets the receiver detect corrupted frames; counters named CRC errors point to bad cables or optics.</p></div>

<h3>MAC addresses</h3>
<p>A MAC address is 48 bits written in hex, for example <code>2c:6b:f5:3a:10:c1</code>. The first 24 bits are the vendor's <b>OUI</b>, the last 24 identify the card. <code>ff:ff:ff:ff:ff:ff</code> is the <b>broadcast</b> address. A MAC address has local meaning only: it is used on one link, between a device and its neighbour.</p>

<h3>The MAC table of a switch</h3>
<p>A switch learns by watching the <b>source</b> MAC of each frame and remembering the port. To forward, it looks up the <b>destination</b> MAC. If the entry is unknown, or the frame is a broadcast, it floods the frame to all other ports of the VLAN. On an EX switch:</p>
<pre class="code">lab@SW1&gt; show ethernet-switching table
Ethernet-switching table: 2 unicast entries
  VLAN              MAC address         Type         Age Interfaces
  SALES             00:50:79:66:68:01   Learn          0 ge-0/0/1.0
  ENG               00:50:79:66:68:02   Learn          0 ge-0/0/2.0</pre>

<h3>ARP: asking "who has this IP?"</h3>
<p>A router knows the next-hop <i>IP</i> address but needs its <i>MAC</i> to build the frame. <b>ARP</b> (Address Resolution Protocol) solves that. The sender broadcasts "who has 10.50.0.194?", the owner replies with its MAC address, and both sides cache the answer.</p>
<pre class="code">lab@R1&gt; show arp no-resolve
MAC Address       Address         Interface     Flags
2c:6b:f5:3a:10:c1 10.50.0.193     ge-0/0/0.0    none
Total entries: 1</pre>
<p><code>no-resolve</code> stops Junos from converting addresses to names, which makes output faster and clearer. IPv6 does not use ARP: it uses <b>Neighbor Discovery</b> carried in ICMPv6.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.50.0.20) pings 198.51.100.1, which is outside its /25. PC1 does not ARP for the far host. It ARPs for its gateway 10.50.0.1, gets the MAC of SW1's irb.10, and sends the frame to that MAC while the IP destination remains 198.51.100.1. SW1 then ARPs for its next hop 10.50.0.194 on the uplink. Each ARP is local to one segment.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting to see the MAC address of a faraway server in the ARP table. ARP only holds <b>directly connected</b> neighbours. An incomplete or missing ARP entry for the next hop means a layer 1 or layer 2 problem (wrong VLAN, link down), not a routing problem.</p></div>

<div class="exam"><p><b>Exam trap.</b> The destination MAC of the frame leaving a PC for a remote host is the gateway's MAC, not the server's. And the broadcast MAC is ff:ff:ff:ff:ff:ff; the IPv4 limited broadcast is 255.255.255.255.</p></div>

<div class="scn"><h4>The router that could not ARP</h4><p>After a switch change, R1 could not ping its neighbour 10.50.0.193 even though both interfaces were up. <code>show arp</code> had no entry for the neighbour. The engineer checked the switch port and found it was in the wrong VLAN, so the ARP broadcast never reached the neighbour. Moving the port to the right VLAN made ARP resolve and pings succeed. Routing was never the problem.</p><p><b>Lesson:</b> no ARP entry for a connected next hop points to layer 1 or layer 2.</p></div>

<div class="iv"><p class="q">"A host pings a server in another subnet. What MAC and IP addresses are in the frame on the first hop?"</p><p>Source: the host's MAC and IP. Destination MAC: the default gateway's MAC, found through ARP. Destination IP: the server's address. Explain that the router rewrites the MAC addresses at each hop while the IP addresses stay the same.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An Ethernet frame holds destination MAC, source MAC, EtherType, payload and FCS.</li>
<li>Switches learn source MACs and forward by destination MAC; unknown and broadcast are flooded in the VLAN.</li>
<li>ARP maps a next-hop IPv4 address to a MAC on the local segment; IPv6 uses Neighbor Discovery.</li>
<li>Use show ethernet-switching table and show arp no-resolve to verify.</li>
<li>A missing ARP entry for a connected neighbour points to layer 1 or layer 2.</li>
</ul></div>
`,hi:`
<p>Aapke lab mein har packet har hop par ek Ethernet frame ke andar chalta hai. Troubleshoot karne ke liye aapko pata hona chahiye ki us frame mein kya hai aur device apne next hop ka MAC address kaise dhoondhta hai. Yeh chapter frame, MAC address, MAC table aur ARP cover karta hai.</p>

<h3>Ethernet frame</h3>
<p>Courier envelope socho: usme receiver, sender, andar kya hai uska label, contents, aur seal hoti hai jo batati hai ki kharab to nahi hua. Ethernet frame ke bhi wahi hisse hain.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Ethernet frame ke fields">
<rect x="10" y="30" width="110" height="50" rx="6" fill="#bae6fd"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="12">Destination</text><text x="65" y="68" text-anchor="middle" class="svg-ink" font-size="12">MAC (6 B)</text>
<rect x="125" y="30" width="110" height="50" rx="6" fill="#bae6fd"/><text x="180" y="52" text-anchor="middle" class="svg-ink" font-size="12">Source</text><text x="180" y="68" text-anchor="middle" class="svg-ink" font-size="12">MAC (6 B)</text>
<rect x="240" y="30" width="100" height="50" rx="6" fill="#ddd6fe"/><text x="290" y="52" text-anchor="middle" class="svg-ink" font-size="12">EtherType</text><text x="290" y="68" text-anchor="middle" class="svg-ink" font-size="12">(2 B)</text>
<rect x="345" y="30" width="170" height="50" rx="6" fill="#fde68a"/><text x="430" y="60" text-anchor="middle" class="svg-ink" font-size="12">Payload (IP packet)</text>
<rect x="520" y="30" width="110" height="50" rx="6" fill="#bbf7d0"/><text x="575" y="52" text-anchor="middle" class="svg-ink" font-size="12">FCS (4 B)</text><text x="575" y="68" text-anchor="middle" class="svg-ink" font-size="12">CRC check</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">EtherType: 0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP</text>
</svg><p class="cap">FCS se receiver kharab frames pakadta hai; CRC errors naam ke counters kharab cable ya optics batate hain.</p></div>

<h3>MAC addresses</h3>
<p>MAC address 48 bits ka hota hai aur hex mein likha jaata hai, jaise <code>2c:6b:f5:3a:10:c1</code>. Pehle 24 bits vendor ka <b>OUI</b> hain, baaki 24 card ko pehchante hain. <code>ff:ff:ff:ff:ff:ff</code> <b>broadcast</b> address hai. MAC address ka matlab sirf local hai: ek link par, device aur uske padosi ke beech.</p>

<h3>Switch ki MAC table</h3>
<p>Switch har frame ka <b>source</b> MAC dekh kar port yaad rakhta hai. Forward karne ke liye <b>destination</b> MAC table mein dhoondhta hai. Entry unknown ho ya frame broadcast ho, to woh frame ko VLAN ke baaki sab ports par flood karta hai. EX switch par:</p>
<pre class="code">lab@SW1&gt; show ethernet-switching table
Ethernet-switching table: 2 unicast entries
  VLAN              MAC address         Type         Age Interfaces
  SALES             00:50:79:66:68:01   Learn          0 ge-0/0/1.0
  ENG               00:50:79:66:68:02   Learn          0 ge-0/0/2.0</pre>

<h3>ARP: "yeh IP kiske paas hai?"</h3>
<p>Router ko next-hop ka <i>IP</i> address pata hota hai lekin frame banane ke liye uska <i>MAC</i> chahiye. <b>ARP</b> (Address Resolution Protocol) yeh solve karta hai. Sender broadcast karta hai "10.50.0.194 kiske paas hai?", owner apna MAC reply karta hai, aur dono taraf answer cache hota hai.</p>
<pre class="code">lab@R1&gt; show arp no-resolve
MAC Address       Address         Interface     Flags
2c:6b:f5:3a:10:c1 10.50.0.193     ge-0/0/0.0    none
Total entries: 1</pre>
<p><code>no-resolve</code> Junos ko addresses ko naam mein badalne se rokta hai, isse output tez aur saaf hota hai. IPv6 ARP use nahi karta: woh ICMPv6 mein chalne wala <b>Neighbor Discovery</b> use karta hai.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.50.0.20) 198.51.100.1 ko ping karta hai, jo uske /25 ke bahar hai. PC1 door wale host ka ARP nahi karta. Woh apne gateway 10.50.0.1 ka ARP karta hai, SW1 ke irb.10 ka MAC leta hai, aur frame us MAC par bhejta hai jabki IP destination 198.51.100.1 hi rehta hai. Phir SW1 uplink par apne next hop 10.50.0.194 ka ARP karta hai. Har ARP ek segment tak local hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> ARP table mein door ke server ka MAC dekhne ki ummeed. ARP mein sirf <b>directly connected</b> neighbours hote hain. Next hop ki incomplete ya missing ARP entry ka matlab layer 1 ya layer 2 problem hai (galat VLAN, link down), routing problem nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> PC se remote host ke liye nikalne wale frame ka destination MAC gateway ka MAC hota hai, server ka nahi. Aur broadcast MAC ff:ff:ff:ff:ff:ff hai; IPv4 limited broadcast 255.255.255.255 hai.</p></div>

<div class="scn"><h4>Router jo ARP nahi kar paaya</h4><p>Switch change ke baad R1 apne neighbour 10.50.0.193 ko ping nahi kar pa raha tha, jabki dono interfaces up the. <code>show arp</code> mein neighbour ki koi entry nahi thi. Engineer ne switch port check kiya aur woh galat VLAN mein nikla, isliye ARP broadcast neighbour tak pahunchta hi nahi tha. Port ko sahi VLAN mein daalte hi ARP resolve hua aur ping chal gaye. Routing kabhi problem thi hi nahi.</p><p><b>Lesson:</b> connected next hop ki ARP entry na ho to layer 1 ya layer 2 dekho.</p></div>

<div class="iv"><p class="q">"Host dusre subnet ke server ko ping karta hai. Pehle hop par frame mein kaunse MAC aur IP addresses hote hain?"</p><p>Source: host ka MAC aur IP. Destination MAC: default gateway ka MAC, jo ARP se mila. Destination IP: server ka address. Samjhao ki router har hop par MAC addresses badalta hai jabki IP addresses same rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet frame mein destination MAC, source MAC, EtherType, payload aur FCS hote hain.</li>
<li>Switch source MAC seekhte hain aur destination MAC se forward karte hain; unknown aur broadcast VLAN mein flood hote hain.</li>
<li>ARP local segment par next-hop IPv4 address ko MAC se jodta hai; IPv6 Neighbor Discovery use karta hai.</li>
<li>Verify ke liye show ethernet-switching table aur show arp no-resolve use karo.</li>
<li>Connected neighbour ki ARP entry na ho to layer 1 ya layer 2 problem hai.</li>
</ul></div>
`}};export{e as default};