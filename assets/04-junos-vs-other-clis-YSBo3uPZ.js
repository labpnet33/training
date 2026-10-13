var e={id:`junos-vs-other-clis`,h:{en:`Junos compared with other command lines`,hi:`Junos ki doosre command lines se tulna`},body:{en:`
<p>If you have seen a Cisco IOS or Linux prompt, Junos will feel different at first. This chapter explains the three ideas that make Junos special so that the later modules feel natural.</p>

<h3>Idea 1: two modes, operational and configuration</h3>
<p>When you log in you land in <b>operational mode</b>, shown by the <code>&gt;</code> prompt. Here you look and test: <code>show</code>, <code>ping</code>, <code>traceroute</code>, <code>monitor</code>. You cannot change the configuration here. To change it you type <code>configure</code> and enter <b>configuration mode</b>, shown by the <code>#</code> prompt. You type <code>exit</code> to go back.</p>
<pre class="code">lab@R1&gt; <span class="c">operational mode</span>
lab@R1&gt; configure
Entering configuration mode

[edit]
lab@R1# <span class="c">configuration mode</span></pre>
<p>The <code>[edit]</code> line tells you where you are in the configuration tree.</p>

<h3>Idea 2: the candidate configuration and commit</h3>
<p>On many devices every command you type changes the running device at once. On Junos it does not. Your changes go into a <b>candidate configuration</b>, a private working copy. Nothing happens to traffic until you type <code>commit</code>. Then Junos checks the candidate for errors, and if it is valid it becomes the <b>active configuration</b>. If you make a mistake, <code>rollback</code> throws away the candidate or reloads an earlier version. Junos keeps the last 50 committed versions.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Candidate to active via commit">
<rect x="20" y="50" width="150" height="60" rx="8" fill="#fde68a"/><text x="95" y="76" text-anchor="middle" class="svg-ink" font-size="13">Your set / delete</text><text x="95" y="94" text-anchor="middle" class="svg-ink" font-size="13">commands</text>
<rect x="250" y="50" width="150" height="60" rx="8" fill="#bae6fd"/><text x="325" y="76" text-anchor="middle" class="svg-ink" font-size="13">Candidate</text><text x="325" y="94" text-anchor="middle" class="svg-ink" font-size="13">configuration</text>
<rect x="480" y="50" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="76" text-anchor="middle" class="svg-ink" font-size="13">Active</text><text x="550" y="94" text-anchor="middle" class="svg-ink" font-size="13">configuration</text>
<line x1="170" y1="80" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="80" x2="480" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="440" y="70" text-anchor="middle" class="svg-accent" font-size="13">commit</text>
<text x="325" y="140" text-anchor="middle" class="svg-muted" font-size="12">rollback 0 discards the candidate; rollback 1 loads the previous version</text>
</svg><p class="cap">Safe changes: edit freely, check, then commit. Nothing reaches the network before the commit.</p></div>

<h3>Idea 3: a hierarchy you can read</h3>
<p>The Junos configuration is a tree. Top-level branches include <code>system</code>, <code>interfaces</code>, <code>routing-options</code>, <code>protocols</code> and <code>firewall</code>. The same configuration can be shown as nested braces or as flat <code>set</code> lines:</p>
<pre class="code">lab@R1# show interfaces ge-0/0/0
unit 0 {
    family inet {
        address 192.0.2.1/24;
    }
}

lab@R1# show interfaces ge-0/0/0 | display set
set interfaces ge-0/0/0 unit 0 family inet address 192.0.2.1/24</pre>
<p>The <code>set</code> form is perfect for copy and paste and is what this course uses. You can also pipe output through filters such as <code>| match</code> and <code>| count</code> in the operational mode.</p>

<h3>How it compares</h3>
<table class="cmp"><tr><th>Topic</th><th>Typical other CLI</th><th>Junos</th></tr>
<tr><td>Applying changes</td><td>Each line is live immediately</td><td>Candidate, then <code>commit</code></td></tr>
<tr><td>Undo</td><td>Type the opposite command with "no"</td><td><code>rollback</code> or <code>delete</code></td></tr>
<tr><td>Show running config</td><td>Flat text</td><td><code>show configuration</code> in tree or <code>| display set</code></td></tr>
<tr><td>Safety net</td><td>Reload and hope</td><td><code>commit confirmed</code> auto-rolls back</td></tr>
<tr><td>Config history</td><td>Manual backups</td><td>50 rollback versions on the box</td></tr></table>

<div class="eg"><p><b>Worked example.</b> You give ge-0/0/0 the address 192.0.2.1/24. Type <code>configure</code>, then <code>set interfaces ge-0/0/0 unit 0 family inet address 192.0.2.1/24</code>. At that point <code>show</code> displays it but the interface still has no address. Type <code>commit</code> and it goes live. Typed the wrong address? Before committing, <code>rollback 0</code> wipes your change.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Typing <code>set</code> commands and forgetting <code>commit</code>, then wondering why nothing works. Another one: typing <code>show interfaces terse</code> in configuration mode. Use <code>run show interfaces terse</code> there, because <code>run</code> executes an operational command from within configuration mode.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>commit check</code> only validates; it does not apply. <code>commit confirmed 5</code> applies but reverts in five minutes unless you commit again.</p></div>

<div class="scn"><h4>The remote change that saved the day</h4><p>An engineer changed the management interface address on a router in another city. With a plain commit, a typo would have cut off his own SSH session and needed a site visit. He used <code>commit confirmed 5</code> instead. The typo locked him out, but after five minutes Junos automatically rolled back and he reconnected.</p><p><b>Lesson:</b> the candidate and commit model, plus commit confirmed, makes risky remote changes safe.</p></div>

<div class="iv"><p class="q">"What is different about the Junos configuration model?"</p><p>Changes go to a candidate configuration and take effect only on commit; commit does syntax and semantic checks; 50 previous versions are kept for rollback; commit confirmed gives an automatic safety net; and the configuration is a hierarchy that can be displayed as a tree or as set commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operational mode (&gt;) is for show and test; configuration mode (#) is for changes.</li>
<li>Changes go into a candidate configuration and become active only after commit.</li>
<li>rollback and commit confirmed provide safe undo; Junos keeps 50 versions.</li>
<li>The config is a hierarchy; <code>| display set</code> turns it into flat set commands.</li>
<li><code>run</code> lets you use operational commands inside configuration mode.</li>
</ul></div>
`,hi:`
<p>Agar aapne Cisco IOS ya Linux prompt dekha hai to Junos shuru mein alag lagega. Yeh chapter woh teen ideas samjhata hai jo Junos ko khaas banate hain, taaki aage ke modules aasaan lagein.</p>

<h3>Idea 1: do modes, operational aur configuration</h3>
<p>Login karne par aap <b>operational mode</b> mein pahunchte ho, jise <code>&gt;</code> prompt dikhata hai. Yahan aap dekhte aur test karte ho: <code>show</code>, <code>ping</code>, <code>traceroute</code>, <code>monitor</code>. Yahan configuration badal nahi sakte. Badalne ke liye <code>configure</code> type karke <b>configuration mode</b> mein jaate ho, jo <code>#</code> prompt se dikhta hai. Wapas jaane ke liye <code>exit</code> type karo.</p>
<pre class="code">lab@R1&gt; <span class="c">operational mode</span>
lab@R1&gt; configure
Entering configuration mode

[edit]
lab@R1# <span class="c">configuration mode</span></pre>
<p><code>[edit]</code> line batati hai ki aap configuration tree mein kahan ho.</p>

<h3>Idea 2: candidate configuration aur commit</h3>
<p>Kai devices par aap jo bhi command type karte ho woh turant running device ko badal deti hai. Junos par aisa nahi hota. Aapke changes ek <b>candidate configuration</b> mein jaate hain, jo ek private working copy hai. Jab tak aap <code>commit</code> nahi karte traffic par kuch asar nahi hota. Phir Junos candidate mein errors check karta hai, aur valid ho to woh <b>active configuration</b> ban jaata hai. Galti ho jaye to <code>rollback</code> candidate hata deta hai ya pichla version load kar deta hai. Junos aakhri 50 committed versions rakhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Commit se candidate active banta hai">
<rect x="20" y="50" width="150" height="60" rx="8" fill="#fde68a"/><text x="95" y="76" text-anchor="middle" class="svg-ink" font-size="13">Aapke set / delete</text><text x="95" y="94" text-anchor="middle" class="svg-ink" font-size="13">commands</text>
<rect x="250" y="50" width="150" height="60" rx="8" fill="#bae6fd"/><text x="325" y="76" text-anchor="middle" class="svg-ink" font-size="13">Candidate</text><text x="325" y="94" text-anchor="middle" class="svg-ink" font-size="13">configuration</text>
<rect x="480" y="50" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="76" text-anchor="middle" class="svg-ink" font-size="13">Active</text><text x="550" y="94" text-anchor="middle" class="svg-ink" font-size="13">configuration</text>
<line x1="170" y1="80" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="80" x2="480" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="440" y="70" text-anchor="middle" class="svg-accent" font-size="13">commit</text>
<text x="325" y="140" text-anchor="middle" class="svg-muted" font-size="12">rollback 0 candidate hata deta hai; rollback 1 pichla version load karta hai</text>
</svg><p class="cap">Safe changes: aaram se edit karo, check karo, phir commit. Commit se pehle network tak kuch nahi pahunchta.</p></div>

<h3>Idea 3: padhne layak hierarchy</h3>
<p>Junos configuration ek tree hai. Top-level branches mein <code>system</code>, <code>interfaces</code>, <code>routing-options</code>, <code>protocols</code> aur <code>firewall</code> aate hain. Wahi configuration nested braces mein ya flat <code>set</code> lines mein dikhai ja sakti hai:</p>
<pre class="code">lab@R1# show interfaces ge-0/0/0
unit 0 {
    family inet {
        address 192.0.2.1/24;
    }
}

lab@R1# show interfaces ge-0/0/0 | display set
set interfaces ge-0/0/0 unit 0 family inet address 192.0.2.1/24</pre>
<p><code>set</code> form copy-paste ke liye perfect hai aur is course mein wahi use hota hai. Operational mode mein output ko <code>| match</code> aur <code>| count</code> jaise filters se bhi chhaan sakte ho.</p>

<h3>Tulna</h3>
<table class="cmp"><tr><th>Topic</th><th>Aam doosri CLI</th><th>Junos</th></tr>
<tr><td>Changes apply karna</td><td>Har line turant live</td><td>Candidate, phir <code>commit</code></td></tr>
<tr><td>Undo</td><td>"no" se ulti command</td><td><code>rollback</code> ya <code>delete</code></td></tr>
<tr><td>Running config dekhna</td><td>Flat text</td><td><code>show configuration</code> tree mein ya <code>| display set</code></td></tr>
<tr><td>Safety net</td><td>Reload karke dua karo</td><td><code>commit confirmed</code> khud rollback karta hai</td></tr>
<tr><td>Config history</td><td>Manual backups</td><td>Box par 50 rollback versions</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Aap ge-0/0/0 ko 192.0.2.1/24 address dena chahte ho. <code>configure</code> type karo, phir <code>set interfaces ge-0/0/0 unit 0 family inet address 192.0.2.1/24</code>. Is point par <code>show</code> use dikhata hai lekin interface par abhi address nahi hai. <code>commit</code> karo to live ho jaata hai. Galat address type kiya? Commit se pehle <code>rollback 0</code> aapka change mita deta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> <code>set</code> commands type karke <code>commit</code> bhool jaana, phir sochna ki kuch kaam kyun nahi kar raha. Ek aur: configuration mode mein <code>show interfaces terse</code> type karna. Wahan <code>run show interfaces terse</code> use karo, kyunki <code>run</code> configuration mode ke andar se operational command chalata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>commit check</code> sirf validate karta hai; apply nahi karta. <code>commit confirmed 5</code> apply karta hai lekin paanch minute mein revert kar deta hai jab tak aap dobara commit na karo.</p></div>

<div class="scn"><h4>Door baithe change ne din bacha liya</h4><p>Ek engineer ne doosre sheher ke router ka management interface address badalna tha. Plain commit mein ek typo uska apna SSH session kaat deta aur site visit karni padti. Usne <code>commit confirmed 5</code> use kiya. Typo se woh lock out ho gaya, lekin paanch minute baad Junos ne khud rollback kar diya aur woh wapas connect ho gaya.</p><p><b>Lesson:</b> candidate aur commit model, saath mein commit confirmed, risky remote changes ko safe bana deta hai.</p></div>

<div class="iv"><p class="q">"Junos configuration model mein kya alag hai?"</p><p>Changes candidate configuration mein jaate hain aur sirf commit par effect hote hain; commit syntax aur semantic checks karta hai; rollback ke liye 50 pichle versions rakhe jaate hain; commit confirmed automatic safety net deta hai; aur configuration ek hierarchy hai jo tree ya set commands ke roop mein dikhai ja sakti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operational mode (&gt;) show aur test ke liye; configuration mode (#) changes ke liye.</li>
<li>Changes candidate configuration mein jaate hain aur commit ke baad hi active hote hain.</li>
<li>rollback aur commit confirmed safe undo dete hain; Junos 50 versions rakhta hai.</li>
<li>Config hierarchy hai; <code>| display set</code> use flat set commands bana deta hai.</li>
<li><code>run</code> configuration mode ke andar operational commands chalane deta hai.</li>
</ul></div>
`}};export{e as default};