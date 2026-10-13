var e={id:`cli-structure`,h:{en:`How the FortiOS CLI works: tables, entries and attributes`,hi:`FortiOS CLI kaise kaam karta hai: tables, entries aur attributes`},body:{en:`
<p>Think of the FortiOS CLI as a set of <b>spreadsheets</b>. Each spreadsheet is a <b>table</b> such as the interface table or the static route table. Each row is an <b>entry</b> with a key (a name or a number). Each column is an <b>attribute</b> that you set. Once you see it that way, every command is the same four moves: open the table, pick the row, set the cells, save the row.</p>
<h3>The editing commands</h3>
<table class="cmp"><tr><th>Command</th><th>Meaning</th></tr>
<tr><td><code>config &lt;table&gt;</code></td><td>open a table, for example <code>config system interface</code></td></tr>
<tr><td><code>edit &lt;key&gt;</code></td><td>open an entry; a new key creates it</td></tr>
<tr><td><code>set &lt;attr&gt; &lt;value&gt;</code></td><td>change an attribute; <code>unset</code> returns it to the default</td></tr>
<tr><td><code>append / unselect</code></td><td>add or remove one value in a list</td></tr>
<tr><td><code>next</code></td><td>save the entry and stay in the table</td></tr>
<tr><td><code>end</code></td><td>save and leave the table</td></tr>
<tr><td><code>abort</code></td><td>discard the unsaved entry</td></tr></table>
<p>There is <b>no commit</b>. When you type <code>next</code> or <code>end</code> the entry is validated and, if valid, active at once. Real output from the simulator, naming the device and addressing the LAN port:</p>
<pre class="code">FGT1 # conf sys glo
FGT1 (global) # set hostname NK-PUNE-FGT
FGT1 (global) # end
NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit port2
NK-PUNE-FGT (port2) # set ip 10.0.1.1 255.255.255.0
NK-PUNE-FGT (port2) # set allowaccess ping h&#116;tps ssh
NK-PUNE-FGT (port2) # set alias LAN
NK-PUNE-FGT (port2) # set role lan
NK-PUNE-FGT (port2) # show</pre>
<pre class="out">config system interface
    edit "port2"
        set vdom "root"
        set ip 10.0.1.1 255.255.255.0
        set allowaccess ping h&#116;tps ssh
        set type physical
        set alias "LAN"
        set role lan
        set snmp-index 2
    next
end</pre>
<p>Two details. First, <code>conf sys glo</code> worked because each word is unique when abbreviated, and the prompt changed to the new hostname the moment <code>end</code> saved it. Second, <code>show</code> inside an entry prints that entry before you save it, a good habit before <code>next</code>.</p>
<h3>set versus append</h3>
<p>For attributes that hold a <b>list</b> (allowaccess, interface members, addresses), <code>set</code> replaces the whole list and <code>append</code> adds to it. This difference causes outages:</p>
<pre class="out">NK-PUNE-FGT (port2) # append allowaccess snmp
NK-PUNE-FGT (port2) # show
        set allowaccess ping h&#116;tps ssh <span class="hl">snmp</span>

NK-PUNE-FGT (port2) # set allowaccess ping
NK-PUNE-FGT (port2) # show
        set allowaccess <span class="hl">ping</span></pre>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Table, entry, attribute, save"><rect x="10" y="40" width="140" height="55" rx="9" fill="#bae6fd"/><text x="80" y="64.5" text-anchor="middle" class="svg-ink" font-size="13">config system interface</text><text x="80" y="81.5" text-anchor="middle" class="svg-muted" font-size="11">open the table</text><line x1="150" y1="67" x2="180" y2="67" stroke="#64748b" stroke-width="2"/><rect x="180" y="40" width="110" height="55" rx="9" fill="#bbf7d0"/><text x="235" y="64.5" text-anchor="middle" class="svg-ink" font-size="13">edit port2</text><text x="235" y="81.5" text-anchor="middle" class="svg-muted" font-size="11">pick the row</text><line x1="290" y1="67" x2="320" y2="67" stroke="#64748b" stroke-width="2"/><rect x="320" y="40" width="150" height="55" rx="9" fill="#fde68a"/><text x="395" y="64.5" text-anchor="middle" class="svg-ink" font-size="13">set ip / allowaccess</text><text x="395" y="81.5" text-anchor="middle" class="svg-muted" font-size="11">change cells</text><line x1="470" y1="67" x2="495" y2="67" stroke="#64748b" stroke-width="2"/><rect x="495" y="40" width="135" height="55" rx="9" fill="#ddd6fe"/><text x="562.5" y="64.5" text-anchor="middle" class="svg-ink" font-size="13">next / end</text><text x="562.5" y="81.5" text-anchor="middle" class="svg-muted" font-size="11">save: live now</text></svg><p class="cap">Table, entry, attribute, save</p></div>
<h3>Errors you will see</h3>
<p>FortiOS errors are short, and each points to a specific mistake. These are real messages from the simulator:</p>
<pre class="out">NK-PUNE-FGT (port3) # set bogus 1
<span class="hl">command parse error before 'bogus'</span>
Command fail. Return code -61

NK-PUNE-FGT (port4) # end
<span class="hl">Subnets overlap between 'port4' and the primary IP of 'port2'</span>
object set operator error, -54 discard the setting
Command fail. Return code -54

NK-PUNE-FGT (VLAN30) # next
<span class="hl">Attribute 'interface' MUST be set.</span>
Command fail. Return code 1</pre>
<table class="cmp"><tr><th>Message</th><th>Meaning</th></tr><tr><td>command parse error before</td><td>FortiOS does not know the word; check spelling and the current table</td></tr><tr><td>value parse error / entry not found in datasource</td><td>you referenced an object (interface, address, zone) that does not exist</td></tr><tr><td>Subnets overlap</td><td>two interfaces cannot share overlapping subnets</td></tr><tr><td>Attribute MUST be set</td><td>the entry is missing a required value</td></tr></table>
<div class="eg"><p><b>Worked example.</b> You type <code>edit port4</code> then <code>set ip 10.0.1.9 255.255.255.0</code>. Nothing happens until <code>end</code>, which fails with "Subnets overlap", because port2 already owns 10.0.1.0/24. The entry is discarded, so you correct the address and repeat. Always read the response to <code>end</code>; a silent prompt means success.</p></div>
<div class="warn"><p><b>Common mistake.</b> After a failed <code>end</code> the prompt may stay inside the entry. Typing <code>config ...</code> then gives "command parse error". Use <code>abort</code> or fix the value and run <code>end</code> again.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show</code> prints only non-default configuration; <code>get</code> prints every attribute. Questions often ask which command reveals a default value.</p></div>
<div class="scn"><h4>One word that removed SSH</h4><p>An engineer wanted to add ping to the LAN port, which already allowed SSH, and typed <code>set allowaccess ping</code>. SSH vanished from the list and his own session dropped at the next login attempt. A console cable fixed it. He now types <code>append</code> for lists and runs <code>show</code> before <code>next</code>.</p><p><b>Lesson:</b> on lists, set replaces and append adds; confirm with show before saving.</p></div>
<div class="iv"><p class="q">"How is the FortiOS CLI different from Cisco IOS?"</p><p>FortiOS is table-oriented: config opens a table, edit selects an entry, set changes attributes, and next or end saves. There is no running-config versus startup-config split and no commit; a saved entry is live and persistent. IOS is line-oriented with global and interface modes and needs write memory to persist. Mention show versus get and set versus append.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Table, entry, attribute: config, edit, set, next or end.</li>
<li>No commit: a saved entry is live immediately.</li>
<li>set replaces a list; append adds to it.</li>
<li>Read the reply to end: silence means success, otherwise an error code and reason.</li>
</ul></div>
`,hi:`
<p>FortiOS CLI ko <b>spreadsheets</b> ka set samjho. Har spreadsheet ek <b>table</b> hai, jaise interface table ya static route table. Har row ek <b>entry</b> hai jiska key (naam ya number) hota hai. Har column ek <b>attribute</b> hai jo aap set karte ho. Aise dekho to har command wahi chaar moves hai: table kholo, row chuno, cells set karo, row save karo.</p>
<h3>Editing commands</h3>
<table class="cmp"><tr><th>Command</th><th>Matlab</th></tr>
<tr><td><code>config &lt;table&gt;</code></td><td>table kholo, jaise <code>config system interface</code></td></tr>
<tr><td><code>edit &lt;key&gt;</code></td><td>entry kholo; naya key ho to bana deta hai</td></tr>
<tr><td><code>set &lt;attr&gt; &lt;value&gt;</code></td><td>attribute badlo; <code>unset</code> default par wapas laata hai</td></tr>
<tr><td><code>append / unselect</code></td><td>list mein ek value jodo ya hatao</td></tr>
<tr><td><code>next</code></td><td>entry save karo aur table mein raho</td></tr>
<tr><td><code>end</code></td><td>save karke table se bahar</td></tr>
<tr><td><code>abort</code></td><td>unsaved entry phenk do</td></tr></table>
<p><b>Commit nahi hota.</b> Jab aap <code>next</code> ya <code>end</code> type karte ho entry validate hoti hai aur valid ho to turant active ho jaati hai. Simulator ka asli output, device ko naam dene aur LAN port ko address dene ka:</p>
<pre class="code">FGT1 # conf sys glo
FGT1 (global) # set hostname NK-PUNE-FGT
FGT1 (global) # end
NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit port2
NK-PUNE-FGT (port2) # set ip 10.0.1.1 255.255.255.0
NK-PUNE-FGT (port2) # set allowaccess ping h&#116;tps ssh
NK-PUNE-FGT (port2) # set alias LAN
NK-PUNE-FGT (port2) # set role lan
NK-PUNE-FGT (port2) # show</pre>
<pre class="out">config system interface
    edit "port2"
        set vdom "root"
        set ip 10.0.1.1 255.255.255.0
        set allowaccess ping h&#116;tps ssh
        set type physical
        set alias "LAN"
        set role lan
        set snmp-index 2
    next
end</pre>
<p>Do details. Pehli, <code>conf sys glo</code> chala kyunki abbreviate karne par har word unique hai, aur <code>end</code> se save hote hi prompt naye hostname mein badal gaya. Doosri, entry ke andar <code>show</code> save se pehle us entry ko print karta hai, <code>next</code> se pehle achhi aadat.</p>
<h3>set versus append</h3>
<p>Jin attributes mein <b>list</b> hoti hai (allowaccess, interface members, addresses) unme <code>set</code> poori list replace karta hai aur <code>append</code> usme jodta hai. Yeh fark outages karwata hai:</p>
<pre class="out">NK-PUNE-FGT (port2) # append allowaccess snmp
NK-PUNE-FGT (port2) # show
        set allowaccess ping h&#116;tps ssh <span class="hl">snmp</span>

NK-PUNE-FGT (port2) # set allowaccess ping
NK-PUNE-FGT (port2) # show
        set allowaccess <span class="hl">ping</span></pre>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Table, entry, attribute, save"><rect x="10" y="40" width="140" height="55" rx="9" fill="#bae6fd"/><text x="80" y="64.5" text-anchor="middle" class="svg-ink" font-size="13">config system interface</text><text x="80" y="81.5" text-anchor="middle" class="svg-muted" font-size="11">table kholo</text><line x1="150" y1="67" x2="180" y2="67" stroke="#64748b" stroke-width="2"/><rect x="180" y="40" width="110" height="55" rx="9" fill="#bbf7d0"/><text x="235" y="64.5" text-anchor="middle" class="svg-ink" font-size="13">edit port2</text><text x="235" y="81.5" text-anchor="middle" class="svg-muted" font-size="11">row chuno</text><line x1="290" y1="67" x2="320" y2="67" stroke="#64748b" stroke-width="2"/><rect x="320" y="40" width="150" height="55" rx="9" fill="#fde68a"/><text x="395" y="64.5" text-anchor="middle" class="svg-ink" font-size="13">set ip / allowaccess</text><text x="395" y="81.5" text-anchor="middle" class="svg-muted" font-size="11">cells badlo</text><line x1="470" y1="67" x2="495" y2="67" stroke="#64748b" stroke-width="2"/><rect x="495" y="40" width="135" height="55" rx="9" fill="#ddd6fe"/><text x="562.5" y="64.5" text-anchor="middle" class="svg-ink" font-size="13">next / end</text><text x="562.5" y="81.5" text-anchor="middle" class="svg-muted" font-size="11">save: turant live</text></svg><p class="cap">Table, entry, attribute, save</p></div>
<h3>Jo errors dikhenge</h3>
<p>FortiOS errors chhote hote hain aur har ek ek khaas galti batata hai. Yeh simulator ke asli messages hain:</p>
<pre class="out">NK-PUNE-FGT (port3) # set bogus 1
<span class="hl">command parse error before 'bogus'</span>
Command fail. Return code -61

NK-PUNE-FGT (port4) # end
<span class="hl">Subnets overlap between 'port4' and the primary IP of 'port2'</span>
object set operator error, -54 discard the setting
Command fail. Return code -54

NK-PUNE-FGT (VLAN30) # next
<span class="hl">Attribute 'interface' MUST be set.</span>
Command fail. Return code 1</pre>
<table class="cmp"><tr><th>Message</th><th>Matlab</th></tr><tr><td>command parse error before</td><td>FortiOS word nahi jaanta; spelling aur current table check karo</td></tr><tr><td>value parse error / entry not found in datasource</td><td>aapne aisa object refer kiya jo exist nahi karta (interface, address, zone)</td></tr><tr><td>Subnets overlap</td><td>do interfaces overlapping subnets share nahi kar sakte</td></tr><tr><td>Attribute MUST be set</td><td>entry mein zaroori value missing hai</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Aap <code>edit port4</code> phir <code>set ip 10.0.1.9 255.255.255.0</code> type karte ho. <code>end</code> tak kuch nahi hota, jo "Subnets overlap" ke saath fail hota hai, kyunki port2 pehle se 10.0.1.0/24 rakhta hai. Entry discard ho jaati hai, isliye address theek karke dobara karo. <code>end</code> ka response hamesha padho; silent prompt ka matlab success hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Failed <code>end</code> ke baad prompt entry ke andar reh sakta hai. Tab <code>config ...</code> type karne par "command parse error" aata hai. <code>abort</code> use karo ya value theek karke phir <code>end</code> chalao.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show</code> sirf non-default configuration print karta hai; <code>get</code> har attribute print karta hai. Sawaal aksar poochte hain ki kaunsa command default value dikhata hai.</p></div>
<div class="scn"><h4>Ek word jisne SSH hata diya</h4><p>Ek engineer LAN port par ping jodna chahta tha, jo pehle se SSH allow karta tha, aur usne <code>set allowaccess ping</code> type kiya. SSH list se gayab ho gaya aur agle login attempt par uska apna session toot gaya. Console cable se theek hua. Ab woh lists ke liye <code>append</code> type karta hai aur <code>next</code> se pehle <code>show</code> chalata hai.</p><p><b>Lesson:</b> lists par set replace karta hai aur append jodta hai; save se pehle show se confirm karo.</p></div>
<div class="iv"><p class="q">"FortiOS CLI Cisco IOS se kaise alag hai?"</p><p>FortiOS table-oriented hai: config table kholta hai, edit entry chunta hai, set attributes badalta hai, aur next ya end save karta hai. Running-config aur startup-config ka split nahi hai aur commit nahi hota; saved entry live aur persistent hai. IOS line-oriented hai jisme global aur interface modes hain aur persist karne ke liye write memory chahiye. show versus get aur set versus append ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Table, entry, attribute: config, edit, set, next ya end.</li>
<li>Commit nahi: saved entry turant live hoti hai.</li>
<li>set list replace karta hai; append usme jodta hai.</li>
<li>end ka reply padho: silence matlab success, warna error code aur reason.</li>
</ul></div>
`}};export{e as default};