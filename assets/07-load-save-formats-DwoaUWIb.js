var e={id:`load-save-formats`,h:{en:`Display formats, save and load: moving configuration around`,hi:`Display formats, save aur load: configuration ko idhar-udhar karna`},body:{en:`
<p>A recipe can be written as a paragraph, as a numbered list or as a spreadsheet. The dish is the same; only the format changes. Junos configuration also has several formats, and knowing them lets you copy a configuration between devices, send it to a colleague, or feed it to automation tools.</p>

<h3>Four ways to display the same configuration</h3>
<pre class="code">lab@R1&gt; show configuration interfaces ge-0/0/0
unit 0 {
    family inet {
        address 10.20.1.1/30;
    }
}

lab@R1&gt; show configuration interfaces ge-0/0/0 | display set
set interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30

lab@R1&gt; show configuration interfaces ge-0/0/0 | display json
lab@R1&gt; show configuration interfaces ge-0/0/0 | display xml</pre>
<table class="cmp"><tr><th>Format</th><th>Use it for</th></tr>
<tr><td>Hierarchical (default)</td><td>reading and understanding structure</td></tr>
<tr><td><code>display set</code></td><td>pasting into another device, tickets, scripts</td></tr>
<tr><td><code>display json</code></td><td>automation, REST and Python tools</td></tr>
<tr><td><code>display xml</code></td><td>NETCONF and the Junos XML API</td></tr>
<tr><td><code>display omit</code></td><td>shows ## comments such as <code>## SECRET-DATA</code> to be omitted</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="One configuration many formats">
<rect x="20" y="55" width="150" height="60" rx="10" fill="#fde68a"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="14">Configuration</text>
<rect x="260" y="10" width="170" height="30" rx="6" fill="#bae6fd"/><text x="345" y="30" text-anchor="middle" class="svg-ink" font-size="13">curly braces (text)</text>
<rect x="260" y="50" width="170" height="30" rx="6" fill="#bbf7d0"/><text x="345" y="70" text-anchor="middle" class="svg-ink" font-size="13">display set</text>
<rect x="260" y="90" width="170" height="30" rx="6" fill="#ddd6fe"/><text x="345" y="110" text-anchor="middle" class="svg-ink" font-size="13">display json</text>
<rect x="260" y="130" width="170" height="30" rx="6" fill="#fed7aa"/><text x="345" y="150" text-anchor="middle" class="svg-ink" font-size="13">display xml</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="170" y1="85" x2="260" y2="25"/><line x1="170" y1="85" x2="260" y2="65"/><line x1="170" y1="85" x2="260" y2="105"/><line x1="170" y1="85" x2="260" y2="145"/></g>
<text x="540" y="90" text-anchor="middle" class="svg-muted" font-size="12">same data, 4 views</text>
</svg><p class="cap">Format is a view of the same configuration, not a different configuration.</p></div>

<h3>Saving to a file and loading back</h3>
<pre class="code">lab@R1&gt; show configuration | save /var/tmp/R1-baseline.conf
Wrote 31 lines of output to '/var/tmp/R1-baseline.conf'

lab@R1&gt; file list /var/tmp
lab@R1&gt; configure
lab@R1# save /var/tmp/R1-candidate.conf</pre>
<p>In operational mode, <code>show configuration | save FILE</code> saves the <b>active</b> configuration. In configuration mode, <code>save FILE</code> saves the <b>candidate</b>. You can copy files between devices with <code>file copy</code> using SCP.</p>

<h3>The load command: merge, replace, override, set</h3>
<table class="cmp"><tr><th>Command</th><th>Behaviour</th></tr>
<tr><td><code>load merge FILE</code></td><td>add the file's statements to the candidate; existing ones stay</td></tr>
<tr><td><code>load replace FILE</code></td><td>replace only the stanzas marked <code>replace:</code> in the file</td></tr>
<tr><td><code>load override FILE</code></td><td>discard the whole candidate and use the file instead</td></tr>
<tr><td><code>load set FILE</code></td><td>read a file of <code>set</code> lines</td></tr>
<tr><td><code>load set terminal</code></td><td>paste set lines directly; end with Ctrl+D</td></tr>
<tr><td><code>load factory-default</code></td><td>load the factory configuration into the candidate</td></tr></table>
<pre class="code">lab@R1# load set terminal
[Type ^D at a new line to end input]
set system host-name R1-PUNE
set interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30
^D
load complete
lab@R1# show | compare
lab@R1# commit comment "pasted baseline"</pre>
<p>All of these load into the <b>candidate</b>. Nothing is live until commit, so you can always run <code>show | compare</code> after a load. <code>load override</code> is powerful: if a file lacks a statement that exists today, that statement disappears from the candidate. Always compare before you commit it.</p>

<h3>Comparing with older versions and files</h3>
<ul>
<li><code>show | compare rollback 3</code> compares the candidate with rollback 3.</li>
<li><code>show system rollback 2 compare 1</code> compares two saved versions.</li>
<li><code>file compare files FILE1 FILE2</code> compares two saved files on disk.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> You have configured R1 perfectly and want R2 to get the same host-style settings. On R1 run <code>show configuration system | display set | no-more</code> and copy the lines. On R2 type <code>configure</code>, <code>load set terminal</code>, paste, press Ctrl+D, review with <code>show | compare</code> and commit. A change that took five minutes by hand now takes twenty seconds.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>load override</code> when you meant <code>load merge</code> and silently deleting everything not in the file. Pasting set lines directly into the CLI prompt instead of using <code>load set terminal</code> (it works, but long pastes can run into slow terminals or wrapped lines). Saving into <code>/tmp</code>, which is cleared at reboot, instead of <code>/var/tmp</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>load merge</code> adds, <code>load override</code> replaces everything, <code>load replace</code> replaces only marked stanzas. All three change only the candidate. Know that <code>display set</code> output is made of full-path set lines.</p></div>

<div class="scn"><h4>The override that erased a branch</h4><p>An engineer saved the corporate template as a file and used <code>load override</code> on Pune's R1 to "apply the standard". The template had no OSPF block because Pune ran static routes. After the commit, the static routes and R1's address on <code>lo0</code> were gone and the branch lost sync. He restored with <code>rollback 1</code>. If he had read <code>show | compare</code> he would have seen dozens of <code>-</code> lines.</p><p><b>Lesson:</b> load override means "make the candidate exactly this file". Compare first, every time.</p></div>

<div class="iv"><p class="q">"How would you copy part of one router's configuration to another?"</p><p>On the source I run <code>show configuration section | display set</code> and copy the lines (or save it with <code>| save</code> and <code>file copy</code> it). On the destination I use <code>load set terminal</code> or <code>load merge</code>, review with <code>show | compare</code>, and commit with <code>commit confirmed</code> if the change is risky.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>display set</code>, <code>json</code> and <code>xml</code> are different views of one configuration.</li>
<li><code>show configuration | save FILE</code> saves active; <code>save FILE</code> in configuration mode saves candidate.</li>
<li><code>load merge</code> adds, <code>load override</code> replaces everything, <code>load replace</code> replaces marked stanzas, <code>load set</code> reads set lines.</li>
<li>All loads change only the candidate; compare before commit.</li>
<li>Use <code>/var/tmp</code> for files you want to keep across a reboot.</li>
</ul></div>
`,hi:`
<p>Ek recipe ko paragraph, numbered list ya spreadsheet mein likha ja sakta hai. Dish wahi rehti hai; sirf format badalta hai. Junos configuration ke bhi kai formats hain, aur unhe jaanne se aap configuration ek device se doosre par copy kar sakte ho, colleague ko bhej sakte ho, ya automation tools ko de sakte ho.</p>

<h3>Ek hi configuration dikhane ke chaar tareeke</h3>
<pre class="code">lab@R1&gt; show configuration interfaces ge-0/0/0
unit 0 {
    family inet {
        address 10.20.1.1/30;
    }
}

lab@R1&gt; show configuration interfaces ge-0/0/0 | display set
set interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30

lab@R1&gt; show configuration interfaces ge-0/0/0 | display json
lab@R1&gt; show configuration interfaces ge-0/0/0 | display xml</pre>
<table class="cmp"><tr><th>Format</th><th>Kis liye use karein</th></tr>
<tr><td>Hierarchical (default)</td><td>structure padhne aur samajhne ke liye</td></tr>
<tr><td><code>display set</code></td><td>doosre device mein paste, tickets, scripts</td></tr>
<tr><td><code>display json</code></td><td>automation, REST aur Python tools</td></tr>
<tr><td><code>display xml</code></td><td>NETCONF aur Junos XML API</td></tr>
<tr><td><code>display omit</code></td><td>## comments dikhata hai jaise <code>## SECRET-DATA</code> jinhe omit karna hai</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Ek configuration kai formats">
<rect x="20" y="55" width="150" height="60" rx="10" fill="#fde68a"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="14">Configuration</text>
<rect x="260" y="10" width="170" height="30" rx="6" fill="#bae6fd"/><text x="345" y="30" text-anchor="middle" class="svg-ink" font-size="13">curly braces (text)</text>
<rect x="260" y="50" width="170" height="30" rx="6" fill="#bbf7d0"/><text x="345" y="70" text-anchor="middle" class="svg-ink" font-size="13">display set</text>
<rect x="260" y="90" width="170" height="30" rx="6" fill="#ddd6fe"/><text x="345" y="110" text-anchor="middle" class="svg-ink" font-size="13">display json</text>
<rect x="260" y="130" width="170" height="30" rx="6" fill="#fed7aa"/><text x="345" y="150" text-anchor="middle" class="svg-ink" font-size="13">display xml</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="170" y1="85" x2="260" y2="25"/><line x1="170" y1="85" x2="260" y2="65"/><line x1="170" y1="85" x2="260" y2="105"/><line x1="170" y1="85" x2="260" y2="145"/></g>
<text x="540" y="90" text-anchor="middle" class="svg-muted" font-size="12">wahi data, 4 views</text>
</svg><p class="cap">Format ek hi configuration ka view hai, alag configuration nahi.</p></div>

<h3>File mein save karna aur wapas load karna</h3>
<pre class="code">lab@R1&gt; show configuration | save /var/tmp/R1-baseline.conf
Wrote 31 lines of output to '/var/tmp/R1-baseline.conf'

lab@R1&gt; file list /var/tmp
lab@R1&gt; configure
lab@R1# save /var/tmp/R1-candidate.conf</pre>
<p>Operational mode mein <code>show configuration | save FILE</code> <b>active</b> configuration save karta hai. Configuration mode mein <code>save FILE</code> <b>candidate</b> save karta hai. SCP se <code>file copy</code> ke zariye files devices ke beech copy kar sakte ho.</p>

<h3>load command: merge, replace, override, set</h3>
<table class="cmp"><tr><th>Command</th><th>Behaviour</th></tr>
<tr><td><code>load merge FILE</code></td><td>file ke statements candidate mein jodta hai; maujooda rehte hain</td></tr>
<tr><td><code>load replace FILE</code></td><td>sirf file mein <code>replace:</code> mark kiye stanzas ko replace karta hai</td></tr>
<tr><td><code>load override FILE</code></td><td>poora candidate phenkkar file use karta hai</td></tr>
<tr><td><code>load set FILE</code></td><td><code>set</code> lines ki file padhta hai</td></tr>
<tr><td><code>load set terminal</code></td><td>set lines seedha paste karo; Ctrl+D se khatam</td></tr>
<tr><td><code>load factory-default</code></td><td>factory configuration candidate mein load karta hai</td></tr></table>
<pre class="code">lab@R1# load set terminal
[Type ^D at a new line to end input]
set system host-name R1-PUNE
set interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30
^D
load complete
lab@R1# show | compare
lab@R1# commit comment "pasted baseline"</pre>
<p>Yeh sab <b>candidate</b> mein load karte hain. Commit tak kuch live nahi hota, isliye load ke baad hamesha <code>show | compare</code> chala sakte ho. <code>load override</code> powerful hai: aaj ke kisi statement ki file mein kami ho to woh candidate se gayab ho jaata hai. Commit se pehle hamesha compare karo.</p>

<h3>Purane versions aur files se compare</h3>
<ul>
<li><code>show | compare rollback 3</code> candidate ko rollback 3 se compare karta hai.</li>
<li><code>show system rollback 2 compare 1</code> do saved versions compare karta hai.</li>
<li><code>file compare files FILE1 FILE2</code> disk par do saved files compare karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Aapne R1 perfectly configure kar liya hai aur R2 ko wahi host-style settings chahiye. R1 par <code>show configuration system | display set | no-more</code> chalao aur lines copy karo. R2 par <code>configure</code>, <code>load set terminal</code>, paste, Ctrl+D, <code>show | compare</code> se review aur commit. Jo kaam haath se paanch minute leta tha ab bees second mein ho gaya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>load merge</code> ki jagah <code>load override</code> use karna aur file mein na hone wali har cheez chupchaap delete kar dena. Set lines ko <code>load set terminal</code> ki jagah seedha CLI prompt mein paste karna (chalta hai, lekin lambe paste slow terminals ya wrapped lines mein dikkat de sakte hain). Reboot par saaf hone wale <code>/tmp</code> mein save karna, <code>/var/tmp</code> ki jagah.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>load merge</code> jodta hai, <code>load override</code> sab replace karta hai, <code>load replace</code> sirf marked stanzas replace karta hai. Teeno sirf candidate badalte hain. Yaad rakho <code>display set</code> output full-path set lines se bana hota hai.</p></div>

<div class="scn"><h4>Override jisne branch mita diya</h4><p>Ek engineer ne corporate template file mein save kiya aur Pune ke R1 par "standard apply karne" ke liye <code>load override</code> chalaya. Template mein OSPF block nahi tha kyunki Pune static routes chalata tha. Commit ke baad static routes aur <code>lo0</code> par R1 ka address gayab ho gaye aur branch sync kho baitha. Usne <code>rollback 1</code> se restore kiya. <code>show | compare</code> padhta to use darjano <code>-</code> lines dikh jaatin.</p><p><b>Lesson:</b> load override ka matlab "candidate ko bilkul is file jaisa banao". Har baar pehle compare karo.</p></div>

<div class="iv"><p class="q">"Ek router ki configuration ka hissa doosre router par kaise copy karoge?"</p><p>Source par <code>show configuration section | display set</code> chalakar lines copy karta hoon (ya <code>| save</code> se save karke <code>file copy</code> karta hoon). Destination par <code>load set terminal</code> ya <code>load merge</code> use karta hoon, <code>show | compare</code> se review karta hoon, aur change risky ho to <code>commit confirmed</code> se commit karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>display set</code>, <code>json</code> aur <code>xml</code> ek hi configuration ke alag views hain.</li>
<li><code>show configuration | save FILE</code> active save karta hai; configuration mode mein <code>save FILE</code> candidate save karta hai.</li>
<li><code>load merge</code> jodta hai, <code>load override</code> sab replace karta hai, <code>load replace</code> marked stanzas replace karta hai, <code>load set</code> set lines padhta hai.</li>
<li>Saare loads sirf candidate badalte hain; commit se pehle compare karo.</li>
<li>Reboot ke baad bhi chahiye wali files ke liye <code>/var/tmp</code> use karo.</li>
</ul></div>
`}};export{e as default};