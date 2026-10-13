var e={id:`deploy`,h:{en:`Deploy: preview, push, verify and roll back (lab 1)`,hi:`Deploy: preview, push, verify aur roll back (lab 1)`},body:{en:`
<p>A newspaper is written all day in the editorial office, but readers only see what was printed this morning. Editing a story on the computer does not change a single copy already on the street. The print run is the moment the new version reaches people. In the Management Center, <b>Save</b> is editing the story and <b>Deploy</b> is the print run.</p>

<h3>Candidate and running</h3>
<p>Every change you make in the Management Center (a rule, a NAT entry, an interface, an object) goes into the <b>candidate</b> configuration stored in the manager. The device runs the <b>deployed</b> configuration. As soon as they differ, the device is <b>out of date</b>. In the lab you see this three ways: the Deploy button at the top right turns orange, the header says <i>Undeployed changes</i>, and Overview says <i>Out of date: the device runs an older policy. Click Deploy to push your changes.</i></p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Candidate versus deployed">
<rect x="20" y="40" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="115" y="66" text-anchor="middle" class="svg-ink" font-size="14">Candidate</text><text x="115" y="86" text-anchor="middle" class="svg-muted" font-size="12">in the manager</text><text x="115" y="104" text-anchor="middle" class="svg-muted" font-size="12">Inside-Out added</text>
<rect x="430" y="40" width="190" height="80" rx="8" fill="#fed7aa"/><text x="525" y="66" text-anchor="middle" class="svg-ink" font-size="14">Deployed</text><text x="525" y="86" text-anchor="middle" class="svg-muted" font-size="12">on NK-FTD</text><text x="525" y="104" text-anchor="middle" class="svg-muted" font-size="12">old policy</text>
<line x1="210" y1="80" x2="430" y2="80" stroke="#64748b" stroke-width="3"/><text x="320" y="70" text-anchor="middle" class="svg-accent" font-size="14">Deploy</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">compile, push, apply</text>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Different = out of date (orange Deploy button)</text>
</svg><p class="cap">Changes live in the candidate until Deploy copies them to the device.</p></div>

<h3>What a deployment does</h3>
<ol>
<li><b>Validates</b> the candidate: missing objects, overlapping NAT, unsupported features for the device version. Errors stop the deployment; warnings let you continue.</li>
<li><b>Compiles</b> it into LINA commands (interfaces, routes, NAT, CSM_FW_ACL_) and Snort configuration.</li>
<li><b>Pushes</b> it over the sftunnel and applies it. The device keeps forwarding during the push; some changes restart Snort processes.</li>
<li><b>Records</b> it in the deployment history, so you can see who deployed what and when.</li>
</ol>
<p>Deploy always sends the complete current configuration of the device, not "just my rule". If a colleague saved half-finished changes to the same policy, your deploy pushes them too. Check what is pending before you click.</p>

<h3>On a real Management Center</h3>
<ul>
<li><b>Deploy → Deployment</b> lists every out-of-date device with its pending policies. Select devices and deploy them.</li>
<li><b>Preview</b> (change preview) shows a side-by-side comparison of the deployed and pending configuration: added, changed and deleted rules, objects and NAT entries.</li>
<li>The <b>Inspect Interruption</b> column warns when the deployment restarts Snort. During a restart, traffic that needs inspection can be briefly dropped or passed without inspection, depending on platform and settings, so plan such deploys in a maintenance window.</li>
<li><b>Deploy → Deployment History</b> shows every past job, and lets you <b>roll back</b> a device to a previous deployed configuration when a change went wrong.</li>
</ul>
<p>The lab keeps it simple: click <b>Deploy</b>, confirm <i>Deploy the pending access control, NAT and device changes to NK-FTD?</i>, wait for <i>Deployment to NK-FTD completed successfully</i>.</p>

<h3>Lab 1 walkthrough: first policy and deploy</h3>
<p><b>Task 1.</b> Policies → Access Control → Add Rule <b>Inside-Out</b>: Source Zones INSIDE, Destination Zones OUTSIDE, Destination Ports HTTP, HTTPS, DNS and ICMP, Action Allow, Save (see the previous chapter).</p>
<p><b>Task 2.</b> Before deploying, test from PC1: <code>curl 8.8.8.8</code> fails, because the device still runs the old policy with only the default action. Now Deploy, and run <code>curl 8.8.8.8</code> again: it works. You have just proven the difference between Save and Deploy.</p>
<pre class="out">&gt; show access-control-config

===================[ NK-ACP ]====================
Default Action            : Block
<span class="hl">-----------------[ Rule: Inside-Out ]-----------------</span>
    Action                : Allow
    Source Zones          : INSIDE
    Destination Zones     : OUTSIDE
    Destination Ports     : HTTP (protocol 6, port 80), HTTPS (protocol 6, port 443), DNS (protocol 17, port 53), ICMP (protocol 1)</pre>
<p><b>Task 3.</b> On the FTD CLI run <code>packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 80</code>. In the ACCESS-LIST phase you find <code>rule-id 268435457</code> with the remark <code>L7 RULE: Inside-Out</code>. In the lab the first rule gets 268435457, the second 268435458, and so on; on a real device the Management Center assigns unique IDs that are not sequential, so always read the ID from the output.</p>
<p><b>Task 4.</b> From PC1 run <code>ssh -l admin 8.8.8.8</code>: it times out. Open <b>Analysis → Connection Events</b>:</p>
<pre class="out">Time                 Action  Rule            Initiator IP  Responder IP  Port    Ingress Zone  Egress Zone
2026-10-02 09:14:31  <span class="hl">Block   Default Action</span>  10.0.1.10     8.8.8.8       tcp/22  INSIDE        OUTSIDE
2026-10-02 09:13:58  Allow   Inside-Out      10.0.1.10     8.8.8.8       tcp/80  INSIDE        OUTSIDE</pre>
<p>The answer is <b>Default Action</b>: no rule allows SSH, so the policy's last line blocked it. On a real Management Center the path is <b>Analysis → Connections → Events</b>.</p>

<div class="warn"><p><b>Common mistake.</b> Deploying in the middle of the day without looking at the preview. A colleague's unfinished rule changes, or a change that restarts Snort, go out together with your one-line fix.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The rule is visible in the Management Center but packet-tracer still hits the default action": not deployed. Deployment history allows rollback; the change preview compares deployed and pending configurations; Inspect Interruption warns about Snort restarts.</p></div>

<div class="scn"><h4>The Friday deploy</h4><p>An engineer deployed a single NAT fix at 4 pm on a Friday. The deployment also contained a colleague's half-finished intrusion policy change, flagged with Inspect Interruption, and a test rule that blocked a payment provider. Card payments failed for 20 minutes. The team rolled back from Deployment History, then re-applied only the NAT fix after reviewing the preview.</p><p><b>Lesson:</b> Deploy pushes everything pending; read the preview and the interruption flag, and use rollback when a deployment goes wrong.</p></div>

<div class="iv"><p class="q">"You added a rule in the Management Center and nothing changed. What do you check?"</p><p>First, whether the device is out of date and the policy was deployed: the deployment status, and <code>show access-control-config</code> on the device to see if the rule is there. Then the rule's position and conditions with <code>packet-tracer</code> and its rule-id, and Connection Events for which rule actually matched. Mention preview before deploy and rollback from Deployment History.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Save changes the candidate; Deploy changes the device.</li>
<li>Out of date = orange Deploy button; Deploy pushes all pending changes of that device.</li>
<li>Real Management Center: preview, Inspect Interruption, Deployment History and rollback.</li>
<li>Lab 1: Inside-Out fails before Deploy, works after; rule-id 268435457; SSH hits Default Action.</li>
<li>Always confirm on the device with <code>show access-control-config</code> and <code>packet-tracer</code>.</li>
</ul></div>
`,hi:`
<p>Akhbaar editorial office mein din bhar likha jaata hai, par readers sirf woh dekhte hain jo aaj subah chhapa. Computer par story edit karne se street par pehle se maujood ek bhi copy nahi badalti. Print run woh pal hai jab naya version logon tak pahunchta hai. Management Center mein <b>Save</b> story edit karna hai aur <b>Deploy</b> print run hai.</p>

<h3>Candidate aur running</h3>
<p>Management Center mein aapka har change (rule, NAT entry, interface, object) manager mein stored <b>candidate</b> configuration mein jaata hai. Device <b>deployed</b> configuration chalata hai. Jaise hi dono alag hote hain, device <b>out of date</b> ho jaata hai. Lab mein aap ise teen tarah dekhte ho: upar right ka Deploy button orange ho jaata hai, header <i>Undeployed changes</i> kehta hai, aur Overview kehta hai <i>Out of date: the device runs an older policy. Click Deploy to push your changes.</i></p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Candidate versus deployed">
<rect x="20" y="40" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="115" y="66" text-anchor="middle" class="svg-ink" font-size="14">Candidate</text><text x="115" y="86" text-anchor="middle" class="svg-muted" font-size="12">manager mein</text><text x="115" y="104" text-anchor="middle" class="svg-muted" font-size="12">Inside-Out jodi</text>
<rect x="430" y="40" width="190" height="80" rx="8" fill="#fed7aa"/><text x="525" y="66" text-anchor="middle" class="svg-ink" font-size="14">Deployed</text><text x="525" y="86" text-anchor="middle" class="svg-muted" font-size="12">NK-FTD par</text><text x="525" y="104" text-anchor="middle" class="svg-muted" font-size="12">purani policy</text>
<line x1="210" y1="80" x2="430" y2="80" stroke="#64748b" stroke-width="3"/><text x="320" y="70" text-anchor="middle" class="svg-accent" font-size="14">Deploy</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">compile, push, apply</text>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Alag = out of date (orange Deploy button)</text>
</svg><p class="cap">Changes candidate mein rehte hain jab tak Deploy unhe device par copy nahi karta.</p></div>

<h3>Deployment kya karta hai</h3>
<ol>
<li>Candidate ko <b>validate</b> karta hai: missing objects, overlapping NAT, device version ke liye unsupported features. Errors deployment rok dete hain; warnings aapko aage badhne dete hain.</li>
<li>Use LINA commands (interfaces, routes, NAT, CSM_FW_ACL_) aur Snort configuration mein <b>compile</b> karta hai.</li>
<li>Use sftunnel ke upar <b>push</b> karke apply karta hai. Push ke dauran device forward karta rehta hai; kuch changes Snort processes restart karte hain.</li>
<li>Use deployment history mein <b>record</b> karta hai, taaki aap dekh sako kisne kya aur kab deploy kiya.</li>
</ol>
<p>Deploy hamesha device ki poori current configuration bhejta hai, "sirf meri rule" nahi. Agar kisi colleague ne usi policy mein adhoore changes save kiye, to aapka deploy unhe bhi push kar deta hai. Click karne se pehle check karo kya pending hai.</p>

<h3>Real Management Center par</h3>
<ul>
<li><b>Deploy → Deployment</b> har out-of-date device ko uski pending policies ke saath list karta hai. Devices select karo aur deploy karo.</li>
<li><b>Preview</b> (change preview) deployed aur pending configuration ka side-by-side comparison dikhata hai: added, changed aur deleted rules, objects aur NAT entries.</li>
<li><b>Inspect Interruption</b> column warn karta hai jab deployment Snort restart karta hai. Restart ke dauran, inspection maangne wala traffic platform aur settings ke hisaab se thodi der drop ho sakta hai ya bina inspection pass ho sakta hai, isliye aise deploys maintenance window mein plan karo.</li>
<li><b>Deploy → Deployment History</b> har purana job dikhata hai, aur change galat hone par device ko pichhli deployed configuration par <b>roll back</b> karne deta hai.</li>
</ul>
<p>Lab ise simple rakhta hai: <b>Deploy</b> click karo, <i>Deploy the pending access control, NAT and device changes to NK-FTD?</i> confirm karo, <i>Deployment to NK-FTD completed successfully</i> ka intezaar karo.</p>

<h3>Lab 1 walkthrough: pehli policy aur deploy</h3>
<p><b>Task 1.</b> Policies → Access Control → Add Rule <b>Inside-Out</b>: Source Zones INSIDE, Destination Zones OUTSIDE, Destination Ports HTTP, HTTPS, DNS aur ICMP, Action Allow, Save (pichhla chapter dekho).</p>
<p><b>Task 2.</b> Deploy karne se pehle PC1 se test karo: <code>curl 8.8.8.8</code> fail hota hai, kyunki device ab bhi sirf default action wali purani policy chala raha hai. Ab Deploy karo, aur <code>curl 8.8.8.8</code> dobara chalao: kaam karta hai. Aapne abhi Save aur Deploy ka fark saabit kar diya.</p>
<pre class="out">&gt; show access-control-config

===================[ NK-ACP ]====================
Default Action            : Block
<span class="hl">-----------------[ Rule: Inside-Out ]-----------------</span>
    Action                : Allow
    Source Zones          : INSIDE
    Destination Zones     : OUTSIDE
    Destination Ports     : HTTP (protocol 6, port 80), HTTPS (protocol 6, port 443), DNS (protocol 17, port 53), ICMP (protocol 1)</pre>
<p><b>Task 3.</b> FTD CLI par <code>packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 80</code> chalao. ACCESS-LIST phase mein aapko remark <code>L7 RULE: Inside-Out</code> ke saath <code>rule-id 268435457</code> milta hai. Lab mein pehli rule ko 268435457 milta hai, doosri ko 268435458, aur aise hi aage; real device par Management Center unique IDs assign karta hai jo sequential nahi hote, isliye ID hamesha output se padho.</p>
<p><b>Task 4.</b> PC1 se <code>ssh -l admin 8.8.8.8</code> chalao: timeout hota hai. <b>Analysis → Connection Events</b> kholo:</p>
<pre class="out">Time                 Action  Rule            Initiator IP  Responder IP  Port    Ingress Zone  Egress Zone
2026-10-02 09:14:31  <span class="hl">Block   Default Action</span>  10.0.1.10     8.8.8.8       tcp/22  INSIDE        OUTSIDE
2026-10-02 09:13:58  Allow   Inside-Out      10.0.1.10     8.8.8.8       tcp/80  INSIDE        OUTSIDE</pre>
<p>Jawab hai <b>Default Action</b>: koi rule SSH allow nahi karti, isliye policy ki aakhri line ne use block kiya. Real Management Center par path hai <b>Analysis → Connections → Events</b>.</p>

<div class="warn"><p><b>Common galti.</b> Preview dekhe bina din ke beech mein deploy karna. Colleague ke adhoore rule changes, ya Snort restart karne wala change, aapke ek-line fix ke saath bahar chale jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Rule Management Center mein dikh rahi hai par packet-tracer ab bhi default action hit karta hai": deploy nahi hua. Deployment history rollback allow karti hai; change preview deployed aur pending configurations compare karta hai; Inspect Interruption Snort restarts ke baare mein warn karta hai.</p></div>

<div class="scn"><h4>Friday wala deploy</h4><p>Ek engineer ne Friday shaam 4 baje ek single NAT fix deploy kiya. Deployment mein ek colleague ka adhoora intrusion policy change bhi tha, Inspect Interruption ke saath flagged, aur ek test rule jo payment provider ko block karti thi. Card payments 20 minute fail rahe. Team ne Deployment History se rollback kiya, phir preview review karke sirf NAT fix dobara apply kiya.</p><p><b>Seekh:</b> Deploy sab pending push karta hai; preview aur interruption flag padho, aur deployment galat ho to rollback use karo.</p></div>

<div class="iv"><p class="q">"Aapne Management Center mein rule jodi aur kuch nahi badla. Aap kya check karoge?"</p><p>Pehle, kya device out of date hai aur policy deploy hui: deployment status, aur device par <code>show access-control-config</code> taaki dikhe rule wahan hai ya nahi. Phir <code>packet-tracer</code> aur uske rule-id se rule ki position aur conditions, aur Connection Events se ki asal mein kaunsi rule match hui. Deploy se pehle preview aur Deployment History se rollback mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Save candidate badalta hai; Deploy device badalta hai.</li>
<li>Out of date = orange Deploy button; Deploy us device ke saare pending changes push karta hai.</li>
<li>Real Management Center: preview, Inspect Interruption, Deployment History aur rollback.</li>
<li>Lab 1: Inside-Out Deploy se pehle fail, baad mein kaam karti hai; rule-id 268435457; SSH Default Action se takraata hai.</li>
<li>Hamesha device par <code>show access-control-config</code> aur <code>packet-tracer</code> se confirm karo.</li>
</ul></div>
`}};export{e as default};