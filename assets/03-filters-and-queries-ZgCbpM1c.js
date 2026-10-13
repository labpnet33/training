var e={id:`filters-and-queries`,h:{en:`Log View filters: building a search from a ticket`,hi:`Log View filters: ticket se search banana`},body:{en:`
<p>Searching logs is like searching your email. If you type nothing you see everything, and that is useless; if you type "from Priya, subject invoice, last week" you find the one mail you need in seconds. Log View works the same way: you narrow a very large pile of logs with a few precise conditions.</p>

<h3>Step 1: the command and its parts</h3>
<p>In the real product you click the Log View page and type conditions into a filter bar. In the simulator the same search is one command (a stand-in for the GUI, not a real FortiAnalyzer command):</p>
<pre class="code">execute fazui logview &lt;adom&gt; &lt;device|-&gt; &lt;traffic|utm|event|all&gt; [filter ...] [limit N]
<span class="c">! root = the ADOM, - = all devices, then the log type, then conditions</span></pre>
<p>The first three words choose <i>where to look</i>. The conditions choose <i>what to keep</i>. Results come newest first, and the default limit is 20 logs.</p>

<h3>Step 2: the operators</h3>
<table class="cmp"><tr><th>Form</th><th>Meaning</th><th>Example</th></tr>
<tr><td>field=value</td><td>Equal (exact, not case sensitive)</td><td>action=block</td></tr>
<tr><td>field=part*</td><td>Wildcard: star matches any text</td><td>srcip=10.20.0.*</td></tr>
<tr><td>field!=value</td><td>Not equal</td><td>dstport!=80</td></tr>
<tr><td>field~text</td><td>Contains</td><td>app~Torrent</td></tr>
<tr><td>&gt;= &lt;= &gt; &lt;</td><td>Number comparison</td><td>dstport&gt;=1000</td></tr>
<tr><td>limit N</td><td>Show at most N logs</td><td>limit 5</td></tr></table>
<p>Two rules decide everything. First, <b>all conditions must match</b> (an AND); there is no OR, so you run two searches. Second, without a star the value must match completely: <code>srcip=10.20.0.1</code> does not find 10.20.0.10.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Search narrowing">
<rect x="10" y="20" width="130" height="60" rx="8" fill="#e2e8f0"/><text x="75" y="55" text-anchor="middle" class="svg-ink" font-size="13">All stored logs</text>
<rect x="165" y="20" width="130" height="60" rx="8" fill="#bae6fd"/><text x="230" y="55" text-anchor="middle" class="svg-ink" font-size="13">ADOM + device</text>
<rect x="320" y="20" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="385" y="55" text-anchor="middle" class="svg-ink" font-size="13">Log type</text>
<rect x="475" y="20" width="155" height="60" rx="8" fill="#bbf7d0"/><text x="552" y="55" text-anchor="middle" class="svg-ink" font-size="13">Field conditions</text>
<line x1="140" y1="50" x2="165" y2="50" stroke="#64748b" stroke-width="2"/><line x1="295" y1="50" x2="320" y2="50" stroke="#64748b" stroke-width="2"/><line x1="450" y1="50" x2="475" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">each step keeps fewer logs; a log must pass every step</text>
</svg><p class="cap">Every part of the command removes logs until only the answer is left.</p></div>

<h3>Step 3: build the search from the ticket</h3>
<p>Take the ticket: <i>"The user at 10.20.0.10 says the firewall stopped something this morning."</i> Turn the sentence into conditions one word at a time.</p>
<ol>
<li>"The user at 10.20.0.10" becomes <code>srcip=10.20.0.10</code>.</li>
<li>"The firewall stopped" means a verdict, so start with type <code>utm</code> and add <code>action=block</code>.</li>
<li>You do not know which FortiGate, so use <code>-</code> for all devices; the log will tell you in <code>devname</code>.</li>
<li>Take the <code>sessionid</code> from the answer and search again with type <code>all</code> to see the traffic log of the same session.</li>
</ol>
<pre class="out">FAZ-1 # execute fazui logview root - utm srcip=10.20.0.10 action=block
Log View  adom=root device=- type=utm filter: srcip=10.20.0.10 action=block
<span class="hl">1 logs match, 1 shown (newest first).</span>
1: ... devname="MDU-FGT" type="utm" subtype="app-ctrl" level="warning" ... dstport=6881
   sessionid=9081 applist="APP-BLOCK" appcat="P2P" app="BitTorrent" action="block" ...

FAZ-1 # execute fazui logview root - all sessionid=9081
<span class="hl">2 logs match, 2 shown (newest first).</span></pre>

<h3>Why it matters</h3>
<p>A good search is narrow in the right direction. Too wide and you drown; too narrow (a typo, a wrong value) and you see "0 logs match" and wrongly conclude that nothing happened. A zero is only an answer when you are sure the search itself was right.</p>

<div class="eg"><p><b>Worked example.</b> To find every session of Madurai that did not use port 80, combine a wildcard with a comparison: <code>execute fazui logview root - traffic srcip=10.20.0.* dstport!=80</code>. After the blocked file-sharing session and some web sessions, the real run keeps one log, the one to port 6881.</p></div>
<pre class="out">FAZ-1 # execute fazui logview root - traffic dstport!=80 limit 3
Log View  adom=root device=- type=traffic filter: dstport!=80
1 logs match, 1 shown (newest first).
FAZ-1 # execute fazui logview root - traffic nofield=1
<span class="hl">Unknown log field 'nofield'. Fields: srcip dstip srcport dstport action policyid policyname ...</span></pre>
<p>An unknown field is refused and the message lists the valid ones, so a typo in a field name is easy to catch. A wrong <i>value</i> is not refused; it just returns nothing.</p>

<div class="warn"><p><b>Common mistakes.</b> Using a partial IP without a star; searching type <code>traffic</code> for a field that exists only in UTM logs; mixing up <code>action</code> (accept, deny, block) with <code>utmaction</code>; expecting an OR; forgetting that the default shows only the newest 20 logs.</p></div>

<div class="exam"><p><b>Exam traps.</b> Conditions combine as AND. The wildcard is a star, and contains is the tilde. Number comparisons work on numeric fields such as ports and policy ID. In the real product the GUI also has a time range, which this simulator command does not offer.</p></div>

<div class="scn"><h4>The zero that was a typo</h4><p>An analyst searched for a Trichy user with <code>srcip=10.30.0.1</code>, got 0 logs and told the manager that Trichy had produced no traffic. The PC was 10.30.0.10. With <code>srcip=10.30.0.*</code> the sessions appeared at once.</p><p><b>Lesson:</b> before you report "no logs", widen the search once to test the search itself.</p></div>

<div class="iv"><p class="q">"How do you find the log for 'user X was blocked'?"</p><p>I take the IP of the user, search UTM logs for that source with action block, read devname and sessionid, then search type all with the sessionid to see both the traffic and the UTM log. If I get zero I widen the filter to check my own search.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The command chooses ADOM, device and type first, then the conditions.</li>
<li>Operators: equal, not equal, contains, comparisons and a star wildcard.</li>
<li>All conditions must match; there is no OR.</li>
<li>A wrong field name is refused, a wrong value silently gives zero.</li>
<li>Use the sessionid to jump from a UTM log to the traffic log of the same session.</li>
</ul></div>
`,hi:`
<p>Logs search karna email search karne jaisa hai. Kuch type nahi karoge to sab dikhega, aur wo bekaar hai; "from Priya, subject invoice, last week" type karoge to ek mail seconds mein mil jaati hai. Log View bhi aise hi kaam karta hai: logs ke bahut bade dher ko aap kuch precise conditions se chhota karte ho.</p>

<h3>Step 1: command aur uske parts</h3>
<p>Real product mein aap Log View page kholte ho aur filter bar mein conditions type karte ho. Simulator mein wahi search ek command hai (GUI ka stand-in, real FortiAnalyzer command nahi):</p>
<pre class="code">execute fazui logview &lt;adom&gt; &lt;device|-&gt; &lt;traffic|utm|event|all&gt; [filter ...] [limit N]
<span class="c">! root = ADOM, - = saare devices, phir log type, phir conditions</span></pre>
<p>Pehle teen words batate hain <i>kahan dekhna hai</i>. Conditions batati hain <i>kya rakhna hai</i>. Results newest first aate hain, aur default limit 20 logs hai.</p>

<h3>Step 2: operators</h3>
<table class="cmp"><tr><th>Form</th><th>Matlab</th><th>Example</th></tr>
<tr><td>field=value</td><td>Equal (exact, case sensitive nahi)</td><td>action=block</td></tr>
<tr><td>field=part*</td><td>Wildcard: star kuch bhi text match karta hai</td><td>srcip=10.20.0.*</td></tr>
<tr><td>field!=value</td><td>Not equal</td><td>dstport!=80</td></tr>
<tr><td>field~text</td><td>Contains</td><td>app~Torrent</td></tr>
<tr><td>&gt;= &lt;= &gt; &lt;</td><td>Number comparison</td><td>dstport&gt;=1000</td></tr>
<tr><td>limit N</td><td>Maximum N logs dikhao</td><td>limit 5</td></tr></table>
<p>Do rules sab decide karte hain. Pehla, <b>saari conditions match honi chahiye</b> (AND); OR nahi hai, isliye do searches chalao. Doosra, star ke bina value poori match honi chahiye: <code>srcip=10.20.0.1</code> se 10.20.0.10 nahi milta.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Search chhota hota hua">
<rect x="10" y="20" width="130" height="60" rx="8" fill="#e2e8f0"/><text x="75" y="55" text-anchor="middle" class="svg-ink" font-size="13">Saare stored logs</text>
<rect x="165" y="20" width="130" height="60" rx="8" fill="#bae6fd"/><text x="230" y="55" text-anchor="middle" class="svg-ink" font-size="13">ADOM + device</text>
<rect x="320" y="20" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="385" y="55" text-anchor="middle" class="svg-ink" font-size="13">Log type</text>
<rect x="475" y="20" width="155" height="60" rx="8" fill="#bbf7d0"/><text x="552" y="55" text-anchor="middle" class="svg-ink" font-size="13">Field conditions</text>
<line x1="140" y1="50" x2="165" y2="50" stroke="#64748b" stroke-width="2"/><line x1="295" y1="50" x2="320" y2="50" stroke="#64748b" stroke-width="2"/><line x1="450" y1="50" x2="475" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">har step kam logs rakhta hai; log ko har step pass karna padta hai</text>
</svg><p class="cap">Command ka har hissa logs hatata hai jab tak sirf jawab bacha rahe.</p></div>

<h3>Step 3: ticket se search banao</h3>
<p>Ticket lo: <i>"10.20.0.10 wale user ka kehna hai ki aaj subah firewall ne kuch roka."</i> Sentence ko ek-ek word karke conditions mein badlo.</p>
<ol>
<li>"10.20.0.10 wala user" bana <code>srcip=10.20.0.10</code>.</li>
<li>"Firewall ne roka" matlab verdict, to type <code>utm</code> se shuru karo aur <code>action=block</code> jodo.</li>
<li>Aapko pata nahi kaun sa FortiGate, to saare devices ke liye <code>-</code> use karo; log <code>devname</code> mein khud batayega.</li>
<li>Jawab se <code>sessionid</code> lo aur type <code>all</code> ke saath dobara search karo taaki same session ka traffic log dikhe.</li>
</ol>
<pre class="out">FAZ-1 # execute fazui logview root - utm srcip=10.20.0.10 action=block
Log View  adom=root device=- type=utm filter: srcip=10.20.0.10 action=block
<span class="hl">1 logs match, 1 shown (newest first).</span>
1: ... devname="MDU-FGT" type="utm" subtype="app-ctrl" level="warning" ... dstport=6881
   sessionid=9081 applist="APP-BLOCK" appcat="P2P" app="BitTorrent" action="block" ...

FAZ-1 # execute fazui logview root - all sessionid=9081
<span class="hl">2 logs match, 2 shown (newest first).</span></pre>

<h3>Yeh kyun zaroori hai</h3>
<p>Achha search sahi direction mein narrow hota hai. Zyada wide to aap doob jaate ho; zyada narrow (typo, galat value) to "0 logs match" dikhta hai aur aap galat nateeja nikalte ho ki kuch hua hi nahi. Zero tabhi jawab hai jab aapko yakin ho ki search khud sahi tha.</p>

<div class="eg"><p><b>Worked example.</b> Madurai ke wo saare sessions dhoondhne ke liye jo port 80 par nahi the, wildcard aur comparison milao: <code>execute fazui logview root - traffic srcip=10.20.0.* dstport!=80</code>. Blocked file-sharing session aur kuch web sessions ke baad real run ek log rakhta hai, jo port 6881 wala hai.</p></div>
<pre class="out">FAZ-1 # execute fazui logview root - traffic dstport!=80 limit 3
Log View  adom=root device=- type=traffic filter: dstport!=80
1 logs match, 1 shown (newest first).
FAZ-1 # execute fazui logview root - traffic nofield=1
<span class="hl">Unknown log field 'nofield'. Fields: srcip dstip srcport dstport action policyid policyname ...</span></pre>
<p>Unknown field refuse hota hai aur message valid fields list karta hai, isliye field name ka typo pakadna aasaan hai. Galat <i>value</i> refuse nahi hoti; bas kuch return nahi hota.</p>

<div class="warn"><p><b>Common mistakes.</b> Star ke bina adhoora IP use karna; aise field ke liye type <code>traffic</code> search karna jo sirf UTM logs mein hai; <code>action</code> (accept, deny, block) aur <code>utmaction</code> ko mix karna; OR expect karna; ye bhoolna ki default sirf newest 20 logs dikhata hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Conditions AND se combine hoti hain. Wildcard star hai, aur contains tilde hai. Number comparisons numeric fields par chalte hain jaise ports aur policy ID. Real product ke GUI mein time range bhi hota hai, jo is simulator command mein nahi hai.</p></div>

<div class="scn"><h4>Wo zero jo typo tha</h4><p>Ek analyst ne Trichy ke user ke liye <code>srcip=10.30.0.1</code> search kiya, 0 logs mile aur usne manager ko bataya ki Trichy ne koi traffic nahi banaya. PC 10.30.0.10 tha. <code>srcip=10.30.0.*</code> se sessions turant aa gaye.</p><p><b>Lesson:</b> "no logs" report karne se pehle ek baar search ko wide karke search ko hi test karo.</p></div>

<div class="iv"><p class="q">"'User X blocked hua' ka log kaise dhoondhte ho?"</p><p>Main user ka IP leta hoon, us source ke UTM logs action block ke saath search karta hoon, devname aur sessionid padhta hoon, phir type all aur sessionid se search karta hoon taaki traffic aur UTM dono log dikhein. Zero mile to filter wide karke apna search check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Command pehle ADOM, device aur type chunta hai, phir conditions.</li>
<li>Operators: equal, not equal, contains, comparisons aur star wildcard.</li>
<li>Saari conditions match honi chahiye; OR nahi hai.</li>
<li>Galat field name refuse hota hai, galat value chupchap zero deti hai.</li>
<li>UTM log se same session ke traffic log tak jaane ke liye sessionid use karo.</li>
</ul></div>
`}};export{e as default};