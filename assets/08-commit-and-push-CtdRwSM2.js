var e={id:`commit-and-push`,h:{en:`Commit to Panorama, Commit and Push, and SCM Push Config`,hi:`Commit to Panorama, Commit and Push aur SCM Push Config`},body:{en:`
<p>This is the most tested operational idea in the module and the cause of many real tickets: <b>saving a change is not the same as applying it</b>. Prisma Access is a remote cloud service. Your edit lives in your management tool until you send it to the cloud.</p>

<h3>Analogy: writing a letter and posting it</h3>
<p>Writing a letter and putting it in your desk drawer does not deliver anything. <b>Commit to Panorama</b> is writing the letter and keeping it in the drawer. <b>Commit and Push</b> is posting it. Until the letter is posted and received, the person at the other end knows nothing.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Commit then push">
<rect x="20" y="40" width="140" height="60" rx="8" fill="#bae6fd"/><text x="90" y="66" text-anchor="middle" class="svg-ink" font-size="12">Candidate config</text><text x="90" y="84" text-anchor="middle" class="svg-muted" font-size="11">your edits</text>
<rect x="250" y="40" width="140" height="60" rx="8" fill="#fde68a"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="12">Saved in Panorama</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="11">Commit to Panorama</text>
<rect x="480" y="40" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="12">Running in cloud</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="11">Commit and Push</text>
<line x1="160" y1="70" x2="250" y2="70" stroke="#64748b"/><line x1="390" y1="70" x2="480" y2="70" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Users only see the change after the second arrow</text>
</svg><p class="cap">Two stages on the Panorama path. SCM combines the idea into Push Config.</p></div>

<h3>Panorama path</h3>
<ol>
<li><b>Commit &gt; Commit to Panorama</b> validates your change and saves it as the running configuration of Panorama. Prisma Access is not changed. The documentation warns about this explicitly for service connections.</li>
<li><b>Commit &gt; Commit and Push</b>, then <b>Edit Selections</b>, then the <b>Prisma Access</b> tab. Choose what to send. Push scopes include Prisma Access for networks, Prisma Access for service setup, Mobile Users and Explicit Proxy; the Device Groups tab selects rule containers.</li>
<li>Verify at <code>Panorama &gt; Cloud Services &gt; Status &gt; Status</code>. You want <b>Status OK</b> and <b>Config Status In sync</b>.</li>
</ol>
<div class="note"><p>Service infrastructure changes need <b>Service Setup</b> included in the selection. If you forget to include it, the infrastructure edit stays in Panorama.</p></div>

<h3>SCM path</h3>
<p>Open <code>Configuration &gt; Operations &gt; Push Config</code>. The dialog offers:</p>
<ul>
<li><b>Admin Scope</b>: whose changes to include.</li>
<li><b>Push Target</b>: NGFW and Prisma Access (default) or Other Services.</li>
<li><b>Push Scope</b>: deployment types or folders. Selecting a parent folder includes its children.</li>
<li><b>Ignore Security Check Failures</b>: lets a push continue when best-practice checks fail, if you have override permission.</li>
</ul>
<p>Full pushes are required for new tenants, for Prisma Access mobile and remote user setup, and for folder operations. The <b>Jobs</b> history shows each commit, push and revert with a summary, description and status. Best-practice checks can block a push unless you hold override permission.</p>

<table class="cmp"><tr><th>Question</th><th>Panorama</th><th>SCM</th></tr>
<tr><td>Save only</td><td>Commit to Panorama</td><td>Changes saved in candidate configuration</td></tr>
<tr><td>Send to Prisma Access</td><td>Commit and Push, Prisma Access tab</td><td>Push Config</td></tr>
<tr><td>Verify</td><td>Status: Status OK, Config Status In sync</td><td>Jobs history and Sync Status</td></tr>
<tr><td>Typical trap</td><td>Stopping after Commit to Panorama</td><td>Not selecting the right push scope</td></tr>
</table>
<pre class="out">Cloud Services &gt; Status &gt; Status (lab console view)
Location     Status   Config Status    Current Users
India West   OK       <span class="hl">Out of sync</span>      0
</pre>
<p>The highlighted word tells you Prisma Access does not yet have your latest configuration.</p>

<div class="eg"><p><b>Worked example.</b> At 10:00 an engineer changes the infrastructure BGP AS from 65534 to 65100 and clicks Commit to Panorama. The commit job shows success. At 10:05 the status page shows Config Status <i>Out of sync</i> and all tunnels still use the old value. The engineer opens Commit and Push, edits the selection, ticks the Prisma Access tab with Service Setup, and pushes. After the job completes, Config Status returns to <i>In sync</i>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Stopping at Commit to Panorama. (2) Pushing only one scope and forgetting Service Setup. (3) Ignoring a failed best-practice check and overriding it without reading it. (4) Looking for a CLI commit command: the course does not teach one because the documentation does not give one.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The change was committed successfully but nothing changed in Prisma Access." The cause is that Commit to Panorama does not push. The answer is Commit and Push with the Prisma Access tab selections (Panorama) or Push Config (SCM).</p></div>

<div class="scn"><h4>The change that never arrived</h4><p>An administrator added a branch subnet and went home after seeing a green commit message. In the morning the branch was unreachable. The status page showed Config Status Out of sync. The commit had saved to Panorama but the push to Prisma Access had never been run. A Commit and Push with the Prisma Access tab resolved it in minutes.</p><p><b>Lesson:</b> after any change, open the status screen and wait for In sync before telling the user it is done.</p></div>

<div class="iv"><p class="q">"What is the difference between Commit to Panorama and Commit and Push?"</p><p>Strong answer: Commit to Panorama saves the configuration on Panorama only. Commit and Push, with the Prisma Access tab selections such as service setup, networks and mobile users, sends it to the cloud service. Verify at Cloud Services &gt; Status that Config Status is In sync. On SCM the equivalent is Push Config, which also has scope and job history.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit to Panorama does not change Prisma Access.</li>
<li>Commit and Push with the Prisma Access tab applies changes; include Service Setup for infrastructure.</li>
<li>SCM uses Configuration &gt; Operations &gt; Push Config with admin, target and push scope options.</li>
<li>Verify with Config Status In sync and the Jobs history.</li>
<li>Full pushes are needed for new tenants and for mobile and remote setup in SCM.</li>
</ul></div>
`,hi:`
<p>Yeh module ka sabse zyada test hone wala operational idea hai aur kai real tickets ki wajah: <b>change save karna aur apply karna ek cheez nahi hai</b>. Prisma Access remote cloud service hai. Aapka edit aapke management tool mein tab tak rehta hai jab tak aap use cloud tak nahi bhejte.</p>

<h3>Analogy: chitthi likhna aur post karna</h3>
<p>Chitthi likh kar desk ki drawer mein rakh dene se kuch deliver nahi hota. <b>Commit to Panorama</b> chitthi likh kar drawer mein rakhna hai. <b>Commit and Push</b> use post karna hai. Jab tak chitthi post nahi hui aur pahunchi nahi, doosri taraf ke insaan ko kuch nahi pata.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Commit phir push">
<rect x="20" y="40" width="140" height="60" rx="8" fill="#bae6fd"/><text x="90" y="66" text-anchor="middle" class="svg-ink" font-size="12">Candidate config</text><text x="90" y="84" text-anchor="middle" class="svg-muted" font-size="11">aapke edits</text>
<rect x="250" y="40" width="140" height="60" rx="8" fill="#fde68a"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="12">Panorama mein saved</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="11">Commit to Panorama</text>
<rect x="480" y="40" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="12">Cloud mein running</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="11">Commit and Push</text>
<line x1="160" y1="70" x2="250" y2="70" stroke="#64748b"/><line x1="390" y1="70" x2="480" y2="70" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Users ko change doosre arrow ke baad hi dikhta hai</text>
</svg><p class="cap">Panorama path ke do stages. SCM yeh idea Push Config mein combine kar deta hai.</p></div>

<h3>Panorama path</h3>
<ol>
<li><b>Commit &gt; Commit to Panorama</b> aapke change ko validate karta hai aur Panorama ki running configuration ke roop mein save karta hai. Prisma Access nahi badalta. Documentation service connections ke liye yeh explicitly warn karti hai.</li>
<li><b>Commit &gt; Commit and Push</b>, phir <b>Edit Selections</b>, phir <b>Prisma Access</b> tab. Choose karo kya bhejna hai. Push scopes mein Prisma Access for networks, Prisma Access for service setup, Mobile Users aur Explicit Proxy shaamil hain; Device Groups tab rule containers select karta hai.</li>
<li><code>Panorama &gt; Cloud Services &gt; Status &gt; Status</code> par verify karo. Aapko <b>Status OK</b> aur <b>Config Status In sync</b> chahiye.</li>
</ol>
<div class="note"><p>Service infrastructure changes ke liye selection mein <b>Service Setup</b> include hona chahiye. Bhool gaye to infrastructure edit Panorama mein hi rah jaata hai.</p></div>

<h3>SCM path</h3>
<p><code>Configuration &gt; Operations &gt; Push Config</code> kholo. Dialog ye options deta hai:</p>
<ul>
<li><b>Admin Scope</b>: kiske changes include karne hain.</li>
<li><b>Push Target</b>: NGFW and Prisma Access (default) ya Other Services.</li>
<li><b>Push Scope</b>: deployment types ya folders. Parent folder chunne se uske children bhi include hote hain.</li>
<li><b>Ignore Security Check Failures</b>: best-practice checks fail hone par bhi push continue karne deta hai, agar aapke paas override permission hai.</li>
</ul>
<p>Naye tenants, Prisma Access mobile aur remote user setup, aur folder operations ke liye full push zaroori hai. <b>Jobs</b> history har commit, push aur revert ko summary, description aur status ke saath dikhati hai. Best-practice checks push block kar sakte hain jab tak aapke paas override permission na ho.</p>

<table class="cmp"><tr><th>Sawaal</th><th>Panorama</th><th>SCM</th></tr>
<tr><td>Sirf save</td><td>Commit to Panorama</td><td>Changes candidate configuration mein saved</td></tr>
<tr><td>Prisma Access ko bhejna</td><td>Commit and Push, Prisma Access tab</td><td>Push Config</td></tr>
<tr><td>Verify</td><td>Status: Status OK, Config Status In sync</td><td>Jobs history aur Sync Status</td></tr>
<tr><td>Typical trap</td><td>Commit to Panorama par ruk jaana</td><td>Sahi push scope select na karna</td></tr>
</table>
<pre class="out">Cloud Services &gt; Status &gt; Status (lab console view)
Location     Status   Config Status    Current Users
India West   OK       <span class="hl">Out of sync</span>      0
</pre>
<p>Highlighted shabd batata hai ki Prisma Access ke paas abhi aapki latest configuration nahi hai.</p>

<div class="eg"><p><b>Worked example.</b> 10:00 baje engineer infrastructure BGP AS 65534 se 65100 karta hai aur Commit to Panorama dabata hai. Commit job success dikhata hai. 10:05 par status page Config Status <i>Out of sync</i> dikhata hai aur saare tunnels abhi bhi purani value use karte hain. Engineer Commit and Push kholta hai, selection edit karta hai, Service Setup ke saath Prisma Access tab tick karta hai, aur push karta hai. Job complete hone ke baad Config Status <i>In sync</i> ho jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Commit to Panorama par ruk jaana. (2) Sirf ek scope push karna aur Service Setup bhool jaana. (3) Failed best-practice check ko padhe bina override kar dena. (4) CLI commit command dhoondhna: course koi nahi sikhata kyunki documentation koi deti nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Change successfully commit hua lekin Prisma Access mein kuch nahi badla." Wajah: Commit to Panorama push nahi karta. Jawab: Prisma Access tab selections ke saath Commit and Push (Panorama) ya Push Config (SCM).</p></div>

<div class="scn"><h4>Jo change kabhi pahuncha hi nahi</h4><p>Ek administrator ne branch subnet add kiya aur green commit message dekh kar ghar chala gaya. Subah branch unreachable thi. Status page par Config Status Out of sync tha. Commit Panorama mein save hua tha lekin Prisma Access ko push kabhi run nahi hua. Prisma Access tab ke saath Commit and Push ne minutes mein fix kar diya.</p><p><b>Seekh:</b> kisi bhi change ke baad status screen kholo aur user ko "ho gaya" bolne se pehle In sync ka wait karo.</p></div>

<div class="iv"><p class="q">"Commit to Panorama aur Commit and Push mein kya farak hai?"</p><p>Strong answer: Commit to Panorama configuration sirf Panorama par save karta hai. Commit and Push, Prisma Access tab selections (service setup, networks, mobile users) ke saath, use cloud service tak bhejta hai. Cloud Services &gt; Status par verify karo ki Config Status In sync hai. SCM mein equivalent Push Config hai, jisme scope aur job history bhi hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit to Panorama Prisma Access ko nahi badalta.</li>
<li>Prisma Access tab ke saath Commit and Push changes apply karta hai; infrastructure ke liye Service Setup include karo.</li>
<li>SCM Configuration &gt; Operations &gt; Push Config use karta hai, admin, target aur push scope options ke saath.</li>
<li>Config Status In sync aur Jobs history se verify karo.</li>
<li>SCM mein naye tenants aur mobile aur remote setup ke liye full push chahiye.</li>
</ul></div>
`}};export{e as default};