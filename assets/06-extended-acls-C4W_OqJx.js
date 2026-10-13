var e={id:`extended`,h:{en:`Extended ACLs: protocols, ports and placement close to the source`,hi:`Extended ACLs: protocols, ports aur source ke paas placement`},body:{en:`
<p>Now upgrade the bouncer. The new one reads your whole ticket: where you came from, which hall you are going to, and whether you hold a seat for the concert or the comedy show. With that much information he can stand at the <b>main entrance</b> and still be exact: "Pune visitors with comedy tickets for Hall B: stop; everyone else: carry on." That is an <b>extended ACL</b>. Because it sees the destination and the service, it can sit close to the source and drop unwanted traffic before it wastes any bandwidth.</p>

<h3>What an extended ACL can match</h3>
<p>An extended IPv4 ACL can match: the <b>protocol</b>, the <b>source</b> address, the <b>destination</b> address, and for TCP and UDP the <b>source and destination ports</b>, plus extras such as ICMP message types and the TCP <code>established</code> flag. Numbered extended lists use 100 to 199 and 2000 to 2699; named ones are created with <code>ip access-list extended NAME</code>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Anatomy of an extended ACE">
<rect x="10" y="30" width="70" height="40" rx="6" fill="#e2e8f0"/><text x="45" y="55" text-anchor="middle" class="svg-ink" font-size="13">permit</text>
<rect x="86" y="30" width="50" height="40" rx="6" fill="#fde68a"/><text x="111" y="55" text-anchor="middle" class="svg-ink" font-size="13">tcp</text>
<rect x="142" y="30" width="170" height="40" rx="6" fill="#bbf7d0"/><text x="227" y="55" text-anchor="middle" class="svg-ink" font-size="13">192.168.40.0 0.0.0.255</text>
<rect x="318" y="30" width="150" height="40" rx="6" fill="#bae6fd"/><text x="393" y="55" text-anchor="middle" class="svg-ink" font-size="13">host 172.31.1.80</text>
<rect x="474" y="30" width="70" height="40" rx="6" fill="#ddd6fe"/><text x="509" y="55" text-anchor="middle" class="svg-ink" font-size="13">eq www</text>
<rect x="550" y="30" width="80" height="40" rx="6" fill="#fed7aa"/><text x="590" y="55" text-anchor="middle" class="svg-ink" font-size="13">[log]</text>
<text x="45" y="100" text-anchor="middle" class="svg-muted" font-size="12">action</text><text x="111" y="100" text-anchor="middle" class="svg-muted" font-size="12">protocol</text><text x="227" y="100" text-anchor="middle" class="svg-muted" font-size="12">source + wildcard</text><text x="393" y="100" text-anchor="middle" class="svg-muted" font-size="12">destination</text><text x="509" y="100" text-anchor="middle" class="svg-muted" font-size="12">dst port</text><text x="590" y="100" text-anchor="middle" class="svg-muted" font-size="12">options</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">A port written after the SOURCE is a source port;</text>
<text x="320" y="172" text-anchor="middle" class="svg-accent" font-size="13">a port written after the DESTINATION is a destination port.</text>
</svg><p class="cap">Read an extended entry left to right: action, protocol, source, destination, ports, options.</p></div>

<h3>Protocols</h3>
<p>The protocol keyword comes first: <code>ip</code> (any IPv4 packet, so all protocols), <code>tcp</code>, <code>udp</code>, <code>icmp</code>, <code>ospf</code>, <code>eigrp</code>, <code>gre</code>, <code>esp</code>, <code>ahp</code>, or a protocol number 0 to 255 (for example 89 is OSPF). Only <code>tcp</code> and <code>udp</code> accept port operators. <code>deny ip ...</code> blocks everything between those addresses, including TCP, UDP and ICMP.</p>

<h3>Port operators</h3>
<table class="cmp">
<tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
<tr><td><code>eq</code></td><td>Equal to</td><td><code>eq 22</code>, <code>eq www</code></td></tr>
<tr><td><code>neq</code></td><td>Not equal to</td><td><code>neq telnet</code></td></tr>
<tr><td><code>gt</code></td><td>Greater than</td><td><code>gt 1023</code> (all ephemeral ports)</td></tr>
<tr><td><code>lt</code></td><td>Less than</td><td><code>lt 1024</code> (well-known ports)</td></tr>
<tr><td><code>range</code></td><td>Inclusive range</td><td><code>range 16384 32767</code> (voice RTP)</td></tr>
</table>
<p>Common keywords IOS understands: TCP <code>www</code> (80), <code>telnet</code> (23), <code>smtp</code> (25), <code>ftp</code> (21), <code>pop3</code> (110), <code>bgp</code> (179); UDP <code>domain</code> (53), <code>bootps</code> (67), <code>bootpc</code> (68), <code>tftp</code> (69), <code>ntp</code> (123), <code>snmp</code> (161), <code>syslog</code> (514). On many IOS versions SSH and HTTPS have no keyword, so write <code>22</code> and <code>443</code>. IOS displays well-known numbers back as keywords, for example <code>eq 80</code> is shown as <code>eq www</code>.</p>

<h3>ICMP types and the established keyword</h3>
<p>For ICMP you can name the message: <code>echo</code> (ping request, type 8), <code>echo-reply</code> (type 0), <code>unreachable</code> (type 3), <code>time-exceeded</code> (type 11, used by traceroute). So you can allow replies to your own pings while blocking pings into you.</p>
<p>The <code>established</code> keyword matches TCP segments with the <b>ACK or RST</b> bit set, which is every TCP segment except the very first SYN of a connection. <code>permit tcp any 192.168.40.0 0.0.0.255 established</code> inbound from the internet lets replies to sessions opened from inside come back, while blocking new connections opened from outside. It is a crude, stateless trick, not a real firewall: it does not track sessions and does not help UDP.</p>

<h3>Placement rule: close to the source</h3>
<p>Because an extended ACL can be exact about the destination and the service, place it <b>as close to the source as possible</b>, usually inbound on the interface where that traffic enters the network. Unwanted packets are dropped at the first router, instead of crossing WAN links only to be dropped at the far end.</p>

<h3>Lab walkthrough: acl-extended</h3>
<p>Policy for the training lab 192.168.40.0/24 on R1: allow only HTTP and HTTPS to web server 172.31.1.80 and SSH to any device; block pings and everything else; leave the developer subnet 192.168.30.0/24 alone. Closest to the source is R1 Gi0/2 inbound.</p>
<pre class="code">R1(config)# access-list 110 remark TRAINING-LAB policy
R1(config)# access-list 110 deny icmp 192.168.40.0 0.0.0.255 any echo
R1(config)# access-list 110 permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq www
R1(config)# access-list 110 permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq 443
R1(config)# access-list 110 permit tcp 192.168.40.0 0.0.0.255 any eq 22
R1(config)# interface GigabitEthernet0/2
R1(config-if)# ip access-group 110 in</pre>
<p>The explicit deny of echo is technically redundant (the implicit deny would drop pings anyway), but it gives you a counter that proves pings are being blocked. Test from PC-LAB with <code>curl h&#116;tp://172.31.1.80</code>, <code>telnet 172.31.1.80 21</code>, <code>ping 172.31.1.80</code> and <code>ssh -l ops 10.0.0.2</code>, then check:</p>
<pre class="out">R1# show access-lists 110
Extended IP access list 110
    10 deny icmp 192.168.40.0 0.0.0.255 any echo <span class="hl">(5 matches)</span>
    20 permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq www <span class="hl">(9 matches)</span>
    30 permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq 443
    40 permit tcp 192.168.40.0 0.0.0.255 any eq 22 (24 matches)</pre>
<p>The FTP attempt matches nothing and dies on the implicit deny, which has no counter. PC-DEV is untouched because its packets enter on Gi0/0, where no ACL is applied.</p>

<div class="eg"><p><b>Worked example: source port or destination port?</b> A web client at 192.168.40.10 opens a connection from port 51514 to 172.31.1.80 port 80. Inbound on Gi0/2 the packet has source port 51514 and destination port 80. <code>permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq www</code> matches, because <code>eq www</code> sits after the destination. If you wrote <code>permit tcp 192.168.40.0 0.0.0.255 eq www host 172.31.1.80</code>, you would be matching <b>source</b> port 80, which a client never uses, and the web traffic would fall to the implicit deny.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing the port after the wrong address. It is the single most common extended-ACL bug, and the syntax is accepted. Read every entry aloud: "from these sources, to this destination, on this destination port".</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>deny tcp any any eq 23</code> blocks Telnet but not ping, because ping is ICMP. <code>deny ip ...</code> blocks all protocols. And <code>established</code> works only with TCP; there is no "established" for UDP or ICMP.</p></div>

<div class="scn"><h4>The DNS server nobody could use</h4><p>A branch engineer wrote an extended ACL to let clients reach an internal DNS server: <code>permit tcp 10.40.0.0 0.0.255.255 host 10.9.9.53 eq domain</code>, followed by other rules. Name resolution failed everywhere. <code>show access-lists</code> showed zero matches on that line. DNS queries use <b>UDP</b> 53 (TCP 53 is used mainly for large responses and zone transfers). Adding <code>permit udp 10.40.0.0 0.0.255.255 host 10.9.9.53 eq domain</code> above the other rules fixed it instantly.</p><p><b>Lesson:</b> match the right transport protocol. When in doubt, check which one the application really uses.</p></div>

<div class="iv"><p class="q">"What can an extended ACL match that a standard one cannot, and where do you place it?"</p><p>Strong answer: protocol, destination address, TCP and UDP source and destination ports with eq, neq, lt, gt and range, ICMP types and the established flag. Place it close to the source, inbound on the ingress interface, so unwanted traffic is dropped early. Bonus: explain that the port position decides whether it is a source or destination port.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Extended ACLs match protocol, source, destination, ports, ICMP types and TCP flags.</li>
<li>Numbered ranges: 100 to 199 and 2000 to 2699; named with <code>ip access-list extended NAME</code>.</li>
<li>A port after the source is a source port; after the destination it is a destination port.</li>
<li><code>established</code> matches TCP with ACK or RST set; it is stateless and TCP-only.</li>
<li>Place extended ACLs close to the source, inbound where the traffic enters.</li>
</ul></div>
`,hi:`
<p>Ab bouncer ko upgrade karo. Naya bouncer aapka poora ticket padhta hai: aap kahan se aaye, kis hall mein jaa rahe ho, aur aapki seat concert ki hai ya comedy show ki. Itni jaankari ke saath woh <b>main entrance</b> par khada hokar bhi exact reh sakta hai: "Pune ke visitors jinke paas Hall B ke comedy tickets hain: ruko; baaki sab: chalte raho." Yahi <b>extended ACL</b> hai. Kyunki yeh destination aur service dekh sakta hai, yeh source ke paas baith kar bekaar traffic ko bandwidth barbaad karne se pehle hi drop kar sakta hai.</p>

<h3>Extended ACL kya match kar sakta hai</h3>
<p>Extended IPv4 ACL match kar sakta hai: <b>protocol</b>, <b>source</b> address, <b>destination</b> address, aur TCP aur UDP ke liye <b>source aur destination ports</b>, plus extras jaise ICMP message types aur TCP ka <code>established</code> flag. Numbered extended lists 100 se 199 aur 2000 se 2699 use karti hain; named wali <code>ip access-list extended NAME</code> se banti hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Extended ACE ki anatomy">
<rect x="10" y="30" width="70" height="40" rx="6" fill="#e2e8f0"/><text x="45" y="55" text-anchor="middle" class="svg-ink" font-size="13">permit</text>
<rect x="86" y="30" width="50" height="40" rx="6" fill="#fde68a"/><text x="111" y="55" text-anchor="middle" class="svg-ink" font-size="13">tcp</text>
<rect x="142" y="30" width="170" height="40" rx="6" fill="#bbf7d0"/><text x="227" y="55" text-anchor="middle" class="svg-ink" font-size="13">192.168.40.0 0.0.0.255</text>
<rect x="318" y="30" width="150" height="40" rx="6" fill="#bae6fd"/><text x="393" y="55" text-anchor="middle" class="svg-ink" font-size="13">host 172.31.1.80</text>
<rect x="474" y="30" width="70" height="40" rx="6" fill="#ddd6fe"/><text x="509" y="55" text-anchor="middle" class="svg-ink" font-size="13">eq www</text>
<rect x="550" y="30" width="80" height="40" rx="6" fill="#fed7aa"/><text x="590" y="55" text-anchor="middle" class="svg-ink" font-size="13">[log]</text>
<text x="45" y="100" text-anchor="middle" class="svg-muted" font-size="12">action</text><text x="111" y="100" text-anchor="middle" class="svg-muted" font-size="12">protocol</text><text x="227" y="100" text-anchor="middle" class="svg-muted" font-size="12">source + wildcard</text><text x="393" y="100" text-anchor="middle" class="svg-muted" font-size="12">destination</text><text x="509" y="100" text-anchor="middle" class="svg-muted" font-size="12">dst port</text><text x="590" y="100" text-anchor="middle" class="svg-muted" font-size="12">options</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">SOURCE ke baad likha port source port hai;</text>
<text x="320" y="172" text-anchor="middle" class="svg-accent" font-size="13">DESTINATION ke baad likha port destination port hai.</text>
</svg><p class="cap">Extended entry ko left se right padho: action, protocol, source, destination, ports, options.</p></div>

<h3>Protocols</h3>
<p>Protocol keyword sabse pehle aata hai: <code>ip</code> (koi bhi IPv4 packet, yaani saare protocols), <code>tcp</code>, <code>udp</code>, <code>icmp</code>, <code>ospf</code>, <code>eigrp</code>, <code>gre</code>, <code>esp</code>, <code>ahp</code>, ya 0 se 255 tak protocol number (jaise 89 OSPF hai). Sirf <code>tcp</code> aur <code>udp</code> port operators accept karte hain. <code>deny ip ...</code> un addresses ke beech sab kuch block karta hai, TCP, UDP aur ICMP samet.</p>

<h3>Port operators</h3>
<table class="cmp">
<tr><th>Operator</th><th>Matlab</th><th>Example</th></tr>
<tr><td><code>eq</code></td><td>Barabar</td><td><code>eq 22</code>, <code>eq www</code></td></tr>
<tr><td><code>neq</code></td><td>Barabar nahi</td><td><code>neq telnet</code></td></tr>
<tr><td><code>gt</code></td><td>Se bada</td><td><code>gt 1023</code> (saare ephemeral ports)</td></tr>
<tr><td><code>lt</code></td><td>Se chhota</td><td><code>lt 1024</code> (well-known ports)</td></tr>
<tr><td><code>range</code></td><td>Inclusive range</td><td><code>range 16384 32767</code> (voice RTP)</td></tr>
</table>
<p>IOS jo common keywords samajhta hai: TCP <code>www</code> (80), <code>telnet</code> (23), <code>smtp</code> (25), <code>ftp</code> (21), <code>pop3</code> (110), <code>bgp</code> (179); UDP <code>domain</code> (53), <code>bootps</code> (67), <code>bootpc</code> (68), <code>tftp</code> (69), <code>ntp</code> (123), <code>snmp</code> (161), <code>syslog</code> (514). Kai IOS versions mein SSH aur HTTPS ka keyword nahi hai, isliye <code>22</code> aur <code>443</code> likho. IOS well-known numbers ko wapas keywords ki tarah dikhata hai, jaise <code>eq 80</code> <code>eq www</code> dikhta hai.</p>

<h3>ICMP types aur established keyword</h3>
<p>ICMP ke liye aap message ka naam le sakte ho: <code>echo</code> (ping request, type 8), <code>echo-reply</code> (type 0), <code>unreachable</code> (type 3), <code>time-exceeded</code> (type 11, traceroute use karta hai). Isliye aap apne pings ke replies allow kar sakte ho jabki aapki taraf aane wale pings block karo.</p>
<p><code>established</code> keyword un TCP segments ko match karta hai jinmein <b>ACK ya RST</b> bit set ho, yaani connection ke bilkul pehle SYN ke alawa har TCP segment. Internet se inbound <code>permit tcp any 192.168.40.0 0.0.0.255 established</code> andar se khule sessions ke replies wapas aane deta hai, jabki bahar se khole gaye naye connections block karta hai. Yeh ek kachcha, stateless trick hai, asli firewall nahi: yeh sessions track nahi karta aur UDP mein madad nahi karta.</p>

<h3>Placement rule: source ke paas</h3>
<p>Kyunki extended ACL destination aur service ke baare mein exact ho sakta hai, use <b>jitna ho sake source ke paas</b> lagao, aam taur par us interface par inbound jahan woh traffic network mein ghusta hai. Bekaar packets pehle hi router par drop ho jaate hain, WAN links cross karke door wale end par drop hone ki bajaye.</p>

<h3>Lab walkthrough: acl-extended</h3>
<p>R1 par training lab 192.168.40.0/24 ki policy: sirf web server 172.31.1.80 par HTTP aur HTTPS aur kisi bhi device par SSH allow; pings aur baaki sab block; developer subnet 192.168.30.0/24 ko mat chhedo. Source ke sabse paas R1 Gi0/2 inbound hai.</p>
<pre class="code">R1(config)# access-list 110 remark TRAINING-LAB policy
R1(config)# access-list 110 deny icmp 192.168.40.0 0.0.0.255 any echo
R1(config)# access-list 110 permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq www
R1(config)# access-list 110 permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq 443
R1(config)# access-list 110 permit tcp 192.168.40.0 0.0.0.255 any eq 22
R1(config)# interface GigabitEthernet0/2
R1(config-if)# ip access-group 110 in</pre>
<p>Echo ka explicit deny technically redundant hai (implicit deny waise bhi pings drop kar deta), par yeh aapko ek counter deta hai jo prove karta hai ki pings block ho rahe hain. PC-LAB se <code>curl h&#116;tp://172.31.1.80</code>, <code>telnet 172.31.1.80 21</code>, <code>ping 172.31.1.80</code> aur <code>ssh -l ops 10.0.0.2</code> se test karo, phir check karo:</p>
<pre class="out">R1# show access-lists 110
Extended IP access list 110
    10 deny icmp 192.168.40.0 0.0.0.255 any echo <span class="hl">(5 matches)</span>
    20 permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq www <span class="hl">(9 matches)</span>
    30 permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq 443
    40 permit tcp 192.168.40.0 0.0.0.255 any eq 22 (24 matches)</pre>
<p>FTP attempt kuch match nahi karta aur implicit deny par mar jaata hai, jiska koi counter nahi. PC-DEV par koi asar nahi kyunki uske packets Gi0/0 par aate hain, jahan koi ACL apply nahi hai.</p>

<div class="eg"><p><b>Worked example: source port ya destination port?</b> 192.168.40.10 par ek web client port 51514 se 172.31.1.80 port 80 tak connection kholta hai. Gi0/2 par inbound packet ka source port 51514 aur destination port 80 hai. <code>permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq www</code> match karta hai, kyunki <code>eq www</code> destination ke baad hai. Agar aap <code>permit tcp 192.168.40.0 0.0.0.255 eq www host 172.31.1.80</code> likhte, to aap <b>source</b> port 80 match kar rahe hote, jo client kabhi use nahi karta, aur web traffic implicit deny mein gir jaata.</p></div>

<div class="warn"><p><b>Common galti.</b> Port ko galat address ke baad likhna. Yeh sabse common extended-ACL bug hai, aur syntax accept ho jaata hai. Har entry zor se padho: "in sources se, is destination tak, is destination port par".</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>deny tcp any any eq 23</code> Telnet block karta hai par ping nahi, kyunki ping ICMP hai. <code>deny ip ...</code> saare protocols block karta hai. Aur <code>established</code> sirf TCP ke saath kaam karta hai; UDP ya ICMP ke liye koi "established" nahi hai.</p></div>

<div class="scn"><h4>DNS server jise koi use nahi kar paaya</h4><p>Ek branch engineer ne clients ko internal DNS server tak pahunchane ke liye extended ACL likha: <code>permit tcp 10.40.0.0 0.0.255.255 host 10.9.9.53 eq domain</code>, uske baad doosre rules. Har jagah name resolution fail hua. <code>show access-lists</code> ne us line par zero matches dikhaye. DNS queries <b>UDP</b> 53 use karti hain (TCP 53 mainly bade responses aur zone transfers ke liye hai). Doosre rules ke upar <code>permit udp 10.40.0.0 0.0.255.255 host 10.9.9.53 eq domain</code> jodne se turant theek ho gaya.</p><p><b>Seekh:</b> sahi transport protocol match karo. Doubt ho to check karo ki application asal mein kaunsa use karti hai.</p></div>

<div class="iv"><p class="q">"Extended ACL kya match kar sakta hai jo standard nahi kar sakta, aur use kahan lagate ho?"</p><p>Strong answer: protocol, destination address, eq, neq, lt, gt aur range ke saath TCP aur UDP source aur destination ports, ICMP types aur established flag. Ise source ke paas lagao, ingress interface par inbound, taaki bekaar traffic jaldi drop ho. Bonus: samjhao ki port ki position decide karti hai ki woh source port hai ya destination port.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Extended ACLs protocol, source, destination, ports, ICMP types aur TCP flags match karte hain.</li>
<li>Numbered ranges: 100 se 199 aur 2000 se 2699; named <code>ip access-list extended NAME</code> se.</li>
<li>Source ke baad port source port hai; destination ke baad destination port.</li>
<li><code>established</code> ACK ya RST set wale TCP ko match karta hai; yeh stateless aur sirf TCP ke liye hai.</li>
<li>Extended ACLs source ke paas lagao, wahan inbound jahan traffic ghusta hai.</li>
</ul></div>
`}};export{e as default};