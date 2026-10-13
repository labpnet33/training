var e={id:`troubleshooting`,h:{en:`BGP troubleshooting workflow: from session to policy`,hi:`BGP troubleshooting workflow: session se policy tak`},body:{en:`
<p>A BGP ticket usually reads "I cannot reach X" or "a customer sees a route it should not". Do not guess. Walk the same funnel every time. Each step eliminates a whole class of causes and tells you which command to run next.</p>

<h3>The five-step funnel</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Troubleshooting funnel">
<rect x="20" y="15" width="600" height="36" rx="8" fill="#bae6fd"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">1 Session: show bgp summary (Established? Idle, Active, Connect?)</text>
<rect x="55" y="62" width="530" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">2 Received: show route receive-protocol bgp PEER</text>
<rect x="90" y="109" width="460" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">3 Usable: show route hidden, show route detail (next hop?)</text>
<rect x="125" y="156" width="390" height="36" rx="8" fill="#fde68a"/><text x="320" y="179" text-anchor="middle" class="svg-ink" font-size="13">4 Chosen: attributes, best-path order</text>
<rect x="160" y="203" width="320" height="22" rx="8" fill="#fed7aa"/><text x="320" y="219" text-anchor="middle" class="svg-ink" font-size="12">5 Sent: show route advertising-protocol bgp</text>
</svg><p class="cap">Five steps, each narrower than the last.</p></div>
<ol>
<li><b>Session.</b> <code>show bgp summary</code>. <i>Idle</i> usually means a configuration fault (wrong AS, no route to peer, policy error); <i>Connect</i> or <i>Active</i> means TCP is not completing (no reachability, wrong address, firewall, one side passive); <i>OpenSent</i> and <i>OpenConfirm</i> mean the OPEN exchange is failing (AS mismatch, authentication, hold time). <code>show bgp neighbor X</code> has Last State, Last Event and Last Error.</li>
<li><b>Received.</b> <code>show route receive-protocol bgp X</code> lists what the neighbour sent. If the prefix is missing, the problem is on the sender or in transit.</li>
<li><b>Usable.</b> <code>show route hidden</code> lists routes that arrived but cannot be used, normally because the protocol next hop does not resolve. This is the classic IBGP and route-reflector fault.</li>
<li><b>Chosen.</b> <code>show route PREFIX detail</code> shows local preference, AS path, communities, next hop and the reason a path is not active.</li>
<li><b>Sent.</b> <code>show route advertising-protocol bgp X</code> shows exactly what leaves after all export policies. Compare it with what you intended.</li>
</ol>

<h3>Ticket 1: clients have no route (route-reflector lab)</h3>
<p>Before RR1 is configured, C2 and C3 have no route to the ISP prefix 203.0.113.0/24. Step 1 reveals it:</p>
<pre class="out">lab@C2&gt; show bgp summary
Groups: 1 Peers: 1 Down peers: 1
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.100.255.1          65100          0          0       0       0           0 <span class="hl">Active</span>

lab@C2&gt; show route 203.0.113.0/24
inet.0: 9 destinations, 9 routes (9 active, 0 holddown, 0 hidden)</pre>
<p>The peer is Active: C2 is trying, but RR1 has no BGP configuration, so nobody answers. The fix is the CLIENTS group on RR1 from chapter 5. After commit all three sessions are Established and C3 shows the route with Originator ID 10.100.255.11. Always read <i>which side</i> is silent before touching the client.</p>

<h3>Ticket 2: PEER sees a prefix it should not (community lab)</h3>
<p>The settlement-free peer should receive customer routes only. Before the export policy, R2 advertises the upstream's route too:</p>
<pre class="out">lab@R2&gt; show route advertising-protocol bgp 100.70.3.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.60.1.0/24            Self                                    [65200] 64512 I
* 10.60.2.0/24            Self                                    [65200] 64512 I
<span class="hl">* 203.0.113.0/24          Self                                    [65200] 64499 I</span></pre>
<p>Step 5 shows the leak immediately: 203.0.113.0/24 came from the upstream (AS 64499). The group PEERING has no export policy, so the default exports every active BGP route. The fix is community-based: tag with import policies, then attach PEER-OUT (accept CUSTOMER, reject the rest). Verify again: the advertisement now lists only the two customer prefixes, and on PEER <code>show route</code> no longer contains 203.0.113.0/24.</p>
<p>If a prefix with the CUSTOMER tag is still missing, check <code>show route community no-export</code>: a no-export tag stops advertisement towards an external peer whatever the policy says. In the lab it is 10.60.99.0/24.</p>

<h3>Ticket 3: a session that dropped after a merger (local-as lab)</h3>
<p>After B1 moved into AS 65300, <code>show bgp summary</code> showed 100.67.1.1 as Idle. <code>show bgp neighbor 100.67.1.1</code> showed <code>Local: 0.0.0.0 AS 65300</code> and no LocalAS option. On the upstream UPB the peer 100.67.1.2 was also Idle with one flap, because UPB expects AS 64520 in the OPEN. Adding <code>local-as 64520</code> to group UP brought it back and the neighbour output showed <code>Local AS: 64520 Local System AS: 65300</code>. Lesson: after an AS change always check the peers that you did <i>not</i> change.</p>

<h3>Common root causes, mapped to symptoms</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Active or Connect</td><td>No route to peer; wrong neighbour; loopback peering without local-address</td><td>ping, show route, show configuration protocols bgp</td></tr>
<tr><td>Idle, Last Error: OPEN message error</td><td>AS number mismatch, hold time, authentication</td><td>show bgp neighbor</td></tr>
<tr><td>Route hidden</td><td>Next hop not in inet.0 (no next-hop self, no IGP route)</td><td>show route hidden detail</td></tr>
<tr><td>Route received, not active</td><td>Lost best-path selection or import policy rejected it</td><td>show route PREFIX detail, show route receive-protocol</td></tr>
<tr><td>Route not advertised</td><td>Export policy reject; no-export; IBGP split horizon; AS path contains peer AS</td><td>show route advertising-protocol, test policy</td></tr>
<tr><td>Wrong exit</td><td>Local preference not set; MED not compared across ASes</td><td>show route detail</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A route is in <code>show route receive-protocol bgp X</code> but not in <code>show route PREFIX</code>. It is hidden or it lost best-path selection. <code>show route hidden</code> lists routes that arrived but are unusable, either because the next hop does not resolve or because an import policy rejected them (detail output shows the state as Hidden); <code>test policy</code> proves the policy case. If it is not hidden, compare attributes with <code>show route PREFIX detail</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Resetting the session to "fix" a policy. Policy changes take effect at commit; no reset is needed. Resets drop traffic and hide the evidence you need.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active does not mean "working". In BGP the Active state means the router is actively trying TCP and has not yet connected. Established is the only healthy state.</p></div>

<div class="scn"><h4>The route that was everywhere except one router</h4><p>All routers had the customer prefix except the three clients of one route reflector. <code>show route hidden</code> on a client listed the prefix, and the detail output showed a protocol next hop outside the IGP. The edge router announced the route with its external link address as next hop and no next-hop self. One policy term fixed all clients at once.</p><p><b>Lesson:</b> a route that arrived but is hidden is a next-hop problem until proven otherwise.</p></div>

<div class="iv"><p class="q">"A BGP route is missing. How do you troubleshoot it?"</p><p>I check the session state, then show route receive-protocol to see whether it arrived, then show route hidden for an unreachable next hop, then the detail output and policy to see why it lost, and finally show route advertising-protocol on the sender to see what actually leaves. I never reset a session before I have the output.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the funnel: session, received, usable, chosen, sent.</li>
<li>Active means TCP is failing, not that BGP is working.</li>
<li>Hidden routes almost always mean an unresolvable next hop.</li>
<li>show route advertising-protocol bgp is the truth about what you export.</li>
<li>After an AS or policy change, re-check the neighbours you did not touch.</li>
</ul></div>
`,hi:`
<p>BGP ticket aam taur par "mujhe X tak nahi pahunch pa raha" ya "customer ko woh route dikh raha hai jo nahi dikhna chahiye" jaisa hota hai. Andaza mat lagao. Har baar wahi funnel chalo. Har step karanon ki poori class hata deta hai aur batata hai ki agla command kaunsa chalana hai.</p>

<h3>Paanch-step funnel</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Troubleshooting funnel">
<rect x="20" y="15" width="600" height="36" rx="8" fill="#bae6fd"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">1 Session: show bgp summary (Established? Idle, Active, Connect?)</text>
<rect x="55" y="62" width="530" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">2 Received: show route receive-protocol bgp PEER</text>
<rect x="90" y="109" width="460" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">3 Usable: show route hidden, show route detail (next hop?)</text>
<rect x="125" y="156" width="390" height="36" rx="8" fill="#fde68a"/><text x="320" y="179" text-anchor="middle" class="svg-ink" font-size="13">4 Chosen: attributes, best-path order</text>
<rect x="160" y="203" width="320" height="22" rx="8" fill="#fed7aa"/><text x="320" y="219" text-anchor="middle" class="svg-ink" font-size="12">5 Sent: show route advertising-protocol bgp</text>
</svg><p class="cap">Paanch steps, har ek pichle se sankra.</p></div>
<ol>
<li><b>Session.</b> <code>show bgp summary</code>. <i>Idle</i> aam taur par configuration fault hai (galat AS, peer tak route nahi, policy error); <i>Connect</i> ya <i>Active</i> ka matlab TCP complete nahi ho raha (reachability nahi, galat address, firewall, ek side passive); <i>OpenSent</i> aur <i>OpenConfirm</i> ka matlab OPEN exchange fail ho raha hai (AS mismatch, authentication, hold time). <code>show bgp neighbor X</code> mein Last State, Last Event aur Last Error hote hain.</li>
<li><b>Received.</b> <code>show route receive-protocol bgp X</code> dikhata hai neighbour ne kya bheja. Prefix missing ho to problem sender par ya beech raaste mein hai.</li>
<li><b>Usable.</b> <code>show route hidden</code> woh routes list karta hai jo aaye lekin use nahi ho sakte, aam taur par kyunki protocol next hop resolve nahi hota. Yeh classic IBGP aur route-reflector fault hai.</li>
<li><b>Chosen.</b> <code>show route PREFIX detail</code> local preference, AS path, communities, next hop aur path ke active na hone ki wajah dikhata hai.</li>
<li><b>Sent.</b> <code>show route advertising-protocol bgp X</code> bilkul dikhata hai ki saari export policies ke baad kya jaata hai. Use apne irade se milao.</li>
</ol>

<h3>Ticket 1: clients ke paas route nahi (route-reflector lab)</h3>
<p>RR1 configure hone se pehle C2 aur C3 ke paas ISP prefix 203.0.113.0/24 ka route nahi hai. Step 1 batata hai:</p>
<pre class="out">lab@C2&gt; show bgp summary
Groups: 1 Peers: 1 Down peers: 1
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.100.255.1          65100          0          0       0       0           0 <span class="hl">Active</span>

lab@C2&gt; show route 203.0.113.0/24
inet.0: 9 destinations, 9 routes (9 active, 0 holddown, 0 hidden)</pre>
<p>Peer Active hai: C2 koshish kar raha hai, lekin RR1 par BGP configuration nahi hai, isliye koi jawab nahi deta. Fix chapter 5 ka RR1 par CLIENTS group hai. Commit ke baad teeno sessions Established hote hain aur C3 route ko Originator ID 10.100.255.11 ke saath dikhata hai. Client ko chhune se pehle hamesha padho ki <i>kaunsi side</i> chup hai.</p>

<h3>Ticket 2: PEER ko woh prefix dikh raha hai jo nahi dikhna chahiye (community lab)</h3>
<p>Settlement-free peer ko sirf customer routes milne chahiye. Export policy se pehle R2 upstream ka route bhi advertise karta hai:</p>
<pre class="out">lab@R2&gt; show route advertising-protocol bgp 100.70.3.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.60.1.0/24            Self                                    [65200] 64512 I
* 10.60.2.0/24            Self                                    [65200] 64512 I
<span class="hl">* 203.0.113.0/24          Self                                    [65200] 64499 I</span></pre>
<p>Step 5 leak turant dikha deta hai: 203.0.113.0/24 upstream (AS 64499) se aaya. Group PEERING par export policy nahi hai, isliye default har active BGP route export karta hai. Fix community-based hai: import policies se tag lagao, phir PEER-OUT lagao (CUSTOMER accept, baaki reject). Phir verify karo: advertisement ab sirf do customer prefixes dikhata hai, aur PEER par <code>show route</code> mein 203.0.113.0/24 nahi rehta.</p>
<p>Agar CUSTOMER tag wala prefix phir bhi missing ho to <code>show route community no-export</code> check karo: no-export tag external peer ki taraf advertisement rok deta hai, policy kuch bhi kahe. Lab mein woh 10.60.99.0/24 hai.</p>

<h3>Ticket 3: merger ke baad toota session (local-as lab)</h3>
<p>B1 ke AS 65300 mein jaane ke baad <code>show bgp summary</code> mein 100.67.1.1 Idle tha. <code>show bgp neighbor 100.67.1.1</code> ne <code>Local: 0.0.0.0 AS 65300</code> dikhaya aur LocalAS option nahi tha. Upstream UPB par peer 100.67.1.2 bhi ek flap ke saath Idle tha, kyunki UPB ko OPEN mein AS 64520 chahiye. Group UP mein <code>local-as 64520</code> jodne se woh wapas aaya aur neighbour output ne <code>Local AS: 64520 Local System AS: 65300</code> dikhaya. Lesson: AS badalne ke baad un peers ko bhi check karo jinhe aapne <i>nahi</i> badla.</p>

<h3>Aam root causes, symptoms se mapped</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Active ya Connect</td><td>Peer tak route nahi; galat neighbour; local-address ke bina loopback peering</td><td>ping, show route, show configuration protocols bgp</td></tr>
<tr><td>Idle, Last Error: OPEN message error</td><td>AS number mismatch, hold time, authentication</td><td>show bgp neighbor</td></tr>
<tr><td>Route hidden</td><td>Next hop inet.0 mein nahi (next-hop self nahi, IGP route nahi)</td><td>show route hidden detail</td></tr>
<tr><td>Route received, active nahi</td><td>Best-path selection haara ya import policy ne reject kiya</td><td>show route PREFIX detail, show route receive-protocol</td></tr>
<tr><td>Route advertise nahi hua</td><td>Export policy reject; no-export; IBGP split horizon; AS path mein peer ka AS</td><td>show route advertising-protocol, test policy</td></tr>
<tr><td>Galat exit</td><td>Local preference set nahi; alag ASes ke beech MED compare nahi hota</td><td>show route detail</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Route <code>show route receive-protocol bgp X</code> mein hai lekin <code>show route PREFIX</code> mein nahi. Ya to woh hidden hai ya best-path selection mein haar gaya. <code>show route hidden</code> un routes ko list karta hai jo aaye lekin unusable hain, ya to next hop resolve na hone se ya import policy ke reject karne se (detail mein state Hidden dikhta hai); policy wala case <code>test policy</code> saabit karta hai. Hidden na ho to <code>show route PREFIX detail</code> se attributes compare karo.</p></div>

<div class="warn"><p><b>Common mistake.</b> Policy "fix" karne ke liye session reset karna. Policy changes commit par lagu hote hain; reset ki zaroorat nahi. Reset traffic girata hai aur wahi saboot chhupa deta hai jo aapko chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active ka matlab "kaam kar raha hai" nahi. BGP mein Active state ka matlab router sakriya roop se TCP try kar raha hai aur abhi connect nahi hua. Established hi ekmaatr healthy state hai.</p></div>

<div class="scn"><h4>Route jo ek router ko chhodkar sab jagah tha</h4><p>Customer prefix sabhi routers ke paas tha, sirf ek route reflector ke teen clients ko chhodkar. Client par <code>show route hidden</code> ne prefix list kiya, aur detail output ne IGP ke bahar ka protocol next hop dikhaya. Edge router ne route external link address ko next hop banakar announce kiya tha aur next-hop self nahi tha. Ek policy term ne saare clients ek saath theek kar diye.</p><p><b>Lesson:</b> jo route aaya lekin hidden hai woh jab tak galat saabit na ho next-hop problem hai.</p></div>

<div class="iv"><p class="q">"BGP route missing hai. Troubleshoot kaise karoge?"</p><p>Pehle session state, phir show route receive-protocol se dekhta hoon ki aaya ya nahi, phir unreachable next hop ke liye show route hidden, phir detail output aur policy se ki kyun haara, aur aakhir mein sender par show route advertising-protocol se ki asal mein kya jaata hai. Output milne se pehle session reset nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Funnel use karo: session, received, usable, chosen, sent.</li>
<li>Active ka matlab TCP fail ho raha hai, BGP chal raha hai nahi.</li>
<li>Hidden routes ka matlab aam taur par unresolvable next hop hota hai.</li>
<li>show route advertising-protocol bgp export ka sach hai.</li>
<li>AS ya policy change ke baad un neighbours ko dobara check karo jinhe aapne nahi chhua.</li>
</ul></div>
`}};export{e as default};