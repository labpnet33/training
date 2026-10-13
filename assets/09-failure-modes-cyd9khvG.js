var e={id:`failure-modes`,h:{en:`Failure modes catalogue`,hi:`Failure modes ki catalogue`},body:{en:`
<p>A doctor learns diseases as patterns: "this symptom, this test, this cause". An onboarding engineer should do the same. Almost every failed onboarding falls into one of eight patterns. Learn each pattern's <b>symptom</b>, <b>the evidence that proves it</b> and <b>the right place to fix it</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Failure points on the path">
<rect x="10" y="70" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="100" text-anchor="middle" class="svg-ink" font-size="13">Branch</text>
<rect x="270" y="70" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Controller</text>
<rect x="530" y="70" width="100" height="50" rx="8" fill="#bae6fd"/><text x="580" y="100" text-anchor="middle" class="svg-ink" font-size="13">Director</text>
<line x1="110" y1="95" x2="270" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="95" x2="530" y2="95" stroke="#64748b" stroke-width="2"/>
<circle cx="190" cy="95" r="13" fill="#fed7aa"/><text x="190" y="100" text-anchor="middle" class="svg-ink" font-size="13">1</text>
<circle cx="450" cy="95" r="13" fill="#fed7aa"/><text x="450" y="100" text-anchor="middle" class="svg-ink" font-size="13">2</text>
<circle cx="320" cy="150" r="13" fill="#fed7aa"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">3</text>
<circle cx="580" cy="150" r="13" fill="#fed7aa"/><text x="580" y="155" text-anchor="middle" class="svg-ink" font-size="13">4-8</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">1 underlay  2 Director link  3 registration  4 to 8 Director data and deploy</text>
</svg><p class="cap">The failure patterns sit at different points of the path; find the point first.</p></div>

<h3>1. Controller unreachable</h3>
<p><b>Symptom:</b> Staging failed. <b>Evidence:</b></p>
<pre class="out">admin@Branch3-cli&gt; show system staging status
Serial: VOS-BR3-0001
Controller: 198.51.100.20
<span class="hl">State: Staging failed</span>
Detail: Controller 198.51.100.20 is unreachable from this branch (check WAN address, gateway and default route)</pre>
<p><b>Fix at the branch:</b> WAN address, gateway, default route in the Internet transport VR. Prove with <code>ping 198.51.100.20</code>. Also check that the staged Controller address is correct. Remember the underlay lesson: you cannot have an overlay without an underlay.</p>

<h3>2. Controller has no Director link</h3>
<p><b>Symptom:</b> Staging failed, with a Detail that the Controller has no Director configured, or points to an address that is not a Director, or cannot reach it. <b>Evidence:</b> <code>show system director status</code> on the Controller. <b>Fix at the Controller:</b> <code>set system director 198.51.100.10</code>, then check reachability.</p>

<h3>3. Controller not registered in the Director</h3>
<p><b>Symptom:</b> Staging failed: "Controller Controller-1 is not registered in the Director". <b>Evidence:</b> <code>show controllers</code> on the Director shows no entry for 198.51.100.20. <b>Fix at the Director:</b> <code>set director controllers Controller-1 address 198.51.100.20</code> and commit. Items 2 and 3 are one pair: both sides must know each other.</p>

<h3>4. Serial mismatch</h3>
<p><b>Symptom:</b> Rejected. <b>Evidence:</b></p>
<pre class="out">State: Rejected
Detail: Serial VOS-BR3-0001 is not in the Director device list (bind data / serial number mismatch)</pre>
<p>Compare the serial on the branch with <code>show devices brief</code> on the Director. Typical causes: letter O for zero, a transposed digit, or the device never created. <b>Fix at the Director:</b> correct the serial. Do <i>not</i> change the branch.</p>

<h3>5. Workflow not deployed</h3>
<p><b>Symptom:</b> Staged - waiting for Director. <b>Evidence:</b> Detail says the device has not been deployed; <code>show devices brief</code> shows Deployed = no. <b>Fix:</b> <code>request devices workflow deploy device Branch3</code>.</p>

<h3>6. Missing group, template or tenant</h3>
<p><b>Symptom:</b> Post-staging failed with details such as "not in a device group that exists", "uses template X which does not exist" or "template has no organization (tenant)". <b>Evidence:</b> <code>show devices device Branch3</code>, <code>show device-groups</code>, <code>show templates</code>. <b>Fix at the Director.</b></p>

<h3>7. Missing bind data</h3>
<p><b>Symptom:</b> Post-staging failed: "Bind data incomplete for Branch3: wan2-gateway". <b>Evidence:</b> <code>Missing bind data</code> line in the device detail. <b>Fix:</b> set the missing key and commit.</p>

<h3>8. Wrong value after a successful push</h3>
<p><b>Symptom:</b> Online, but a tunnel stays down or the LAN is wrong. The bind data is complete but incorrect: gateway outside the subnet, wrong prefix, wrong site-id. <b>Evidence:</b> overlay brief shows the failing transport and its reason; underlay ping to the carrier gateway fails. <b>Fix in the Director bind data, then redeploy.</b> Pushed lines are read-only on the branch.</p>

<div class="eg"><p><b>Worked example.</b> Read this status: <code>State: Post-staging failed. Detail: Bind data incomplete for Branch3: wan2-gateway</code>. The layer is post-staging data; staging and serial already passed (otherwise you would see an earlier state). The fix is one command in the Director. You never need to touch the branch. This is the value of the ordered state machine: it rules out layers for you.</p></div>

<h3>Quick catalogue</h3>
<table class="cmp"><tr><th>#</th><th>State</th><th>Fix location</th></tr>
<tr><td>1</td><td>Staging failed (unreachable)</td><td>Branch underlay</td></tr>
<tr><td>2</td><td>Staging failed (no Director)</td><td>Controller</td></tr>
<tr><td>3</td><td>Staging failed (not registered)</td><td>Director</td></tr>
<tr><td>4</td><td>Rejected</td><td>Director serial</td></tr>
<tr><td>5</td><td>Staged - waiting</td><td>Director deploy</td></tr>
<tr><td>6, 7</td><td>Post-staging failed</td><td>Director objects, bind data</td></tr>
<tr><td>8</td><td>Online but broken</td><td>Director data, then redeploy</td></tr></table>

<div class="warn"><p><b>Common mistakes:</b> fixing on the branch what the Director owns; changing several things at once so you cannot tell what worked; skipping the Detail text.</p></div>
<div class="exam"><p><b>Exam trap:</b> "Rejected" is not a network failure. The tunnel is fine; the identity is unknown.</p></div>

<div class="scn"><h4>Three tickets, one root cause</h4><p>Three new branches in one region all showed Staging failed. Pings to the Controller worked from a laptop but not from the branches. The Controller had been moved to a new address in the Director only, and the branches were staged with the old address. All three were re-staged toward the right Controller and went Online.</p><p><b>Lesson:</b> when several devices fail identically, look at the shared element first: Controller, Director, template.</p></div>

<div class="iv"><p class="q">"Device stuck at Rejected. What do you check?"</p><p>The serial. Rejected means the Controller and Director link are fine and the staging tunnel formed; the Director has no device with that serial. I compare the serial on the box with the Director list, correct the typo, and recheck the state.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Eight patterns: unreachable, no Director link, not registered, serial mismatch, not deployed, missing objects, missing bind data, wrong values after push.</li>
<li>Each state names a layer; fix in the owning component.</li>
<li>Rejected means identity, not connectivity.</li>
<li>Online is not proof of service: bad values show up in the overlay.</li>
<li>Change one thing at a time and re-read the status.</li>
</ul></div>
`,hi:`
<p>Doctor bimariyan patterns ki tarah seekhta hai: "ye symptom, ye test, ye cause". Onboarding engineer ko bhi aisa hi karna chahiye. Lagbhag har failed onboarding aath patterns mein se ek mein aata hai. Har pattern ka <b>symptom</b>, <b>wo evidence jo use prove karta hai</b> aur <b>fix karne ki sahi jagah</b> seekho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Failure points on the path">
<rect x="10" y="70" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="100" text-anchor="middle" class="svg-ink" font-size="13">Branch</text>
<rect x="270" y="70" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Controller</text>
<rect x="530" y="70" width="100" height="50" rx="8" fill="#bae6fd"/><text x="580" y="100" text-anchor="middle" class="svg-ink" font-size="13">Director</text>
<line x1="110" y1="95" x2="270" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="95" x2="530" y2="95" stroke="#64748b" stroke-width="2"/>
<circle cx="190" cy="95" r="13" fill="#fed7aa"/><text x="190" y="100" text-anchor="middle" class="svg-ink" font-size="13">1</text>
<circle cx="450" cy="95" r="13" fill="#fed7aa"/><text x="450" y="100" text-anchor="middle" class="svg-ink" font-size="13">2</text>
<circle cx="320" cy="150" r="13" fill="#fed7aa"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">3</text>
<circle cx="580" cy="150" r="13" fill="#fed7aa"/><text x="580" y="155" text-anchor="middle" class="svg-ink" font-size="13">4-8</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">1 underlay  2 Director link  3 registration  4 se 8 Director data aur deploy</text>
</svg><p class="cap">Failure patterns path ke alag points par hote hain; pehle point dhundo.</p></div>

<h3>1. Controller unreachable</h3>
<p><b>Symptom:</b> Staging failed. <b>Evidence:</b></p>
<pre class="out">admin@Branch3-cli&gt; show system staging status
Serial: VOS-BR3-0001
Controller: 198.51.100.20
<span class="hl">State: Staging failed</span>
Detail: Controller 198.51.100.20 is unreachable from this branch (check WAN address, gateway and default route)</pre>
<p><b>Branch par fix:</b> WAN address, gateway, Internet transport VR mein default route. <code>ping 198.51.100.20</code> se prove karo. Ye bhi check karo ki staged Controller address sahi hai. Underlay ka sabak yaad rakho: underlay ke bina overlay nahi hota.</p>

<h3>2. Controller ka Director link nahi</h3>
<p><b>Symptom:</b> Staging failed, Detail mein likha ho ki Controller ko Director configured nahi hai, ya aise address ko point karta hai jo Director nahi hai, ya use reach nahi kar sakta. <b>Evidence:</b> Controller par <code>show system director status</code>. <b>Controller par fix:</b> <code>set system director 198.51.100.10</code>, phir reachability check karo.</p>

<h3>3. Controller Director mein registered nahi</h3>
<p><b>Symptom:</b> Staging failed: "Controller Controller-1 is not registered in the Director". <b>Evidence:</b> Director par <code>show controllers</code> mein 198.51.100.20 ki entry nahi. <b>Director par fix:</b> <code>set director controllers Controller-1 address 198.51.100.20</code> aur commit. Items 2 aur 3 ek jodi hain: dono taraf ek dusre ko jaanna zaroori hai.</p>

<h3>4. Serial mismatch</h3>
<p><b>Symptom:</b> Rejected. <b>Evidence:</b></p>
<pre class="out">State: Rejected
Detail: Serial VOS-BR3-0001 is not in the Director device list (bind data / serial number mismatch)</pre>
<p>Branch ke serial ko Director ke <code>show devices brief</code> se compare karo. Typical causes: zero ki jagah letter O, ulta digit, ya device kabhi bana hi nahi. <b>Director par fix:</b> serial sahi karo. Branch ko change <i>mat</i> karo.</p>

<h3>5. Workflow deploy nahi hua</h3>
<p><b>Symptom:</b> Staged - waiting for Director. <b>Evidence:</b> Detail kehta hai device deploy nahi hua; <code>show devices brief</code> mein Deployed = no. <b>Fix:</b> <code>request devices workflow deploy device Branch3</code>.</p>

<h3>6. Group, template ya tenant missing</h3>
<p><b>Symptom:</b> Post-staging failed, details jaise "not in a device group that exists", "uses template X which does not exist" ya "template has no organization (tenant)". <b>Evidence:</b> <code>show devices device Branch3</code>, <code>show device-groups</code>, <code>show templates</code>. <b>Director par fix.</b></p>

<h3>7. Bind data missing</h3>
<p><b>Symptom:</b> Post-staging failed: "Bind data incomplete for Branch3: wan2-gateway". <b>Evidence:</b> device detail ki <code>Missing bind data</code> line. <b>Fix:</b> missing key set karo aur commit karo.</p>

<h3>8. Successful push ke baad galat value</h3>
<p><b>Symptom:</b> Online, lekin ek tunnel down rehta hai ya LAN galat hai. Bind data complete hai lekin galat: gateway subnet ke bahar, galat prefix, galat site-id. <b>Evidence:</b> overlay brief failing transport aur uska reason dikhata hai; carrier gateway ka underlay ping fail hota hai. <b>Director bind data mein fix karo, phir redeploy.</b> Pushed lines branch par read-only hain.</p>

<div class="eg"><p><b>Worked example.</b> Ye status padho: <code>State: Post-staging failed. Detail: Bind data incomplete for Branch3: wan2-gateway</code>. Layer post-staging data hai; staging aur serial pehle pass ho chuke hain (warna aapko pehle wali state dikhti). Fix Director mein ek command hai. Branch ko chhoone ki zaroorat nahi. Ordered state machine ki yahi value hai: wo layers ko aapke liye rule out kar deti hai.</p></div>

<h3>Quick catalogue</h3>
<table class="cmp"><tr><th>#</th><th>State</th><th>Fix location</th></tr>
<tr><td>1</td><td>Staging failed (unreachable)</td><td>Branch underlay</td></tr>
<tr><td>2</td><td>Staging failed (no Director)</td><td>Controller</td></tr>
<tr><td>3</td><td>Staging failed (not registered)</td><td>Director</td></tr>
<tr><td>4</td><td>Rejected</td><td>Director serial</td></tr>
<tr><td>5</td><td>Staged - waiting</td><td>Director deploy</td></tr>
<tr><td>6, 7</td><td>Post-staging failed</td><td>Director objects, bind data</td></tr>
<tr><td>8</td><td>Online lekin broken</td><td>Director data, phir redeploy</td></tr></table>

<div class="warn"><p><b>Common mistakes:</b> branch par wo fix karna jo Director own karta hai; ek saath kai cheezein badalna taaki pata na chale kya kaam kiya; Detail text skip karna.</p></div>
<div class="exam"><p><b>Exam trap:</b> "Rejected" network failure nahi hai. Tunnel theek hai; identity unknown hai.</p></div>

<div class="scn"><h4>Teen tickets, ek root cause</h4><p>Ek region ki teen nayi branches Staging failed dikha rahi thi. Laptop se Controller ka ping chalta tha lekin branches se nahi. Controller ko Director mein hi naye address par move kiya gaya tha, aur branches purane address ke saath stage hui thi. Teeno ko sahi Controller ki taraf re-stage kiya gaya aur wo Online ho gayi.</p><p><b>Lesson:</b> jab kai devices ek jaise fail hon to shared element pehle dekho: Controller, Director, template.</p></div>

<div class="iv"><p class="q">"Device Rejected par atka hai. Aap kya check karte ho?"</p><p>Serial. Rejected ka matlab Controller aur Director link theek hain aur staging tunnel ban gaya; Director ke paas us serial ka device nahi hai. Main box ke serial ko Director list se compare karta hoon, typo sudharta hoon aur state dobara check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aath patterns: unreachable, no Director link, not registered, serial mismatch, not deployed, missing objects, missing bind data, push ke baad galat values.</li>
<li>Har state ek layer ka naam leti hai; owning component mein fix karo.</li>
<li>Rejected identity hai, connectivity nahi.</li>
<li>Online service ka proof nahi: galat values overlay mein dikhti hain.</li>
<li>Ek baar mein ek cheez badlo aur status dobara padho.</li>
</ul></div>
`}};export{e as default};