var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`

<p>You started this module never having written a line of code. You can now log in to routers with a script, read and save their output, push different configuration to each one, and prove the result. This chapter is the checklist, the vocabulary and the habits that keep scripts safe.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The whole module on one line."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="30" width="110" height="60" rx="10" fill="#fde68a"/><text x="65" y="57" text-anchor="middle" class="svg-ink" font-size="14">Prepare</text><text x="65" y="75" text-anchor="middle" class="svg-muted" font-size="12">SSH on router</text><line x1="120" y1="60" x2="150" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="150" y="30" width="110" height="60" rx="10" fill="#bae6fd"/><text x="205" y="57" text-anchor="middle" class="svg-ink" font-size="14">Connect</text><text x="205" y="75" text-anchor="middle" class="svg-muted" font-size="12">ConnectHandler</text><line x1="260" y1="60" x2="290" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="290" y="30" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="345" y="57" text-anchor="middle" class="svg-ink" font-size="14">Collect / Change</text><text x="345" y="75" text-anchor="middle" class="svg-muted" font-size="12">send_command / config</text><line x1="400" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="430" y="30" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="480" y="57" text-anchor="middle" class="svg-ink" font-size="14">Verify</text><text x="480" y="75" text-anchor="middle" class="svg-muted" font-size="12">parse + test</text><line x1="530" y1="60" x2="555" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="555" y="30" width="75" height="60" rx="10" fill="#fed7aa"/><text x="592.5" y="57" text-anchor="middle" class="svg-ink" font-size="14">Report</text><text x="592.5" y="75" text-anchor="middle" class="svg-muted" font-size="12">print / file</text><text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">wrap every connect in try / except and always disconnect</text></svg><p class="cap">The whole module on one line.</p></div>

<h3>Can-do checklist</h3>
<p>Tick each line only if you could do it without looking:</p>
<ul>
<li>Type the eight lines that make a router accept SSH, and check them with <code>show ip ssh</code>.</li>
<li>Explain the difference between a timeout and an authentication error.</li>
<li>Write a script that logs in, runs <code>show ip interface brief</code>, prints it and disconnects.</li>
<li>Loop over a list of routers, and add a fourth router by changing one line.</li>
<li>Open a file with the right mode and save a configuration with <code>with open(...)</code>.</li>
<li>Push configuration with <code>send_config_set</code>, and save with <code>save_config</code> only after verifying.</li>
<li>Use a dictionary to give each router its own lines.</li>
<li>Parse show output and test it, using <code>startswith</code> for states such as FULL/DR.</li>
<li>Read a traceback from the bottom and choose the right first check.</li>
<li>Handle a dead router with <code>try</code>/<code>except</code> and <code>continue</code>.</li>
</ul>

<h3>Cheat sheet: the library</h3>
<table class="cmp"><tr><th>Call</th><th>What it does</th></tr>
<tr><td><code>ConnectHandler(device_type=, host=, username=, password=)</code></td><td>opens an SSH session</td></tr>
<tr><td><code>conn.find_prompt()</code></td><td>returns the prompt, e.g. R1#</td></tr>
<tr><td><code>conn.send_command("show ...")</code></td><td>runs a show command, returns text</td></tr>
<tr><td><code>conn.send_config_set([lines])</code></td><td>configure terminal, lines, end; returns transcript</td></tr>
<tr><td><code>conn.save_config()</code></td><td>write memory</td></tr>
<tr><td><code>conn.disconnect()</code></td><td>closes the session</td></tr>
<tr><td><code>parse("show ip ospf neighbor", text)</code></td><td>text to dictionary (lab library nkparse)</td></tr></table>

<h3>Cheat sheet: the Python you used</h3>
<table class="cmp"><tr><th>Idea</th><th>Example</th></tr>
<tr><td>Variable</td><td><code>name = "R1"</code></td></tr>
<tr><td>List and index</td><td><code>ROUTERS[0]</code>, <code>len(ROUTERS)</code></td></tr>
<tr><td>Loop</td><td><code>for ip in ROUTERS:</code> (indent the body)</td></tr>
<tr><td>Dictionary</td><td><code>PLAN["10.99.0.1"]</code>, <code>for k, v in PLAN.items():</code></td></tr>
<tr><td>Decision</td><td><code>if text.startswith("FULL"):</code></td></tr>
<tr><td>File</td><td><code>with open("R1.cfg", "w") as f: f.write(text)</code></td></tr>
<tr><td>Errors</td><td><code>try: ... except SomeError: ...</code></td></tr>
<tr><td>Join text</td><td><code>name + ".cfg"</code></td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Script</dt><dd>A text file of Python instructions, run top to bottom.</dd>
<dt>Library</dt><dd>Code written by someone else that you <code>import</code>.</dd>
<dt>Traceback</dt><dd>Python's error report; read it from the last line.</dd>
<dt>Idempotent</dt><dd>Safe to run twice: the second run changes nothing.</dd>
<dt>vty line</dt><dd>A virtual terminal line used for remote logins such as SSH.</dd>
<dt>Parser</dt><dd>Code that turns CLI text into structured data.</dd>
</dl>

<h3>Habits that keep scripts safe</h3>
<ul>
<li><b>Never store real passwords in a script or a repository.</b> The lab uses NK@2026 so that you can learn. In real life, ask for the password when the script starts, or take it from a secrets manager or an environment variable. This is how it looks with the real netmiko library (it cannot run in this lab, so it is reference code):</li>
</ul>
<pre class="code"># Reference code (not run in the simulator)
# The same login with the real netmiko library on a real Cisco IOS router.
import getpass
from netmiko import ConnectHandler

device = {
    "device_type": "cisco_ios",          # the real platform name
    "host": "192.0.2.11",                # documentation address
    "username": "netops",
    "password": getpass.getpass("Router password: "),   # typed at run time, never saved in the file
}
with ConnectHandler(**device) as conn:   # 'with' disconnects for you
    print(conn.send_command("show version | include uptime"))</pre>
<pre class="code"># Reference code (not run in the simulator)
# Alternative: read the password from an environment variable set by the scheduler.
import os
password = os.environ["NK_ROUTER_PASSWORD"]    # KeyError if it is missing: a good, loud failure</pre>
<ul>
<li><b>Use a dedicated automation account</b> with the least privilege that the job needs and log what the script did. Prefer AAA (TACACS+ or RADIUS) over local users in production.</li>
<li><b>Try on a lab or one pilot device first</b>, then a small group, then everyone.</li>
<li><b>Keep SSH strict</b>: version 2 only, strong keys, and, in real scripts, check the device's host key rather than accepting any key.</li>
<li><b>Treat backups as secrets</b>: configs hold hashes and keys.</li>
<li><b>Always verify</b> and <b>always report failures</b>.</li>
</ul>

<h3>Most tested facts</h3>
<ul>
<li>SSH needs a hostname, domain name and RSA key; <code>transport input ssh</code> and <code>login local</code> on the vty lines.</li>
<li>Timeout = connection never opened; authentication error = login refused.</li>
<li><code>send_command</code> is for show commands and returns a string; <code>send_config_set</code> takes a list and returns the transcript.</li>
<li>Router rejections are returned as text, not as exceptions.</li>
<li>File modes: r, w, a. Lists start at 0. Indentation is syntax.</li>
<li>Verification must be compared with real output: FULL/DR is not equal to FULL.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Your team asks: "Add a new NTP server to 50 routers and prove it." Collect: <code>show ntp associations</code>. Change: <code>send_config_set(["ntp server 192.0.2.123"])</code>. Verify: parse or search the output for the server address after a wait. Report: print the routers that do not list it. You already know every step.</p></div>

<div class="warn"><p><b>Common beginner mistakes to remember.</b> Wrong mode on open; forgetting disconnect; testing with <code>==</code> against a partial word; saving the configuration before verifying; trusting "done".</p></div>
<div class="exam"><p><b>Exam trap.</b> SSH-based automation scripts the CLI as text; it is not the same as an API. Questions about "idempotent", "structured data" and "verify" test the habit more than the syntax.</p></div>

<div class="scn"><h4>From manual to scripted in one afternoon</h4><p>A junior engineer was asked for the software version of 25 switches. By hand it was an afternoon. He copied first.py, changed the command, put 25 addresses in a list, added try/except and wrote the results to a file. The first run reported two unreachable switches that nobody knew were offline. The report took four minutes, and the two dead switches became his first real finding.</p><p><b>Lesson:</b> scripts do not only save time; they notice what people miss.</p></div>

<div class="iv"><p class="q">"Walk me through an SSH-based automation script you would write for a configuration change."</p><p>I prepare an inventory, test SSH on one device, then script: for each device connect with <code>try</code>/<code>except</code>, collect the before-state, send the configuration, collect the after-state, verify against expected values, save only if verified, disconnect and log the result. I run it on a pilot first, handle failures without stopping the rest, and keep credentials out of the code.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prepare SSH, connect, collect, change, verify, report: that is the whole module.</li>
<li>Know the library calls and the small Python set: variables, lists, loops, dictionaries, if, files, try.</li>
<li>Read tracebacks from the bottom and troubleshoot one layer at a time.</li>
<li>Never hard-code real passwords; verify before you save; report every failure.</li>
<li>Next: REST APIs, where devices return structured data instead of text.</li>
</ul></div>

`,hi:`

<p>Aapne yeh module aise shuru kiya tha ki code ki ek line bhi nahi likhi thi. Ab aap script se routers mein login kar sakte ho, unka output padh aur save kar sakte ho, har ek ko alag configuration push kar sakte ho, aur result saabit kar sakte ho. Yeh chapter checklist, vocabulary aur woh aadatein hai jo scripts ko safe rakhti hain.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Poora module ek line mein."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="30" width="110" height="60" rx="10" fill="#fde68a"/><text x="65" y="57" text-anchor="middle" class="svg-ink" font-size="14">Taiyaar karo</text><text x="65" y="75" text-anchor="middle" class="svg-muted" font-size="12">SSH on router</text><line x1="120" y1="60" x2="150" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="150" y="30" width="110" height="60" rx="10" fill="#bae6fd"/><text x="205" y="57" text-anchor="middle" class="svg-ink" font-size="14">Connect</text><text x="205" y="75" text-anchor="middle" class="svg-muted" font-size="12">ConnectHandler</text><line x1="260" y1="60" x2="290" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="290" y="30" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="345" y="57" text-anchor="middle" class="svg-ink" font-size="14">Collect / Change</text><text x="345" y="75" text-anchor="middle" class="svg-muted" font-size="12">send_command / config</text><line x1="400" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="430" y="30" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="480" y="57" text-anchor="middle" class="svg-ink" font-size="14">Verify</text><text x="480" y="75" text-anchor="middle" class="svg-muted" font-size="12">parse + test</text><line x1="530" y1="60" x2="555" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="555" y="30" width="75" height="60" rx="10" fill="#fed7aa"/><text x="592.5" y="57" text-anchor="middle" class="svg-ink" font-size="14">Report</text><text x="592.5" y="75" text-anchor="middle" class="svg-muted" font-size="12">print / file</text><text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">har connect ko try / except mein lapeto aur hamesha disconnect karo</text></svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Can-do checklist</h3>
<p>Har line tabhi tick karo jab aap use bina dekhe kar sako:</p>
<ul>
<li>Router ko SSH accept karane wali aath lines type karo, aur <code>show ip ssh</code> se check karo.</li>
<li>Timeout aur authentication error ka farak samjhao.</li>
<li>Aisi script likho jo login kare, <code>show ip interface brief</code> chalaye, print kare aur disconnect kare.</li>
<li>Routers ki list par loop chalao, aur ek line badal kar chautha router jodo.</li>
<li>Sahi mode se file kholo aur <code>with open(...)</code> se configuration save karo.</li>
<li><code>send_config_set</code> se configuration push karo, aur <code>save_config</code> se save sirf verify karne ke baad karo.</li>
<li>Dictionary se har router ko uski apni lines do.</li>
<li>Show output parse karo aur test karo, FULL/DR jaise states ke liye <code>startswith</code> use karke.</li>
<li>Traceback neeche se padho aur sahi pehla check chuno.</li>
<li><code>try</code>/<code>except</code> aur <code>continue</code> se dead router handle karo.</li>
</ul>

<h3>Cheat sheet: library</h3>
<table class="cmp"><tr><th>Call</th><th>Kya karta hai</th></tr>
<tr><td><code>ConnectHandler(device_type=, host=, username=, password=)</code></td><td>SSH session kholta hai</td></tr>
<tr><td><code>conn.find_prompt()</code></td><td>prompt return karta hai, jaise R1#</td></tr>
<tr><td><code>conn.send_command("show ...")</code></td><td>show command chalata hai, text return karta hai</td></tr>
<tr><td><code>conn.send_config_set([lines])</code></td><td>configure terminal, lines, end; transcript return karta hai</td></tr>
<tr><td><code>conn.save_config()</code></td><td>write memory</td></tr>
<tr><td><code>conn.disconnect()</code></td><td>session band karta hai</td></tr>
<tr><td><code>parse("show ip ospf neighbor", text)</code></td><td>text se dictionary (lab library nkparse)</td></tr></table>

<h3>Cheat sheet: jo Python aapne use kiya</h3>
<table class="cmp"><tr><th>Idea</th><th>Example</th></tr>
<tr><td>Variable</td><td><code>name = "R1"</code></td></tr>
<tr><td>List aur index</td><td><code>ROUTERS[0]</code>, <code>len(ROUTERS)</code></td></tr>
<tr><td>Loop</td><td><code>for ip in ROUTERS:</code> (body indent karo)</td></tr>
<tr><td>Dictionary</td><td><code>PLAN["10.99.0.1"]</code>, <code>for k, v in PLAN.items():</code></td></tr>
<tr><td>Faisla</td><td><code>if text.startswith("FULL"):</code></td></tr>
<tr><td>File</td><td><code>with open("R1.cfg", "w") as f: f.write(text)</code></td></tr>
<tr><td>Errors</td><td><code>try: ... except SomeError: ...</code></td></tr>
<tr><td>Text jodna</td><td><code>name + ".cfg"</code></td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Script</dt><dd>Python instructions ki text file, upar se neeche chalti hai.</dd>
<dt>Library</dt><dd>Kisi aur ka likha code jo aap <code>import</code> karte ho.</dd>
<dt>Traceback</dt><dd>Python ki error report; aakhri line se padho.</dd>
<dt>Idempotent</dt><dd>Do baar chalana safe: doosri run kuch nahi badalti.</dd>
<dt>vty line</dt><dd>Remote logins jaise SSH ke liye virtual terminal line.</dd>
<dt>Parser</dt><dd>Code jo CLI text ko structured data mein badalta hai.</dd>
</dl>

<h3>Woh aadatein jo scripts ko safe rakhti hain</h3>
<ul>
<li><b>Asli passwords kabhi script ya repository mein store mat karo.</b> Lab NK@2026 use karta hai taaki aap seekh sako. Asli zindagi mein password script shuru hote waqt maango, ya secrets manager ya environment variable se lo. Asli netmiko library ke saath yeh aisa dikhta hai (yeh is lab mein chal nahi sakta, isliye reference code hai):</li>
</ul>
<pre class="code"># Reference code (not run in the simulator)
# The same login with the real netmiko library on a real Cisco IOS router.
import getpass
from netmiko import ConnectHandler

device = {
    "device_type": "cisco_ios",          # the real platform name
    "host": "192.0.2.11",                # documentation address
    "username": "netops",
    "password": getpass.getpass("Router password: "),   # typed at run time, never saved in the file
}
with ConnectHandler(**device) as conn:   # 'with' disconnects for you
    print(conn.send_command("show version | include uptime"))</pre>
<pre class="code"># Reference code (not run in the simulator)
# Alternative: read the password from an environment variable set by the scheduler.
import os
password = os.environ["NK_ROUTER_PASSWORD"]    # KeyError if it is missing: a good, loud failure</pre>
<ul>
<li><b>Dedicated automation account</b> use karo jisme job ke liye zaroori sabse kam privilege ho, aur log karo ki script ne kya kiya. Production mein local users ki jagah AAA (TACACS+ ya RADIUS) pasand karo.</li>
<li><b>Pehle lab ya ek pilot device par try karo</b>, phir chhote group par, phir sab par.</li>
<li><b>SSH strict rakho</b>: sirf version 2, strong keys, aur asli scripts mein device ki host key check karo, koi bhi key accept mat karo.</li>
<li><b>Backups ko secrets samjho</b>: configs mein hashes aur keys hote hain.</li>
<li><b>Hamesha verify karo</b> aur <b>hamesha failures report karo</b>.</li>
</ul>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>SSH ko hostname, domain name aur RSA key chahiye; vty lines par <code>transport input ssh</code> aur <code>login local</code>.</li>
<li>Timeout = connection kabhi khula nahi; authentication error = login mana.</li>
<li><code>send_command</code> show commands ke liye hai aur string return karta hai; <code>send_config_set</code> list leta hai aur transcript return karta hai.</li>
<li>Router rejections text ke roop mein return hote hain, exceptions ke roop mein nahi.</li>
<li>File modes: r, w, a. Lists 0 se shuru hoti hain. Indentation syntax hai.</li>
<li>Verification ko asli output se compare karna: FULL/DR, FULL ke barabar nahi hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Aapki team kehti hai: "50 routers par naya NTP server jodo aur saabit karo." Collect: <code>show ntp associations</code>. Change: <code>send_config_set(["ntp server 192.0.2.123"])</code>. Verify: wait ke baad output parse karo ya server address dhoondo. Report: jo routers use list nahi karte unhe print karo. Har step aap pehle se jaante ho.</p></div>

<div class="warn"><p><b>Yaad rakhne wali common beginner mistakes.</b> open par galat mode; disconnect bhool jaana; adhoore shabd ke saath <code>==</code> se test karna; verify karne se pehle configuration save karna; "done" par bharosa karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSH-based automation script CLI ko text ke roop mein chalati hai; yeh API jaisa nahi hai. "Idempotent", "structured data" aur "verify" ke sawal syntax se zyada aadat ko test karte hain.</p></div>

<div class="scn"><h4>Ek dopahar mein manual se scripted</h4><p>Ek junior engineer se 25 switches ka software version maanga gaya. Haath se yeh poori dopahar ka kaam tha. Usne first.py copy ki, command badli, 25 addresses ek list mein daale, try/except jodi aur results file mein likhe. Pehli run ne do unreachable switches report kiye jinke offline hone ka kisi ko pata nahi tha. Report chaar minute mein bani, aur do dead switches uski pehli asli khoj ban gaye.</p><p><b>Lesson:</b> scripts sirf time nahi bachatin; woh woh dekh leti hain jo log chhod dete hain.</p></div>

<div class="iv"><p class="q">"Configuration change ke liye aap jo SSH-based automation script likhoge uska flow batao."</p><p>Main inventory taiyaar karta hoon, ek device par SSH test karta hoon, phir script: har device ke liye <code>try</code>/<code>except</code> ke saath connect, pehle ki state collect, configuration bhejo, baad ki state collect, expected values se verify, sirf verify hone par save, disconnect aur result log. Main pehle pilot par chalata hoon, failures ko baaki ko roke bina handle karta hoon, aur credentials code se bahar rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSH taiyaar karo, connect, collect, change, verify, report: yahi poora module hai.</li>
<li>Library calls aur chhota Python set jaano: variables, lists, loops, dictionaries, if, files, try.</li>
<li>Tracebacks neeche se padho aur ek layer ek baar mein troubleshoot karo.</li>
<li>Asli passwords kabhi hard-code mat karo; save se pehle verify karo; har failure report karo.</li>
<li>Aage: REST APIs, jahan devices text ki jagah structured data return karte hain.</li>
</ul></div>

`}};export{e as default};