var e={id:`panorama-commit-and-push`,h:{en:`Panorama: Commit to Panorama versus Commit and Push`,hi:`Panorama: Commit to Panorama versus Commit and Push`},body:{en:`
<p>Consider a school principal who signs a notice. Signing puts it in the office file: the principal has decided. But no student knows about it until a clerk walks into each classroom and reads it aloud. On Panorama, <b>Commit to Panorama</b> is the signature in the office file. <b>Commit and Push</b> is the clerk walking into the classrooms. For Prisma Access, the classrooms are the cloud service. If you only sign, nothing changes for users.</p>

<h3>Two stages</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Two stage commit">
<rect x="20" y="30" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="56" text-anchor="middle" class="svg-ink" font-size="13">Candidate config</text><text x="95" y="74" text-anchor="middle" class="svg-muted" font-size="12">your edits</text>
<rect x="230" y="30" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="56" text-anchor="middle" class="svg-ink" font-size="13">Panorama running</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="12">after Commit to Panorama</text>
<rect x="460" y="30" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="540" y="56" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access</text><text x="540" y="74" text-anchor="middle" class="svg-muted" font-size="12">after Commit and Push</text>
<line x1="170" y1="60" x2="230" y2="60" stroke="#64748b" stroke-width="2"/><line x1="400" y1="60" x2="460" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="200" y="125" text-anchor="middle" class="svg-ink" font-size="12">Stage 1</text><text x="430" y="125" text-anchor="middle" class="svg-ink" font-size="12">Stage 2</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Stage 1 alone leaves users on the old configuration</text>
</svg><p class="cap">Only stage 2 changes what Prisma Access enforces.</p></div>

<h3>The steps</h3>
<ol>
<li>Make the edit (rule, template setting, device group object).</li>
<li><b>Commit, Commit to Panorama.</b> The change is now in Panorama's running configuration.</li>
<li><b>Commit, Commit and Push.</b> Choose <b>Edit Selections</b> and open the <b>Prisma Access</b> tab. Pick the scopes that contain your change.</li>
<li>On the <b>Device Groups</b> tab, check which device groups are included.</li>
<li>Run the job and wait for it to finish.</li>
<li>Verify at <b>Panorama, Cloud Services, Status, Status</b>: Status and Config Status should read OK and In sync.</li>
</ol>

<h3>The Prisma Access tab scopes</h3>
<table class="cmp">
<tr><th>Scope (as named in the docs)</th><th>Use it when you changed</th></tr>
<tr><td>Prisma Access for networks</td><td>Remote networks (confirm the exact coverage in your own push dialog)</td></tr>
<tr><td>Prisma Access for service setup</td><td>Service Setup: infrastructure, service connections and related settings</td></tr>
<tr><td>Mobile Users</td><td>GlobalProtect mobile user configuration and rules</td></tr>
<tr><td>Explicit Proxy</td><td>Explicit Proxy configuration</td></tr>
</table>
<p>The Device Groups tab lists groups such as <code>GlobalProtect</code> and <code>Explicit Proxy</code> and the remote networks group <code>Remote_Network_Device_Group</code>. When you change a rule in a shared parent device group, make sure every child that inherits it is part of the push.</p>
<div class="note"><p><b>What the course does not claim.</b> The exact fields of the push job panel beyond Status and Config Status, and any documented CLI form for commit or push, were not found in the sources used. Do not invent command syntax in notes or answers.</p></div>

<h3>Panorama offline</h3>
<p>The documented CLI includes a setting that lets other commits proceed while blocking Prisma Access pushes: <code>set plugins cloud_services panorama-offline yes|no</code>. It exists for the case where Panorama must be committed while it cannot reach the Prisma Access cloud (for example during an internet outage). Chapter 7 returns to it. The documentation also warns that the plugin needs active internet connectivity and that service failure can follow without it.</p>

<h3>Worked example</h3>
<div class="eg"><p>Lab: the service connection to HQ-FW (192.0.2.10) needs a new tunnel monitor destination 10.10.0.50. The engineer edits it in Panorama, Cloud Services, Configuration, Service Connection. She chooses Commit, Commit to Panorama and the job succeeds. Then Commit, Commit and Push, Edit Selections, Prisma Access tab, selects <b>Prisma Access for service setup</b> (the scope that covers service connections) and pushes. The Status page now shows Config Status In sync. If she had stopped after the first step, the page would show Out of sync and the HQ tunnel would keep monitoring the old target.</p></div>
<pre class="out">Panorama, Cloud Services, Status, Status (teaching view)
Location       Status   Config Status   Current Users
India West     OK       <span class="hl">In sync</span>         12
India South    OK       <span class="hl">Out of sync</span>     7</pre>

<div class="warn"><p><b>Common mistakes.</b> Stopping after Commit to Panorama (the documentation warns this does not push to Prisma Access); choosing the wrong Prisma Access scope; forgetting a child device group; committing while Panorama has no internet access to the service and wondering why the job fails; making several unrelated changes in one push so a failure is hard to explain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "An admin committed a rule on Panorama but users see no change. What is missing?" The answer is Commit and Push with the Prisma Access tab, not a second commit to Panorama. Another known trap: a service connection change needs the service setup scope.</p></div>

<div class="scn"><h4>"But I committed it!"</h4><p>A branch could not reach a new subnet after a Remote Network edit. The engineer insisted the change was committed. Panorama's Status page showed Config Status Out of sync for the remote networks. A Commit and Push with the networks scope selected cleared it and BGP showed the new prefix within minutes.</p><p><b>Lesson:</b> committed to Panorama is not pushed to Prisma Access.</p></div>

<div class="iv"><p class="q">"Difference between Commit to Panorama and Commit and Push for Prisma Access?"</p><p>Commit to Panorama saves the change in Panorama's running configuration only. Commit and Push, with the Prisma Access tab scopes and Device Groups selected, sends it to the cloud. You then verify Status and Config Status at Cloud Services, Status.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit to Panorama does not push to Prisma Access; Commit and Push does.</li>
<li>Edit Selections, Prisma Access tab, has scopes for networks, service setup, Mobile Users and Explicit Proxy.</li>
<li>Check the Device Groups tab so inherited children are included.</li>
<li>Verify at Cloud Services, Status: Status OK and Config Status In sync.</li>
<li>Do not invent CLI for commit or push; it is not documented in the sources used.</li>
</ul></div>
`,hi:`
<p>School ke principal ek notice par signature karte hain. Signature se notice office file mein aa jata hai: principal ne decide kar liya. Lekin koi student tab tak nahi jaanta jab tak clerk har classroom mein jaakar use padh kar na sunaye. Panorama par <b>Commit to Panorama</b> office file mein signature hai. <b>Commit and Push</b> clerk ka classrooms mein jaana hai. Prisma Access ke liye classrooms cloud service hain. Sirf signature karne se users ke liye kuch nahi badalta.</p>

<h3>Do stages</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Two stage commit">
<rect x="20" y="30" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="56" text-anchor="middle" class="svg-ink" font-size="13">Candidate config</text><text x="95" y="74" text-anchor="middle" class="svg-muted" font-size="12">aapke edits</text>
<rect x="230" y="30" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="56" text-anchor="middle" class="svg-ink" font-size="13">Panorama running</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="12">Commit to Panorama ke baad</text>
<rect x="460" y="30" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="540" y="56" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access</text><text x="540" y="74" text-anchor="middle" class="svg-muted" font-size="12">Commit and Push ke baad</text>
<line x1="170" y1="60" x2="230" y2="60" stroke="#64748b" stroke-width="2"/><line x1="400" y1="60" x2="460" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="200" y="125" text-anchor="middle" class="svg-ink" font-size="12">Stage 1</text><text x="430" y="125" text-anchor="middle" class="svg-ink" font-size="12">Stage 2</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Sirf Stage 1 se users purani configuration par rehte hain</text>
</svg><p class="cap">Sirf stage 2 badalta hai ki Prisma Access kya enforce karta hai.</p></div>

<h3>Steps</h3>
<ol>
<li>Edit karo (rule, template setting, device group object).</li>
<li><b>Commit, Commit to Panorama.</b> Change ab Panorama ki running configuration mein hai.</li>
<li><b>Commit, Commit and Push.</b> <b>Edit Selections</b> chuno aur <b>Prisma Access</b> tab kholo. Wo scopes chuno jisme aapka change aata hai.</li>
<li><b>Device Groups</b> tab par check karo kaunse device groups include hain.</li>
<li>Job chalao aur khatam hone ka wait karo.</li>
<li><b>Panorama, Cloud Services, Status, Status</b> par verify karo: Status aur Config Status OK aur In sync hone chahiye.</li>
</ol>

<h3>Prisma Access tab ke scopes</h3>
<table class="cmp">
<tr><th>Scope (docs ke naam ke hisaab se)</th><th>Kab use karo</th></tr>
<tr><td>Prisma Access for networks</td><td>Remote networks (exact coverage apne push dialog mein confirm karo)</td></tr>
<tr><td>Prisma Access for service setup</td><td>Service Setup badla ho: infrastructure, service connections aur related settings</td></tr>
<tr><td>Mobile Users</td><td>GlobalProtect mobile user configuration aur rules</td></tr>
<tr><td>Explicit Proxy</td><td>Explicit Proxy configuration</td></tr>
</table>
<p>Device Groups tab <code>GlobalProtect</code> aur <code>Explicit Proxy</code> jaise groups aur remote networks group <code>Remote_Network_Device_Group</code> list karta hai. Shared parent device group ka rule badlo to dhyan rakho ki use inherit karne wala har child push mein shamil ho.</p>
<div class="note"><p><b>Course kya claim nahi karta.</b> Push job panel ke Status aur Config Status se aage ke exact fields, aur commit ya push ka koi documented CLI form, use kiye gaye sources mein nahi mile. Notes ya answers mein command syntax invent mat karo.</p></div>

<h3>Panorama offline</h3>
<p>Documented CLI mein ek setting hai jo baaki commits ko chalne deti hai lekin Prisma Access pushes ko block karti hai: <code>set plugins cloud_services panorama-offline yes|no</code>. Ye us case ke liye hai jab Panorama ko commit karna ho lekin wo Prisma Access cloud tak pahunch nahi paa raha (jaise internet outage mein). Chapter 7 isse dobara lega. Documentation ye bhi warn karti hai ki plugin ko active internet connectivity chahiye aur uske bina service failure ho sakta hai.</p>

<h3>Worked example</h3>
<div class="eg"><p>Lab: HQ-FW (192.0.2.10) ke service connection ko naya tunnel monitor destination 10.10.0.50 chahiye. Engineer ise Panorama, Cloud Services, Configuration, Service Connection mein edit karti hai. Commit, Commit to Panorama chunti hai aur job succeed hota hai. Phir Commit, Commit and Push, Edit Selections, Prisma Access tab, <b>Prisma Access for service setup</b> (service connections cover karne wala scope) chunti hai aur push karti hai. Status page ab Config Status In sync dikhata hai. Pehle step ke baad ruk jaati to page Out of sync dikhata aur HQ tunnel purane target ko monitor karta rehta.</p></div>
<pre class="out">Panorama, Cloud Services, Status, Status (teaching view)
Location       Status   Config Status   Current Users
India West     OK       <span class="hl">In sync</span>         12
India South    OK       <span class="hl">Out of sync</span>     7</pre>

<div class="warn"><p><b>Common mistakes.</b> Commit to Panorama ke baad ruk jana (documentation warn karti hai ki ye Prisma Access ko push nahi karta); galat Prisma Access scope chunna; child device group bhool jana; Panorama ke paas service tak internet access na ho tab commit karna aur job fail hone par hairan hona; ek push mein kai unrelated changes karna jisse failure explain karna mushkil ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Admin ne Panorama par rule commit kiya lekin users ko koi change nahi dikhta. Kya missing hai?" Jawab hai Prisma Access tab ke saath Commit and Push, doosra commit to Panorama nahi. Ek aur known trap: service connection change ko service setup scope chahiye.</p></div>

<div class="scn"><h4>"Lekin maine commit kiya tha!"</h4><p>Remote Network edit ke baad branch naye subnet tak nahi pahunch paa raha tha. Engineer ka kehna tha ki change committed hai. Panorama ke Status page ne remote networks ka Config Status Out of sync dikhaya. Networks scope ke saath Commit and Push ne ise clear kiya aur BGP ne kuch minute mein naya prefix dikhaya.</p><p><b>Lesson:</b> Panorama tak committed ka matlab Prisma Access tak pushed nahi.</p></div>

<div class="iv"><p class="q">"Prisma Access ke liye Commit to Panorama aur Commit and Push mein kya fark hai?"</p><p>Commit to Panorama change ko sirf Panorama ki running configuration mein save karta hai. Commit and Push, Prisma Access tab scopes aur Device Groups select karke, use cloud bhejta hai. Phir Cloud Services, Status par Status aur Config Status verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit to Panorama Prisma Access ko push nahi karta; Commit and Push karta hai.</li>
<li>Edit Selections, Prisma Access tab mein networks, service setup, Mobile Users aur Explicit Proxy ke scopes hain.</li>
<li>Device Groups tab check karo taaki inherited children shamil hon.</li>
<li>Cloud Services, Status par verify karo: Status OK aur Config Status In sync.</li>
<li>Commit ya push ka CLI invent mat karo; use kiye sources mein documented nahi hai.</li>
</ul></div>
`}};export{e as default};