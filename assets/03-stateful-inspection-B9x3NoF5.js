var e={id:`stateful-inspection`,h:{en:`Stateful inspection and the session table`,hi:`Stateful inspection aur session table`},body:{en:`
<p>The session table is the single most useful idea on a FortiGate. If you understand it, policy order, NAT and troubleshooting all become easy. Think of a restaurant cloakroom: when you hand over a coat you get a numbered ticket, and later only the person holding that ticket gets that coat back. The firewall hands out the ticket when it allows the first packet.</p>
<h3>What is a session?</h3>
<p>A <b>session</b> is the firewall's record of one conversation, identified by five values called the <b>5-tuple</b>: source IP, source port, destination IP, destination port and protocol. It also stores which policy allowed it, the ingress and egress interfaces, NAT details, counters and a timeout.</p>
<h3>The life of a packet through a FortiGate</h3>
<ol>
<li>A packet arrives on an interface. The FortiGate checks whether it belongs to an <b>existing session</b>. If yes, it is forwarded fast, with no policy lookup.</li>
<li>If no, this is a <b>new session</b>. The FortiGate does a <b>route lookup</b> to find the egress interface for the destination.</li>
<li>It then searches the <b>firewall policies from top to bottom</b> for the first one that matches ingress interface, egress interface, source, destination, service and schedule.</li>
<li>If a policy with action accept matches, the session is created (with NAT if enabled) and the packet is forwarded. If action is deny, or nothing matches, the packet is dropped (the <b>implicit deny</b>).</li>
<li>Return packets match the session and go back without a new policy check.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="The decision path for every packet"><rect x="10" y="60" width="100" height="50" rx="9" fill="#e2e8f0"/><text x="60" y="90" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text><line x1="110" y1="85" x2="150" y2="85" stroke="#64748b" stroke-width="2"/><rect x="150" y="50" width="110" height="70" rx="9" fill="#bae6fd"/><text x="205" y="82" text-anchor="middle" class="svg-ink" font-size="13">Session?</text><text x="205" y="99" text-anchor="middle" class="svg-muted" font-size="11">existing</text><line x1="260" y1="70" x2="300" y2="40" stroke="#64748b" stroke-width="2"/><text x="280" y="46" text-anchor="middle" class="svg-accent" font-size="11">yes</text><rect x="300" y="15" width="110" height="45" rx="9" fill="#bbf7d0"/><text x="355" y="42.5" text-anchor="middle" class="svg-ink" font-size="13">Forward fast</text><line x1="260" y1="100" x2="300" y2="125" stroke="#64748b" stroke-width="2"/><rect x="300" y="105" width="130" height="55" rx="9" fill="#fde68a"/><text x="365" y="129.5" text-anchor="middle" class="svg-ink" font-size="13">Route + policy</text><text x="365" y="146.5" text-anchor="middle" class="svg-muted" font-size="11">top to bottom</text><line x1="430" y1="130" x2="470" y2="130" stroke="#64748b" stroke-width="2"/><rect x="470" y="105" width="160" height="55" rx="9" fill="#ddd6fe"/><text x="550" y="129.5" text-anchor="middle" class="svg-ink" font-size="13">accept: new session</text><text x="550" y="146.5" text-anchor="middle" class="svg-muted" font-size="11">no match: drop</text><text x="205" y="142" text-anchor="middle" class="svg-accent" font-size="11">no</text></svg><p class="cap">The decision path for every packet</p></div>
<h3>Seeing a real session</h3>
<p>The simulator runs a FortiOS-style CLI. A PC at 10.0.1.10 pinged 8.8.8.8 through a FortiGate whose policy 1 allows LAN to WAN with NAT. Here is the real session entry (lines trimmed to the ones that matter):</p>
<pre class="code">NK-PUNE-FGT # diagnose sys session list</pre>
<pre class="out">session info: proto=1 proto_state=00 duration=0 expire=60 timeout=0 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
state=may_dirty
statistic(bytes/packets/allow_err): org=520/5/1 reply=520/5/1 tuples=2
orgin-&gt;sink: org pre-&gt;post, reply pre-&gt;post dev=4-&gt;3/3-&gt;4 gwy=203.0.113.1/10.0.1.10
<span class="hl">hook=post dir=org act=snat 10.0.1.10:19499-&gt;8.8.8.8:8(203.0.113.2:40001)</span>
hook=pre dir=reply act=dnat 8.8.8.8:40001-&gt;203.0.113.2:0(10.0.1.10:19499)
misc=0 <span class="hl">policy_id=1</span> pol_uuid_idx=15 auth_info=0 chk_client_info=0 vd=0
total session 1</pre>
<ul>
<li><code>proto=1</code> is ICMP; TCP is 6 and UDP is 17.</li>
<li><code>policy_id=1</code> proves which policy allowed it. If a user says "it is blocked", the first question is whether any session with the right policy exists.</li>
<li>The <code>hook=post dir=org act=snat</code> line shows source NAT rewriting 10.0.1.10 to the WAN address 203.0.113.2. The <code>reply</code> line shows the return translation.</li>
<li><code>expire=60</code> is the seconds left before an idle session ages out. Different protocols have different default timeouts, and TCP keeps sessions much longer.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> At 10:00 a user opens a TCP connection to a server; the first SYN creates a session and the policy is consulted once. For the next two hours thousands of packets flow without another policy lookup. At 10:30 an administrator edits the policy to deny that traffic. The existing session may continue until it ends or is cleared, which is why engineers sometimes run <code>diagnose sys session clear</code> after a policy change, on a lab or in a change window.</p></div>
<p>A packet that finds no policy never creates a session. Here is a network where a PC pings another VLAN but no policy permits it; the table stays empty and nothing is forwarded:</p>
<pre class="out">NK-PUNE-FGT # diagnose sys session list
total session 0</pre>
<div class="warn"><p><b>Common mistake.</b> Reading <code>total session 0</code> and concluding the firewall is broken. It often just means the packets never matched a policy, or never arrived. Check the route, then the policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order of operations: existing session first, then route lookup, then policy lookup top to bottom, first match wins. Do not say the firewall checks the policy for every packet.</p></div>
<div class="scn"><h4>The change that did not bite</h4><p>A security engineer changed a policy to block a chat application at 14:00, yet one user kept chatting until 16:00. The long-lived TCP session had been created under the old policy and kept flowing. The engineer cleared that user's sessions with a filter, and the next connection attempt was denied.</p><p><b>Lesson:</b> policy changes apply to new sessions; know how to look at and clear existing ones.</p></div>
<div class="iv"><p class="q">"How does a FortiGate process the first packet of a new connection?"</p><p>It looks for an existing session, finds none, does a route lookup to pick the egress interface, then walks the policy list from the top for the first match on ingress, egress, source, destination, service and schedule. If the action is accept it creates a session, applying NAT if configured; if no policy matches, the implicit deny drops it. Later packets in either direction match the session and skip the policy lookup.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A session is identified by the 5-tuple and stores policy, interfaces, NAT and timeout.</li>
<li>Existing session first, then route, then policy top to bottom.</li>
<li>Return packets follow the session without a new policy check.</li>
<li><code>diagnose sys session list</code> shows policy_id and NAT.</li>
</ul></div>
`,hi:`
<p>Session table FortiGate ka sabse kaam ka idea hai. Ise samajh liya to policy order, NAT aur troubleshooting sab aasaan ho jaate hain. Restaurant ke cloakroom ki tarah socho: coat dene par numbered ticket milta hai, aur baad mein sirf ticket wale ko coat wapas milta hai. Firewall pehla packet allow karte hi ticket de deta hai.</p>
<h3>Session kya hai?</h3>
<p><b>Session</b> firewall ka ek conversation ka record hai, jo paanch values se pehchana jaata hai jinhe <b>5-tuple</b> kehte hain: source IP, source port, destination IP, destination port aur protocol. Isme yeh bhi store hota hai ki kaunsi policy ne allow kiya, ingress aur egress interfaces, NAT details, counters aur timeout.</p>
<h3>FortiGate se guzarte packet ki zindagi</h3>
<ol>
<li>Packet ek interface par aata hai. FortiGate check karta hai ki woh <b>existing session</b> ka hai ya nahi. Haan to fast forward hota hai, policy lookup ke bina.</li>
<li>Nahi to yeh <b>naya session</b> hai. FortiGate destination ke liye egress interface dhoondhne ko <b>route lookup</b> karta hai.</li>
<li>Phir woh <b>firewall policies ko upar se neeche</b> dhoondhta hai pehli policy ke liye jo ingress interface, egress interface, source, destination, service aur schedule se match kare.</li>
<li>Action accept wali policy match ho to session ban jaata hai (NAT enable ho to NAT ke saath) aur packet forward hota hai. Action deny ho, ya kuch match na kare, to packet drop hota hai (<b>implicit deny</b>).</li>
<li>Return packets session se match karke bina naye policy check ke wapas jaate hain.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Har packet ka decision path"><rect x="10" y="60" width="100" height="50" rx="9" fill="#e2e8f0"/><text x="60" y="90" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text><line x1="110" y1="85" x2="150" y2="85" stroke="#64748b" stroke-width="2"/><rect x="150" y="50" width="110" height="70" rx="9" fill="#bae6fd"/><text x="205" y="82" text-anchor="middle" class="svg-ink" font-size="13">Session?</text><text x="205" y="99" text-anchor="middle" class="svg-muted" font-size="11">existing</text><line x1="260" y1="70" x2="300" y2="40" stroke="#64748b" stroke-width="2"/><text x="280" y="46" text-anchor="middle" class="svg-accent" font-size="11">yes</text><rect x="300" y="15" width="110" height="45" rx="9" fill="#bbf7d0"/><text x="355" y="42.5" text-anchor="middle" class="svg-ink" font-size="13">Forward fast</text><line x1="260" y1="100" x2="300" y2="125" stroke="#64748b" stroke-width="2"/><rect x="300" y="105" width="130" height="55" rx="9" fill="#fde68a"/><text x="365" y="129.5" text-anchor="middle" class="svg-ink" font-size="13">Route + policy</text><text x="365" y="146.5" text-anchor="middle" class="svg-muted" font-size="11">top to bottom</text><line x1="430" y1="130" x2="470" y2="130" stroke="#64748b" stroke-width="2"/><rect x="470" y="105" width="160" height="55" rx="9" fill="#ddd6fe"/><text x="550" y="129.5" text-anchor="middle" class="svg-ink" font-size="13">accept: new session</text><text x="550" y="146.5" text-anchor="middle" class="svg-muted" font-size="11">no match: drop</text><text x="205" y="142" text-anchor="middle" class="svg-accent" font-size="11">no</text></svg><p class="cap">Har packet ka decision path</p></div>
<h3>Asli session dekhna</h3>
<p>Simulator FortiOS-style CLI chalata hai. 10.0.1.10 ke ek PC ne FortiGate ke through 8.8.8.8 ko ping kiya, jiski policy 1 LAN se WAN ko NAT ke saath allow karti hai. Yeh asli session entry hai (sirf zaroori lines rakhi hain):</p>
<pre class="code">NK-PUNE-FGT # diagnose sys session list</pre>
<pre class="out">session info: proto=1 proto_state=00 duration=0 expire=60 timeout=0 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
state=may_dirty
statistic(bytes/packets/allow_err): org=520/5/1 reply=520/5/1 tuples=2
orgin-&gt;sink: org pre-&gt;post, reply pre-&gt;post dev=4-&gt;3/3-&gt;4 gwy=203.0.113.1/10.0.1.10
<span class="hl">hook=post dir=org act=snat 10.0.1.10:19499-&gt;8.8.8.8:8(203.0.113.2:40001)</span>
hook=pre dir=reply act=dnat 8.8.8.8:40001-&gt;203.0.113.2:0(10.0.1.10:19499)
misc=0 <span class="hl">policy_id=1</span> pol_uuid_idx=15 auth_info=0 chk_client_info=0 vd=0
total session 1</pre>
<ul>
<li><code>proto=1</code> ICMP hai; TCP 6 aur UDP 17 hai.</li>
<li><code>policy_id=1</code> saabit karta hai ki kaunsi policy ne allow kiya. User kahe "block ho raha hai" to pehla sawaal yeh ki sahi policy wala koi session hai ya nahi.</li>
<li><code>hook=post dir=org act=snat</code> line source NAT dikhati hai jo 10.0.1.10 ko WAN address 203.0.113.2 mein badalta hai. <code>reply</code> line wapsi ka translation dikhati hai.</li>
<li><code>expire=60</code> woh seconds hain jo idle session ke age out hone se pehle bache hain. Alag protocols ke alag default timeouts hote hain, aur TCP sessions bahut der tak rehte hain.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Subah 10:00 baje ek user server ke saath TCP connection kholta hai; pehla SYN session banata hai aur policy ek hi baar consult hoti hai. Agle do ghante hazaaron packets bina naye policy lookup ke guzarte hain. 10:30 par administrator policy ko deny kar deta hai. Maujooda session tab tak chal sakta hai jab tak khatam na ho ya clear na ho, isliye engineers policy change ke baad kabhi <code>diagnose sys session clear</code> chalate hain, lab mein ya change window ke dauran.</p></div>
<p>Jis packet ko policy nahi milti woh kabhi session nahi banata. Neeche woh network hai jahan PC doosre VLAN ko ping karta hai par koi policy permit nahi karti; table khali rehta hai aur kuch forward nahi hota:</p>
<pre class="out">NK-PUNE-FGT # diagnose sys session list
total session 0</pre>
<div class="warn"><p><b>Common mistake.</b> <code>total session 0</code> dekhkar maan lena ki firewall kharab hai. Aksar iska matlab hota hai ki packets kisi policy se match hi nahi hue, ya aaye hi nahi. Pehle route, phir policy check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order of operations: pehle existing session, phir route lookup, phir policy lookup upar se neeche, pehli match jeetti hai. Yeh mat kaho ki firewall har packet ke liye policy check karta hai.</p></div>
<div class="scn"><h4>Change jo lagu nahi hua</h4><p>Ek security engineer ne 14:00 baje chat application block karne ke liye policy badli, phir bhi ek user 16:00 tak chat karta raha. Lamba TCP session purani policy ke tehat bana tha aur chalta raha. Engineer ne filter se us user ke sessions clear kiye, aur agla connection attempt deny hua.</p><p><b>Lesson:</b> policy changes naye sessions par lagu hote hain; maujooda sessions dekhna aur clear karna aana chahiye.</p></div>
<div class="iv"><p class="q">"FortiGate naye connection ke pehle packet ko kaise process karta hai?"</p><p>Woh existing session dhoondhta hai, nahi milta, route lookup se egress interface chunta hai, phir policy list ko upar se chalkar ingress, egress, source, destination, service aur schedule par pehli match dhoondhta hai. Action accept ho to session banata hai, NAT configured ho to NAT lagakar; koi policy match na kare to implicit deny drop kar deta hai. Baad ke packets dono directions mein session se match karke policy lookup skip karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Session 5-tuple se pehchana jaata hai aur policy, interfaces, NAT aur timeout store karta hai.</li>
<li>Pehle existing session, phir route, phir policy upar se neeche.</li>
<li>Return packets bina naye policy check ke session ko follow karte hain.</li>
<li><code>diagnose sys session list</code> policy_id aur NAT dikhata hai.</li>
</ul></div>
`}};export{e as default};