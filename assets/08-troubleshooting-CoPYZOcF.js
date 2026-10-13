var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: "the profile does not work"`,hi:`Troubleshooting workflow: "profile kaam nahi kar raha"`},body:{en:`
<p>Tickets about security profiles come in two flavours: "something legitimate is blocked" and "something bad got through". The method is the same for both. Do not start by editing the profile. Start by proving the traffic reached the profile at all. Use this ladder, from the outside in.</p>

<h3>The six-step ladder</h3>
<ol>
<li><b>Which policy matched?</b> If the wrong policy (or the implicit deny) handled the session, profiles on the right policy never ran.</li>
<li><b>Does that policy carry the profile?</b> Check <code>utm-status</code>, the profile names, or the profile group.</li>
<li><b>Could the engine read the traffic?</b> Check the SSL/SSH inspection profile: encrypted content needs deep inspection.</li>
<li><b>Is the session new?</b> An old session keeps its old verdict.</li>
<li><b>Which engine decided?</b> Read the matching UTM log (web filter, application control, virus, IPS).</li>
<li><b>Are the databases current?</b> Check FortiGuard licence and update status.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="25" width="81" height="70" rx="10" fill="#bae6fd"/><text x="60.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.2">1 Policy</text><text x="60.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.2">which ID?</text><line x1="101" y1="60" x2="123" y2="60" stroke="#64748b" stroke-width="2"/><path d="M117 55 L123 60 L117 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="123" y="25" width="81" height="70" rx="10" fill="#bbf7d0"/><text x="163.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.2">2 Profile</text><text x="163.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.2">attached?</text><line x1="204" y1="60" x2="226" y2="60" stroke="#64748b" stroke-width="2"/><path d="M220 55 L226 60 L220 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="226" y="25" width="81" height="70" rx="10" fill="#ddd6fe"/><text x="266.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.2">3 SSL</text><text x="266.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.2">readable?</text><line x1="307" y1="60" x2="329" y2="60" stroke="#64748b" stroke-width="2"/><path d="M323 55 L329 60 L323 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="329" y="25" width="81" height="70" rx="10" fill="#fde68a"/><text x="369.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.2">4 Session</text><text x="369.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.2">new?</text><line x1="410" y1="60" x2="432" y2="60" stroke="#64748b" stroke-width="2"/><path d="M426 55 L432 60 L426 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="432" y="25" width="81" height="70" rx="10" fill="#fed7aa"/><text x="472.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.2">5 Logs</text><text x="472.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.2">which engine?</text><line x1="513" y1="60" x2="535" y2="60" stroke="#64748b" stroke-width="2"/><path d="M529 55 L535 60 L529 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="535" y="25" width="81" height="70" rx="10" fill="#bae6fd"/><text x="575.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.2">6 Updates</text><text x="575.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.2">current?</text>
</svg><p class="cap">Work from the policy inward; most "profile problems" are fixed in steps 1 to 4.</p></div>

<h3>Steps 1 and 4 with real simulator output</h3>
<p>The simulator runs the policy engine, so you can practise steps 1 and 4 exactly as on a FortiGate. The next excerpts were captured from the <b>nse4-diag</b> lab (policy 2 LAN-to-DMZ, PC1 10.0.1.10 to server 10.0.2.10). First the debug flow when no policy allows the traffic:</p>
<pre class="out">diagnose debug flow filter addr 10.0.2.10
diagnose debug flow show function-name enable
diagnose debug flow trace start 10
diagnose debug enable
<span class="hl">... msg="Denied by forward policy check (policy 0)"</span></pre>
<p>Policy 0 is the implicit deny. No profile can run on a denied session. After the policy is corrected, the same flow shows which policy allows it:</p>
<pre class="out">... msg="find a route: flag=04000000 gw-10.0.2.10 via port3"
... msg="in-[port2], out-[port3], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
<span class="hl">... msg="Allowed by Policy-2:"</span></pre>
<p>Notice <code>app_id: 0, url_cat_id: 0</code>: these are the application and URL category IDs the kernel knows for the session. On a policy with profiles and inspected traffic they become non-zero after identification. In the session table the same idea appears:</p>
<pre class="out">diagnose sys session filter dst 10.0.2.10
diagnose sys session list
...
<span class="hl">misc=0 policy_id=2</span> pol_uuid_idx=16 auth_info=0 chk_client_info=0 vd=0
serial=000025d1 tos=ff/ff <span class="hl">app_list=0 app=0 url_cat=0</span></pre>
<p>Here the session was built by policy 2 and no application list or URL category is bound, which is what you expect for a policy without profiles. If you attach profiles and the session still shows zeros for traffic that should be identified, the engine could not read it or the profile was not applied.</p>
<p>You can also ask the policy lookup tool which policy a hypothetical packet will match, without sending traffic:</p>
<pre class="out">diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2
<span class="hl">&lt;src [10.0.1.10-12345] dst [10.0.2.10-80] proto tcp dev port2&gt; matches policy id: 2</span></pre>

