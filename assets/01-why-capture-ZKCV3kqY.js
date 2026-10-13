var e={id:`why-capture`,h:{en:`Why packet captures are the ground truth`,hi:`Packet captures ground truth kyun hote hain`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to decide where to capture traffic (on a host, with SPAN, with a TAP or on the router itself), apply capture and display filters, and read the three panes of a Wireshark-style viewer. You will recognise ARP, ICMP, TCP, UDP, DNS, DHCP and OSPF on the wire, tell a TCP reset from silence, read ICMP unreachable codes and traceroute, compare OSPF Hellos to find a mismatch, and follow a repeatable capture-based troubleshooting workflow. Every idea is practised in the three labs of this module.</p>

<p><b>Prerequisites.</b> You should be comfortable with the Cisco IOS CLI (user, privileged and configuration modes), IPv4 addressing and subnet masks, and the OSI and TCP/IP models from the earlier "Network models" module. Knowing what a switch, a router and a default gateway do is enough. OSPF configuration is taught in depth in the OSPFv2 module later in the track; here you only need to read OSPF Hellos, and this module explains every field you need.</p>

<h3>Start with an analogy: CCTV in a courier hub</h3>
<p>A parcel goes missing. The sender says "I definitely dispatched it". The receiver says "I never got it". The hub manager says "our system shows it was scanned". Three people, three opinions. Then someone pulls the CCTV footage of the loading dock and watches the parcel go onto the wrong truck. The argument ends, because the footage shows what <b>actually happened</b>, not what each system <b>believes</b> happened.</p>
<p>A <b>packet capture</b> is the CCTV footage of your network. It records every frame that crossed one point, bit for bit, with a timestamp. <code>show</code> commands, logs and user complaints are statements from witnesses. They are useful, but they are opinions: a router's <code>show ip route</code> tells you what it plans to do, not what it did with the packet that the user sent at 10:42.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three sources of truth">
<rect x="10" y="20" width="190" height="70" rx="8" fill="#fed7aa"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="14">User complaint</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">"SSH is broken"</text>
<rect x="225" y="20" width="190" height="70" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">show commands</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">what devices believe</text>
<rect x="440" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="14">Packet capture</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">what crossed the wire</text>
<line x1="200" y1="55" x2="225" y2="55" stroke="#64748b" stroke-width="2"/><line x1="415" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="120" width="520" height="70" rx="8" fill="#e2e8f0"/>
<text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">A capture answers three questions:</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">Did it leave?  Did it arrive?  What came back?</text>
</svg><p class="cap">Opinions become facts as you move right. The capture is the final judge.</p></div>

<h3>Why the wire beats every other source</h3>
<ul>
<li><b>It shows the conversation, not a summary.</b> A counter says 5 packets dropped. A capture shows <i>which</i> five, from whom, to whom, and what happened just before.</li>
<li><b>It shows both directions.</b> Most outages are one-way problems: the request arrives, the reply never comes back. A capture on the right link shows the missing half immediately.</li>
<li><b>It settles blame between teams.</b> "The firewall is blocking us" versus "the server is not listening" is ended by one screen: a TCP reset from the server, or silence.</li>
<li><b>It is vendor-neutral.</b> A SYN looks the same whether it came from Windows, Linux, a Cisco router or a phone.</li>
</ul>

<h3>What a capture cannot tell you</h3>
<p>A capture is honest but <b>local</b>: it sees only the link where you placed it. If you capture on the PC side of a router and see no reply, you still do not know whether the request died inside the router or the reply died on the way back. That is why the workflow in this module often captures at <b>two points</b> and compares them. A capture also does not see inside a device (routing decisions, ACL lookups) and cannot read encrypted payloads such as SSH or HTTPS contents, though the TCP and IP headers remain visible.</p>

<div class="eg"><p><b>Worked example.</b> Users report "the payroll app is down". The application team blames the network. You capture on a user's access port and filter on <code>dns || tcp.port == 443</code>. You see a DNS query for <code>payroll.corp.example</code> answered with <code>198.51.100.7</code>, then SYNs to 198.51.100.7 port 443 repeated at 1, 3 and 7 seconds with no answer. The server was moved to 198.51.100.40 last night, and the old DNS record was never updated. Two packets proved it was neither the switch nor the firewall: it was a stale DNS record. Total time: four minutes.</p></div>

<h3>The big picture of this module</h3>
<p>You will read packets from the bottom of the stack upwards, exactly as the viewer shows them: the frame and Ethernet header, then ARP or IP, then ICMP, TCP or UDP, then the application (DNS, DHCP) or routing protocol (OSPF). The three labs follow the same path:</p>
<table class="cmp"><tr><th>Lab</th><th>Topology</th><th>What you prove with the capture</th></tr>
<tr><td><b>Lab 1 · Capture ARP and ping</b></td><td>PC1 10.5.5.11, PC2 10.5.5.12, SW1, R1 10.5.5.1 with loopback 192.0.2.1</td><td>ARP broadcast, unicast reply (opcode 2), ICMP echo, gateway MAC for remote traffic</td></tr>
<tr><td><b>Lab 2 · Find the TCP reset</b></td><td>PC1 10.9.9.10, SW1, R1 10.9.9.1</td><td>Who sends the RST, from which port, and why SSH is refused</td></tr>
<tr><td><b>Lab 3 · Read the Hellos</b></td><td>R1, R2, R3 chain, links 10.0.12.0/30 and 10.0.23.0/30</td><td>Hello interval and Area ID mismatches that stop OSPF adjacencies</td></tr>
</table>

<div class="warn"><p><b>Common beginner mistake.</b> Seeing an empty packet list and concluding "no traffic". Often the capture was on the wrong link, it was paused, or a display filter hid everything. Always check the "Displayed: x/y" counter: 0/250 means your filter, not the network, is hiding the packets.</p></div>

<div class="exam"><p><b>Exam trap.</b> The CCNA does not test Wireshark menus. It tests protocol behaviour that you can see in a capture: ARP requests are broadcast and replies are unicast, a TCP connection opens with SYN, SYN-ACK, ACK, DHCP uses UDP 67 and 68, ICMP type 8 is echo request and type 0 is echo reply, and OSPF neighbours must agree on area, timers and mask. Learn the packets, not the buttons.</p></div>

<div class="scn"><h4>The firewall that was not guilty</h4><p>A branch could not reach a new web server, and the ticket had bounced between the firewall and server teams for two days. A network engineer placed a capture on the server's switch port using SPAN. SYNs from the branch arrived at the server port, and the server answered every one with RST, ACK from port 8443. The traffic had passed the firewall perfectly; the web service was listening on 8080 instead of 8443 after a configuration change. The server team fixed the listener in five minutes.</p><p><b>Lesson:</b> a capture close to the destination turns a blame game into a fact. A reset means the packet arrived and was refused by the host itself.</p></div>

<div class="iv"><p class="q">"Why would you take a packet capture instead of just using show commands?"</p><p>Strong answer: show commands tell me what a device believes and plans to do; a capture shows what really crossed the wire, in both directions, with timing. It proves whether a request left, whether it arrived and what came back: a reply, an ICMP error, a reset or nothing. I use show commands to form a hypothesis and a capture to prove it, and I capture at two points when I need to locate a drop. Mention that captures are local to the point where you take them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A packet capture is the record of what actually crossed one point of the network.</li>
<li>Show commands and logs are opinions; the capture is the evidence.</li>
<li>Every capture answers: did it leave, did it arrive, and what came back?</li>
<li>A capture is local: capture at two points to locate where a packet dies.</li>
<li>This module reads packets bottom-up, from Ethernet and ARP to TCP, DHCP, DNS and OSPF, using three labs.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap decide kar paoge ki traffic kahan capture karna hai (host par, SPAN se, TAP se ya router par hi), capture aur display filters laga paoge, aur Wireshark-style viewer ke teeno panes padh paoge. Aap wire par ARP, ICMP, TCP, UDP, DNS, DHCP aur OSPF pehchaan paoge, TCP reset aur khamoshi mein farak bata paoge, ICMP unreachable codes aur traceroute padh paoge, OSPF Hellos compare karke mismatch dhoondh paoge, aur ek repeatable capture-based troubleshooting workflow follow kar paoge. Har idea is module ki teen labs mein practice hota hai.</p>

<p><b>Prerequisites.</b> Aapko Cisco IOS CLI (user, privileged aur configuration modes), IPv4 addressing aur subnet masks, aur pichhle "Network models" module ke OSI aur TCP/IP models mein comfortable hona chahiye. Switch, router aur default gateway kya karte hain, itna pata hona kaafi hai. OSPF configuration track mein aage OSPFv2 module mein detail mein sikhaya jaata hai; yahan aapko sirf OSPF Hellos padhne hain, aur yeh module har zaroori field samjhata hai.</p>

<h3>Ek analogy se shuru karo: courier hub ka CCTV</h3>
<p>Ek parcel kho jaata hai. Sender kehta hai "maine pakka dispatch kiya tha". Receiver kehta hai "mujhe kabhi mila hi nahi". Hub manager kehta hai "hamara system dikhata hai ki scan hua tha". Teen log, teen opinions. Phir koi loading dock ki CCTV footage nikalta hai aur dekhta hai ki parcel galat truck par chadh gaya. Behes khatam, kyunki footage dikhati hai ki <b>asal mein kya hua</b>, na ki har system kya <b>maanta hai</b> ki hua.</p>
<p><b>Packet capture</b> aapke network ki CCTV footage hai. Yeh ek point se guzre har frame ko, bit by bit, timestamp ke saath record karta hai. <code>show</code> commands, logs aur user complaints gawahon ke bayaan hain. Kaam ke hain, lekin opinions hain: router ka <code>show ip route</code> batata hai ki woh kya karne wala hai, yeh nahi ki usne 10:42 par user ke bheje packet ke saath kya kiya.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Sach ke teen source">
<rect x="10" y="20" width="190" height="70" rx="8" fill="#fed7aa"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="14">User complaint</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">"SSH kharab hai"</text>
<rect x="225" y="20" width="190" height="70" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">show commands</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">devices kya maante hain</text>
<rect x="440" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="14">Packet capture</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">wire par kya guzra</text>
<line x1="200" y1="55" x2="225" y2="55" stroke="#64748b" stroke-width="2"/><line x1="415" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="120" width="520" height="70" rx="8" fill="#e2e8f0"/>
<text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">Capture teen sawaalon ka jawab deta hai:</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">Nikla?  Pahuncha?  Wapas kya aaya?</text>
</svg><p class="cap">Right ki taraf jaate hue opinions facts ban jaate hain. Capture aakhri judge hai.</p></div>

<h3>Wire har dusre source se behtar kyun hai</h3>
<ul>
<li><b>Yeh poori baatcheet dikhata hai, summary nahi.</b> Counter kehta hai 5 packets drop hue. Capture dikhata hai <i>kaunse</i> paanch, kisse, kisko, aur theek pehle kya hua.</li>
<li><b>Yeh dono directions dikhata hai.</b> Zyada tar outages one-way problems hote hain: request pahunchti hai, reply kabhi wapas nahi aata. Sahi link par capture missing aadha hissa turant dikha deta hai.</li>
<li><b>Yeh teams ke beech blame khatam karta hai.</b> "Firewall hamein block kar raha hai" versus "server listen nahi kar raha" ek screen se khatam hota hai: server se TCP reset, ya khamoshi.</li>
<li><b>Yeh vendor-neutral hai.</b> SYN same dikhta hai chahe Windows se aaye, Linux se, Cisco router se ya phone se.</li>
</ul>

<h3>Capture kya nahi bata sakta</h3>
<p>Capture imaandaar hai lekin <b>local</b> hai: yeh sirf wahi link dekhta hai jahan aapne use lagaya. Agar aap router ke PC side par capture karte ho aur reply nahi dikhta, to aapko abhi bhi nahi pata ki request router ke andar mari ya reply wapas aate hue mara. Isiliye is module ka workflow aksar <b>do points</b> par capture karke compare karta hai. Capture device ke andar bhi nahi dekhta (routing decisions, ACL lookups) aur SSH ya HTTPS jaise encrypted payloads nahi padh sakta, lekin TCP aur IP headers dikhte rehte hain.</p>

<div class="eg"><p><b>Worked example.</b> Users report karte hain "payroll app down hai". Application team network ko blame karti hai. Aap ek user ke access port par capture karte ho aur <code>dns || tcp.port == 443</code> filter lagate ho. Aapko <code>payroll.corp.example</code> ki DNS query dikhti hai jiska jawab <code>198.51.100.7</code> hai, phir 198.51.100.7 port 443 ko SYNs 1, 3 aur 7 seconds par repeat hote hain, koi jawab nahi. Server kal raat 198.51.100.40 par move hua tha, aur purana DNS record kabhi update nahi hua. Do packets ne prove kar diya ki na switch tha na firewall: stale DNS record tha. Kul time: chaar minute.</p></div>

<h3>Is module ki badi picture</h3>
<p>Aap packets ko stack ke neeche se upar padhoge, bilkul waise jaise viewer dikhata hai: frame aur Ethernet header, phir ARP ya IP, phir ICMP, TCP ya UDP, phir application (DNS, DHCP) ya routing protocol (OSPF). Teeno labs yahi raasta follow karti hain:</p>
<table class="cmp"><tr><th>Lab</th><th>Topology</th><th>Capture se aap kya prove karte ho</th></tr>
<tr><td><b>Lab 1 · ARP aur ping capture karo</b></td><td>PC1 10.5.5.11, PC2 10.5.5.12, SW1, R1 10.5.5.1 loopback 192.0.2.1 ke saath</td><td>ARP broadcast, unicast reply (opcode 2), ICMP echo, remote traffic ke liye gateway MAC</td></tr>
<tr><td><b>Lab 2 · TCP reset dhoondo</b></td><td>PC1 10.9.9.10, SW1, R1 10.9.9.1</td><td>RST kaun bhejta hai, kis port se, aur SSH kyun refuse hota hai</td></tr>
<tr><td><b>Lab 3 · Hellos padho</b></td><td>R1, R2, R3 chain, links 10.0.12.0/30 aur 10.0.23.0/30</td><td>Hello interval aur Area ID mismatches jo OSPF adjacencies rokte hain</td></tr>
</table>

<div class="warn"><p><b>Beginners ki common galti.</b> Khaali packet list dekh kar maan lena "traffic nahi hai". Aksar capture galat link par tha, pause tha, ya display filter ne sab chhupa diya. Hamesha "Displayed: x/y" counter check karo: 0/250 ka matlab hai aapka filter packets chhupa raha hai, network nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> CCNA Wireshark ke menus test nahi karta. Woh protocol behaviour test karta hai jo capture mein dikhta hai: ARP requests broadcast hote hain aur replies unicast, TCP connection SYN, SYN-ACK, ACK se khulta hai, DHCP UDP 67 aur 68 use karta hai, ICMP type 8 echo request hai aur type 0 echo reply, aur OSPF neighbours ko area, timers aur mask par agree karna padta hai. Packets seekho, buttons nahi.</p></div>

<div class="scn"><h4>Woh firewall jo doshi nahi tha</h4><p>Ek branch naye web server tak nahi pahunch pa rahi thi, aur ticket do din se firewall aur server teams ke beech ghoom raha tha. Ek network engineer ne SPAN use karke server ke switch port par capture lagaya. Branch ke SYNs server port tak pahunch rahe the, aur server har ek ka jawab port 8443 se RST, ACK de raha tha. Traffic firewall ko bilkul theek paar kar chuka tha; ek configuration change ke baad web service 8443 ki jagah 8080 par listen kar rahi thi. Server team ne paanch minute mein listener fix kar diya.</p><p><b>Seekh:</b> destination ke paas capture blame game ko fact mein badal deta hai. Reset ka matlab hai packet pahuncha aur host ne khud mana kiya.</p></div>

<div class="iv"><p class="q">"Sirf show commands ke bajaye aap packet capture kyun loge?"</p><p>Strong answer: show commands batate hain ki device kya maanta hai aur kya karne wala hai; capture dikhata hai ki wire par asal mein kya guzra, dono directions mein, timing ke saath. Yeh prove karta hai ki request nikli ya nahi, pahunchi ya nahi aur wapas kya aaya: reply, ICMP error, reset ya kuch nahi. Main show commands se hypothesis banata hoon aur capture se prove karta hoon, aur drop locate karna ho to do points par capture karta hoon. Yeh bhi batao ki capture usi point tak local hota hai jahan aap use lete ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet capture network ke ek point se asal mein guzri cheezon ka record hai.</li>
<li>Show commands aur logs opinions hain; capture saboot hai.</li>
<li>Har capture jawab deta hai: nikla, pahuncha, aur wapas kya aaya?</li>
<li>Capture local hota hai: packet kahan marta hai yeh dhoondhne ke liye do points par capture karo.</li>
<li>Yeh module packets ko neeche se upar padhta hai, Ethernet aur ARP se TCP, DHCP, DNS aur OSPF tak, teen labs ke saath.</li>
</ul></div>
`}};export{e as default};