var e={id:`bgp-troubleshooting`,h:{en:`A troubleshooting workflow for BGP`,hi:`BGP ke liye troubleshooting workflow`},body:{en:`
<p>When a parcel does not arrive, the post office asks questions in a fixed order: was it posted, did it leave the sorting office, did the next office receive it, was it delivered? BGP troubleshooting follows the same life of a route. You do not guess, you walk the route's path and stop at the first place where it disappears. The five stages below cover almost every ticket.</p>

<h3>Five stages</h3>
<ol>
<li><b>Session:</b> <code>show bgp summary</code>. Is the peer Established? If not, read the state: Idle, Connect or Active point to the transport or the configuration.</li>
<li><b>Reachability:</b> can the router reach the neighbour address (and, for IBGP, the loopback through the IGP)? <code>ping</code> and <code>show route &lt;neighbour&gt;</code>.</li>
<li><b>Received:</b> <code>show route receive-protocol bgp &lt;peer&gt;</code>. Did the routes arrive? The last line of the summary (active, received, accepted, damped) tells you where they were lost.</li>
<li><b>Usable:</b> <code>show route hidden detail</code>. Is the protocol next hop resolved? Did a policy reject the route?</li>
<li><b>Selected and advertised:</b> <code>show route &lt;prefix&gt; detail</code> for the Inactive reason, and <code>show route advertising-protocol bgp &lt;peer&gt;</code> for what we send.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="BGP troubleshooting stages">
<rect x="10" y="40" width="112" height="60" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="66" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Session</text><text x="66" y="84" text-anchor="middle" class="svg-muted" font-size="10">Established?</text>
<rect x="134" y="40" width="112" height="60" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="190" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Reachability</text><text x="190" y="84" text-anchor="middle" class="svg-muted" font-size="10">IGP, ping</text>
<rect x="258" y="40" width="112" height="60" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="314" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Received</text><text x="314" y="84" text-anchor="middle" class="svg-muted" font-size="10">receive-protocol</text>
<rect x="382" y="40" width="112" height="60" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="438" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Usable</text><text x="438" y="84" text-anchor="middle" class="svg-muted" font-size="10">hidden, next hop</text>
<rect x="506" y="40" width="124" height="60" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="568" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Selected, sent</text><text x="568" y="84" text-anchor="middle" class="svg-muted" font-size="10">detail, advertising</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Follow the life of the route; stop where it disappears</text>
</svg><p class="cap">Session, reachability, received, usable, selected and sent.</p></div>

<h3>What each symptom means</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th></tr>
<tr><td>BGP is not running</td><td>no local AS or no BGP configured</td></tr>
<tr><td>Active</td><td>TCP fails: wrong address, no route, a filter on port 179</td></tr>
<tr><td>Idle after configuration</td><td>wrong peer-as or a rejected OPEN</td></tr>
<tr><td>Established, 0/0/0/0</td><td>nothing exported by the sender (a missing export policy)</td></tr>
<tr><td>0 active, N received</td><td>hidden routes (next hop) or an import policy</td></tr>
<tr><td>Received but a different path is active</td><td>best path rules: check Inactive reason</td></tr></table>

<h3>Worked case 1: the peer that never opens</h3>
<p>A router was configured with a neighbour address that nobody owns, and another neighbour with the wrong remote AS. The summary shows the states:</p>
<pre class="out">lab@NGP-R1&gt; show bgp summary
Groups: 2 Peers: 2 Down peers: 2
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.65.1.1            64501          0          2       0       0           0 <span class="hl">Idle</span>
100.65.1.5            64500          0          0       0       0           0 <span class="hl">Active</span></pre>
<p>Stage 1 tells it already: Active on .5 means TCP does not connect, so check the address and ping it. Idle on .1 with AS 64501 means a mismatched OPEN: the ISP is AS 64500. After <code>set protocols bgp group ISP peer-as 64500</code> the session went Established and showed "inet.0: 2/2/2/0". The group X neighbour stays Active because the address does not exist: delete it.</p>

<h3>Worked case 2: Established but empty</h3>
<p>Right after IBGP was configured between R1 and R2 in the first lab, the summary shows the IBGP peer with no routes while the ISP peer has two:</p>
<pre class="out">lab@NGP-R1&gt; show bgp summary
10.20.255.2           65010          2          3       0       0        0:25 Establ
  inet.0: <span class="hl">0/0/0/0</span>
100.65.1.1            64500          4          3       0       0        0:55 Establ
  inet.0: 2/2/2/0</pre>
<p>The session is fine, so stages 1 and 2 pass. At stage 3, R1 received nothing from R2, so the cause is on R2: its warehouse LAN is a direct route, and the default BGP export never advertises direct routes. The fix is the export policy LAN-OUT. After it, R1 shows the route:</p>
<pre class="out">lab@NGP-R2&gt; show route advertising-protocol bgp 10.20.255.1
* 10.20.2.0/24            Self                         100        I
lab@NGP-R1&gt; show route receive-protocol bgp 10.20.255.2
* 10.20.2.0/24            10.20.255.2                  100        I</pre>

<h3>Worked case 3: received, but not active</h3>
<p>This is the hidden-route case from the previous chapter: 0 active and 2 received, a Protocol next hop with <b>(unresolved)</b>, and the fix with next-hop self on the edge router. The sequence of commands is the same each time: summary, receive-protocol, hidden detail, route detail.</p>
<pre class="out">lab@IDR-R3&gt; show bgp summary
10.30.255.1           65020          5          5       0       0        1:05 Establ
  inet.0: <span class="hl">0/2/2/0</span>
lab@IDR-R3&gt; show route hidden detail
                Protocol next hop: 100.66.1.1 (<span class="hl">unresolved</span>)
                State: &lt;Hidden Int Ext&gt;</pre>

<div class="eg"><p><b>Worked example.</b> A customer says "the cloud prefix goes out through the wrong ISP". Stage 5: <code>show route 192.0.2.0/24 detail</code> shows two paths with equal local preference; the loser says Inactive reason "Interior &gt; Exterior &gt; Exterior via Interior". The router has done what BGP asks; to change it you set a higher local preference on the preferred ISP import. Ten minutes, no guessing.</p></div>

<div class="warn"><p><b>Common mistake.</b> Restarting the session (clear bgp neighbor) as the first action. It hides the evidence and causes an outage, and it does not fix a policy or next-hop fault. Read first. Another mistake: assuming an Established session means a working design.</p></div>
<div class="exam"><p><b>Exam trap.</b> The last column of the summary is active/received/accepted/damped. Received greater than active with no import policy means unusable (hidden) routes. Locally originated routes (direct, static) are not exported by default; you need an export policy. Use <code>show route hidden</code> because hidden routes are not in the normal output.</p></div>

<div class="scn"><h4>Monday morning, no Internet at branch 3</h4><p>The on-call engineer ran the five stages in order. Session Established, reachability fine, 2 routes received and 0 active. Hidden detail showed an unresolved next hop, and a commit from Friday had removed the ISP link from the IGP. Adding next-hop self on the edge router fixed it in one commit. Total time: eight minutes.</p><p><b>Lesson:</b> a fixed order beats intuition.</p></div>

<div class="iv"><p class="q">"A BGP session is Established but the router has no routes from the peer. How do you troubleshoot?"</p><p>I follow the route's life. First the summary: if received is zero, I look at the sender, probably a missing export policy or the wrong direction. If received is above active, I check show route hidden detail for an unresolved next hop and the import policy. If the route is active but the wrong path wins, I read the Inactive reason in show route detail. I change one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stages: session, reachability, received, usable, selected and advertised.</li>
<li>Read the summary: Active is TCP, Idle is OPEN or config, 0/0/0/0 is the sender.</li>
<li>Hidden routes and Inactive reasons explain nearly every "route present, not used" ticket.</li>
<li>Do not clear sessions to find a fault; read the evidence first.</li>
</ul></div>
`,hi:`
<p>Parcel na pahunche to post office sawal ek tay order mein poochta hai: post hua, sorting office se nikla, agle office ko mila, deliver hua? BGP troubleshooting route ke jeevan ko usi tarah follow karti hai. Aap andaza nahi lagate, route ke raaste par chalte ho aur pehli us jagah ruk jaate ho jahan wo gayab hota hai. Neeche ke paanch stages lagbhag har ticket ko cover karte hain.</p>

<h3>Paanch stages</h3>
<ol>
<li><b>Session:</b> <code>show bgp summary</code>. Peer Established hai? Nahi to state padho: Idle, Connect ya Active transport ya configuration ki taraf ishaara karte hain.</li>
<li><b>Reachability:</b> kya router neighbour address (aur IBGP ke liye IGP se loopback) tak pahunch sakta hai? <code>ping</code> aur <code>show route &lt;neighbour&gt;</code>.</li>
<li><b>Received:</b> <code>show route receive-protocol bgp &lt;peer&gt;</code>. Routes aaye? Summary ki aakhri line (active, received, accepted, damped) batati hai ki kahan kho gaye.</li>
<li><b>Usable:</b> <code>show route hidden detail</code>. Protocol next hop resolve hua? Kisi policy ne route reject kiya?</li>
<li><b>Selected aur advertised:</b> Inactive reason ke liye <code>show route &lt;prefix&gt; detail</code>, aur hum kya bhejte hain uske liye <code>show route advertising-protocol bgp &lt;peer&gt;</code>.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="BGP troubleshooting stages">
<rect x="10" y="40" width="112" height="60" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="66" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Session</text><text x="66" y="84" text-anchor="middle" class="svg-muted" font-size="10">Established?</text>
<rect x="134" y="40" width="112" height="60" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="190" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Reachability</text><text x="190" y="84" text-anchor="middle" class="svg-muted" font-size="10">IGP, ping</text>
<rect x="258" y="40" width="112" height="60" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="314" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Received</text><text x="314" y="84" text-anchor="middle" class="svg-muted" font-size="10">receive-protocol</text>
<rect x="382" y="40" width="112" height="60" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="438" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Usable</text><text x="438" y="84" text-anchor="middle" class="svg-muted" font-size="10">hidden, next hop</text>
<rect x="506" y="40" width="124" height="60" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="568" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Selected, sent</text><text x="568" y="84" text-anchor="middle" class="svg-muted" font-size="10">detail, advertising</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Route ke jeevan ko follow karo; jahan gayab ho wahin ruko</text>
</svg><p class="cap">Session, reachability, received, usable, selected aur sent.</p></div>

<h3>Har symptom ka matlab</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Sambhavit karan</th></tr>
<tr><td>BGP is not running</td><td>local AS nahi ya BGP configured nahi</td></tr>
<tr><td>Active</td><td>TCP fail: galat address, route nahi, port 179 par filter</td></tr>
<tr><td>Configuration ke baad Idle</td><td>galat peer-as ya reject hua OPEN</td></tr>
<tr><td>Established, 0/0/0/0</td><td>sender ne kuch export nahi kiya (export policy missing)</td></tr>
<tr><td>0 active, N received</td><td>hidden routes (next hop) ya import policy</td></tr>
<tr><td>Received par doosra path active</td><td>best path rules: Inactive reason dekho</td></tr></table>

<h3>Worked case 1: peer jo kabhi khulta nahi</h3>
<p>Router par aisa neighbour address configure tha jo kisi ka nahi, aur doosra neighbour galat remote AS ke saath. Summary states dikhata hai:</p>
<pre class="out">lab@NGP-R1&gt; show bgp summary
Groups: 2 Peers: 2 Down peers: 2
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.65.1.1            64501          0          2       0       0           0 <span class="hl">Idle</span>
100.65.1.5            64500          0          0       0       0           0 <span class="hl">Active</span></pre>
<p>Stage 1 pehle hi bata deta hai: .5 par Active ka matlab TCP connect nahi hota, isliye address check karo aur ping karo. .1 par AS 64501 ke saath Idle ka matlab OPEN mismatch: ISP AS 64500 hai. <code>set protocols bgp group ISP peer-as 64500</code> ke baad session Established hua aur "inet.0: 2/2/2/0" dikha. Group X ka neighbour Active rehta hai kyunki address maujood nahi: use delete karo.</p>

<h3>Worked case 2: Established par khaali</h3>
<p>Pehle lab mein R1 aur R2 ke beech IBGP configure karte hi summary IBGP peer ko bina routes ke dikhata hai jabki ISP peer ke do routes hain:</p>
<pre class="out">lab@NGP-R1&gt; show bgp summary
10.20.255.2           65010          2          3       0       0        0:25 Establ
  inet.0: <span class="hl">0/0/0/0</span>
100.65.1.1            64500          4          3       0       0        0:55 Establ
  inet.0: 2/2/2/0</pre>
<p>Session theek hai, isliye stage 1 aur 2 pass hote hain. Stage 3 par R1 ne R2 se kuch nahi paya, isliye karan R2 par hai: uska warehouse LAN direct route hai, aur default BGP export direct routes kabhi advertise nahi karta. Fix export policy LAN-OUT hai. Uske baad R1 route dikhata hai:</p>
<pre class="out">lab@NGP-R2&gt; show route advertising-protocol bgp 10.20.255.1
* 10.20.2.0/24            Self                         100        I
lab@NGP-R1&gt; show route receive-protocol bgp 10.20.255.2
* 10.20.2.0/24            10.20.255.2                  100        I</pre>

<h3>Worked case 3: received par active nahi</h3>
<p>Ye pichhle chapter ka hidden-route case hai: 0 active aur 2 received, <b>(unresolved)</b> wala Protocol next hop, aur edge router par next-hop self se fix. Commands ka sequence har baar wahi hai: summary, receive-protocol, hidden detail, route detail.</p>
<pre class="out">lab@IDR-R3&gt; show bgp summary
10.30.255.1           65020          5          5       0       0        1:05 Establ
  inet.0: <span class="hl">0/2/2/0</span>
lab@IDR-R3&gt; show route hidden detail
                Protocol next hop: 100.66.1.1 (<span class="hl">unresolved</span>)
                State: &lt;Hidden Int Ext&gt;</pre>

<div class="eg"><p><b>Worked example.</b> Customer kehta hai "cloud prefix galat ISP se ja raha hai". Stage 5: <code>show route 192.0.2.0/24 detail</code> barabar local preference ke do paths dikhata hai; haarne wala Inactive reason "Interior &gt; Exterior &gt; Exterior via Interior" kehta hai. Router ne wahi kiya jo BGP kehta hai; badalne ke liye preferred ISP import par zyada local preference set karo. Dus minute, andaza nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pehle action ke roop mein session restart (clear bgp neighbor) karna. Ye saboot chhupata hai aur outage lata hai, aur policy ya next-hop fault theek nahi karta. Pehle padho. Ek aur galti: Established session ka matlab design sahi maan lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Summary ka aakhri column active/received/accepted/damped hai. Import policy ke bina received active se zyada ho to routes unusable (hidden) hain. Locally originated routes (direct, static) default mein export nahi hote; export policy chahiye. <code>show route hidden</code> use karo kyunki hidden routes normal output mein nahi aate.</p></div>

<div class="scn"><h4>Monday subah, branch 3 mein Internet nahi</h4><p>On-call engineer ne paanch stages order mein chalaye. Session Established, reachability theek, 2 routes received aur 0 active. Hidden detail ne unresolved next hop dikhaya, aur Friday ke commit ne ISP link ko IGP se hata diya tha. Edge router par next-hop self jodne se ek commit mein theek ho gaya. Kul samay: aath minute.</p><p><b>Lesson:</b> tay order andaze se behtar hai.</p></div>

<div class="iv"><p class="q">"BGP session Established hai par router ke paas peer ke routes nahi. Kaise troubleshoot karoge?"</p><p>Main route ke jeevan ko follow karta hoon. Pehle summary: received zero ho to sender dekhta hoon, shayad export policy missing ya galat disha. Received active se zyada ho to show route hidden detail mein unresolved next hop aur import policy dekhta hoon. Route active ho par galat path jeete to show route detail ka Inactive reason padhta hoon. Ek samay mein ek cheez badalta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stages: session, reachability, received, usable, selected aur advertised.</li>
<li>Summary padho: Active TCP hai, Idle OPEN ya config, 0/0/0/0 sender hai.</li>
<li>Hidden routes aur Inactive reasons lagbhag har "route hai, use nahi" ticket samjha dete hain.</li>
<li>Fault dhoondhne ke liye sessions clear mat karo; pehle saboot padho.</li>
</ul></div>
`}};export{e as default};