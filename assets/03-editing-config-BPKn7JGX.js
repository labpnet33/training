var e={id:`editing-config`,h:{en:`Editing the configuration: set, delete, rename, activate`,hi:`Configuration edit karna: set, delete, rename, activate`},body:{en:`
<p>Editing a Junos configuration is like editing a folder of files. Each statement is a small file in a folder tree. <code>set</code> creates or changes one, <code>delete</code> removes one, and <code>show</code> lists what is there. In this chapter you build the first lab step: naming R1 and addressing its uplink.</p>

<h3>The core editing commands</h3>
<table class="cmp"><tr><th>Command</th><th>What it does</th></tr>
<tr><td><code>set &lt;path&gt; &lt;value&gt;</code></td><td>create or change a statement</td></tr>
<tr><td><code>delete &lt;path&gt;</code></td><td>remove a statement and everything under it</td></tr>
<tr><td><code>rename &lt;path&gt; to &lt;new&gt;</code></td><td>rename an identifier (an address, a policy name)</td></tr>
<tr><td><code>copy &lt;path&gt; to &lt;new&gt;</code></td><td>duplicate a stanza under a new name</td></tr>
<tr><td><code>insert &lt;item&gt; before|after &lt;item&gt;</code></td><td>reorder ordered lists such as policy terms</td></tr>
<tr><td><code>deactivate &lt;path&gt;</code> / <code>activate &lt;path&gt;</code></td><td>keep a statement in the file but ignore (or restore) it</td></tr>
<tr><td><code>annotate &lt;path&gt; "text"</code></td><td>attach a comment to a statement</td></tr>
<tr><td><code>protect</code> / <code>unprotect</code></td><td>stop (or allow) changes to a statement</td></tr></table>

<h3>Worked example: the first lab step</h3>
<p>R1 and R2 are joined by <code>ge-0/0/0</code>. R2 already uses 10.20.1.2/30. You configure R1:</p>
<pre class="code">lab@R1&gt; configure
Entering configuration mode

[edit]
lab@R1# set system host-name R1-PUNE
lab@R1# set interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30
lab@R1# show
system {
    host-name R1-PUNE;
}
interfaces {
    ge-0/0/0 {
        unit 0 {
            family inet {
                address 10.20.1.1/30;
            }
        }
    }
}</pre>
<p>The <code>set</code> form is a one-line, copy-paste friendly version of the same tree. Every <code>set</code> line is a complete path from the top. That is why <code>show | display set</code> is the best way to share configuration in tickets and chats.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Configuration tree"><rect x="270" y="10" width="100" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">[edit]</text><rect x="60" y="70" width="120" height="30" rx="6" fill="#bae6fd"/><text x="120" y="90" text-anchor="middle" class="svg-ink" font-size="13">system</text><rect x="260" y="70" width="120" height="30" rx="6" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">interfaces</text><rect x="460" y="70" width="120" height="30" rx="6" fill="#bae6fd"/><text x="520" y="90" text-anchor="middle" class="svg-ink" font-size="13">protocols</text><rect x="40" y="135" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="120" y="155" text-anchor="middle" class="svg-ink" font-size="12">host-name R1-PUNE</text><rect x="240" y="135" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/0 unit 0</text><rect x="440" y="135" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="520" y="155" text-anchor="middle" class="svg-ink" font-size="12">ospf area 0</text><g stroke="#64748b" stroke-width="1.5"><line x1="320" y1="40" x2="120" y2="70"/><line x1="320" y1="40" x2="320" y2="70"/><line x1="320" y1="40" x2="520" y2="70"/><line x1="120" y1="100" x2="120" y2="135"/><line x1="320" y1="100" x2="320" y2="135"/><line x1="520" y1="100" x2="520" y2="135"/></g></svg><p class="cap">The configuration is a tree. delete on a branch removes every leaf below it.</p></div>

<h3>Deleting safely</h3>
<p><code>delete</code> removes the statement <b>and everything below it</b>. Compare:</p>
<pre class="code">[edit]
lab@R1# delete interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30   <span class="c">! removes only the address</span>
lab@R1# delete interfaces ge-0/0/0                                          <span class="c">! removes the whole interface stanza</span>
lab@R1# delete                                                              <span class="c">! at [edit]: offers to delete EVERYTHING</span>
Delete everything under this level? [yes,no] (no)</pre>
<p>The last command is dangerous. Junos asks for confirmation, and even if you say yes, nothing is lost until you commit; you can still <code>rollback 0</code>.</p>
<p>You can also use wildcards: <code>wildcard delete interfaces ge-*</code> removes every interface whose name matches.</p>

<h3>Deactivate instead of delete</h3>
<p>Suppose you want OSPF off for a maintenance window but you will need it back. <code>deactivate protocols ospf</code> keeps the text in the file and marks it with <code>inactive:</code>. Junos ignores it at commit. <code>activate protocols ospf</code> brings it back with every setting intact, which is safer than retyping.</p>
<pre class="code">lab@R1# deactivate protocols ospf
lab@R1# show protocols
inactive: ospf {
    area 0.0.0.0 {
        interface ge-0/0/0.0;
    }
}</pre>

<h3>Annotate and rename</h3>
<pre class="code">lab@R1# annotate interfaces ge-0/0/0 "Uplink to R2-CORE, ticket NK-1042"
lab@R1# rename interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30 to address 10.20.1.5/30</pre>
<p>Annotations appear as <code>/* ... */</code> comments in the configuration. Because the candidate is only a draft, rename is a quick way to fix a typo in an address or policy name, with every reference left unchanged until you review it.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>set</code> to change an address on an interface that already has one: Junos <i>adds</i> a second address instead of replacing it, because an interface can hold several addresses. Delete the old one first or use <code>rename</code>. (2) Typing <code>delete interfaces</code> when you meant one unit.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>deactivate</code> is not <code>delete</code>: the statement stays in the configuration marked <code>inactive:</code>. <code>activate</code> reverses it. Also, the set syntax is always the full path, whatever level you are standing at, unless you are inside <code>edit</code>, in which case set is relative.</p></div>

<div class="scn"><h4>The address that doubled</h4><p>A technician "changed" R1's uplink from 10.20.1.1/30 to 10.20.9.1/30 by typing <code>set interfaces ge-0/0/0 unit 0 family inet address 10.20.9.1/30</code>. After commit the interface carried two addresses and the OSPF router-id and the monitoring system were confused by the extra route. A <code>show | compare</code> before commit would have shown a lone <code>+</code> line with no matching <code>-</code> line. The fix was <code>delete</code> of the old address.</p><p><b>Lesson:</b> to replace a value that can have several instances, delete the old one explicitly and check with <code>show | compare</code>.</p></div>

<div class="iv"><p class="q">"How do you temporarily turn off a protocol without losing its configuration?"</p><p>Use <code>deactivate protocols ospf</code> and commit. The statements remain in the configuration marked <code>inactive</code> and are ignored. Later <code>activate protocols ospf</code> restores them exactly. Say that this is better than deleting and retyping, because it avoids typing mistakes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>set</code> creates or changes; <code>delete</code> removes a statement and everything under it.</li>
<li>Addresses are added, not replaced, by a second <code>set</code>.</li>
<li><code>deactivate</code> and <code>activate</code> keep configuration but switch it off and on.</li>
<li><code>rename</code>, <code>copy</code>, <code>insert</code> and <code>annotate</code> help you organise and document.</li>
<li><code>show | display set</code> prints the configuration as copy-paste set commands.</li>
</ul></div>
`,hi:`
<p>Junos configuration edit karna ek folder ki files edit karne jaisa hai. Har statement folder tree ki ek chhoti file hai. <code>set</code> ek banata ya badalta hai, <code>delete</code> hata deta hai, aur <code>show</code> dikhata hai kya maujood hai. Is chapter mein aap lab ka pehla step banaoge: R1 ko naam dena aur uske uplink ko address karna.</p>

<h3>Core editing commands</h3>
<table class="cmp"><tr><th>Command</th><th>Kya karta hai</th></tr>
<tr><td><code>set &lt;path&gt; &lt;value&gt;</code></td><td>statement banata ya badalta hai</td></tr>
<tr><td><code>delete &lt;path&gt;</code></td><td>statement aur uske neeche sab kuch hata deta hai</td></tr>
<tr><td><code>rename &lt;path&gt; to &lt;new&gt;</code></td><td>identifier ka naam badalta hai (address, policy name)</td></tr>
<tr><td><code>copy &lt;path&gt; to &lt;new&gt;</code></td><td>stanza ko naye naam se duplicate karta hai</td></tr>
<tr><td><code>insert &lt;item&gt; before|after &lt;item&gt;</code></td><td>policy terms jaisi ordered lists reorder karta hai</td></tr>
<tr><td><code>deactivate &lt;path&gt;</code> / <code>activate &lt;path&gt;</code></td><td>statement file mein rakhta hai lekin ignore karta hai (ya wapas lata hai)</td></tr>
<tr><td><code>annotate &lt;path&gt; "text"</code></td><td>statement par comment lagata hai</td></tr>
<tr><td><code>protect</code> / <code>unprotect</code></td><td>statement mein changes roka (ya allow) karta hai</td></tr></table>

<h3>Worked example: lab ka pehla step</h3>
<p>R1 aur R2 <code>ge-0/0/0</code> se jude hain. R2 pehle se 10.20.1.2/30 use karta hai. Aap R1 configure karte ho:</p>
<pre class="code">lab@R1&gt; configure
Entering configuration mode

[edit]
lab@R1# set system host-name R1-PUNE
lab@R1# set interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30
lab@R1# show
system {
    host-name R1-PUNE;
}
interfaces {
    ge-0/0/0 {
        unit 0 {
            family inet {
                address 10.20.1.1/30;
            }
        }
    }
}</pre>
<p><code>set</code> form usi tree ka ek-line, copy-paste ke liye aasaan version hai. Har <code>set</code> line top se poora path hoti hai. Isiliye tickets aur chats mein configuration share karne ke liye <code>show | display set</code> sabse achha tarika hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Configuration tree"><rect x="270" y="10" width="100" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">[edit]</text><rect x="60" y="70" width="120" height="30" rx="6" fill="#bae6fd"/><text x="120" y="90" text-anchor="middle" class="svg-ink" font-size="13">system</text><rect x="260" y="70" width="120" height="30" rx="6" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">interfaces</text><rect x="460" y="70" width="120" height="30" rx="6" fill="#bae6fd"/><text x="520" y="90" text-anchor="middle" class="svg-ink" font-size="13">protocols</text><rect x="40" y="135" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="120" y="155" text-anchor="middle" class="svg-ink" font-size="12">host-name R1-PUNE</text><rect x="240" y="135" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/0 unit 0</text><rect x="440" y="135" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="520" y="155" text-anchor="middle" class="svg-ink" font-size="12">ospf area 0</text><g stroke="#64748b" stroke-width="1.5"><line x1="320" y1="40" x2="120" y2="70"/><line x1="320" y1="40" x2="320" y2="70"/><line x1="320" y1="40" x2="520" y2="70"/><line x1="120" y1="100" x2="120" y2="135"/><line x1="320" y1="100" x2="320" y2="135"/><line x1="520" y1="100" x2="520" y2="135"/></g></svg><p class="cap">Configuration ek tree hai. Kisi branch par delete uske neeche ke har leaf ko hata deta hai.</p></div>

<h3>Safely delete karna</h3>
<p><code>delete</code> statement <b>aur uske neeche ka sab kuch</b> hata deta hai. Compare karo:</p>
<pre class="code">[edit]
lab@R1# delete interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30   <span class="c">! sirf address hatata hai</span>
lab@R1# delete interfaces ge-0/0/0                                          <span class="c">! poora interface stanza hatata hai</span>
lab@R1# delete                                                              <span class="c">! [edit] par: SAB KUCH delete karne ko poochta hai</span>
Delete everything under this level? [yes,no] (no)</pre>
<p>Aakhri command khatarnak hai. Junos confirmation maangta hai, aur yes bol bhi do to commit tak kuch nahi jaata; <code>rollback 0</code> abhi bhi chalega.</p>
<p>Wildcards bhi chalte hain: <code>wildcard delete interfaces ge-*</code> naam match karne wale har interface ko hata deta hai.</p>

<h3>Delete ki jagah deactivate</h3>
<p>Maan lo maintenance window ke liye OSPF band karna hai lekin baad mein wapas chahiye. <code>deactivate protocols ospf</code> text ko file mein rakhta hai aur <code>inactive:</code> se mark karta hai. Commit par Junos use ignore karta hai. <code>activate protocols ospf</code> use saare settings ke saath wapas laata hai, jo dobara type karne se zyada safe hai.</p>
<pre class="code">lab@R1# deactivate protocols ospf
lab@R1# show protocols
inactive: ospf {
    area 0.0.0.0 {
        interface ge-0/0/0.0;
    }
}</pre>

<h3>Annotate aur rename</h3>
<pre class="code">lab@R1# annotate interfaces ge-0/0/0 "Uplink to R2-CORE, ticket NK-1042"
lab@R1# rename interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30 to address 10.20.1.5/30</pre>
<p>Annotations configuration mein <code>/* ... */</code> comments ki tarah dikhte hain. Candidate sirf draft hai, isliye address ya policy name ka typo theek karne ka rename tez tarika hai; review hone tak koi reference nahi badalta.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Jis interface par address pehle se hai uspar <code>set</code> se address badalna: Junos purane ko replace nahi karta, <i>dusra add</i> kar deta hai, kyunki ek interface par kai addresses ho sakte hain. Pehle purana delete karo ya <code>rename</code> use karo. (2) Ek unit ki jagah <code>delete interfaces</code> type kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>deactivate</code> aur <code>delete</code> alag hain: statement configuration mein <code>inactive:</code> mark ke saath rehta hai. <code>activate</code> use ulta karta hai. Saath hi, set syntax hamesha poora path hota hai chahe aap kisi bhi level par ho, jab tak aap <code>edit</code> ke andar na ho — tab set relative hota hai.</p></div>

<div class="scn"><h4>Address jo double ho gaya</h4><p>Ek technician ne R1 ka uplink 10.20.1.1/30 se 10.20.9.1/30 "badalne" ke liye <code>set interfaces ge-0/0/0 unit 0 family inet address 10.20.9.1/30</code> type kiya. Commit ke baad interface par do addresses the aur extra route se OSPF router-id aur monitoring system confuse ho gaye. Commit se pehle <code>show | compare</code> sirf ek akeli <code>+</code> line dikhata bina kisi <code>-</code> line ke. Fix tha purane address ka <code>delete</code>.</p><p><b>Lesson:</b> jis value ke kai instances ho sakte hain use badalne ke liye purani ko explicitly delete karo aur <code>show | compare</code> se check karo.</p></div>

<div class="iv"><p class="q">"Kisi protocol ko configuration khoye bina temporarily kaise band karte ho?"</p><p><code>deactivate protocols ospf</code> karo aur commit. Statements configuration mein <code>inactive</code> mark ke saath rehte hain aur ignore hote hain. Baad mein <code>activate protocols ospf</code> unhe bilkul waise hi wapas laata hai. Batao ki yeh delete karke dobara type karne se behtar hai kyunki typing mistakes bachte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>set</code> banata ya badalta hai; <code>delete</code> statement aur uske neeche ka sab hata deta hai.</li>
<li>Dusra <code>set</code> address replace nahi karta, add karta hai.</li>
<li><code>deactivate</code> aur <code>activate</code> configuration rakhkar use off aur on karte hain.</li>
<li><code>rename</code>, <code>copy</code>, <code>insert</code> aur <code>annotate</code> organise aur document karne mein madad karte hain.</li>
<li><code>show | display set</code> configuration ko copy-paste set commands mein print karta hai.</li>
</ul></div>
`}};export{e as default};