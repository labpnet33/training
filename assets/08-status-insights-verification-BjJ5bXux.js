var e={id:`status-insights-verification`,h:{en:`Status pages, Insights: Data Centers and verification`,hi:`Status pages, Insights: Data Centers aur verification`},body:{en:`
<p>A courier tracks every corridor with a control room. You need the same view for your service connections: is the tunnel up, is BGP established, how much bandwidth is used, and are the routes right? This chapter lists the cloud pages and the HQ firewall commands that answer those questions, and shows how to prove the whole path end to end.</p>

<h3>Panorama pages</h3>
<dl class="terms">
<dt>Status &gt; Status</dt><dd>Overall deployment health with Status and Config Status (OK / In sync).</dd>
<dt>Status &gt; Network Details &gt; Service Connection</dt><dd>Choose the Service Connection radio button. It shows the Service Endpoint Address (the HQ peer address) and the Local IP. The BGP Status dialog shows Peer, Local RIB and RIB Out.</dd>
<dt>Status &gt; Monitor</dt><dd>Tunnel Status, BGP Status (Connect, Established, Warning when no update for more than 8 minutes, Error) and Config Status for each connection.</dd>
</dl>

<h3>SCM pages</h3>
<dl class="terms">
<dt>Sync Status</dt><dd>Configuration &gt; NGFW and Prisma Access &gt; Prisma Access &gt; Sync Status shows whether the last push is applied.</dd>
<dt>Insights: Data Centers</dt><dd>Shows service connection status, bandwidth and tunnel data for each corporate site.</dd>
<dt>Log Viewer</dt><dd>Traffic logs under Activity. Use it to see which rule matched and the session result.</dd>
</dl>

<h3>Routing Information</h3>
<p>The documentation names a serviceability function called <b>Routing Information</b> that displays Destination, Nexthop, Metric or AD and Flags for a service connection or remote network. Use it to see what Prisma Access knows about 10.10.0.0/24 and about the branch and pool prefixes. The exact menu path depends on your console.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three views of the same tunnel">
<rect x="20" y="30" width="180" height="110" rx="10" fill="#bae6fd"/><text x="110" y="58" text-anchor="middle" class="svg-ink" font-size="14">Cloud view</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">Monitor / Data Centers</text><text x="110" y="102" text-anchor="middle" class="svg-muted" font-size="12">Tunnel + BGP status</text>
<rect x="230" y="30" width="180" height="110" rx="10" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">HQ-FW view</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">show vpn, routing</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">show session</text>
<rect x="440" y="30" width="180" height="110" rx="10" fill="#bbf7d0"/><text x="530" y="58" text-anchor="middle" class="svg-ink" font-size="14">User view</text><text x="530" y="82" text-anchor="middle" class="svg-muted" font-size="12">ping, browse 10.10.0.50</text><text x="530" y="102" text-anchor="middle" class="svg-muted" font-size="12">DNS 10.10.0.53</text>
</svg><p class="cap">Prove the path from all three views.</p></div>

<h3>HQ-FW commands</h3>
<pre class="out">admin@HQ-FW&gt; show vpn ike-sa gateway SC-GW

IKEv2 SAs
Gateway ID  Peer-Address    Gateway Name  Role  Algorithm
1           203.0.113.102   SC-GW         Resp  PSK/DH14/A256/SHA256
<span class="hl">State: established</span>

admin@HQ-FW&gt; show vpn tunnel name SC-TUN
<span class="hl">tunnel SC-TUN: state active, interface tunnel.1</span>

admin@HQ-FW&gt; show routing protocol bgp summary
<span class="hl">peer 10.254.2.1  AS 65534  state Established  prefixes received 3</span>

admin@HQ-FW&gt; show routing route
10.200.0.0/23   B   tunnel.1
10.20.0.0/24    B   tunnel.1
10.255.0.0/24   B   tunnel.1

admin@HQ-FW&gt; show session all filter source 10.200.0.15
<span class="hl">ID 1204  ... state ACTIVE  ingress tunnel.1  egress ethernet1/2</span></pre>
<p>The outputs are trimmed and illustrative. If a command in your release has a slightly different syntax or output layout, use <code>?</code> to adapt.</p>
<p>You can also use <code>show vpn flow</code>, <code>test vpn ike-sa gateway SC-GW</code>, <code>clear vpn ike-sa gateway SC-GW</code>, <code>clear vpn ipsec-sa tunnel SC-TUN</code> and the IKE debug commands from pa-remote.</p>

<h3>The end-to-end test</h3>
<ol>
<li>Cloud: Tunnel Status Up, BGP Established, Config Status In sync.</li>
<li>HQ-FW: IKE SA established, tunnel active, BGP Established, the three return prefixes present.</li>
<li>User: LAPTOP-HOME opens the app on 10.10.0.50; nslookup of an internal name through 10.10.0.53 works.</li>
<li>Branch: PC-BR (10.20.0.100) pings 10.10.0.50.</li>
<li>Hub path: LAPTOP-HOME reaches PC-BR.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> After the push, the admin finds Tunnel Status Up and BGP Established in Monitor. On HQ-FW, show routing protocol bgp summary shows 3 prefixes received. The laptop pings 10.10.0.50, and show session on HQ-FW shows an active session with source 10.200.0.15. All three views agree.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Declaring success from the tunnel light alone; checking only the cloud; forgetting that Config Status can be Out of sync even when the tunnel is up from an old push.</p></div>
<div class="exam"><p><b>Exam trap.</b> Network Details &gt; Service Connection (Panorama) gives the endpoint address. Insights: Data Centers (SCM) shows service connection status. BGP Warning means no update for more than 8 minutes.</p></div>

<div class="scn"><h4>The silent weekend</h4><p>On Monday, staff said the data centre was unreachable all weekend. Insights: Data Centers showed the service connection had flapped every few hours, and HQ-FW logs showed DPD timeouts. The HQ ISP link dropped packets. Moving the HQ gateway to a stable link ended the flapping.</p><p><b>Lesson:</b> history on the Data Centers page tells you what the current "Up" hides.</p></div>

<div class="iv"><p class="q">"How do you check the health of a service connection?"</p><p>In Panorama: Network Details &gt; Service Connection and Monitor for tunnel and BGP. In SCM: Sync Status and Insights: Data Centers. On HQ-FW: show vpn ike-sa, tunnel, BGP summary and routes, and show session. I finish with a real user test against 10.10.0.50.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three views: cloud pages, HQ-FW commands and a user test.</li>
<li>Panorama: Status, Monitor, Network Details &gt; Service Connection.</li>
<li>SCM: Sync Status and Insights: Data Centers.</li>
<li>HQ-FW: show vpn, BGP summary, routes, sessions.</li>
<li>Routing Information shows what Prisma Access knows.</li>
</ul></div>
`,hi:`
<p>Courier har corridor ko control room se track karta hai. Aapko apne service connections ke liye bhi wahi view chahiye: tunnel up hai? BGP established hai? kitni bandwidth use ho rahi hai? aur routes sahi hain? Yeh chapter woh cloud pages aur HQ firewall commands batata hai jo in sawalon ke jawab dete hain, aur dikhata hai ki poora path end to end kaise prove karte hain.</p>

<h3>Panorama pages</h3>
<dl class="terms">
<dt>Status &gt; Status</dt><dd>Status aur Config Status (OK / In sync) ke saath overall deployment health.</dd>
<dt>Status &gt; Network Details &gt; Service Connection</dt><dd>Service Connection radio button chuno. Yeh Service Endpoint Address (HQ ka peer address) aur Local IP dikhata hai. BGP Status dialog Peer, Local RIB aur RIB Out dikhata hai.</dd>
<dt>Status &gt; Monitor</dt><dd>Har connection ka Tunnel Status, BGP Status (Connect, Established, 8 minutes se zyada update na aaye to Warning, Error) aur Config Status.</dd>
</dl>

<h3>SCM pages</h3>
<dl class="terms">
<dt>Sync Status</dt><dd>Configuration &gt; NGFW and Prisma Access &gt; Prisma Access &gt; Sync Status dikhata hai ki last push apply hua ya nahi.</dd>
<dt>Insights: Data Centers</dt><dd>Har corporate site ke service connection status, bandwidth aur tunnel data dikhata hai.</dd>
<dt>Log Viewer</dt><dd>Activity ke neeche traffic logs. Isse dekho kaun sa rule match hua aur session ka result.</dd>
</dl>

<h3>Routing Information</h3>
<p>Documentation <b>Routing Information</b> naam ka serviceability function batati hai jo service connection ya remote network ke liye Destination, Nexthop, Metric ya AD aur Flags dikhata hai. Isse dekho ki Prisma Access 10.10.0.0/24 aur branch aur pool prefixes ke baare mein kya jaanta hai. Exact menu path aapke console par depend karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three views of the same tunnel">
<rect x="20" y="30" width="180" height="110" rx="10" fill="#bae6fd"/><text x="110" y="58" text-anchor="middle" class="svg-ink" font-size="14">Cloud view</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">Monitor / Data Centers</text><text x="110" y="102" text-anchor="middle" class="svg-muted" font-size="12">Tunnel + BGP status</text>
<rect x="230" y="30" width="180" height="110" rx="10" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">HQ-FW view</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">show vpn, routing</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">show session</text>
<rect x="440" y="30" width="180" height="110" rx="10" fill="#bbf7d0"/><text x="530" y="58" text-anchor="middle" class="svg-ink" font-size="14">User view</text><text x="530" y="82" text-anchor="middle" class="svg-muted" font-size="12">ping, browse 10.10.0.50</text><text x="530" y="102" text-anchor="middle" class="svg-muted" font-size="12">DNS 10.10.0.53</text>
</svg><p class="cap">Teeno views se path prove karo.</p></div>

<h3>HQ-FW commands</h3>
<pre class="out">admin@HQ-FW&gt; show vpn ike-sa gateway SC-GW

IKEv2 SAs
Gateway ID  Peer-Address    Gateway Name  Role  Algorithm
1           203.0.113.102   SC-GW         Resp  PSK/DH14/A256/SHA256
<span class="hl">State: established</span>

admin@HQ-FW&gt; show vpn tunnel name SC-TUN
<span class="hl">tunnel SC-TUN: state active, interface tunnel.1</span>

admin@HQ-FW&gt; show routing protocol bgp summary
<span class="hl">peer 10.254.2.1  AS 65534  state Established  prefixes received 3</span>

admin@HQ-FW&gt; show routing route
10.200.0.0/23   B   tunnel.1
10.20.0.0/24    B   tunnel.1
10.255.0.0/24   B   tunnel.1

admin@HQ-FW&gt; show session all filter source 10.200.0.15
<span class="hl">ID 1204  ... state ACTIVE  ingress tunnel.1  egress ethernet1/2</span></pre>
<p>Outputs trimmed aur illustrative hain. Aapki release mein command ka syntax ya output layout thoda alag ho to <code>?</code> se adapt karo.</p>
<p>Aap <code>show vpn flow</code>, <code>test vpn ike-sa gateway SC-GW</code>, <code>clear vpn ike-sa gateway SC-GW</code>, <code>clear vpn ipsec-sa tunnel SC-TUN</code> aur pa-remote ke IKE debug commands bhi use kar sakte ho.</p>

<h3>End-to-end test</h3>
<ol>
<li>Cloud: Tunnel Status Up, BGP Established, Config Status In sync.</li>
<li>HQ-FW: IKE SA established, tunnel active, BGP Established, teeno return prefixes maujood.</li>
<li>User: LAPTOP-HOME 10.10.0.50 par app kholta hai; 10.10.0.53 ke through internal naam ka nslookup chalta hai.</li>
<li>Branch: PC-BR (10.20.0.100) 10.10.0.50 ko ping karta hai.</li>
<li>Hub path: LAPTOP-HOME PC-BR tak pahunchta hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Push ke baad admin Monitor mein Tunnel Status Up aur BGP Established dekhta hai. HQ-FW par show routing protocol bgp summary 3 prefixes received dikhata hai. Laptop 10.10.0.50 ko ping karta hai, aur HQ-FW par show session source 10.200.0.15 wala active session dikhata hai. Teeno views agree karte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf tunnel light dekhkar success declare karna; sirf cloud check karna; yeh bhoolna ki purane push se tunnel up ho tab bhi Config Status Out of sync ho sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Network Details &gt; Service Connection (Panorama) endpoint address deta hai. Insights: Data Centers (SCM) service connection status dikhata hai. BGP Warning matlab 8 minutes se zyada update nahi.</p></div>

<div class="scn"><h4>Khamosh weekend</h4><p>Monday ko staff ne kaha data centre poora weekend unreachable tha. Insights: Data Centers ne dikhaya ki service connection har kuch ghante flap hua, aur HQ-FW logs mein DPD timeouts the. HQ ISP link packets drop kar raha tha. HQ gateway ko stable link par le jaane se flapping khatam hui.</p><p><b>Lesson:</b> Data Centers page ki history woh batati hai jo current "Up" chhupata hai.</p></div>

<div class="iv"><p class="q">"Service connection ki health kaise check karte ho?"</p><p>Panorama mein: Network Details &gt; Service Connection aur Monitor tunnel aur BGP ke liye. SCM mein: Sync Status aur Insights: Data Centers. HQ-FW par: show vpn ike-sa, tunnel, BGP summary aur routes, aur show session. End mein 10.10.0.50 ke khilaaf asli user test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen views: cloud pages, HQ-FW commands aur user test.</li>
<li>Panorama: Status, Monitor, Network Details &gt; Service Connection.</li>
<li>SCM: Sync Status aur Insights: Data Centers.</li>
<li>HQ-FW: show vpn, BGP summary, routes, sessions.</li>
<li>Routing Information dikhata hai Prisma Access kya jaanta hai.</li>
</ul></div>
`}};export{e as default};