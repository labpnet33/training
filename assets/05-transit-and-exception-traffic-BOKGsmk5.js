var e={id:`transit-and-exception-traffic`,h:{en:`Transit traffic versus exception traffic`,hi:`Transit traffic versus exception traffic`},body:{en:`
<p>Not all packets that arrive at a router are treated alike. Some simply pass through, and some need the router's brain. Knowing which is which explains why a lo0 filter protects the RE, why traceroute works and how to read PFE statistics. It is a favourite exam topic.</p>

<h3>An analogy: a toll plaza</h3>
<p>Think of a highway toll plaza. Most cars pass through the electronic lane without stopping: that is <b>transit traffic</b>. A few cars must stop at the office: someone wants directions, a driver wants to pay a fine, an officer wants to talk. Those are <b>exception traffic</b>: they leave the fast lane and go to the people inside. The fast lane is the PFE; the office is the RE.</p>

<h3>Transit traffic</h3>
<p>Transit traffic enters one interface and leaves another. The PFE looks up the destination in its forwarding table and forwards the packet in hardware. The RE never sees it and spends no CPU. A ping from PC1 to a server behind the router, a web page download across the router or video streaming through it are all transit traffic.</p>

<h3>Exception traffic</h3>
<p>Exception traffic needs the RE, so the PFE <b>punts</b> it over the internal link. Typical examples:</p>
<ul><li>Packets <b>addressed to the router itself</b>: ping to an interface or lo0 address, SSH, Telnet, SNMP, NTP.</li>
<li><b>Routing and control protocols</b>: OSPF hellos, BGP sessions, LACP, VRRP.</li>
<li>Packets whose <b>TTL expires</b> at this router: the RE builds the ICMP time-exceeded reply. This is how <b>traceroute</b> discovers each hop.</li>
<li>Packets with <b>IP options</b>, and packets that need an ICMP error from the router (no route, fragmentation needed).</li></ul>
<p>Since the RE is precious, exception traffic is rate-limited on its way up so a flood cannot overload the control plane.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Classify packets as transit or exception">
<rect x="10" y="90" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="120" text-anchor="middle" class="svg-ink" font-size="13">Packet arrives</text>
<rect x="190" y="90" width="150" height="50" rx="8" fill="#bae6fd"/><text x="265" y="112" text-anchor="middle" class="svg-ink" font-size="13">PFE lookup</text><text x="265" y="128" text-anchor="middle" class="svg-muted" font-size="11">destination?</text>
<line x1="140" y1="115" x2="190" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="450" y="20" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="540" y="45" text-anchor="middle" class="svg-ink" font-size="13">Transit</text><text x="540" y="63" text-anchor="middle" class="svg-muted" font-size="11">forward out another interface</text>
<rect x="450" y="160" width="180" height="70" rx="8" fill="#fecaca"/><text x="540" y="183" text-anchor="middle" class="svg-ink" font-size="13">Exception to RE</text><text x="540" y="201" text-anchor="middle" class="svg-muted" font-size="11">local address, OSPF, TTL=0</text><text x="540" y="217" text-anchor="middle" class="svg-muted" font-size="11">(punted over internal link)</text>
<line x1="340" y1="100" x2="450" y2="55" stroke="#16a34a" stroke-width="3"/><line x1="340" y1="130" x2="450" y2="190" stroke="#dc2626" stroke-width="3"/>
</svg><p class="cap">The PFE decides in hardware: most packets are transit; a few are punted.</p></div>

<h3>Seeing the difference in PFE statistics</h3>
<pre class="out">lab@R2-AGG&gt; show pfe statistics traffic
Packet Forwarding Engine transit traffic (forwarded in hardware):
  Transit packets forwarded                 :                  412
Packet Forwarding Engine local traffic statistics (exception traffic):
  Local packets input                       :                   96
  Local packets output                      :                   94
    of which TTL expired (sent to RE)       :                    3
    of which IP options (sent to RE)        :                    0
  Software input control plane drops        :                    0
  Software input high drops                 :                    0
Packet Forwarding Engine hardware discard statistics:
  Timeout                                   :                    0
  Normal discard                            :                    0
  Firewall discard                          :                    0
  Fabric drops                              :                    0</pre>
<p>Ping through the router raises <b>Transit packets forwarded</b>. Ping to the router raises <b>Local packets input</b>. A traceroute through the router raises <b>TTL expired</b> by one for the probe that dies on this hop.</p>

<h3>Why traceroute needs the RE</h3>
<p>Traceroute sends probes with TTL 1, 2, 3 and so on. Each router decrements the TTL; the router where it becomes zero discards the probe and sends back an ICMP time-exceeded message. That reply is created by the RE, so the PFE punts the dying packet. The routers on the path appear one by one. Packets that merely have a TTL greater than 1 are ordinary transit.</p>

<div class="eg"><p><b>Worked example.</b> PC1 pings SRV through R2 five times: 5 requests and 5 replies cross R2 in hardware, so transit packets increase by about 10, local packets input increases by zero. PC1 pings R2's loopback 10.255.0.2 five times: 5 requests go up to the RE and 5 replies come back down; Local packets input increases by 5.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing that a filter on lo0 blocks traffic going through the router; it does not, because transit traffic never reaches the RE. Believing that "ping to the router" and "ping through the router" are the same: only the first is exception traffic.</p></div>

<div class="exam"><p><b>Exam trap.</b> A packet addressed to <i>any</i> of the router's own addresses on any interface is exception traffic. A packet whose TTL expires on the router is also exception traffic, even though its destination is elsewhere.</p></div>

<div class="scn"><h4>The traceroute that looked like packet loss</h4><p>A user complained that traceroute through a core router showed stars on one hop, and suspected packet loss. Real traffic was fine. The engineer explained: the router's control-plane policy rate-limited the ICMP replies it generates (exception traffic), while the transit packets were forwarded normally. A ping to the final destination showed no loss. The stars were harmless.</p><p><b>Lesson:</b> do not judge forwarding quality by how a router answers packets addressed to it. Test through the router.</p></div>

<div class="iv"><p class="q">"Give examples of transit traffic and exception traffic on a router."</p><p>Transit: a user's HTTP session crossing the router, forwarded by the PFE alone. Exception: SSH or ping to the router, OSPF hellos, BGP, and packets whose TTL expires (traceroute). Add that exception traffic is punted to the RE over the internal link and is rate-limited, and that a lo0 filter only affects exception traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Transit traffic is forwarded by the PFE only; the RE does not see it.</li>
<li>Exception traffic is punted to the RE: local-address packets, routing protocols, TTL expiry, IP options.</li>
<li>Traceroute works because the RE answers expired-TTL probes.</li>
<li>show pfe statistics traffic shows transit forwarded, local input and TTL expired counters.</li>
<li>Test forwarding through the router, not to it.</li>
</ul></div>
`,hi:`
<p>Router par aane wale saare packets ke saath ek jaisa behaviour nahi hota. Kuch bas guzar jaate hain, aur kuch ko router ke dimaag ki zaroorat hoti hai. Yeh jaanne se samajh aata hai ki lo0 filter RE ko kyun bachata hai, traceroute kyun kaam karta hai aur PFE statistics kaise padhein. Yeh exam ka pasandeeda topic hai.</p>

<h3>Analogy: toll plaza</h3>
<p>Highway ka toll plaza socho. Zyadatar cars electronic lane se bina ruke guzar jaati hain: yeh <b>transit traffic</b> hai. Kuch cars ko office par rukna padta hai: kisi ko raasta poochna hai, kisi ko jurmana bharna hai, officer ko baat karni hai. Yeh <b>exception traffic</b> hai: yeh fast lane chhodkar andar baithe logon ke paas jaati hain. Fast lane PFE hai; office RE.</p>

<h3>Transit traffic</h3>
<p>Transit traffic ek interface se aata hai aur doosre se nikalta hai. PFE apni forwarding table mein destination dekhta hai aur hardware mein packet forward karta hai. RE ko pata nahi chalta aur CPU kharch nahi hota. PC1 se router ke peeche wale server ko ping, router ke aar-paar web page download ya video streaming sab transit traffic hain.</p>

<h3>Exception traffic</h3>
<p>Exception traffic ko RE chahiye, isliye PFE use internal link se <b>punt</b> karta hai. Typical examples:</p>
<ul><li><b>Router ke khud ke address</b> par aaye packets: interface ya lo0 address par ping, SSH, Telnet, SNMP, NTP.</li>
<li><b>Routing aur control protocols</b>: OSPF hellos, BGP sessions, LACP, VRRP.</li>
<li>Jin packets ka <b>TTL is router par khatam</b> hota hai: RE ICMP time-exceeded reply banata hai. Isi tarah <b>traceroute</b> har hop pehchanta hai.</li>
<li><b>IP options</b> wale packets, aur woh packets jinke liye router ko ICMP error banana hai (no route, fragmentation needed).</li></ul>
<p>RE keemti hai, isliye upar jaate exception traffic ka rate limit hota hai taaki flood control plane ko overload na kare.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Packets ko transit ya exception mein baantna">
<rect x="10" y="90" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="120" text-anchor="middle" class="svg-ink" font-size="13">Packet aaya</text>
<rect x="190" y="90" width="150" height="50" rx="8" fill="#bae6fd"/><text x="265" y="112" text-anchor="middle" class="svg-ink" font-size="13">PFE lookup</text><text x="265" y="128" text-anchor="middle" class="svg-muted" font-size="11">destination?</text>
<line x1="140" y1="115" x2="190" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="450" y="20" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="540" y="45" text-anchor="middle" class="svg-ink" font-size="13">Transit</text><text x="540" y="63" text-anchor="middle" class="svg-muted" font-size="11">doosre interface se forward</text>
<rect x="450" y="160" width="180" height="70" rx="8" fill="#fecaca"/><text x="540" y="183" text-anchor="middle" class="svg-ink" font-size="13">Exception, RE ko</text><text x="540" y="201" text-anchor="middle" class="svg-muted" font-size="11">local address, OSPF, TTL=0</text><text x="540" y="217" text-anchor="middle" class="svg-muted" font-size="11">(internal link se punt)</text>
<line x1="340" y1="100" x2="450" y2="55" stroke="#16a34a" stroke-width="3"/><line x1="340" y1="130" x2="450" y2="190" stroke="#dc2626" stroke-width="3"/>
</svg><p class="cap">PFE hardware mein faisla karta hai: zyadatar packets transit hain; kuch punt hote hain.</p></div>

<h3>PFE statistics mein fark dekhna</h3>
<pre class="out">lab@R2-AGG&gt; show pfe statistics traffic
Packet Forwarding Engine transit traffic (forwarded in hardware):
  Transit packets forwarded                 :                  412
Packet Forwarding Engine local traffic statistics (exception traffic):
  Local packets input                       :                   96
  Local packets output                      :                   94
    of which TTL expired (sent to RE)       :                    3
    of which IP options (sent to RE)        :                    0
  Software input control plane drops        :                    0
  Software input high drops                 :                    0
Packet Forwarding Engine hardware discard statistics:
  Timeout                                   :                    0
  Normal discard                            :                    0
  Firewall discard                          :                    0
  Fabric drops                              :                    0</pre>
<p>Router ke through ping <b>Transit packets forwarded</b> badhata hai. Router ko ping <b>Local packets input</b> badhata hai. Router ke through traceroute us probe ke liye <b>TTL expired</b> ek se badhata hai jo is hop par marta hai.</p>

<h3>Traceroute ko RE kyun chahiye</h3>
<p>Traceroute TTL 1, 2, 3 aur aise probes bhejta hai. Har router TTL ghatata hai; jis router par woh zero hota hai woh probe discard karta hai aur ICMP time-exceeded message wapas bhejta hai. Yeh reply RE banata hai, isliye PFE marta hua packet punt karta hai. Path ke routers ek-ek karke dikhte hain. Jin packets ka TTL 1 se zyada hai woh aam transit hain.</p>

<div class="eg"><p><b>Worked example.</b> PC1 R2 ke through SRV ko paanch baar ping karta hai: 5 requests aur 5 replies R2 ko hardware mein paar karte hain, to transit packets lagbhag 10 badhte hain, local packets input zero badhta hai. PC1 R2 ke loopback 10.255.0.2 ko paanch baar ping karta hai: 5 requests RE tak jaate hain aur 5 replies wapas neeche aate hain; Local packets input 5 badhta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Maan lena ki lo0 par filter router ke through jaate traffic ko block karta hai; nahi karta, kyunki transit traffic RE tak pahunchta hi nahi. "Router ko ping" aur "router ke through ping" ko ek hi maan lena: sirf pehla exception traffic hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Router ke <i>kisi bhi</i> interface par uske apne kisi bhi address ko aaya packet exception traffic hai. Jis packet ka TTL router par khatam ho woh bhi exception traffic hai, bhale hi uski destination kahin aur ho.</p></div>

<div class="scn"><h4>Traceroute jo packet loss jaisa dikha</h4><p>Ek user ne shikayat ki ki core router ke through traceroute ek hop par stars dikha raha hai, aur packet loss ka shak kiya. Asli traffic theek tha. Engineer ne samjhaya: router ki control-plane policy ne jo ICMP replies woh khud banata hai (exception traffic) unka rate limit kiya, jabki transit packets normal forward ho rahe the. Final destination ko ping mein koi loss nahi tha. Stars harmless the.</p><p><b>Lesson:</b> router khud ko aaye packets ka jawab kaise deta hai, usse forwarding quality mat judge karo. Router ke through test karo.</p></div>

<div class="iv"><p class="q">"Router par transit traffic aur exception traffic ke examples do."</p><p>Transit: router ke aar-paar user ka HTTP session, jo sirf PFE forward karta hai. Exception: router ko SSH ya ping, OSPF hellos, BGP, aur woh packets jinka TTL khatam hota hai (traceroute). Jodo ki exception traffic internal link se RE ko punt hota hai aur rate-limited hota hai, aur lo0 filter sirf exception traffic ko affect karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Transit traffic sirf PFE forward karta hai; RE ko dikhta nahi.</li>
<li>Exception traffic RE ko punt hota hai: local-address packets, routing protocols, TTL expiry, IP options.</li>
<li>Traceroute isliye chalta hai kyunki RE expired-TTL probes ka jawab deta hai.</li>
<li>show pfe statistics traffic transit forwarded, local input aur TTL expired counters dikhata hai.</li>
<li>Forwarding router ke through test karo, router ko nahi.</li>
</ul></div>
`}};export{e as default};