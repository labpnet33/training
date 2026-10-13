var e={id:`candidate-running`,h:{en:`Candidate and running configuration: the draft and the live copy`,hi:`Candidate aur running configuration: draft aur live copy`},body:{en:`
<p><b>What you will learn:</b> why every PAN-OS device keeps two copies of its configuration, what <code>commit</code> really does on Panorama, and why this is the root of the most common Panorama complaint: "I changed it, but nothing happened". <b>Prerequisites:</b> you know what Panorama, a device group and a template are (modules 1 to 3).</p>

<h3>Analogy: the document and the printed copy</h3>
<p>Think of a Word document on your laptop and the copy pinned on the office notice board. You can edit the document for an hour; the notice board does not change. Only when you print and pin the new page does the board change. In PAN-OS the document is the <b>candidate configuration</b> and the notice board is the <b>running configuration</b>. Every set, delete and rename command edits only the candidate.</p>

<h3>The two copies</h3>
<table class="tbl">
<tr><th>Copy</th><th>What it is</th><th>Who uses it</th></tr>
<tr><td>Candidate</td><td>Your draft, edited by <code>set</code>, <code>delete</code>, <code>rename</code></td><td>Nobody enforces it; it is only a draft</td></tr>
<tr><td>Running</td><td>The last configuration that was validated and committed</td><td>The device itself, and (on Panorama) the source of every push</td></tr>
</table>
<p><code>commit</code> validates the candidate. If validation passes, the candidate is copied over the running configuration. If validation fails, the running copy stays exactly as it was and you get an error to read.</p>

<h3>On Panorama and on a firewall</h3>
<p>Both Panorama and each firewall have their own candidate and running copies. On a firewall, <code>commit</code> makes the firewall enforce the change. On Panorama, <code>commit</code> is a <b>commit to Panorama</b>: it makes the change part of Panorama's own running configuration, and that is all. No firewall is touched. The firewalls learn about it only after a push, which is the next chapter.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Candidate to running">
<rect x="20" y="40" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="66" text-anchor="middle" class="svg-ink" font-size="13">Candidate</text><text x="105" y="84" text-anchor="middle" class="svg-muted" font-size="11">your draft</text>
<rect x="250" y="40" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="335" y="66" text-anchor="middle" class="svg-ink" font-size="13">Running</text><text x="335" y="84" text-anchor="middle" class="svg-muted" font-size="11">validated copy</text>
<line x1="190" y1="70" x2="250" y2="70" stroke="#64748b" stroke-width="2"/><text x="220" y="60" text-anchor="middle" class="svg-accent" font-size="12">commit</text>
<rect x="480" y="40" width="140" height="60" rx="8" fill="#fde68a"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="13">Firewalls</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="11">untouched</text>
<line x1="420" y1="70" x2="480" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="450" y="60" text-anchor="middle" class="svg-muted" font-size="12">not yet</text>
</svg><p class="cap">Commit moves the draft into Panorama's running copy. The dashed arrow (push) is a separate action.</p></div>

<h3>What it looks like in the lab</h3>
<pre class="code"><span class="c">! on PANO: this edits only the candidate</span>
PANO&gt; configure
PANO# set device-group NK-BRANCHES pre-rulebase security rules Block-SSH-Out from any to any source any destination any application ssh service application-default action deny
<span class="c">! this validates and makes it Panorama's running configuration</span>
PANO# commit
PANO# exit
PANO&gt; show devices all</pre>
<pre class="out">Serial            Hostname          Connected  Device group      Shared policy
0079185321121     NK-PUNE-PA        yes        NK-BRANCHES       <span class="hl">Out of Sync</span></pre>
<p>Out of Sync means: Panorama's running configuration is ahead of what the firewall holds. Nothing is wrong; the push simply has not happened.</p>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>set</code> commands and walking away without <code>commit</code>; believing that a commit on Panorama changes firewall behaviour; reading "Out of Sync" as an error instead of "a push is pending".</p></div>
<div class="exam"><p><b>Exam trap.</b> A committed change and an enforced change are different things on Panorama. Enforced means the firewall received it in a push and committed it.</p></div>

<div class="scn"><h4>"I committed the SSH block, why can Pune still SSH out?"</h4><p>An engineer added a deny rule, committed, and saw no effect. The inventory showed Shared policy Out of Sync for Pune and Delhi. The commit had succeeded, but only on Panorama. A push of the device group delivered the rule and the traffic stopped.</p><p><b>Lesson:</b> check Out of Sync before you debug the rule itself.</p></div>

<div class="iv"><p class="q">"What is the difference between candidate and running configuration?"</p><p>Candidate is the editable draft; running is the last validated, committed configuration. Commit copies candidate to running only if validation passes. On Panorama that commit does not reach the firewalls; a push does.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>set, delete and rename edit the candidate only.</li>
<li>Commit validates, then copies candidate to running.</li>
<li>On Panorama, commit is a commit to Panorama and changes no firewall.</li>
<li>Out of Sync means a push is pending, not that something broke.</li>
</ul></div>
`,hi:`
<p><b>Is chapter mein aap seekhoge:</b> har PAN-OS device apni configuration ki do copies kyun rakhta hai, Panorama par <code>commit</code> asal mein kya karta hai, aur yahi sabse common Panorama complaint ki jad kyun hai: "maine change kiya, par kuch hua nahi". <b>Prerequisites:</b> aapko pata ho Panorama, device group aur template kya hain (modules 1 se 3).</p>

<h3>Analogy: document aur printed copy</h3>
<p>Laptop par ek Word document socho aur office ke notice board par lagi copy. Aap ek ghante tak document edit kar sakte ho; notice board nahi badalta. Jab aap naya page print karke lagate ho tabhi board badalta hai. PAN-OS mein document hai <b>candidate configuration</b> aur notice board hai <b>running configuration</b>. Har set, delete aur rename command sirf candidate ko edit karta hai.</p>

<h3>Do copies</h3>
<table class="tbl">
<tr><th>Copy</th><th>Kya hai</th><th>Kaun use karta hai</th></tr>
<tr><td>Candidate</td><td>Aapka draft, <code>set</code>, <code>delete</code>, <code>rename</code> se edit hota hai</td><td>Koi enforce nahi karta; sirf draft hai</td></tr>
<tr><td>Running</td><td>Aakhri configuration jo validate aur commit hui</td><td>Device khud, aur (Panorama par) har push ka source</td></tr>
</table>
<p><code>commit</code> candidate ko validate karta hai. Validation pass ho to candidate running configuration par copy ho jaata hai. Fail ho to running copy bilkul waisi hi rehti hai aur aapko padhne ke liye error milta hai.</p>

<h3>Panorama par aur firewall par</h3>
<p>Panorama aur har firewall ki apni candidate aur running copies hoti hain. Firewall par <code>commit</code> firewall ko change enforce karwata hai. Panorama par <code>commit</code> ek <b>commit to Panorama</b> hai: change Panorama ki apni running configuration ka hissa ban jaata hai, bas. Koi firewall touch nahi hota. Firewalls ko push ke baad hi pata chalta hai, jo agla chapter hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Candidate to running">
<rect x="20" y="40" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="66" text-anchor="middle" class="svg-ink" font-size="13">Candidate</text><text x="105" y="84" text-anchor="middle" class="svg-muted" font-size="11">aapka draft</text>
<rect x="250" y="40" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="335" y="66" text-anchor="middle" class="svg-ink" font-size="13">Running</text><text x="335" y="84" text-anchor="middle" class="svg-muted" font-size="11">validated copy</text>
<line x1="190" y1="70" x2="250" y2="70" stroke="#64748b" stroke-width="2"/><text x="220" y="60" text-anchor="middle" class="svg-accent" font-size="12">commit</text>
<rect x="480" y="40" width="140" height="60" rx="8" fill="#fde68a"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="13">Firewalls</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="11">untouched</text>
<line x1="420" y1="70" x2="480" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="450" y="60" text-anchor="middle" class="svg-muted" font-size="12">abhi nahi</text>
</svg><p class="cap">Commit draft ko Panorama ki running copy mein le jaata hai. Dashed arrow (push) alag action hai.</p></div>

<h3>Lab mein kaisa dikhta hai</h3>
<pre class="code"><span class="c">! PANO par: ye sirf candidate edit karta hai</span>
PANO&gt; configure
PANO# set device-group NK-BRANCHES pre-rulebase security rules Block-SSH-Out from any to any source any destination any application ssh service application-default action deny
<span class="c">! ye validate karke Panorama ki running configuration banata hai</span>
PANO# commit
PANO# exit
PANO&gt; show devices all</pre>
<pre class="out">Serial            Hostname          Connected  Device group      Shared policy
0079185321121     NK-PUNE-PA        yes        NK-BRANCHES       <span class="hl">Out of Sync</span></pre>
<p>Out of Sync ka matlab: Panorama ki running configuration firewall ke paas jo hai usse aage hai. Kuch galat nahi; bas push abhi hua nahi.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>set</code> commands type karke bina <code>commit</code> ke chale jaana; ye maanna ki Panorama par commit se firewall ka behaviour badal jaata hai; "Out of Sync" ko error samajhna jabki matlab hai "push pending hai".</p></div>
<div class="exam"><p><b>Exam trap.</b> Panorama par committed change aur enforced change alag cheezein hain. Enforced matlab firewall ne push mein receive karke commit kiya.</p></div>

<div class="scn"><h4>"Maine SSH block commit kiya, Pune se SSH kyun nikalta hai?"</h4><p>Ek engineer ne deny rule add kiya, commit kiya, aur koi effect nahi dikha. Inventory mein Pune aur Delhi ka Shared policy Out of Sync tha. Commit succeed hua tha, par sirf Panorama par. Device group push ne rule deliver kiya aur traffic ruk gaya.</p><p><b>Lesson:</b> rule debug karne se pehle Out of Sync check karo.</p></div>

<div class="iv"><p class="q">"Candidate aur running configuration mein kya farak hai?"</p><p>Candidate editable draft hai; running aakhri validated, committed configuration hai. Commit candidate ko running mein tabhi copy karta hai jab validation pass ho. Panorama par wo commit firewalls tak nahi jaata; push jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>set, delete aur rename sirf candidate edit karte hain.</li>
<li>Commit validate karta hai, phir candidate ko running banata hai.</li>
<li>Panorama par commit, commit to Panorama hai aur koi firewall nahi badalta.</li>
<li>Out of Sync ka matlab push pending hai, kuch toota nahi.</li>
</ul></div>
`}};export{e as default};