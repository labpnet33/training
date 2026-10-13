var e={id:`vos-cli`,h:{en:`The VOS CLI: modes, set, commit, rollback, compare`,hi:`VOS CLI: modes, set, commit, rollback, compare`},body:{en:`
<p>Most Versa engineers use the Director web interface for day-to-day work, but the command line on a VOS device is where you prove things. It is fast, scriptable and what you use in a failure when the GUI is slow or the device cannot reach the Director. The VOS CLI feels familiar if you have used Juniper Junos: two modes, hierarchical configuration, a candidate that you check and then commit.</p>

<h3>Analogy: editing a document with a draft copy</h3>
<p>Think of a shared word-processor document. You open a <b>draft</b>, make edits, compare them against the published version, and only when you are satisfied do you press <b>publish</b>. If you changed your mind you throw the draft away. The CLI works exactly like that: edits go to a <b>candidate configuration</b>, <code>commit</code> publishes it, <code>rollback</code> discards the draft.</p>

<h3>Two modes and their prompts</h3>
<table class="cmp"><tr><th>Mode</th><th>Prompt in the lab</th><th>What it is for</th></tr>
<tr><td><b>Operational</b></td><td><code>admin@Branch1-cli&gt;</code></td><td>show, ping and other look-only commands</td></tr>
<tr><td><b>Configure</b></td><td><code>admin@Branch1-cli%</code></td><td>set, delete, show | compare, commit, rollback</td></tr>
</table>
<p>The prompt shows <code>user@hostname-cli</code> followed by <code>&gt;</code> (operational) or <code>%</code> (configure). The hostname comes from <code>set system hostname</code>. Move into configure mode with <code>configure</code>; leave it with <code>exit</code>.</p>
<div class="note"><p><b>Course model versus real VOS.</b> The lab CLI is a simplified model that follows the real style. The real VOS CLI supports many more statements, tab completion, help with a question mark and more show commands. If you meet a statement the lab does not support, the model answers "Invalid or unsupported configuration statement" rather than guessing.</p></div>

<h3>The configuration commands</h3>
<dl class="terms">
<dt><code>set &lt;path&gt;</code></dt><dd>Adds or changes a statement in the candidate. Example: <code>set system hostname Branch1</code>.</dd>
<dt><code>delete &lt;path&gt;</code></dt><dd>Removes a statement from the candidate. The path must match exactly what exists.</dd>
<dt><code>show | compare</code></dt><dd>Lists the differences between candidate and committed configuration. Lines starting with <code>+</code> are additions, <code>-</code> removals.</dd>
<dt><code>commit</code></dt><dd>Validates the candidate and, if valid, applies it as the running configuration. Typical reply: <code>Commit complete.</code> If something is invalid, the commit fails with a message and nothing changes.</dd>
<dt><code>rollback</code></dt><dd>Discards uncommitted changes and returns the candidate to the committed state. In real VOS you can also roll back to earlier committed revisions.</dd>
<dt><code>exit</code></dt><dd>Leaves configure mode. The device warns if uncommitted changes remain.</dd>
</dl>
<p>Statements are <b>hierarchical</b>. The statement <code>set orgs org Acme sd-wan site-id 101</code> reads like a path: organization Acme, then its sd-wan section, then the site-id leaf with value 101. Learn to read left to right and you can read any VOS configuration.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Candidate and running configuration">
<rect x="20" y="40" width="150" height="60" rx="8" fill="#fde68a"/><text x="95" y="68" text-anchor="middle" class="svg-ink" font-size="13">Candidate</text><text x="95" y="86" text-anchor="middle" class="svg-muted" font-size="11">set / delete go here</text>
<rect x="470" y="40" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="68" text-anchor="middle" class="svg-ink" font-size="13">Running</text><text x="545" y="86" text-anchor="middle" class="svg-muted" font-size="11">what the device uses</text>
<line x1="170" y1="60" x2="470" y2="60" stroke="#64748b"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">commit (validated)</text>
<line x1="470" y1="85" x2="170" y2="85" stroke="#64748b" stroke-dasharray="4"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="12">rollback (discard draft)</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">show | compare lists the difference between the two</text>
</svg><p class="cap">Nothing you type with set or delete affects traffic until you commit.</p></div>

<h3>A complete session</h3>
<pre class="code"><span class="c">! Enter configure mode and make a change</span>
admin@Branch1-cli&gt; configure
admin@Branch1-cli% set interfaces vni-0/0 unit 0 family inet address 203.0.113.6/30
admin@Branch1-cli% set interfaces vni-0/0 enable true
<span class="c">! Review exactly what will change</span>
admin@Branch1-cli% show | compare
<span class="c">! Apply it</span>
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<pre class="out">admin@Branch1-cli% show | compare
<span class="hl">+ set interfaces vni-0/0 unit 0 family inet address 203.0.113.6/30</span>
<span class="hl">+ set interfaces vni-0/0 enable true</span>
admin@Branch1-cli% commit
Commit complete.</pre>

<h3>Operational commands you will use constantly</h3>
<pre class="code">show interfaces brief
show route
show configuration
ping 198.51.100.20
show orgs org Acme sd-wan brief
show bgp neighbor brief</pre>
<p><code>show configuration</code> prints the running configuration as a list of statements, a good way to see exactly what a previous engineer set. <code>show interfaces brief</code> lists each vni port with admin state, operational state and address. <code>show route</code> lists routes; in the lab it shows the connected and static routes. The two <code>orgs org Acme sd-wan</code> and <code>bgp</code> commands are the overlay health checks. In the real product you would also use the Director GUI for monitoring, and commands such as <code>monitor</code> for live data.</p>

<div class="eg"><p><b>Worked example: a safe change.</b> You must correct a wrong address. 1) <code>configure</code>. 2) <code>delete ...</code> the wrong statement and <code>set ...</code> the right one. 3) <code>show | compare</code>: you expect exactly one <code>-</code> line and one <code>+</code> line. If the diff shows more, stop, run <code>rollback</code> and rethink. 4) <code>commit</code>. 5) <code>exit</code> and verify with the show command. This habit prevents accidental wide changes.</p></div>

<h3>Director-pushed configuration</h3>
<p>When a branch is managed by a Director template, the lines pushed from the template are read-only on the branch: you cannot override them locally. The correct fix is to change the template or the device's bind data in the Director. In the labs of this module the branches are configured directly, which is the right model for learning the statements; later modules use the Director workflow.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing <code>set</code> and forgetting <code>commit</code>: nothing changed, and the show command still shows the old state. (2) Typing show commands in configure mode, or set commands in operational mode: the CLI will reject them, so check the prompt symbol. (3) Using <code>delete</code> on a path that does not exist; the CLI returns "No such configuration element". (4) Leaving configure mode with uncommitted changes; the warning is easy to miss.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>commit</code> validates but does not prove correctness. A commit can succeed with a wrong Controller address, because the syntax is valid. Always verify with a show command and a ping after commit.</p></div>

<div class="scn"><h4>The change that never happened</h4><p>An engineer finished a late-night change on a Pune branch, saw no errors, closed the session and reported success. In the morning the branch was still down. He had typed all the set statements but exited without committing. The device had warned him about uncommitted changes, but the message had scrolled away. He re-entered configure mode, ran show | compare to see his draft was gone, redid the work and committed.</p><p><b>Lesson:</b> a change is not real until committed, and not proven until verified.</p></div>

<div class="iv"><p class="q">"How do you make a safe configuration change on a VOS device?"</p><p>Strong answer: enter configure mode, make the minimal set or delete statements, review with show | compare, commit, exit and verify with operational commands. Mention rollback to discard a draft and that template-pushed config is read-only on the branch, so you fix it centrally.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operational mode (prompt &gt;) for show and ping; configure mode (prompt %) for changes.</li>
<li>set and delete edit a candidate; show | compare reviews it; commit applies it; rollback discards it.</li>
<li>Statements are hierarchical paths: read them left to right.</li>
<li>A successful commit does not prove the change works; verify after.</li>
<li>Template-pushed lines are read-only on the branch; fix them in the Director.</li>
</ul></div>
`,hi:`
<p>Zyada tar Versa engineers daily kaam ke liye Director web interface use karte hain, lekin VOS device ki command line woh jagah hai jahan aap cheezein prove karte ho. Yeh tez hai, scriptable hai aur failure mein jab GUI slow ho ya device Director tak na pahunch sake tab aap yahi use karte ho. Agar aapne Juniper Junos use kiya hai to VOS CLI jaana-pehchana lagega: do modes, hierarchical configuration, ek candidate jise aap check karke commit karte ho.</p>

<h3>Analogy: draft copy ke saath document edit karna</h3>
<p>Ek shared word-processor document socho. Aap ek <b>draft</b> kholte ho, edits karte ho, unhe published version se compare karte ho, aur jab santusht ho tab hi <b>publish</b> dabate ho. Mann badal jaye to draft phenk dete ho. CLI bilkul aise hi kaam karta hai: edits ek <b>candidate configuration</b> mein jaate hain, <code>commit</code> use publish karta hai, <code>rollback</code> draft discard karta hai.</p>

<h3>Do modes aur unke prompts</h3>
<table class="cmp"><tr><th>Mode</th><th>Lab mein prompt</th><th>Kis kaam ke liye</th></tr>
<tr><td><b>Operational</b></td><td><code>admin@Branch1-cli&gt;</code></td><td>show, ping aur dusre look-only commands</td></tr>
<tr><td><b>Configure</b></td><td><code>admin@Branch1-cli%</code></td><td>set, delete, show | compare, commit, rollback</td></tr>
</table>
<p>Prompt <code>user@hostname-cli</code> dikhata hai, uske baad <code>&gt;</code> (operational) ya <code>%</code> (configure). Hostname <code>set system hostname</code> se aata hai. Configure mode mein <code>configure</code> se jaate ho; <code>exit</code> se bahar aate ho.</p>
<div class="note"><p><b>Course model versus real VOS.</b> Lab CLI ek simplified model hai jo real style follow karta hai. Real VOS CLI mein bahut zyada statements, tab completion, question mark se help aur zyada show commands hote hain. Agar aapko aisa statement mile jo lab support nahi karta, to model guess karne ke bajay "Invalid or unsupported configuration statement" bolta hai.</p></div>

<h3>Configuration commands</h3>
<dl class="terms">
<dt><code>set &lt;path&gt;</code></dt><dd>Candidate mein statement add ya change karta hai. Example: <code>set system hostname Branch1</code>.</dd>
<dt><code>delete &lt;path&gt;</code></dt><dd>Candidate se statement hatata hai. Path bilkul wahi hona chahiye jo exist karta hai.</dd>
<dt><code>show | compare</code></dt><dd>Candidate aur committed configuration ka difference dikhata hai. <code>+</code> se shuru lines additions hain, <code>-</code> removals.</dd>
<dt><code>commit</code></dt><dd>Candidate ko validate karta hai aur valid ho to running configuration ke roop mein apply karta hai. Typical reply: <code>Commit complete.</code> Kuch invalid ho to commit message ke saath fail hota hai aur kuch nahi badalta.</dd>
<dt><code>rollback</code></dt><dd>Uncommitted changes discard karta hai aur candidate ko committed state par wapas laata hai. Real VOS mein aap pehle ke committed revisions par bhi rollback kar sakte ho.</dd>
<dt><code>exit</code></dt><dd>Configure mode chhodta hai. Uncommitted changes bache hon to device warn karta hai.</dd>
</dl>
<p>Statements <b>hierarchical</b> hain. Statement <code>set orgs org Acme sd-wan site-id 101</code> path ki tarah padhta hai: organization Acme, phir uska sd-wan section, phir site-id leaf value 101 ke saath. Left to right padhna seekh lo to aap koi bhi VOS configuration padh sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Candidate aur running configuration">
<rect x="20" y="40" width="150" height="60" rx="8" fill="#fde68a"/><text x="95" y="68" text-anchor="middle" class="svg-ink" font-size="13">Candidate</text><text x="95" y="86" text-anchor="middle" class="svg-muted" font-size="11">set / delete yahan jaate hain</text>
<rect x="470" y="40" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="68" text-anchor="middle" class="svg-ink" font-size="13">Running</text><text x="545" y="86" text-anchor="middle" class="svg-muted" font-size="11">device yahi use karta hai</text>
<line x1="170" y1="60" x2="470" y2="60" stroke="#64748b"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">commit (validated)</text>
<line x1="470" y1="85" x2="170" y2="85" stroke="#64748b" stroke-dasharray="4"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="12">rollback (draft discard)</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">show | compare dono ka difference dikhata hai</text>
</svg><p class="cap">Set ya delete se type ki hui koi cheez commit karne tak traffic ko affect nahi karti.</p></div>

<h3>Ek poora session</h3>
<pre class="code"><span class="c">! Configure mode mein jao aur change karo</span>
admin@Branch1-cli&gt; configure
admin@Branch1-cli% set interfaces vni-0/0 unit 0 family inet address 203.0.113.6/30
admin@Branch1-cli% set interfaces vni-0/0 enable true
<span class="c">! Dekho bilkul kya badlega</span>
admin@Branch1-cli% show | compare
<span class="c">! Apply karo</span>
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<pre class="out">admin@Branch1-cli% show | compare
<span class="hl">+ set interfaces vni-0/0 unit 0 family inet address 203.0.113.6/30</span>
<span class="hl">+ set interfaces vni-0/0 enable true</span>
admin@Branch1-cli% commit
Commit complete.</pre>

<h3>Operational commands jo aap baar baar use karoge</h3>
<pre class="code">show interfaces brief
show route
show configuration
ping 198.51.100.20
show orgs org Acme sd-wan brief
show bgp neighbor brief</pre>
<p><code>show configuration</code> running configuration ko statements ki list ki tarah print karta hai, yeh dekhne ka achha tareeka hai ki pehle ke engineer ne bilkul kya set kiya. <code>show interfaces brief</code> har vni port ko admin state, operational state aur address ke saath list karta hai. <code>show route</code> routes list karta hai; lab mein yeh connected aur static routes dikhata hai. <code>orgs org Acme sd-wan</code> aur <code>bgp</code> wale do commands overlay health checks hain. Real product mein monitoring ke liye Director GUI aur live data ke liye <code>monitor</code> jaise commands bhi use karoge.</p>

<div class="eg"><p><b>Worked example: safe change.</b> Aapko galat address correct karna hai. 1) <code>configure</code>. 2) Galat statement <code>delete ...</code> karo aur sahi <code>set ...</code> karo. 3) <code>show | compare</code>: aap ek <code>-</code> line aur ek <code>+</code> line expect karte ho. Diff zyada dikhaye to ruko, <code>rollback</code> chalao aur dobara socho. 4) <code>commit</code>. 5) <code>exit</code> karo aur show command se verify karo. Yeh aadat accidental wide changes se bachati hai.</p></div>

<h3>Director-pushed configuration</h3>
<p>Jab branch Director template se managed hoti hai, to template se push hui lines branch par read-only hoti hain: aap unhe locally override nahi kar sakte. Sahi fix hai Director mein template ya device ke bind data ko badalna. Is module ke labs mein branches seedha configure hoti hain, jo statements seekhne ke liye sahi model hai; aage ke modules Director workflow use karte hain.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>set</code> type karke <code>commit</code> bhool jaana: kuch nahi badla, aur show command abhi bhi purani state dikhata hai. (2) Configure mode mein show commands ya operational mode mein set commands type karna: CLI reject karega, isliye prompt symbol check karo. (3) Aise path par <code>delete</code> karna jo exist nahi karta; CLI "No such configuration element" deta hai. (4) Uncommitted changes ke saath configure mode chhodna; warning miss karna aasan hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>commit</code> validate karta hai lekin correctness prove nahi karta. Galat Controller address ke saath bhi commit succeed ho sakta hai, kyunki syntax valid hai. Commit ke baad hamesha show command aur ping se verify karo.</p></div>

<div class="scn"><h4>Woh change jo hua hi nahi</h4><p>Ek engineer ne Pune branch par late-night change poora kiya, koi error nahi dikha, session band kiya aur success report kiya. Subah branch abhi bhi down thi. Usne saare set statements type kiye the lekin commit kiye bina exit kar gaya. Device ne uncommitted changes ki warning di thi, lekin message scroll ho gaya tha. Usne dobara configure mode mein ja kar show | compare se dekha ki uska draft ja chuka hai, kaam dobara kiya aur commit kiya.</p><p><b>Seekh:</b> change commit hone tak real nahi hai, aur verify hone tak proven nahi hai.</p></div>

<div class="iv"><p class="q">"VOS device par safe configuration change kaise karte ho?"</p><p>Strong answer: configure mode mein jao, minimal set ya delete statements karo, show | compare se review karo, commit karo, exit karo aur operational commands se verify karo. Rollback se draft discard hota hai aur template-pushed config branch par read-only hai, isliye use centrally fix karte hain, yeh mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operational mode (prompt &gt;) show aur ping ke liye; configure mode (prompt %) changes ke liye.</li>
<li>set aur delete candidate edit karte hain; show | compare review karta hai; commit apply karta hai; rollback discard karta hai.</li>
<li>Statements hierarchical paths hain: left to right padho.</li>
<li>Successful commit prove nahi karta ki change kaam karta hai; baad mein verify karo.</li>
<li>Template-pushed lines branch par read-only hain; unhe Director mein fix karo.</li>
</ul></div>
`}};export{e as default};