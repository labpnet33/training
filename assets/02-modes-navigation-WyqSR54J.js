var e={id:`modes-navigation`,h:{en:`Operational and configuration mode, and moving around`,hi:`Operational aur configuration mode, aur navigation`},body:{en:`
<p>Think of a bank. The <b>customer area</b> lets you look at things and ask questions. The <b>back office</b> is where changes are made. The Junos CLI has the same split: <b>operational mode</b> is the customer area and <b>configuration mode</b> is the back office.</p>

<h3>The two prompts</h3>
<pre class="code">lab@R1&gt; show interfaces terse        <span class="c">! operational mode: prompt ends with &gt;</span>
lab@R1&gt; configure
Entering configuration mode

[edit]
lab@R1#                               <span class="c">! configuration mode: prompt ends with #</span></pre>
<ul>
<li><b>Operational mode</b>: show commands, <code>ping</code>, <code>traceroute</code>, <code>monitor</code>, <code>request</code>, <code>clear</code>, <code>restart</code>. It never changes configuration.</li>
<li><b>Configuration mode</b>: <code>set</code>, <code>delete</code>, <code>edit</code>, <code>show</code>, <code>commit</code>, <code>rollback</code>. It changes the candidate.</li>
<li>Leave configuration mode with <code>exit</code> (or <code>quit</code>). If you have uncommitted changes, Junos asks <code>Exit with uncommitted changes? [yes,no]</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Operational and configuration mode">
<rect x="30" y="40" width="230" height="90" rx="10" fill="#bae6fd"/><text x="145" y="70" text-anchor="middle" class="svg-ink" font-size="14">Operational mode</text><text x="145" y="92" text-anchor="middle" class="svg-muted" font-size="12">lab@R1&gt;</text><text x="145" y="112" text-anchor="middle" class="svg-muted" font-size="12">show, ping, request</text>
<rect x="380" y="40" width="230" height="90" rx="10" fill="#fde68a"/><text x="495" y="70" text-anchor="middle" class="svg-ink" font-size="14">Configuration mode</text><text x="495" y="92" text-anchor="middle" class="svg-muted" font-size="12">lab@R1#</text><text x="495" y="112" text-anchor="middle" class="svg-muted" font-size="12">set, delete, commit</text>
<line x1="260" y1="70" x2="380" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">configure</text>
<line x1="380" y1="105" x2="260" y2="105" stroke="#64748b" stroke-width="2"/><text x="320" y="124" text-anchor="middle" class="svg-accent" font-size="12">exit</text>
</svg><p class="cap">configure goes in, exit comes out. run lets you use operational commands from inside.</p></div>

<h3>The hierarchy and the [edit] line</h3>
<p>Junos configuration is a <b>tree</b>. At the top sit statements such as <code>system</code>, <code>interfaces</code>, <code>protocols</code> and <code>routing-options</code>. Each opens deeper levels. The line <code>[edit ...]</code> above the prompt shows your current position.</p>
<pre class="code">[edit]
lab@R1# edit protocols ospf area 0
[edit protocols ospf area 0.0.0.0]
lab@R1# up
[edit protocols ospf]
lab@R1# top
[edit]
lab@R1#</pre>
<table class="cmp"><tr><th>Command</th><th>Effect</th></tr>
<tr><td><code>edit &lt;level&gt;</code></td><td>move down to that level</td></tr>
<tr><td><code>up</code> / <code>up 2</code></td><td>move one (or two) levels up</td></tr>
<tr><td><code>top</code></td><td>jump back to the top [edit]</td></tr>
<tr><td><code>exit</code></td><td>go up one level; at the top, leave configuration mode</td></tr>
<tr><td><code>show</code></td><td>display the candidate <i>from the current level down</i></td></tr></table>
<p>Because <code>show</code> only prints from where you are, an empty result often just means you are standing at the wrong level. Look at the <code>[edit]</code> line first.</p>

<h3>Help, completion and running operational commands</h3>
<ul>
<li><b>?</b> lists what can come next. <code>set interfaces ?</code> lists interface names.</li>
<li><b>Space or Tab</b> completes a keyword when it is unique. Tab twice shows the possibilities.</li>
<li>You can abbreviate: <code>sh int te</code> works if it is unambiguous.</li>
<li><code>run show route</code> executes an operational command without leaving configuration mode. Older text uses <code>do</code>; Junos uses <b>run</b>.</li>
<li><code>help topic</code> and <code>help reference</code> show built-in documentation.</li>
</ul>

<h3>Pipes: filtering output</h3>
<p>The pipe (<code>|</code>) sends output through a filter. These are exam favourites:</p>
<pre class="code">lab@R1&gt; show route | match 10.20
lab@R1&gt; show interfaces terse | except down
lab@R1&gt; show route | count
lab@R1&gt; show configuration | display set
lab@R1&gt; show log messages | last 20
lab@R1&gt; show configuration | no-more</pre>
<table class="cmp"><tr><th>Pipe</th><th>Meaning</th></tr>
<tr><td><code>match</code></td><td>keep only lines that match a regular expression</td></tr>
<tr><td><code>except</code></td><td>drop lines that match</td></tr>
<tr><td><code>count</code></td><td>print the number of lines</td></tr>
<tr><td><code>find</code></td><td>start output at the first match</td></tr>
<tr><td><code>last N</code></td><td>show the final N lines</td></tr>
<tr><td><code>no-more</code></td><td>turn off paging</td></tr>
<tr><td><code>display set</code></td><td>show configuration as set commands</td></tr></table>

<div class="eg"><p><b>Worked example.</b> On R1 you want only the uplink line: <code>show interfaces terse | match ge-0/0/0</code> prints <code>ge-0/0/0 up up</code> and <code>ge-0/0/0.0 up up inet 10.20.1.1/30</code>. Adding <code>| count</code> instead returns <code>Count: 2 lines</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running <code>show interfaces</code> inside <code>edit interfaces ge-0/0/0</code> and expecting operational output. In configuration mode <code>show</code> prints configuration. Use <code>run show interfaces</code> for the live state.</p></div>
<div class="exam"><p><b>Exam trap.</b> The <code>[edit]</code> line, the <code>&gt;</code> versus <code>#</code> prompt and <code>run</code> are all tested. Remember: <code>show</code> in configuration mode is relative to your level; <code>top</code> returns to the root.</p></div>

<div class="scn"><h4>"My config is empty!"</h4><p>A junior engineer typed <code>edit interfaces ge-0/0/1</code>, then <code>show protocols</code>, and the CLI printed nothing. He thought the OSPF configuration had vanished and raised a priority ticket. The senior engineer saw <code>[edit interfaces ge-0/0/1]</code> above the prompt, typed <code>top</code>, repeated the command and the OSPF block appeared.</p><p><b>Lesson:</b> check the <code>[edit]</code> line before suspecting the configuration.</p></div>

<div class="iv"><p class="q">"How do you run a ping while you are in configuration mode?"</p><p>Use <code>run ping 10.20.1.2 count 3</code>. The <code>run</code> keyword executes any operational command from configuration mode, so you do not have to exit and lose your position in the hierarchy. Mention that pipes like <code>| match</code> work with it too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>&gt;</code> means operational mode, <code>#</code> means configuration mode.</li>
<li><code>edit</code>, <code>up</code>, <code>top</code> and <code>exit</code> move through the tree; <code>[edit ...]</code> shows where you are.</li>
<li><code>?</code> and Tab give help and completion everywhere.</li>
<li><code>run</code> executes operational commands from configuration mode.</li>
<li>Pipes such as <code>match</code>, <code>except</code>, <code>count</code>, <code>last</code>, <code>display set</code> shape the output.</li>
</ul></div>
`,hi:`
<p>Ek bank socho. <b>Customer area</b> mein aap cheezein dekh sakte ho aur sawaal pooch sakte ho. <b>Back office</b> mein changes hote hain. Junos CLI mein bhi yahi baant hai: <b>operational mode</b> customer area hai aur <b>configuration mode</b> back office.</p>

<h3>Do prompts</h3>
<pre class="code">lab@R1&gt; show interfaces terse        <span class="c">! operational mode: prompt &gt; par khatam</span>
lab@R1&gt; configure
Entering configuration mode

[edit]
lab@R1#                               <span class="c">! configuration mode: prompt # par khatam</span></pre>
<ul>
<li><b>Operational mode</b>: show commands, <code>ping</code>, <code>traceroute</code>, <code>monitor</code>, <code>request</code>, <code>clear</code>, <code>restart</code>. Yeh configuration kabhi nahi badalta.</li>
<li><b>Configuration mode</b>: <code>set</code>, <code>delete</code>, <code>edit</code>, <code>show</code>, <code>commit</code>, <code>rollback</code>. Yeh candidate badalta hai.</li>
<li>Configuration mode se <code>exit</code> (ya <code>quit</code>) se bahar aate hain. Uncommitted changes hon to Junos poochta hai <code>Exit with uncommitted changes? [yes,no]</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Operational aur configuration mode">
<rect x="30" y="40" width="230" height="90" rx="10" fill="#bae6fd"/><text x="145" y="70" text-anchor="middle" class="svg-ink" font-size="14">Operational mode</text><text x="145" y="92" text-anchor="middle" class="svg-muted" font-size="12">lab@R1&gt;</text><text x="145" y="112" text-anchor="middle" class="svg-muted" font-size="12">show, ping, request</text>
<rect x="380" y="40" width="230" height="90" rx="10" fill="#fde68a"/><text x="495" y="70" text-anchor="middle" class="svg-ink" font-size="14">Configuration mode</text><text x="495" y="92" text-anchor="middle" class="svg-muted" font-size="12">lab@R1#</text><text x="495" y="112" text-anchor="middle" class="svg-muted" font-size="12">set, delete, commit</text>
<line x1="260" y1="70" x2="380" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">configure</text>
<line x1="380" y1="105" x2="260" y2="105" stroke="#64748b" stroke-width="2"/><text x="320" y="124" text-anchor="middle" class="svg-accent" font-size="12">exit</text>
</svg><p class="cap">configure se andar, exit se bahar. run se andar rehkar operational commands chala sakte ho.</p></div>

<h3>Hierarchy aur [edit] line</h3>
<p>Junos configuration ek <b>tree</b> hai. Sabse upar <code>system</code>, <code>interfaces</code>, <code>protocols</code> aur <code>routing-options</code> jaise statements hote hain. Har ek aage ke levels kholta hai. Prompt ke upar ki <code>[edit ...]</code> line aapki current position batati hai.</p>
<pre class="code">[edit]
lab@R1# edit protocols ospf area 0
[edit protocols ospf area 0.0.0.0]
lab@R1# up
[edit protocols ospf]
lab@R1# top
[edit]
lab@R1#</pre>
<table class="cmp"><tr><th>Command</th><th>Asar</th></tr>
<tr><td><code>edit &lt;level&gt;</code></td><td>us level mein neeche jaao</td></tr>
<tr><td><code>up</code> / <code>up 2</code></td><td>ek (ya do) level upar jaao</td></tr>
<tr><td><code>top</code></td><td>seedha top [edit] par wapas</td></tr>
<tr><td><code>exit</code></td><td>ek level upar; top par ho to configuration mode se bahar</td></tr>
<tr><td><code>show</code></td><td>candidate dikhao <i>current level se neeche tak</i></td></tr></table>
<p><code>show</code> sirf wahin se print karta hai jahan aap ho, isliye khaali result ka matlab aksar yeh hota hai ki aap galat level par khade ho. Pehle <code>[edit]</code> line dekho.</p>

<h3>Help, completion aur operational commands chalana</h3>
<ul>
<li><b>?</b> batata hai aage kya aa sakta hai. <code>set interfaces ?</code> interface names dikhata hai.</li>
<li><b>Space ya Tab</b> unique keyword complete karta hai. Do baar Tab possibilities dikhata hai.</li>
<li>Abbreviate kar sakte ho: <code>sh int te</code> chalta hai agar ambiguous na ho.</li>
<li><code>run show route</code> configuration mode chhode bina operational command chalata hai. Purani cheezein <code>do</code> use karti hain; Junos mein <b>run</b> hai.</li>
<li><code>help topic</code> aur <code>help reference</code> built-in documentation dikhate hain.</li>
</ul>

<h3>Pipes: output filter karna</h3>
<p>Pipe (<code>|</code>) output ko filter se guzaarta hai. Yeh exam ke favourite hain:</p>
<pre class="code">lab@R1&gt; show route | match 10.20
lab@R1&gt; show interfaces terse | except down
lab@R1&gt; show route | count
lab@R1&gt; show configuration | display set
lab@R1&gt; show log messages | last 20
lab@R1&gt; show configuration | no-more</pre>
<table class="cmp"><tr><th>Pipe</th><th>Matlab</th></tr>
<tr><td><code>match</code></td><td>sirf regular expression se match karti lines rakho</td></tr>
<tr><td><code>except</code></td><td>match karti lines hata do</td></tr>
<tr><td><code>count</code></td><td>lines ki sankhya print karo</td></tr>
<tr><td><code>find</code></td><td>pehle match se output shuru karo</td></tr>
<tr><td><code>last N</code></td><td>aakhri N lines dikhao</td></tr>
<tr><td><code>no-more</code></td><td>paging band karo</td></tr>
<tr><td><code>display set</code></td><td>configuration set commands ki tarah dikhao</td></tr></table>

<div class="eg"><p><b>Worked example.</b> R1 par aapko sirf uplink ki line chahiye: <code>show interfaces terse | match ge-0/0/0</code> print karta hai <code>ge-0/0/0 up up</code> aur <code>ge-0/0/0.0 up up inet 10.20.1.1/30</code>. Iski jagah <code>| count</code> lagao to <code>Count: 2 lines</code> milta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>edit interfaces ge-0/0/0</code> ke andar <code>show interfaces</code> chalakar operational output ki umeed karna. Configuration mode mein <code>show</code> configuration print karta hai. Live state ke liye <code>run show interfaces</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>[edit]</code> line, <code>&gt;</code> versus <code>#</code> prompt aur <code>run</code> — teeno poochhe jaate hain. Yaad rakho: configuration mode mein <code>show</code> aapke level ke relative hota hai; <code>top</code> root par le jaata hai.</p></div>

<div class="scn"><h4>"Meri config khaali ho gayi!"</h4><p>Ek junior engineer ne <code>edit interfaces ge-0/0/1</code> type kiya, phir <code>show protocols</code>, aur CLI ne kuch print nahi kiya. Usne socha OSPF configuration gayab ho gayi aur priority ticket utha diya. Senior engineer ne prompt ke upar <code>[edit interfaces ge-0/0/1]</code> dekha, <code>top</code> type kiya, wahi command dobara chalaya aur OSPF block aa gaya.</p><p><b>Lesson:</b> configuration par shak karne se pehle <code>[edit]</code> line check karo.</p></div>

<div class="iv"><p class="q">"Configuration mode mein rehte hue ping kaise chalate ho?"</p><p><code>run ping 10.20.1.2 count 3</code> use karo. <code>run</code> keyword configuration mode se koi bhi operational command chalata hai, isliye exit karke hierarchy ki position khone ki zaroorat nahi. Batao ki <code>| match</code> jaise pipes bhi iske saath chalte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>&gt;</code> matlab operational mode, <code>#</code> matlab configuration mode.</li>
<li><code>edit</code>, <code>up</code>, <code>top</code> aur <code>exit</code> tree mein ghumate hain; <code>[edit ...]</code> position batata hai.</li>
<li><code>?</code> aur Tab har jagah help aur completion dete hain.</li>
<li><code>run</code> configuration mode se operational commands chalata hai.</li>
<li><code>match</code>, <code>except</code>, <code>count</code>, <code>last</code>, <code>display set</code> jaise pipes output ko shape karte hain.</li>
</ul></div>
`}};export{e as default};