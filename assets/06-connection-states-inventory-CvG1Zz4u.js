var e={id:`connection-states-inventory`,h:{en:`Connection states and reading the inventory`,hi:`Connection states aur inventory padhna`},body:{en:`
<p>Think of an attendance sheet in a classroom. One column says whether each student is present. Another says whether they have received today's handout. A student can be present but not yet have the handout, and a student can have the handout from yesterday but be absent today. A good teacher reads both columns before drawing conclusions. The Panorama device inventory works the same way: one column for the connection, other columns for whether the configuration has been delivered.</p>

<h3>The inventory command</h3>
<p>On Panorama, <code>show devices all</code> lists every managed device, and <code>show devices connected</code> lists only those currently connected. Here is the output of a lab state in which two firewalls are connected and grouped, but nothing has been pushed yet:</p>
<pre class="out">&gt; show devices all
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
------------------------------------------------------------------------------------------------------------------------------
0079185321121     NK-PUNE-PA        192.0.2.11      <span class="hl">yes</span>        NK-BRANCHES       NK-STACK          <span class="hl">Out of Sync   Out of Sync</span>
0079134988264     NK-DELHI-PA       192.0.2.12      <span class="hl">yes</span>        NK-BRANCHES       NK-STACK          Out of Sync   Out of Sync

Total managed devices: 2</pre>

<h3>Reading column by column</h3>
<table class="tbl"><tr><th>Column</th><th>Meaning</th><th>Empty means</th></tr>
<tr><td>Serial</td><td>Identity registered on Panorama</td><td>-</td></tr>
<tr><td>Hostname, IP</td><td>Learned from the firewall once it connects</td><td>Never connected: Panorama knows only the serial</td></tr>
<tr><td>Connected</td><td>yes or no: is the management connection up now</td><td>-</td></tr>
<tr><td>Device group, Template stack</td><td>Where the firewall is assigned</td><td>Not assigned to any group or stack</td></tr>
<tr><td>Shared policy, Template</td><td>Whether the last committed policy and template have been pushed</td><td>Nothing assigned, so nothing to compare</td></tr>
</table>
<p>The last two columns show <b>In Sync</b> or <b>Out of Sync</b>. Out of Sync means "Panorama's running configuration for this firewall differs from what the firewall last received". A new firewall that has never been pushed is Out of Sync, and so is any firewall after you commit to Panorama and before you push. In sync means the last push matches.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Inventory states">
<rect x="20" y="20" width="180" height="60" rx="8" fill="#fed7aa"/><text x="110" y="46" text-anchor="middle" class="svg-ink" font-size="13">Registered only</text><text x="110" y="66" text-anchor="middle" class="svg-muted" font-size="12">Connected: no, no hostname</text>
<rect x="230" y="20" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Connected</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">Connected: yes, no group</text>
<rect x="440" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="530" y="46" text-anchor="middle" class="svg-ink" font-size="13">Assigned</text><text x="530" y="66" text-anchor="middle" class="svg-muted" font-size="12">Out of Sync until pushed</text>
<rect x="230" y="120" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">In Sync</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">after a successful push</text>
<line x1="200" y1="50" x2="230" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="50" x2="440" y2="50" stroke="#64748b" stroke-width="2"/><line x1="530" y1="80" x2="410" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The usual life of a newly onboarded firewall as seen in the inventory.</p></div>

<h3>Jobs</h3>
<p>Every commit and push becomes a <b>job</b>. <code>show jobs all</code> on Panorama lists them with type (Commit, CommitAll for a push, Validate), status and result. Use it to answer "did my last action actually finish and succeed?"</p>
<pre class="out">&gt; show jobs all
Enqueued              Dequeued              ID    Type        Status  Result  Completed
-----------------------------------------------------------------------------------------------
2026-10-04 13:05:38   2026-10-04 13:05:38   3     Commit      FIN     OK      2026-10-04 13:05:38
2026-10-04 13:05:02   2026-10-04 13:05:02   2     Commit      FIN     OK      2026-10-04 13:05:02</pre>

<div class="eg"><p><b>Worked example.</b> A manager asks: "Is the new rule live in Delhi?" You run show devices all. Delhi shows Connected yes but Shared policy Out of Sync. Answer: Panorama has the rule committed, but Delhi has not received it; a push to the device group is still needed. If instead Delhi showed Connected no, the first job is to restore the connection.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading Connected: yes as "everything is deployed". Connected only proves the management connection. Sync columns tell you about configuration delivery.</p></div>
<div class="exam"><p><b>Exam trap.</b> A firewall with Connected: yes and empty Device group and Template stack columns is healthy but unassigned. It is not a connection problem.</p></div>

<div class="scn"><h4>Green but not pushed</h4><p>An engineer committed a new rule on Panorama, saw Panorama's job finish OK and told the team the rule was live. A branch user was still blocked. The inventory showed the branch Out of Sync: the commit only changed Panorama's own running configuration. After a push the column changed to In Sync and the user's problem was fixed.</p><p><b>Lesson:</b> "committed" and "deployed" are different states; the inventory tells you which one you are in.</p></div>

<div class="iv"><p class="q">"A firewall shows Connected yes but Out of Sync. What does it mean and what do you do?"</p><p>The management connection is up but the firewall has not received the latest committed configuration. Check the job list, then push the relevant device group or template stack to that firewall and confirm the state changes to In Sync.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show devices all is the inventory; show devices connected filters to live connections.</li>
<li>Connected is about the management link; In Sync and Out of Sync are about delivered configuration.</li>
<li>Empty hostname means the device has never connected; empty group means unassigned.</li>
<li>Out of Sync is normal after a commit and before a push.</li>
<li>show jobs all records Commit, CommitAll and Validate jobs.</li>
</ul></div>
`,hi:`
<p>Socho classroom ki attendance sheet. Ek column batata hai har student present hai ya nahi. Doosra batata hai ki unhe aaj ka handout mila ya nahi. Student present ho sakta hai par handout abhi nahi mila, aur kisi ke paas kal ka handout ho sakta hai par wo aaj absent ho. Achha teacher conclusion se pehle dono columns padhta hai. Panorama device inventory bhi aise hi kaam karti hai: ek column connection ka, baaki columns configuration deliver hui ya nahi.</p>

<h3>Inventory command</h3>
<p>Panorama par <code>show devices all</code> har managed device list karta hai, aur <code>show devices connected</code> sirf wo jo abhi connected hain. Ye ek lab state ka output hai jisme do firewalls connected aur grouped hain par abhi kuch push nahi hua:</p>
<pre class="out">&gt; show devices all
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
------------------------------------------------------------------------------------------------------------------------------
0079185321121     NK-PUNE-PA        192.0.2.11      <span class="hl">yes</span>        NK-BRANCHES       NK-STACK          <span class="hl">Out of Sync   Out of Sync</span>
0079134988264     NK-DELHI-PA       192.0.2.12      <span class="hl">yes</span>        NK-BRANCHES       NK-STACK          Out of Sync   Out of Sync

Total managed devices: 2</pre>

<h3>Column by column padhna</h3>
<table class="tbl"><tr><th>Column</th><th>Matlab</th><th>Khaali ho to</th></tr>
<tr><td>Serial</td><td>Panorama par registered identity</td><td>-</td></tr>
<tr><td>Hostname, IP</td><td>Firewall ke connect hone par seekhe jate hain</td><td>Kabhi connect nahi hua: Panorama sirf serial jaanta hai</td></tr>
<tr><td>Connected</td><td>yes ya no: management connection abhi up hai ya nahi</td><td>-</td></tr>
<tr><td>Device group, Template stack</td><td>Firewall kahan assigned hai</td><td>Kisi group ya stack mein assigned nahi</td></tr>
<tr><td>Shared policy, Template</td><td>Last committed policy aur template push hue ya nahi</td><td>Kuch assigned nahi, to compare karne ko kuch nahi</td></tr>
</table>
<p>Aakhri do columns <b>In Sync</b> ya <b>Out of Sync</b> dikhate hain. Out of Sync ka matlab: "is firewall ke liye Panorama ki running configuration us se alag hai jo firewall ko last mili". Naya firewall jise kabhi push nahi hua wo Out of Sync hai, aur Panorama par commit ke baad aur push se pehle har firewall bhi. In Sync ka matlab last push match karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Inventory states">
<rect x="20" y="20" width="180" height="60" rx="8" fill="#fed7aa"/><text x="110" y="46" text-anchor="middle" class="svg-ink" font-size="13">Sirf registered</text><text x="110" y="66" text-anchor="middle" class="svg-muted" font-size="12">Connected: no, hostname nahi</text>
<rect x="230" y="20" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Connected</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">Connected: yes, group nahi</text>
<rect x="440" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="530" y="46" text-anchor="middle" class="svg-ink" font-size="13">Assigned</text><text x="530" y="66" text-anchor="middle" class="svg-muted" font-size="12">push tak Out of Sync</text>
<rect x="230" y="120" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">In Sync</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">successful push ke baad</text>
<line x1="200" y1="50" x2="230" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="50" x2="440" y2="50" stroke="#64748b" stroke-width="2"/><line x1="530" y1="80" x2="410" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Naye onboard hue firewall ki usual life, inventory mein jaisi dikhti hai.</p></div>

<h3>Jobs</h3>
<p>Har commit aur push ek <b>job</b> ban jata hai. Panorama par <code>show jobs all</code> unhe type (Commit, push ke liye CommitAll, Validate), status aur result ke saath list karta hai. "Mera last action sach mein finish hua aur succeed hua?" ka jawab dene ke liye use karo.</p>
<pre class="out">&gt; show jobs all
Enqueued              Dequeued              ID    Type        Status  Result  Completed
-----------------------------------------------------------------------------------------------
2026-10-04 13:05:38   2026-10-04 13:05:38   3     Commit      FIN     OK      2026-10-04 13:05:38
2026-10-04 13:05:02   2026-10-04 13:05:02   2     Commit      FIN     OK      2026-10-04 13:05:02</pre>

<div class="eg"><p><b>Worked example.</b> Manager puchta hai: "Kya naya rule Delhi mein live hai?" Aap show devices all chalate ho. Delhi Connected yes dikhata hai par Shared policy Out of Sync. Answer: Panorama ne rule commit kar liya hai, par Delhi ko mila nahi; device group push abhi baaki hai. Agar Delhi Connected no dikhata, to pehla kaam connection restore karna hota.</p></div>

<div class="warn"><p><b>Common mistake.</b> Connected: yes ko "sab deploy ho gaya" padhna. Connected sirf management connection prove karta hai. Sync columns configuration delivery batate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Connected: yes aur khaali Device group aur Template stack columns wala firewall healthy hai par unassigned. Ye connection problem nahi hai.</p></div>

<div class="scn"><h4>Green par push nahi hua</h4><p>Engineer ne Panorama par naya rule commit kiya, Panorama ka job OK dekha aur team ko bol diya ki rule live hai. Branch user abhi bhi blocked tha. Inventory mein branch Out of Sync tha: commit ne sirf Panorama ki apni running configuration badli thi. Push ke baad column In Sync ho gaya aur user ki problem fix ho gayi.</p><p><b>Lesson:</b> "committed" aur "deployed" alag states hain; inventory batati hai aap kaun si state mein ho.</p></div>

<div class="iv"><p class="q">"Firewall Connected yes par Out of Sync dikha raha hai. Matlab kya aur aap kya karoge?"</p><p>Management connection up hai par firewall ko latest committed configuration nahi mili. Job list check karo, phir us firewall ko relevant device group ya template stack push karo aur confirm karo ki state In Sync ho gayi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show devices all inventory hai; show devices connected live connections tak filter karta hai.</li>
<li>Connected management link ke baare mein hai; In Sync aur Out of Sync delivered configuration ke baare mein.</li>
<li>Khaali hostname ka matlab device kabhi connect nahi hua; khaali group ka matlab unassigned.</li>
<li>Commit ke baad aur push se pehle Out of Sync normal hai.</li>
<li>show jobs all Commit, CommitAll aur Validate jobs record karta hai.</li>
</ul></div>
`}};export{e as default};