<h3>Steps 2, 3, 5, 6 on a real FortiGate</h3>
<p><b>Reference commands (not run in the simulator)</b></p>
<pre class="code"><span class="c"># step 2: what does the policy contain?</span>
show full-configuration firewall policy 10
<span class="c"># step 5: the engine's log</span>
execute log filter category 3
execute log display
<span class="c"># step 6: FortiGuard and signature versions</span>
get system status
diagnose autoupdate versions
<span class="c"># web filter rating debug (turn it off afterwards)</span>
diagnose debug application urlfilter -1
diagnose debug enable
diagnose debug disable
diagnose debug reset</pre>
<p>Keep debug short and always finish with <code>diagnose debug disable</code> and <code>diagnose debug reset</code>, as practised in the nse4-diag lab.</p>

<h3>Typical root causes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Blocked site loads</td><td>Wrong policy, old session, URL filter allow/exempt entry</td><td>policy ID, clear session, URL list</td></tr>
<tr><td>HTTPS path not filtered</td><td>No deep inspection</td><td>ssl-ssh-profile</td></tr>
<tr><td>Wrong category</td><td>FortiGuard rating or cache</td><td>local rating, log catdesc</td></tr>
<tr><td>App not identified</td><td>Encrypted, unknown, no signature</td><td>deep inspection, log</td></tr>
<tr><td>Download not scanned</td><td>Encrypted, oversize, archive</td><td>SSL profile, size limit</td></tr>
<tr><td>Everything slow</td><td>Proxy mode, too many signatures, deep inspection CPU</td><td>mode, sensor scope</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "royal-casino.example opens for the sales team only." Step 1: the sales team's addresses match policy 12, an older policy above the staff policy, with no web filter. The new staff policy 10 was never reached. Fix: move the policy order or add the profile group to policy 12. Step 4: clear sessions for the sales PCs and retest.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the profile five times before looking at the policy ID. Rule order decides: the first matching policy handles the traffic. A broad rule above a specific one causes most "ignored profile" tickets.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy 0 in the debug flow is the implicit deny. Existing sessions keep the policy and verdict that created them. A profile on policy B does nothing if policy A, higher in the list, matches first.</p></div>

<div class="scn"><h4>"Antivirus never alerts" at the Pune branch</h4><p>The branch said no malware was ever detected, so antivirus must be broken. The engineer traced the path: policy ID correct, antivirus profile attached, session new. The SSL profile was no-inspection and nearly all downloads were over HTTPS, so the AV engine saw only encrypted bytes. The team moved the staff policy to deep inspection with banking and health exemptions, and detections appeared in the first week.</p><p><b>Lesson:</b> silence is not proof of safety; verify the engine can see the traffic.</p></div>

<div class="iv"><p class="q">"A user says a blocked site is still reachable. Walk me through your troubleshooting."</p><p>I confirm the exact URL and source address, find which policy the session matches with the debug flow or the session table, check that policy has the web filter profile, check whether the traffic is HTTPS and what SSL profile applies, clear the session and retest, then read the web filter log for the category and action, and finally check FortiGuard status and any URL filter exemption.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prove the traffic reached the profile: policy ID, attachment, readability, new session.</li>
<li>Policy 0 in the debug flow means implicit deny; no profile can run.</li>
<li>The session table shows policy_id, app_list, app and url_cat.</li>
<li>Use the engine's own log category to see who decided.</li>
<li>Keep debug filtered and short; disable and reset when done.</li>
</ul></div>
`,hi:`
<p>Security profiles ke tickets do tarah ke aate hain: "kuch legitimate block ho gaya" aur "kuch bura nikal gaya". Method dono ke liye same hai. Profile edit karke shuru mat karo. Pehle saabit karo ki traffic profile tak pahuncha bhi ya nahi. Yeh ladder use karo, bahar se andar ki taraf.</p>

