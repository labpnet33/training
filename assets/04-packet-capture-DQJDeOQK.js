var e=`<svg viewBox="0 0 640 270" role="img" aria-label="Packet capture workflow and the three patterns: SYN without reply, SYN then RST, handshake then stall">
<rect x="15" y="20" width="130" height="60" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="12">vm-app 10.1.1.4</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="10">Network Watcher agent</text>
<rect x="195" y="20" width="130" height="60" rx="10" fill="#fde68a" stroke="#64748b"/><text x="260" y="46" text-anchor="middle" class="svg-ink" font-size="12">Capture session</text><text x="260" y="64" text-anchor="middle" class="svg-muted" font-size="10">filter + time limit</text>
<rect x="375" y="20" width="110" height="60" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="430" y="46" text-anchor="middle" class="svg-ink" font-size="12">Storage / file</text><text x="430" y="64" text-anchor="middle" class="svg-muted" font-size="10">.cap</text>
<rect x="525" y="20" width="100" height="60" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="575" y="46" text-anchor="middle" class="svg-ink" font-size="12">Wireshark</text><text x="575" y="64" text-anchor="middle" class="svg-muted" font-size="10">analyse</text>
<g stroke="#64748b" stroke-width="2"><line x1="145" y1="50" x2="195" y2="50"/><line x1="325" y1="50" x2="375" y2="50"/><line x1="485" y1="50" x2="525" y2="50"/></g>
<rect x="15" y="105" width="200" height="145" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="115" y="127" text-anchor="middle" class="svg-accent" font-size="12">A. SYN, no answer</text><text x="115" y="150" text-anchor="middle" class="svg-ink" font-size="11">10.1.1.4 &gt; 10.2.1.4 SYN</text><text x="115" y="168" text-anchor="middle" class="svg-ink" font-size="11">SYN (retransmit 1s)</text><text x="115" y="186" text-anchor="middle" class="svg-ink" font-size="11">SYN (retransmit 3s)</text><text x="115" y="214" text-anchor="middle" class="svg-muted" font-size="10">dropped: NSG, firewall, route</text>
<rect x="225" y="105" width="190" height="145" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="320" y="127" text-anchor="middle" class="svg-accent" font-size="12">B. SYN, then RST</text><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="11">10.1.1.4 &gt; 10.2.1.4 SYN</text><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="11">10.2.1.4 &gt; 10.1.1.4 RST</text><text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="10">arrived, nothing listening</text>
<rect x="425" y="105" width="200" height="145" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="525" y="127" text-anchor="middle" class="svg-accent" font-size="12">C. Handshake, then stall</text><text x="525" y="150" text-anchor="middle" class="svg-ink" font-size="11">SYN, SYN-ACK, ACK ok</text><text x="525" y="168" text-anchor="middle" class="svg-ink" font-size="11">big data packet retransmits</text><text x="525" y="186" text-anchor="middle" class="svg-ink" font-size="11">ICMP frag-needed missing</text><text x="525" y="214" text-anchor="middle" class="svg-muted" font-size="10">MTU / MSS problem</text>
</svg>`,t={id:`packet-capture`,h:{en:`Packet capture and reading the wire`,hi:`Packet capture aur wire padhna`},body:{en:`
<h3>When the tools disagree, look at the wire</h3>
<p>Next hop says the route is fine. IP flow verify says Allow. The firewall log shows nothing odd. The connection still fails. Now you need to see the actual packets. A <b>packet capture</b> records the traffic entering and leaving a VM's network interface. It is the "black box recorder" of networking: slower to use than the other tools, but it never guesses.</p>
<div class="dia">`+e+`<p class="cap">Top: the capture workflow. Bottom: three patterns that explain most failures.</p></div>

<h3>How Azure packet capture works</h3>
<ol>
<li>The VM must be running and have the <b>Network Watcher Agent extension</b> (it installs the capture components; verify current requirements before publishing).</li>
<li>You create a capture <b>session</b> on the VM with a time limit, a size limit and optional <b>filters</b> (protocol, local and remote IP and port).</li>
<li>The capture runs on the VM and writes a <code>.cap</code> file to a storage account, to a local path on the VM, or both.</li>
<li>You download the file and open it in Wireshark (or run tshark).</li>
</ol>
<pre class="code">az network watcher packet-capture create -g rg-spoke1 -n cap-app-db --vm vm-app --storage-account stlabcaptures --time-limit 120 --filters '[{"protocol":"TCP","remoteIPAddress":"10.2.1.4","remotePort":"1433"}]'
az network watcher packet-capture show-status -g rg-spoke1 -n cap-app-db -l centralindia
az network watcher packet-capture stop -g rg-spoke1 -n cap-app-db -l centralindia
az network watcher packet-capture delete -g rg-spoke1 -n cap-app-db -l centralindia</pre>
<pre class="out"><span class="c">Illustrative output</span>
PacketCaptureStatus   StopReason
Running               -
...later...
Stopped               <span class="hl">TimeExceeded</span></pre>
<p>Keep filters tight. A capture without filters on a busy VM produces a huge file, costs storage and is hard to read. Decide what to capture first: for a database timeout, TCP to port 1433 with the remote IP is enough. Time limits and size limits apply (verify the current maximums). Capturing can add a little load; do it briefly and delete the session when done. Handle captures as sensitive data, since they may contain credentials or personal data in clear text. Store them in a locked-down account and delete them after use.</p>

<h3>Start the capture, then reproduce</h3>
<p>The right order is: start capture, reproduce the problem once, stop capture. A capture of a problem that did not happen is useless. For intermittent problems, use a time window and note the exact time of the failure so that you can find it in the file.</p>

<h3>Three patterns you must recognise</h3>
<table class="cmp"><tr><th>What you see in the capture</th><th>What it means</th><th>Where to look next</th></tr>
<tr><td>Client SYNs repeating (1 s, 3 s, 7 s), no SYN-ACK</td><td>The SYN is dropped before the server answers. If you also capture on the server and see nothing arrive, it was dropped on the way</td><td>NSG, Azure Firewall, route (next hop), asymmetric path</td></tr>
<tr><td>SYN followed immediately by RST</td><td>The packet reached a host that actively refused: no process listening, or an OS firewall reject</td><td>Service status on the server, listening port, OS firewall</td></tr>
<tr><td>Handshake completes, then large packets retransmit or the connection stalls</td><td>MTU or MSS problem (common over VPN or tunnels); sometimes a middlebox dropping fragments</td><td>MTU, MSS clamp, ICMP fragmentation-needed</td></tr>
<tr><td>SYN-ACK arrives but the client never sends ACK</td><td>Asymmetric path: the reply took a different route, or a stateful device dropped it</td><td>Return route, UDRs, firewall in one direction only</td></tr>
<tr><td>Many duplicate ACKs, window size zero</td><td>The receiver is overloaded or slow, not the network</td><td>Server CPU, application</td></tr></table>
<p>Capture on <b>both ends</b> when you can. If the SYN leaves the client but never appears on the server NIC, the packet was lost in between. If it appears on the server and no reply leaves, the server or its OS dropped it.</p>
<pre class="out"><span class="c">Illustrative output (tshark summary)</span>
1  0.000  10.1.1.4 -&gt; 10.2.1.4  TCP 66  51022 &gt; 1433 [SYN]
2  1.001  10.1.1.4 -&gt; 10.2.1.4  TCP 66  [TCP Retransmission] 51022 &gt; 1433 [SYN]
3  3.003  10.1.1.4 -&gt; 10.2.1.4  TCP 66  [TCP Retransmission] 51022 &gt; 1433 [SYN]   <span class="hl">(no SYN-ACK)</span></pre>

<h3>VPN diagnostics: the gateway's own view</h3>
<p>For VPN issues the capture on a VM only shows part of the story. Network Watcher <b>VPN diagnostics</b> (and the gateway's diagnostic logs: IKE, tunnel and route diagnostics sent to Log Analytics) show negotiation failures, tunnel state changes and route changes. Gateway packet capture also exists for VPN gateways (verify availability), useful to see IKE exchanges and encapsulated traffic.</p>

<h3>Good habits</h3>
<ul>
<li>Write down source, destination, port, start time and stop time of the test.</li>
<li>Use the same clock: capture timestamps are UTC; note your own timezone.</li>
<li>Keep the finding: a screenshot of the Wireshark pattern in the ticket beats three paragraphs.</li>
<li>Delete the capture session and the file once the ticket is closed.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> capturing with no filters, forgetting the agent, capturing only one side, letting a capture run for days, and leaving credentials in a storage account that everyone can read.</p></div>
<div class="exam"><p><b>Exam trap:</b> packet capture is a Network Watcher feature that needs the VM extension, and it writes to storage or the local file. It is not a continuous monitor; use flow logs or Connection Monitor for history and trends.</p></div>

<div class="scn"><h4>Fifteen SYNs and a quiet server</h4><p>An application team blamed the network for random timeouts to a database. A capture on the app VM showed repeated SYNs with no SYN-ACK. A capture on the database VM at the same time showed no SYN arriving. The packet died in between. Next hop revealed an invalid route at the database subnet pointing at a decommissioned firewall IP; fixing the UDR ended the timeouts.</p><p><b>Lesson:</b> a capture on both ends tells you on which side the packet vanished.</p></div>

<div class="iv"><p class="q">"What do you look for in a capture when an application times out?"</p><p>Whether the SYN leaves, whether a SYN-ACK or RST returns, and whether the handshake completes and data stalls. No reply means a drop on the path (NSG, firewall, route); RST means arrival and active refusal; a stall after the handshake suggests MTU or MSS. Capture on both ends with tight filters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet capture needs the Network Watcher agent and writes a .cap file to storage or the VM.</li>
<li>Filter tightly, reproduce once, stop, and delete the session.</li>
<li>SYN without reply: drop. SYN then RST: refused. Stall after handshake: MTU or MSS.</li>
<li>Capture both ends to find where the packet vanished.</li>
<li>Treat captures as sensitive data.</li>
</ul></div>
`,hi:`
<h3>Tools alag baat kahein to wire dekho</h3>
<p>Next hop kehta hai route theek hai. IP flow verify kehta hai Allow. Firewall log mein kuch ajeeb nahi. Phir bhi connection fail hota hai. Ab asli packets dekhne padenge. <b>Packet capture</b> VM ke network interface mein aane aur jaane wala traffic record karta hai. Yeh networking ka "black box recorder" hai: doosre tools se dheema, par kabhi andaza nahi lagata.</p>
<div class="dia">`+e+`<p class="cap">Upar: capture workflow. Neeche: teen patterns jo zyadatar failures samjhate hain.</p></div>

<h3>Azure packet capture kaise kaam karta hai</h3>
<ol>
<li>VM running honi chahiye aur uspar <b>Network Watcher Agent extension</b> (yeh capture components install karta hai; current requirements publish se pehle verify karo).</li>
<li>Aap VM par time limit, size limit aur optional <b>filters</b> (protocol, local aur remote IP aur port) ke saath capture <b>session</b> banate ho.</li>
<li>Capture VM par chalta hai aur <code>.cap</code> file storage account, VM ke local path, ya dono mein likhta hai.</li>
<li>Aap file download karke Wireshark (ya tshark) mein kholte ho.</li>
</ol>
<pre class="code">az network watcher packet-capture create -g rg-spoke1 -n cap-app-db --vm vm-app --storage-account stlabcaptures --time-limit 120 --filters '[{"protocol":"TCP","remoteIPAddress":"10.2.1.4","remotePort":"1433"}]'
az network watcher packet-capture show-status -g rg-spoke1 -n cap-app-db -l centralindia
az network watcher packet-capture stop -g rg-spoke1 -n cap-app-db -l centralindia
az network watcher packet-capture delete -g rg-spoke1 -n cap-app-db -l centralindia</pre>
<pre class="out"><span class="c">Illustrative output</span>
PacketCaptureStatus   StopReason
Running               -
...baad mein...
Stopped               <span class="hl">TimeExceeded</span></pre>
<p>Filters tight rakho. Busy VM par bina filter ka capture bahut badi file banata hai, storage ka cost badhata hai aur padhna mushkil hota hai. Pehle decide karo kya capture karna hai: database timeout ke liye remote IP ke saath TCP port 1433 kaafi hai. Time limits aur size limits lagte hain (current maximums verify karo). Capture thoda load badha sakta hai; thodi der karo aur kaam hone par session delete karo. Captures ko sensitive data maano, kyunki unme credentials ya personal data clear text mein ho sakta hai. Unhe locked-down account mein rakho aur use ke baad delete karo.</p>

<h3>Capture shuru karo, phir reproduce karo</h3>
<p>Sahi order: capture start, problem ek baar reproduce, capture stop. Jo problem hui hi nahi uska capture bekaar hai. Intermittent problems ke liye time window use karo aur failure ka exact time note karo taaki file mein dhundh sako.</p>

<h3>Teen patterns jo pehchanne hain</h3>
<table class="cmp"><tr><th>Capture mein kya dikhta hai</th><th>Matlab</th><th>Aage kahan dekhein</th></tr>
<tr><td>Client SYNs repeat (1 s, 3 s, 7 s), SYN-ACK nahi</td><td>Server ke jawab dene se pehle SYN drop ho gaya. Server par bhi capture karo aur kuch aata na dikhe to raste mein drop hua</td><td>NSG, Azure Firewall, route (next hop), asymmetric path</td></tr>
<tr><td>SYN ke turant baad RST</td><td>Packet aisi host tak pahuncha jisne actively mana kiya: koi process nahi sun raha, ya OS firewall reject</td><td>Server par service status, listening port, OS firewall</td></tr>
<tr><td>Handshake poora, phir bade packets retransmit ya connection atak</td><td>MTU ya MSS problem (VPN ya tunnels par aam); kabhi fragments drop karne wala middlebox</td><td>MTU, MSS clamp, ICMP fragmentation-needed</td></tr>
<tr><td>SYN-ACK aata hai par client ACK nahi bhejta</td><td>Asymmetric path: reply doosre route se gaya, ya stateful device ne drop kiya</td><td>Return route, UDRs, firewall sirf ek direction mein</td></tr>
<tr><td>Bahut duplicate ACKs, window size zero</td><td>Receiver overloaded ya slow hai, network nahi</td><td>Server CPU, application</td></tr></table>
<p>Ho sake to <b>dono ends</b> par capture karo. SYN client se nikle par server NIC par na dikhe to packet beech mein kho gaya. Server par dikhe aur koi reply na nikle to server ya uske OS ne drop kiya.</p>
<pre class="out"><span class="c">Illustrative output (tshark summary)</span>
1  0.000  10.1.1.4 -&gt; 10.2.1.4  TCP 66  51022 &gt; 1433 [SYN]
2  1.001  10.1.1.4 -&gt; 10.2.1.4  TCP 66  [TCP Retransmission] 51022 &gt; 1433 [SYN]
3  3.003  10.1.1.4 -&gt; 10.2.1.4  TCP 66  [TCP Retransmission] 51022 &gt; 1433 [SYN]   <span class="hl">(SYN-ACK nahi)</span></pre>

<h3>VPN diagnostics: gateway ka apna nazariya</h3>
<p>VPN issues ke liye VM ka capture aadhi kahani hi dikhata hai. Network Watcher <b>VPN diagnostics</b> (aur gateway ke diagnostic logs: IKE, tunnel aur route diagnostics jo Log Analytics ko jaate hain) negotiation failures, tunnel state changes aur route changes dikhate hain. VPN gateways ke liye gateway packet capture bhi hota hai (availability verify karo), jo IKE exchanges aur encapsulated traffic dekhne ke kaam aata hai.</p>

<h3>Achhi aadatein</h3>
<ul>
<li>Test ka source, destination, port, start time aur stop time likho.</li>
<li>Same clock use karo: capture timestamps UTC mein hote hain; apna timezone note karo.</li>
<li>Finding rakho: ticket mein Wireshark pattern ka screenshot teen paragraphs se behtar hai.</li>
<li>Ticket band hone par capture session aur file delete karo.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> bina filter ke capture karna, agent bhool jaana, sirf ek side capture karna, capture ko dino chalne dena, aur credentials ko aise storage account mein chhodna jise sab padh sakte hain.</p></div>
<div class="exam"><p><b>Exam trap:</b> packet capture Network Watcher feature hai jise VM extension chahiye, aur woh storage ya local file mein likhta hai. Yeh continuous monitor nahi; history aur trends ke liye flow logs ya Connection Monitor use karo.</p></div>

<div class="scn"><h4>Pandrah SYNs aur chup server</h4><p>Ek application team ne database ke random timeouts ke liye network ko doshi thehraya. App VM ke capture mein repeated SYNs dikhe bina SYN-ACK ke. Usi samay database VM ke capture mein koi SYN aaya hi nahi. Packet beech mein mar gaya. Next hop ne database subnet par ek band kiye gaye firewall IP ko point karta invalid route dikhaya; UDR theek karne se timeouts band ho gaye.</p><p><b>Lesson:</b> dono ends ka capture batata hai ki packet kis side gayab hua.</p></div>

<div class="iv"><p class="q">"Application timeout ho raha ho to capture mein kya dekhte ho?"</p><p>SYN nikalta hai ya nahi, SYN-ACK ya RST wapas aata hai ya nahi, aur handshake poora hota hai aur data atakta hai ya nahi. Reply nahi matlab path par drop (NSG, firewall, route); RST matlab pahuncha aur actively mana kiya; handshake ke baad atakna MTU ya MSS ki taraf ishara karta hai. Dono ends par tight filters ke saath capture karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet capture ko Network Watcher agent chahiye aur woh .cap file storage ya VM mein likhta hai.</li>
<li>Tight filter, ek baar reproduce, stop, aur session delete.</li>
<li>SYN bina reply: drop. SYN phir RST: refused. Handshake ke baad atakna: MTU ya MSS.</li>
<li>Dono ends capture karo taaki pata chale packet kahan gayab hua.</li>
<li>Captures ko sensitive data maano.</li>
</ul></div>
`}};export{t as default};