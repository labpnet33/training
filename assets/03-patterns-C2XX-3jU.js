var e={id:`patterns`,h:{en:`Host patterns and --limit: choosing exactly which devices`,hi:`Host patterns aur --limit: exactly kaun se devices chunna`},body:{en:`
<p>Groups only help if you can aim at them. Ansible uses <b>host patterns</b> for this. A pattern is a short expression that selects hosts from the inventory, and you meet it in two places: the <code>hosts:</code> line of a play, and the <code>-l</code> (<code>--limit</code>) option on the command line. The most useful habit in network automation is this: write the play for <code>hosts: all</code> or a broad group, and narrow it at run time with <code>-l</code>. Then the same file serves a pilot of one device and the whole estate.</p>

<h3>Our test playbook</h3>
<p>The runs below use <code>snmp.yml</code>, a play named "SNMP identity" that targets <code>all</code>. We never run it for real here; we use <code>--list-hosts</code>, which prints who <i>would</i> be selected and touches no device. It is the safest command in Ansible.</p>

<h3>Pick one site or a combination</h3>
<pre class="out">AUTO01$ ansible-playbook snmp.yml --list-hosts -l pune

playbook: snmp.yml

  play #1 (all): SNMP identity	TAGS: []
    pattern: ['all']
    hosts (2):
      pun-core-r1
      pun-acc-sw1</pre>
<p>Read it: the play's own pattern is <code>all</code>, but <code>-l pune</code> narrowed it to the two Pune hosts. A group name selects every host in the group.</p>

<h3>The pattern operators</h3>
<table class="cmp"><tr><th>Pattern</th><th>Meaning</th><th>Hosts selected</th></tr>
<tr><td><code>pune:&amp;routers</code></td><td>in pune AND in routers</td><td>pun-core-r1</td></tr>
<tr><td><code>all:!switches</code></td><td>everyone except switches</td><td>pun-core-r1, blr-edge-r2</td></tr>
<tr><td><code>pune,bengaluru</code></td><td>pune OR bengaluru (a comma also works)</td><td>all 3 hosts</td></tr>
<tr><td><code>switches:routers</code></td><td>a colon also means OR</td><td>all 3 hosts</td></tr>
<tr><td><code>pun-*</code></td><td>wildcard on the host name</td><td>pun-core-r1, pun-acc-sw1</td></tr>
<tr><td><code>~^blr</code></td><td>regular expression, starts with ~</td><td>blr-edge-r2</td></tr></table>
<p>Each row above was run in the simulator with <code>--list-hosts</code> and gave the hosts shown. Two examples in full:</p>
<pre class="out">AUTO01$ ansible-playbook snmp.yml --list-hosts -l 'pune:&amp;routers'

playbook: snmp.yml

  play #1 (all): SNMP identity	TAGS: []
    pattern: ['all']
    hosts (1):
      pun-core-r1

AUTO01$ ansible-playbook snmp.yml --list-hosts -l 'all:!switches'

playbook: snmp.yml

  play #1 (all): SNMP identity	TAGS: []
    pattern: ['all']
    hosts (2):
      pun-core-r1
      blr-edge-r2</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Venn diagram of pune and routers groups">
<circle cx="250" cy="115" r="85" fill="#fde68a" fill-opacity="0.7"/><circle cx="390" cy="115" r="85" fill="#bbf7d0" fill-opacity="0.7"/>
<text x="195" y="40" text-anchor="middle" class="svg-ink" font-size="13">pune</text><text x="445" y="40" text-anchor="middle" class="svg-ink" font-size="13">routers</text>
<text x="190" y="120" text-anchor="middle" class="svg-muted" font-size="12">pun-acc-sw1</text><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">pun-core-r1</text><text x="450" y="120" text-anchor="middle" class="svg-muted" font-size="12">blr-edge-r2</text>
<text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="12">pune:&amp;routers is the overlap</text>
</svg><p class="cap">The &amp; operator keeps only the overlap of two groups.</p></div>

<h3>When the pattern matches nothing</h3>
<pre class="out">AUTO01$ ansible-playbook snmp.yml --list-hosts -l nosuchgroup
[WARNING]: Could not match supplied host pattern, ignoring: nosuchgroup
ERROR! Specified inventory, host pattern and/or --limit leaves us with no hosts to target.</pre>
<p>A typo in a limit is therefore safe: Ansible warns, then stops with an error and changes nothing. Compare this with a pattern that matches too much, such as <code>all</code>, which is silent. That is why you list hosts first.</p>

<h3>Quoting on the shell</h3>
<p>The characters <code>&amp;</code>, <code>!</code>, <code>*</code> and <code>~</code> mean something to the Linux shell. Always put a pattern with them in single quotes: <code>-l 'pune:&amp;routers'</code>. Without the quotes the shell may run part of your command in the background or expand the wildcard against files.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Running a change straight away with a broad pattern. Make it a rule: <code>--list-hosts</code> first, then <code>--check --diff</code> on one device, then the full run. Another trap: patterns are matched against inventory names, not against the device hostname you see in the prompt.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>:&amp;</code> is intersection, <code>:!</code> is exclusion, and a plain colon or comma is union. Always confirm a mixed pattern with <code>--list-hosts</code> instead of guessing.</p></div>

<div class="scn"><h4>Only the Pune routers</h4><p>A change window covers the Pune routers only. The playbook says <code>hosts: all</code>. Instead of editing the file, the engineer ran <code>--list-hosts -l 'pune:&amp;routers'</code>, saw exactly one name, and then ran the real playbook with the same limit. The playbook stayed generic for the next site.</p></div>

<div class="iv"><p class="q">"How do you run a playbook against only part of the network?"</p><p>I keep the play broad and use <code>--limit</code> with a pattern such as a group intersection. I confirm the target list with <code>--list-hosts</code> first. For a first change I limit to a single device, review the check-mode diff, and widen only after that is clean.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A host pattern selects hosts; it appears in <code>hosts:</code> and in <code>-l</code>.</li>
<li><code>:&amp;</code> intersection, <code>:!</code> exclusion, comma or colon union, <code>*</code> wildcard, <code>~</code> regex.</li>
<li>A pattern with no match gives a warning and an error, and nothing is changed.</li>
<li>Quote patterns in single quotes on the shell.</li>
<li><code>--list-hosts</code> is a free preview of who will be touched.</li>
</ul></div>
`,hi:`
<p>Groups tabhi kaam ke hain jab aap unhe nishana bana sako. Iske liye Ansible <b>host patterns</b> use karta hai. Pattern ek chhoti expression hai jo inventory se hosts chunti hai, aur yeh do jagah milti hai: play ki <code>hosts:</code> line mein, aur command line par <code>-l</code> (<code>--limit</code>) option mein. Network automation ki sabse kaam ki aadat yeh hai: play ko <code>hosts: all</code> ya bade group ke liye likho, aur run time par <code>-l</code> se chhota karo. Phir wahi file ek device ke pilot aur poore estate dono ke kaam aati hai.</p>

<h3>Hamara test playbook</h3>
<p>Neeche ke runs <code>snmp.yml</code> use karte hain, ek play jiska naam "SNMP identity" hai aur jo <code>all</code> ko target karta hai. Hum ise yahan sach mein run nahi karte; hum <code>--list-hosts</code> use karte hain, jo batata hai kaun <i>chuna jaayega</i> aur kisi device ko nahi chhuta. Yeh Ansible ka sabse safe command hai.</p>

<h3>Ek site ya combination chuno</h3>
<pre class="out">AUTO01$ ansible-playbook snmp.yml --list-hosts -l pune

playbook: snmp.yml

  play #1 (all): SNMP identity	TAGS: []
    pattern: ['all']
    hosts (2):
      pun-core-r1
      pun-acc-sw1</pre>
<p>Padho: play ka apna pattern <code>all</code> hai, par <code>-l pune</code> ne use do Pune hosts tak chhota kar diya. Group naam us group ke har host ko chunta hai.</p>

<h3>Pattern operators</h3>
<table class="cmp"><tr><th>Pattern</th><th>Matlab</th><th>Chune gaye hosts</th></tr>
<tr><td><code>pune:&amp;routers</code></td><td>pune mein AUR routers mein</td><td>pun-core-r1</td></tr>
<tr><td><code>all:!switches</code></td><td>switches ke alawa sab</td><td>pun-core-r1, blr-edge-r2</td></tr>
<tr><td><code>pune,bengaluru</code></td><td>pune YA bengaluru (comma bhi chalta hai)</td><td>teeno hosts</td></tr>
<tr><td><code>switches:routers</code></td><td>colon ka matlab bhi OR</td><td>teeno hosts</td></tr>
<tr><td><code>pun-*</code></td><td>host name par wildcard</td><td>pun-core-r1, pun-acc-sw1</td></tr>
<tr><td><code>~^blr</code></td><td>regular expression, ~ se shuru</td><td>blr-edge-r2</td></tr></table>
<p>Upar ki har row simulator mein <code>--list-hosts</code> ke saath chalayi gayi aur dikhaye hosts aaye. Do examples poore:</p>
<pre class="out">AUTO01$ ansible-playbook snmp.yml --list-hosts -l 'pune:&amp;routers'

playbook: snmp.yml

  play #1 (all): SNMP identity	TAGS: []
    pattern: ['all']
    hosts (1):
      pun-core-r1

AUTO01$ ansible-playbook snmp.yml --list-hosts -l 'all:!switches'

playbook: snmp.yml

  play #1 (all): SNMP identity	TAGS: []
    pattern: ['all']
    hosts (2):
      pun-core-r1
      blr-edge-r2</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="pune aur routers groups ka Venn diagram">
<circle cx="250" cy="115" r="85" fill="#fde68a" fill-opacity="0.7"/><circle cx="390" cy="115" r="85" fill="#bbf7d0" fill-opacity="0.7"/>
<text x="195" y="40" text-anchor="middle" class="svg-ink" font-size="13">pune</text><text x="445" y="40" text-anchor="middle" class="svg-ink" font-size="13">routers</text>
<text x="190" y="120" text-anchor="middle" class="svg-muted" font-size="12">pun-acc-sw1</text><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">pun-core-r1</text><text x="450" y="120" text-anchor="middle" class="svg-muted" font-size="12">blr-edge-r2</text>
<text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="12">pune:&amp;routers overlap hai</text>
</svg><p class="cap">&amp; operator sirf do groups ka overlap rakhta hai.</p></div>

<h3>Jab pattern kuch match na kare</h3>
<pre class="out">AUTO01$ ansible-playbook snmp.yml --list-hosts -l nosuchgroup
[WARNING]: Could not match supplied host pattern, ignoring: nosuchgroup
ERROR! Specified inventory, host pattern and/or --limit leaves us with no hosts to target.</pre>
<p>Isliye limit mein typo safe hai: Ansible warning deta hai, phir error ke saath ruk jaata hai aur kuch change nahi karta. Iski tulna us pattern se karo jo zyada match karta hai, jaise <code>all</code>, jo chup rehta hai. Isliye pehle hosts list karte hain.</p>

<h3>Shell mein quoting</h3>
<p><code>&amp;</code>, <code>!</code>, <code>*</code> aur <code>~</code> Linux shell ke liye matlab rakhte hain. In wale pattern ko hamesha single quotes mein likho: <code>-l 'pune:&amp;routers'</code>. Quotes ke bina shell aapke command ka hissa background mein chala sakta hai ya wildcard ko files ke against expand kar sakta hai.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Bade pattern ke saath seedha change chala dena. Rule banao: pehle <code>--list-hosts</code>, phir ek device par <code>--check --diff</code>, phir poora run. Ek aur trap: patterns inventory names se match hote hain, us device hostname se nahi jo aap prompt mein dekhte ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>:&amp;</code> intersection hai, <code>:!</code> exclusion hai, aur simple colon ya comma union hai. Mixed pattern ko andaze se nahi, <code>--list-hosts</code> se confirm karo.</p></div>

<div class="scn"><h4>Sirf Pune ke routers</h4><p>Change window sirf Pune routers ke liye hai. Playbook mein <code>hosts: all</code> hai. File edit karne ki jagah engineer ne <code>--list-hosts -l 'pune:&amp;routers'</code> chalaya, ek hi naam dekha, aur phir wahi limit ke saath asli playbook chalaya. Playbook agle site ke liye generic hi raha.</p></div>

<div class="iv"><p class="q">"Network ke sirf ek hisse par playbook kaise chalaoge?"</p><p>Main play ko broad rakhta hoon aur <code>--limit</code> ke saath group intersection jaisa pattern use karta hoon. Pehle <code>--list-hosts</code> se target list confirm karta hoon. Pehle change ke liye ek device tak limit karta hoon, check-mode diff review karta hoon, aur clean hone ke baad hi widen karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Host pattern hosts chunta hai; yeh <code>hosts:</code> aur <code>-l</code> mein aata hai.</li>
<li><code>:&amp;</code> intersection, <code>:!</code> exclusion, comma ya colon union, <code>*</code> wildcard, <code>~</code> regex.</li>
<li>Match na hone par warning aur error aata hai, aur kuch change nahi hota.</li>
<li>Shell mein patterns ko single quotes mein likho.</li>
<li><code>--list-hosts</code> free preview hai ki kise chhua jaayega.</li>
</ul></div>
`}};export{e as default};