<h3>Chhe step ki ladder</h3>
<ol>
<li><b>Kaunsi policy match hui?</b> Galat policy (ya implicit deny) ne session handle kiya to sahi policy ke profiles kabhi chale hi nahi.</li>
<li><b>Kya us policy mein profile hai?</b> <code>utm-status</code>, profile names ya profile group check karo.</li>
<li><b>Kya engine traffic padh sakta tha?</b> SSL/SSH inspection profile check karo: encrypted content ko deep inspection chahiye.</li>
<li><b>Kya session naya hai?</b> Purana session purana verdict rakhta hai.</li>
<li><b>Kaunse engine ne decide kiya?</b> Matching UTM log (web filter, application control, virus, IPS) padho.</li>
<li><b>Kya databases current hain?</b> FortiGuard licence aur update status check karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="25" width="81" height="70" rx="10" fill="#bae6fd"/><text x="60.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">1 Policy</text><text x="60.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">kaunsi ID?</text><line x1="101" y1="60" x2="123" y2="60" stroke="#64748b" stroke-width="2"/><path d="M117 55 L123 60 L117 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="123" y="25" width="81" height="70" rx="10" fill="#bbf7d0"/><text x="163.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">2 Profile</text><text x="163.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">attached?</text><line x1="204" y1="60" x2="226" y2="60" stroke="#64748b" stroke-width="2"/><path d="M220 55 L226 60 L220 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="226" y="25" width="81" height="70" rx="10" fill="#ddd6fe"/><text x="266.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">3 SSL</text><text x="266.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">readable?</text><line x1="307" y1="60" x2="329" y2="60" stroke="#64748b" stroke-width="2"/><path d="M323 55 L329 60 L323 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="329" y="25" width="81" height="70" rx="10" fill="#fde68a"/><text x="369.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">4 Session</text><text x="369.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">naya?</text><line x1="410" y1="60" x2="432" y2="60" stroke="#64748b" stroke-width="2"/><path d="M426 55 L432 60 L426 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="432" y="25" width="81" height="70" rx="10" fill="#fed7aa"/><text x="472.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">5 Logs</text><text x="472.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">kaunsa engine?</text><line x1="513" y1="60" x2="535" y2="60" stroke="#64748b" stroke-width="2"/><path d="M529 55 L535 60 L529 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="535" y="25" width="81" height="70" rx="10" fill="#bae6fd"/><text x="575.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">6 Updates</text><text x="575.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">current?</text>
</svg><p class="cap">Policy se andar ki taraf chalo; zyadatar "profile problems" step 1 se 4 mein theek ho jaati hain.</p></div>

<h3>Step 1 aur 4 real simulator output ke saath</h3>
<p>Simulator policy engine chalata hai, isliye step 1 aur 4 ki practice bilkul FortiGate jaise kar sakte ho. Agle excerpts <b>nse4-diag</b> lab (policy 2 LAN-to-DMZ, PC1 10.0.1.10 se server 10.0.2.10) se capture kiye gaye. Pehle debug flow jab koi policy traffic allow nahi karti:</p>
<pre class="out">diagnose debug flow filter addr 10.0.2.10
diagnose debug flow show function-name enable
diagnose debug flow trace start 10
diagnose debug enable
<span class="hl">... msg="Denied by forward policy check (policy 0)"</span></pre>
<p>Policy 0 implicit deny hai. Denied session par koi profile nahi chal sakta. Policy theek hone ke baad wahi flow dikhata hai ki kaunsi policy allow karti hai:</p>
<pre class="out">... msg="find a route: flag=04000000 gw-10.0.2.10 via port3"
... msg="in-[port2], out-[port3], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
<span class="hl">... msg="Allowed by Policy-2:"</span></pre>
<p><code>app_id: 0, url_cat_id: 0</code> dekho: yeh application aur URL category IDs hain jo kernel ko session ke liye pata hain. Profiles wali policy par inspected traffic ke liye pehchaan ke baad yeh non-zero ho jaate hain. Session table mein wahi idea aise dikhta hai:</p>
<pre class="out">diagnose sys session filter dst 10.0.2.10
diagnose sys session list
...
<span class="hl">misc=0 policy_id=2</span> pol_uuid_idx=16 auth_info=0 chk_client_info=0 vd=0
serial=000025d1 tos=ff/ff <span class="hl">app_list=0 app=0 url_cat=0</span></pre>
<p>Yahan session policy 2 ne banaya aur koi application list ya URL category bound nahi hai, jo bina profiles wali policy ke liye expected hai. Profiles lagane ke baad bhi jo traffic pehchana jaana chahiye uske liye session zeros dikhaye, to engine padh nahi paya ya profile apply nahi hua.</p>
<p>Policy lookup tool se bhi pooch sakte ho ki hypothetical packet kaunsi policy match karega, traffic bheje bina:</p>
<pre class="out">diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2
<span class="hl">&lt;src [10.0.1.10-12345] dst [10.0.2.10-80] proto tcp dev port2&gt; matches policy id: 2</span></pre>

