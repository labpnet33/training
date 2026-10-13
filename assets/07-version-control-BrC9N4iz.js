var e={id:`version-control`,h:{en:`Version control: why every team uses it`,hi:`Version control: har team ise kyun use karti hai`},body:{en:`
<p>Blueprint item 1.7 asks for the <b>advantages of version control</b>. The Git commands (init, clone, add, commit, branch, merge, push) are taught step by step in the Git module of this academy, so we do not repeat them. Here we answer the question an interviewer will ask: <i>why</i> do we bother?</p>

<h3>Analogy: the save history of a shared document</h3>
<p>Imagine five people editing one report by emailing files named <code>report_final.docx</code>, <code>report_final2.docx</code> and <code>report_FINAL_really.docx</code>. Nobody knows which is current, two people fix the same paragraph differently, and a deleted section cannot be recovered. A shared document with <b>history</b> solves this: every change is saved, labelled with who and when, and any earlier version can be restored. Version control is that idea, built for code and other text files, with much stronger tools for combining everyone's work.</p>

<h3>What a version control system does</h3>
<p>A <b>version control system (VCS)</b> records every change to a set of files in a <b>repository</b>. Each saved snapshot is a <b>commit</b>: it has an id, an author, a time and a message explaining why. Git is the most widely used VCS and is <b>distributed</b>: every developer has a full copy of the repository with its history, and a shared server (a Git host) is where teams exchange changes. Older <b>centralised</b> systems (such as Subversion) keep the history on one server.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Commit history with a branch">
<line x1="30" y1="60" x2="610" y2="60" stroke="#64748b" stroke-width="3"/>
<circle cx="60" cy="60" r="11" fill="#bae6fd" stroke="#64748b"/><circle cx="170" cy="60" r="11" fill="#bae6fd" stroke="#64748b"/><circle cx="280" cy="60" r="11" fill="#bae6fd" stroke="#64748b"/><circle cx="520" cy="60" r="13" fill="#bbf7d0" stroke="#64748b"/>
<text x="60" y="38" text-anchor="middle" class="svg-ink" font-size="11">first version</text><text x="170" y="38" text-anchor="middle" class="svg-ink" font-size="11">add checker</text><text x="280" y="38" text-anchor="middle" class="svg-ink" font-size="11">fix typo</text><text x="520" y="38" text-anchor="middle" class="svg-ink" font-size="11">merge</text>
<path d="M280 60 C310 60 320 140 350 140 L430 140 C480 140 490 60 520 60" fill="none" stroke="#64748b" stroke-width="3"/>
<circle cx="360" cy="140" r="11" fill="#fde68a" stroke="#64748b"/><circle cx="440" cy="140" r="11" fill="#fde68a" stroke="#64748b"/>
<text x="400" y="176" text-anchor="middle" class="svg-ink" font-size="11">branch: new-feature (safe to experiment)</text>
<text x="590" y="85" text-anchor="end" class="svg-muted" font-size="11">main branch</text>
</svg><p class="cap">History is a line of commits. A branch is a side line for safe work; a merge brings it back to main.</p></div>

<h3>The advantages</h3>
<dl class="terms">
<dt>Full history and rollback</dt><dd>Every change is kept. If last night's change broke the VLAN tool, you return to yesterday's version in seconds.</dd>
<dt>Accountability (who, when, why)</dt><dd>Each commit has an author, a time and a message. When a config line looks odd, you can ask who changed it and why.</dd>
<dt>Collaboration</dt><dd>Many people edit the same project at once. The system merges non-conflicting changes automatically and flags real conflicts for a human.</dd>
<dt>Branching</dt><dd>Work on a feature or a fix on a separate branch so the stable main code is untouched. Merge only when it is ready and reviewed.</dd>
<dt>Backup and recovery</dt><dd>Because every clone holds the history, losing one laptop or server does not lose the project.</dd>
<dt>Review and quality gates</dt><dd>Changes can be proposed (a pull or merge request), reviewed and tested automatically before they join main. The next chapters build on this.</dd>
<dt>Tagging and releases</dt><dd>A tag marks an exact version, for example <code>v1.2.0</code>, so you always know what is deployed.</dd>
<dt>Automation</dt><dd>Pipelines can start on every commit: run the unit tests, check the style, deploy to a lab. This is the base of CI/CD.</dd>
</dl>

<h3>Why this matters even more for network engineers</h3>
<p>Network config is text. Router configs, Ansible playbooks, Jinja2 templates and Python scripts can all live in a repository. This practice is often called <b>infrastructure as code</b> or <b>config as code</b>. A change to a firewall rule then becomes a commit with a message and a reviewer, not an untracked late-night CLI session. If an outage follows, the history shows the exact change, and the rollback is a known earlier version.</p>
<pre class="out">a41f9c2 Reject VLAN ids above 4094 in is_valid_vlan
7be03d1 Add make_vlan_config with ValueError on bad id
c19ab77 First version of vlan_tools.py
<span class="hl">(each line: commit id, then the message saying why)</span></pre>

<h3>What belongs in a repository, and what does not</h3>
<ul>
<li><b>Yes:</b> source code, tests, templates, documentation, configuration that is not secret.</li>
<li><b>No:</b> passwords, API tokens, private keys and other secrets. Anyone with access to the history, even years later, can read them. Keep secrets in a vault or environment variables and list local files in an ignore file.</li>
<li><b>No:</b> big generated files and downloaded packages; they can be rebuilt.</li>
</ul>
<div class="warn"><p><b>Common mistakes.</b> Committing a router password or token "just for now". Making huge commits with the message "stuff" so nobody can tell what changed. Working for days on the main branch with no review. Treating the Git host as the only backup of work that was never committed.</p></div>
<div class="tip"><p><b>Good commit habits.</b> One logical change per commit; a message that says <i>why</i> ("Reject VLAN 0 because switches refuse it"); commit often; never rewrite history that others have already pulled.</p></div>
<div class="exam"><p><b>Exam trap.</b> Version control is not just a backup. Expect the answer that lists tracking changes and history, collaboration, branching and merging, and the ability to revert. Also know Git is distributed (each clone has full history) while the term "GitHub" or "GitLab" names a hosting service, not Git itself.</p></div>

<div class="scn"><h4>The 02:00 rollback</h4><p>After a maintenance window, branch users lost internet. The network team stored every router template in Git. The history showed one commit that evening, "change NAT pool to new /29", authored by a colleague with a link to the ticket. They reverted that single commit, the pipeline re-pushed the old template and service returned in eleven minutes. In the review the next day, the team added a lab test for the new pool.</p><p><b>Lesson:</b> history turns "what changed?" from a mystery into a lookup.</p></div>
<div class="iv"><p class="q">"What are the advantages of using version control?"</p><p>Complete history with the ability to roll back; accountability through author, time and message; collaboration with automatic merging; branching to isolate work; distributed copies as a backup; review before merge; tags for releases; and triggering automation such as tests and deployment. Add a network example: router configs and automation scripts kept in Git so every change is reviewed and reversible.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VCS records every change as a commit with author, time and message.</li>
<li>Advantages: history and rollback, accountability, collaboration, branching, backup, review, releases, automation.</li>
<li>Git is distributed: every clone holds the whole history.</li>
<li>Keep configs and scripts in version control; never commit secrets.</li>
<li>The Git commands themselves are in the Git module.</li>
</ul></div>
`,hi:`
<p>Blueprint item 1.7 <b>version control ke advantages</b> maangta hai. Git ke commands (init, clone, add, commit, branch, merge, push) is academy ke Git module mein step by step sikhaye jaate hain, isliye hum unhe repeat nahi karte. Yahan hum woh sawaal answer karte hain jo interviewer poochega: hum <i>kyun</i> itni mehnat karte hain?</p>

<h3>Analogy: shared document ki save history</h3>
<p>Socho paanch log ek report ko <code>report_final.docx</code>, <code>report_final2.docx</code> aur <code>report_FINAL_really.docx</code> naam ki files email karke edit kar rahe hain. Kisi ko nahi pata kaun si current hai, do log ek hi paragraph alag tareeke se fix karte hain, aur delete hua section wapas nahi aata. <b>History</b> wala shared document isse solve karta hai: har change save hota hai, kisne aur kab ka label ke saath, aur koi bhi purana version wapas laya ja sakta hai. Version control wahi idea hai, code aur doosri text files ke liye, sabka kaam jodne ke kahin mazboot tools ke saath.</p>

<h3>Version control system kya karta hai</h3>
<p><b>Version control system (VCS)</b> files ke set ke har change ko ek <b>repository</b> mein record karta hai. Har saved snapshot ek <b>commit</b> hai: uska id, author, time aur kyun ka message hota hai. Git sabse zyada use hone wala VCS hai aur <b>distributed</b> hai: har developer ke paas history ke saath poori repository ki copy hoti hai, aur ek shared server (Git host) woh jagah hai jahan teams changes exchange karti hain. Purane <b>centralised</b> systems (jaise Subversion) history ek server par rakhte hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Branch ke saath commit history">
<line x1="30" y1="60" x2="610" y2="60" stroke="#64748b" stroke-width="3"/>
<circle cx="60" cy="60" r="11" fill="#bae6fd" stroke="#64748b"/><circle cx="170" cy="60" r="11" fill="#bae6fd" stroke="#64748b"/><circle cx="280" cy="60" r="11" fill="#bae6fd" stroke="#64748b"/><circle cx="520" cy="60" r="13" fill="#bbf7d0" stroke="#64748b"/>
<text x="60" y="38" text-anchor="middle" class="svg-ink" font-size="11">first version</text><text x="170" y="38" text-anchor="middle" class="svg-ink" font-size="11">add checker</text><text x="280" y="38" text-anchor="middle" class="svg-ink" font-size="11">fix typo</text><text x="520" y="38" text-anchor="middle" class="svg-ink" font-size="11">merge</text>
<path d="M280 60 C310 60 320 140 350 140 L430 140 C480 140 490 60 520 60" fill="none" stroke="#64748b" stroke-width="3"/>
<circle cx="360" cy="140" r="11" fill="#fde68a" stroke="#64748b"/><circle cx="440" cy="140" r="11" fill="#fde68a" stroke="#64748b"/>
<text x="400" y="176" text-anchor="middle" class="svg-ink" font-size="11">branch: new-feature (experiment karna safe)</text>
<text x="590" y="85" text-anchor="end" class="svg-muted" font-size="11">main branch</text>
</svg><p class="cap">History commits ki ek line hai. Branch safe kaam ke liye side line hai; merge use main mein wapas laata hai.</p></div>

<h3>Advantages</h3>
<dl class="terms">
<dt>Poori history aur rollback</dt><dd>Har change rakha jaata hai. Agar kal raat ke change ne VLAN tool tod diya, aap kal ke version par seconds mein wapas aa jaate ho.</dd>
<dt>Accountability (kisne, kab, kyun)</dt><dd>Har commit mein author, time aur message hota hai. Config line ajeeb lage to pooch sakte ho kisne badli aur kyun.</dd>
<dt>Collaboration</dt><dd>Kai log ek hi project ek saath edit karte hain. System jo changes takrate nahi unhe automatically merge karta hai aur asli conflicts insaan ke liye flag karta hai.</dd>
<dt>Branching</dt><dd>Feature ya fix par alag branch par kaam karo taaki stable main code chhua na jaye. Ready aur reviewed hone par hi merge karo.</dd>
<dt>Backup aur recovery</dt><dd>Kyunki har clone mein history hai, ek laptop ya server khone se project nahi khota.</dd>
<dt>Review aur quality gates</dt><dd>Changes propose (pull ya merge request), review aur automatically test ho sakte hain main mein judne se pehle. Agle chapters isi par bante hain.</dd>
<dt>Tagging aur releases</dt><dd>Tag ek exact version mark karta hai, jaise <code>v1.2.0</code>, taaki hamesha pata rahe kya deploy hai.</dd>
<dt>Automation</dt><dd>Pipelines har commit par shuru ho sakti hain: unit tests chalao, style check karo, lab mein deploy karo. Yeh CI/CD ki neev hai.</dd>
</dl>

<h3>Network engineers ke liye yeh aur zyada kyun matter karta hai</h3>
<p>Network config text hai. Router configs, Ansible playbooks, Jinja2 templates aur Python scripts sab repository mein rah sakte hain. Is practice ko aksar <b>infrastructure as code</b> ya <b>config as code</b> kehte hain. Firewall rule ka change ab message aur reviewer wala commit ban jaata hai, bina track hue raat ki CLI session nahi. Outage ho to history exact change dikhati hai, aur rollback ek jaana-pehchana purana version hai.</p>
<pre class="out">a41f9c2 Reject VLAN ids above 4094 in is_valid_vlan
7be03d1 Add make_vlan_config with ValueError on bad id
c19ab77 First version of vlan_tools.py
<span class="hl">(har line: commit id, phir kyun ka message)</span></pre>

<h3>Repository mein kya jaata hai, kya nahi</h3>
<ul>
<li><b>Haan:</b> source code, tests, templates, documentation, woh configuration jo secret nahi.</li>
<li><b>Nahi:</b> passwords, API tokens, private keys aur doosre secrets. History tak jiski access hai woh saalon baad bhi unhe padh sakta hai. Secrets vault ya environment variables mein rakho aur local files ko ignore file mein likho.</li>
<li><b>Nahi:</b> bade generated files aur download kiye packages; woh dobara ban sakte hain.</li>
</ul>
<div class="warn"><p><b>Aam galtiyan.</b> Router password ya token "abhi ke liye" commit karna. "stuff" message ke saath bade commits karna jisse koi nahi bata sakta kya badla. Kai din bina review ke main branch par kaam karna. Jo kaam kabhi commit nahi hua usse Git host par sirf backup maan lena.</p></div>
<div class="tip"><p><b>Achhi commit aadatein.</b> Ek commit mein ek logical change; message jo <i>kyun</i> batata ho ("VLAN 0 reject karo kyunki switches mana karte hain"); aksar commit karo; jo history doosre pull kar chuke hain use kabhi rewrite mat karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Version control sirf backup nahi hai. Aisa jawab aayega jo changes aur history track karna, collaboration, branching aur merging, aur revert karne ki kshamta ginata ho. Yeh bhi jaano ki Git distributed hai (har clone mein poori history) jabki "GitHub" ya "GitLab" hosting service ka naam hai, Git ka nahi.</p></div>

<div class="scn"><h4>Raat 2 baje ka rollback</h4><p>Maintenance window ke baad branch users ka internet chala gaya. Network team ne har router template Git mein rakha tha. History mein us shaam ek commit dikha, "change NAT pool to new /29", ek colleague ka, ticket ke link ke saath. Unhone sirf us ek commit ko revert kiya, pipeline ne purana template dobara push kiya aur service gyaarah minute mein wapas aa gayi. Agle din ke review mein team ne naye pool ke liye lab test jod diya.</p><p><b>Lesson:</b> history "kya badla?" ko rahasya se lookup bana deti hai.</p></div>
<div class="iv"><p class="q">"Version control use karne ke advantages kya hain?"</p><p>Poori history aur roll back karne ki kshamta; author, time aur message se accountability; automatic merging ke saath collaboration; kaam alag karne ke liye branching; backup ke roop mein distributed copies; merge se pehle review; releases ke liye tags; aur tests aur deployment jaisi automation trigger karna. Network example jodo: router configs aur automation scripts Git mein taaki har change reviewed aur reversible ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VCS har change ko author, time aur message ke saath commit ke roop mein record karta hai.</li>
<li>Advantages: history aur rollback, accountability, collaboration, branching, backup, review, releases, automation.</li>
<li>Git distributed hai: har clone mein poori history hai.</li>
<li>Configs aur scripts version control mein rakho; secrets kabhi commit mat karo.</li>
<li>Git ke commands Git module mein hain.</li>
</ul></div>
`}};export{e as default};