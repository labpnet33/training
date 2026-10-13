var e={id:`debug-flow`,h:{en:`The debug flow: setting it up and reading each line`,hi:`Debug flow: setup aur har line ka matlab`},body:{en:`
<p>The sniffer tells you what happened on the wire. The <b>debug flow</b> tells you <b>why</b>. It prints the kernel's decisions for a packet in the order they are made: packet received, session created or found, route chosen, policy checked, NAT applied. When a packet disappears inside the FortiGate, this is the tool that names the culprit.</p>

<h3>The five-command recipe</h3>
<pre class="code">diagnose debug flow filter addr 10.0.2.10
diagnose debug flow show function-name enable
diagnose debug flow trace start 10
diagnose debug enable
<span class="c">... generate the traffic ...</span>
diagnose debug disable
diagnose debug reset</pre>
<ol>
<li><b>filter</b>: choose which packets to trace. <code>addr</code> matches source or destination; <code>saddr</code> and <code>daddr</code> restrict to one side; <code>proto</code> and <code>port</code> narrow further. <code>diagnose debug flow filter clear</code> removes the filter, and <code>diagnose debug flow filter</code> on its own prints the current filter.</li>
<li><b>show function-name enable</b>: adds the kernel function name and line to each message. Optional, but it helps when you compare with Fortinet documentation.</li>
<li><b>trace start N</b>: trace the next N packets, then stop by itself. This is the safety limit.</li>
<li><b>diagnose debug enable</b>: switches the output on. Nothing prints before this.</li>
<li><b>disable and reset</b>: always finish with both. Reset returns every debug level, including the flow filter, to default.</li>
</ol>
<p>You can check what is active with <code>diagnose debug info</code>, and the filter with <code>diagnose debug flow filter</code>. In the lab it prints:</p>
<pre class="out">diagnose debug flow filter
vf: any
proto: any
Host addr: any
Host saddr: any
Host daddr: any
port: any</pre>

<h3>A first trace: denied by policy</h3>
<p>This is captured from the <i>fgt-debug-flow</i> lab. PC1 requests the web page on 10.0.2.10 but the policy only allows PING and HTTPS. We turn on the flow with function names and a count of 10:</p>
<pre class="out">id=65308 trace_id=1 func=print_pkt_detail line=6005 msg="vd-root:0 received a packet(proto=6, 10.0.1.10:64251-&gt;10.0.2.10:80) tun_id=0.0.0.0 from port2. flag [S], seq 0, ack 0, win 64240"
id=65308 trace_id=1 func=init_ip_session_common line=6204 msg="allocate a new session-000025d1, tun_id=0.0.0.0"
id=65308 trace_id=1 func=vf_ip_route_input_common line=2605 msg="find a route: flag=04000000 gw-10.0.2.10 via port3"
id=65308 trace_id=1 func=__iprope_fwd_check line=810 msg="in-[port2], out-[port3], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
id=65308 trace_id=1 func=fw_forward_handler line=857 msg=<span class="hl">"Denied by forward policy check (policy 0)"</span></pre>

<h3>Reading it line by line</h3>
<table class="cmp"><tr><th>Line</th><th>What the kernel is telling you</th></tr>
<tr><td><code>received a packet(proto=6, ...)</code></td><td>A TCP packet (protocol 6) from 10.0.1.10 port 64251 to 10.0.2.10 port 80 arrived on port2, with the SYN flag</td></tr>
<tr><td><code>allocate a new session</code></td><td>No existing session matched, so this is the first packet of a new flow</td></tr>
<tr><td><code>find a route ... via port3</code></td><td>The routing lookup chose port3 as the egress interface</td></tr>
<tr><td><code>in-[port2], out-[port3]</code></td><td>Policy lookup now has everything: ingress, egress, addresses and service</td></tr>
<tr><td><code>Denied by forward policy check (policy 0)</code></td><td>No policy allowed it; policy 0 is the implicit deny</td></tr></table>
<p>The same fields appear without the <code>func=</code> and <code>line=</code> parts when you leave function names off. Two details matter in the first line: <code>trace_id</code> groups all messages of one packet, and <code>id=65308</code> is the fixed debug-flow message identifier.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Debug flow order">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Received</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">port, flags</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Session</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">new or existing</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Route</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">egress chosen</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Policy</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">allow or deny</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">NAT</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">translate</text>
</svg><p class="cap">The order of messages mirrors the order of decisions inside the kernel.</p></div>

<div class="eg"><p><b>Worked example.</b> The ticket INC-40211 says "I can ping the intranet server but the web page never loads". You run the recipe with <code>filter addr 10.0.2.10</code>, trace 10, enable, then ask the user to refresh the page. The trace stops at "Denied by forward policy check (policy 0)". Ping works because the policy has the PING service; the web page is HTTP and the service list lacks it. You do not need to guess; the kernel said which decision failed.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>diagnose debug enable</code> after setting the filter, then concluding "there is no traffic". Also forgetting <code>diagnose debug reset</code>: the filter stays and the next engineer sees confusing results or a half-configured debug.</p></div>
<div class="exam"><p><b>Exam trap.</b> The flow filter and trace count only prepare the trace; output starts after <code>diagnose debug enable</code>. <code>diagnose debug reset</code> restores defaults. Policy 0 in the output means the implicit deny.</p></div>

<div class="scn"><h4>"The debug shows nothing"</h4><p>An engineer set a filter on the server address but saw no output while a user tested the page. He had set <code>diagnose debug flow trace start 10</code> but never ran <code>diagnose debug enable</code>. Once he enabled it, the first packet appeared and showed the policy denial immediately.</p><p><b>Lesson:</b> filter, trace and enable are three separate switches; check <code>diagnose debug info</code> if you are not sure.</p></div>

<div class="iv"><p class="q">"How do you use the debug flow safely on a production FortiGate?"</p><p>I set a filter for the specific source and destination, limit the trace with a packet count using <code>trace start N</code>, enable debug, reproduce the problem once, then run <code>diagnose debug disable</code> and <code>diagnose debug reset</code>. I never run it unfiltered on a busy unit because the output loads the CPU and floods the console.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Recipe: filter, show function-name (optional), trace start N, enable, reproduce, disable, reset.</li>
<li>Messages follow the kernel order: receive, session, route, policy, NAT.</li>
<li>trace_id groups all messages of one packet.</li>
<li>Policy 0 means the implicit deny.</li>
<li>Always finish with disable and reset.</li>
</ul></div>
`,hi:`
<p>Sniffer batata hai ki wire par kya hua. <b>Debug flow</b> batata hai <b>kyun</b>. Yeh ek packet ke liye kernel ke decisions usi order mein print karta hai jisme woh liye gaye: packet received, session bana ya mila, route chuna gaya, policy check hui, NAT laga. Packet FortiGate ke andar gayab ho jaaye to yeh tool culprit ka naam batata hai.</p>

<h3>Paanch-command recipe</h3>
<pre class="code">diagnose debug flow filter addr 10.0.2.10
diagnose debug flow show function-name enable
diagnose debug flow trace start 10
diagnose debug enable
<span class="c">... traffic generate karo ...</span>
diagnose debug disable
diagnose debug reset</pre>
<ol>
<li><b>filter</b>: kaunse packets trace karne hain chuno. <code>addr</code> source ya destination match karta hai; <code>saddr</code> aur <code>daddr</code> ek taraf tak restrict karte hain; <code>proto</code> aur <code>port</code> aur narrow karte hain. <code>diagnose debug flow filter clear</code> filter hata deta hai, aur akela <code>diagnose debug flow filter</code> current filter print karta hai.</li>
<li><b>show function-name enable</b>: har message mein kernel function ka naam aur line jodta hai. Optional, lekin Fortinet documentation se compare karne mein madad karta hai.</li>
<li><b>trace start N</b>: agle N packets trace karo, phir apne aap ruk jao. Yeh safety limit hai.</li>
<li><b>diagnose debug enable</b>: output on karta hai. Iske pehle kuch print nahi hota.</li>
<li><b>disable aur reset</b>: hamesha dono par khatam karo. Reset har debug level, flow filter samet, default par laata hai.</li>
</ol>
<p><code>diagnose debug info</code> se dekh sakte ho kya active hai, aur <code>diagnose debug flow filter</code> se filter. Lab mein yeh print karta hai:</p>
<pre class="out">diagnose debug flow filter
vf: any
proto: any
Host addr: any
Host saddr: any
Host daddr: any
port: any</pre>

<h3>Pehla trace: policy ne deny kiya</h3>
<p>Yeh <i>fgt-debug-flow</i> lab se capture hai. PC1 10.0.2.10 ka web page maangta hai lekin policy sirf PING aur HTTPS allow karti hai. Hum function names aur count 10 ke saath flow on karte hain:</p>
<pre class="out">id=65308 trace_id=1 func=print_pkt_detail line=6005 msg="vd-root:0 received a packet(proto=6, 10.0.1.10:64251-&gt;10.0.2.10:80) tun_id=0.0.0.0 from port2. flag [S], seq 0, ack 0, win 64240"
id=65308 trace_id=1 func=init_ip_session_common line=6204 msg="allocate a new session-000025d1, tun_id=0.0.0.0"
id=65308 trace_id=1 func=vf_ip_route_input_common line=2605 msg="find a route: flag=04000000 gw-10.0.2.10 via port3"
id=65308 trace_id=1 func=__iprope_fwd_check line=810 msg="in-[port2], out-[port3], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
id=65308 trace_id=1 func=fw_forward_handler line=857 msg=<span class="hl">"Denied by forward policy check (policy 0)"</span></pre>

<h3>Line by line padhna</h3>
<table class="cmp"><tr><th>Line</th><th>Kernel kya bata raha hai</th></tr>
<tr><td><code>received a packet(proto=6, ...)</code></td><td>10.0.1.10 port 64251 se 10.0.2.10 port 80 ka TCP packet (protocol 6) port2 par aaya, SYN flag ke saath</td></tr>
<tr><td><code>allocate a new session</code></td><td>Koi existing session match nahi hua, isliye yeh naye flow ka pehla packet hai</td></tr>
<tr><td><code>find a route ... via port3</code></td><td>Routing lookup ne egress interface port3 chuna</td></tr>
<tr><td><code>in-[port2], out-[port3]</code></td><td>Policy lookup ke paas ab sab hai: ingress, egress, addresses aur service</td></tr>
<tr><td><code>Denied by forward policy check (policy 0)</code></td><td>Kisi policy ne allow nahi kiya; policy 0 implicit deny hai</td></tr></table>
<p>Function names off rakho to wahi fields <code>func=</code> aur <code>line=</code> ke bina aate hain. Pehli line mein do details matter karti hain: <code>trace_id</code> ek packet ke saare messages ko group karta hai, aur <code>id=65308</code> fixed debug-flow message identifier hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Debug flow order">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="11.7">Received</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="10.7">port, flags</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="11.7">Session</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="10.7">naya ya existing</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="11.7">Route</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="10.7">egress chuna</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="11.7">Policy</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="10.7">allow ya deny</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="11.7">NAT</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="10.7">translate</text>
</svg><p class="cap">Messages ka order kernel ke andar decisions ke order ko mirror karta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Ticket INC-40211 kehta hai "Main intranet server ko ping kar sakta hoon lekin web page kabhi load nahi hota". Aap <code>filter addr 10.0.2.10</code>, trace 10, enable ke saath recipe chalate ho, phir user se page refresh karwate ho. Trace "Denied by forward policy check (policy 0)" par ruk jaata hai. Ping chalta hai kyunki policy mein PING service hai; web page HTTP hai aur service list mein woh nahi. Guess karne ki zaroorat nahi; kernel ne bata diya kaunsa decision fail hua.</p></div>

<div class="warn"><p><b>Common mistake.</b> Filter set karke <code>diagnose debug enable</code> bhool jaana, phir "traffic hi nahi hai" nikaal lena. Aur <code>diagnose debug reset</code> bhool jaana: filter rah jaata hai aur agla engineer confusing results ya aadhe configured debug dekhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Flow filter aur trace count sirf trace taiyar karte hain; output <code>diagnose debug enable</code> ke baad shuru hota hai. <code>diagnose debug reset</code> defaults restore karta hai. Output mein policy 0 ka matlab implicit deny.</p></div>

<div class="scn"><h4>"Debug mein kuch nahi dikhta"</h4><p>Ek engineer ne server address par filter set kiya lekin user ke page test karne par koi output nahi dikha. Usne <code>diagnose debug flow trace start 10</code> chalaya tha lekin <code>diagnose debug enable</code> kabhi nahi. Enable karte hi pehla packet dikha aur policy denial turant dikha diya.</p><p><b>Lesson:</b> filter, trace aur enable teen alag switches hain; shak ho to <code>diagnose debug info</code> check karo.</p></div>

<div class="iv"><p class="q">"Production FortiGate par debug flow safely kaise use karte ho?"</p><p>Main specific source aur destination ka filter set karta hoon, <code>trace start N</code> se packet count se trace limit karta hoon, debug enable karta hoon, problem ek baar reproduce karta hoon, phir <code>diagnose debug disable</code> aur <code>diagnose debug reset</code> chalata hoon. Busy unit par kabhi unfiltered nahi chalata kyunki output CPU load karta hai aur console flood karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Recipe: filter, show function-name (optional), trace start N, enable, reproduce, disable, reset.</li>
<li>Messages kernel order follow karte hain: receive, session, route, policy, NAT.</li>
<li>trace_id ek packet ke saare messages group karta hai.</li>
<li>Policy 0 matlab implicit deny.</li>
<li>Hamesha disable aur reset par khatam karo.</li>
</ul></div>
`}};export{e as default};