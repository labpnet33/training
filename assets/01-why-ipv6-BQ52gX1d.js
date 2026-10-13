var e={id:`why-ipv6`,h:{en:`Why IPv6 exists and what changes`,hi:`IPv6 kyun bana aur kya badalta hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to read, write and shorten any IPv6 address, pick the right prefix length, recognise every address type at a glance, build an EUI-64 interface ID by hand, configure IPv6 on Cisco IOS routers, explain how Neighbor Discovery replaces ARP, choose between SLAAC and the two flavours of DHCPv6, build IPv6 static, default and floating routes, and troubleshoot a host that gets no IPv6 address. Three hands-on labs follow the text: <b>IPv6 addressing on router links</b>, <b>SLAAC and EUI-64</b>, and <b>IPv6 static, default and floating routes</b>.</p>
<p><b>Prerequisites.</b> You should be comfortable with the previous module, <b>IPv4 addressing and subnetting</b>: binary, prefix lengths, network and host bits. You should know the IOS CLI modes from the IOS module and what a MAC address and ICMP are. If binary still feels shaky, revise it first; IPv6 uses the same logic, only in hexadecimal.</p>

<h3>An analogy: a colony that ran out of plots</h3>
<p>Imagine a housing colony designed in the 1980s with room for about four billion plots. Nobody expected every family to want several houses, a shop and a dozen gadgets with their own postal address. The plots ran out. The colony's fix was to give a whole building one address at the gate, with a guard who receives every letter and walks it to the right flat. That guard is <b>NAT</b>. It works, but the guard must remember every conversation, strangers cannot send a letter straight to a flat, and when the guard is busy everything slows down.</p>
<p><b>IPv6</b> is the new colony next door. It has so many plots that every street gets more addresses than the whole old colony, and every device can have its own address again. No guard is needed for addressing.</p>

<h3>Why IPv4 ran out</h3>
<p>An IPv4 address is 32 bits, so there are 2<sup>32</sup> = 4,294,967,296 addresses, and a large part of that is reserved (private ranges, multicast, loopback, experimental). The central pool held by IANA was exhausted in <b>February 2011</b>, and the regional registries (APNIC for India and Asia-Pacific, then RIPE, LACNIC and ARIN) ran out in the years after. The industry kept IPv4 alive with CIDR, private addressing and NAT, and today many ISPs run <b>carrier-grade NAT (CGNAT)</b>, where thousands of customers share one public address. Each workaround adds state, logging and troubleshooting pain, and breaks true end-to-end connectivity.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="IPv4 versus IPv6 address size">
<text x="20" y="30" class="svg-ink" font-size="14">IPv4: 32 bits</text>
<rect x="150" y="14" width="80" height="26" rx="4" fill="#fed7aa"/><text x="190" y="32" text-anchor="middle" class="svg-ink" font-size="12">4.3 billion</text>
<text x="20" y="80" class="svg-ink" font-size="14">IPv6: 128 bits</text>
<rect x="150" y="64" width="160" height="26" rx="4" fill="#bae6fd"/><text x="230" y="82" text-anchor="middle" class="svg-ink" font-size="12">network prefix (64)</text>
<rect x="310" y="64" width="160" height="26" rx="4" fill="#bbf7d0"/><text x="390" y="82" text-anchor="middle" class="svg-ink" font-size="12">interface ID (64)</text>
<text x="490" y="82" class="svg-accent" font-size="12">3.4 x 10^38</text>
<text x="150" y="125" class="svg-muted" font-size="12">One /64 subnet alone holds 2^64 = 18.4 quintillion addresses,</text>
<text x="150" y="145" class="svg-muted" font-size="12">about 4 billion times the entire IPv4 Internet.</text>
</svg><p class="cap">IPv4 is four times shorter than IPv6, but the address space is 2^96 times smaller.</p></div>

<h3>What else changed besides the length</h3>
<p>IPv6 was not only a bigger address. The designers cleaned up the protocol while they were at it:</p>
<table class="cmp"><tr><th>Topic</th><th>IPv4</th><th>IPv6</th></tr>
<tr><td>Address size</td><td>32 bits, dotted decimal</td><td>128 bits, hexadecimal with colons</td></tr>
<tr><td>Broadcast</td><td>Yes (ARP, DHCP Discover)</td><td><b>None</b>; multicast replaces it</td></tr>
<tr><td>Finding a neighbour's MAC</td><td>ARP</td><td>Neighbor Discovery (ICMPv6)</td></tr>
<tr><td>Host addressing</td><td>Static or DHCP</td><td>Static, SLAAC, stateless or stateful DHCPv6</td></tr>
<tr><td>Header</td><td>20 to 60 bytes, has a checksum</td><td>Fixed 40 bytes, no checksum</td></tr>
<tr><td>Fragmentation</td><td>Routers and hosts</td><td>Only the source host; minimum link MTU 1280</td></tr>
<tr><td>Hop counter</td><td>TTL</td><td>Hop Limit</td></tr>
<tr><td>Addresses per interface</td><td>Usually one</td><td>Several: always a link-local, plus global ones</td></tr></table>

<h3>The IPv6 header in one look</h3>
<p>The base header has only eight fields: <b>Version</b> (6), <b>Traffic Class</b> (QoS marking, like DSCP), <b>Flow Label</b> (20 bits to tag a flow), <b>Payload Length</b>, <b>Next Header</b> (what follows: TCP 6, UDP 17, ICMPv6 58, or an extension header), <b>Hop Limit</b>, and the 128-bit <b>Source</b> and <b>Destination</b> addresses. Options moved out of the base header into optional <b>extension headers</b>, so routers can forward the fixed 40-byte header quickly.</p>

<div class="eg"><p><b>Worked example.</b> An ISP gives a company a <code>/48</code> prefix, for example <code>2001:db8:acad::/48</code>. Every LAN uses a <code>/64</code>. The company therefore has 64 minus 48 = 16 bits of subnet ID, which is 2<sup>16</sup> = <b>65,536 LANs</b>, each with 2<sup>64</sup> host addresses. With IPv4 the same company might get a single public address and NAT for everything.</p></div>

<h3>Where you will meet IPv6 at work</h3>
<ul>
<li><b>Mobile networks.</b> India is among the countries with the highest IPv6 adoption, largely because mobile operators turned it on for their subscribers. Your phone probably has a global IPv6 address right now.</li>
<li><b>Cloud.</b> Public clouds offer dual-stack networks, and some services are IPv6-first to save scarce IPv4.</li>
<li><b>Enterprise and data centre.</b> New builds are usually <b>dual stack</b>: IPv4 and IPv6 run side by side on the same interfaces (chapter 10).</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Thinking "IPv6 is just IPv4 with longer addresses". The addressing is similar in spirit, but there is no broadcast, no ARP, several addresses per interface, and hosts can configure themselves. Engineers who expect IPv4 behaviour spend hours looking for an ARP table that does not exist.</p></div>

<div class="exam"><p><b>Exam trap.</b> IPv6 has <b>no broadcast address</b>. Any answer that mentions an IPv6 broadcast is wrong. Also remember: the base header is a fixed 40 bytes, it has no header checksum, and <b>Hop Limit</b> replaces TTL.</p></div>

<div class="scn"><h4>The exam portal that blocked a whole city</h4><p>An online exam platform rate-limited logins per source IP address to stop password guessing. On exam day, hundreds of students on the same mobile operator were blocked together. The engineer checked the logs: all of them came from a handful of IPv4 addresses, because the operator used CGNAT and thousands of phones shared each public address. The platform team enabled IPv6 on the web front end. Phones that had IPv6 connected with their own global addresses, the rate limit applied per device again, and the complaints stopped.</p><p><b>Lesson:</b> NAT hides devices behind shared addresses. IPv6 restores one address per device, which makes security, logging and troubleshooting simpler.</p></div>

<div class="iv"><p class="q">"Why do we need IPv6 if NAT already solved the address shortage?"</p><p>Strong answer: NAT delayed the problem, it did not solve it. The IPv4 registries are empty, and CGNAT adds state, cost, logging requirements and breaks end-to-end connectivity for peer-to-peer, VoIP and inbound services. IPv6 gives a practically unlimited address space plus design improvements: no broadcast, a simpler fixed header, SLAAC and Neighbor Discovery. Mention that most networks run dual stack during the transition.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 has 2^32 addresses and the registries have run out; NAT and CGNAT are workarounds with real costs.</li>
<li>IPv6 addresses are 128 bits, usually split into a 64-bit prefix and a 64-bit interface ID.</li>
<li>IPv6 has no broadcast and no ARP; multicast and Neighbor Discovery replace them.</li>
<li>The base header is a fixed 40 bytes, has no checksum, and uses Hop Limit instead of TTL.</li>
<li>Most real networks run IPv4 and IPv6 together (dual stack).</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap koi bhi IPv6 address padh, likh aur chhota kar paoge, sahi prefix length chun paoge, har address type ko ek nazar mein pehchan paoge, EUI-64 interface ID haath se bana paoge, Cisco IOS routers par IPv6 configure kar paoge, samjha paoge ki Neighbor Discovery ARP ki jagah kaise leta hai, SLAAC aur DHCPv6 ke do flavours mein se chun paoge, IPv6 static, default aur floating routes bana paoge, aur us host ko troubleshoot kar paoge jise IPv6 address nahi mil raha. Text ke baad teen hands-on labs hain: <b>Router links par IPv6 addressing</b>, <b>SLAAC aur EUI-64</b>, aur <b>IPv6 static, default aur floating routes</b>.</p>
<p><b>Prerequisites.</b> Pichhle module, <b>IPv4 addressing aur subnetting</b>, ke saath aap comfortable hone chahiye: binary, prefix lengths, network aur host bits. IOS module se IOS CLI modes pata hone chahiye, aur MAC address aur ICMP kya hote hain yeh bhi. Agar binary abhi bhi kamzor lagti hai, to pehle use revise karo; IPv6 wahi logic use karta hai, bas hexadecimal mein.</p>

<h3>Ek analogy: ek colony jiske plots khatam ho gaye</h3>
<p>Socho 1980s mein ek housing colony design hui jismein lagbhag chaar billion plots ki jagah thi. Kisi ne socha nahi tha ki har family ko kai ghar, ek dukaan aur darjan bhar gadgets chahiye honge, sabka apna postal address. Plots khatam ho gaye. Colony ka jugaad tha poori building ko gate par ek address dena, aur ek guard jo har chitthi leta hai aur sahi flat tak pahunchata hai. Woh guard hai <b>NAT</b>. Kaam chalta hai, par guard ko har baatcheet yaad rakhni padti hai, ajnabi seedha flat ko chitthi nahi bhej sakte, aur guard busy ho to sab slow ho jaata hai.</p>
<p><b>IPv6</b> bagal wali nayi colony hai. Ismein itne plots hain ki har street ko poori purani colony se zyada addresses milte hain, aur har device ka phir se apna address ho sakta hai. Addressing ke liye kisi guard ki zaroorat nahi.</p>

<h3>IPv4 khatam kyun hua</h3>
<p>IPv4 address 32 bits ka hai, to 2<sup>32</sup> = 4,294,967,296 addresses hain, aur uska bada hissa reserved hai (private ranges, multicast, loopback, experimental). IANA ka central pool <b>February 2011</b> mein khatam ho gaya, aur regional registries (India aur Asia-Pacific ke liye APNIC, phir RIPE, LACNIC aur ARIN) agle saalon mein khatam ho gayin. Industry ne IPv4 ko CIDR, private addressing aur NAT se zinda rakha, aur aaj kai ISPs <b>carrier-grade NAT (CGNAT)</b> chalate hain, jahan hazaaron customers ek public address share karte hain. Har jugaad state, logging aur troubleshooting ka dard badhata hai, aur asli end-to-end connectivity tod deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="IPv4 aur IPv6 address size">
<text x="20" y="30" class="svg-ink" font-size="14">IPv4: 32 bits</text>
<rect x="150" y="14" width="80" height="26" rx="4" fill="#fed7aa"/><text x="190" y="32" text-anchor="middle" class="svg-ink" font-size="12">4.3 billion</text>
<text x="20" y="80" class="svg-ink" font-size="14">IPv6: 128 bits</text>
<rect x="150" y="64" width="160" height="26" rx="4" fill="#bae6fd"/><text x="230" y="82" text-anchor="middle" class="svg-ink" font-size="12">network prefix (64)</text>
<rect x="310" y="64" width="160" height="26" rx="4" fill="#bbf7d0"/><text x="390" y="82" text-anchor="middle" class="svg-ink" font-size="12">interface ID (64)</text>
<text x="490" y="82" class="svg-accent" font-size="12">3.4 x 10^38</text>
<text x="150" y="125" class="svg-muted" font-size="12">Sirf ek /64 subnet mein 2^64 = 18.4 quintillion addresses,</text>
<text x="150" y="145" class="svg-muted" font-size="12">poore IPv4 Internet se lagbhag 4 billion guna.</text>
</svg><p class="cap">IPv4 IPv6 se chaar guna chhota hai, par address space 2^96 guna chhota hai.</p></div>

<h3>Length ke alawa aur kya badla</h3>
<p>IPv6 sirf bada address nahi tha. Designers ne saath saath protocol ki safai bhi kar di:</p>
<table class="cmp"><tr><th>Topic</th><th>IPv4</th><th>IPv6</th></tr>
<tr><td>Address size</td><td>32 bits, dotted decimal</td><td>128 bits, colons ke saath hexadecimal</td></tr>
<tr><td>Broadcast</td><td>Haan (ARP, DHCP Discover)</td><td><b>Nahi</b>; multicast uski jagah leta hai</td></tr>
<tr><td>Neighbour ka MAC dhoondhna</td><td>ARP</td><td>Neighbor Discovery (ICMPv6)</td></tr>
<tr><td>Host addressing</td><td>Static ya DHCP</td><td>Static, SLAAC, stateless ya stateful DHCPv6</td></tr>
<tr><td>Header</td><td>20 se 60 bytes, checksum hota hai</td><td>Fixed 40 bytes, checksum nahi</td></tr>
<tr><td>Fragmentation</td><td>Routers aur hosts</td><td>Sirf source host; minimum link MTU 1280</td></tr>
<tr><td>Hop counter</td><td>TTL</td><td>Hop Limit</td></tr>
<tr><td>Har interface par addresses</td><td>Aam taur par ek</td><td>Kai: hamesha ek link-local, plus global wale</td></tr></table>

<h3>IPv6 header ek nazar mein</h3>
<p>Base header mein sirf aath fields hain: <b>Version</b> (6), <b>Traffic Class</b> (QoS marking, DSCP jaisa), <b>Flow Label</b> (flow ko tag karne ke liye 20 bits), <b>Payload Length</b>, <b>Next Header</b> (aage kya hai: TCP 6, UDP 17, ICMPv6 58, ya extension header), <b>Hop Limit</b>, aur 128-bit <b>Source</b> aur <b>Destination</b> addresses. Options base header se nikal kar optional <b>extension headers</b> mein chale gaye, isliye routers fixed 40-byte header ko jaldi forward kar sakte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek ISP company ko <code>/48</code> prefix deta hai, jaise <code>2001:db8:acad::/48</code>. Har LAN <code>/64</code> use karta hai. To company ke paas 64 minus 48 = 16 bits ka subnet ID hai, yaani 2<sup>16</sup> = <b>65,536 LANs</b>, har ek mein 2<sup>64</sup> host addresses. IPv4 mein wahi company shayad ek public address aur sab kuch ke liye NAT paati.</p></div>

<h3>Kaam par IPv6 aapko kahan milega</h3>
<ul>
<li><b>Mobile networks.</b> India sabse zyada IPv6 adoption wale deshon mein hai, mostly isliye ki mobile operators ne apne subscribers ke liye ise on kar diya. Aapke phone par shayad abhi global IPv6 address hai.</li>
<li><b>Cloud.</b> Public clouds dual-stack networks dete hain, aur kuch services scarce IPv4 bachane ke liye IPv6-first hain.</li>
<li><b>Enterprise aur data centre.</b> Naye builds aam taur par <b>dual stack</b> hote hain: IPv4 aur IPv6 same interfaces par saath saath chalte hain (chapter 10).</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki "IPv6 bas lambe addresses wala IPv4 hai". Addressing ka idea milta julta hai, par broadcast nahi hai, ARP nahi hai, ek interface par kai addresses hain, aur hosts khud ko configure kar sakte hain. Jo engineers IPv4 jaisa behaviour expect karte hain, woh ghanton aisi ARP table dhoondhte hain jo exist hi nahi karti.</p></div>

<div class="exam"><p><b>Exam trap.</b> IPv6 mein <b>koi broadcast address nahi</b> hai. Jo answer IPv6 broadcast ki baat kare, woh galat hai. Yeh bhi yaad rakho: base header fixed 40 bytes ka hai, usmein header checksum nahi hai, aur <b>Hop Limit</b> TTL ki jagah leta hai.</p></div>

<div class="scn"><h4>Exam portal jisne poora shehar block kar diya</h4><p>Ek online exam platform password guessing rokne ke liye har source IP address par logins rate-limit karta tha. Exam ke din, same mobile operator ke sainkdon students ek saath block ho gaye. Engineer ne logs dekhe: sab kuch mutthi bhar IPv4 addresses se aa rahe the, kyunki operator CGNAT use karta tha aur hazaaron phones har public address share kar rahe the. Platform team ne web front end par IPv6 enable kiya. Jin phones par IPv6 tha woh apne global addresses se connect hue, rate limit phir se har device par laga, aur complaints band ho gayin.</p><p><b>Seekh:</b> NAT devices ko shared addresses ke peeche chhupa deta hai. IPv6 phir se har device ko ek address deta hai, jisse security, logging aur troubleshooting aasaan hoti hai.</p></div>

<div class="iv"><p class="q">"Jab NAT ne address shortage solve kar diya, to IPv6 ki zaroorat kyun hai?"</p><p>Strong answer: NAT ne problem ko taala, solve nahi kiya. IPv4 registries khaali hain, aur CGNAT state, cost, logging requirements badhata hai aur peer-to-peer, VoIP aur inbound services ke liye end-to-end connectivity todta hai. IPv6 practically unlimited address space deta hai plus design improvements: broadcast nahi, simpler fixed header, SLAAC aur Neighbor Discovery. Batao ki transition ke dauraan zyada tar networks dual stack chalate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 mein 2^32 addresses hain aur registries khatam ho chuki hain; NAT aur CGNAT asli cost wale jugaad hain.</li>
<li>IPv6 addresses 128 bits ke hain, aam taur par 64-bit prefix aur 64-bit interface ID mein bante hain.</li>
<li>IPv6 mein broadcast aur ARP nahi hai; multicast aur Neighbor Discovery unki jagah lete hain.</li>
<li>Base header fixed 40 bytes ka hai, checksum nahi hai, aur TTL ki jagah Hop Limit use hota hai.</li>
<li>Zyada tar real networks IPv4 aur IPv6 saath chalate hain (dual stack).</li>
</ul></div>
`}};export{e as default};