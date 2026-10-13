var e={id:`jobs-and-status`,h:{en:`Jobs and statuses: Commit, CommitAll, Validate and Out of Sync`,hi:`Jobs aur statuses: Commit, CommitAll, Validate aur Out of Sync`},body:{en:`
<p>Every commit, push and validation leaves a record called a <b>job</b>. Jobs are your audit trail: they tell you what ran, when, and with what result. Together with the sync columns of <code>show devices all</code> they answer "what state is each device in?".</p>

<h3>Analogy: the courier receipt book</h3>
<p>A courier company keeps a receipt for every parcel: type of parcel, time, delivered or failed. If the customer says "you never delivered", you open the receipt book. Jobs are that receipt book. Sync status is the current delivery status board.</p>

<h3>Job types</h3>
<table class="tbl">
<tr><th>Type</th><th>Created by</th><th>Changes devices?</th></tr>
<tr><td>Commit</td><td><code>commit</code> on Panorama or on a firewall</td><td>Only the device it ran on</td></tr>
<tr><td>CommitAll</td><td>A real push (<code>commit-all</code>)</td><td>Firewalls receive and commit configuration</td></tr>
<tr><td>Validate</td><td><code>commit-all ... validate-only yes</code></td><td>No</td></tr>
</table>
<pre class="out">PANO&gt; show jobs all
Enqueued              Dequeued              ID    Type        Status  Result  Completed
2026-10-04 13:10:54   2026-10-04 13:10:54   4     Validate    FIN     <span class="hl">FAIL</span>    2026-10-04 13:10:54
2026-10-04 13:10:54   2026-10-04 13:10:54   3     CommitAll   FIN     OK      2026-10-04 13:10:54
2026-10-04 13:10:42   2026-10-04 13:10:42   2     Commit      FIN     OK      2026-10-04 13:10:42</pre>
<p>Read it bottom up: job 2 is a commit to Panorama, job 3 pushed the template stack, job 4 validated the device group and failed on at least one firewall. The firewalls also record jobs: run <code>show jobs all</code> on a firewall to see the push as the firewall saw it. Timestamps in your lab differ; the pattern is what matters.</p>

<h3>Sync status</h3>
<p><code>show devices all</code> has two sync columns: <b>Shared policy</b> (device group) and <b>Template</b>. Each is one of:</p>
<ul>
<li><b>In Sync</b>: the firewall holds the same configuration that Panorama currently has committed.</li>
<li><b>Out of Sync</b>: Panorama's running configuration differs from what the firewall holds: a commit happened after the last successful push, or the last push failed on that firewall.</li>
</ul>
<pre class="out">Serial            Hostname          Connected  Device group   Template stack  Shared policy  Template
0079151765883     NK-CHENNAI-PA     yes        NK-BRANCHES    NK-STACK        <span class="hl">Out of Sync</span>    In Sync</pre>
<p>The row above says: Chennai's template is current, but its policy is not. That tells you exactly which package to push or fix, without guessing.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Sync states">
<rect x="30" y="30" width="170" height="56" rx="8" fill="#bbf7d0"/><text x="115" y="62" text-anchor="middle" class="svg-ink" font-size="13">In Sync</text>
<rect x="440" y="30" width="170" height="56" rx="8" fill="#fde68a"/><text x="525" y="62" text-anchor="middle" class="svg-ink" font-size="13">Out of Sync</text>
<line x1="200" y1="46" x2="440" y2="46" stroke="#64748b" stroke-width="2"/><text x="320" y="38" text-anchor="middle" class="svg-accent" font-size="11">commit to Panorama, or failed push</text>
<line x1="440" y1="72" x2="200" y2="72" stroke="#64748b" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="11">successful push</text>
</svg><p class="cap">Sync status moves with commits and pushes. In this simulator it is session state.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading Validate job OK as "deployed"; ignoring the Template column and only watching Shared policy; looking only at Panorama jobs and not the firewall's own job list.</p></div>
<div class="exam"><p><b>Exam trap.</b> Three job types to remember: Commit, CommitAll, Validate. Only a Validate job guarantees nothing changed on firewalls.</p></div>

<div class="scn"><h4>"Did the push run last night?"</h4><p>A manager asked whether the overnight change reached Delhi. The engineer ran show jobs all on Panorama and on the Delhi firewall: a CommitAll job existed with a FAIL result, and the inventory still said Out of Sync. The change had not landed; the failure message explained why.</p><p><b>Lesson:</b> jobs plus sync columns answer audit questions in a minute.</p></div>

<div class="iv"><p class="q">"How do you know a push really reached a firewall?"</p><p>The CommitAll job result, show devices all showing In Sync for the right column, and on the firewall show config pushed-shared-policy or pushed-template plus its own show jobs all.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Jobs record Commit, CommitAll and Validate.</li>
<li>Two sync columns: Shared policy and Template.</li>
<li>Out of Sync means Panorama is ahead or the last push failed.</li>
<li>Check both Panorama and firewall job lists.</li>
</ul></div>
`,hi:`
<p>Har commit, push aur validation ek record chhodta hai jise <b>job</b> kehte hain. Jobs aapka audit trail hain: kya chala, kab, aur kya result. <code>show devices all</code> ke sync columns ke saath ye jawab dete hain "har device kis state mein hai?".</p>

<h3>Analogy: courier receipt book</h3>
<p>Courier company har parcel ki receipt rakhti hai: parcel type, time, delivered ya failed. Customer kahe "aapne deliver nahi kiya", to receipt book kholte hain. Jobs wahi receipt book hain. Sync status current delivery status board hai.</p>

<h3>Job types</h3>
<table class="tbl">
<tr><th>Type</th><th>Kisse bana</th><th>Devices badalta hai?</th></tr>
<tr><td>Commit</td><td>Panorama ya firewall par <code>commit</code></td><td>Sirf wo device jis par chala</td></tr>
<tr><td>CommitAll</td><td>Real push (<code>commit-all</code>)</td><td>Firewalls configuration receive karke commit karte hain</td></tr>
<tr><td>Validate</td><td><code>commit-all ... validate-only yes</code></td><td>Nahi</td></tr>
</table>
<pre class="out">PANO&gt; show jobs all
Enqueued              Dequeued              ID    Type        Status  Result  Completed
2026-10-04 13:10:54   2026-10-04 13:10:54   4     Validate    FIN     <span class="hl">FAIL</span>    2026-10-04 13:10:54
2026-10-04 13:10:54   2026-10-04 13:10:54   3     CommitAll   FIN     OK      2026-10-04 13:10:54
2026-10-04 13:10:42   2026-10-04 13:10:42   2     Commit      FIN     OK      2026-10-04 13:10:42</pre>
<p>Neeche se upar padho: job 2 commit to Panorama hai, job 3 ne template stack push kiya, job 4 ne device group validate kiya aur kam se kam ek firewall par fail hua. Firewalls bhi jobs record karte hain: firewall par <code>show jobs all</code> chalao to push wahi dikhega jaisa firewall ne dekha. Aapke lab mein timestamps alag honge; pattern matter karta hai.</p>

<h3>Sync status</h3>
<p><code>show devices all</code> mein do sync columns hain: <b>Shared policy</b> (device group) aur <b>Template</b>. Har ek ye hota hai:</p>
<ul>
<li><b>In Sync</b>: firewall ke paas wahi configuration hai jo Panorama ne abhi committed rakhi hai.</li>
<li><b>Out of Sync</b>: Panorama ki running configuration firewall ke paas jo hai usse alag hai: last successful push ke baad commit hua, ya us firewall par last push fail hua.</li>
</ul>
<pre class="out">Serial            Hostname          Connected  Device group   Template stack  Shared policy  Template
0079151765883     NK-CHENNAI-PA     yes        NK-BRANCHES    NK-STACK        <span class="hl">Out of Sync</span>    In Sync</pre>
<p>Upar ki row kehti hai: Chennai ka template current hai, par policy nahi. Ye bina guess kiye batata hai ki kaunsa package push ya fix karna hai.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Sync states">
<rect x="30" y="30" width="170" height="56" rx="8" fill="#bbf7d0"/><text x="115" y="62" text-anchor="middle" class="svg-ink" font-size="13">In Sync</text>
<rect x="440" y="30" width="170" height="56" rx="8" fill="#fde68a"/><text x="525" y="62" text-anchor="middle" class="svg-ink" font-size="13">Out of Sync</text>
<line x1="200" y1="46" x2="440" y2="46" stroke="#64748b" stroke-width="2"/><text x="320" y="38" text-anchor="middle" class="svg-accent" font-size="11">commit to Panorama, ya failed push</text>
<line x1="440" y1="72" x2="200" y2="72" stroke="#64748b" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="11">successful push</text>
</svg><p class="cap">Sync status commits aur pushes ke saath badalta hai. Is simulator mein ye session state hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Validate job OK ko "deployed" padhna; Template column ignore karke sirf Shared policy dekhna; sirf Panorama jobs dekhna aur firewall ki apni job list nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen job types yaad rakho: Commit, CommitAll, Validate. Sirf Validate job guarantee deta hai ki firewalls par kuch nahi badla.</p></div>

<div class="scn"><h4>"Kya raat ko push chala tha?"</h4><p>Manager ne poochha ki overnight change Delhi tak pahuncha ya nahi. Engineer ne Panorama aur Delhi firewall dono par show jobs all chalaya: CommitAll job FAIL result ke saath tha, aur inventory abhi bhi Out of Sync dikha rahi thi. Change land nahi hua tha; failure message ne wajah bata di.</p><p><b>Lesson:</b> jobs plus sync columns audit questions ka jawab ek minute mein dete hain.</p></div>

<div class="iv"><p class="q">"Kaise pata ki push sach mein firewall tak pahuncha?"</p><p>CommitAll job result, show devices all mein sahi column In Sync, aur firewall par show config pushed-shared-policy ya pushed-template plus uska apna show jobs all.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Jobs Commit, CommitAll aur Validate record karte hain.</li>
<li>Do sync columns: Shared policy aur Template.</li>
<li>Out of Sync matlab Panorama aage hai ya last push fail hua.</li>
<li>Panorama aur firewall dono ki job list check karo.</li>
</ul></div>
`}};export{e as default};