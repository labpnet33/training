var e={id:`summary`,h:{en:`Summary, checklist and cheat-sheet`,hi:`Summary, checklist aur cheat-sheet`},body:{en:`
<p><b>The idea of this chapter:</b> pull the module into one page you can use before a script review or an interview. A multivendor script is the same five steps on every platform: <b>name the platform, prepare the session, send, check the result, and keep evidence</b>. The vendors differ only inside those steps.</p>

<h3>Analogy: the same recipe, four stoves</h3>
<p>Boiling rice is the same on gas, induction, electric and wood: measure, heat, wait, check. What changes is how you light the stove. Netmiko is the recipe; <code>device_type</code> is the stove. Choose the wrong stove and the recipe fails at the first step.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Five steps of a multivendor collector">
<rect x="6" y="30" width="116" height="76" rx="8" fill="#bae6fd"/><text x="64" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 Name</text><text x="64" y="76" text-anchor="middle" class="svg-muted" font-size="10">device_type</text><text x="64" y="90" text-anchor="middle" class="svg-muted" font-size="10">in the inventory</text>
<rect x="132" y="30" width="116" height="76" rx="8" fill="#ddd6fe"/><text x="190" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 Prepare</text><text x="190" y="76" text-anchor="middle" class="svg-muted" font-size="10">paging, width,</text><text x="190" y="90" text-anchor="middle" class="svg-muted" font-size="10">enable (netmiko)</text>
<rect x="258" y="30" width="116" height="76" rx="8" fill="#fde68a"/><text x="316" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 Send</text><text x="316" y="76" text-anchor="middle" class="svg-muted" font-size="10">show or config</text><text x="316" y="90" text-anchor="middle" class="svg-muted" font-size="10">per vendor model</text>
<rect x="384" y="30" width="116" height="76" rx="8" fill="#bbf7d0"/><text x="442" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 Check</text><text x="442" y="76" text-anchor="middle" class="svg-muted" font-size="10">parse, read back,</text><text x="442" y="90" text-anchor="middle" class="svg-muted" font-size="10">assert</text>
<rect x="510" y="30" width="124" height="76" rx="8" fill="#fecaca"/><text x="572" y="56" text-anchor="middle" class="svg-ink" font-size="12">5 Evidence</text><text x="572" y="76" text-anchor="middle" class="svg-muted" font-size="10">logs, backups,</text><text x="572" y="90" text-anchor="middle" class="svg-muted" font-size="10">diff, alert</text>
</svg><p class="cap">The skeleton of every script in this module.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can name the device_type for IOS, IOS XE, NX-OS, EOS, Junos and ASA, and use SSHDetect once to fill a gap.</li>
<li>I can explain what netmiko sends at connect on each platform and why paging must be switched off.</li>
<li>I choose <code>send_command</code> by default, <code>expect_string</code> for dialogs, and <code>send_command_timing</code> only when no pattern can work.</li>
<li>I know the structured output is only as common as its templates, and I look at the keys per platform.</li>
<li>I can push configuration on a live-edit, a candidate-plus-commit and a session-based platform, and prove it with a read-back.</li>
<li>I run devices in threads, retry only timeouts, never retry authentication, and report every failure.</li>
<li>I keep session logs, dated backups and a filtered diff, and I protect them as secrets.</li>
<li>I read the exception class first and the quoted pattern second.</li>
</ul>

<h3>Cheat-sheet</h3>
<table class="cmp"><tr><th>Platform</th><th>device_type</th><th>Prompt end</th><th>Config model</th></tr>
<tr><td>Cisco IOS / IOS XE</td><td><code>cisco_ios</code> / <code>cisco_xe</code></td><td><code>#</code></td><td>live edit, then save</td></tr>
<tr><td>Cisco NX-OS</td><td><code>cisco_nxos</code></td><td><code>#</code></td><td>live edit, then save</td></tr>
<tr><td>Arista EOS</td><td><code>arista_eos</code></td><td><code>#</code></td><td>live edit or named session</td></tr>
<tr><td>Juniper Junos</td><td><code>juniper_junos</code></td><td><code>&gt;</code> (config <code>#</code>)</td><td>candidate, <code>commit()</code></td></tr>
<tr><td>Cisco ASA</td><td><code>cisco_asa</code></td><td><code>#</code></td><td>live edit, enable first</td></tr></table>
<pre class="code">dev = {"device_type": "juniper_junos", "host": "10.99.0.11",
       "username": "netops", "password": "NK@2026"}
with ConnectHandler(**dev) as conn:
    conn.send_config_set(cmds, exit_config_mode=False)
    conn.commit(comment="why")</pre>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Wrong device_type</td><td><code>ReadTimeout</code> naming another vendor's message</td></tr>
<tr><td>Bad password</td><td><code>NetmikoAuthenticationException</code>, never retried</td></tr>
<tr><td>Unreachable or vty full</td><td><code>NetmikoTimeoutException</code>, retry with back-off</td></tr>
<tr><td>Junos default <code>send_config_set</code></td><td>discards uncommitted change</td></tr>
<tr><td><code>save_config</code></td><td>not implemented on Junos and FortiOS</td></tr>
<tr><td>Errors from the device</td><td>returned as text unless <code>error_pattern</code> is set</td></tr>
<tr><td>Session log mode</td><td><code>write</code> by default; use append to keep history</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> One shared password for all vendors. Parsing without checking that the result is a list. Calling a green exit code success. Leaving backups readable by everyone.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which exception for a wrong device_type?" depends on the case: a name that does not exist raises <code>ValueError</code> before any network traffic; a real name for the wrong vendor raises <code>ReadTimeout</code> after connecting.</p></div>

<div class="scn"><h4>The review that saved a weekend</h4><p>Before a firewall migration, a reviewer walked a colleague's script through the five steps. The inventory had no vendor column, the Junos push never committed, and failures were only printed. Fixing those three items took an hour; the migration night ran clean.</p><p><b>Lesson:</b> a short checklist catches the same faults a long outage would.</p></div>

<div class="iv"><p class="q">"Summarise how you would automate one task on four vendors."</p><p>I put the platform in the inventory, build the connection from it, use the same helper for every vendor, handle configuration according to each model (commit on Junos), parse only where a template exists, and finish with a read-back check, logs, a diff and an exit code that reflects failures.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five steps: name, prepare, send, check, evidence.</li>
<li>The vendor differences live in the name, the preparation and the config model.</li>
<li>Exception class first, quoted pattern second.</li>
<li>Read back every change; do not trust an exit code.</li>
<li>Logs and backups are secrets.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> module ko ek page mein samet lo jo script review ya interview se pehle kaam aaye. Multivendor script har platform par wahi paanch steps hai: <b>platform ka naam, session taiyar karo, bhejo, result check karo, saboot rakho</b>. Vendors sirf in steps ke andar alag hain.</p>

<h3>Analogy: wahi recipe, chaar choolhe</h3>
<p>Chawal ubalna gas, induction, electric aur lakdi par ek jaisa hai: naapo, garam karo, ruko, dekho. Jo badalta hai woh choolha jalane ka tareeka hai. Netmiko recipe hai; <code>device_type</code> choolha hai. Galat choolha chuna to recipe pehle step par hi fail.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Five steps of a multivendor collector">
<rect x="6" y="30" width="116" height="76" rx="8" fill="#bae6fd"/><text x="64" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 Naam</text><text x="64" y="76" text-anchor="middle" class="svg-muted" font-size="10">device_type</text><text x="64" y="90" text-anchor="middle" class="svg-muted" font-size="10">inventory mein</text>
<rect x="132" y="30" width="116" height="76" rx="8" fill="#ddd6fe"/><text x="190" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 Taiyari</text><text x="190" y="76" text-anchor="middle" class="svg-muted" font-size="10">paging, width,</text><text x="190" y="90" text-anchor="middle" class="svg-muted" font-size="10">enable (netmiko)</text>
<rect x="258" y="30" width="116" height="76" rx="8" fill="#fde68a"/><text x="316" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 Bhejo</text><text x="316" y="76" text-anchor="middle" class="svg-muted" font-size="10">show ya config</text><text x="316" y="90" text-anchor="middle" class="svg-muted" font-size="10">vendor model ke hisaab se</text>
<rect x="384" y="30" width="116" height="76" rx="8" fill="#bbf7d0"/><text x="442" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 Check</text><text x="442" y="76" text-anchor="middle" class="svg-muted" font-size="10">parse, read back,</text><text x="442" y="90" text-anchor="middle" class="svg-muted" font-size="10">assert</text>
<rect x="510" y="30" width="124" height="76" rx="8" fill="#fecaca"/><text x="572" y="56" text-anchor="middle" class="svg-ink" font-size="12">5 Saboot</text><text x="572" y="76" text-anchor="middle" class="svg-muted" font-size="10">logs, backups,</text><text x="572" y="90" text-anchor="middle" class="svg-muted" font-size="10">diff, alert</text>
</svg><p class="cap">Is module ki har script ka dhancha.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main IOS, IOS XE, NX-OS, EOS, Junos aur ASA ka device_type bata sakta hoon, aur khaali jagah bharne ke liye SSHDetect ek baar use kar sakta hoon.</li>
<li>Main samjha sakta hoon ki netmiko connect par har platform par kya bhejta hai aur paging band kyun karni padti hai.</li>
<li>Default <code>send_command</code>, dialogs ke liye <code>expect_string</code>, aur <code>send_command_timing</code> sirf tab jab koi pattern kaam na kare.</li>
<li>Main jaanta hoon ki structured output utna hi common hai jitne templates hain, aur har platform ki keys dekhta hoon.</li>
<li>Main live-edit, candidate-plus-commit aur session-based platform par configuration push kar sakta hoon, aur read-back se saabit karta hoon.</li>
<li>Main devices threads mein chalata hoon, sirf timeouts retry karta hoon, authentication kabhi retry nahi, aur har failure report karta hoon.</li>
<li>Main session logs, date wale backups aur filtered diff rakhta hoon, aur unhe secrets ki tarah bachata hoon.</li>
<li>Main pehle exception class padhta hoon, phir quoted pattern.</li>
</ul>

<h3>Cheat-sheet</h3>
<table class="cmp"><tr><th>Platform</th><th>device_type</th><th>Prompt ka ant</th><th>Config model</th></tr>
<tr><td>Cisco IOS / IOS XE</td><td><code>cisco_ios</code> / <code>cisco_xe</code></td><td><code>#</code></td><td>live edit, phir save</td></tr>
<tr><td>Cisco NX-OS</td><td><code>cisco_nxos</code></td><td><code>#</code></td><td>live edit, phir save</td></tr>
<tr><td>Arista EOS</td><td><code>arista_eos</code></td><td><code>#</code></td><td>live edit ya named session</td></tr>
<tr><td>Juniper Junos</td><td><code>juniper_junos</code></td><td><code>&gt;</code> (config <code>#</code>)</td><td>candidate, <code>commit()</code></td></tr>
<tr><td>Cisco ASA</td><td><code>cisco_asa</code></td><td><code>#</code></td><td>live edit, pehle enable</td></tr></table>
<pre class="code">dev = {"device_type": "juniper_junos", "host": "10.99.0.11",
       "username": "netops", "password": "NK@2026"}
with ConnectHandler(**dev) as conn:
    conn.send_config_set(cmds, exit_config_mode=False)
    conn.commit(comment="why")</pre>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Galat device_type</td><td><code>ReadTimeout</code> jisme doosre vendor ka message hota hai</td></tr>
<tr><td>Galat password</td><td><code>NetmikoAuthenticationException</code>, retry nahi</td></tr>
<tr><td>Unreachable ya vty full</td><td><code>NetmikoTimeoutException</code>, back-off ke saath retry</td></tr>
<tr><td>Junos ka default <code>send_config_set</code></td><td>uncommitted badlaav phenk deta hai</td></tr>
<tr><td><code>save_config</code></td><td>Junos aur FortiOS par implemented nahi</td></tr>
<tr><td>Device ke errors</td><td>text ki tarah lautte hain jab tak <code>error_pattern</code> set na ho</td></tr>
<tr><td>Session log mode</td><td>default <code>write</code>; history ke liye append</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Saare vendors ke liye ek shared password. Result list hai ya nahi dekhe bina parse karna. Green exit code ko success kehna. Backups ko sabke liye readable chhodna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Galat device_type par kaunsa exception?" case par nirbhar hai: jo naam hai hi nahi woh network traffic se pehle <code>ValueError</code> deta hai; asli naam par galat vendor connect ke baad <code>ReadTimeout</code> deta hai.</p></div>

<div class="scn"><h4>Woh review jisne weekend bachaya</h4><p>Firewall migration se pehle ek reviewer ne saathi ki script ko paanch steps se guzara. Inventory mein vendor column nahi tha, Junos push kabhi commit nahi hua, aur failures sirf print hote the. Teeno theek karne mein ek ghanta laga; migration ki raat saaf chali.</p><p><b>Lesson:</b> chhoti checklist wahi faults pakadti hai jo lamba outage pakadta.</p></div>

<div class="iv"><p class="q">"Chaar vendors par ek task automate karna ek line mein batao."</p><p>Platform inventory mein rakhta hoon, usse connection banata hoon, har vendor ke liye wahi helper use karta hoon, configuration har model ke hisaab se handle karta hoon (Junos par commit), parse sirf wahan karta hoon jahan template hai, aur read-back check, logs, diff aur failures dikhane wale exit code par khatam karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch steps: naam, taiyari, bhejo, check, saboot.</li>
<li>Vendor ka farq naam, taiyari aur config model mein rehta hai.</li>
<li>Pehle exception class, phir quoted pattern.</li>
<li>Har badlaav read back karo; exit code par bharosa mat karo.</li>
<li>Logs aur backups secrets hain.</li>
</ul></div>
`}};export{e as default};