<h3>Step 2, 3, 5, 6 real FortiGate par</h3>
<p><b>Reference commands (not run in the simulator)</b></p>
<pre class="code"><span class="c"># step 2: policy mein kya hai?</span>
show full-configuration firewall policy 10
<span class="c"># step 5: engine ka log</span>
execute log filter category 3
execute log display
<span class="c"># step 6: FortiGuard aur signature versions</span>
get system status
diagnose autoupdate versions
<span class="c"># web filter rating debug (baad mein band karo)</span>
diagnose debug application urlfilter -1
diagnose debug enable
diagnose debug disable
diagnose debug reset</pre>
<p>Debug chhota rakho aur hamesha <code>diagnose debug disable</code> aur <code>diagnose debug reset</code> par khatam karo, jaise nse4-diag lab mein practice kiya.</p>

<h3>Typical root causes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Blocked site load ho raha hai</td><td>Galat policy, purana session, URL filter allow/exempt entry</td><td>policy ID, session clear, URL list</td></tr>
<tr><td>HTTPS path filter nahi hua</td><td>Deep inspection nahi</td><td>ssl-ssh-profile</td></tr>
<tr><td>Galat category</td><td>FortiGuard rating ya cache</td><td>local rating, log catdesc</td></tr>
<tr><td>App pehchani nahi gayi</td><td>Encrypted, unknown, signature nahi</td><td>deep inspection, log</td></tr>
<tr><td>Download scan nahi hua</td><td>Encrypted, oversize, archive</td><td>SSL profile, size limit</td></tr>
<tr><td>Sab slow</td><td>Proxy mode, bahut signatures, deep inspection CPU</td><td>mode, sensor scope</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "royal-casino.example sirf sales team ke liye khulta hai." Step 1: sales team ke addresses policy 12 se match karte hain, jo staff policy ke upar purani policy hai aur uspar web filter nahi. Nayi staff policy 10 tak traffic gaya hi nahi. Fix: policy order badlo ya policy 12 mein profile group jodo. Step 4: sales PCs ke sessions clear karo aur retest.</p></div>

<div class="warn"><p><b>Common mistake.</b> Policy ID dekhne se pehle profile paanch baar badalna. Rule order decide karta hai: pehli matching policy traffic handle karti hai. Specific ke upar broad rule zyadatar "profile ignore hua" tickets ki wajah hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Debug flow mein policy 0 implicit deny hai. Existing sessions apni policy aur verdict rakhte hain. Policy B ka profile kuch nahi karta agar list mein upar wali policy A pehle match kare.</p></div>

<div class="scn"><h4>Pune branch mein "Antivirus kabhi alert nahi karta"</h4><p>Branch ne kaha ki kabhi malware detect nahi hua, isliye antivirus toota hoga. Engineer ne path trace kiya: policy ID sahi, antivirus profile attached, session naya. SSL profile no-inspection tha aur lagbhag saare downloads HTTPS par the, isliye AV engine ko sirf encrypted bytes dikhe. Team ne staff policy ko banking aur health exemptions ke saath deep inspection par move kiya, aur pehle hafte mein detections aane lage.</p><p><b>Lesson:</b> khamoshi safety ka saboot nahi hai; verify karo ki engine traffic dekh sakta hai.</p></div>

<div class="iv"><p class="q">"User kehta hai blocked site abhi bhi khul rahi hai. Troubleshooting kaise karoge?"</p><p>Exact URL aur source address confirm karta hoon, debug flow ya session table se dekhta hoon session kaunsi policy match karta hai, check karta hoon us policy mein web filter profile hai, dekhta hoon traffic HTTPS hai ya nahi aur kaunsa SSL profile lagta hai, session clear karke retest karta hoon, phir category aur action ke liye web filter log padhta hoon, aur aakhir mein FortiGuard status aur koi URL filter exemption check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saabit karo ki traffic profile tak pahuncha: policy ID, attachment, readability, naya session.</li>
<li>Debug flow mein policy 0 matlab implicit deny; koi profile nahi chal sakta.</li>
<li>Session table policy_id, app_list, app aur url_cat dikhata hai.</li>
<li>Engine ki apni log category se dekho kisne decide kiya.</li>
<li>Debug filtered aur chhota rakho; kaam ke baad disable aur reset.</li>
</ul></div>
`}};export{e as default};