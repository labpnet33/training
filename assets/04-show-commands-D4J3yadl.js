var e={id:`show-commands`,h:{en:`Show commands: send_command, send_command_timing and expect_string`,hi:`Show commands: send_command, send_command_timing aur expect_string`},body:{en:`
<p><b>The idea of this chapter:</b> sending a command is easy; knowing <i>when the answer has finished</i> is the hard part. netmiko has two answers: wait for the prompt to come back, or wait until the device goes quiet. Choosing between them, and choosing what to wait for, removes most hangs and most ReadTimeout errors on non-Cisco boxes.</p>

<h3>Analogy: ordering in a restaurant</h3>
<p><b>send_command</b> is waiting until the waiter comes back and says "anything else?" (the prompt). <b>send_command_timing</b> is waiting until the kitchen has been silent for a moment. <b>expect_string</b> is telling the waiter exactly which words mean "done". The first is the most reliable; the second is needed when the device asks you a question instead of showing the prompt.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="send_command reads until the prompt">
<rect x="10" y="30" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="70" y="52" text-anchor="middle" class="svg-ink" font-size="12">send command</text><text x="70" y="68" text-anchor="middle" class="svg-muted" font-size="10">show ip int brief</text>
<rect x="160" y="30" width="170" height="50" rx="8" fill="#bae6fd"/><text x="245" y="52" text-anchor="middle" class="svg-ink" font-size="12">read output chunks</text><text x="245" y="68" text-anchor="middle" class="svg-muted" font-size="10">until the pattern matches</text>
<rect x="360" y="30" width="120" height="50" rx="8" fill="#fde68a"/><text x="420" y="52" text-anchor="middle" class="svg-ink" font-size="12">prompt seen</text><text x="420" y="68" text-anchor="middle" class="svg-muted" font-size="10">PUN-CORE-R1#</text>
<rect x="510" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="52" text-anchor="middle" class="svg-ink" font-size="12">return text</text><text x="570" y="68" text-anchor="middle" class="svg-muted" font-size="10">no echo, no prompt</text>
<line x1="130" y1="55" x2="160" y2="55" stroke="#64748b" stroke-width="2"/><line x1="330" y1="55" x2="360" y2="55" stroke="#64748b" stroke-width="2"/><line x1="480" y1="55" x2="510" y2="55" stroke="#64748b" stroke-width="2"/>
<path d="M245 82 L245 120 L420 120 L420 82" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 3"/><text x="332" y="138" text-anchor="middle" class="svg-accent" font-size="11">pattern never shows: ReadTimeout after read_timeout seconds</text>
</svg><p class="cap">send_command ends when the stored prompt (or your expect_string) appears. If it never does, you get ReadTimeout.</p></div>

<h3>send_command, step by step</h3>
<pre class="code">conn = ConnectHandler(device_type="cisco_ios", host="10.99.0.1", username="netops",
                      password="NK@2026", secret="NK@2026")
out = conn.send_command("show ip interface brief")                       <span class="c"># echo and prompt removed</span>
raw = conn.send_command("show ip interface brief", strip_prompt=False, strip_command=False)
print(repr(out[:60]))
print(repr(raw[:40]), repr(raw[-16:]))</pre>
<pre class="out">'Interface              IP-Address      OK? Method Status    '
'show ip interface brief\\nInterface       ' 'own\\nPUN-CORE-R1#'</pre>
<p>By default netmiko strips the echoed command and the final prompt, so the text is clean. Keep them (<code>strip_command=False</code>, <code>strip_prompt=False</code>) when you want proof of what was run, for example in an audit file. Since netmiko 4 the waiting limit is <code>read_timeout</code> in seconds; older scripts use <code>delay_factor</code> and <code>max_loops</code>, which still work but are the old way.</p>

<h3>Errors come back as text, not as exceptions</h3>
<pre class="code">print(repr(conn.send_command("show ip interfce brief")))     <span class="c"># typo on an IOS router</span></pre>
<pre class="out"><span class="hl">"                    ^\\n% Invalid input detected at '^' marker."</span></pre>
<p>On Junos the same kind of mistake returns <code>syntax error, expecting &lt;command&gt;.</code> after a caret line. No exception is raised, so a collector that saves this text as a "backup" has silently saved an error message. Check for the platform's error marker (<code>% Invalid input</code>, <code>syntax error</code>, <code>unknown command</code>) or, better, test that the output has the shape you expect.</p>

<h3>When the device asks a question</h3>
<p>Some commands do not end with the prompt but with a question. With <code>send_command</code> netmiko keeps waiting for the prompt, which never comes:</p>
<pre class="out">AUTO01$ python3 ch4.py
ReadTimeout
<span class="hl">Pattern not detected: 'PUN\\\\-CORE\\\\-R1\\\\#' in output.</span></pre>
<p>That was <code>copy running-config startup-config</code> on IOS, which asks <code>Destination filename [startup-config]?</code>. Two correct ways:</p>
<pre class="code"><span class="c"># 1. timing: read until quiet, answer, read again</span>
out = conn.send_command_timing("copy running-config startup-config")   <span class="c"># 'Destination filename [startup-config]? '</span>
out = conn.send_command_timing("\\n")                                    <span class="c"># 'Building configuration...\\n[OK]'</span>

<span class="c"># 2. expect_string: name the question, then the prompt</span>
out = conn.send_command("copy running-config startup-config", expect_string=r"Destination filename")
out = conn.send_command("\\n", expect_string=r"#")</pre>
<table class="cmp"><tr><th>Call</th><th>Ends when</th><th>Use it for</th></tr>
<tr><td><code>send_command</code></td><td>the prompt (or <code>expect_string</code>) matches</td><td>normal show commands; the default</td></tr>
<tr><td><code>send_command_timing</code></td><td>no new output for a short time</td><td>questions, confirmations, unknown prompts</td></tr>
<tr><td><code>send_command(..., expect_string=...)</code></td><td>your regular expression matches</td><td>one exact, known end marker</td></tr></table>

<h3>ReadTimeout and the other timeouts</h3>
<pre class="out">ReadTimeout:
<span class="hl">Pattern not detected: 'NEVER' in output.</span>

Things you might try to fix this:
1. Explicitly set your pattern using the expect_string argument.
2. Increase the read_timeout to a larger value.

You can also look at the Netmiko session_log or debug log for more information.</pre>
<table class="cmp"><tr><th>Setting</th><th>Phase</th><th>Exception when it expires</th></tr>
<tr><td><code>conn_timeout</code></td><td>opening the TCP connection</td><td><code>NetmikoTimeoutException</code></td></tr>
<tr><td><code>auth_timeout</code>, <code>banner_timeout</code></td><td>login and banner</td><td><code>NetmikoAuthenticationException</code> or <code>NetmikoTimeoutException</code></td></tr>
<tr><td><code>read_timeout</code></td><td>waiting for a command's output to end</td><td><code>ReadTimeout</code></td></tr></table>
<p><code>ReadTimeout</code> is not a <code>NetmikoTimeoutException</code>, so <code>except NetmikoTimeoutException</code> does not catch it; name both when you want both. Read the message first: it says <i>which pattern</i> was not found. Raising <code>read_timeout</code> helps only when the output is merely slow (a huge <code>show tech</code>); it never helps when the pattern is wrong.</p>

<div class="warn"><p><b>Common mistakes.</b> Using Cisco's <code>#</code> as <code>expect_string</code> on Junos. Raising <code>read_timeout</code> to 300 when the pattern is wrong, so the script now hangs for five minutes before failing. Saving command output without checking it for an error marker. Using <code>send_command</code> for commands that prompt. Using <code>send_command_timing</code> for everything: it can cut long output short if the device pauses.</p></div>
<div class="exam"><p><b>Exam trap.</b> The device's own mistake messages are <i>returned</i>; connection and read failures are <i>raised</i>. Config errors (chapter 6) are returned unless you pass <code>error_pattern</code>.</p></div>

<div class="scn"><h4>The backup that saved 40 error messages</h4><p>A weekend job asked Junos routers for <code>show running-config</code> (an IOS command). Each box answered with a syntax error, the script wrote it into the backup file and reported success. On Monday the restore folder held forty files with the same two lines.</p><p><b>Lesson:</b> a per-platform command map (<code>show configuration</code> on Junos) plus a sanity check on the output; a returned error is still an error.</p></div>

<div class="iv"><p class="q">"When do you use send_command_timing instead of send_command?"</p><p>When the command does not finish with the normal prompt: confirmations, passwords, "Destination filename?" questions, or a prompt I cannot predict. Otherwise <code>send_command</code> is more reliable because it waits for a definite marker. With a known question I can also keep <code>send_command</code> and pass <code>expect_string</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>send_command</code> reads until the stored prompt or your <code>expect_string</code>; <code>send_command_timing</code> reads until the device is quiet.</li>
<li>The device's error text is returned, not raised: validate the output.</li>
<li><code>ReadTimeout</code> names the pattern that was not found; fix the pattern before raising the timeout.</li>
<li><code>conn_timeout</code>, <code>auth_timeout</code> and <code>read_timeout</code> belong to different phases and raise different exceptions.</li>
<li>Prompts end in <code>#</code> on Cisco-like boxes and <code>&gt;</code> or <code>#</code> on Junos depending on mode.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> command bhejna aasaan hai; kab <i>jawab khatam hua</i> yeh jaanna mushkil hai. netmiko ke paas do jawab hain: prompt wapas aane ka intezaar, ya jab tak device shant na ho jaye. In dono mein se chunna, aur kis cheez ka intezaar karna hai yeh chunna, non-Cisco boxes par zyadatar hang aur ReadTimeout errors door kar deta hai.</p>

<h3>Analogy: restaurant mein order</h3>
<p><b>send_command</b> waiter ke wapas aakar "aur kuch?" (prompt) bolne tak intezaar hai. <b>send_command_timing</b> kitchen ke thodi der shant hone tak intezaar hai. <b>expect_string</b> waiter ko batana hai ki kaun se shabd "ho gaya" ka matlab hain. Pehla sabse bharosemand hai; doosra tab chahiye jab device prompt ki jagah sawaal puchhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="send_command reads until the prompt">
<rect x="10" y="30" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="70" y="52" text-anchor="middle" class="svg-ink" font-size="12">command bhejo</text><text x="70" y="68" text-anchor="middle" class="svg-muted" font-size="10">show ip int brief</text>
<rect x="160" y="30" width="170" height="50" rx="8" fill="#bae6fd"/><text x="245" y="52" text-anchor="middle" class="svg-ink" font-size="12">output chunks padho</text><text x="245" y="68" text-anchor="middle" class="svg-muted" font-size="10">pattern match hone tak</text>
<rect x="360" y="30" width="120" height="50" rx="8" fill="#fde68a"/><text x="420" y="52" text-anchor="middle" class="svg-ink" font-size="12">prompt dikha</text><text x="420" y="68" text-anchor="middle" class="svg-muted" font-size="10">PUN-CORE-R1#</text>
<rect x="510" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="52" text-anchor="middle" class="svg-ink" font-size="12">text return</text><text x="570" y="68" text-anchor="middle" class="svg-muted" font-size="10">echo nahi, prompt nahi</text>
<line x1="130" y1="55" x2="160" y2="55" stroke="#64748b" stroke-width="2"/><line x1="330" y1="55" x2="360" y2="55" stroke="#64748b" stroke-width="2"/><line x1="480" y1="55" x2="510" y2="55" stroke="#64748b" stroke-width="2"/>
<path d="M245 82 L245 120 L420 120 L420 82" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 3"/><text x="332" y="138" text-anchor="middle" class="svg-accent" font-size="11">pattern kabhi nahi dikha: read_timeout seconds baad ReadTimeout</text>
</svg><p class="cap">send_command tab khatam hota hai jab stored prompt (ya aapka expect_string) dikhe. Kabhi na dikhe to ReadTimeout milta hai.</p></div>

<h3>send_command, step by step</h3>
<pre class="code">conn = ConnectHandler(device_type="cisco_ios", host="10.99.0.1", username="netops",
                      password="NK@2026", secret="NK@2026")
out = conn.send_command("show ip interface brief")                       <span class="c"># echo aur prompt hata hua</span>
raw = conn.send_command("show ip interface brief", strip_prompt=False, strip_command=False)
print(repr(out[:60]))
print(repr(raw[:40]), repr(raw[-16:]))</pre>
<pre class="out">'Interface              IP-Address      OK? Method Status    '
'show ip interface brief\\nInterface       ' 'own\\nPUN-CORE-R1#'</pre>
<p>Default mein netmiko echo hui command aur aakhri prompt hata deta hai, isliye text saaf hota hai. Jab saboot chahiye ki kya chala, jaise audit file mein, tab unhe rakho (<code>strip_command=False</code>, <code>strip_prompt=False</code>). Netmiko 4 se intezaar ki seema seconds mein <code>read_timeout</code> hai; purani scripts <code>delay_factor</code> aur <code>max_loops</code> use karti hain, jo ab bhi chalte hain par purana tareeka hain.</p>

<h3>Errors text ki tarah wapas aate hain, exception ki tarah nahi</h3>
<pre class="code">print(repr(conn.send_command("show ip interfce brief")))     <span class="c"># IOS router par typo</span></pre>
<pre class="out"><span class="hl">"                    ^\\n% Invalid input detected at '^' marker."</span></pre>
<p>Junos par isi tarah ki galti caret line ke baad <code>syntax error, expecting &lt;command&gt;.</code> lautati hai. Koi exception nahi uthta, isliye jo collector is text ko "backup" bana ke save kare woh chupchaap error message save kar chuka hai. Platform ke error marker (<code>% Invalid input</code>, <code>syntax error</code>, <code>unknown command</code>) check karo, ya behtar, test karo ki output ki shakal waisi hai jaisi expect thi.</p>

<h3>Jab device sawaal puchhe</h3>
<p>Kuch commands prompt par nahi, sawaal par khatam hoti hain. <code>send_command</code> ke saath netmiko prompt ka intezaar karta rehta hai, jo aata hi nahi:</p>
<pre class="out">AUTO01$ python3 ch4.py
ReadTimeout
<span class="hl">Pattern not detected: 'PUN\\\\-CORE\\\\-R1\\\\#' in output.</span></pre>
<p>Woh IOS par <code>copy running-config startup-config</code> thi, jo <code>Destination filename [startup-config]?</code> puchhti hai. Do sahi tareeke:</p>
<pre class="code"><span class="c"># 1. timing: shant hone tak padho, jawab do, phir padho</span>
out = conn.send_command_timing("copy running-config startup-config")   <span class="c"># 'Destination filename [startup-config]? '</span>
out = conn.send_command_timing("\\n")                                    <span class="c"># 'Building configuration...\\n[OK]'</span>

<span class="c"># 2. expect_string: sawaal ka naam do, phir prompt</span>
out = conn.send_command("copy running-config startup-config", expect_string=r"Destination filename")
out = conn.send_command("\\n", expect_string=r"#")</pre>
<table class="cmp"><tr><th>Call</th><th>Kab khatam</th><th>Kisliye</th></tr>
<tr><td><code>send_command</code></td><td>prompt (ya <code>expect_string</code>) match ho</td><td>normal show commands; default</td></tr>
<tr><td><code>send_command_timing</code></td><td>thodi der naya output na aaye</td><td>sawaal, confirmations, anjaan prompts</td></tr>
<tr><td><code>send_command(..., expect_string=...)</code></td><td>aapka regular expression match ho</td><td>ek exact, jaana-pehchana end marker</td></tr></table>

<h3>ReadTimeout aur baaki timeouts</h3>
<pre class="out">ReadTimeout:
<span class="hl">Pattern not detected: 'NEVER' in output.</span>

Things you might try to fix this:
1. Explicitly set your pattern using the expect_string argument.
2. Increase the read_timeout to a larger value.

You can also look at the Netmiko session_log or debug log for more information.</pre>
<table class="cmp"><tr><th>Setting</th><th>Phase</th><th>Expire hone par exception</th></tr>
<tr><td><code>conn_timeout</code></td><td>TCP connection kholna</td><td><code>NetmikoTimeoutException</code></td></tr>
<tr><td><code>auth_timeout</code>, <code>banner_timeout</code></td><td>login aur banner</td><td><code>NetmikoAuthenticationException</code> ya <code>NetmikoTimeoutException</code></td></tr>
<tr><td><code>read_timeout</code></td><td>command ka output khatam hone ka intezaar</td><td><code>ReadTimeout</code></td></tr></table>
<p><code>ReadTimeout</code> <code>NetmikoTimeoutException</code> nahi hai, isliye <code>except NetmikoTimeoutException</code> use nahi pakadta; dono chahiye to dono ka naam likho. Pehle message padho: woh batata hai <i>kaun sa pattern</i> nahi mila. <code>read_timeout</code> badhana sirf tab madad karta hai jab output sirf dheema ho (bahut bada <code>show tech</code>); pattern galat ho to kabhi madad nahi karta.</p>

<div class="warn"><p><b>Common mistakes.</b> Junos par Cisco ka <code>#</code> <code>expect_string</code> banana. Pattern galat ho tab <code>read_timeout</code> 300 kar dena, to script ab fail hone se pehle paanch minute latak jaati hai. Command output ko error marker check kiye bina save karna. Jo commands prompt karti hain unke liye <code>send_command</code> use karna. Har cheez ke liye <code>send_command_timing</code> use karna: device ruk jaye to woh lamba output kaat sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Device ke apne mistake messages <i>return</i> hote hain; connection aur read failures <i>raise</i> hote hain. Config errors (chapter 6) tab tak return hote hain jab tak <code>error_pattern</code> na do.</p></div>

<div class="scn"><h4>Backup jisne 40 error messages save kiye</h4><p>Weekend job ne Junos routers se <code>show running-config</code> (IOS command) maangi. Har box ne syntax error se jawab diya, script ne use backup file mein likh diya aur success report kiya. Somvaar ko restore folder mein wahi do lines wali chaalis files thi.</p><p><b>Lesson:</b> per-platform command map (Junos par <code>show configuration</code>) aur output par sanity check; returned error bhi error hai.</p></div>

<div class="iv"><p class="q">"send_command ki jagah send_command_timing kab use karte ho?"</p><p>Jab command normal prompt par khatam nahi hoti: confirmations, passwords, "Destination filename?" jaise sawaal, ya aisa prompt jo main predict nahi kar sakta. Warna <code>send_command</code> zyada bharosemand hai kyunki woh ek pakke marker ka intezaar karta hai. Jaane-pehchane sawaal ke saath main <code>send_command</code> rakh ke <code>expect_string</code> bhi de sakta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>send_command</code> stored prompt ya aapke <code>expect_string</code> tak padhta hai; <code>send_command_timing</code> device ke shant hone tak.</li>
<li>Device ka error text return hota hai, raise nahi: output validate karo.</li>
<li><code>ReadTimeout</code> us pattern ka naam batata hai jo nahi mila; timeout badhane se pehle pattern theek karo.</li>
<li><code>conn_timeout</code>, <code>auth_timeout</code> aur <code>read_timeout</code> alag phases ke hain aur alag exceptions uthate hain.</li>
<li>Prompt Cisco-jaise boxes par <code>#</code> par aur Junos par mode ke hisaab se <code>&gt;</code> ya <code>#</code> par khatam hota hai.</li>
</ul></div>
`}};export{e as default};