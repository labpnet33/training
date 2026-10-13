var e={id:`policy-split-tunnel`,h:{en:`Policy, address pool and split tunnelling`,hi:`Policy, address pool aur split tunnelling`},body:{en:`
<p>A user who authenticates has only entered the building. What they can reach is decided by the <b>firewall policy</b>, the <b>address pool</b> and the <b>routes</b>. This chapter explains how tunnel-mode traffic is handled by the FortiGate, how split tunnelling works, and the common causes of "I am connected but cannot reach anything". Reference configuration is <b>not run in the simulator</b>.</p>

<h3>The ssl.root interface</h3>
<p>When SSL VPN is enabled, FortiGate creates a special interface called <b>ssl.root</b> (in the root VDOM). All tunnel-mode users appear to arrive on this interface, with a source address taken from the <b>tunnel pool</b>. You use <code>ssl.root</code> as the <b>source interface</b> in the policies that control remote user access, the same way you would use <code>port2</code> for LAN users.</p>

<h3>The address pool</h3>
<p>The pool is an address object of type IP range, such as 10.99.0.10 to 10.99.0.50. Each connected user receives one address. Size the pool for the maximum simultaneous users plus headroom. The pool must not overlap with the LAN, other VPN ranges or common home networks. Internal servers need a <b>return route</b> to the pool through the FortiGate, which usually exists automatically if the FortiGate is their default gateway; if they use another router, add a route for the pool pointing to the FortiGate.</p>

<h3>The firewall policy</h3>
<p>Remote access policies look like normal policies, with the user group as an extra source condition:</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
config firewall policy
    edit 30
        set name "SSLVPN-to-fileserver"
        set srcintf "ssl.root"
        set dstintf "port2"
        set srcaddr "SSLVPN-POOL"
        set dstaddr "FILE-SERVER"
        set groups "SSLVPN-Users"
        set action accept
        set schedule "always"
        set service "SMB" "RDP"
        set logtraffic all
    next
end</pre>
<p>Keep these points in mind. <b>NAT is usually off</b>, so the server sees the user's tunnel address and can log it and apply its own controls. <b>Use specific destination objects and services</b>, not "all", wherever the users have a defined need. <b>One policy per group and purpose</b> keeps the rule base readable. Policies are evaluated top to bottom, so check that an earlier policy does not catch the traffic first (see <b>nse4-policy</b>).</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Split tunnelling versus full tunnel">
<rect x="20" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="75" y="105" text-anchor="middle" class="svg-ink" font-size="12">Remote laptop</text>
<rect x="260" y="70" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="315" y="105" text-anchor="middle" class="svg-ink" font-size="12">FortiGate</text>
<rect x="510" y="20" width="110" height="50" rx="10" fill="#fde68a"/><text x="565" y="50" text-anchor="middle" class="svg-ink" font-size="12">Company LAN</text>
<rect x="510" y="130" width="110" height="50" rx="10" fill="#fed7aa"/><text x="565" y="160" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<line x1="130" y1="90" x2="260" y2="90" stroke="#64748b" stroke-width="3"/><text x="195" y="82" text-anchor="middle" class="svg-accent" font-size="11">via tunnel</text>
<line x1="370" y1="85" x2="510" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="75" y1="130" x2="75" y2="165" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="75" y1="165" x2="510" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="290" y="182" text-anchor="middle" class="svg-muted" font-size="11">split: internet goes direct from the laptop</text>
<line x1="370" y1="115" x2="510" y2="150" stroke="#64748b" stroke-width="2"/><text x="440" y="143" text-anchor="middle" class="svg-muted" font-size="11">full: internet via firewall</text>
</svg><p class="cap">Split tunnelling sends only company traffic through the VPN; full tunnel sends everything.</p></div>

<h3>Split tunnelling versus full tunnel</h3>
<p>In a <b>full tunnel</b>, all of the client's traffic, including internet browsing, goes through the VPN to the FortiGate. This lets the company's security profiles inspect it, but uses bandwidth and requires a policy from <code>ssl.root</code> to the internet interface with NAT. In <b>split tunnelling</b>, only traffic to the networks you list (the <code>split-tunneling-routing-address</code> objects, for example <code>HQ-LAN</code>) is sent through the tunnel. Everything else leaves the laptop directly to the internet.</p>
<table class="cmp"><tr><th></th><th>Split tunnelling</th><th>Full tunnel</th></tr>
<tr><td>Bandwidth at HQ</td><td>Low</td><td>High</td></tr>
<tr><td>Internet inspection of user traffic</td><td>None from HQ</td><td>Inspected by the FortiGate</td></tr>
<tr><td>Exposure of the corporate network</td><td>Laptop is on home internet and the VPN at once</td><td>All traffic is through the company gateway</td></tr>
<tr><td>Performance for video calls and SaaS</td><td>Better</td><td>Slower, longer path</td></tr></table>
<p>Neither is right for everyone. Many companies use split tunnelling for performance and rely on endpoint security on the laptop, while regulated environments choose full tunnel. State the trade-off clearly in an exam or an interview.</p>

<h3>DNS and the client's routes</h3>
<p>With split tunnelling the FortiGate pushes routes for the listed networks to the client, plus the DNS servers set in the SSL VPN settings. Internal names resolve only if the client uses the internal DNS for those names. A common symptom is "I can reach 10.10.0.20 by address but not by name": check <code>dns-server1</code> and any DNS suffix settings.</p>

<div class="eg"><p><b>Worked example.</b> A user connects (tunnel address 10.99.0.20), but cannot open the file server at 10.10.0.20. The tunnel is up. The administrator checks: the policy from <code>ssl.root</code> to <code>port2</code> exists, the group matches, the service includes SMB, and the split-tunnel address is <code>HQ-LAN</code> (10.10.0.0/24). The server's default gateway is a different router that has no route to 10.99.0.0/24, so replies are lost. A route for the pool via the FortiGate on that router solves it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A pool overlapping the user's home network, so routes are ambiguous. Missing return route on internal servers. A split-tunnel address object that does not include a destination the user needs. A policy that matches the pool but not the group, or the group but not the interface. Full tunnel without a policy to the internet, so browsing breaks.</p></div>
<div class="exam"><p><b>Exam trap.</b> In tunnel mode, the policy's source interface is <code>ssl.root</code>. Split tunnelling decides what the client routes into the tunnel; the policy decides what the firewall allows. Both must be correct.</p></div>

<div class="scn"><h4>Everything slow after a full-tunnel rollout</h4><p>A company switched all remote staff to full tunnel for compliance. Video calls became choppy because every call now hopped through the head office link and back out. The team put a SaaS and video-conferencing exception into the design with a split-tunnel allowance for those destinations and approved endpoint protection for the rest. Call quality returned.</p><p><b>Lesson:</b> full tunnel is a security choice with a performance cost; design the exceptions deliberately.</p></div>

<div class="iv"><p class="q">"A user is connected to the SSL VPN but cannot reach an internal server. What do you check?"</p><p>The tunnel address and pool, the policy from ssl.root to the destination interface with the right group, service and objects, the split-tunnel routes pushed to the client, DNS if names fail, and the return route on the server to the pool. I confirm with the session table and the policy logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel-mode users arrive on ssl.root with an address from the pool.</li>
<li>Policies use ssl.root as the source interface and a group as a source condition.</li>
<li>Split tunnelling sends only listed networks through the VPN; full tunnel sends everything.</li>
<li>Servers need a return route to the pool.</li>
<li>Check DNS when names fail but addresses work.</li>
</ul></div>
`,hi:`
<p>Jo user authenticate ho gaya woh sirf building mein aaya hai. Woh kya reach kar sakta hai yeh <b>firewall policy</b>, <b>address pool</b> aur <b>routes</b> tay karte hain. Yeh chapter samjhata hai ki FortiGate tunnel-mode traffic kaise handle karta hai, split tunnelling kaise kaam karti hai, aur "main connected hoon lekin kuch reach nahi hota" ke common karan. Reference configuration <b>simulator mein nahi chalaye gaye</b>.</p>

<h3>ssl.root interface</h3>
<p>SSL VPN enable hone par FortiGate <b>ssl.root</b> naam ka special interface banata hai (root VDOM mein). Saare tunnel-mode users is interface par aate dikhte hain, source address <b>tunnel pool</b> se. Remote user access control karne wali policies mein aap <code>ssl.root</code> ko <b>source interface</b> ki tarah use karte ho, jaise LAN users ke liye <code>port2</code>.</p>

<h3>Address pool</h3>
<p>Pool IP range type ka address object hai, jaise 10.99.0.10 se 10.99.0.50. Har connected user ko ek address milta hai. Pool ko maximum simultaneous users plus headroom ke liye size karo. Pool LAN, doosre VPN ranges ya aam home networks se overlap nahi karna chahiye. Internal servers ko FortiGate ke through pool tak <b>return route</b> chahiye, jo aam taur par automatically hota hai agar FortiGate unka default gateway ho; woh doosra router use karte hon to FortiGate ki taraf point karta pool ka route add karo.</p>

<h3>Firewall policy</h3>
<p>Remote access policies normal policies jaisi dikhti hain, user group extra source condition ke roop mein:</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
config firewall policy
    edit 30
        set name "SSLVPN-to-fileserver"
        set srcintf "ssl.root"
        set dstintf "port2"
        set srcaddr "SSLVPN-POOL"
        set dstaddr "FILE-SERVER"
        set groups "SSLVPN-Users"
        set action accept
        set schedule "always"
        set service "SMB" "RDP"
        set logtraffic all
    next
end</pre>
<p>Yeh points yaad rakho. <b>NAT aam taur par off</b> hota hai, taaki server user ka tunnel address dekhe aur use log aur apne controls lagaye. Jahan users ki defined zaroorat hai wahan "all" nahi balki <b>specific destination objects aur services</b> use karo. <b>Har group aur purpose ke liye ek policy</b> rule base ko readable rakhti hai. Policies upar se neeche evaluate hoti hain, isliye check karo ki pehle wali policy traffic ko pehle na pakad le (<b>nse4-policy</b> dekho).</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Split tunnelling aur full tunnel">
<rect x="20" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="75" y="105" text-anchor="middle" class="svg-ink" font-size="12">Remote laptop</text>
<rect x="260" y="70" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="315" y="105" text-anchor="middle" class="svg-ink" font-size="12">FortiGate</text>
<rect x="510" y="20" width="110" height="50" rx="10" fill="#fde68a"/><text x="565" y="50" text-anchor="middle" class="svg-ink" font-size="12">Company LAN</text>
<rect x="510" y="130" width="110" height="50" rx="10" fill="#fed7aa"/><text x="565" y="160" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<line x1="130" y1="90" x2="260" y2="90" stroke="#64748b" stroke-width="3"/><text x="195" y="82" text-anchor="middle" class="svg-accent" font-size="11">tunnel se</text>
<line x1="370" y1="85" x2="510" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="75" y1="130" x2="75" y2="165" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="75" y1="165" x2="510" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="290" y="182" text-anchor="middle" class="svg-muted" font-size="11">split: internet laptop se seedha jaata hai</text>
<line x1="370" y1="115" x2="510" y2="150" stroke="#64748b" stroke-width="2"/><text x="440" y="143" text-anchor="middle" class="svg-muted" font-size="11">full: internet firewall se</text>
</svg><p class="cap">Split tunnelling sirf company traffic VPN se bhejti hai; full tunnel sab kuch.</p></div>

<h3>Split tunnelling aur full tunnel</h3>
<p><b>Full tunnel</b> mein client ka saara traffic, internet browsing sameet, VPN se FortiGate tak jaata hai. Isse company ke security profiles use inspect kar sakte hain, lekin bandwidth lagti hai aur <code>ssl.root</code> se internet interface tak NAT ke saath policy chahiye. <b>Split tunnelling</b> mein sirf un networks ka traffic tunnel se jaata hai jo aap list karte ho (<code>split-tunneling-routing-address</code> objects, jaise <code>HQ-LAN</code>). Baaki sab laptop se seedha internet par jaata hai.</p>
<table class="cmp"><tr><th></th><th>Split tunnelling</th><th>Full tunnel</th></tr>
<tr><td>HQ par bandwidth</td><td>Kam</td><td>Zyada</td></tr>
<tr><td>User traffic ka internet inspection</td><td>HQ se nahi</td><td>FortiGate inspect karta hai</td></tr>
<tr><td>Corporate network ka exposure</td><td>Laptop ek saath home internet aur VPN par hai</td><td>Saara traffic company gateway se</td></tr>
<tr><td>Video calls aur SaaS ke liye performance</td><td>Behtar</td><td>Slower, lamba path</td></tr></table>
<p>Dono mein se koi sab ke liye sahi nahi. Kai companies performance ke liye split tunnelling use karti hain aur laptop par endpoint security par nirbhar rehti hain, jabki regulated environments full tunnel chunte hain. Exam ya interview mein trade-off saaf bolo.</p>

<h3>DNS aur client ke routes</h3>
<p>Split tunnelling ke saath FortiGate listed networks ke routes client ko push karta hai, plus SSL VPN settings mein set DNS servers. Internal names tabhi resolve hote hain jab client un names ke liye internal DNS use kare. Common symptom: "10.10.0.20 address se pahunch jaata hoon lekin naam se nahi": <code>dns-server1</code> aur kisi bhi DNS suffix settings check karo.</p>

<div class="eg"><p><b>Worked example.</b> User connect hota hai (tunnel address 10.99.0.20), lekin 10.10.0.20 file server nahi khol paata. Tunnel up hai. Administrator check karta hai: <code>ssl.root</code> se <code>port2</code> ki policy hai, group match karta hai, service mein SMB hai, aur split-tunnel address <code>HQ-LAN</code> (10.10.0.0/24) hai. Server ka default gateway doosra router hai jiske paas 10.99.0.0/24 ka route nahi, isliye replies kho jaate hain. Us router par FortiGate ke through pool ka route add karne se solve ho jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> User ke home network se overlap karta pool, jisse routes ambiguous ho jaate hain. Internal servers par return route missing. Split-tunnel address object jisme user ko chahiye wali destination nahi. Policy jo pool se match kare lekin group se nahi, ya group se kare lekin interface se nahi. Internet ki policy ke bina full tunnel, jisse browsing toot jaati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tunnel mode mein policy ka source interface <code>ssl.root</code> hota hai. Split tunnelling tay karti hai ki client tunnel mein kya route karega; policy tay karti hai ki firewall kya allow karega. Dono sahi hone chahiye.</p></div>

<div class="scn"><h4>Full-tunnel rollout ke baad sab slow</h4><p>Ek company ne compliance ke liye saare remote staff ko full tunnel par kar diya. Video calls choppy ho gayi kyunki har call ab head office link se ghumkar bahar nikalti thi. Team ne design mein SaaS aur video-conferencing exception jodi, un destinations ke liye split-tunnel allowance aur baaki ke liye approved endpoint protection ke saath. Call quality wapas aa gayi.</p><p><b>Lesson:</b> full tunnel security choice hai jiski performance keemat hai; exceptions soch-samajhkar design karo.</p></div>

<div class="iv"><p class="q">"User SSL VPN se connected hai lekin internal server reach nahi kar paata. Kya check karoge?"</p><p>Tunnel address aur pool, sahi group, service aur objects ke saath ssl.root se destination interface tak policy, client ko push kiye split-tunnel routes, naam fail hon to DNS, aur server par pool ka return route. Main session table aur policy logs se confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel-mode users ssl.root par pool ke address ke saath aate hain.</li>
<li>Policies ssl.root ko source interface aur group ko source condition ki tarah use karti hain.</li>
<li>Split tunnelling sirf listed networks VPN se bhejti hai; full tunnel sab kuch.</li>
<li>Servers ko pool tak return route chahiye.</li>
<li>Naam fail hon lekin address chalte hon to DNS check karo.</li>
</ul></div>
`}};export{e as default};