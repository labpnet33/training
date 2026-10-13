var e={id:`troubleshooting`,h:{en:`Troubleshooting User-ID and GlobalProtect`,hi:`User-ID aur GlobalProtect troubleshooting`},body:{en:`

<p><b>Identity problems look like policy problems.</b> A user complains "I cannot reach the build server". The rule looks right. The real cause is that the firewall does not know who the user is. This chapter gives a method to separate the layers: mapping, group, zone, rule, and for remote users the tunnel.</p>

<h3>Analogy: the guard who cannot find your name</h3>
<p>If the guard turns you away, the reason could be: your badge was never scanned (no mapping), your name is not on the staff list (group), the door is not watching badges (zone), the door rule is wrong (policy), or you are not yet inside the compound at all (tunnel). You check them in that order, because each depends on the one before.</p>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Identity troubleshooting order"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Is there a mapping for the IP?</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">IP-user mapping table, session src user</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. Is the user in the group?</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">group list and members</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Is User-ID enabled on the source zone?</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">zone setting</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Does the rule match?</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">test and session rule line</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Remote only: is the tunnel up?</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">gateway current users, pool routing</text></svg><p class="cap">Five checks, in order, for an identity-based ticket.</p></div>

<h3>Step 1: is the user known?</h3>
<p>The most informative field is <code>src user</code> in the session detail. On the lab firewall it is always unknown, which is the picture of a missing mapping:</p>
<pre class="out">PA1&gt; show session id 9361
	c2s flow:
		source:      10.0.1.10 [trust]
		dst:         8.8.8.8
		<span class="hl">src user:    unknown</span>
	...
	rule                                 : Allow-Out</pre>
<p>The rule shown is <code>Allow-Out</code>, a rule without a user condition. This tells you what a user-specific rule would have faced: an unknown user cannot match it, so the session fell to a general rule. On a real firewall also check the mapping table directly. Reference commands (not run in the simulator, no output shown):</p>
<pre class="code">show user ip-user-mapping all
show user ip-user-mapping ip 10.0.1.10
show user user-id-agent state all
show user server-monitor state all</pre>
<ul>
<li><code>ip-user-mapping</code> lists the table; the entry shows the user and the <b>source</b> of the mapping (for example the log monitor or GlobalProtect).</li>
<li><code>server-monitor state</code> and <code>user-id-agent state</code> show whether each domain controller or agent is connected.</li>
</ul>
<p>No mapping? Check that the user actually logged in recently, that the IP is in the include list (and not excluded), that the service account can read the controller, and that the firewall can reach the controller on the required ports.</p>

<h3>Step 2: group membership</h3>
<p>Reference commands: <code>show user group list</code> and <code>show user group name "cn=engineers,ou=groups,dc=acme,dc=example"</code>. If the user is missing, check the directory itself, the include list, nested groups and the last update time (<code>show user group-mapping state all</code>).</p>

<h3>Step 3: zone and rule</h3>
<p>These you can practise. Confirm the source zone with <code>show interface all</code> and the zone setting, then see which rule the packet matches with the test command:</p>
<pre class="out">PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
"Allow-Out; index: 1" {
        from trust;
        to untrust;
        application/service [ ping dns web-browsing ssl ]/application-default;
        <span class="hl">action allow;</span>
        terminal yes;
}</pre>
<p>Remember the simulator limitation: it does not evaluate users. On a real firewall the test command accepts a source user so that you can test as a specific person (check the options in your release).</p>

<h3>Step 4 for remote users: the tunnel</h3>
<p>Reference commands: <code>show global-protect-gateway current-user</code> lists connected users with their tunnel IP, and <code>show global-protect-portal statistics</code> and <code>show global-protect-gateway statistics</code> give counters. On the client, the GlobalProtect app has a troubleshooting view and collects logs. In the firewall, GlobalProtect login events appear in the system log.</p>
<p>Then use the tools you already know. For a tunnelled user at 10.250.0.5, check the route for the pool, a session from the VPN zone, and global counters:</p>
<pre class="out">PA1&gt; show routing route
...
10.0.1.0/24     10.0.1.1     0   A C   ethernet1/2
10.0.2.0/24     10.0.2.1     0   A C   ethernet1/3
...</pre>
<p>(The output is trimmed to the lines that matter.) If the tunnel pool has no route on the return path, replies never come back, as in the previous chapter.</p>

<table class="cmp"><tr><th>Symptom</th><th>First suspect</th></tr>
<tr><td>Rule for a group never matches</td><td>No mapping, wrong name format, or User-ID not enabled on the zone</td></tr>
<tr><td>Mapping exists but user shows as another person</td><td>Shared IP (NAT, terminal server) or stale mapping</td></tr>
<tr><td>Remote user cannot connect</td><td>Portal certificate not trusted, authentication failure, port 443 or UDP 4501 blocked</td></tr>
<tr><td>Connected but no access</td><td>Rule for the VPN zone, route for the client pool, NAT, or HIP profile not matching</td></tr>
<tr><td>Works internally, fails remotely</td><td>Internal host detection result differs; wrong gateway selected</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A contractor reports "VPN connects, internal site fails". The engineer sees the user connected on the gateway with tunnel IP 10.250.0.9, runs a policy test from the VPN zone, and finds the user falls to the default deny because the HIP profile requires disk encryption, which is not enabled on the contractor laptop. The contractor enables it, and the rule matches.</p></div>

<div class="warn"><p><b>Common mistake.</b> Editing rules before checking the mapping. If the user is unknown, no change to the rule will help, and you may open access to everyone by loosening the rule. Check identity first, then policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> Troubleshooting order for identity tickets: mapping, group, zone enablement, rule, then tunnel. Know the commands show user ip-user-mapping, show user group list and show global-protect-gateway current-user.</p></div>

<div class="scn"><h4>The group rule that was fine</h4><p>A new hire could not reach a tool that her team could. Everyone insisted the rule was correct. The mapping table had her laptop, but her account was created in an organisational unit not covered by the group mapping base. After the base DN was widened and the next update ran, the rule matched.</p><p><b>Lesson:</b> When a rule looks right, the user data is often wrong. Verify the mapping and the group before touching policy.</p></div>

<div class="iv"><p class="q">"A user says they lost access after a change, and the rule names their group. How do you troubleshoot?"</p><p>I check for a current IP-user mapping for their address and the source in the mapping, then group membership with show user group name, then that User-ID is enabled on the source zone, and finally which rule matches. For a remote user I also check the gateway current-user list and routing for the client pool. I only change policy after identity is confirmed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check in order: mapping, group, zone, rule, tunnel.</li>
<li>src user unknown in the session means no mapping.</li>
<li>Real commands: show user ip-user-mapping, show user group list, show global-protect-gateway current-user.</li>
<li>Remote users also need pool routing, NAT and matching HIP.</li>
<li>Never loosen a rule before identity is confirmed.</li>
</ul></div>

`,hi:`

<p><b>Identity problems policy problems jaisi dikhti hain.</b> User shikayat karta hai "main build server tak nahi pahunch pa raha". Rule sahi dikhti hai. Asli wajah yeh hai ki firewall ko pata hi nahi user kaun hai. Yeh chapter layers alag karne ka tareeka deta hai: mapping, group, zone, rule, aur remote users ke liye tunnel.</p>

<h3>Analogy: guard jise aapka naam nahi mil raha</h3>
<p>Guard aapko wapas bheje to wajah ho sakti hai: aapka badge kabhi scan hi nahi hua (mapping nahi), aapka naam staff list mein nahi (group), darwaza badges dekh hi nahi raha (zone), darwaze ki rule galat hai (policy), ya aap abhi compound ke andar hi nahi ho (tunnel). Aap inhe isi order mein check karte ho, kyunki har ek pichhle par depend karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Identity troubleshooting order"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. IP ka mapping hai?</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">IP-user mapping table, session src user</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. User group mein hai?</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">group list aur members</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Source zone par User-ID enabled hai?</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">zone setting</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Rule match hoti hai?</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">test aur session rule line</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Sirf remote: tunnel up hai?</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">gateway current users, pool routing</text></svg><p class="cap">Identity-based ticket ke liye paanch checks, order mein.</p></div>

<h3>Step 1: user known hai?</h3>
<p>Sabse informative field session detail ki <code>src user</code> hai. Lab firewall par woh hamesha unknown hai, jo missing mapping ki tasveer hai:</p>
<pre class="out">PA1&gt; show session id 9361
	c2s flow:
		source:      10.0.1.10 [trust]
		dst:         8.8.8.8
		<span class="hl">src user:    unknown</span>
	...
	rule                                 : Allow-Out</pre>
<p>Dikhi rule <code>Allow-Out</code> hai, jisme user condition nahi hai. Yeh batata hai ki user-specific rule ke saamne kya hota: unknown user use match nahi kar sakta, isliye session general rule par gira. Real firewall par mapping table bhi seedha dekho. Reference commands (not run in the simulator, output nahi dikhaya):</p>
<pre class="code">show user ip-user-mapping all
show user ip-user-mapping ip 10.0.1.10
show user user-id-agent state all
show user server-monitor state all</pre>
<ul>
<li><code>ip-user-mapping</code> table list karta hai; entry mein user aur mapping ka <b>source</b> dikhta hai (jaise log monitor ya GlobalProtect).</li>
<li><code>server-monitor state</code> aur <code>user-id-agent state</code> dikhate hain ki har domain controller ya agent connected hai ya nahi.</li>
</ul>
<p>Mapping nahi? Check karo ki user ne haal mein login kiya hai, IP include list mein hai (aur excluded nahi), service account controller padh sakta hai, aur firewall controller tak zaroori ports par pahunch sakta hai.</p>

<h3>Step 2: group membership</h3>
<p>Reference commands: <code>show user group list</code> aur <code>show user group name "cn=engineers,ou=groups,dc=acme,dc=example"</code>. User missing ho to directory khud, include list, nested groups aur last update time (<code>show user group-mapping state all</code>) check karo.</p>

<h3>Step 3: zone aur rule</h3>
<p>Yeh aap practise kar sakte ho. Source zone <code>show interface all</code> aur zone setting se confirm karo, phir test command se dekho packet kaunsi rule match karta hai:</p>
<pre class="out">PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
"Allow-Out; index: 1" {
        from trust;
        to untrust;
        application/service [ ping dns web-browsing ssl ]/application-default;
        <span class="hl">action allow;</span>
        terminal yes;
}</pre>
<p>Simulator ki limitation yaad rakho: woh users evaluate nahi karta. Real firewall par test command source user leta hai taaki aap kisi specific insaan ki tarah test kar sako (apne release ke options check karo).</p>

<h3>Remote users ke liye step 4: tunnel</h3>
<p>Reference commands: <code>show global-protect-gateway current-user</code> connected users ko tunnel IP ke saath list karta hai, aur <code>show global-protect-portal statistics</code> aur <code>show global-protect-gateway statistics</code> counters dete hain. Client par GlobalProtect app ka troubleshooting view hota hai aur woh logs collect karta hai. Firewall mein GlobalProtect login events system log mein aate hain.</p>
<p>Phir woh tools use karo jo aap jaante ho. 10.250.0.5 par tunnelled user ke liye pool ka route, VPN zone ka session aur global counters check karo:</p>
<pre class="out">PA1&gt; show routing route
...
10.0.1.0/24     10.0.1.1     0   A C   ethernet1/2
10.0.2.0/24     10.0.2.1     0   A C   ethernet1/3
...</pre>
<p>(Output zaroori lines tak trim hai.) Return path par tunnel pool ka route na ho to replies wapas nahi aate, jaisa pichhle chapter mein tha.</p>

<table class="cmp"><tr><th>Symptom</th><th>Pehla shak</th></tr>
<tr><td>Group ki rule kabhi match nahi hoti</td><td>Mapping nahi, name format galat, ya zone par User-ID enabled nahi</td></tr>
<tr><td>Mapping hai lekin user kisi aur insaan jaisa dikhta hai</td><td>Shared IP (NAT, terminal server) ya stale mapping</td></tr>
<tr><td>Remote user connect nahi kar pa raha</td><td>Portal certificate trusted nahi, authentication failure, port 443 ya UDP 4501 blocked</td></tr>
<tr><td>Connected lekin access nahi</td><td>VPN zone ki rule, client pool ka route, NAT, ya HIP profile match nahi</td></tr>
<tr><td>Andar chalta hai, remote fail</td><td>Internal host detection ka result alag; galat gateway chuna gaya</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Contractor shikayat karta hai "VPN connect ho jaata hai, internal site fail". Engineer gateway par user ko tunnel IP 10.250.0.9 ke saath connected dekhta hai, VPN zone se policy test chalata hai, aur dekhta hai ki user default deny par gira kyunki HIP profile ko disk encryption chahiye, jo contractor laptop par enabled nahi. Contractor use enable karta hai, aur rule match hoti hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Mapping check kiye bina rules edit karna. User unknown ho to rule mein koi change madad nahi karega, aur rule dheeli karke aap sabke liye access khol sakte ho. Pehle identity check karo, phir policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> Identity tickets ka troubleshooting order: mapping, group, zone enablement, rule, phir tunnel. Commands yaad rakho: show user ip-user-mapping, show user group list aur show global-protect-gateway current-user.</p></div>

<div class="scn"><h4>Group rule jo theek thi</h4><p>Nayi hire woh tool use nahi kar pa rahi thi jo uski team kar sakti thi. Sab kehte rahe rule sahi hai. Mapping table mein uska laptop tha, lekin uska account aise organisational unit mein bana tha jo group mapping base mein cover nahi tha. Base DN badhane aur agle update ke baad rule match hui.</p><p><b>Lesson:</b> Rule sahi lage to aksar user data galat hota hai. Policy chhuney se pehle mapping aur group verify karo.</p></div>

<div class="iv"><p class="q">"User kehta hai change ke baad access chala gaya, aur rule uska group naam leti hai. Troubleshoot kaise karoge?"</p><p>Pehle uske address ka current IP-user mapping aur mapping ka source check karta hoon, phir show user group name se group membership, phir source zone par User-ID enabled hai ya nahi, aur aakhir mein kaunsi rule match hoti hai. Remote user ho to gateway current-user list aur client pool ki routing bhi dekhta hoon. Policy tabhi badalta hoon jab identity confirm ho jaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein check karo: mapping, group, zone, rule, tunnel.</li>
<li>Session mein src user unknown ka matlab mapping nahi.</li>
<li>Real commands: show user ip-user-mapping, show user group list, show global-protect-gateway current-user.</li>
<li>Remote users ko pool routing, NAT aur matching HIP bhi chahiye.</li>
<li>Identity confirm hone se pehle rule kabhi dheeli mat karo.</li>
</ul></div>

`}};export{e as default};